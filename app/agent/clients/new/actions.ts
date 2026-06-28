'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  AgentClientOwnershipStatus,
  AgentClientStatus,
  AgentStatus,
  Prisma,
  SubscriptionStatus,
  TenantStatus,
  UserRole,
} from '@prisma/client';
import { z } from 'zod';
import { getCurrentUserProfile } from '@/lib/auth/session';
import { addDays, addMonths } from '@/lib/billing/pricing';
import { deductAgentCredit } from '@/lib/data-access/agent-credits';
import { prisma } from '@/lib/prisma';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

const RESERVED_SUBDOMAINS = new Set([
  'admin',
  'agent',
  'api',
  'app',
  'billing',
  'cart',
  'checkout',
  'dashboard',
  'daganta',
  'faq',
  'help',
  'login',
  'me',
  'pricing',
  'root',
  'settings',
  'signup',
  'support',
  'superadmin',
  'track',
  'www',
]);

const ClientStoreSchema = z.object({
  storeName: z.string().trim().min(3, 'Nama toko minimal 3 karakter.').max(120, 'Nama toko maksimal 120 karakter.'),
  subdomain: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, 'Subdomain minimal 3 karakter.')
    .max(32, 'Subdomain maksimal 32 karakter.')
    .regex(/^[a-z0-9-]+$/, 'Subdomain hanya boleh huruf kecil, angka, dan tanda hubung.')
    .refine((value) => !value.startsWith('-') && !value.endsWith('-'), 'Subdomain tidak boleh diawali/diakhiri tanda hubung.')
    .refine((value) => !value.includes('--'), 'Subdomain tidak boleh memakai tanda hubung ganda.')
    .refine((value) => !RESERVED_SUBDOMAINS.has(value), 'Subdomain ini dilindungi sistem.'),
  planId: z.string().uuid('Paket tidak valid.'),
  ownerName: z.string().trim().min(2, 'Nama pemilik minimal 2 karakter.').max(120, 'Nama pemilik maksimal 120 karakter.'),
  ownerEmail: z.string().trim().toLowerCase().email('Email pemilik tidak valid.'),
  ownerPhone: z.string().trim().min(10, 'Nomor HP pemilik tidak valid.').max(20, 'Nomor HP pemilik terlalu panjang.'),
});

function redirectWithError(message: string): never {
  redirect(`/agent/clients/new?error=${encodeURIComponent(message)}`);
}

function normalizePhone(value: string) {
  return value.replace(/[^0-9]/g, '');
}

async function sendOwnerMagicLink(email: string, ownerName: string) {
  try {
    const supabase = createSupabaseAdminClient();
    const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`;
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo,
      data: {
        name: ownerName,
        role: 'TENANT_OWNER',
      },
    });

    if (error) {
      console.warn('Supabase owner invite failed:', error.message);
      return;
    }

    if (data.user?.id) {
      await prisma.userProfile.updateMany({
        where: {
          email,
          authUserId: null,
        },
        data: {
          authUserId: data.user.id,
        },
      });
    }
  } catch (error: unknown) {
    console.warn(
      'Supabase owner magic link skipped:',
      error instanceof Error ? error.message : 'Unknown Supabase admin error'
    );
  }
}

export async function createClientStoreAction(formData: FormData) {
  const parsed = ClientStoreSchema.safeParse({
    storeName: formData.get('storeName'),
    subdomain: formData.get('subdomain'),
    planId: formData.get('planId'),
    ownerName: formData.get('ownerName'),
    ownerEmail: formData.get('ownerEmail'),
    ownerPhone: normalizePhone(String(formData.get('ownerPhone') || '')),
  });

  if (!parsed.success) {
    redirectWithError(parsed.error.issues.map((issue) => issue.message).join(' '));
  }

  const values = parsed.data;
  const authData = await getCurrentUserProfile();

  if (!authData?.user) {
    redirect('/login');
  }

  if (!authData.profile) {
    redirectWithError('Fitur ini hanya tersedia untuk akun agen Daganta.');
  }

  const actorProfile = authData.profile;
  const agentProfile = await prisma.agentProfile.findUnique({
    where: {
      userProfileId: actorProfile.id,
    },
    select: {
      id: true,
      status: true,
      maxActiveClients: true,
      creditBalance: true,
    },
  });

  if (!agentProfile) {
    redirectWithError('Fitur ini hanya tersedia untuk akun agen Daganta.');
  }

  if (agentProfile.status !== AgentStatus.ACTIVE) {
    redirectWithError('Akun agen Anda belum aktif atau sedang dibatasi.');
  }

  const plan = await prisma.subscriptionPlan.findFirst({
    where: {
      id: values.planId,
      isActive: true,
    },
  });

  if (!plan) {
    redirectWithError('Paket yang dipilih tidak tersedia.');
  }

  const existingTenant = await prisma.tenant.findFirst({
    where: {
      OR: [
        {
          slug: values.subdomain,
        },
        {
          subdomain: values.subdomain,
        },
      ],
    },
    select: {
      id: true,
    },
  });

  if (existingTenant) {
    redirectWithError('Subdomain sudah digunakan. Pilih subdomain lain.');
  }

  if (agentProfile.creditBalance.lt(plan.price)) {
    redirectWithError('Saldo kredit tidak cukup untuk membuat toko dengan paket ini.');
  }

  const activeClientCount = await prisma.agentClient.count({
    where: {
      agentId: agentProfile.id,
      status: AgentClientStatus.ACTIVE,
    },
  });

  if (activeClientCount >= agentProfile.maxActiveClients) {
    redirectWithError('Kuota klien aktif Anda sudah penuh.');
  }

  let createdTenantId: string | null = null;

  try {
    await prisma.$transaction(
      async (tx) => {
        const lockedAgent = await tx.agentProfile.findUnique({
          where: {
            id: agentProfile.id,
          },
          select: {
            id: true,
            status: true,
            maxActiveClients: true,
            creditBalance: true,
          },
        });

        if (!lockedAgent || lockedAgent.status !== AgentStatus.ACTIVE) {
          throw new Error('Akun agen Anda belum aktif atau sedang dibatasi.');
        }

        const lockedActiveClientCount = await tx.agentClient.count({
          where: {
            agentId: lockedAgent.id,
            status: AgentClientStatus.ACTIVE,
          },
        });

        if (lockedActiveClientCount >= lockedAgent.maxActiveClients) {
          throw new Error('Kuota klien aktif Anda sudah penuh.');
        }

        if (lockedAgent.creditBalance.lt(plan.price)) {
          throw new Error('Saldo kredit tidak cukup untuk membuat toko dengan paket ini.');
        }

        const tenantExists = await tx.tenant.findFirst({
          where: {
            OR: [
              {
                slug: values.subdomain,
              },
              {
                subdomain: values.subdomain,
              },
            ],
          },
          select: {
            id: true,
          },
        });

        if (tenantExists) {
          throw new Error('Subdomain sudah digunakan. Pilih subdomain lain.');
        }

        const ownerProfile = await tx.userProfile.upsert({
          where: {
            email: values.ownerEmail,
          },
          update: {
            name: values.ownerName,
          },
          create: {
            email: values.ownerEmail,
            name: values.ownerName,
            authUserId: null,
          },
        });

        const periodStart = new Date();
        const periodEnd = addMonths(periodStart, plan.activeMonths);
        const gracePeriodEndsAt = addDays(periodEnd, plan.gracePeriodDays);

        const tenant = await tx.tenant.create({
          data: {
            name: values.storeName,
            slug: values.subdomain,
            subdomain: values.subdomain,
            status: TenantStatus.ACTIVE,
            whatsappNumber: values.ownerPhone,
            ownerId: ownerProfile.id,
            subscriptionEndsAt: periodEnd,
            gracePeriodEndsAt,
          },
        });
        createdTenantId = tenant.id;

        await tx.tenantMember.create({
          data: {
            tenantId: tenant.id,
            userId: ownerProfile.id,
            role: UserRole.TENANT_OWNER,
          },
        });

        const subscription = await tx.tenantSubscription.create({
          data: {
            tenantId: tenant.id,
            planId: plan.id,
            status: SubscriptionStatus.ACTIVE,
            billingCycle: plan.billingCycle,
            currentPeriodStart: periodStart,
            currentPeriodEnd: periodEnd,
            gracePeriodEndsAt,
          },
        });

        const agentClient = await tx.agentClient.create({
          data: {
            agentId: lockedAgent.id,
            tenantId: tenant.id,
            status: AgentClientStatus.ACTIVE,
            ownershipStatus: AgentClientOwnershipStatus.AGENT_MANAGED,
            notes: `Owner: ${values.ownerName} (${values.ownerEmail}, ${values.ownerPhone})`,
          },
        });

        await deductAgentCredit(tx, {
          agentId: lockedAgent.id,
          amount: plan.price,
          description: `Buat toko: ${values.storeName}`,
          referenceTenantId: tenant.id,
          referenceClientId: agentClient.id,
          createdByUserId: actorProfile.id,
          metadata: {
            planId: plan.id,
            planCode: plan.code,
            planName: plan.name,
            ownerEmail: values.ownerEmail,
            ownerPhone: values.ownerPhone,
            subdomain: values.subdomain,
            subscriptionId: subscription.id,
          },
        });

        await tx.auditLog.create({
          data: {
            tenantId: tenant.id,
            actorId: actorProfile.id,
            action: 'AGENT_CLIENT_STORE_CREATED_WITH_CREDIT',
            entityType: 'AgentClient',
            entityId: agentClient.id,
            metadata: {
              agentId: lockedAgent.id,
              tenantId: tenant.id,
              planId: plan.id,
              planCode: plan.code,
              creditDeducted: plan.price.toString(),
              subscriptionEndsAt: periodEnd.toISOString(),
            },
          },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );
  } catch (error: unknown) {
    redirectWithError(error instanceof Error ? error.message : 'Toko klien belum berhasil dibuat.');
  }

  await sendOwnerMagicLink(values.ownerEmail, values.ownerName);

  revalidatePath('/agent');
  revalidatePath('/agent/clients');
  redirect(`/agent/clients?created=${createdTenantId ?? '1'}`);
}

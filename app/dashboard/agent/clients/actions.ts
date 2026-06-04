'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  AgentClientOwnershipStatus,
  AgentClientStatus,
  AgentStatus,
  BillingCycle,
  SubscriptionStatus,
  TenantStatus,
} from '@prisma/client';
import { getCurrentUserProfile } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

const RESERVED_SLUGS = new Set([
  'admin',
  'app',
  'api',
  'www',
  'dashboard',
  'login',
  'signup',
  'billing',
  'checkout',
  'cart',
  'track',
  'pricing',
  'faq',
  'help',
  'support',
  'root',
  'me',
  'account',
  'settings',
  'superadmin',
  'daganta',
  'agent',
]);

function redirectWithError(message: string): never {
  redirect(`/dashboard/agent/clients/new?error=${encodeURIComponent(message)}`);
}

function normalizeWhatsapp(value: string) {
  return value.replace(/[^0-9]/g, '');
}

function validateTenantSlug(slug: string) {
  if (slug.length < 3) {
    return 'Alamat toko minimal terdiri dari 3 karakter.';
  }
  if (slug.length > 32) {
    return 'Alamat toko maksimal terdiri dari 32 karakter.';
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return 'Alamat toko hanya boleh terdiri dari huruf kecil, angka, dan tanda hubung (-).';
  }
  if (slug.startsWith('-') || slug.endsWith('-')) {
    return 'Alamat toko tidak boleh diawali atau diakhiri dengan tanda hubung (-).';
  }
  if (slug.includes('--')) {
    return 'Alamat toko tidak boleh menggunakan tanda hubung ganda (--).';
  }
  if (RESERVED_SLUGS.has(slug)) {
    return 'Alamat toko ini dilindungi sistem. Silakan pilih alamat lain.';
  }

  return null;
}

export async function createAgentClientStoreAction(formData: FormData) {
  const storeName = String(formData.get('storeName') || '').trim();
  const tenantSlug = String(formData.get('tenantSlug') || '').trim().toLowerCase();
  const ownerName = String(formData.get('ownerName') || '').trim();
  const ownerEmail = String(formData.get('ownerEmail') || '').trim().toLowerCase();
  const ownerWhatsapp = normalizeWhatsapp(String(formData.get('ownerWhatsapp') || '').trim());
  const notes = String(formData.get('notes') || '').trim();

  const authData = await getCurrentUserProfile();
  if (!authData?.user) {
    redirect('/login');
  }

  if (!authData.profile) {
    redirectWithError('Fitur ini hanya tersedia untuk akun agen Daganta.');
  }

  const actorProfile = authData.profile;

  const agentProfile = await prisma.agentProfile.findUnique({
    where: { userProfileId: actorProfile.id },
  });

  if (!agentProfile) {
    redirectWithError('Fitur ini hanya tersedia untuk akun agen Daganta.');
  }

  if (agentProfile.status === AgentStatus.PENDING) {
    redirectWithError('Profil agen Anda masih menunggu aktivasi.');
  }

  if (agentProfile.status === AgentStatus.SUSPENDED || agentProfile.status === AgentStatus.ARCHIVED) {
    redirectWithError('Akun agen Anda sementara tidak dapat membuat toko klien.');
  }

  if (agentProfile.status !== AgentStatus.ACTIVE) {
    redirectWithError('Akun agen Anda sementara tidak dapat membuat toko klien.');
  }

  if (!storeName || !tenantSlug || !ownerName || !ownerEmail || !ownerWhatsapp) {
    redirectWithError('Semua kolom wajib diisi kecuali catatan internal.');
  }

  if (storeName.length < 3) {
    redirectWithError('Nama toko klien minimal terdiri dari 3 karakter.');
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail)) {
    redirectWithError('Format alamat email pemilik klien tidak valid.');
  }

  if (ownerWhatsapp.length < 10 || ownerWhatsapp.length > 15) {
    redirectWithError('Nomor WhatsApp pemilik klien tidak valid. Masukkan minimal 10 digit angka.');
  }

  const slugError = validateTenantSlug(tenantSlug);
  if (slugError) {
    redirectWithError(slugError);
  }

  const existingTenant = await prisma.tenant.findFirst({
    where: {
      OR: [{ slug: tenantSlug }, { subdomain: tenantSlug }],
    },
  });

  if (existingTenant) {
    redirectWithError('Nama alamat toko sudah digunakan. Silakan pilih nama lain.');
  }

  const draftCount = await prisma.agentClient.count({
    where: {
      agentId: agentProfile.id,
      status: AgentClientStatus.DRAFT,
    },
  });

  if (draftCount >= agentProfile.maxDraftClients) {
    redirectWithError('Kuota draft toko klien Anda sudah penuh. Selesaikan atau arsipkan draft sebelumnya untuk membuat toko baru.');
  }

  const starterPlan = await prisma.subscriptionPlan.findFirst({
    where: {
      code: 'STARTER_MONTHLY',
      isActive: true,
    },
  });

  if (!starterPlan) {
    redirectWithError('Paket default belum tersedia. Silakan hubungi admin Daganta.');
  }

  try {
    const now = new Date();

    await prisma.$transaction(async (tx) => {
      let ownerProfile = await tx.userProfile.findUnique({
        where: { email: ownerEmail },
      });

      if (!ownerProfile) {
        // TODO: Client owner claim/activation flow must be handled in a future ownership transfer or invitation step.
        ownerProfile = await tx.userProfile.create({
          data: {
            email: ownerEmail,
            name: ownerName,
            authUserId: null,
          },
        });
      }

      const tenant = await tx.tenant.create({
        data: {
          name: storeName,
          slug: tenantSlug,
          subdomain: tenantSlug,
          ownerId: ownerProfile.id,
          status: TenantStatus.LIMITED,
          subscriptionEndsAt: now,
          limitedAt: now,
        },
      });

      const tenantSubscription = await tx.tenantSubscription.create({
        data: {
          tenantId: tenant.id,
          planId: starterPlan.id,
          status: SubscriptionStatus.LIMITED_MODE,
          billingCycle: BillingCycle.MONTHLY,
          trialStartsAt: null,
          trialEndsAt: null,
          currentPeriodStart: now,
          currentPeriodEnd: now,
          gracePeriodEndsAt: null,
        },
      });

      const agentClient = await tx.agentClient.create({
        data: {
          agentId: agentProfile.id,
          tenantId: tenant.id,
          status: AgentClientStatus.DRAFT,
          ownershipStatus: AgentClientOwnershipStatus.AGENT_MANAGED,
          notes: notes || null,
        },
      });

      await tx.auditLog.create({
        data: {
          tenantId: tenant.id,
          actorId: actorProfile.id,
          action: 'AGENT_CLIENT_STORE_CREATED',
          entityType: 'AgentClient',
          entityId: agentClient.id,
          metadata: {
            stage: 'v0.4C',
            tenantSlug,
            ownerEmail,
            ownerWhatsapp,
            subscriptionId: tenantSubscription.id,
            subscriptionStatus: tenantSubscription.status,
            creditDeducted: false,
            invoiceCreated: false,
          },
        },
      });
    });
  } catch (error) {
    console.error('Failed to create agent client draft store:', error);
    redirectWithError('Toko klien belum berhasil dibuat. Silakan coba lagi atau hubungi admin Daganta.');
  }

  revalidatePath('/dashboard/agent');
  redirect('/dashboard/agent?created=client-draft');
}

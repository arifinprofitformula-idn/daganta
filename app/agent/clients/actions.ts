'use server';

import { revalidatePath } from 'next/cache';
import {
  AgentClientOwnershipStatus,
  Prisma,
  UserRole,
} from '@prisma/client';
import { z } from 'zod';
import { getCurrentUserProfile } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

export interface TransferOwnershipResult {
  success: boolean;
  error?: string;
}

const TransferOwnershipSchema = z.object({
  agentClientId: z.string().uuid('Klien tidak valid.'),
  ownerEmail: z.string().trim().toLowerCase().email('Email pemilik baru tidak valid.'),
  confirmation: z.string().trim().min(1, 'Konfirmasi nama toko wajib diisi.'),
});

export async function transferOwnershipAction(formData: FormData): Promise<TransferOwnershipResult> {
  const parsed = TransferOwnershipSchema.safeParse({
    agentClientId: formData.get('agentClientId'),
    ownerEmail: formData.get('ownerEmail'),
    confirmation: formData.get('confirmation'),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map((issue) => issue.message).join(' ') };
  }

  const authData = await getCurrentUserProfile();

  if (!authData?.user || !authData.profile) {
    return { success: false, error: 'Sesi agen tidak valid.' };
  }

  const agentProfile = await prisma.agentProfile.findUnique({
    where: {
      userProfileId: authData.profile.id,
    },
    select: {
      id: true,
    },
  });

  if (!agentProfile) {
    return { success: false, error: 'Profil agen tidak ditemukan.' };
  }

  const agentClient = await prisma.agentClient.findFirst({
    where: {
      id: parsed.data.agentClientId,
      agentId: agentProfile.id,
    },
    include: {
      tenant: {
        select: {
          id: true,
          name: true,
          ownerId: true,
        },
      },
    },
  });

  if (!agentClient) {
    return { success: false, error: 'Klien tidak ditemukan atau bukan milik akun agen Anda.' };
  }

  if (agentClient.ownershipStatus !== AgentClientOwnershipStatus.AGENT_MANAGED) {
    return { success: false, error: 'Toko ini sudah tidak berada dalam pengelolaan agen.' };
  }

  if (parsed.data.confirmation !== agentClient.tenant.name) {
    return { success: false, error: 'Konfirmasi nama toko tidak sesuai.' };
  }

  const newOwner = await prisma.userProfile.findUnique({
    where: {
      email: parsed.data.ownerEmail,
    },
    select: {
      id: true,
      email: true,
    },
  });

  if (!newOwner) {
    return { success: false, error: 'Email pemilik baru belum terdaftar di sistem.' };
  }

  try {
    await prisma.$transaction(
      async (tx) => {
        const updateClient = await tx.agentClient.updateMany({
          where: {
            id: agentClient.id,
            agentId: agentProfile.id,
            ownershipStatus: AgentClientOwnershipStatus.AGENT_MANAGED,
          },
          data: {
            ownershipStatus: AgentClientOwnershipStatus.TRANSFERRED_TO_CLIENT,
            transferredAt: new Date(),
            transferredByUserId: authData.profile!.id,
          },
        });

        if (updateClient.count === 0) {
          throw new Error('Toko ini sudah tidak berada dalam pengelolaan agen.');
        }

        await tx.tenant.update({
          where: {
            id: agentClient.tenant.id,
          },
          data: {
            ownerId: newOwner.id,
          },
        });

        await tx.tenantMember.upsert({
          where: {
            tenantId_userId: {
              tenantId: agentClient.tenant.id,
              userId: newOwner.id,
            },
          },
          update: {
            role: UserRole.TENANT_OWNER,
          },
          create: {
            tenantId: agentClient.tenant.id,
            userId: newOwner.id,
            role: UserRole.TENANT_OWNER,
          },
        });

        await tx.auditLog.create({
          data: {
            tenantId: agentClient.tenant.id,
            actorId: authData.profile!.id,
            action: 'AGENT_TRANSFER_OWNERSHIP_TO_CLIENT',
            entityType: 'AgentClient',
            entityId: agentClient.id,
            metadata: {
              agentId: agentProfile.id,
              tenantId: agentClient.tenant.id,
              previousOwnerId: agentClient.tenant.ownerId,
              newOwnerId: newOwner.id,
              newOwnerEmail: newOwner.email,
            },
          },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Transfer kepemilikan gagal diproses.',
    };
  }

  revalidatePath('/agent/clients');
  return { success: true };
}

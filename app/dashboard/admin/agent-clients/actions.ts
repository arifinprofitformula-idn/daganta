'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  AgentClientOwnershipStatus,
  AgentClientStatus,
  Prisma,
  UserRole,
} from '@prisma/client';
import { assertSuperAdmin } from '@/lib/auth/platform-access';
import { prisma } from '@/lib/prisma';

type TransferTarget = 'CLIENT' | 'DAGANTA';

class OwnershipTransferError extends Error {}

function transferError(message: string): never {
  throw new OwnershipTransferError(message);
}

function redirectWithError(message: string): never {
  redirect(`/dashboard/admin/agent-clients?error=${encodeURIComponent(message)}`);
}

function redirectWithSuccess(message: string): never {
  redirect(`/dashboard/admin/agent-clients?success=${encodeURIComponent(message)}`);
}

function parseTransferTarget(value: FormDataEntryValue | null): TransferTarget | null {
  if (value === 'CLIENT' || value === 'DAGANTA') {
    return value;
  }

  return null;
}

export async function transferAgentClientOwnershipAction(formData: FormData) {
  let platformUser;

  try {
    platformUser = await assertSuperAdmin();
  } catch {
    redirectWithError('Halaman ini hanya tersedia untuk admin platform Daganta.');
  }

  const agentClientId = String(formData.get('agentClientId') || '').trim();
  const transferTarget = parseTransferTarget(formData.get('transferTarget'));

  if (!agentClientId || !transferTarget) {
    redirectWithError('Permintaan transfer tidak valid.');
  }

  try {
    await prisma.$transaction(
      async (tx) => {
        const agentClient = await tx.agentClient.findUnique({
          where: { id: agentClientId },
          include: {
            agent: {
              select: {
                id: true,
                displayName: true,
                agentCode: true,
                creditBalance: true,
              },
            },
            tenant: {
              include: {
                owner: {
                  select: {
                    id: true,
                    email: true,
                    name: true,
                  },
                },
              },
            },
          },
        });

        if (!agentClient) {
          transferError('Data toko klien tidak ditemukan.');
        }

        if (!agentClient.tenant) {
          transferError('Tenant toko klien tidak ditemukan.');
        }

        if (!agentClient.tenant.owner) {
          transferError('Profil pemilik tenant tidak ditemukan.');
        }

        if (agentClient.ownershipStatus !== AgentClientOwnershipStatus.AGENT_MANAGED) {
          transferError('Kepemilikan toko klien ini sudah pernah dipindahkan.');
        }

        if (agentClient.status !== AgentClientStatus.DRAFT && agentClient.status !== AgentClientStatus.ACTIVE) {
          transferError('Status toko klien ini tidak dapat dipindahkan.');
        }

        const previousOwnershipStatus = agentClient.ownershipStatus;
        const previousAgentClientStatus = agentClient.status;
        const previousTenantOwnerId = agentClient.tenant.ownerId;
        const now = new Date();
        const newOwnershipStatus =
          transferTarget === 'CLIENT'
            ? AgentClientOwnershipStatus.TRANSFERRED_TO_CLIENT
            : AgentClientOwnershipStatus.TRANSFERRED_TO_DAGANTA;
        const newTenantOwnerId =
          transferTarget === 'CLIENT'
            ? agentClient.tenant.owner.id
            : platformUser.profile.id;

        const targetOwner = await tx.userProfile.findUnique({
          where: { id: newTenantOwnerId },
          select: { id: true },
        });

        if (!targetOwner) {
          transferError('Profil target pemilik tidak ditemukan.');
        }

        await tx.tenant.update({
          where: { id: agentClient.tenant.id },
          data: {
            ownerId: newTenantOwnerId,
          },
        });

        await tx.tenantMember.upsert({
          where: {
            tenantId_userId: {
              tenantId: agentClient.tenant.id,
              userId: newTenantOwnerId,
            },
          },
          update: {
            role: UserRole.TENANT_OWNER,
          },
          create: {
            tenantId: agentClient.tenant.id,
            userId: newTenantOwnerId,
            role: UserRole.TENANT_OWNER,
          },
        });

        const updateResult = await tx.agentClient.updateMany({
          where: {
            id: agentClient.id,
            ownershipStatus: AgentClientOwnershipStatus.AGENT_MANAGED,
            status: {
              in: [AgentClientStatus.DRAFT, AgentClientStatus.ACTIVE],
            },
          },
          data: {
            status: AgentClientStatus.TRANSFERRED,
            ownershipStatus: newOwnershipStatus,
            transferredAt: now,
            transferredByUserId: platformUser.profile.id,
          },
        });

        if (updateResult.count === 0) {
          transferError('Toko klien ini sudah tidak dapat dipindahkan.');
        }

        await tx.auditLog.create({
          data: {
            tenantId: agentClient.tenant.id,
            actorId: platformUser.profile.id,
            action: 'AGENT_CLIENT_OWNERSHIP_TRANSFERRED',
            entityType: 'AgentClient',
            entityId: agentClient.id,
            metadata: {
              agentId: agentClient.agentId,
              agentClientId: agentClient.id,
              tenantId: agentClient.tenant.id,
              transferTarget,
              previousOwnershipStatus,
              newOwnershipStatus,
              previousAgentClientStatus,
              newAgentClientStatus: AgentClientStatus.TRANSFERRED,
              previousTenantOwnerId,
              newTenantOwnerId,
              tenantMemberOwnerUpserted: true,
              transferredByUserId: platformUser.profile.id,
            },
          },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  } catch (error) {
    if (error instanceof OwnershipTransferError) {
      redirectWithError(error.message);
    }

    console.error('Failed to transfer agent client ownership:', error);
    redirectWithError('Transfer kepemilikan belum berhasil. Silakan coba lagi atau hubungi tim teknis Daganta.');
  }

  revalidatePath('/dashboard/admin/agent-clients');
  redirectWithSuccess('Kepemilikan toko klien berhasil dipindahkan.');
}

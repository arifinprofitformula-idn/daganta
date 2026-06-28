'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { AgentCreditTopupStatus, Prisma } from '@prisma/client';
import { assertSuperAdmin } from '@/lib/auth/platform-access';
import { addAgentCredit } from '@/lib/data-access/agent-credits';
import { prisma } from '@/lib/prisma';

function redirectWithError(message: string): never {
  redirect(`/admin/agent-topups?error=${encodeURIComponent(message)}`);
}

function redirectWithSuccess(message: string): never {
  redirect(`/admin/agent-topups?success=${encodeURIComponent(message)}`);
}

export async function confirmTopupAction(requestId: string) {
  let platformUser;

  try {
    platformUser = await assertSuperAdmin();
  } catch {
    redirectWithError('Halaman ini hanya tersedia untuk super admin Daganta.');
  }

  try {
    await prisma.$transaction(
      async (tx) => {
        const request = await tx.agentCreditTopupRequest.findUnique({
          where: {
            id: requestId,
          },
          include: {
            agent: {
              select: {
                id: true,
                agentCode: true,
                displayName: true,
              },
            },
          },
        });

        if (!request) {
          throw new Error('Request top-up tidak ditemukan.');
        }

        if (request.status !== AgentCreditTopupStatus.PENDING) {
          throw new Error('Request top-up sudah diproses.');
        }

        const updateResult = await tx.agentCreditTopupRequest.updateMany({
          where: {
            id: request.id,
            status: AgentCreditTopupStatus.PENDING,
          },
          data: {
            status: AgentCreditTopupStatus.APPROVED,
            reviewedByUserId: platformUser.profile.id,
            reviewedAt: new Date(),
          },
        });

        if (updateResult.count === 0) {
          throw new Error('Request top-up sudah diproses.');
        }

        await addAgentCredit(tx, {
          agentId: request.agentId,
          amount: request.amount,
          description: `Top-up kredit disetujui admin: ${request.agent.displayName}`,
          createdByUserId: platformUser.profile.id,
          metadata: {
            topupRequestId: request.id,
            agentCode: request.agent.agentCode,
            note: request.note,
          },
        });

        await tx.auditLog.create({
          data: {
            tenantId: null,
            actorId: platformUser.profile.id,
            action: 'CONFIRM_AGENT_CREDIT_TOPUP',
            entityType: 'AgentCreditTopupRequest',
            entityId: request.id,
            metadata: {
              agentId: request.agentId,
              agentCode: request.agent.agentCode,
              amount: request.amount.toString(),
            },
          },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );
  } catch (error: unknown) {
    redirectWithError(error instanceof Error ? error.message : 'Request top-up gagal dikonfirmasi.');
  }

  revalidatePath('/admin/agent-topups');
  redirectWithSuccess('Top-up kredit berhasil dikonfirmasi.');
}

export async function rejectTopupAction(requestId: string) {
  let platformUser;

  try {
    platformUser = await assertSuperAdmin();
  } catch {
    redirectWithError('Halaman ini hanya tersedia untuk super admin Daganta.');
  }

  try {
    const request = await prisma.agentCreditTopupRequest.updateMany({
      where: {
        id: requestId,
        status: AgentCreditTopupStatus.PENDING,
      },
      data: {
        status: AgentCreditTopupStatus.REJECTED,
        reviewedByUserId: platformUser.profile.id,
        reviewedAt: new Date(),
      },
    });

    if (request.count === 0) {
      redirectWithError('Request top-up tidak ditemukan atau sudah diproses.');
    }
  } catch (error: unknown) {
    redirectWithError(error instanceof Error ? error.message : 'Request top-up gagal ditolak.');
  }

  revalidatePath('/admin/agent-topups');
  redirectWithSuccess('Request top-up ditolak.');
}

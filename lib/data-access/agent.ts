import { AgentClientOwnershipStatus } from '@prisma/client';
import { getCurrentUserProfile } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

export interface AgentClientFilters {
  ownershipStatus?: AgentClientOwnershipStatus;
}

async function validateAgentSession(agentId: string) {
  const authData = await getCurrentUserProfile();

  if (!authData?.user || !authData.profile) {
    throw new Error('Sesi agen tidak valid.');
  }

  const agentProfile = await prisma.agentProfile.findUnique({
    where: {
      userProfileId: authData.profile.id,
    },
    select: {
      id: true,
    },
  });

  if (!agentProfile || agentProfile.id !== agentId) {
    throw new Error('Anda tidak memiliki akses ke data agen ini.');
  }
}

export async function getAgentProfile(agentId: string) {
  await validateAgentSession(agentId);

  return prisma.agentProfile.findUnique({
    where: {
      id: agentId,
    },
    include: {
      userProfile: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  });
}

export async function getAgentClients(agentId: string, filters: AgentClientFilters = {}) {
  await validateAgentSession(agentId);

  return prisma.agentClient.findMany({
    where: {
      agentId,
      ownershipStatus: filters.ownershipStatus,
    },
    include: {
      tenant: {
        select: {
          id: true,
          name: true,
          subdomain: true,
          status: true,
          createdAt: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function getAgentStats(agentId: string) {
  await validateAgentSession(agentId);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [agentProfile, activeClients, newClientsThisMonth] = await Promise.all([
    prisma.agentProfile.findUnique({
      where: {
        id: agentId,
      },
      select: {
        creditBalance: true,
      },
    }),
    prisma.agentClient.count({
      where: {
        agentId,
        status: 'ACTIVE',
        ownershipStatus: AgentClientOwnershipStatus.AGENT_MANAGED,
      },
    }),
    prisma.agentClient.count({
      where: {
        agentId,
        createdAt: {
          gte: monthStart,
        },
      },
    }),
  ]);

  return {
    creditBalance: Number(agentProfile?.creditBalance ?? 0),
    activeClients,
    newClientsThisMonth,
    totalCommission: 0,
  };
}

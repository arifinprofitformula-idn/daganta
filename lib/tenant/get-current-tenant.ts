import type { TenantStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export interface CurrentTenant {
  tenantId: string;
  tenantName: string;
  tenantStatus: TenantStatus;
}

export async function getCurrentTenant(): Promise<CurrentTenant | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const userProfile = await prisma.userProfile.findFirst({
    where: {
      OR: [
        { authUserId: user.id },
        ...(user.email ? [{ email: user.email }] : []),
      ],
    },
    select: {
      id: true,
    },
  });

  if (!userProfile) {
    return null;
  }

  const membership = await prisma.tenantMember.findFirst({
    where: {
      userId: userProfile.id,
    },
    include: {
      tenant: {
        select: {
          id: true,
          name: true,
          status: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  if (!membership) {
    return null;
  }

  return {
    tenantId: membership.tenant.id,
    tenantName: membership.tenant.name,
    tenantStatus: membership.tenant.status,
  };
}

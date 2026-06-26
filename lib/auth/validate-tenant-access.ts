import { prisma } from '@/lib/prisma';

export class TenantAccessError extends Error {
  constructor(message = 'Anda tidak memiliki akses ke tenant ini.') {
    super(message);
    this.name = 'TenantAccessError';
  }
}

export async function validateTenantAccess(userId: string, tenantId: string): Promise<boolean> {
  if (!userId || !tenantId) {
    throw new TenantAccessError();
  }

  const membership = await prisma.tenantMember.findFirst({
    where: {
      userId,
      tenantId,
    },
    select: {
      id: true,
    },
  });

  if (!membership) {
    throw new TenantAccessError();
  }

  return true;
}

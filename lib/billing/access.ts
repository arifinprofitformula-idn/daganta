import { PlatformRole, UserRole } from '@prisma/client';
import type { TenantContext } from '@/lib/auth/tenant-access';

export function canUseBillingPaymentSimulation(tenantCtx: TenantContext) {
  return tenantCtx.userProfile?.platformRole === PlatformRole.SUPER_ADMIN;
}

export function canManageBillingManually(tenantCtx: TenantContext) {
  const role = tenantCtx.activeMembership?.role;

  return role === UserRole.TENANT_OWNER || role === UserRole.SUPER_ADMIN;
}

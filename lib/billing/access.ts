import { UserRole } from '@prisma/client';
import type { TenantContext } from '@/lib/auth/tenant-access';

const DEMO_TENANT_SLUGS = new Set(['toya-nusantara', 'demo-store']);

export function canUseBillingPaymentSimulation(tenantCtx: TenantContext) {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const isSuperAdmin = tenantCtx.activeMembership?.role === UserRole.SUPER_ADMIN;
  const isDemoTenant = tenantCtx.activeTenant
    ? DEMO_TENANT_SLUGS.has(tenantCtx.activeTenant.slug)
    : false;

  return isDevelopment || isSuperAdmin || isDemoTenant;
}

export function canManageBillingManually(tenantCtx: TenantContext) {
  const role = tenantCtx.activeMembership?.role;

  return role === UserRole.TENANT_OWNER || role === UserRole.SUPER_ADMIN;
}

import { TenantStatus } from '@prisma/client';
import { headers } from 'next/headers';
import { getTenantSubscriptionPolicy } from '@/lib/billing/lifecycle';
import { prisma } from '@/lib/prisma';
import { resolveTenantFromHost } from '@/lib/tenant/resolve-tenant';
import type { TenantResolveResult } from '@/lib/tenant/types';

function createResult(result: Omit<TenantResolveResult, 'suspended'> & { suspended?: boolean }): TenantResolveResult {
  return {
    ...result,
    suspended: result.suspended ?? false,
  };
}

export async function getStorefrontTenantContext(): Promise<TenantResolveResult> {
  const headersList = await headers();
  const tenantId = headersList.get('x-daganta-tenant-id');

  if (!tenantId) {
    const host = headersList.get('host') ?? '';
    return resolveTenantFromHost(host);
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      id: true,
      name: true,
      slug: true,
      subdomain: true,
      status: true,
    },
  });

  if (!tenant) {
    return createResult({
      status: 'NOT_FOUND',
      accessMode: 'NOT_FOUND',
      tenant: null,
      error: 'Tenant header did not match an existing tenant',
    });
  }

  const resolvedTenant = {
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    subdomain: tenant.subdomain,
    status: tenant.status,
  };

  if (tenant.status === TenantStatus.SUSPENDED) {
    return createResult({
      status: 'SUSPENDED',
      accessMode: 'SUSPENDED',
      tenant: resolvedTenant,
      suspended: true,
      error: 'Tenant is suspended',
    });
  }

  const policy = await getTenantSubscriptionPolicy(tenant.id);

  if (!policy.canViewStorefront) {
    return createResult({
      status: 'BLOCKED',
      accessMode: 'BLOCKED',
      tenant: resolvedTenant,
      error: null,
    });
  }

  return createResult({
    status: 'SUCCESS',
    accessMode: policy.canCheckout ? 'STOREFRONT_FULL' : 'STOREFRONT_READONLY',
    tenant: resolvedTenant,
    error: null,
  });
}

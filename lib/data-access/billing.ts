import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export interface InvoicePagination {
  page?: number;
  limit?: number;
}

export type ActiveTenantPlan = Prisma.TenantSubscriptionGetPayload<{
  include: {
    plan: true;
  };
}>;

export type TenantInvoice = Prisma.InvoiceGetPayload<{
  include: {
    plan: true;
  };
}>;

/**
 * Returns the latest subscription for one tenant only.
 * The lookup must include tenantId to keep billing data isolated per tenant.
 */
export async function getActivePlanByTenant(tenantId: string): Promise<ActiveTenantPlan | null> {
  if (!tenantId) {
    throw new Error('tenantId is required for tenant-scoped billing queries');
  }

  return prisma.tenantSubscription.findFirst({
    where: {
      tenantId,
    },
    include: {
      plan: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Returns invoices for one tenant only.
 * Every invoice query in this function must include the provided tenantId.
 */
export async function getInvoicesByTenant(
  tenantId: string,
  pagination: InvoicePagination = {}
): Promise<TenantInvoice[]> {
  if (!tenantId) {
    throw new Error('tenantId is required for tenant-scoped invoice queries');
  }

  const page = Math.max(1, pagination.page ?? 1);
  const limit = Math.min(50, Math.max(1, pagination.limit ?? 10));

  return prisma.invoice.findMany({
    where: {
      tenantId,
    },
    include: {
      plan: true,
    },
    orderBy: {
      issuedAt: 'desc',
    },
    skip: (page - 1) * limit,
    take: limit,
  });
}

export async function getPlanOptions() {
  return prisma.subscriptionPlan.findMany({
    where: {
      isActive: true,
    },
    orderBy: [{ productLimit: 'asc' }, { billingCycle: 'asc' }],
  });
}

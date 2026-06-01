import { prisma } from '@/lib/prisma';
import { ProductStatus } from '@prisma/client';

export interface DashboardSummary {
  tenant: {
    id: string;
    name: string;
    slug: string;
    subdomain: string;
    status: string;
  };
  productCount: number;
  orderCount: number;
  customerCount: number;
}

export async function getDashboardSummaryBySubdomain(subdomain: string): Promise<DashboardSummary | null> {
  if (!subdomain) {
    throw new Error('Subdomain is required for tenant-scoped dashboard queries');
  }

  const tenant = await prisma.tenant.findUnique({
    where: { subdomain }
  });

  if (!tenant) {
    return null;
  }

  const [productCount, orderCount, customerCount] = await Promise.all([
    prisma.product.count({
      where: {
        tenantId: tenant.id,
        status: ProductStatus.ACTIVE
      }
    }),
    prisma.order.count({
      where: {
        tenantId: tenant.id
      }
    }),
    prisma.customer.count({
      where: {
        tenantId: tenant.id
      }
    })
  ]);

  return {
    tenant: {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      subdomain: tenant.subdomain,
      status: tenant.status
    },
    productCount,
    orderCount,
    customerCount
  };
}

export async function getDashboardSummaryByTenantId(tenantId: string): Promise<DashboardSummary | null> {
  if (!tenantId) {
    throw new Error('Tenant ID is required for tenant-scoped dashboard queries');
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId }
  });

  if (!tenant) {
    return null;
  }

  const [productCount, orderCount, customerCount] = await Promise.all([
    prisma.product.count({
      where: {
        tenantId: tenant.id,
        status: ProductStatus.ACTIVE
      }
    }),
    prisma.order.count({
      where: {
        tenantId: tenant.id
      }
    }),
    prisma.customer.count({
      where: {
        tenantId: tenant.id
      }
    })
  ]);

  return {
    tenant: {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      subdomain: tenant.subdomain,
      status: tenant.status
    },
    productCount,
    orderCount,
    customerCount
  };
}

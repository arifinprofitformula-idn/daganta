import { ProductStatus } from '@prisma/client';
import { prisma } from '../prisma';

export async function getProductsByTenantId(tenantId: string) {
  if (!tenantId) {
    throw new Error('tenantId is required for tenant-scoped product queries');
  }
  return prisma.product.findMany({
    where: {
      tenantId,
      status: ProductStatus.ACTIVE,
    },
    include: {
      variants: {
        where: { isActive: true },
      },
      category: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getFeaturedProductsByTenantId(tenantId: string) {
  if (!tenantId) {
    throw new Error('tenantId is required for tenant-scoped product queries');
  }
  return prisma.product.findMany({
    where: {
      tenantId,
      isFeatured: true,
      status: ProductStatus.ACTIVE,
    },
    include: {
      variants: {
        where: { isActive: true },
      },
      category: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getProductBySlug(tenantId: string, slug: string) {
  if (!tenantId || !slug) {
    throw new Error('Both tenantId and slug are required for tenant-scoped product queries');
  }
  return prisma.product.findUnique({
    where: {
      tenantId_slug: {
        tenantId,
        slug,
      },
    },
    include: {
      variants: {
        where: { isActive: true },
      },
      category: true,
    },
  });
}

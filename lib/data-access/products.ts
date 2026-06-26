import { ProductStatus } from '@prisma/client';
import { prisma } from '../prisma';

/**
 * Returns active storefront products for one tenant only.
 * Every product query in this function must include the provided tenantId.
 */
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

/**
 * Returns featured storefront products for one tenant only.
 * Every product query in this function must include the provided tenantId.
 */
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

/**
 * Returns one product by tenant-scoped slug.
 * The unique lookup must include both tenantId and slug.
 */
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

/**
 * Returns product categories for one tenant only.
 * Every category query in this function must include the provided tenantId.
 */
export async function getCategoriesByTenantId(tenantId: string, onlyActive = false) {
  if (!tenantId) {
    throw new Error('tenantId is required for tenant-scoped category queries');
  }
  return prisma.productCategory.findMany({
    where: {
      tenantId,
      ...(onlyActive ? { isActive: true } : {}),
    },
    orderBy: { sortOrder: 'asc' },
  });
}

/**
 * Returns dashboard product records for one tenant only.
 * Every dashboard product query in this function must include the provided tenantId.
 */
export async function getDashboardProductsByTenantId(tenantId: string) {
  if (!tenantId) {
    throw new Error('tenantId is required for tenant-scoped product queries');
  }
  return prisma.product.findMany({
    where: {
      tenantId,
      // Dashboard menampilkan semua kecuali yang mungkin di-hard delete (yang mana kita tidak lakukan)
    },
    include: {
      variants: true, // Menampilkan semua varian termasuk yang tidak aktif agar bisa diedit
      category: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Returns one dashboard product by tenant-scoped id.
 * The lookup must include both tenantId and product id.
 */
export async function getProductById(tenantId: string, id: string) {
  if (!tenantId || !id) {
    throw new Error('Both tenantId and id are required for tenant-scoped product queries');
  }
  return prisma.product.findFirst({
    where: {
      id,
      tenantId,
    },
    include: {
      variants: true,
      category: true,
    },
  });
}

/**
 * Returns one product category by tenant-scoped id.
 * The lookup must include both tenantId and category id.
 */
export async function getCategoryById(tenantId: string, id: string) {
  if (!tenantId || !id) {
    throw new Error('Both tenantId and id are required for tenant-scoped category queries');
  }
  return prisma.productCategory.findFirst({
    where: {
      id,
      tenantId,
    },
  });
}

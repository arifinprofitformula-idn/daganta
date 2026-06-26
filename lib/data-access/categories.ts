import { ProductStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export interface CategoryInput {
  name: string;
  slug: string;
}

function normalizeSlug(slug: string) {
  return slug
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]+/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Returns all product categories for one tenant only.
 * Every category and product count query must include the provided tenantId.
 */
export async function getCategoriesByTenant(tenantId: string) {
  if (!tenantId) {
    throw new Error('tenantId is required for tenant-scoped category queries');
  }

  const categories = await prisma.productCategory.findMany({
    where: {
      tenantId,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      isActive: true,
      createdAt: true,
      _count: {
        select: {
          products: {
            where: {
              tenantId,
              status: {
                not: ProductStatus.ARCHIVED,
              },
            },
          },
        },
      },
    },
    orderBy: [
      {
        sortOrder: 'asc',
      },
      {
        name: 'asc',
      },
    ],
  });

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    isActive: category.isActive,
    createdAt: category.createdAt,
    productCount: category._count.products,
  }));
}

/**
 * Creates one product category for one tenant only.
 * The create payload must include tenantId.
 */
export async function createCategory(tenantId: string, data: CategoryInput) {
  if (!tenantId) {
    throw new Error('tenantId is required for tenant-scoped category mutations');
  }

  const slug = normalizeSlug(data.slug);

  if (!slug) {
    throw new Error('Slug kategori wajib diisi.');
  }

  return prisma.productCategory.create({
    data: {
      tenantId,
      name: data.name.trim(),
      slug,
      isActive: true,
    },
  });
}

/**
 * Updates one product category for one tenant only.
 * The update must include tenantId in the where clause.
 */
export async function updateCategory(tenantId: string, categoryId: string, data: CategoryInput) {
  if (!tenantId || !categoryId) {
    throw new Error('tenantId and categoryId are required for tenant-scoped category mutations');
  }

  const slug = normalizeSlug(data.slug);

  if (!slug) {
    throw new Error('Slug kategori wajib diisi.');
  }

  return prisma.productCategory.updateMany({
    where: {
      id: categoryId,
      tenantId,
    },
    data: {
      name: data.name.trim(),
      slug,
    },
  });
}

/**
 * Deletes one category for one tenant only when it has no active products.
 * Both the product count and delete mutation must include tenantId.
 */
export async function deleteCategory(tenantId: string, categoryId: string) {
  if (!tenantId || !categoryId) {
    throw new Error('tenantId and categoryId are required for tenant-scoped category mutations');
  }

  const productCount = await prisma.product.count({
    where: {
      tenantId,
      categoryId,
      status: {
        not: ProductStatus.ARCHIVED,
      },
    },
  });

  if (productCount > 0) {
    throw new Error('Kategori masih memiliki produk. Pindahkan atau arsipkan produk terlebih dahulu.');
  }

  return prisma.productCategory.deleteMany({
    where: {
      id: categoryId,
      tenantId,
    },
  });
}

import { Prisma, ProductStatus } from '@prisma/client';
import { prisma } from '../prisma';

export interface GetProductsByTenantOptions {
  search?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
}

export interface DashboardProductListItem {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  status: ProductStatus;
  basePrice: Prisma.Decimal;
  category: {
    id: string;
    name: string;
  } | null;
  stock: number;
  variantCount: number;
}

export interface PaginatedDashboardProducts {
  items: DashboardProductListItem[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

export interface ProductVariantInput {
  id?: string;
  name: string;
  sku?: string | null;
  price: number;
  stock: number;
}

export type StorefrontProduct = Prisma.ProductGetPayload<{
  include: {
    category: {
      select: {
        id: true;
        name: true;
        slug: true;
      };
    };
    variants: {
      where: {
        isActive: true;
      };
      orderBy: {
        createdAt: 'asc';
      };
    };
  };
}>;

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
        where: {
          tenantId,
          isActive: true,
        },
      },
      category: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Returns active storefront products with a tenantId filter.
 * Every product query in this function must include the provided tenantId.
 */
export async function getStorefrontProductsByTenant(
  tenantId: string,
  options: { limit?: number; featuredOnly?: boolean } = {}
): Promise<StorefrontProduct[]> {
  if (!tenantId) {
    throw new Error('tenantId is required for tenant-scoped storefront product queries');
  }

  return prisma.product.findMany({
    where: {
      tenantId,
      status: ProductStatus.ACTIVE,
      ...(options.featuredOnly ? { isFeatured: true } : {}),
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      variants: {
        where: {
          tenantId,
          isActive: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    ...(options.limit ? { take: options.limit } : {}),
  });
}

/**
 * Returns one active storefront product by tenant-scoped slug.
 * The lookup must include both tenantId and slug.
 */
export async function getStorefrontProductBySlug(
  tenantId: string,
  slug: string
): Promise<StorefrontProduct | null> {
  if (!tenantId || !slug) {
    throw new Error('tenantId and slug are required for tenant-scoped storefront product queries');
  }

  return prisma.product.findFirst({
    where: {
      tenantId,
      slug,
      status: ProductStatus.ACTIVE,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      variants: {
        where: {
          tenantId,
          isActive: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });
}

/**
 * Returns the storefront WhatsApp number for one tenant.
 * Tenant lookup is constrained by tenant id, and address fallback must include tenantId.
 */
export async function getTenantStorefrontWhatsappNumber(tenantId: string): Promise<string | null> {
  if (!tenantId) {
    throw new Error('tenantId is required for tenant-scoped tenant contact queries');
  }

  let tenantWhatsappNumber: string | null = null;

  try {
    const tenants = await prisma.$queryRaw<Array<{ whatsappNumber: string | null }>>`
      SELECT "whatsappNumber"
      FROM "Tenant"
      WHERE "id" = ${tenantId}
      LIMIT 1
    `;
    tenantWhatsappNumber = tenants[0]?.whatsappNumber?.trim() || null;
  } catch (error: unknown) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        'Tenant.whatsappNumber is not available yet. Apply docs/sql/add_tenant_whatsapp_number.sql to enable it.',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  if (tenantWhatsappNumber) {
    return tenantWhatsappNumber;
  }

  const defaultAddress = await prisma.address.findFirst({
    where: {
      tenantId,
      isDefault: true,
    },
    select: {
      phone: true,
    },
  });

  if (defaultAddress?.phone) {
    return defaultAddress.phone;
  }

  const fallbackAddress = await prisma.address.findFirst({
    where: {
      tenantId,
    },
    select: {
      phone: true,
    },
  });

  return fallbackAddress?.phone ?? null;
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
        where: {
          tenantId,
          isActive: true,
        },
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
        where: {
          tenantId,
          isActive: true,
        },
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
 * Returns paginated dashboard products for one tenant only.
 * Every query in this function must include the provided tenantId.
 */
export async function getProductsByTenant(
  tenantId: string,
  options: GetProductsByTenantOptions = {}
): Promise<PaginatedDashboardProducts> {
  if (!tenantId) {
    throw new Error('tenantId is required for tenant-scoped product queries');
  }

  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(50, Math.max(1, options.limit ?? 10));
  const search = options.search?.trim();
  const categoryId = options.categoryId?.trim();

  const where: Prisma.ProductWhereInput = {
    tenantId,
    status: {
      not: ProductStatus.ARCHIVED,
    },
    ...(search
      ? {
          name: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        }
      : {}),
    ...(categoryId ? { categoryId } : {}),
  };

  const [products, totalItems] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        variants: {
          where: {
            tenantId,
          },
          select: {
            stock: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  return {
    items: products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      imageUrl: product.imageUrl,
      status: product.status,
      basePrice: product.basePrice,
      category: product.category,
      stock: product.variants
        .filter((variant) => variant.isActive)
        .reduce((total, variant) => total + variant.stock, 0),
      variantCount: product.variants.length,
    })),
    pagination: {
      page,
      limit,
      totalItems,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    },
  };
}

/**
 * Soft deletes one product for one tenant only.
 * The update must include tenantId in the where clause.
 */
export async function deleteProduct(tenantId: string, productId: string) {
  if (!tenantId || !productId) {
    throw new Error('Both tenantId and productId are required for tenant-scoped product mutations');
  }

  const [productResult] = await prisma.$transaction([
    prisma.product.updateMany({
      where: {
        id: productId,
        tenantId,
      },
      data: {
        status: ProductStatus.ARCHIVED,
      },
    }),
    prisma.productVariant.updateMany({
      where: {
        productId,
        tenantId,
      },
      data: {
        isActive: false,
      },
    }),
  ]);

  return productResult;
}

/**
 * Toggles one product status between ACTIVE and DRAFT for one tenant only.
 * Every query and mutation must include the provided tenantId.
 */
export async function toggleProductStatus(tenantId: string, productId: string) {
  if (!tenantId || !productId) {
    throw new Error('Both tenantId and productId are required for tenant-scoped product mutations');
  }

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      tenantId,
      status: {
        not: ProductStatus.ARCHIVED,
      },
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!product) {
    throw new Error('Product not found for this tenant');
  }

  const nextStatus = product.status === ProductStatus.ACTIVE ? ProductStatus.DRAFT : ProductStatus.ACTIVE;

  return prisma.product.updateMany({
    where: {
      id: productId,
      tenantId,
    },
    data: {
      status: nextStatus,
    },
  });
}

/**
 * Creates product variants for one tenant product only.
 * Product ownership and every created variant must include tenantId.
 */
export async function createProductVariants(
  tenantId: string,
  productId: string,
  variants: ProductVariantInput[]
) {
  if (!tenantId || !productId) {
    throw new Error('tenantId and productId are required for tenant-scoped variant mutations');
  }

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      tenantId,
    },
    select: {
      id: true,
    },
  });

  if (!product) {
    throw new Error('Product not found for this tenant');
  }

  if (variants.length === 0) {
    return [];
  }

  return prisma.productVariant.createMany({
    data: variants.map((variant) => ({
      tenantId,
      productId,
      name: variant.name.trim(),
      sku: variant.sku?.trim() || null,
      price: variant.price,
      stock: variant.stock,
      weightGram: 0,
      isActive: true,
    })),
  });
}

/**
 * Reconciles product variants for one tenant product only.
 * Existing variants not included in the payload are deactivated with tenantId and productId filters.
 */
export async function updateProductVariants(
  tenantId: string,
  productId: string,
  variants: ProductVariantInput[]
) {
  if (!tenantId || !productId) {
    throw new Error('tenantId and productId are required for tenant-scoped variant mutations');
  }

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      tenantId,
    },
    select: {
      id: true,
    },
  });

  if (!product) {
    throw new Error('Product not found for this tenant');
  }

  const keepIds = variants
    .map((variant) => variant.id)
    .filter((id): id is string => Boolean(id));

  return prisma.$transaction(async (tx) => {
    await tx.productVariant.updateMany({
      where: {
        tenantId,
        productId,
        ...(keepIds.length > 0 ? { id: { notIn: keepIds } } : {}),
      },
      data: {
        isActive: false,
      },
    });

    for (const variant of variants) {
      if (variant.id) {
        await tx.productVariant.updateMany({
          where: {
            id: variant.id,
            tenantId,
            productId,
          },
          data: {
            name: variant.name.trim(),
            sku: variant.sku?.trim() || null,
            price: variant.price,
            stock: variant.stock,
            isActive: true,
          },
        });
      } else {
        await tx.productVariant.create({
          data: {
            tenantId,
            productId,
            name: variant.name.trim(),
            sku: variant.sku?.trim() || null,
            price: variant.price,
            stock: variant.stock,
            weightGram: 0,
            isActive: true,
          },
        });
      }
    }
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

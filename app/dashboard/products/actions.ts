'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getActiveTenantContext } from '@/lib/auth/tenant-access';
import { ProductStatus } from '@prisma/client';

// Helper to convert string to URL-friendly slug
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-'); // Replace multiple - with single -
}

export interface MutationResult<T = any> {
  success: boolean;
  error?: string;
  data?: T;
}

// ==========================================
// PRODUCT ACTIONS
// ==========================================

export async function createProductAction(input: {
  name: string;
  categoryId?: string | null;
  basePrice: number;
  stock: number;
  weightGram: number;
  sku?: string;
  description: string;
  status: ProductStatus;
}): Promise<MutationResult> {
  // 1. Dapatkan konteks toko aktif dari server
  const tenantCtx = await getActiveTenantContext();
  if (tenantCtx.status !== 'SUCCESS' || !tenantCtx.activeTenant || !tenantCtx.userProfile) {
    return { success: false, error: 'Sesi tidak valid atau Anda tidak memiliki akses ke toko ini.' };
  }

  const tenantId = tenantCtx.activeTenant.id;
  const actorId = tenantCtx.userProfile.id;

  // 2. Validasi input sisi server
  if (!input.name || input.name.trim().length < 3) {
    return { success: false, error: 'Nama produk wajib diisi dan minimal 3 karakter.' };
  }
  if (input.basePrice < 0) {
    return { success: false, error: 'Harga produk tidak boleh bernilai negatif.' };
  }
  if (input.stock < 0) {
    return { success: false, error: 'Stok produk tidak boleh bernilai negatif.' };
  }
  if (input.weightGram < 0) {
    return { success: false, error: 'Berat produk tidak boleh bernilai negatif.' };
  }
  if (!input.description || input.description.trim().length < 5) {
    return { success: false, error: 'Deskripsi produk wajib diisi dan minimal 5 karakter.' };
  }

  // Validasi kategori milik tenant dan pastikan aktif
  if (input.categoryId) {
    const category = await prisma.productCategory.findFirst({
      where: { id: input.categoryId, tenantId, isActive: true }
    });
    if (!category) {
      return { success: false, error: 'Kategori produk tidak sah, tidak aktif, atau tidak ditemukan.' };
    }
  }

  const activeSubscription = await prisma.tenantSubscription.findFirst({
    where: { tenantId },
    include: { plan: true },
    orderBy: { createdAt: 'desc' },
  });

  if (!activeSubscription?.plan) {
    return { success: false, error: 'Paket toko belum tersedia. Silakan hubungi admin Daganta.' };
  }

  const productCount = await prisma.product.count({
    where: {
      tenantId,
      status: { not: ProductStatus.ARCHIVED },
    },
  });

  if (productCount >= activeSubscription.plan.productLimit) {
    return {
      success: false,
      error: 'Batas produk paket Anda sudah tercapai. Silakan naikkan paket untuk menambah produk baru.',
    };
  }

  // 3. Generate slug aman dan unik per tenant
  const baseSlug = slugify(input.name);
  let uniqueSlug = baseSlug || 'produk';
  let suffix = 1;
  while (true) {
    const existing = await prisma.product.findUnique({
      where: {
        tenantId_slug: {
          tenantId,
          slug: uniqueSlug,
        },
      },
    });
    if (!existing) {
      break;
    }
    uniqueSlug = `${baseSlug}-${suffix}`;
    suffix++;
  }

  // 4. Eksekusi transaksi database untuk menjamin konsistensi
  try {
    const product = await prisma.$transaction(async (tx) => {
      // a. Buat entitas Product
      const newProduct = await tx.product.create({
        data: {
          tenantId,
          categoryId: input.categoryId || null,
          name: input.name.trim(),
          slug: uniqueSlug,
          description: input.description.trim(),
          status: input.status,
          basePrice: input.basePrice,
        },
      });

      // b. Buat entitas ProductVariant default ("Standar")
      await tx.productVariant.create({
        data: {
          tenantId,
          productId: newProduct.id,
          name: 'Standar',
          sku: input.sku?.trim() || null,
          price: input.basePrice,
          stock: input.stock,
          weightGram: input.weightGram,
          isActive: true,
        },
      });

      // c. Tulis AuditLog aktivitas
      try {
        await tx.auditLog.create({
          data: {
            tenantId,
            actorId,
            action: 'CREATE_PRODUCT',
            entityType: 'Product',
            entityId: newProduct.id,
            metadata: {
              productName: newProduct.name,
              basePrice: newProduct.basePrice.toString(),
              sku: input.sku || null,
            },
          },
        });
      } catch (logError) {
        // Jangan gagalkan transaksi utama jika log gagal secara teknis
        console.error('Gagal menulis AuditLog pembuatan produk:', logError);
      }

      return newProduct;
    });

    revalidatePath('/dashboard/products');
    return { success: true, data: product };
  } catch (err: any) {
    console.error('Error saat menyimpan produk:', err);
    return { success: false, error: 'Gagal menyimpan produk ke database.' };
  }
}

export async function editProductAction(
  productId: string,
  input: {
    name: string;
    categoryId?: string | null;
    basePrice: number;
    stock: number;
    weightGram: number;
    sku?: string;
    description: string;
    status: ProductStatus;
  }
): Promise<MutationResult> {
  // 1. Dapatkan konteks toko aktif dari server
  const tenantCtx = await getActiveTenantContext();
  if (tenantCtx.status !== 'SUCCESS' || !tenantCtx.activeTenant || !tenantCtx.userProfile) {
    return { success: false, error: 'Sesi tidak valid atau Anda tidak memiliki akses.' };
  }

  const tenantId = tenantCtx.activeTenant.id;
  const actorId = tenantCtx.userProfile.id;

  // 2. Validasi input sisi server
  if (!input.name || input.name.trim().length < 3) {
    return { success: false, error: 'Nama produk wajib diisi dan minimal 3 karakter.' };
  }
  if (input.basePrice < 0) {
    return { success: false, error: 'Harga produk tidak boleh bernilai negatif.' };
  }
  if (input.stock < 0) {
    return { success: false, error: 'Stok produk tidak boleh bernilai negatif.' };
  }
  if (input.weightGram < 0) {
    return { success: false, error: 'Berat produk tidak boleh bernilai negatif.' };
  }
  if (!input.description || input.description.trim().length < 5) {
    return { success: false, error: 'Deskripsi produk wajib diisi dan minimal 5 karakter.' };
  }

  // Validasi kategori milik tenant dan pastikan aktif
  if (input.categoryId) {
    const category = await prisma.productCategory.findFirst({
      where: { id: input.categoryId, tenantId, isActive: true }
    });
    if (!category) {
      return { success: false, error: 'Kategori produk tidak sah, tidak aktif, atau tidak ditemukan.' };
    }
  }

  // 3. Pastikan produk ada dan benar-benar milik tenant aktif (isolasi ketat)
  const existingProduct = await prisma.product.findFirst({
    where: { id: productId, tenantId }
  });
  if (!existingProduct) {
    return { success: false, error: 'Produk tidak ditemukan atau bukan milik toko Anda.' };
  }

  // 4. Generate slug jika nama berubah
  let uniqueSlug = existingProduct.slug;
  if (existingProduct.name !== input.name.trim()) {
    const baseSlug = slugify(input.name);
    uniqueSlug = baseSlug || 'produk';
    let suffix = 1;
    while (true) {
      const existing = await prisma.product.findFirst({
        where: {
          tenantId,
          slug: uniqueSlug,
          NOT: { id: productId }
        },
      });
      if (!existing) {
        break;
      }
      uniqueSlug = `${baseSlug}-${suffix}`;
      suffix++;
    }
  }

  // 5. Eksekusi transaksi database
  try {
    const product = await prisma.$transaction(async (tx) => {
      // a. Update Product
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: {
          categoryId: input.categoryId || null,
          name: input.name.trim(),
          slug: uniqueSlug,
          description: input.description.trim(),
          status: input.status,
          basePrice: input.basePrice,
        },
      });

      // b. Update Variant default ("Standar") atau variant pertama
      const variantDefault = await tx.productVariant.findFirst({
        where: { productId, tenantId, name: 'Standar' }
      });

      if (variantDefault) {
        await tx.productVariant.update({
          where: { id: variantDefault.id },
          data: {
            sku: input.sku?.trim() || null,
            price: input.basePrice,
            stock: input.stock,
            weightGram: input.weightGram,
          }
        });
      } else {
        const firstVariant = await tx.productVariant.findFirst({
          where: { productId, tenantId }
        });

        if (firstVariant) {
          await tx.productVariant.update({
            where: { id: firstVariant.id },
            data: {
              sku: input.sku?.trim() || null,
              price: input.basePrice,
              stock: input.stock,
              weightGram: input.weightGram,
            }
          });
        } else {
          // Jika belum ada variant, buat variant baru
          await tx.productVariant.create({
            data: {
              tenantId,
              productId,
              name: 'Standar',
              sku: input.sku?.trim() || null,
              price: input.basePrice,
              stock: input.stock,
              weightGram: input.weightGram,
              isActive: true,
            }
          });
        }
      }

      // c. Tulis AuditLog aktivitas
      try {
        await tx.auditLog.create({
          data: {
            tenantId,
            actorId,
            action: 'UPDATE_PRODUCT',
            entityType: 'Product',
            entityId: productId,
            metadata: {
              productName: updatedProduct.name,
              basePrice: updatedProduct.basePrice.toString(),
              status: updatedProduct.status,
            },
          },
        });
      } catch (logError) {
        console.error('Gagal menulis AuditLog pembaruan produk:', logError);
      }

      return updatedProduct;
    });

    revalidatePath('/dashboard/products');
    return { success: true, data: product };
  } catch (err: any) {
    console.error('Error saat memperbarui produk:', err);
    return { success: false, error: 'Gagal memperbarui produk ke database.' };
  }
}

export async function deactivateProductAction(productId: string): Promise<MutationResult> {
  // 1. Dapatkan konteks toko aktif dari server
  const tenantCtx = await getActiveTenantContext();
  if (tenantCtx.status !== 'SUCCESS' || !tenantCtx.activeTenant || !tenantCtx.userProfile) {
    return { success: false, error: 'Sesi tidak valid.' };
  }

  const tenantId = tenantCtx.activeTenant.id;
  const actorId = tenantCtx.userProfile.id;

  // 2. Pastikan produk ada dan milik tenant aktif (isolasi)
  const existingProduct = await prisma.product.findFirst({
    where: { id: productId, tenantId }
  });
  if (!existingProduct) {
    return { success: false, error: 'Produk tidak ditemukan.' };
  }

  // 3. Eksekusi penonaktifan (status = ARCHIVED)
  try {
    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: productId },
        data: { status: ProductStatus.ARCHIVED }
      });

      // Nonaktifkan seluruh varian terkait
      await tx.productVariant.updateMany({
        where: { productId, tenantId },
        data: { isActive: false }
      });

      // Tulis AuditLog
      try {
        await tx.auditLog.create({
          data: {
            tenantId,
            actorId,
            action: 'DEACTIVATE_PRODUCT',
            entityType: 'Product',
            entityId: productId,
            metadata: {
              productName: existingProduct.name
            }
          },
        });
      } catch (logError) {
        console.error('Gagal menulis AuditLog deaktifasi produk:', logError);
      }
    });

    revalidatePath('/dashboard/products');
    return { success: true };
  } catch (err: any) {
    console.error('Error saat menonaktifkan produk:', err);
    return { success: false, error: 'Gagal menonaktifkan produk.' };
  }
}

// ==========================================
// CATEGORY ACTIONS
// ==========================================

export async function createCategoryAction(input: {
  name: string;
  description?: string;
  sortOrder?: number;
}): Promise<MutationResult> {
  const tenantCtx = await getActiveTenantContext();
  if (tenantCtx.status !== 'SUCCESS' || !tenantCtx.activeTenant || !tenantCtx.userProfile) {
    return { success: false, error: 'Sesi tidak valid.' };
  }

  const tenantId = tenantCtx.activeTenant.id;
  const actorId = tenantCtx.userProfile.id;

  if (!input.name || input.name.trim().length < 3) {
    return { success: false, error: 'Nama kategori wajib diisi dan minimal 3 karakter.' };
  }

  // Generate slug unik per tenant
  const baseSlug = slugify(input.name);
  let uniqueSlug = baseSlug || 'kategori';
  let suffix = 1;
  while (true) {
    const existing = await prisma.productCategory.findUnique({
      where: {
        tenantId_slug: {
          tenantId,
          slug: uniqueSlug,
        },
      },
    });
    if (!existing) {
      break;
    }
    uniqueSlug = `${baseSlug}-${suffix}`;
    suffix++;
  }

  try {
    const category = await prisma.$transaction(async (tx) => {
      const newCategory = await tx.productCategory.create({
        data: {
          tenantId,
          name: input.name.trim(),
          slug: uniqueSlug,
          description: input.description?.trim() || null,
          sortOrder: input.sortOrder || 0,
          isActive: true,
        }
      });

      try {
        await tx.auditLog.create({
          data: {
            tenantId,
            actorId,
            action: 'CREATE_CATEGORY',
            entityType: 'ProductCategory',
            entityId: newCategory.id,
            metadata: {
              categoryName: newCategory.name
            }
          }
        });
      } catch (logError) {
        console.error('Gagal menulis AuditLog pembuatan kategori:', logError);
      }

      return newCategory;
    });

    revalidatePath('/dashboard/products/categories');
    revalidatePath('/dashboard/products');
    return { success: true, data: category };
  } catch (err: any) {
    console.error('Error saat membuat kategori:', err);
    return { success: false, error: 'Gagal membuat kategori produk.' };
  }
}

export async function editCategoryAction(
  categoryId: string,
  input: {
    name: string;
    description?: string;
    sortOrder?: number;
  }
): Promise<MutationResult> {
  const tenantCtx = await getActiveTenantContext();
  if (tenantCtx.status !== 'SUCCESS' || !tenantCtx.activeTenant || !tenantCtx.userProfile) {
    return { success: false, error: 'Sesi tidak valid.' };
  }

  const tenantId = tenantCtx.activeTenant.id;
  const actorId = tenantCtx.userProfile.id;

  if (!input.name || input.name.trim().length < 3) {
    return { success: false, error: 'Nama kategori wajib diisi dan minimal 3 karakter.' };
  }

  // Pastikan kategori milik tenant
  const existingCategory = await prisma.productCategory.findFirst({
    where: { id: categoryId, tenantId }
  });
  if (!existingCategory) {
    return { success: false, error: 'Kategori tidak ditemukan atau bukan milik toko Anda.' };
  }

  // Generate slug jika nama berubah
  let uniqueSlug = existingCategory.slug;
  if (existingCategory.name !== input.name.trim()) {
    const baseSlug = slugify(input.name);
    uniqueSlug = baseSlug || 'kategori';
    let suffix = 1;
    while (true) {
      const existing = await prisma.productCategory.findFirst({
        where: {
          tenantId,
          slug: uniqueSlug,
          NOT: { id: categoryId }
        },
      });
      if (!existing) {
        break;
      }
      uniqueSlug = `${baseSlug}-${suffix}`;
      suffix++;
    }
  }

  try {
    const category = await prisma.$transaction(async (tx) => {
      const updatedCategory = await tx.productCategory.update({
        where: { id: categoryId },
        data: {
          name: input.name.trim(),
          slug: uniqueSlug,
          description: input.description?.trim() || null,
          sortOrder: input.sortOrder || 0,
        }
      });

      try {
        await tx.auditLog.create({
          data: {
            tenantId,
            actorId,
            action: 'UPDATE_CATEGORY',
            entityType: 'ProductCategory',
            entityId: categoryId,
            metadata: {
              categoryName: updatedCategory.name
            }
          }
        });
      } catch (logError) {
        console.error('Gagal menulis AuditLog pembaruan kategori:', logError);
      }

      return updatedCategory;
    });

    revalidatePath('/dashboard/products/categories');
    revalidatePath('/dashboard/products');
    return { success: true, data: category };
  } catch (err: any) {
    console.error('Error saat memperbarui kategori:', err);
    return { success: false, error: 'Gagal memperbarui kategori produk.' };
  }
}

export async function deactivateCategoryAction(categoryId: string): Promise<MutationResult> {
  const tenantCtx = await getActiveTenantContext();
  if (tenantCtx.status !== 'SUCCESS' || !tenantCtx.activeTenant || !tenantCtx.userProfile) {
    return { success: false, error: 'Sesi tidak valid.' };
  }

  const tenantId = tenantCtx.activeTenant.id;
  const actorId = tenantCtx.userProfile.id;

  // Pastikan kategori milik tenant
  const existingCategory = await prisma.productCategory.findFirst({
    where: { id: categoryId, tenantId }
  });
  if (!existingCategory) {
    return { success: false, error: 'Kategori tidak ditemukan.' };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.productCategory.update({
        where: { id: categoryId },
        data: { isActive: false }
      });

      try {
        await tx.auditLog.create({
          data: {
            tenantId,
            actorId,
            action: 'DEACTIVATE_CATEGORY',
            entityType: 'ProductCategory',
            entityId: categoryId,
            metadata: {
              categoryName: existingCategory.name
            }
          }
        });
      } catch (logError) {
        console.error('Gagal menulis AuditLog deaktifasi kategori:', logError);
      }
    });

    revalidatePath('/dashboard/products/categories');
    revalidatePath('/dashboard/products');
    return { success: true };
  } catch (err: any) {
    console.error('Error saat menonaktifkan kategori:', err);
    return { success: false, error: 'Gagal menonaktifkan kategori.' };
  }
}

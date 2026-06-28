'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getActiveTenantContext } from '@/lib/auth/tenant-access';
import { validateTenantAccess } from '@/lib/auth/validate-tenant-access';
import { logAuditAction } from '@/lib/audit/log-action';
import { ProductStatus } from '@prisma/client';
import { getTenantSubscriptionPolicy } from '@/lib/billing/lifecycle';
import { getTenantRestrictions } from '@/lib/tenant/lifecycle';
import {
  createProductVariants,
  deleteProduct,
  toggleProductStatus,
  updateProductVariants,
  type ProductVariantInput,
} from '@/lib/data-access/products';
import { sanitizePlainText, sanitizeProductDescription } from '@/lib/sanitize';
import { deleteProductImage, uploadProductImage } from '@/lib/storage/product-images';

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

export interface MutationResult<T = unknown> {
  success: boolean;
  error?: string;
  data?: T;
}

const ProductFormSchema = z.object({
  name: z.string().trim().min(3, 'Nama produk minimal 3 karakter.').max(255, 'Nama produk maksimal 255 karakter.'),
  description: z
    .string()
    .trim()
    .optional()
    .default('')
    .transform((value) => sanitizeProductDescription(value)),
  price: z.coerce.number().positive('Harga normal wajib lebih dari 0.'),
  comparePrice: z.coerce.number().positive('Harga coret harus lebih dari 0.').optional(),
  stock: z.coerce.number().int('Stok harus angka bulat.').min(0, 'Stok tidak boleh negatif.'),
  categoryId: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined))
    .pipe(z.string().uuid('Kategori tidak valid.').optional()),
  isActive: z.coerce.boolean().default(false),
});

const ProductVariantSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, 'Nama varian wajib diisi.').max(120, 'Nama varian maksimal 120 karakter.'),
  sku: z.string().trim().max(80, 'SKU maksimal 80 karakter.').optional(),
  price: z.coerce.number().positive('Harga varian wajib lebih dari 0.'),
  stock: z.coerce.number().int('Stok varian harus angka bulat.').min(0, 'Stok varian tidak boleh negatif.'),
});

type ProductFormValues = z.infer<typeof ProductFormSchema>;

interface CreateProductInput {
  name: string;
  categoryId?: string | null;
  basePrice: number;
  stock: number;
  weightGram: number;
  sku?: string;
  description: string;
  status: ProductStatus;
  imageUrl?: string | null;
  variants?: Array<{
    name: string;
    sku?: string;
    price: number;
    stock: number;
    weightGram: number;
  }>;
}

interface EditProductInput extends Omit<CreateProductInput, 'variants'> {
  variants?: Array<{
    id?: string;
    name: string;
    sku?: string;
    price: number;
    stock: number;
    weightGram: number;
  }>;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Terjadi kesalahan sistem.';
}

function formatZodError(error: z.ZodError) {
  return error.issues.map((issue) => issue.message).join(' ');
}

function getFormFiles(formData: FormData) {
  return formData
    .getAll('images')
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
}

function validateProductImages(files: File[]) {
  if (files.length > 5) {
    throw new Error('Maksimal upload 5 gambar produk.');
  }

  for (const file of files) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      throw new Error('Format gambar harus JPG, PNG, atau WEBP.');
    }

    if (file.size > 2 * 1024 * 1024) {
      throw new Error('Ukuran setiap gambar maksimal 2MB.');
    }
  }
}

function parseProductFormData(formData: FormData): ProductFormValues {
  const rawComparePrice = formData.get('comparePrice')?.toString().trim();
  const raw = {
    name: formData.get('name'),
    description: formData.get('description')?.toString() ?? '',
    price: formData.get('price'),
    comparePrice: rawComparePrice ? rawComparePrice : undefined,
    stock: formData.get('stock'),
    categoryId: formData.get('categoryId')?.toString() ?? undefined,
    isActive: formData.get('isActive') === 'true',
  };

  const parsed = ProductFormSchema.safeParse(raw);

  if (!parsed.success) {
    throw new Error(formatZodError(parsed.error));
  }

  return parsed.data;
}

function parseProductVariants(formData: FormData): ProductVariantInput[] {
  const rawVariants = formData.get('variantsJson')?.toString();

  if (!rawVariants) {
    return [];
  }

  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(rawVariants);
  } catch {
    throw new Error('Format varian produk tidak valid.');
  }

  const parsed = z.array(ProductVariantSchema).safeParse(parsedJson);

  if (!parsed.success) {
    throw new Error(formatZodError(parsed.error));
  }

  return parsed.data.map((variant) => ({
    id: variant.id,
    name: variant.name,
    sku: variant.sku || null,
    price: variant.price,
    stock: variant.stock,
  }));
}

async function ensureTenantWriteAccess(userId: string, tenantId: string) {
  await validateTenantAccess(userId, tenantId);
}

async function ensureTenantCanAddProducts(tenantId: string) {
  const tenant = await prisma.tenant.findUnique({
    where: {
      id: tenantId,
    },
    select: {
      status: true,
    },
  });

  if (!tenant) {
    throw new Error('Toko tidak ditemukan.');
  }

  const restrictions = getTenantRestrictions(tenant.status);

  if (!restrictions.canAddProducts) {
    throw new Error('Paket Anda tidak aktif. Perpanjang untuk melanjutkan.');
  }
}

async function ensureTenantCanEditProducts(tenantId: string) {
  const tenant = await prisma.tenant.findUnique({
    where: {
      id: tenantId,
    },
    select: {
      status: true,
    },
  });

  if (!tenant) {
    throw new Error('Toko tidak ditemukan.');
  }

  const restrictions = getTenantRestrictions(tenant.status);

  if (!restrictions.canEditProducts) {
    throw new Error('Paket Anda tidak aktif. Perpanjang untuk melanjutkan.');
  }
}

async function validateCategoryForTenant(tenantId: string, categoryId?: string) {
  if (!categoryId) {
    return true;
  }

  const category = await prisma.productCategory.findFirst({
    where: {
      id: categoryId,
      tenantId,
      isActive: true,
    },
    select: {
      id: true,
    },
  });

  return Boolean(category);
}

async function createProductFromFormData(formData: FormData): Promise<MutationResult> {
  const tenantCtx = await getActiveTenantContext();
  if (tenantCtx.status !== 'SUCCESS' || !tenantCtx.activeTenant || !tenantCtx.userProfile) {
    return { success: false, error: 'Sesi tidak valid atau Anda tidak memiliki akses ke toko ini.' };
  }

  try {
    const tenantId = tenantCtx.activeTenant.id;
    const actorId = tenantCtx.userProfile.id;
    await ensureTenantWriteAccess(actorId, tenantId);
    await ensureTenantCanAddProducts(tenantId);
    const values = parseProductFormData(formData);
    const variants = parseProductVariants(formData);
    const files = getFormFiles(formData);
    validateProductImages(files);

    const isCategoryValid = await validateCategoryForTenant(tenantId, values.categoryId);
    if (!isCategoryValid) {
      return { success: false, error: 'Kategori produk tidak sah, tidak aktif, atau tidak ditemukan.' };
    }

    const policy = await getTenantSubscriptionPolicy(tenantId);
    if (!policy.canCreateProduct) {
      return {
        success: false,
        error: 'Tambah produk sementara dibatasi. Silakan perpanjang paket agar toko aktif kembali.',
      };
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

    const baseSlug = slugify(values.name);
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

    const normalizedVariants =
      variants.length > 0
        ? variants
        : [
            {
              name: 'Standar',
              sku: null,
              price: values.price,
              stock: values.stock,
            },
          ];

    const product = await prisma.$transaction(async (tx) => {
      const newProduct = await tx.product.create({
        data: {
          tenantId,
          categoryId: values.categoryId ?? null,
          name: values.name,
          slug: uniqueSlug,
          description: values.description || '',
          status: values.isActive ? ProductStatus.ACTIVE : ProductStatus.DRAFT,
          basePrice: values.price,
          imageUrl: null,
        },
      });

      return newProduct;
    });

    await createProductVariants(tenantId, product.id, normalizedVariants);

    let imageUrl: string | null = null;

    if (files[0]) {
      imageUrl = await uploadProductImage(tenantId, product.id, files[0]);

      await prisma.product.updateMany({
        where: {
          id: product.id,
          tenantId,
        },
        data: {
          imageUrl,
        },
      });
    }

    await logAuditAction({
      tenantId,
      userId: actorId,
      action: 'CREATE_PRODUCT',
      entityType: 'Product',
      entityId: product.id,
      metadata: {
        productName: product.name,
        basePrice: values.price,
        comparePrice: values.comparePrice ?? null,
        uploadedImageCount: files.length,
        variantCount: normalizedVariants.length,
      },
    });

    revalidatePath('/dashboard/products');
    return { success: true, data: { ...product, imageUrl } };
  } catch (error: unknown) {
    console.error('Error saat menyimpan produk:', error);
    return { success: false, error: getErrorMessage(error) };
  }
}

// ==========================================
// PRODUCT ACTIONS
// ==========================================

export async function createProductAction(input: CreateProductInput | FormData): Promise<MutationResult> {
  if (input instanceof FormData) {
    return createProductFromFormData(input);
  }

  // 1. Dapatkan konteks toko aktif dari server
  const tenantCtx = await getActiveTenantContext();
  if (tenantCtx.status !== 'SUCCESS' || !tenantCtx.activeTenant || !tenantCtx.userProfile) {
    return { success: false, error: 'Sesi tidak valid atau Anda tidak memiliki akses ke toko ini.' };
  }

  const tenantId = tenantCtx.activeTenant.id;
  const actorId = tenantCtx.userProfile.id;
  await ensureTenantWriteAccess(actorId, tenantId);
  await ensureTenantCanAddProducts(tenantId);

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
  const sanitizedDescription = sanitizeProductDescription(input.description);

  if (!sanitizedDescription || sanitizedDescription.length < 5) {
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

  const policy = await getTenantSubscriptionPolicy(tenantId);
  if (!policy.canCreateProduct) {
    return {
      success: false,
      error: 'Tambah produk sementara dibatasi. Silakan perpanjang paket agar toko aktif kembali.',
    };
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
          description: sanitizedDescription,
          status: input.status,
          basePrice: input.basePrice,
          // TODO: In the next phase, migrate file storage to Supabase Storage and save the public URL here.
          imageUrl: input.imageUrl || null,
        },
      });

      // b. Buat entitas ProductVariant
      if (input.variants && input.variants.length > 0) {
        for (const variant of input.variants) {
          await tx.productVariant.create({
            data: {
              tenantId,
              productId: newProduct.id,
              name: variant.name,
              sku: variant.sku?.trim() || null,
              price: variant.price,
              stock: variant.stock,
              weightGram: variant.weightGram,
              isActive: true,
            },
          });
        }
      } else {
        // Fallback default variant
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
      }

      return newProduct;
    });

    await logAuditAction({
      tenantId,
      userId: actorId,
      action: 'CREATE_PRODUCT',
      entityType: 'Product',
      entityId: product.id,
      metadata: {
        productName: product.name,
        basePrice: product.basePrice.toString(),
        sku: input.sku || null,
      },
    });

    revalidatePath('/dashboard/products');
    return { success: true, data: product };
  } catch (err: unknown) {
    console.error('Error saat menyimpan produk:', err);
    return { success: false, error: 'Gagal menyimpan produk ke database.' };
  }
}

export async function editProductAction(
  productId: string,
  input: EditProductInput
): Promise<MutationResult> {
  // 1. Dapatkan konteks toko aktif dari server
  const tenantCtx = await getActiveTenantContext();
  if (tenantCtx.status !== 'SUCCESS' || !tenantCtx.activeTenant || !tenantCtx.userProfile) {
    return { success: false, error: 'Sesi tidak valid atau Anda tidak memiliki akses.' };
  }

  const tenantId = tenantCtx.activeTenant.id;
  const actorId = tenantCtx.userProfile.id;
  await ensureTenantWriteAccess(actorId, tenantId);
  await ensureTenantCanEditProducts(tenantId);

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
  const sanitizedDescription = sanitizeProductDescription(input.description);

  if (!sanitizedDescription || sanitizedDescription.length < 5) {
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
        where: { id: productId, tenantId },
        data: {
          categoryId: input.categoryId || null,
          name: input.name.trim(),
          slug: uniqueSlug,
          description: sanitizedDescription,
          status: input.status,
          basePrice: input.basePrice,
          // TODO: In the next phase, migrate file storage to Supabase Storage and save the public URL here.
          imageUrl: input.imageUrl || null,
        },
      });

      // b. Sync Variants
      if (input.variants && input.variants.length > 0) {
        // Collect IDs of variants we want to keep active
        const keepIds = input.variants.map(v => v.id).filter(Boolean) as string[];

        // Soft-delete (deactivate) other variants of this product of this tenant to preserve order relationships safely
        await tx.productVariant.updateMany({
          where: {
            productId,
            tenantId,
            id: { notIn: keepIds }
          },
          data: {
            isActive: false
          }
        });

        // Upsert sent variants
        for (const variant of input.variants) {
          if (variant.id) {
            // Update existing variant
            await tx.productVariant.updateMany({
              where: { id: variant.id, tenantId, productId },
              data: {
                name: variant.name,
                sku: variant.sku?.trim() || null,
                price: variant.price,
                stock: variant.stock,
                weightGram: variant.weightGram,
                isActive: true, // Make sure it is active
              }
            });
          } else {
            // Create new variant
            await tx.productVariant.create({
              data: {
                tenantId,
                productId,
                name: variant.name,
                sku: variant.sku?.trim() || null,
                price: variant.price,
                stock: variant.stock,
                weightGram: variant.weightGram,
                isActive: true,
              }
            });
          }
        }
      } else {
        // Fallback default variant
        const variantDefault = await tx.productVariant.findFirst({
          where: { productId, tenantId, name: 'Standar' }
        });

        if (variantDefault) {
            await tx.productVariant.updateMany({
              where: { id: variantDefault.id, tenantId, productId },
            data: {
              sku: input.sku?.trim() || null,
              price: input.basePrice,
              stock: input.stock,
              weightGram: input.weightGram,
              isActive: true,
            }
          });

          // Soft-delete any other variants
          await tx.productVariant.updateMany({
            where: {
              productId,
              tenantId,
              id: { not: variantDefault.id }
            },
            data: {
              isActive: false
            }
          });
        } else {
          const firstVariant = await tx.productVariant.findFirst({
            where: { productId, tenantId }
          });

          if (firstVariant) {
            await tx.productVariant.updateMany({
              where: { id: firstVariant.id, tenantId, productId },
              data: {
                sku: input.sku?.trim() || null,
                price: input.basePrice,
                stock: input.stock,
                weightGram: input.weightGram,
                isActive: true,
              }
            });

            // Soft-delete other variants
            await tx.productVariant.updateMany({
              where: {
                productId,
                tenantId,
                id: { not: firstVariant.id }
              },
              data: {
                isActive: false
              }
            });
          } else {
            // Jika belum ada variant sama sekali, buat baru
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
      }

      return updatedProduct;
    });

    await logAuditAction({
      tenantId,
      userId: actorId,
      action: 'UPDATE_PRODUCT',
      entityType: 'Product',
      entityId: productId,
      metadata: {
        productName: product.name,
        basePrice: product.basePrice.toString(),
        status: product.status,
      },
    });

    revalidatePath('/dashboard/products');
    return { success: true, data: product };
  } catch (err: unknown) {
    console.error('Error saat memperbarui produk:', err);
    return { success: false, error: 'Gagal memperbarui produk ke database.' };
  }
}

export async function updateProductAction(productId: string, formData: FormData): Promise<MutationResult> {
  const tenantCtx = await getActiveTenantContext();
  if (tenantCtx.status !== 'SUCCESS' || !tenantCtx.activeTenant || !tenantCtx.userProfile) {
    return { success: false, error: 'Sesi tidak valid atau Anda tidak memiliki akses ke toko ini.' };
  }

  try {
    const tenantId = tenantCtx.activeTenant.id;
    const actorId = tenantCtx.userProfile.id;
    await ensureTenantWriteAccess(actorId, tenantId);
    await ensureTenantCanEditProducts(tenantId);
    const values = parseProductFormData(formData);
    const variants = parseProductVariants(formData);
    const files = getFormFiles(formData);
    validateProductImages(files);

    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        tenantId,
      },
      include: {
        variants: {
          where: {
            tenantId,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!product) {
      return { success: false, error: 'Produk tidak ditemukan atau bukan milik toko Anda.' };
    }

    const isCategoryValid = await validateCategoryForTenant(tenantId, values.categoryId);
    if (!isCategoryValid) {
      return { success: false, error: 'Kategori produk tidak sah, tidak aktif, atau tidak ditemukan.' };
    }

    let nextImageUrl = product.imageUrl;

    if (files[0]) {
      nextImageUrl = await uploadProductImage(tenantId, productId, files[0]);
    }

    const normalizedVariants =
      variants.length > 0
        ? variants
        : [
            {
              id: product.variants[0]?.id,
              name: 'Standar',
              sku: product.variants[0]?.sku ?? null,
              price: values.price,
              stock: values.stock,
            },
          ];

    await prisma.$transaction(async (tx) => {
      await tx.product.updateMany({
        where: {
          id: productId,
          tenantId,
        },
        data: {
          categoryId: values.categoryId ?? null,
          name: values.name,
          description: values.description || '',
          status: values.isActive ? ProductStatus.ACTIVE : ProductStatus.DRAFT,
          basePrice: values.price,
          imageUrl: nextImageUrl,
        },
      });

    });

    await updateProductVariants(tenantId, productId, normalizedVariants);

    if (files[0] && product.imageUrl) {
      await deleteProductImage(product.imageUrl);
    }

    await logAuditAction({
      tenantId,
      userId: actorId,
      action: 'UPDATE_PRODUCT',
      entityType: 'Product',
      entityId: productId,
      metadata: {
        productName: values.name,
        basePrice: values.price,
        comparePrice: values.comparePrice ?? null,
        uploadedImageCount: files.length,
        variantCount: normalizedVariants.length,
      },
    });

    revalidatePath('/dashboard/products');
    revalidatePath(`/dashboard/products/${productId}/edit`);
    return { success: true };
  } catch (error: unknown) {
    console.error('Error saat memperbarui produk:', error);
    return { success: false, error: getErrorMessage(error) };
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
  await ensureTenantWriteAccess(actorId, tenantId);
  await ensureTenantCanEditProducts(tenantId);

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
      await tx.product.updateMany({
        where: { id: productId, tenantId },
        data: { status: ProductStatus.ARCHIVED }
      });

      // Nonaktifkan seluruh varian terkait
      await tx.productVariant.updateMany({
        where: { productId, tenantId },
        data: { isActive: false }
      });

    });

    await logAuditAction({
      tenantId,
      userId: actorId,
      action: 'DEACTIVATE_PRODUCT',
      entityType: 'Product',
      entityId: productId,
      metadata: {
        productName: existingProduct.name,
      },
    });

    revalidatePath('/dashboard/products');
    return { success: true };
  } catch (err: unknown) {
    console.error('Error saat menonaktifkan produk:', err);
    return { success: false, error: 'Gagal menonaktifkan produk.' };
  }
}

export async function deleteProductAction(productId: string): Promise<MutationResult> {
  const tenantCtx = await getActiveTenantContext();
  if (tenantCtx.status !== 'SUCCESS' || !tenantCtx.activeTenant || !tenantCtx.userProfile) {
    return { success: false, error: 'Sesi tidak valid atau Anda tidak memiliki akses ke toko ini.' };
  }

  try {
    const tenantId = tenantCtx.activeTenant.id;
    const actorId = tenantCtx.userProfile.id;
    await ensureTenantWriteAccess(actorId, tenantId);
    await ensureTenantCanEditProducts(tenantId);

    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        tenantId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    const result = await deleteProduct(tenantId, productId);

    if (result.count === 0) {
      return { success: false, error: 'Produk tidak ditemukan atau bukan milik toko Anda.' };
    }

    await logAuditAction({
      tenantId,
      userId: actorId,
      action: 'DELETE_PRODUCT',
      entityType: 'Product',
      entityId: productId,
      metadata: {
        productName: product?.name ?? null,
      },
    });

    revalidatePath('/dashboard/products');
    return { success: true };
  } catch (error: unknown) {
    console.error('Error saat menghapus produk:', error);
    return { success: false, error: 'Gagal menghapus produk.' };
  }
}

export async function toggleStatusAction(productId: string): Promise<MutationResult> {
  const tenantCtx = await getActiveTenantContext();
  if (tenantCtx.status !== 'SUCCESS' || !tenantCtx.activeTenant || !tenantCtx.userProfile) {
    return { success: false, error: 'Sesi tidak valid atau Anda tidak memiliki akses ke toko ini.' };
  }

  try {
    const tenantId = tenantCtx.activeTenant.id;
    const actorId = tenantCtx.userProfile.id;
    await ensureTenantWriteAccess(actorId, tenantId);
    await ensureTenantCanEditProducts(tenantId);

    const result = await toggleProductStatus(tenantId, productId);

    if (result.count === 0) {
      return { success: false, error: 'Produk tidak ditemukan atau bukan milik toko Anda.' };
    }

    await logAuditAction({
      tenantId,
      userId: actorId,
      action: 'TOGGLE_PRODUCT_STATUS',
      entityType: 'Product',
      entityId: productId,
      metadata: {
        affectedRows: result.count,
      },
    });

    revalidatePath('/dashboard/products');
    return { success: true };
  } catch (error: unknown) {
    console.error('Error saat mengubah status produk:', error);
    return { success: false, error: 'Gagal mengubah status produk.' };
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
  await ensureTenantWriteAccess(actorId, tenantId);

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
    const sanitizedCategoryDescription = input.description
      ? sanitizePlainText(input.description)
      : null;
    const category = await prisma.$transaction(async (tx) => {
      const newCategory = await tx.productCategory.create({
        data: {
          tenantId,
          name: input.name.trim(),
          slug: uniqueSlug,
          description: sanitizedCategoryDescription || null,
          sortOrder: input.sortOrder || 0,
          isActive: true,
        }
      });

      return newCategory;
    });

    await logAuditAction({
      tenantId,
      userId: actorId,
      action: 'CREATE_CATEGORY',
      entityType: 'ProductCategory',
      entityId: category.id,
      metadata: {
        categoryName: category.name,
      },
    });

    revalidatePath('/dashboard/products/categories');
    revalidatePath('/dashboard/products');
    return { success: true, data: category };
  } catch (err: unknown) {
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
  await ensureTenantWriteAccess(actorId, tenantId);

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
    const sanitizedCategoryDescription = input.description
      ? sanitizePlainText(input.description)
      : null;
    const category = await prisma.$transaction(async (tx) => {
      const updatedCategory = await tx.productCategory.update({
        where: { id: categoryId, tenantId },
        data: {
          name: input.name.trim(),
          slug: uniqueSlug,
          description: sanitizedCategoryDescription || null,
          sortOrder: input.sortOrder || 0,
        }
      });

      return updatedCategory;
    });

    await logAuditAction({
      tenantId,
      userId: actorId,
      action: 'UPDATE_CATEGORY',
      entityType: 'ProductCategory',
      entityId: categoryId,
      metadata: {
        categoryName: category.name,
      },
    });

    revalidatePath('/dashboard/products/categories');
    revalidatePath('/dashboard/products');
    return { success: true, data: category };
  } catch (err: unknown) {
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
  await ensureTenantWriteAccess(actorId, tenantId);

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
        where: { id: categoryId, tenantId },
        data: { isActive: false }
      });

    });

    await logAuditAction({
      tenantId,
      userId: actorId,
      action: 'DEACTIVATE_CATEGORY',
      entityType: 'ProductCategory',
      entityId: categoryId,
      metadata: {
        categoryName: existingCategory.name,
      },
    });

    revalidatePath('/dashboard/products/categories');
    revalidatePath('/dashboard/products');
    return { success: true };
  } catch (err: unknown) {
    console.error('Error saat menonaktifkan kategori:', err);
    return { success: false, error: 'Gagal menonaktifkan kategori.' };
  }
}

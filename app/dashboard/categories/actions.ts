'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getActiveTenantContext } from '@/lib/auth/tenant-access';
import { validateTenantAccess } from '@/lib/auth/validate-tenant-access';
import { logAuditAction } from '@/lib/audit/log-action';
import { createCategory, deleteCategory, updateCategory } from '@/lib/data-access/categories';

const CategorySchema = z.object({
  name: z.string().trim().min(2, 'Nama kategori minimal 2 karakter.').max(120, 'Nama kategori maksimal 120 karakter.'),
  slug: z
    .string()
    .trim()
    .min(2, 'Slug kategori minimal 2 karakter.')
    .max(140, 'Slug kategori maksimal 140 karakter.')
    .regex(/^[a-z0-9-]+$/, 'Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung.'),
});

export interface CategoryMutationResult {
  success: boolean;
  error?: string;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Kategori gagal diproses.';
}

async function getTenantWriteContext() {
  const tenantCtx = await getActiveTenantContext();

  if (tenantCtx.status !== 'SUCCESS' || !tenantCtx.activeTenant || !tenantCtx.userProfile) {
    throw new Error('Sesi tidak valid atau Anda tidak memiliki akses ke toko ini.');
  }

  await validateTenantAccess(tenantCtx.userProfile.id, tenantCtx.activeTenant.id);

  return {
    tenantId: tenantCtx.activeTenant.id,
    userId: tenantCtx.userProfile.id,
  };
}

export async function createCategoryAction(input: unknown): Promise<CategoryMutationResult> {
  try {
    const { tenantId, userId } = await getTenantWriteContext();
    const data = CategorySchema.parse(input);

    const category = await createCategory(tenantId, data);
    await logAuditAction({
      tenantId,
      userId,
      action: 'CREATE_CATEGORY',
      entityType: 'ProductCategory',
      entityId: category.id,
      metadata: {
        categoryName: category.name,
        slug: category.slug,
      },
    });

    revalidatePath('/dashboard/categories');
    revalidatePath('/dashboard/products');

    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateCategoryAction(
  categoryId: string,
  input: unknown
): Promise<CategoryMutationResult> {
  try {
    const { tenantId, userId } = await getTenantWriteContext();
    const data = CategorySchema.parse(input);
    const result = await updateCategory(tenantId, categoryId, data);

    if (result.count === 0) {
      return { success: false, error: 'Kategori tidak ditemukan atau bukan milik toko Anda.' };
    }

    await logAuditAction({
      tenantId,
      userId,
      action: 'UPDATE_CATEGORY',
      entityType: 'ProductCategory',
      entityId: categoryId,
      metadata: {
        categoryName: data.name,
        slug: data.slug,
        affectedRows: result.count,
      },
    });

    revalidatePath('/dashboard/categories');
    revalidatePath('/dashboard/products');

    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function deleteCategoryAction(categoryId: string): Promise<CategoryMutationResult> {
  try {
    const { tenantId, userId } = await getTenantWriteContext();
    const result = await deleteCategory(tenantId, categoryId);

    if (result.count === 0) {
      return { success: false, error: 'Kategori tidak ditemukan atau bukan milik toko Anda.' };
    }

    await logAuditAction({
      tenantId,
      userId,
      action: 'DELETE_CATEGORY',
      entityType: 'ProductCategory',
      entityId: categoryId,
      metadata: {
        affectedRows: result.count,
      },
    });

    revalidatePath('/dashboard/categories');
    revalidatePath('/dashboard/products');

    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

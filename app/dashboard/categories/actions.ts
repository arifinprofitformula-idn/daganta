'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getActiveTenantContext } from '@/lib/auth/tenant-access';
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

async function getTenantId() {
  const tenantCtx = await getActiveTenantContext();

  if (tenantCtx.status !== 'SUCCESS' || !tenantCtx.activeTenant) {
    throw new Error('Sesi tidak valid atau Anda tidak memiliki akses ke toko ini.');
  }

  return tenantCtx.activeTenant.id;
}

export async function createCategoryAction(input: unknown): Promise<CategoryMutationResult> {
  try {
    const tenantId = await getTenantId();
    const data = CategorySchema.parse(input);

    await createCategory(tenantId, data);
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
    const tenantId = await getTenantId();
    const data = CategorySchema.parse(input);
    const result = await updateCategory(tenantId, categoryId, data);

    if (result.count === 0) {
      return { success: false, error: 'Kategori tidak ditemukan atau bukan milik toko Anda.' };
    }

    revalidatePath('/dashboard/categories');
    revalidatePath('/dashboard/products');

    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function deleteCategoryAction(categoryId: string): Promise<CategoryMutationResult> {
  try {
    const tenantId = await getTenantId();
    const result = await deleteCategory(tenantId, categoryId);

    if (result.count === 0) {
      return { success: false, error: 'Kategori tidak ditemukan atau bukan milik toko Anda.' };
    }

    revalidatePath('/dashboard/categories');
    revalidatePath('/dashboard/products');

    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

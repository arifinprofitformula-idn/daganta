import React from 'react';
import { getCategoriesByTenantId } from '@/lib/data-access/products';
import { getActiveTenantContext } from '@/lib/auth/tenant-access';
import { CategoryManager } from '@/components/dashboard/category-manager';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  // 1. Dapatkan konteks toko aktif secara aman di server
  const tenantCtx = await getActiveTenantContext();
  if (tenantCtx.status !== 'SUCCESS' || !tenantCtx.activeTenant) {
    return null; // Layout induk sudah menangani AccountAccessState
  }

  const tenant = tenantCtx.activeTenant;

  // 2. Ambil seluruh kategori milik tenantId aktif (aktif maupun nonaktif untuk dashboard)
  const categories = await getCategoriesByTenantId(tenant.id);

  return (
    <CategoryManager
      initialCategories={categories}
      tenantName={tenant.name}
    />
  );
}

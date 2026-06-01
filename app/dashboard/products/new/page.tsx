import React from 'react';
import { getCategoriesByTenantId } from '@/lib/data-access/products';
import { getActiveTenantContext } from '@/lib/auth/tenant-access';
import { ProductForm } from '@/components/dashboard/product-form';

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  // 1. Dapatkan konteks toko aktif secara aman di server
  const tenantCtx = await getActiveTenantContext();
  if (tenantCtx.status !== 'SUCCESS' || !tenantCtx.activeTenant) {
    return null; // Layout induk sudah menangani AccountAccessState
  }

  const tenant = tenantCtx.activeTenant;

  // 2. Ambil hanya kategori AKTIF milik tenant untuk pilihan form produk baru
  const activeCategories = await getCategoriesByTenantId(tenant.id, true);

  return (
    <div className="max-w-5xl mx-auto">
      <ProductForm categories={activeCategories} />
    </div>
  );
}

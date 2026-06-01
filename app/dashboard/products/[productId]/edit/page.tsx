import React from 'react';
import { notFound } from 'next/navigation';
import { getCategoriesByTenantId, getProductById } from '@/lib/data-access/products';
import { getActiveTenantContext } from '@/lib/auth/tenant-access';
import { ProductForm } from '@/components/dashboard/product-form';

export const dynamic = 'force-dynamic';

interface EditProductPageProps {
  params: Promise<{ productId: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  // 1. Parsing params asinkron sesuai standar Next.js 15
  const { productId } = await params;

  // 2. Dapatkan konteks toko aktif
  const tenantCtx = await getActiveTenantContext();
  if (tenantCtx.status !== 'SUCCESS' || !tenantCtx.activeTenant) {
    return null; // Layout induk sudah menangani AccountAccessState
  }

  const tenant = tenantCtx.activeTenant;

  // 3. Ambil data produk berdasarkan ID dan Tenant secara terisolasi penuh
  const product = await getProductById(tenant.id, productId);
  if (!product) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 bg-slate-900 border border-slate-850 rounded-2xl p-8">
        <h3 className="font-bold text-slate-200 text-sm">Produk Tidak Ditemukan</h3>
        <p className="text-slate-400 text-xs">
          Produk yang Anda cari tidak ditemukan atau bukan milik toko aktif Anda.
        </p>
      </div>
    );
  }

  // 4. Ambil kategori aktif milik tenant
  const activeCategories = await getCategoriesByTenantId(tenant.id, true);

  return (
    <div className="max-w-5xl mx-auto">
      <ProductForm categories={activeCategories} initialData={product} />
    </div>
  );
}

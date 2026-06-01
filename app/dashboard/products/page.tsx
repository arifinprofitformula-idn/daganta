import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Plus, Sparkles, FolderOpen } from 'lucide-react';
import { getDashboardProductsByTenantId } from '@/lib/data-access/products';
import { getActiveTenantContext } from '@/lib/auth/tenant-access';
import { ProductStatusBadge } from '@/components/dashboard/product-status-badge';
import { ProductListRowActions } from '@/components/dashboard/product-list-row-actions';

export const dynamic = 'force-dynamic';

// Format Price helper
const formatRupiah = (value: any) => {
  const numericValue = typeof value === 'number' ? value : Number(value);
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericValue);
};

export default async function ProductsPage() {
  // 1. Dapatkan konteks toko aktif dari server
  const tenantCtx = await getActiveTenantContext();
  if (tenantCtx.status !== 'SUCCESS' || !tenantCtx.activeTenant) {
    return null; // Layout induk sudah menangani AccountAccessState
  }

  const tenant = tenantCtx.activeTenant;

  // 2. Ambil seluruh produk dasbor secara terisolasi penuh berbasis tenantId
  const products = await getDashboardProductsByTenantId(tenant.id);

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-5">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Produk Saya</h1>
          <p className="text-xs text-slate-500 mt-1">Daftar dan kelola semua produk aktif, draf, dan spesifikasi di etalase toko Anda</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/products/categories"
            className="inline-flex items-center gap-2 py-2.5 px-4 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-350 hover:text-white text-xs font-bold rounded-xl transition-all"
          >
            <FolderOpen className="w-4 h-4 shrink-0 text-indigo-400" />
            <span>Kategori Produk</span>
          </Link>
          <Link
            href="/dashboard/products/new"
            className="inline-flex items-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/15 transition-all"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Tambah Produk</span>
          </Link>
        </div>
      </div>

      {/* Warning Alert: Internal Demo Mode */}
      <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-slate-200">Mode Demo Internal — belum menggunakan role final.</h4>
          <p className="text-[10px] text-slate-400 leading-normal">
            Halaman ini menampilkan produk nyata dari database lokal yang disaring untuk toko aktif <span className="text-indigo-350 font-extrabold">{tenant.name}</span> secara otomatis. Pengeditan dan penonaktifan produk akan langsung merefleksikan perubahan di database.
          </p>
        </div>
      </div>

      {/* Product List Grid/Table */}
      {products.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 bg-slate-900 border border-slate-850 rounded-2xl p-8">
          <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-900 flex items-center justify-center text-slate-650">
            <ShoppingBag className="w-6 h-6 shrink-0" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-200 text-sm">Belum Ada Produk</h3>
            <p className="text-slate-400 text-xs">
              Toko ini belum menambahkan produk ke dalam etalase storefront mereka. Mulai tambahkan dengan tombol di atas.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-850 text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">
                  <th className="px-6 py-4">Nama Produk</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4">Harga Dasar</th>
                  <th className="px-6 py-4">Stok</th>
                  <th className="px-6 py-4">SKU</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-xs">
                {products.map((p) => {
                  const defaultVariant = p.variants?.[0] || null;
                  return (
                    <tr key={p.id} className="hover:bg-slate-850/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-200 select-all max-w-[200px] truncate" title={p.name}>
                        {p.name}
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {p.category?.name || <span className="text-slate-650 italic text-[10px]">Tanpa Kategori</span>}
                      </td>
                      <td className="px-6 py-4 font-bold text-indigo-400 select-all">{formatRupiah(p.basePrice)}</td>
                      <td className="px-6 py-4 font-bold text-slate-300">
                        {defaultVariant ? defaultVariant.stock : 0}
                      </td>
                      <td className="px-6 py-4 text-slate-450 font-mono text-[10px] select-all">
                        {defaultVariant?.sku || <span className="text-slate-700 italic">-</span>}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <ProductStatusBadge status={p.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <ProductListRowActions
                          productId={p.id}
                          productName={p.name}
                          status={p.status}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

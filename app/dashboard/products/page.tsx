import React from 'react';
import { ShoppingBag, Eye, Plus, Sparkles } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getProductsByTenantId } from '@/lib/data-access/products';

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

export default async function Page() {
  // 1. Fetch Tenant dynamically based on subdomain
  const tenant = await prisma.tenant.findUnique({
    where: { subdomain: 'toyanusantara' }
  });

  // 2. Fetch products for this tenant
  const products = tenant ? await getProductsByTenantId(tenant.id) : [];

  return (
    <div className="space-y-6 select-none">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-5">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Kelola Produk</h1>
          <p className="text-xs text-slate-500 mt-1">Daftar semua produk aktif yang dipublikasikan di etalase toko Anda</p>
        </div>

        {/* Action Button: Placeholder Non-functional */}
        <button
          type="button"
          disabled
          className="inline-flex items-center gap-2 py-2.5 px-4 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold rounded-xl cursor-not-allowed select-none"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>Tambah Produk</span>
        </button>
      </div>

      {/* Warning Alert: Internal Demo Mode */}
      <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-slate-200">Mode Demo Internal</h4>
          <p className="text-[10px] text-slate-400 leading-normal">
            Halaman ini menampilkan produk nyata dari database lokal yang disaring untuk **Toya Nusantara** secara otomatis. Penambahan, pengeditan, atau penghapusan produk dinonaktifkan dalam mode draf visual ini.
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
              Toko ini belum menambahkan produk aktif ke dalam etalase storefront mereka.
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
                  <th className="px-6 py-4">Deskripsi Singkat</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-xs">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-850/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-200 select-all">{p.name}</td>
                    <td className="px-6 py-4 text-slate-400">
                      {p.category?.name || <span className="text-slate-650 italic text-[10px]">Tanpa Kategori</span>}
                    </td>
                    <td className="px-6 py-4 font-bold text-indigo-400 select-all">{formatRupiah(p.basePrice)}</td>
                    <td className="px-6 py-4 text-slate-450 truncate max-w-[240px]" title={p.description}>
                      {p.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex px-2 py-0.5 rounded bg-emerald-950/30 text-emerald-400 border border-emerald-500/10 font-bold text-[9px]">
                        Aktif
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {/* Action Button: Non-functional Placeholder */}
                      <button
                        type="button"
                        disabled
                        className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded-lg text-[10px] font-semibold cursor-not-allowed select-none transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Detail</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { CheckCircle, Sparkles } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getActiveTenantContext } from '@/lib/auth/tenant-access';

export const dynamic = 'force-dynamic';

export default async function Page() {
  // 1. Dapatkan konteks toko aktif dari membership pengguna sesi
  const tenantCtx = await getActiveTenantContext();
  if (tenantCtx.status !== 'SUCCESS' || !tenantCtx.activeTenant) {
    return null; // Layout induk sudah menangani AccountAccessState
  }

  const tenant = tenantCtx.activeTenant;

  // 2. Hitung jumlah produk nyata dari database untuk toko ini
  const productCount = await prisma.product.count({
    where: { tenantId: tenant.id }
  });

  return (
    <div className="space-y-6 select-none">
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-5">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Paket Langganan</h1>
          <p className="text-xs text-slate-500 mt-1">Pantau masa aktif toko, biaya langganan, dan sisa limit kuota katalog Anda</p>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Plan summary card */}
        <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 md:col-span-2 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-950 pb-4">
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-500/10">
                Paket Langganan
              </span>
              <h2 className="text-lg font-extrabold text-white">Daganta PRO</h2>
            </div>
            
            <div className="text-right">
              <span className="text-xs text-slate-500 block leading-tight">Biaya Langganan</span>
              <span className="text-base font-extrabold text-indigo-455 select-all">Rp 149.000 <span className="text-[10px] text-slate-500 font-normal">/ bulan</span></span>
            </div>
          </div>

          {/* Details list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Status Paket', val: 'Aktif', active: true },
              { label: 'Masa Aktif Hingga', val: '01 Juli 2026', desc: 'Gracely Renewal' },
              { label: 'Sistem Pembayaran', val: 'WhatsApp Billing / Manual Transfer' },
              { label: 'Batas Produk Maksimal', val: '100 Produk', detail: `Saat ini terisi ${productCount} produk` }
            ].map((d, idx) => (
              <div key={idx} className="p-3.5 bg-slate-950/50 border border-slate-950 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-500 font-bold block">{d.label}</span>
                <span className={`text-xs font-extrabold block 
                  ${d.active ? 'text-emerald-450' : 'text-slate-200'}`}
                >
                  {d.val}
                </span>
                {d.detail && <span className="text-[9px] text-slate-500 font-medium block">{d.detail}</span>}
              </div>
            ))}
          </div>

          {/* Action button placeholder */}
          <div className="pt-2">
            <button
              type="button"
              disabled
              className="py-2.5 px-4 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold rounded-xl cursor-not-allowed select-none transition-colors"
            >
              Perpanjang Paket Langganan
            </button>
          </div>
        </div>

        {/* Feature Checkmarks Card */}
        <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-950 pb-4 text-indigo-400">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <h3 className="font-bold text-sm text-slate-100">Fitur Daganta PRO</h3>
            </div>

            <ul className="space-y-2 text-[10px] text-slate-400">
              {[
                'WhatsApp-First Order Processing',
                'Custom Domain Setup (Controlled Beta)',
                'Hingga 5 Anggota Tim / Staff',
                'Analitik Kunjungan Sederhana',
                'Kategori Produk Tak Terbatas'
              ].map((feat, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-indigo-550 font-extrabold select-none">•</span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-3 bg-indigo-950/20 border border-indigo-500/20 rounded-xl flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <span className="text-[9px] text-slate-450 leading-normal">
              Semua fitur paket PRO aktif otomatis untuk membantu UMKM bertumbuh mandiri.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Users, UserPlus } from 'lucide-react';
import { getActiveTenantContext } from '@/lib/auth/tenant-access';

export const dynamic = 'force-dynamic';

export default async function Page() {
  // Defensive auth check
  const tenantCtx = await getActiveTenantContext();
  if (tenantCtx.status !== 'SUCCESS' || !tenantCtx.activeTenant) {
    return null;
  }

  return (
    <div className="space-y-6 select-none">
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-5">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Daftar Pelanggan</h1>
          <p className="text-xs text-slate-500 mt-1">Daftar pelanggan terdaftar yang pernah melakukan transaksi di toko online Anda</p>
        </div>

        {/* Action Placeholder */}
        <button
          type="button"
          disabled
          className="inline-flex items-center gap-2 py-2 px-3 bg-slate-900 border border-slate-800 text-slate-400 text-[10px] font-bold rounded-lg cursor-not-allowed select-none"
        >
          <UserPlus className="w-3.5 h-3.5 shrink-0" />
          <span>Tambah Manual</span>
        </button>
      </div>

      {/* Empty State */}
      <div className="py-24 flex flex-col items-center justify-center text-center space-y-5 max-w-md mx-auto bg-slate-900 border border-slate-850 rounded-2xl p-8 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 shadow-inner">
          <Users className="w-6 h-6 shrink-0" />
        </div>
        <div className="space-y-2">
          <h3 className="font-bold text-slate-200 text-sm">Belum Ada Pelanggan</h3>
          <p className="text-slate-450 text-[11px] leading-relaxed">
            Data diri pelanggan (nama, nomor WhatsApp, alamat pengiriman) yang berbelanja secara otomatis tersimpan di sini untuk mempermudah strategi pemasaran ulang (*re-marketing*) produk Anda.
          </p>
        </div>
      </div>
    </div>
  );
}

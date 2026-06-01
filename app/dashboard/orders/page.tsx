import React from 'react';
import { ShoppingCart, RefreshCw } from 'lucide-react';

export default function Page() {
  return (
    <div className="space-y-6 select-none">
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-5">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Pesanan Masuk</h1>
          <p className="text-xs text-slate-500 mt-1">Daftar seluruh pesanan pembeli yang terhubung dengan WhatsApp toko Anda</p>
        </div>

        {/* Refresh Placeholder */}
        <button
          type="button"
          disabled
          className="inline-flex items-center gap-2 py-2 px-3 bg-slate-900 border border-slate-800 text-slate-400 text-[10px] font-bold rounded-lg cursor-not-allowed select-none"
        >
          <RefreshCw className="w-3.5 h-3.5 shrink-0" />
          <span>Muat Ulang</span>
        </button>
      </div>

      {/* Empty State */}
      <div className="py-24 flex flex-col items-center justify-center text-center space-y-5 max-w-md mx-auto bg-slate-900 border border-slate-850 rounded-2xl p-8 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 shadow-inner">
          <ShoppingCart className="w-6 h-6 shrink-0" />
        </div>
        <div className="space-y-2">
          <h3 className="font-bold text-slate-200 text-sm">Belum Ada Pesanan</h3>
          <p className="text-slate-450 text-[11px] leading-relaxed">
            Saat ini toko Anda belum menerima transaksi pembelian apa pun. Semua pesanan yang dikirimkan pembeli melalui tombol "Beli via WhatsApp" di storefront akan muncul di sini.
          </p>
        </div>
      </div>
    </div>
  );
}

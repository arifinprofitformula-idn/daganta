import React from 'react';
import { 
  ShoppingBag, 
  ShoppingCart, 
  Users, 
  Activity,
  ArrowUpRight
} from 'lucide-react';
import { getDashboardSummaryBySubdomain } from '@/lib/data-access/dashboard';
import StatCard from '@/components/dashboard/stat-card';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const summary = await getDashboardSummaryBySubdomain('toyanusantara');
  
  const productCount = summary?.productCount ?? 0;
  const orderCount = summary?.orderCount ?? 0;
  const customerCount = summary?.customerCount ?? 0;
  const storeStatus = summary?.tenant.status === 'ACTIVE' ? 'Aktif' : 'Nonaktif';

  return (
    <div className="space-y-8 select-none">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-950/40 via-violet-950/20 to-slate-950 border border-slate-900 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between space-y-4">
        {/* Glow overlay */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="space-y-2 relative">
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-950/80 px-3 py-1 rounded-full border border-indigo-500/10">Selamat Datang</span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-snug">
            Halo Arifin, selamat datang kembali!
          </h1>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            Semua aktivitas toko Anda hari ini berjalan dengan lancar. Kelola produk, lihat pesanan baru dari WhatsApp, dan pantau pelanggan setia Anda dengan mudah dari panel terpusat.
          </p>
        </div>
      </div>

      {/* Grid Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Daftar Produk" 
          value={productCount} 
          description="Jumlah total produk aktif di etalase" 
          icon={ShoppingBag}
          trend="+3 baru"
        />
        <StatCard 
          title="Total Pesanan" 
          value={orderCount} 
          description="Pesanan WhatsApp yang masuk" 
          icon={ShoppingCart}
          trend="0 bulan ini"
        />
        <StatCard 
          title="Pelanggan" 
          value={customerCount} 
          description="Jumlah pembeli terdaftar" 
          icon={Users}
          trend="0 total"
        />
        <StatCard 
          title="Status Toko" 
          value={storeStatus} 
          description="Kondisi visibilitas etalase Anda" 
          icon={Activity}
          trend="Normal"
          isPositive={summary?.tenant.status === 'ACTIVE'}
        />
      </div>

      {/* Quick Actions & Recent Activities Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick action card */}
        <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-950 pb-4">
            <h3 className="font-bold text-sm text-slate-100">Langkah Cepat Pemula</h3>
            <span className="text-[10px] text-slate-500 font-medium">Panduan UMKM</span>
          </div>

          <div className="space-y-3">
            {[
              { id: 1, text: 'Tambah produk pertama Anda', desc: 'Isi detail produk, foto, dan harga dasar.', active: true },
              { id: 2, text: 'Konfigurasi nomor WhatsApp toko', desc: 'Pesanan akan langsung diarahkan ke nomor ini.', active: false },
              { id: 3, text: 'Desain banner etalase Anda', desc: 'Buat tampilan storefront Anda menarik pelanggan.', active: false }
            ].map((step) => (
              <div key={step.id} className="flex gap-4 p-3.5 bg-slate-950/40 border border-slate-950 hover:border-slate-850 rounded-xl transition-all">
                <div className={`w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center border shrink-0 mt-0.5
                  ${step.active 
                    ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400' 
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  {step.id}
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-200">{step.text}</h4>
                  <p className="text-[10px] text-slate-500 leading-normal">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Info/Tips */}
        <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-950 pb-4 text-indigo-400">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <h3 className="font-bold text-sm text-slate-100">Tips Hari Ini</h3>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-200">Gunakan Foto Produk Jelas</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Toko online dengan gambar produk berkualitas tinggi dan deskripsi detail terbukti meningkatkan transaksi WhatsApp-first commerce hingga 40%. Pastikan pencahayaan produk Anda cukup sebelum memotret.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-950">
            <a 
              href="https://daganta.id" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between text-[10px] text-indigo-400 hover:text-indigo-300 font-bold transition-colors group"
            >
              <span>Pelajari Fitur Lengkap Daganta</span>
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

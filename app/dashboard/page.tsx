import React from 'react';
import {
  ShoppingBag,
  ShoppingCart,
  Users,
  Activity,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Check,
  AlertCircle,
  Eye,
  DollarSign,
  Calendar,
  Sparkles,
  MessageSquare,
  Camera,
  Target
} from 'lucide-react';
import { getDashboardSummaryByTenantId } from '@/lib/data-access/dashboard';
import { getActiveTenantContext } from '@/lib/auth/tenant-access';
import StatCard from '@/components/dashboard/stat-card';

export const dynamic = 'force-dynamic';

export default async function Page() {
  // 1. Dapatkan konteks toko aktif dari membership pengguna sesi
  const tenantCtx = await getActiveTenantContext();
  if (tenantCtx.status !== 'SUCCESS' || !tenantCtx.activeTenant) {
    return null; // Layout induk sudah menangani AccountAccessState
  }

  const tenantId = tenantCtx.activeTenant.id;
  const tenantName = tenantCtx.activeTenant.name;

  // 2. Ambil ringkasan statistik toko dari database
  const summary = await getDashboardSummaryByTenantId(tenantId);

  const productCount = summary?.productCount ?? 0;
  const orderCount = summary?.orderCount ?? 0;
  const customerCount = summary?.customerCount ?? 0;
  const isStoreActive = summary?.tenant.status === 'ACTIVE';

  // 3. Nama pengguna dinamis dari profil atau pecahan email
  const userName = tenantCtx.userProfile?.name || tenantCtx.user?.email?.split('@')[0] || 'Mitra';

  // 4. Hitung sapaan dinamis berdasarkan jam lokal server
  const now = new Date();
  const hours = now.getHours();
  let greeting = 'Selamat Pagi';
  if (hours >= 12 && hours < 15) {
    greeting = 'Selamat Siang';
  } else if (hours >= 15 && hours < 19) {
    greeting = 'Selamat Sore';
  } else if (hours >= 19 || hours < 4) {
    greeting = 'Selamat Malam';
  }

  return (
    <div className="space-y-8 select-none font-sans pb-10">

      {/* SECTION 1: BUSINESS OVERVIEW HERO */}
      <div className="bg-gradient-to-br from-white via-slate-50 to-[#EEF6FF] border border-brand-border rounded-3xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.015)] relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8">
        {/* Soft background color glows */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-brand-blue/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-10 left-1/3 w-60 h-60 bg-brand-teal/5 rounded-full blur-[90px] pointer-events-none" />

        <div className="space-y-5 relative z-10 flex-1">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-brand-border rounded-full text-[10px] font-bold text-brand-blue shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-brand-teal" />
              Dasbor Bisnis Mandiri
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-brand-navy">
              {greeting}, {userName}! 👋
            </h1>
            <p className="text-xs text-slate-550 max-w-xl font-medium leading-relaxed">
              Toko <strong className="text-brand-blue font-bold">{tenantName}</strong> sedang berjalan baik hari ini. Mari lihat ringkasan toko Anda sekarang.
            </p>
          </div>

          {/* Dynamic Business Summary Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div className="bg-white/80 backdrop-blur-sm border border-brand-border rounded-2xl p-3 shadow-sm flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pesanan Baru</span>
              <span className="text-sm font-bold text-brand-navy mt-1 inline-flex items-center gap-1">
                <ShoppingCart className="w-3.5 h-3.5 text-brand-blue" />
                +3 Pesanan
              </span>
            </div>

            <div className="bg-white/80 backdrop-blur-sm border border-brand-border rounded-2xl p-3 shadow-sm flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pengunjung</span>
              <span className="text-sm font-bold text-brand-navy mt-1 inline-flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-brand-teal" />
                +18 Pengunjung
              </span>
            </div>

            <div className="bg-white/80 backdrop-blur-sm border border-brand-border rounded-2xl p-3 shadow-sm flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Potensi Omzet</span>
              <span className="text-sm font-bold text-brand-navy mt-1 inline-flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-brand-blue" />
                Rp450.000
              </span>
            </div>

            <div className="bg-white/80 backdrop-blur-sm border border-brand-border rounded-2xl p-3 shadow-sm flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Status Toko</span>
              <span className="text-sm font-bold text-brand-navy mt-1 inline-flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${isStoreActive ? 'bg-brand-teal' : 'bg-rose-500'} animate-pulse shrink-0`} />
                {isStoreActive ? 'Toko Aktif' : 'Nonaktif'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Modern Vector Mockup */}
        <div className="w-48 h-32 md:w-56 md:h-36 shrink-0 relative z-10 hidden sm:block bg-white/60 border border-brand-border rounded-2xl p-4 shadow-sm backdrop-blur-sm">
          <div className="h-full flex flex-col justify-between">
            <div className="flex justify-between items-center border-b border-brand-border/60 pb-2">
              <span className="text-[9px] font-bold text-brand-navy">Etalase Toko</span>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-teal" />
            </div>
            <div className="space-y-2 py-2">
              <span className="w-3/4 h-2 bg-slate-100 rounded block" />
              <span className="w-1/2 h-2 bg-slate-100 rounded block" />
              <span className="w-5/6 h-2 bg-slate-100 rounded block" />
            </div>
            <div className="w-full h-8 bg-blue-50/50 rounded-xl flex items-center justify-center text-brand-blue font-bold text-[9px] border border-blue-100/50">
              WhatsApp-Commerce Aktif
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: SMART KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Penjualan Hari Ini"
          value="Rp 1.450.000"
          description="Total omzet masuk hari ini"
          icon={DollarSign}
          trend="+12%"
          isPositive={true}
        />

        <StatCard
          title="Pesanan Baru"
          value={orderCount}
          description="Total pesanan WhatsApp tercatat"
          icon={ShoppingCart}
          trend="+8%"
          isPositive={true}
        />

        <StatCard
          title="Pengunjung Toko"
          value="320"
          description="Total kunjungan etalase unik"
          icon={Users}
          trend="-4%"
          isPositive={false}
        />

        <StatCard
          title="Tingkat Konversi"
          value="3.8%"
          description="Rasio kunjungan menjadi pembelian"
          icon={Activity}
          trend="+0.5%"
          isPositive={true}
        />
      </div>

      {/* SECTION 3: BUSINESS PERFORMANCE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Card: Weekly Sales area chart */}
        <div className="bg-white border border-brand-border rounded-[24px] p-6 lg:col-span-2 space-y-6 shadow-[0_8px_30px_rgba(0,0,0,0.005)]">
          <div className="flex items-center justify-between border-b border-slate-50 pb-4">
            <div className="space-y-0.5">
              <h3 className="font-bold text-sm text-brand-navy">Penjualan 7 Hari Terakhir</h3>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Performa Bisnis Mingguan</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-brand-border rounded-full text-[10px] font-bold text-slate-500">
              <Calendar className="w-3.5 h-3.5 text-brand-blue" />
              <span>Semua Kategori</span>
            </div>
          </div>

          {/* Premium Area Chart drawn using SVG with gradients */}
          <div className="space-y-4">
            <div className="h-44 w-full relative">
              <svg className="w-full h-full" viewBox="0 0 100 35" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#14B8A6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Horizontal grid lines */}
                <line x1="0" y1="9" x2="100" y2="9" stroke="#F1F5F9" strokeWidth="0.15" />
                <line x1="0" y1="18" x2="100" y2="18" stroke="#F1F5F9" strokeWidth="0.15" />
                <line x1="0" y1="27" x2="100" y2="27" stroke="#F1F5F9" strokeWidth="0.15" />

                {/* Chart Area Fill */}
                <path
                  d="M0,35 Q10,31 20,22 T40,24 T60,10 T80,14 T100,5 L100,35 Z"
                  fill="url(#salesGradient)"
                />

                {/* Chart Main Trend Line */}
                <path
                  d="M0,35 Q10,31 20,22 T40,24 T60,10 T80,14 T100,5"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                />

                {/* Highlight dots on peaks */}
                <circle cx="20" cy="22" r="0.8" fill="#14B8A6" />
                <circle cx="60" cy="10" r="0.8" fill="#2563EB" />
                <circle cx="100" cy="5" r="0.8" fill="#14B8A6" />
              </svg>
            </div>

            {/* X-Axis labels for weekdays */}
            <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider px-1">
              <span>Sen</span>
              <span>Sel</span>
              <span>Rab</span>
              <span>Kam</span>
              <span>Jum</span>
              <span>Sab</span>
              <span>Min</span>
            </div>
          </div>
        </div>

        {/* Right Card: Business Health Score */}
        <div className="bg-white border border-brand-border rounded-[24px] p-6 space-y-6 shadow-[0_8px_30px_rgba(0,0,0,0.005)] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-teal" />
              <h3 className="font-bold text-sm text-brand-navy">Kesehatan Toko</h3>
            </div>

            {/* Score Radial Progress & Checklist */}
            <div className="flex items-center justify-between gap-4 py-1">
              <div className="space-y-2 flex-1 text-left">
                <span className="text-2xl font-black text-brand-navy">85 / 100</span>
                <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                  Toko online Anda terstruktur dengan baik. Lengkapi 1 poin sisa untuk visibilitas maksimal.
                </p>
              </div>

              {/* Gorgeous SVG Circular Progress Bar */}
              <div className="w-16 h-16 shrink-0 relative flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-95" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="3.2"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-brand-teal"
                    strokeDasharray="85, 100"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-[10px] font-black text-brand-navy">85%</span>
              </div>
            </div>

            {/* Health Checklist */}
            <div className="space-y-2 pt-2 text-xs">
              <div className="flex items-center gap-2.5 font-medium text-slate-650">
                <span className="w-4 h-4 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-brand-teal shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                </span>
                <span>Nomor WhatsApp Aktif</span>
              </div>
              <div className="flex items-center gap-2.5 font-medium text-slate-650">
                <span className="w-4 h-4 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-brand-teal shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                </span>
                <span>Banner Lengkap</span>
              </div>
              <div className="flex items-center gap-2.5 font-medium text-slate-650">
                <span className="w-4 h-4 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-brand-teal shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                </span>
                <span>Produk Tersedia ({productCount} produk)</span>
              </div>
              <div className="flex items-center gap-2.5 font-medium text-slate-500">
                <span className="w-4 h-4 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 shrink-0">
                  <AlertCircle className="w-2.5 h-2.5 stroke-[3]" />
                </span>
                <span>Belum ada produk unggulan</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* SECTION 4: ACTIVITY & NEXT TASKS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Recent Activities Timeline */}
        <div className="bg-white border border-brand-border rounded-[24px] p-6 lg:col-span-2 space-y-5 shadow-[0_8px_30px_rgba(0,0,0,0.005)]">
          <div className="flex items-center justify-between border-b border-slate-50 pb-4">
            <div className="space-y-0.5">
              <h3 className="font-bold text-sm text-brand-navy">Aktivitas Terbaru</h3>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Perkembangan Transaksi</p>
            </div>
          </div>

          {/* Timeline Node Tree */}
          <div className="relative border-l border-slate-100 ml-3 pl-6 space-y-6 text-xs text-left py-2">

            {/* Timeline Item 1 */}
            <div className="relative">
              <span className="absolute -left-9 top-0.5 w-6 h-6 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-brand-blue">
                <ShoppingCart className="w-3.5 h-3.5" />
              </span>
              <div className="space-y-0.5">
                <span className="font-bold text-brand-navy block">
                  Pesanan baru masuk oleh Budi Hartono
                </span>
                <p className="text-slate-400 text-[10px] font-medium">
                  WhatsApp-Commerce &bull; total Rp150.000 &bull; 5 menit yang lalu
                </p>
              </div>
            </div>

            {/* Timeline Item 2 */}
            <div className="relative">
              <span className="absolute -left-9 top-0.5 w-6 h-6 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-brand-teal">
                <ShoppingBag className="w-3.5 h-3.5" />
              </span>
              <div className="space-y-0.5">
                <span className="font-bold text-brand-navy block">
                  Produk baru &quot;Toya Rotan Premium Perguruan&quot; ditambahkan
                </span>
                <p className="text-slate-400 text-[10px] font-medium">
                  Katalog Rotan &bull; diunggah oleh Anda &bull; 2 jam yang lalu
                </p>
              </div>
            </div>

            {/* Timeline Item 3 */}
            <div className="relative">
              <span className="absolute -left-9 top-0.5 w-6 h-6 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-brand-navy">
                <Users className="w-3.5 h-3.5" />
              </span>
              <div className="space-y-0.5">
                <span className="font-bold text-brand-navy block">
                  Pelanggan baru terdaftar &mdash; Siti Aminah
                </span>
                <p className="text-slate-400 text-[10px] font-medium">
                  Kotamadya Bandung &bull; pendaftaran organik &bull; 1 hari yang lalu
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Next Tasks Interactive Checklist */}
        <div className="bg-white border border-brand-border rounded-[24px] p-6 space-y-5 shadow-[0_8px_30px_rgba(0,0,0,0.005)] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50 pb-4">
              <h3 className="font-bold text-sm text-brand-navy">Tugas Berikutnya</h3>
              <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-brand-blue border border-blue-100 rounded-full font-bold">
                Kemajuan: 50%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="bg-brand-blue h-full w-1/2 rounded-full" />
              </div>
            </div>

            {/* Interactive Checklist list */}
            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-start gap-3 p-3 bg-slate-50 border border-brand-border rounded-xl">
                <span className="w-5 h-5 rounded-md bg-emerald-50 border border-emerald-100 flex items-center justify-center text-brand-teal shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </span>
                <div className="space-y-0.5">
                  <h4 className="font-bold text-slate-500 line-through">Tambah produk pertama Anda</h4>
                  <p className="text-[10px] text-slate-400 leading-normal">Berhasil diselesaikan</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white border border-brand-border hover:border-slate-300 rounded-xl transition-all">
                <span className="w-5 h-5 rounded-md border border-slate-300 shrink-0 mt-0.5 bg-white" />
                <div className="space-y-0.5">
                  <h4 className="font-bold text-brand-navy">Hubungkan nomor WhatsApp aktif</h4>
                  <p className="text-[10px] text-slate-400 leading-normal">Rute pesanan langsung ke WhatsApp Anda</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white border border-brand-border hover:border-slate-300 rounded-xl transition-all">
                <span className="w-5 h-5 rounded-md border border-slate-300 shrink-0 mt-0.5 bg-white" />
                <div className="space-y-0.5">
                  <h4 className="font-bold text-brand-navy">Upload banner halaman toko</h4>
                  <p className="text-[10px] text-slate-400 leading-normal">Meningkatkan kepercayaan calon pelanggan</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white border border-brand-border hover:border-slate-300 rounded-xl transition-all">
                <span className="w-5 h-5 rounded-md border border-slate-300 shrink-0 mt-0.5 bg-white" />
                <div className="space-y-0.5">
                  <h4 className="font-bold text-brand-navy">Lengkapi profil bisnis toko Anda</h4>
                  <p className="text-[10px] text-slate-400 leading-normal">Lengkapi detail alamat dan logo usaha</p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* SECTION 5: AI GROWTH RECOMMENDATIONS */}
      <div className="space-y-4 text-left">
        <h3 className="font-bold text-base text-brand-navy tracking-tight px-1">
          Rekomendasi Untuk Mengembangkan Toko
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Rec 1 */}
          <div className="bg-white border border-brand-border rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.005)] space-y-4 hover:border-brand-blue/30 transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-brand-blue">
                <TrendingUp className="w-4.5 h-4.5" />
              </div>
              <h4 className="font-bold text-brand-navy text-xs pt-1 group-hover:text-brand-blue transition-colors">
                Tambahkan Produk Unggulan
              </h4>
              <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                Menyorot produk terlaris di etalase Anda terbukti meningkatkan peluang konversi hingga 25%.
              </p>
            </div>
            <span className="text-[9px] font-bold text-brand-blue tracking-wide uppercase mt-2 block">
              Aktifkan Sekarang &rarr;
            </span>
          </div>

          {/* Rec 2 */}
          <div className="bg-white border border-brand-border rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.005)] space-y-4 hover:border-brand-teal/30 transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-brand-teal">
                <Camera className="w-4.5 h-4.5" />
              </div>
              <h4 className="font-bold text-brand-navy text-xs pt-1 group-hover:text-brand-teal transition-colors">
                Gunakan Foto Lebih Jelas
              </h4>
              <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                Foto produk dengan pencahayaan terang dan latar bersih menarik 40% lebih banyak pembeli di WhatsApp.
              </p>
            </div>
            <span className="text-[9px] font-bold text-brand-teal tracking-wide uppercase mt-2 block">
              Buka Tips Foto &rarr;
            </span>
          </div>

          {/* Rec 3 */}
          <div className="bg-white border border-brand-border rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.005)] space-y-4 hover:border-brand-blue/30 transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-brand-blue">
                <Target className="w-4.5 h-4.5" />
              </div>
              <h4 className="font-bold text-brand-navy text-xs pt-1 group-hover:text-brand-blue transition-colors">
                Lengkapi Kategori Produk
              </h4>
              <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                Mempermudah calon pembeli menavigasi etalase saat mencari produk spesifik secara mandiri.
              </p>
            </div>
            <span className="text-[9px] font-bold text-brand-blue tracking-wide uppercase mt-2 block">
              Atur Kategori &rarr;
            </span>
          </div>

          {/* Rec 4 */}
          <div className="bg-white border border-brand-border rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.005)] space-y-4 hover:border-brand-teal/30 transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-brand-teal">
                <MessageSquare className="w-4.5 h-4.5" />
              </div>
              <h4 className="font-bold text-brand-navy text-xs pt-1 group-hover:text-brand-teal transition-colors">
                Aktifkan Balasan Otomatis
              </h4>
              <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                Respon cepat otomatis memastikan pembeli baru merasa dilayani instan dan tidak lari ke kompetitor.
              </p>
            </div>
            <span className="text-[9px] font-bold text-brand-teal tracking-wide uppercase mt-2 block">
              Set Balasan &rarr;
            </span>
          </div>

        </div>
      </div>

    </div>
  );
}

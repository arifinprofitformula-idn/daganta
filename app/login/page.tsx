import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import LoginFormCard from './login-form-card';
import { 
  Package, 
  ShoppingBag, 
  TrendingUp, 
  ArrowUpRight, 
  Users,
  CheckCircle,
  Sparkles
} from 'lucide-react';

export default async function Page({ 
  searchParams 
}: { 
  searchParams: Promise<{ error?: string }> 
}) {
  // 1. Jika pengguna sudah login, langsung alihkan ke dasbor
  const user = await getCurrentUser();
  if (user) {
    redirect('/dashboard');
  }

  // 2. Dapatkan parameter error secara asinkron (Next.js 15)
  const resolvedSearchParams = await searchParams;
  const errorMsg = resolvedSearchParams.error;

  return (
    <main className="min-h-screen w-full flex bg-gradient-to-br from-[#F8FAFC] via-[#EEF6FF] to-[#F8FAFC] text-brand-navy relative overflow-hidden font-sans select-none">
      
      {/* Soft Clean Logo Color Accents in the Background */}
      <div className="absolute -top-[10%] -right-[5%] w-[500px] h-[500px] bg-brand-blue/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-[10%] -left-[5%] w-[500px] h-[500px] bg-brand-teal/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[35%] left-[20%] w-[300px] h-[300px] bg-brand-sky/5 rounded-full blur-[90px] pointer-events-none" />

      {/* Split Screen Layout Container */}
      <div className="w-full min-h-screen flex relative z-10">
        
        {/* LEFT SECTION: Brand Storytelling & Dashboard Preview (60% Desktop) */}
        <div className="hidden lg:flex lg:w-[58%] xl:w-[60%] p-16 xl:p-20 flex-col justify-between relative">
          
          {/* Header Badge */}
          <div className="flex items-center">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-white/80 backdrop-blur-sm border border-brand-border rounded-full text-[11px] font-bold text-brand-blue shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-brand-teal" />
              Platform Webstore Instan Terpercaya
            </span>
          </div>

          {/* Copywriting & Storytelling */}
          <div className="space-y-6 max-w-xl my-auto">
            <h2 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-[1.18] text-brand-navy">
              Bangun Toko Online Anda <br />
              <span className="bg-gradient-to-r from-brand-blue via-brand-sky to-brand-teal bg-clip-text text-transparent">
                Tanpa Ribet Teknis
              </span>
            </h2>
            <p className="text-slate-500 text-sm xl:text-base font-semibold leading-relaxed">
              Kelola produk, pesanan, pelanggan, dan pembayaran dalam satu dashboard yang mudah digunakan.
            </p>

            {/* Dashboard Mockup in Browser Shell */}
            <div className="relative pt-10 pl-10">
              
              {/* Floating Stat Card 1: 1.250+ Produk Aktif (Commerce Blue accent) */}
              <div className="absolute -left-6 top-20 bg-white rounded-2xl p-4 shadow-[0_10px_25px_rgba(37,99,235,0.03)] border border-brand-border/60 flex items-center gap-3.5 animate-bounce [animation-duration:6s] z-30">
                <div className="w-10 h-10 rounded-xl bg-blue-50/80 flex items-center justify-center text-brand-blue border border-blue-100">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Produk Aktif</p>
                  <p className="text-base font-bold text-brand-navy">1.250+ Produk</p>
                </div>
              </div>

              {/* Floating Stat Card 2: 8.500+ Pesanan Diproses (Growth Teal accent) */}
              <div className="absolute -right-6 top-10 bg-white rounded-2xl p-4 shadow-[0_10px_25px_rgba(20,184,166,0.03)] border border-brand-border/60 flex items-center gap-3.5 animate-bounce [animation-duration:5s] [animation-delay:1.5s] z-30">
                <div className="w-10 h-10 rounded-xl bg-teal-50/80 flex items-center justify-center text-brand-teal border border-teal-100">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Pesanan Diproses</p>
                  <p className="text-base font-bold text-brand-navy">8.500+ Pesanan</p>
                </div>
              </div>

              {/* Floating Stat Card 3: 350+ Toko Bertumbuh (Sky Blue / Navy accent) */}
              <div className="absolute left-[25%] -bottom-6 bg-white rounded-2xl p-4 shadow-[0_10px_25px_rgba(56,189,248,0.03)] border border-brand-border/60 flex items-center gap-3.5 animate-bounce [animation-duration:7s] [animation-delay:3s] z-30">
                <div className="w-10 h-10 rounded-xl bg-slate-50/80 flex items-center justify-center text-brand-navy border border-slate-100">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Toko Bertumbuh</p>
                  <p className="text-base font-bold text-brand-navy">350+ Toko</p>
                </div>
              </div>

              {/* Browser Preview Container */}
              <div className="w-full max-w-[500px] bg-white rounded-2xl shadow-[0_20px_50px_rgba(11,31,51,0.04)] border border-brand-border overflow-hidden relative z-20 transform hover:-translate-y-1 transition-transform duration-500">
                
                {/* Simulated Browser Bar */}
                <div className="bg-[#F8FAFC] px-4 py-3.5 border-b border-brand-border flex items-center gap-3">
                  {/* Browser dots */}
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                  </div>
                  {/* Address bar */}
                  <div className="flex-1 bg-white border border-brand-border rounded-lg py-1 px-3 text-[10px] text-slate-500 font-semibold text-center truncate select-none shadow-sm">
                    toya-nusantara.daganta.store
                  </div>
                </div>

                {/* Dashboard Mockup Content */}
                <div className="p-6 space-y-6 bg-white">
                  
                  {/* Header Row */}
                  <div className="flex justify-between items-center">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pesanan Hari Ini</p>
                      <h4 className="text-xl font-bold text-brand-navy">Rp 4.850.000</h4>
                    </div>
                    <span className="inline-flex items-center gap-0.5 px-2.5 py-1 bg-teal-50 border border-teal-100 rounded-full text-[10px] font-bold text-brand-teal">
                      <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                      +12.4%
                    </span>
                  </div>

                  {/* Gorgeous Mini SVG Chart utilizing clean Blue & Teal gradients */}
                  <div className="h-20 w-full relative">
                    <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="blueTealGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2563EB" stopOpacity="0.1" />
                          <stop offset="100%" stopColor="#14B8A6" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      {/* Area fill */}
                      <path 
                        d="M0,30 Q15,22 30,24 T60,12 T85,6 T100,2 L100,30 Z" 
                        fill="url(#blueTealGradient)" 
                      />
                      {/* Line */}
                      <path 
                        d="M0,30 Q15,22 30,24 T60,12 T85,6 T100,2" 
                        fill="none" 
                        stroke="#2563EB" 
                        strokeWidth="1.8" 
                        strokeLinecap="round" 
                      />
                    </svg>
                  </div>

                  {/* Summary Subwidgets */}
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-brand-border">
                    <div className="p-3 bg-[#F8FAFC]/80 rounded-xl space-y-1 border border-brand-border/60">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Users className="w-3.5 h-3.5 text-brand-blue" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Pelanggan Baru</span>
                      </div>
                      <p className="text-base font-bold text-brand-navy">48 Toko</p>
                    </div>

                    <div className="p-3 bg-[#F8FAFC]/80 rounded-xl space-y-1 border border-brand-border/60">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <CheckCircle className="w-3.5 h-3.5 text-brand-teal" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Selesai Dikirim</span>
                      </div>
                      <p className="text-base font-bold text-brand-navy">24 Pesanan</p>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>

          {/* Slogan Info */}
          <div className="text-slate-400 text-xs font-semibold tracking-wide flex items-center gap-2">
            <span>Platform Terpercaya</span>
            <span className="text-slate-300">&bull;</span>
            <span>WhatsApp-First Commerce</span>
          </div>

        </div>

        {/* RIGHT SECTION: Login Form Card (40% Desktop, Full Width Mobile) */}
        <div className="w-full lg:w-[42%] xl:w-[40%] flex flex-col justify-between items-center p-6 sm:p-10 relative">
          
          <div className="w-full flex-1 flex flex-col justify-center items-center py-6">
            
            {/* Main Interactive Login Form Card */}
            <LoginFormCard errorMsg={errorMsg} />

          </div>

          {/* Footer Copyright */}
          <div className="text-center text-[11px] text-slate-400 font-semibold py-2 select-none flex flex-col items-center gap-0.5">
            <span>&copy; 2026 Daganta</span>
            <span className="text-slate-350 text-[10px]">Mudah. Mandiri. Bertumbuh.</span>
          </div>

        </div>

      </div>
    </main>
  );
}

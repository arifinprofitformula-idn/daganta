import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '../../lib/auth/session';
import SignupFormCard from './signup-form-card';
import { 
  Package, 
  ShoppingBag, 
  TrendingUp, 
  ArrowUpRight, 
  Users,
  CheckCircle,
  Sparkles
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{
    plan?: string;
  }>;
}

const ALLOWED_PLANS = new Set(['starter', 'growth', 'pro']);

export default async function SignupPage({ searchParams }: PageProps) {
  // 1. If user session already exists, redirect directly to dashboard
  const user = await getCurrentUser();
  if (user) {
    redirect('/dashboard');
  }

  // 2. Resolve plan parameter (Next.js 15 async searchParams)
  const resolvedParams = await searchParams;
  let planSlug = (resolvedParams.plan || 'starter').trim().toLowerCase();
  
  if (!ALLOWED_PLANS.has(planSlug)) {
    planSlug = 'starter';
  }

  return (
    <main className="min-h-screen w-full flex bg-gradient-to-br from-[#F8FAFC] via-[#EEF6FF] to-[#F8FAFC] text-[#0B1F33] relative overflow-hidden font-sans select-none">
      
      {/* Background color glows */}
      <div className="absolute -top-[10%] -right-[5%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-[10%] -left-[5%] w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Split Screen Layout Container */}
      <div className="w-full min-h-screen flex relative z-10">
        
        {/* LEFT SECTION: Brand Storytelling (60% Desktop) */}
        <div className="hidden lg:flex lg:w-[58%] xl:w-[60%] p-16 xl:p-20 flex-col justify-between relative">
          
          {/* Header Badge */}
          <div className="flex items-center">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full text-[11px] font-bold text-blue-600 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-teal-500" />
              Platform Webstore Instan Terpercaya
            </span>
          </div>

          {/* Copywriting & Storytelling */}
          <div className="space-y-6 max-w-xl my-auto text-left">
            <h2 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-[1.18] text-[#0B1F33]">
              Punya Webstore Sendiri <br />
              <span className="bg-gradient-to-r from-blue-600 via-sky-500 to-teal-500 bg-clip-text text-transparent">
                Dalam 5 Menit
              </span>
            </h2>
            <p className="text-slate-500 text-sm xl:text-base font-semibold leading-relaxed">
              Mulai kelola produk, transaksi pesanan, database pelanggan, dan closing otomatis ke WhatsApp bisnis Anda hari ini.
            </p>

            {/* Dashboard Mockup in Browser Shell */}
            <div className="relative pt-10 pl-10">
              
              {/* Floating Stat Card 1 */}
              <div className="absolute -left-6 top-20 bg-white rounded-2xl p-4 shadow-[0_10px_25px_rgba(37,99,235,0.03)] border border-slate-200/60 flex items-center gap-3.5 animate-bounce [animation-duration:6s] z-30">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Produk Aktif</p>
                  <p className="text-base font-bold text-[#0B1F33]">1.250+ Produk</p>
                </div>
              </div>

              {/* Floating Stat Card 2 */}
              <div className="absolute -right-6 top-10 bg-white rounded-2xl p-4 shadow-[0_10px_25px_rgba(20,184,166,0.03)] border border-slate-200/60 flex items-center gap-3.5 animate-bounce [animation-duration:5s] [animation-delay:1.5s] z-30">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-500 border border-teal-100">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Pesanan Diproses</p>
                  <p className="text-base font-bold text-[#0B1F33]">8.500+ Pesanan</p>
                </div>
              </div>

              {/* Browser Preview Container */}
              <div className="w-full max-w-[500px] bg-white rounded-2xl shadow-[0_20px_50px_rgba(11,31,51,0.04)] border border-slate-200 overflow-hidden relative z-20">
                
                {/* Simulated Browser Bar */}
                <div className="bg-slate-50 px-4 py-3.5 border-b border-slate-200 flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                  </div>
                  <div className="flex-1 bg-white border border-slate-200 rounded-lg py-1 px-3 text-[10px] text-slate-500 font-semibold text-center truncate">
                    tokosaya.daganta.store
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4 bg-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pesanan Hari Ini</p>
                      <h4 className="text-lg font-bold text-[#0B1F33]">Rp 4.850.000</h4>
                    </div>
                    <span className="inline-flex items-center gap-0.5 px-2.5 py-1 bg-teal-50 border border-teal-100 rounded-full text-[10px] font-bold text-teal-600">
                      <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                      +12.4%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                    <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Pelanggan Baru</span>
                      <p className="text-base font-bold text-[#0B1F33]">48 Toko</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Selesai Dikirim</span>
                      <p className="text-base font-bold text-[#0B1F33]">24 Pesanan</p>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* Slogan */}
          <div className="text-slate-400 text-xs font-semibold tracking-wide flex items-center gap-2">
            <span>Platform Terpercaya</span>
            <span className="text-slate-300">&bull;</span>
            <span>WhatsApp-First Commerce</span>
          </div>

        </div>

        {/* RIGHT SECTION: Signup Form Card (40% Desktop, Full Width Mobile) */}
        <div className="w-full lg:w-[42%] xl:w-[40%] flex flex-col justify-between items-center p-6 sm:p-10 relative overflow-y-auto">
          
          <div className="w-full flex-1 flex flex-col justify-center items-center py-6">
            <SignupFormCard initialPlanSlug={planSlug} />
          </div>

          {/* Footer Copyright */}
          <div className="text-center text-[11px] text-slate-450 font-semibold py-2">
            <span>&copy; 2026 Daganta</span>
            <span className="text-slate-350 text-[10px] block mt-0.5">Mudah. Mandiri. Bertumbuh.</span>
          </div>

        </div>

      </div>
    </main>
  );
}

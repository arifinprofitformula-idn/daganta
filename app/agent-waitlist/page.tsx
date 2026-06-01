import React from 'react';
import Link from 'next/link';
import { Briefcase, ArrowLeft } from 'lucide-react';

export default function Page() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-white p-6 relative overflow-hidden font-sans select-none antialiased">
      
      {/* Soft background accents */}
      <div className="absolute -top-[10%] -right-[5%] w-[400px] h-[400px] bg-brand-blue/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-[10%] -left-[5%] w-[400px] h-[400px] bg-brand-teal/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl relative z-10">
        
        {/* Agent Icon Badge */}
        <div className="mx-auto w-16 h-16 bg-blue-950 border border-blue-500/30 rounded-2xl flex items-center justify-center text-blue-400 shadow-inner">
          <Briefcase className="w-8 h-8 text-blue-400" />
        </div>

        {/* Text Copy */}
        <div className="space-y-2">
          <h1 className="text-xl font-bold tracking-tight text-slate-100">
            Program Agen Daganta
          </h1>
          <p className="text-slate-400 text-xs font-semibold leading-relaxed">
            Program Agen Daganta sedang disiapkan. Informasi pendaftaran akan segera tersedia.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 text-xs justify-center items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>

      </div>

      {/* Footer Copyright */}
      <div className="text-center text-[10px] text-slate-500 py-6 absolute bottom-2">
        <span>&copy; 2026 Daganta. Mudahan. Mandiri. Bertumbuh.</span>
      </div>

    </main>
  );
}

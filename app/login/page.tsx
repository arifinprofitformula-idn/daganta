import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { login } from './actions';

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
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-slate-100 p-6 select-none relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-md w-full bg-slate-900 border border-slate-850 rounded-3xl p-8 space-y-8 shadow-2xl relative">
        
        {/* Logo Branding */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <span className="font-extrabold text-xl text-white">D</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-slate-100">Masuk Panel Daganta</h1>
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Akses Dasbor Toko Anda</p>
          </div>
        </div>

        {/* Error Alert Display */}
        {errorMsg && (
          <div className="p-3.5 bg-rose-950/20 border border-rose-500/20 rounded-xl flex items-start gap-2.5 text-[10px] text-rose-400 font-semibold leading-normal">
            <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="space-y-0.5">
              <span className="font-bold text-rose-350 block">Gagal Masuk</span>
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form action={login} className="space-y-5 text-xs">
          {/* Email input field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Alamat Email</label>
            <input
              type="email"
              name="email"
              placeholder="nama@toko.com"
              required
              className="w-full bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-xl px-4 py-2.5 text-slate-350 placeholder-slate-650 focus:outline-none focus:border-indigo-500/30 transition-all font-medium"
            />
          </div>

          {/* Password input field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kata Sandi</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              required
              className="w-full bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-xl px-4 py-2.5 text-slate-350 placeholder-slate-650 focus:outline-none focus:border-indigo-500/30 transition-all font-medium"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20 text-center select-none"
            >
              Masuk Dasbor Toko
            </button>
          </div>
        </form>

        {/* Development Tip Banner */}
        <div className="pt-4 border-t border-slate-950 text-center">
          <span className="text-[9px] text-slate-500 font-bold block select-none">
            Gunakan Akun Supabase Dev Terdaftar
          </span>
        </div>
      </div>
    </main>
  );
}

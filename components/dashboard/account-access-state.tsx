'use client';

import React from 'react';
import { AlertCircle, LogOut } from 'lucide-react';
import { logout } from '@/app/login/actions';

interface AccountAccessStateProps {
  error: 'NO_PROFILE' | 'NO_MEMBERSHIP';
  userEmail: string;
}

export default function AccountAccessState({ error, userEmail }: AccountAccessStateProps) {
  const isNoProfile = error === 'NO_PROFILE';
  
  const title = isNoProfile 
    ? 'Akun Belum Terhubung' 
    : 'Akses Toko Terbatas';
    
  const message = isNoProfile 
    ? 'Akun belum terhubung ke profil toko.' 
    : 'Akun ini belum memiliki akses ke toko.';
    
  const desc = isNoProfile
    ? 'Email Anda telah terdaftar sebagai pengguna Supabase Dev, namun belum memiliki profil toko (UserProfile) di database utama Daganta. Silakan hubungi admin platform untuk menghubungkan akun Anda.'
    : 'Profil Anda telah terdaftar, namun belum dihubungkan ke toko mana pun (TenantMember). Silakan hubungi pemilik toko untuk menambahkan email Anda sebagai staff atau anggota toko.';

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-slate-100 p-6 select-none relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-md w-full bg-slate-900 border border-slate-850 rounded-3xl p-8 space-y-6 shadow-2xl relative text-center">
        {/* Warning Icon */}
        <div className="mx-auto w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-450 shadow-lg">
          <AlertCircle className="w-6 h-6 shrink-0" />
        </div>

        {/* Messaging */}
        <div className="space-y-2">
          <h1 className="text-lg font-bold text-slate-100">{title}</h1>
          <p className="text-rose-450 font-extrabold text-xs uppercase tracking-wider">{message}</p>
          <p className="text-[11px] text-slate-450 leading-relaxed pt-2">
            {desc}
          </p>
        </div>

        {/* User Info Bar */}
        <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-2xl flex items-center justify-between text-[10px] font-bold">
          <span className="text-slate-500 uppercase tracking-wider">Email Sesi</span>
          <span className="text-slate-350 select-all font-mono">{userEmail}</span>
        </div>

        {/* Action Button: Logout */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => logout()}
            className="w-full py-3 px-4 bg-slate-950 hover:bg-slate-850 active:bg-slate-800 text-slate-350 hover:text-rose-450 border border-slate-800 hover:border-rose-950/30 font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Keluar & Ganti Akun</span>
          </button>
        </div>

        {/* Footer Info */}
        <div className="pt-4 border-t border-slate-950">
          <span className="text-[9px] text-slate-650 font-bold block select-none">
            Mode Demo Internal — belum menggunakan role final.
          </span>
        </div>
      </div>
    </main>
  );
}

'use client';

import React from 'react';
import { Bell, Sparkles, LogOut, AlertTriangle } from 'lucide-react';
import { logout } from '@/app/login/actions';

interface TopbarProps {
  tenantName: string;
  userEmail: string;
  hasProfile: boolean;
}

export default function Topbar({ tenantName, userEmail, hasProfile }: TopbarProps) {
  return (
    <header className="h-16 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-8 select-none">
      {/* Search / Status Pill */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold text-slate-300">
          Kelola Toko: <span className="text-indigo-400 font-extrabold">{tenantName}</span>
        </span>
        
        {/* Warning Badge based on Profile Linkage and Demo Status */}
        {hasProfile ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/30 border border-indigo-500/20 text-[10px] text-indigo-400 font-semibold tracking-wide">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>Mode Demo Internal — belum menggunakan role final.</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/30 border border-rose-500/20 text-[10px] text-rose-450 font-bold tracking-wide">
            <AlertTriangle className="w-3 h-3 text-rose-450" />
            <span>Akun belum terhubung ke profil toko. (Mode Demo Internal — belum menggunakan role final.)</span>
          </div>
        )}
      </div>

      {/* Profile & Actions */}
      <div className="flex items-center gap-4">
        {/* Active User profile details */}
        <div className="flex items-center gap-2 border-r border-slate-900 pr-4">
          <div className="w-8 h-8 rounded-full bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-[10px] font-extrabold text-indigo-400">
            {userEmail.substring(0, 2).toUpperCase()}
          </div>
          <div className="hidden sm:flex flex-col overflow-hidden text-left">
            <span className="text-[10px] font-bold text-slate-200 truncate leading-none">Pengguna Aktif</span>
            <span className="text-[9px] text-slate-500 font-medium truncate mt-0.5 select-all">{userEmail}</span>
          </div>
        </div>

        {/* Dynamic Logout Action Button */}
        <button
          type="button"
          onClick={() => logout()}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-850 active:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-950 rounded-xl text-[10px] font-bold transition-all shadow-md select-none"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          <span>Keluar</span>
        </button>
      </div>
    </header>
  );
}

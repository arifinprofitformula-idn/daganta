'use client';

import React from 'react';
import { Bell, Sparkles } from 'lucide-react';

interface TopbarProps {
  tenantName: string;
}

export default function Topbar({ tenantName }: TopbarProps) {
  return (
    <header className="h-16 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-8 select-none">
      {/* Search / Status Pill */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold text-slate-300">
          Kelola Toko: <span className="text-indigo-400 font-extrabold">{tenantName}</span>
        </span>
        
        {/* Warning Badge: Internal Demo Mode */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/30 border border-indigo-500/20 text-[10px] text-indigo-400 font-semibold tracking-wide">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span>Mode Demo Internal — belum menggunakan login asli.</span>
        </div>
      </div>

      {/* Profile Actions */}
      <div className="flex items-center gap-4">
        {/* Notification Alert */}
        <button
          type="button"
          disabled
          className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-850 flex items-center justify-center text-slate-500 hover:text-slate-350 transition-colors cursor-not-allowed"
        >
          <Bell className="w-3.5 h-3.5" />
        </button>

        {/* User profile dropdown placeholder */}
        <div className="flex items-center gap-2 border-l border-slate-900 pl-4">
          <div className="w-8 h-8 rounded-full bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-[10px] font-extrabold text-indigo-400">
            AD
          </div>
          <div className="hidden sm:flex flex-col overflow-hidden text-left">
            <span className="text-[10px] font-bold text-slate-200 truncate leading-none">Arifin Owner</span>
            <span className="text-[9px] text-slate-500 font-medium truncate mt-0.5">admin@daganta.com</span>
          </div>
        </div>
      </div>
    </header>
  );
}

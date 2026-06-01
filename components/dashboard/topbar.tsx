'use client';

import React from 'react';
import { LogOut, Search, Bell, User } from 'lucide-react';
import { logout } from '@/app/login/actions';
import TenantSwitcher from './tenant-switcher';

interface TopbarProps {
  tenantName: string;
  userEmail: string;
  hasProfile: boolean;
  activeTenant: { id: string; name: string } | null;
  availableTenants: Array<{ id: string; name: string }>;
}

export default function Topbar({
  tenantName,
  userEmail,
  hasProfile,
  activeTenant,
  availableTenants
}: TopbarProps) {
  return (
    <header className="h-16 border-b border-brand-border bg-white/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-8 select-none">

      {/* Left Area: Switcher & Search Bar */}
      <div className="flex items-center gap-6 flex-1 max-w-xl">
        <TenantSwitcher
          activeTenant={activeTenant}
          availableTenants={availableTenants}
        />

        {/* Modern Clean Search Input (Shopify Style) */}
        <div className="relative w-full max-w-xs hidden md:block group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-blue transition-colors">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            placeholder="Cari produk, pesanan..."
            disabled
            aria-label="Pencarian belum tersedia"
            title="Fitur pencarian akan segera hadir"
            className="w-full bg-slate-50 border border-brand-border rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-500 placeholder-slate-400 cursor-not-allowed opacity-80 focus:outline-none"
          />
        </div>
      </div>

      {/* Right Area: Notifications, Profile & Logout */}
      <div className="flex items-center gap-4">

        {/* Notifications Icon (SaaS Bell) */}
        <button
          type="button"
          className="p-2 text-slate-500 hover:text-brand-navy hover:bg-slate-50 rounded-xl transition-all relative"
        >
          <Bell className="w-4.5 h-4.5 stroke-[2]" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-teal rounded-full" />
        </button>

        {/* Profile Card & Avatar */}
        <div className="flex items-center gap-2 border-r border-brand-border pr-4 h-8">
          <div className="w-8 h-8 rounded-xl bg-slate-100 border border-brand-border flex items-center justify-center text-[11px] font-bold text-brand-navy">
            {userEmail ? userEmail.substring(0, 2).toUpperCase() : <User className="w-3.5 h-3.5" />}
          </div>
          <div className="hidden sm:flex flex-col text-left max-w-[120px]">
            <span className="text-[10px] font-bold text-brand-navy truncate leading-none">
              Mitra Daganta
            </span>
            <span className="text-[9px] text-slate-400 font-semibold truncate mt-0.5 select-all">
              {userEmail}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={() => logout()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-500 hover:text-rose-600 border border-brand-border rounded-xl text-[10px] font-bold transition-all shadow-sm select-none"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          <span>Keluar</span>
        </button>

      </div>

    </header>
  );
}

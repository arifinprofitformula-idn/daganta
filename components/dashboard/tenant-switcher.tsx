'use client';

import React, { useTransition } from 'react';
import { Store, ChevronDown } from 'lucide-react';
import { switchActiveTenantAction } from '@/app/dashboard/actions';

interface TenantSwitcherProps {
  activeTenant: { id: string; name: string } | null;
  availableTenants: Array<{ id: string; name: string }>;
}

export default function TenantSwitcher({ activeTenant, availableTenants }: TenantSwitcherProps) {
  const [isPending, startTransition] = useTransition();

  if (!activeTenant) return null;

  // Jika hanya memiliki 1 toko, tampilkan label statis saja (disabled)
  if (availableTenants.length <= 1) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-bold text-slate-350 select-none">
        <Store className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
        <span>Toko Aktif: <strong className="text-indigo-300 font-extrabold">{activeTenant.name}</strong></span>
      </div>
    );
  }

  return (
    <div className="relative inline-block text-left text-xs select-none">
      <form
        action={switchActiveTenantAction}
        className="flex items-center gap-2"
        onChange={(e) => {
          const form = e.currentTarget;
          startTransition(async () => {
            const formData = new FormData(form);
            await switchActiveTenantAction(formData);
          });
        }}
      >
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl transition-all relative">
          <Store className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Pilih Toko:</span>
          
          <select
            name="tenantId"
            defaultValue={activeTenant.id}
            disabled={isPending}
            className="bg-transparent text-indigo-300 font-extrabold text-[10px] pr-5 focus:outline-none cursor-pointer appearance-none shrink-0"
          >
            {availableTenants.map((t) => (
              <option key={t.id} value={t.id} className="bg-slate-900 text-slate-200">
                {t.name}
              </option>
            ))}
          </select>
          
          <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none shrink-0" />
        </div>
      </form>
    </div>
  );
}

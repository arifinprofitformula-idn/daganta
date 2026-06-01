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
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-brand-border rounded-xl text-[10px] font-bold text-slate-700 select-none">
        <Store className="w-3.5 h-3.5 text-brand-blue shrink-0" />
        <span>Toko Aktif: <strong className="text-brand-navy font-extrabold">{activeTenant.name}</strong></span>
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
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-brand-border rounded-xl transition-all relative">
          <Store className="w-3.5 h-3.5 text-brand-blue shrink-0" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0">Pilih Toko:</span>
          
          <select
            name="tenantId"
            defaultValue={activeTenant.id}
            disabled={isPending}
            className="bg-transparent text-brand-navy font-extrabold text-[10px] pr-5 focus:outline-none cursor-pointer appearance-none shrink-0"
          >
            {availableTenants.map((t) => (
              <option key={t.id} value={t.id} className="bg-white text-slate-800">
                {t.name}
              </option>
            ))}
          </select>
          
          <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none shrink-0" />
        </div>
      </form>
    </div>
  );
}

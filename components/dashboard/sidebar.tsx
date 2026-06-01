'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  ShoppingCart, 
  Users, 
  CreditCard, 
  Settings, 
  Store
} from 'lucide-react';

interface SidebarProps {
  tenantName: string;
}

export default function Sidebar({ tenantName }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Beranda', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Produk', href: '/dashboard/products', icon: ShoppingBag },
    { name: 'Pesanan', href: '/dashboard/orders', icon: ShoppingCart },
    { name: 'Pelanggan', href: '/dashboard/customers', icon: Users },
    { name: 'Paket Aktif & Biaya', href: '/dashboard/billing', icon: CreditCard },
    { name: 'Pengaturan', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-900 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      {/* Brand Header */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <span className="font-extrabold text-sm text-white uppercase">{tenantName.substring(0, 1)}</span>
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-extrabold tracking-tight text-white truncate leading-tight">{tenantName}</span>
            <span className="text-[10px] text-slate-500 font-medium">Pemilik Toko</span>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto py-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all duration-250 select-none group
                ${isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
            >
              <Icon className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 
                ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'}`} 
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-900/60 bg-slate-950/40">
        <a
          href="https://daganta.store"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-850 active:bg-slate-800 text-slate-400 hover:text-white font-bold text-[10px] rounded-xl transition-all border border-slate-850"
        >
          <Store className="w-3.5 h-3.5" />
          <span>Lihat Webstore</span>
        </a>
      </div>
    </aside>
  );
}

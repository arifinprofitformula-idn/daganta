'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  ShoppingBag,
  Inbox,
  Users,
  BarChart3,
  Palette,
  CreditCard,
  Settings,
  Store,
  ExternalLink
} from 'lucide-react';

interface SidebarProps {
  tenantName: string;
}

export default function Sidebar({ tenantName }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Ringkasan', href: '/dashboard', icon: Home },
    { name: 'Produk', href: '/dashboard/products', icon: ShoppingBag },
    { name: 'Pesanan', href: '/dashboard/orders', icon: Inbox },
    { name: 'Pelanggan', href: '/dashboard/customers', icon: Users },
    { name: 'Analitik', href: '#analytics', icon: BarChart3, isComingSoon: true },
    { name: 'Tampilan Toko', href: '#storefront', icon: Palette, isComingSoon: true },
    { name: 'Paket & Tagihan', href: '/dashboard/billing', icon: CreditCard },
    { name: 'Pengaturan', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-brand-border flex flex-col justify-between shrink-0 h-screen sticky top-0 z-20 select-none">

      {/* Brand Header */}
      <div className="p-6 border-b border-brand-border/60">
        <div className="flex items-center gap-3">
          {/* Logo Icon Container utilizing Navy to Blue Gradient */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-navy to-brand-blue flex items-center justify-center shadow-md border border-brand-border relative overflow-hidden group">
            <span className="font-extrabold text-sm text-white uppercase tracking-wider relative z-10">
              {tenantName.substring(0, 1)}
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-brand-navy truncate leading-tight">
              {tenantName}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold mt-0.5 tracking-wide uppercase">
              Pemilik Toko
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-6">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.isComingSoon ? '#' : item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 select-none group
                ${isActive
                  ? 'bg-blue-50/50 text-brand-blue'
                  : 'text-slate-600 hover:text-brand-navy hover:bg-slate-50'
                }
                ${item.isComingSoon ? 'cursor-not-allowed opacity-80' : ''}
              `}
              onClick={(e) => {
                if (item.isComingSoon) {
                  e.preventDefault();
                }
              }}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-105
                  ${isActive ? 'text-brand-blue' : 'text-slate-400 group-hover:text-brand-blue'}`}
                />
                <span className="font-semibold">{item.name}</span>
              </div>

              {/* Coming Soon Badge */}
              {item.isComingSoon && (
                <span className="text-[8px] px-1.5 py-0.5 bg-slate-100 text-slate-400 rounded-md uppercase font-bold tracking-wider shrink-0 scale-90 border border-slate-200/50">
                  Segera Hadir
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-brand-border bg-slate-50/50">
        <a
          href="https://daganta.store"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-semibold text-[11px] rounded-xl transition-all border border-brand-border shadow-sm group"
        >
          <Store className="w-3.5 h-3.5 text-brand-blue transition-transform group-hover:scale-105" />
          <span>Lihat Webstore</span>
          <ExternalLink className="w-3 h-3 text-slate-400 ml-0.5" />
        </a>
      </div>

    </aside>
  );
}

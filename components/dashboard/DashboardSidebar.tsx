'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CreditCard,
  Home,
  Package,
  Settings,
  ShoppingCart,
  Store,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardSidebarProps {
  tenantName?: string;
  ownerName?: string;
}

const navigationItems = [
  { label: 'Beranda', href: '/dashboard', icon: Home },
  { label: 'Produk', href: '/dashboard/products', icon: Package },
  { label: 'Pesanan', href: '/dashboard/orders', icon: ShoppingCart },
  { label: 'Pelanggan', href: '/dashboard/customers', icon: Users },
  { label: 'Paket & Billing', href: '/dashboard/billing', icon: CreditCard },
  { label: 'Pengaturan Toko', href: '/dashboard/settings', icon: Settings },
];

export function DashboardSidebar({
  tenantName = 'Toya Nusantara',
  ownerName = 'Owner Toko',
}: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-[240px] flex-col bg-[#1A355C] text-white">
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
          <Store className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">Daganta</p>
          <p className="truncate text-xs text-white/60">Dashboard Owner</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/dashboard'
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/78 transition-colors hover:bg-white/10 hover:text-white',
                isActive && 'bg-white text-[#1A355C] hover:bg-white hover:text-[#1A355C]'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="rounded-lg bg-white/10 p-3">
          <p className="truncate text-sm font-semibold">{tenantName}</p>
          <p className="mt-1 truncate text-xs text-white/65">{ownerName}</p>
        </div>
      </div>
    </aside>
  );
}

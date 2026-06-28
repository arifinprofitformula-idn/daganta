'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CreditCard, Gift, Home, PlusCircle, Store, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigationItems = [
  { label: 'Beranda', href: '/agent', icon: Home },
  { label: 'Klien Saya', href: '/agent/clients', icon: Users },
  { label: 'Buat Toko Klien', href: '/agent/clients/new', icon: PlusCircle },
  { label: 'Saldo Kredit', href: '/agent/credits', icon: CreditCard },
  { label: 'Referral', href: '/agent/referral', icon: Gift },
];

interface AgentSidebarProps {
  agentName: string;
  agentCode: string;
}

export function AgentSidebar({ agentName, agentCode }: AgentSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-[248px] flex-col bg-[#123047] text-white">
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
          <Store className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">Daganta Agent</p>
          <p className="truncate text-xs text-white/60">Dashboard Agen</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/agent'
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/78 transition-colors hover:bg-white/10 hover:text-white',
                isActive && 'bg-white text-[#123047] hover:bg-white hover:text-[#123047]'
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
          <p className="truncate text-sm font-semibold">{agentName}</p>
          <p className="mt-1 truncate text-xs text-white/65">{agentCode}</p>
        </div>
      </div>
    </aside>
  );
}

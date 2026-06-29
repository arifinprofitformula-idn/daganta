'use client';

import { LogOut, Menu, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';

interface DashboardTopbarProps {
  tenantName?: string;
  userName?: string | null;
  userEmail?: string;
  variant?: 'store' | 'platform-admin';
}

export function DashboardTopbar({
  tenantName = 'Toya Nusantara',
  userName,
  userEmail = '',
  variant = 'store',
}: DashboardTopbarProps) {
  const displayName = userName || userEmail || 'Owner Toko';
  const displayEmail = userEmail || 'Akun aktif';
  const avatarInitial = (displayName || displayEmail).slice(0, 1).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
      <div className="flex items-center gap-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Buka navigasi dashboard"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[240px] max-w-[240px] border-0 bg-[#1A355C] p-0"
            showCloseButton={false}
          >
            <SheetTitle className="sr-only">Navigasi dashboard</SheetTitle>
            <SheetDescription className="sr-only">
              Menu utama untuk mengelola toko Daganta.
            </SheetDescription>
            <DashboardSidebar
              tenantName={tenantName}
              ownerName={displayName}
              variant={variant}
            />
          </SheetContent>
        </Sheet>

        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-slate-900">{tenantName}</p>
          <p className="text-xs text-slate-500">
            {variant === 'platform-admin' ? 'Dashboard Admin Platform' : 'Dashboard Toko'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-slate-900">{displayName}</p>
          <p className="max-w-[180px] truncate text-xs text-slate-500">{displayEmail}</p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700">
          {avatarInitial ? (
            <span className="text-sm font-semibold">{avatarInitial}</span>
          ) : (
            <UserRound className="h-4 w-4" aria-hidden="true" />
          )}
        </div>

        <details className="relative">
          <summary className="list-none">
            <Button type="button" variant="outline" size="sm" className="cursor-pointer">
              Akun
            </Button>
          </summary>
          <div className="absolute right-0 mt-2 w-40 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
            <form action="/logout" method="post">
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="w-full justify-start text-slate-700 hover:text-rose-600"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Keluar
              </Button>
            </form>
          </div>
        </details>
      </div>
    </header>
  );
}

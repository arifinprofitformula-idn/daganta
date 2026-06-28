'use client';

import { LogOut, Menu, UserRound } from 'lucide-react';
import { AgentSidebar } from '@/components/agent/AgentSidebar';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface AgentTopbarProps {
  agentName: string;
  agentCode: string;
  userEmail: string;
  creditBalance: string;
}

export function AgentTopbar({ agentName, agentCode, userEmail, creditBalance }: AgentTopbarProps) {
  const avatarInitial = (agentName || userEmail).slice(0, 1).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
      <div className="flex items-center gap-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button type="button" variant="ghost" size="icon" className="md:hidden" aria-label="Buka navigasi agen">
              <Menu className="h-5 w-5" aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[248px] max-w-[248px] border-0 bg-[#123047] p-0" showCloseButton={false}>
            <SheetTitle className="sr-only">Navigasi agen</SheetTitle>
            <SheetDescription className="sr-only">Menu utama dashboard agen Daganta.</SheetDescription>
            <AgentSidebar agentName={agentName} agentCode={agentCode} />
          </SheetContent>
        </Sheet>

        <div>
          <p className="text-sm font-semibold text-slate-900">{agentName}</p>
          <p className="text-xs text-slate-500">Dashboard Agen</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-right">
          <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-700">Saldo Kredit</p>
          <p className="text-sm font-black text-emerald-800">{creditBalance}</p>
        </div>

        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-slate-900">{agentName}</p>
          <p className="max-w-[180px] truncate text-xs text-slate-500">{userEmail}</p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700">
          {avatarInitial ? (
            <span className="text-sm font-semibold">{avatarInitial}</span>
          ) : (
            <UserRound className="h-4 w-4" aria-hidden="true" />
          )}
        </div>

        <form action="/logout" method="post">
          <Button type="submit" variant="outline" size="sm">
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Keluar</span>
          </Button>
        </form>
      </div>
    </header>
  );
}

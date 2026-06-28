import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { AgentStatus } from '@prisma/client';
import { AgentSidebar } from '@/components/agent/AgentSidebar';
import { AgentTopbar } from '@/components/agent/AgentTopbar';
import { getCurrentUserProfile } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function formatRupiah(value: number | string | { toString(): string }) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value.toString()));
}

export default async function AgentLayout({ children }: { children: ReactNode }) {
  const authData = await getCurrentUserProfile();

  if (!authData?.user || !authData.profile) {
    redirect('/login');
  }

  const agentProfile = await prisma.agentProfile.findUnique({
    where: {
      userProfileId: authData.profile.id,
    },
    select: {
      id: true,
      displayName: true,
      agentCode: true,
      status: true,
      creditBalance: true,
      userProfile: {
        select: {
          email: true,
        },
      },
    },
  });

  if (!agentProfile) {
    redirect('/dashboard');
  }

  if (agentProfile.status === AgentStatus.SUSPENDED || agentProfile.status === AgentStatus.ARCHIVED) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto mt-20 max-w-md rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-lg font-bold text-slate-950">Akun Agen Tidak Aktif</h1>
          <p className="mt-2 text-sm text-slate-500">Silakan hubungi admin Daganta untuk mengaktifkan kembali akun agen Anda.</p>
        </div>
      </main>
    );
  }

  const creditBalance = formatRupiah(agentProfile.creditBalance);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-950">
      <div className="hidden min-h-screen shrink-0 md:block">
        <AgentSidebar agentName={agentProfile.displayName} agentCode={agentProfile.agentCode} />
      </div>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <AgentTopbar
          agentName={agentProfile.displayName}
          agentCode={agentProfile.agentCode}
          userEmail={agentProfile.userProfile.email}
          creditBalance={creditBalance}
        />
        <main className="flex-1 p-4 md:p-8">
          <div className="mx-auto w-full max-w-7xl space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

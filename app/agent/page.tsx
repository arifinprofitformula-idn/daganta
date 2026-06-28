import { CreditCard, Store, TrendingUp, Users } from 'lucide-react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentUserProfile } from '@/lib/auth/session';
import { getAgentStats } from '@/lib/data-access/agent';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function AgentHomePage() {
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
      referralCode: true,
    },
  });

  if (!agentProfile) {
    redirect('/dashboard');
  }

  const stats = await getAgentStats(agentProfile.id);
  const cards = [
    {
      label: 'Saldo Kredit',
      value: formatRupiah(stats.creditBalance),
      icon: CreditCard,
      description: 'Saldo siap digunakan untuk aktivasi toko klien.',
    },
    {
      label: 'Klien Aktif',
      value: stats.activeClients.toString(),
      icon: Users,
      description: 'Toko aktif yang masih dikelola agen.',
    },
    {
      label: 'Klien Baru Bulan Ini',
      value: stats.newClientsThisMonth.toString(),
      icon: Store,
      description: 'Draft atau toko baru yang dibuat bulan berjalan.',
    },
    {
      label: 'Total Komisi',
      value: 'Segera Hadir',
      icon: TrendingUp,
      description: 'Komisi otomatis disiapkan untuk Sprint 8.',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">Agent Dashboard</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Beranda Agent</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Pantau saldo kredit, jumlah klien aktif, dan performa awal jaringan toko Anda.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">Kode Agen: {agentProfile.agentCode}</span>
          {agentProfile.referralCode ? (
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
              Referral: {agentProfile.referralCode}
            </span>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-slate-500">{card.label}</CardTitle>
                <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tracking-tight text-slate-950">{card.value}</div>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">{card.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

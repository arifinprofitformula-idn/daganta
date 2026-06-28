import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { AgentStatus } from '@prisma/client';
import { ClientStoreForm } from '@/components/agent/ClientStoreForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getCurrentUserProfile } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface NewAgentClientPageProps {
  searchParams: Promise<{
    error?: string;
  }>;
}

export default async function NewAgentClientPage({ searchParams }: NewAgentClientPageProps) {
  const params = await searchParams;
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
      status: true,
      creditBalance: true,
      maxActiveClients: true,
      displayName: true,
      clients: {
        where: {
          status: 'ACTIVE',
        },
        select: {
          id: true,
        },
      },
    },
  });

  if (!agentProfile) {
    redirect('/dashboard');
  }

  const plans = await prisma.subscriptionPlan.findMany({
    where: {
      isActive: true,
    },
    orderBy: [
      {
        price: 'asc',
      },
      {
        name: 'asc',
      },
    ],
    select: {
      id: true,
      name: true,
      code: true,
      price: true,
      productLimit: true,
      activeMonths: true,
    },
  });

  const activeClientCount = agentProfile.clients.length;
  const quotaFull = activeClientCount >= agentProfile.maxActiveClients;
  const agentDisabled = agentProfile.status !== AgentStatus.ACTIVE;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-3 mb-3">
            <Link href="/agent/clients">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Klien Saya
            </Link>
          </Button>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">Client Store</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Buat Toko Klien</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Buat toko aktif untuk klien UMKM dan potong saldo kredit agen dalam satu transaksi aman.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600">
          Klien aktif: {activeClientCount} / {agentProfile.maxActiveClients}
        </div>
      </div>

      {params.error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
          {params.error}
        </div>
      ) : null}

      {agentDisabled || quotaFull || plans.length === 0 ? (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex gap-3 pt-6 text-amber-900">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-bold">Form belum bisa digunakan</p>
              <p className="mt-1 text-sm">
                {agentDisabled
                  ? 'Akun agen Anda belum aktif atau sedang dibatasi.'
                  : quotaFull
                    ? 'Kuota klien aktif Anda sudah penuh.'
                    : 'Belum ada paket aktif yang bisa dipilih.'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <ClientStoreForm
          creditBalance={Number(agentProfile.creditBalance)}
          plans={plans.map((plan) => ({
            id: plan.id,
            name: plan.name,
            code: plan.code,
            price: Number(plan.price),
            productLimit: plan.productLimit,
            activeMonths: plan.activeMonths,
          }))}
        />
      )}
    </div>
  );
}

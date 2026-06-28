import Link from 'next/link';
import { AlertCircle, CheckCircle2, ShieldCheck, XCircle } from 'lucide-react';
import { AgentCreditTopupStatus, PlatformRole } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getCurrentPlatformUser } from '@/lib/auth/platform-access';
import { prisma } from '@/lib/prisma';
import { confirmTopupAction, rejectTopupAction } from './actions';

export const dynamic = 'force-dynamic';

interface AdminAgentTopupsPageProps {
  searchParams?: Promise<{
    error?: string;
    success?: string;
  }>;
}

function formatRupiah(value: number | string | { toString(): string }) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value.toString()));
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function RestrictedState() {
  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto mt-16 max-w-md rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm">
        <AlertCircle className="mx-auto h-10 w-10 text-rose-600" />
        <h1 className="mt-4 text-lg font-bold text-slate-950">Akses Terbatas</h1>
        <p className="mt-2 text-sm text-slate-500">Halaman ini hanya tersedia untuk super admin Daganta.</p>
      </div>
    </main>
  );
}

export default async function AdminAgentTopupsPage({ searchParams }: AdminAgentTopupsPageProps) {
  const params = searchParams ? await searchParams : {};
  const platformUser = await getCurrentPlatformUser();

  if (!platformUser || platformUser.profile.platformRole !== PlatformRole.SUPER_ADMIN) {
    return <RestrictedState />;
  }

  const requests = await prisma.agentCreditTopupRequest.findMany({
    where: {
      status: AgentCreditTopupStatus.PENDING,
    },
    include: {
      agent: {
        select: {
          displayName: true,
          agentCode: true,
          creditBalance: true,
          userProfile: {
            select: {
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-700">
                <ShieldCheck className="h-4 w-4" />
                Super Admin
              </div>
              <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">Top-up Kredit Agent</h1>
              <p className="mt-1 text-sm text-slate-500">Konfirmasi atau tolak request top-up kredit dari agent.</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/dashboard">Kembali ke Dashboard</Link>
            </Button>
          </div>
        </div>

        {params.success ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
            {params.success}
          </div>
        ) : null}

        {params.error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
            {params.error}
          </div>
        ) : null}

        <Card>
          <CardHeader className="border-b">
            <CardTitle>Request Pending</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {requests.length === 0 ? (
              <div className="p-8 text-sm text-slate-500">Tidak ada request top-up pending.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Jumlah Request</TableHead>
                    <TableHead>Saldo Saat Ini</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Catatan</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="font-semibold text-slate-950">{request.agent.displayName}</div>
                        <div className="text-xs text-slate-500">{request.agent.agentCode} - {request.agent.userProfile.email}</div>
                      </TableCell>
                      <TableCell className="font-bold text-emerald-700">{formatRupiah(request.amount)}</TableCell>
                      <TableCell>{formatRupiah(request.agent.creditBalance)}</TableCell>
                      <TableCell>{formatDate(request.createdAt)}</TableCell>
                      <TableCell className="max-w-[280px] truncate text-slate-500">{request.note || '-'}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Badge variant="outline" className="mr-2 border-amber-200 bg-amber-50 text-amber-700">
                            PENDING
                          </Badge>
                          <form action={confirmTopupAction.bind(null, request.id)}>
                            <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                              Konfirmasi
                            </Button>
                          </form>
                          <form action={rejectTopupAction.bind(null, request.id)}>
                            <Button type="submit" size="sm" variant="destructive">
                              <XCircle className="h-4 w-4" aria-hidden="true" />
                              Tolak
                            </Button>
                          </form>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

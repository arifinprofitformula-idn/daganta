import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AgentCreditDirection } from '@prisma/client';
import { CreditCard, PlusCircle } from 'lucide-react';
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

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default async function AgentCreditsPage() {
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
      creditBalance: true,
      creditLedger: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 30,
      },
      topupRequests: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      },
    },
  });

  if (!agentProfile) {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-blue-50">
        <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700">
              <CreditCard className="h-4 w-4" aria-hidden="true" />
              Saldo Kredit
            </div>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">
              {formatRupiah(agentProfile.creditBalance)}
            </h1>
            <p className="mt-2 text-sm text-slate-500">Saldo aktif untuk membuat dan mengaktifkan toko klien.</p>
          </div>
          <Button asChild size="lg">
            <Link href="/agent/credits/topup">
              <PlusCircle className="h-4 w-4" aria-hidden="true" />
              Request Top-up Kredit
            </Link>
          </Button>
        </CardContent>
      </Card>

      {agentProfile.topupRequests.length > 0 ? (
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Request Top-up Terbaru</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Catatan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agentProfile.topupRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{formatDate(request.createdAt)}</TableCell>
                    <TableCell className="font-semibold">{formatRupiah(request.amount)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{request.status}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[320px] truncate text-slate-500">{request.note || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Riwayat Transaksi Kredit</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {agentProfile.creditLedger.length === 0 ? (
            <div className="p-8 text-sm text-slate-500">Belum ada transaksi kredit.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Saldo Setelah</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agentProfile.creditLedger.map((entry) => {
                  const isCredit = entry.direction === AgentCreditDirection.CREDIT;

                  return (
                    <TableRow key={entry.id}>
                      <TableCell>{formatDate(entry.createdAt)}</TableCell>
                      <TableCell className="font-medium text-slate-900">{entry.description || entry.type}</TableCell>
                      <TableCell className={isCredit ? 'font-bold text-emerald-700' : 'font-bold text-rose-700'}>
                        {isCredit ? '+' : '-'}
                        {formatRupiah(entry.amount)}
                      </TableCell>
                      <TableCell className="font-semibold">{formatRupiah(entry.balanceAfter)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

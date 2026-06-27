import Link from 'next/link';
import { AlertTriangle, LockKeyhole, TimerReset } from 'lucide-react';
import { TenantStatus } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { prisma } from '@/lib/prisma';

const DAY_MS = 24 * 60 * 60 * 1000;

function daysUntil(date: Date | null) {
  if (!date) {
    return null;
  }

  return Math.max(0, Math.ceil((date.getTime() - Date.now()) / DAY_MS));
}

interface TenantStatusBannerProps {
  tenantId: string;
}

export async function TenantStatusBanner({ tenantId }: TenantStatusBannerProps) {
  const tenant = await prisma.tenant.findUnique({
    where: {
      id: tenantId,
    },
    select: {
      status: true,
      subscriptionEndsAt: true,
      gracePeriodEndsAt: true,
      limitedAt: true,
    },
  });

  if (!tenant) {
    return null;
  }

  if (tenant.status === TenantStatus.EXPIRING_SOON) {
    const remainingDays = daysUntil(tenant.subscriptionEndsAt);

    return (
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <TimerReset className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <div>
            <p className="text-sm font-bold">Paket berakhir {remainingDays ?? 0} hari lagi</p>
            <p className="mt-1 text-sm text-amber-800">Perpanjang paket agar toko tetap aktif tanpa gangguan.</p>
          </div>
        </div>
        <Button asChild className="bg-amber-600 text-white hover:bg-amber-700">
          <Link href="/dashboard/billing">Perpanjang Sekarang</Link>
        </Button>
      </div>
    );
  }

  if (tenant.status === TenantStatus.GRACE_PERIOD) {
    const remainingDays = daysUntil(tenant.gracePeriodEndsAt);

    return (
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <div>
            <p className="text-sm font-bold">Masa tenggang: {remainingDays ?? 0} hari tersisa</p>
            <p className="mt-1 text-sm text-rose-800">Perpanjang segera sebelum fitur checkout dan katalog dibatasi.</p>
          </div>
        </div>
        <Button asChild variant="destructive">
          <Link href="/dashboard/billing">Perpanjang Segera</Link>
        </Button>
      </div>
    );
  }

  if (tenant.status === TenantStatus.LIMITED) {
    return (
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <div>
            <p className="text-sm font-bold">Paket tidak aktif, dashboard dalam mode terbatas</p>
            <p className="mt-1 text-sm text-rose-800">Tambah dan edit produk dibatasi sampai paket diperpanjang.</p>
          </div>
        </div>
        <Button asChild variant="destructive">
          <Link href="/dashboard/billing">Perpanjang Paket</Link>
        </Button>
      </div>
    );
  }

  return null;
}

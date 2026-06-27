import Link from 'next/link';
import { AlertTriangle, CalendarDays, CheckCircle2, Clock3, Package } from 'lucide-react';
import { SubscriptionStatus } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, formatRupiah, getBillingCycleLabel } from '@/lib/billing/pricing';
import type { ActiveTenantPlan } from '@/lib/data-access/billing';

interface PlanCardProps {
  subscription: ActiveTenantPlan | null;
  productCount: number;
}

function getDaysRemaining(endDate: Date | null | undefined) {
  if (!endDate) {
    return null;
  }

  const now = new Date();
  const diffMs = endDate.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

function getProgressPercent(startDate: Date | null | undefined, endDate: Date | null | undefined) {
  if (!startDate || !endDate) {
    return 0;
  }

  const now = Date.now();
  const start = startDate.getTime();
  const end = endDate.getTime();
  const total = end - start;

  if (total <= 0) {
    return 100;
  }

  const elapsed = Math.min(Math.max(now - start, 0), total);
  return Math.round((elapsed / total) * 100);
}

function getDisplayStatus(subscription: ActiveTenantPlan | null) {
  if (!subscription) {
    return {
      label: 'Belum Ada Paket',
      tone: 'border-slate-200 bg-slate-100 text-slate-700',
    };
  }

  if (subscription.status === SubscriptionStatus.GRACE_PERIOD || subscription.status === SubscriptionStatus.LIMITED_MODE) {
    return {
      label: 'GRACE_PERIOD',
      tone: 'border-rose-200 bg-rose-50 text-rose-700',
    };
  }

  const daysRemaining = getDaysRemaining(subscription.currentPeriodEnd);
  if (daysRemaining !== null && daysRemaining < 14) {
    return {
      label: 'EXPIRING_SOON',
      tone: 'border-orange-200 bg-orange-50 text-orange-700',
    };
  }

  return {
    label: 'ACTIVE',
    tone: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  };
}

export function PlanCard({ subscription, productCount }: PlanCardProps) {
  const plan = subscription?.plan;
  const daysRemaining = getDaysRemaining(subscription?.currentPeriodEnd);
  const progressPercent = getProgressPercent(subscription?.currentPeriodStart, subscription?.currentPeriodEnd);
  const remainingPercent = Math.max(0, 100 - progressPercent);
  const status = getDisplayStatus(subscription);
  const productLimit = plan?.productLimit ?? 0;
  const productPercent = productLimit > 0 ? Math.min(100, Math.round((productCount / productLimit) * 100)) : 0;

  return (
    <Card className="overflow-hidden border-slate-200">
      <CardHeader className="border-b bg-slate-50/70">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Paket Aktif</p>
            <CardTitle className="mt-2 text-2xl text-slate-950">
              {plan ? plan.name : 'Belum ada paket aktif'}
            </CardTitle>
            {plan && (
              <p className="mt-1 text-sm text-slate-500">
                {formatRupiah(plan.price)} / {getBillingCycleLabel(plan.billingCycle).toLowerCase()}
              </p>
            )}
          </div>
          <Badge variant="outline" className={status.tone}>
            {status.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        {daysRemaining !== null && daysRemaining < 14 && (
          <div className="flex gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="font-semibold">Paket Anda berakhir dalam {daysRemaining} hari.</p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 p-4">
            <CalendarDays className="h-5 w-5 text-slate-500" />
            <p className="mt-3 text-xs font-semibold uppercase text-slate-400">Expired</p>
            <p className="mt-1 font-bold text-slate-950">{formatDate(subscription?.currentPeriodEnd)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4">
            <Clock3 className="h-5 w-5 text-slate-500" />
            <p className="mt-3 text-xs font-semibold uppercase text-slate-400">Sisa waktu</p>
            <p className="mt-1 font-bold text-slate-950">
              {daysRemaining === null ? '-' : `${daysRemaining} hari`}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4">
            <Package className="h-5 w-5 text-slate-500" />
            <p className="mt-3 text-xs font-semibold uppercase text-slate-400">Limit produk</p>
            <p className="mt-1 font-bold text-slate-950">
              {productLimit > 0 ? `${productCount} / ${productLimit}` : `${productCount}`}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Progress masa aktif</span>
            <span>{remainingPercent}% tersisa</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${remainingPercent}%` }} />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Penggunaan produk</span>
            <span>{productPercent}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-blue-600" style={{ width: `${productPercent}%` }} />
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Paket bisa diperpanjang sebelum masa aktif habis.</span>
          </div>
          <Button asChild>
            <Link href="/dashboard/billing/plans">Perpanjang Paket</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

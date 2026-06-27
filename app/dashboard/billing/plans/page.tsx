import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Package, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatRupiah, getBillingCycleLabel } from '@/lib/billing/pricing';
import { getActiveTenantContext } from '@/lib/auth/tenant-access';
import { getPlanOptions } from '@/lib/data-access/billing';

export const dynamic = 'force-dynamic';

export default async function BillingPlansPage() {
  const tenantCtx = await getActiveTenantContext();

  if (tenantCtx.status !== 'SUCCESS' || !tenantCtx.activeTenant) {
    return null;
  }

  const plans = await getPlanOptions();

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <Button asChild variant="ghost" className="-ml-3 mb-3">
          <Link href="/dashboard/billing">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Billing
          </Link>
        </Button>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">Pilih Paket</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Upgrade atau Perpanjang Paket</h1>
        <p className="mt-1 text-sm text-slate-500">
          Pilih paket yang sesuai dengan kapasitas produk dan masa aktif toko Anda.
        </p>
      </div>

      {plans.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-sm text-slate-500">
            Belum ada paket aktif yang tersedia. Silakan hubungi admin Daganta.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.id} className="flex flex-col border-slate-200">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {getBillingCycleLabel(plan.billingCycle)}
                  </span>
                </div>
                <CardTitle className="mt-4 text-xl text-slate-950">{plan.name}</CardTitle>
                <p className="text-sm leading-6 text-slate-500">
                  {plan.description || 'Paket webstore Daganta untuk operasional toko online.'}
                </p>
              </CardHeader>

              <CardContent className="flex-1 space-y-5">
                <div>
                  <p className="text-3xl font-black text-slate-950">{formatRupiah(plan.price)}</p>
                  <p className="text-sm font-medium text-slate-500">
                    Masa aktif {plan.activeMonths} bulan
                  </p>
                </div>

                <div className="space-y-3 text-sm">
                  <Feature label={`Maksimal ${plan.productLimit} produk`} icon={<Package className="h-4 w-4" />} />
                  <Feature label={`Trial ${plan.trialDays} hari untuk toko baru`} />
                  <Feature label={`Grace period ${plan.gracePeriodDays} hari`} />
                  <Feature label="Komisi transaksi Daganta Rp0" />
                </div>
              </CardContent>

              <CardFooter>
                <Button className="w-full" disabled>
                  Pilih Paket
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800">
        Alur pembayaran paket akan diaktifkan pada Sprint 5-P2. Untuk sprint ini, tombol pilih paket masih placeholder.
      </div>
    </div>
  );
}

function Feature({ label, icon }: { label: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-slate-700">
      {icon ?? <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
      <span>{label}</span>
    </div>
  );
}

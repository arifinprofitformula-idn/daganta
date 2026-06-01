import React from 'react';
import { CheckCircle, Clock3, CreditCard, FileText, Package, ShieldCheck } from 'lucide-react';
import { InvoiceStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getActiveTenantContext } from '@/lib/auth/tenant-access';
import { canManageBillingManually, canUseBillingPaymentSimulation } from '@/lib/billing/access';
import {
  formatDate,
  formatRupiah,
  getBillingCycleLabel,
  getInvoiceStatusLabel,
  getSubscriptionStatusLabel,
  PAYMENT_INSTRUCTION_PLACEHOLDER,
} from '@/lib/billing/pricing';
import { createManualInvoiceAction, simulateInvoicePaymentAction } from './actions';

export const dynamic = 'force-dynamic';

const statusTone: Record<InvoiceStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-600 border-slate-200',
  UNPAID: 'bg-amber-50 text-amber-700 border-amber-200',
  PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  VOID: 'bg-rose-50 text-rose-700 border-rose-200',
};

export default async function Page() {
  const tenantCtx = await getActiveTenantContext();
  if (tenantCtx.status !== 'SUCCESS' || !tenantCtx.activeTenant) {
    return null;
  }

  const tenant = tenantCtx.activeTenant;
  const [productCount, plans, subscription, invoices] = await Promise.all([
    prisma.product.count({
      where: { tenantId: tenant.id },
    }),
    prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: [{ productLimit: 'asc' }, { billingCycle: 'asc' }],
    }),
    prisma.tenantSubscription.findFirst({
      where: { tenantId: tenant.id },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.invoice.findMany({
      where: { tenantId: tenant.id },
      include: { plan: true, subscription: { include: { plan: true } } },
      orderBy: { issuedAt: 'desc' },
      take: 8,
    }),
  ]);

  const activePlan = subscription?.plan;
  const productLimit = activePlan?.productLimit || 0;
  const productUsageText = productLimit > 0 ? `Produk terpakai: ${productCount} / ${productLimit}` : `Produk terpakai: ${productCount}`;
  const canCreateInvoice = canManageBillingManually(tenantCtx);
  const canSimulatePayment = canUseBillingPaymentSimulation(tenantCtx);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 border-b border-brand-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-brand-blue">
            Revenue Engine Foundation
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-brand-navy">
            Paket Aktif & Biaya
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Pantau paket, masa aktif toko, kuota produk, dan tagihan manual Daganta.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <section className="rounded-3xl border border-brand-border bg-white p-6 shadow-sm xl:col-span-2">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <span className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue">
                Paket Aktif
              </span>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-brand-navy">
                {activePlan ? `Daganta ${activePlan.name}` : 'Belum ada paket aktif'}
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                Daganta menerapkan biaya tetap bulanan atau tahunan dengan komisi Daganta dari transaksi sebesar Rp0.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 px-5 py-4 text-left lg:text-right">
              <p className="text-xs font-semibold text-slate-500">Biaya paket</p>
              <p className="mt-1 text-2xl font-black text-brand-navy">
                {activePlan ? formatRupiah(activePlan.price) : '-'}
              </p>
              <p className="text-xs font-semibold text-slate-400">
                {activePlan ? getBillingCycleLabel(activePlan.billingCycle) : 'Pilih paket saat membuat tagihan'}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <InfoCard
              icon={<ShieldCheck className="h-4 w-4" />}
              label="Status paket"
              value={subscription ? getSubscriptionStatusLabel(subscription.status) : 'Belum tersedia'}
            />
            <InfoCard
              icon={<Clock3 className="h-4 w-4" />}
              label="Masa aktif toko"
              value={formatDate(subscription?.currentPeriodEnd)}
            />
            <InfoCard
              icon={<Clock3 className="h-4 w-4" />}
              label="Masa tenggang"
              value={formatDate(subscription?.gracePeriodEndsAt)}
            />
            <InfoCard
              icon={<Package className="h-4 w-4" />}
              label="Kuota produk"
              value={productUsageText}
            />
          </div>

          <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50/70 p-4 text-sm text-amber-800">
            <strong className="font-extrabold">Checkout sementara dibatasi</strong> dapat diterapkan jika masa aktif dan masa tenggang sudah lewat.
          </div>
        </section>

        <section className="rounded-3xl border border-brand-border bg-brand-navy p-6 text-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/10 p-3 text-blue-100">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black">Kebijakan Harga</h2>
              <p className="text-xs text-blue-100/80">Tetap, ringan, dan mudah dipahami.</p>
            </div>
          </div>

          <div className="mt-6 space-y-3 text-sm">
            <PolicyRow label="Trial" value="14 hari" />
            <PolicyRow label="Masa tenggang" value="7 hari" />
            <PolicyRow label="Komisi Daganta" value="Rp0" />
            <PolicyRow label="Tahunan" value="Bayar 10 bulan, aktif 12 bulan" />
          </div>

          <p className="mt-6 rounded-2xl bg-white/10 p-4 text-xs leading-5 text-blue-50/90">
            Perpanjang paket dilakukan melalui tagihan manual. Tidak ada auto-charge dan tidak ada payment gateway pada fondasi v0.2E.
          </p>
        </section>
      </div>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="rounded-3xl border border-brand-border bg-white p-6 shadow-sm xl:col-span-1">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-brand-blue" />
            <h2 className="text-lg font-black text-brand-navy">Perpanjang paket</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Buat tagihan manual untuk paket bulanan atau tahunan. Instruksi pembayaran akan dikonfirmasi admin Daganta.
          </p>

          {canCreateInvoice ? (
            <form action={createManualInvoiceAction} className="mt-5 space-y-3">
              <label className="block text-xs font-bold text-slate-500" htmlFor="planCode">
                Pilih paket
              </label>
              <select
                id="planCode"
                name="planCode"
                className="w-full rounded-2xl border border-brand-border bg-white px-4 py-3 text-sm font-semibold text-brand-navy outline-none transition focus:border-brand-blue"
                defaultValue={activePlan?.code || plans[0]?.code}
              >
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.code}>
                    {plan.name} {getBillingCycleLabel(plan.billingCycle)} - {formatRupiah(plan.price)} - {plan.productLimit} produk
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="w-full rounded-2xl bg-brand-blue px-4 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-brand-navy"
              >
                Buat Tagihan Manual
              </button>
            </form>
          ) : (
            <p className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
              Pembuatan tagihan manual hanya tersedia untuk pemilik toko atau admin Daganta.
            </p>
          )}
        </div>

        <div className="rounded-3xl border border-brand-border bg-white p-6 shadow-sm xl:col-span-2">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-brand-blue" />
            <h2 className="text-lg font-black text-brand-navy">Riwayat Tagihan</h2>
          </div>

          <div className="mt-5 space-y-3">
            {invoices.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                Belum ada tagihan untuk toko ini.
              </div>
            ) : (
              invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="rounded-2xl border border-brand-border p-4 transition hover:border-brand-blue/40"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-black text-brand-navy">{invoice.invoiceNumber}</p>
                        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-extrabold ${statusTone[invoice.status]}`}>
                          {getInvoiceStatusLabel(invoice.status)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        {getBillingCycleLabel(invoice.billingCycle)} · {formatDate(invoice.periodStart)} sampai {formatDate(invoice.periodEnd)}
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        {invoice.paymentInstructions || PAYMENT_INSTRUCTION_PLACEHOLDER} Konfirmasi pembayaran akan diverifikasi oleh admin Daganta.
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 md:items-end">
                      <p className="text-lg font-black text-brand-navy">{formatRupiah(invoice.amount)}</p>
                      {invoice.status === InvoiceStatus.UNPAID && canSimulatePayment ? (
                        <form action={simulateInvoicePaymentAction}>
                          <input type="hidden" name="invoiceId" value={invoice.id} />
                          <button
                            type="submit"
                            className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-extrabold text-emerald-700 transition hover:bg-emerald-100"
                          >
                            Simulasikan Lunas
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-brand-border bg-slate-50/70 p-4">
      <div className="flex items-center gap-2 text-brand-blue">
        {icon}
        <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{label}</span>
      </div>
      <p className="mt-3 text-lg font-black text-brand-navy">{value}</p>
    </div>
  );
}

function PolicyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-white/10 px-4 py-3">
      <span className="text-xs font-bold text-blue-100/80">{label}</span>
      <span className="text-right text-sm font-black text-white">{value}</span>
    </div>
  );
}

import Link from 'next/link';
import { Download, ExternalLink, FileText } from 'lucide-react';
import { InvoiceStatus } from '@prisma/client';
import { PlanCard } from '@/components/dashboard/billing/PlanCard';
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
import { formatDate, formatRupiah } from '@/lib/billing/pricing';
import { getActiveTenantContext } from '@/lib/auth/tenant-access';
import { getActivePlanByTenant, getInvoicesByTenant } from '@/lib/data-access/billing';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function getInvoiceDisplayStatus(invoice: { status: InvoiceStatus; dueAt: Date | null }) {
  if (invoice.status === InvoiceStatus.PAID) {
    return {
      label: 'PAID',
      className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    };
  }

  if (invoice.status === InvoiceStatus.PENDING_VERIFICATION) {
    return {
      label: 'MENUNGGU VERIFIKASI',
      className: 'border-blue-200 bg-blue-50 text-blue-700',
    };
  }

  if (invoice.status === InvoiceStatus.REJECTED) {
    return {
      label: 'DITOLAK',
      className: 'border-rose-200 bg-rose-50 text-rose-700',
    };
  }

  if (invoice.status === InvoiceStatus.UNPAID && invoice.dueAt && invoice.dueAt.getTime() < Date.now()) {
    return {
      label: 'OVERDUE',
      className: 'border-rose-200 bg-rose-50 text-rose-700',
    };
  }

  if (invoice.status === InvoiceStatus.UNPAID || invoice.status === InvoiceStatus.DRAFT) {
    return {
      label: 'PENDING',
      className: 'border-amber-200 bg-amber-50 text-amber-700',
    };
  }

  return {
    label: 'VOID',
    className: 'border-slate-200 bg-slate-100 text-slate-700',
  };
}

export default async function BillingPage() {
  const tenantCtx = await getActiveTenantContext();

  if (tenantCtx.status !== 'SUCCESS' || !tenantCtx.activeTenant) {
    return null;
  }

  const tenantId = tenantCtx.activeTenant.id;
  const [subscription, invoices, productCount] = await Promise.all([
    getActivePlanByTenant(tenantId),
    getInvoicesByTenant(tenantId, { page: 1, limit: 10 }),
    prisma.product.count({
      where: {
        tenantId,
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">Billing</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Paket & Billing</h1>
          <p className="mt-1 text-sm text-slate-500">
            Pantau paket aktif, kuota produk, masa aktif toko, dan riwayat invoice.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/billing/plans">Perpanjang Paket</Link>
        </Button>
      </div>

      <section>
        <PlanCard subscription={subscription} productCount={productCount} />
      </section>

      <section>
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-slate-100 p-2 text-slate-600">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Riwayat Invoice</CardTitle>
                <p className="mt-1 text-sm text-slate-500">Invoice terbaru untuk toko aktif Anda.</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {invoices.length === 0 ? (
              <div className="p-8 text-sm text-slate-500">Belum ada invoice untuk toko ini.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No Invoice</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Paket</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => {
                    const status = getInvoiceDisplayStatus(invoice);
                    const canPay = status.label === 'PENDING' || status.label === 'OVERDUE';

                    return (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-semibold text-slate-950">{invoice.invoiceNumber}</TableCell>
                        <TableCell>{formatDate(invoice.issuedAt)}</TableCell>
                        <TableCell>{invoice.plan.name}</TableCell>
                        <TableCell className="font-semibold">{formatRupiah(invoice.amount)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={status.className}>
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" size="sm" disabled>
                              <Download className="mr-2 h-4 w-4" />
                              PDF
                            </Button>
                            {canPay && (
                              <Button asChild size="sm">
                                <Link href={`/dashboard/billing/pay/${invoice.id}`}>
                                  Bayar
                                  <ExternalLink className="ml-2 h-4 w-4" />
                                </Link>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Building2, Clock3, UploadCloud } from 'lucide-react';
import { InvoiceStatus } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatDate, formatRupiah } from '@/lib/billing/pricing';
import { getActiveTenantContext } from '@/lib/auth/tenant-access';
import { prisma } from '@/lib/prisma';
import { submitPaymentProofAction } from './actions';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    invoiceId: string;
  }>;
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
}

const BANK_ACCOUNT = {
  bankName: 'Bank Central Asia (BCA)',
  accountNumber: '1234567890',
  accountName: 'PT Daganta Digital Nusantara',
};

function getStatusLabel(status: InvoiceStatus) {
  const labels: Record<InvoiceStatus, string> = {
    DRAFT: 'Draft',
    UNPAID: 'Belum Dibayar',
    PENDING_VERIFICATION: 'Menunggu Konfirmasi',
    PAID: 'Lunas',
    REJECTED: 'Ditolak',
    VOID: 'Dibatalkan',
  };

  return labels[status];
}

export default async function BillingPayPage({ params, searchParams }: PageProps) {
  const [{ invoiceId }, query] = await Promise.all([params, searchParams]);
  const tenantCtx = await getActiveTenantContext();

  if (tenantCtx.status !== 'SUCCESS' || !tenantCtx.activeTenant) {
    return null;
  }

  const invoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      tenantId: tenantCtx.activeTenant.id,
    },
    include: {
      plan: true,
    },
  });

  if (!invoice) {
    notFound();
  }

  const alreadySubmitted = invoice.status === InvoiceStatus.PENDING_VERIFICATION;
  const isClosed = invoice.status === InvoiceStatus.PAID || invoice.status === InvoiceStatus.VOID;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <Button asChild variant="ghost" className="-ml-3 mb-3">
          <Link href="/dashboard/billing">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Billing
          </Link>
        </Button>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">Pembayaran Manual</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Instruksi Pembayaran</h1>
        <p className="mt-1 text-sm text-slate-500">
          Transfer sesuai nominal invoice, lalu unggah bukti pembayaran untuk diverifikasi admin Daganta.
        </p>
      </div>

      {query.error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
          {query.error}
        </div>
      )}

      {query.success === 'proof-submitted' && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          Bukti bayar berhasil dikirim. Status invoice sekarang menunggu konfirmasi admin.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>{invoice.invoiceNumber}</CardTitle>
                <p className="mt-1 text-sm text-slate-500">{invoice.plan.name}</p>
              </div>
              <Badge variant="outline">{getStatusLabel(invoice.status)}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase text-slate-400">Jumlah</p>
                <p className="mt-2 text-xl font-black text-slate-950">{formatRupiah(invoice.amount)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <Clock3 className="h-4 w-4 text-slate-500" />
                <p className="mt-2 text-xs font-semibold uppercase text-slate-400">Batas bayar</p>
                <p className="mt-1 font-bold text-slate-950">{formatDate(invoice.dueAt)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase text-slate-400">Limit paket</p>
                <p className="mt-2 font-bold text-slate-950">{invoice.productLimitSnapshot} produk</p>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-blue-700" />
                <h2 className="font-bold text-blue-950">Rekening Tujuan</h2>
              </div>
              <div className="mt-4 grid gap-3 text-sm">
                <InfoRow label="Bank" value={BANK_ACCOUNT.bankName} />
                <InfoRow label="No Rekening" value={BANK_ACCOUNT.accountNumber} />
                <InfoRow label="Atas Nama" value={BANK_ACCOUNT.accountName} />
              </div>
            </div>

            {alreadySubmitted && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
                Menunggu Konfirmasi. Bukti transfer Anda sudah diterima dan sedang diverifikasi.
              </div>
            )}

            {!isClosed && (
              <form action={submitPaymentProofAction.bind(null, invoice.id)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="proof">Upload bukti transfer</Label>
                  <Input id="proof" name="proof" type="file" accept="image/jpeg,image/png" required />
                  <p className="text-xs text-slate-500">Format JPG/PNG, maksimal 5MB.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note">Catatan tambahan</Label>
                  <Textarea id="note" name="note" placeholder="Opsional: nama pengirim, bank asal, atau catatan lain." />
                </div>

                <Button type="submit" className="w-full sm:w-auto">
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Kirim Bukti Bayar
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Catatan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-slate-600">
            <p>Pastikan nominal transfer sama dengan jumlah invoice agar proses verifikasi lebih cepat.</p>
            <p>Jika bukti ditolak, Anda dapat mengunggah ulang bukti pembayaran yang benar.</p>
            <p>Aktivasi/perpanjangan paket dilakukan setelah admin mengonfirmasi pembayaran.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="font-medium text-blue-800">{label}</span>
      <span className="font-bold text-blue-950">{value}</span>
    </div>
  );
}

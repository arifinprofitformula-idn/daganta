import Link from 'next/link';
import { AlertCircle, CheckCircle2, ExternalLink, ShieldCheck, XCircle } from 'lucide-react';
import { InvoiceStatus, PlatformRole } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate, formatRupiah } from '@/lib/billing/pricing';
import { getCurrentPlatformUser } from '@/lib/auth/platform-access';
import { prisma } from '@/lib/prisma';
import { createPaymentProofSignedUrl } from '@/lib/storage/payment-proofs';
import { confirmPaymentAction, rejectPaymentAction } from './actions';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams?: Promise<{
    error?: string;
    success?: string;
  }>;
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

export default async function AdminPaymentsPage({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : {};
  const platformUser = await getCurrentPlatformUser();

  if (!platformUser || platformUser.profile.platformRole !== PlatformRole.SUPER_ADMIN) {
    return <RestrictedState />;
  }

  const invoices = await prisma.invoice.findMany({
    where: {
      tenantId: {
        not: '',
      },
      status: InvoiceStatus.PENDING_VERIFICATION,
    },
    include: {
      tenant: true,
      plan: true,
    },
    orderBy: {
      paymentProofUploadedAt: 'desc',
    },
  });

  const rows = await Promise.all(
    invoices.map(async (invoice) => {
      let proofUrl: string | null = null;

      if (invoice.paymentProofUrl) {
        try {
          proofUrl = await createPaymentProofSignedUrl(invoice.paymentProofUrl);
        } catch {
          proofUrl = null;
        }
      }

      return {
        invoice,
        proofUrl,
      };
    })
  );

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
              <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">Verifikasi Pembayaran Manual</h1>
              <p className="mt-1 text-sm text-slate-500">Konfirmasi atau tolak bukti transfer tenant.</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/dashboard">Kembali ke Dashboard</Link>
            </Button>
          </div>
        </div>

        {params.success && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
            {params.success}
          </div>
        )}

        {params.error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
            {params.error}
          </div>
        )}

        <Card>
          <CardHeader className="border-b">
            <CardTitle>Invoice Menunggu Verifikasi</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {rows.length === 0 ? (
              <div className="p-8 text-sm text-slate-500">Tidak ada pembayaran yang menunggu verifikasi.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Tanggal Upload</TableHead>
                    <TableHead>Link Bukti</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map(({ invoice, proofUrl }) => (
                    <TableRow key={invoice.id} className="align-top">
                      <TableCell>
                        <div className="font-semibold text-slate-950">{invoice.tenant.name}</div>
                        <div className="text-xs text-slate-500">{invoice.tenant.subdomain}.daganta.store</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-slate-950">{invoice.invoiceNumber}</div>
                        <div className="text-xs text-slate-500">{invoice.plan.name}</div>
                        <Badge variant="outline" className="mt-2 border-amber-200 bg-amber-50 text-amber-700">
                          PENDING_VERIFICATION
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">{formatRupiah(invoice.amount)}</TableCell>
                      <TableCell>{formatDate(invoice.paymentProofUploadedAt)}</TableCell>
                      <TableCell>
                        {proofUrl ? (
                          <Button asChild size="sm" variant="outline">
                            <a href={proofUrl} target="_blank" rel="noopener noreferrer">
                              Lihat Bukti
                              <ExternalLink className="ml-2 h-4 w-4" />
                            </a>
                          </Button>
                        ) : (
                          <span className="text-sm text-slate-400">Tidak tersedia</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <form action={confirmPaymentAction.bind(null, invoice.id)}>
                            <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Konfirmasi
                            </Button>
                          </form>
                          <form action={rejectPaymentAction.bind(null, invoice.id)} className="flex gap-2">
                            <Input name="reason" placeholder="Alasan" className="h-9 w-36" />
                            <Button type="submit" size="sm" variant="destructive">
                              <XCircle className="mr-2 h-4 w-4" />
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

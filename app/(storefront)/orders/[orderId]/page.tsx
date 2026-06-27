import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, Clock3, CreditCard, Package, PackageCheck, Truck } from 'lucide-react';
import { OrderStatus } from '@prisma/client';
import MarketingHome from '@/components/marketing/marketing-home';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getOrderStatusLabel } from '@/components/dashboard/orders/OrderStatusBadge';
import { getOrderForCustomer } from '@/lib/data-access/orders';
import { getStorefrontTenantContext } from '@/lib/tenant/storefront-tenant';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    orderId: string;
  }>;
  searchParams: Promise<{
    phone?: string;
  }>;
}

const statusSteps: Array<{
  status: OrderStatus;
  title: string;
  description: string;
  icon: typeof Clock3;
}> = [
  {
    status: OrderStatus.PENDING_PAYMENT,
    title: 'Menunggu Pembayaran',
    description: 'Pesanan dibuat dan menunggu konfirmasi pembayaran.',
    icon: CreditCard,
  },
  {
    status: OrderStatus.PROCESSING,
    title: 'Diproses',
    description: 'Pembayaran diterima dan pesanan sedang disiapkan.',
    icon: Package,
  },
  {
    status: OrderStatus.SHIPPED,
    title: 'Dikirim',
    description: 'Pesanan sudah diserahkan ke kurir.',
    icon: Truck,
  },
  {
    status: OrderStatus.COMPLETED,
    title: 'Selesai',
    description: 'Pesanan selesai.',
    icon: PackageCheck,
  },
];

const statusOrder: Partial<Record<OrderStatus, number>> = {
  [OrderStatus.PENDING_PAYMENT]: 0,
  [OrderStatus.PAID]: 1,
  [OrderStatus.PROCESSING]: 1,
  [OrderStatus.SHIPPED]: 2,
  [OrderStatus.COMPLETED]: 3,
};

function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function isStepDone(currentStatus: OrderStatus, stepIndex: number) {
  const activeIndex = statusOrder[currentStatus];
  return typeof activeIndex === 'number' && stepIndex <= activeIndex;
}

function getStatusBadgeClass(status: OrderStatus) {
  if (status === OrderStatus.CANCELED) {
    return 'border-rose-200 bg-rose-50 text-rose-700';
  }

  if (status === OrderStatus.REFUNDED) {
    return 'border-slate-200 bg-slate-100 text-slate-700';
  }

  return 'border-emerald-200 bg-emerald-50 text-emerald-700';
}

export default async function CustomerOrderDetailPage({ params, searchParams }: PageProps) {
  const [{ orderId }, { phone }] = await Promise.all([params, searchParams]);

  if (!phone?.trim()) {
    notFound();
  }

  const result = await getStorefrontTenantContext();

  if (result.status === 'MARKETING_SITE') {
    return <MarketingHome />;
  }

  if (result.status !== 'SUCCESS' || !result.tenant) {
    notFound();
  }

  const order = await getOrderForCustomer(result.tenant.id, orderId, phone);

  if (!order) {
    notFound();
  }

  const isClosedStatus = order.status === OrderStatus.CANCELED || order.status === OrderStatus.REFUNDED;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500">{result.tenant.name}</p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">Pesanan #{order.orderNumber}</h1>
          </div>
          <Badge variant="outline" className={getStatusBadgeClass(order.status)}>
            {getOrderStatusLabel(order.status)}
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Status Pesanan</CardTitle>
          </CardHeader>
          <CardContent>
            {isClosedStatus ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
                Pesanan ini berstatus {getOrderStatusLabel(order.status).toLowerCase()}. Hubungi admin toko jika
                membutuhkan bantuan.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-4">
                {statusSteps.map((step, index) => {
                  const Icon = step.icon;
                  const done = isStepDone(order.status, index);

                  return (
                    <div
                      key={step.status}
                      className={`rounded-xl border p-4 ${
                        done ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div
                        className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full ${
                          done ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {done ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                      </div>
                      <h2 className="text-sm font-bold text-slate-950">{step.title}</h2>
                      <p className="mt-1 text-xs leading-relaxed text-slate-500">{step.description}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <Card>
            <CardHeader>
              <CardTitle>Item yang Dipesan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 rounded-xl border border-slate-200 p-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    {item.product.imageUrl ? (
                      <Image
                        src={item.product.imageUrl}
                        alt={item.productNameSnapshot}
                        fill
                        sizes="64px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <Package className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-950">{item.productNameSnapshot}</p>
                    {item.variantNameSnapshot && (
                      <p className="mt-1 text-xs text-slate-500">Varian: {item.variantNameSnapshot}</p>
                    )}
                    <p className="mt-1 text-xs text-slate-500">
                      {item.quantity} x {formatRupiah(Number(item.unitPrice))}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-slate-950">{formatRupiah(Number(item.totalPrice))}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-semibold">{formatRupiah(Number(order.subtotal))}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Ongkir</span>
                  <span className="font-semibold">{formatRupiah(Number(order.shippingCost))}</span>
                </div>
                <div className="flex justify-between gap-4 border-t border-slate-200 pt-3">
                  <span className="font-bold text-slate-950">Total</span>
                  <span className="font-bold text-slate-950">{formatRupiah(Number(order.grandTotal))}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pengiriman</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Nomor Resi</p>
                  <p className="mt-1 font-bold text-slate-950">
                    {order.trackingNumber ?? 'Belum tersedia'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Estimasi Pengiriman</p>
                  <p className="mt-1 text-slate-700">Akan diperbarui oleh admin toko.</p>
                </div>
              </CardContent>
            </Card>

            <Button asChild variant="outline" className="w-full">
              <Link href="/orders/track">Lacak Pesanan Lain</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}

import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CalendarClock, Package, UserRound } from 'lucide-react';
import { getActiveTenantContext } from '@/lib/auth/tenant-access';
import { getOrderById, getOrderTimeline } from '@/lib/data-access/orders';
import { Button } from '@/components/ui/button';
import { OrderStatusBadge } from '@/components/dashboard/orders/OrderStatusBadge';
import OrderStatusUpdater from '@/components/dashboard/orders/OrderStatusUpdater';

interface PageProps {
  params: Promise<{
    orderId: string;
  }>;
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function readMetadataValue(metadata: unknown, key: string) {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return null;
  }

  const value = (metadata as Record<string, unknown>)[key];
  return typeof value === 'string' ? value : null;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { orderId } = await params;
  const tenantCtx = await getActiveTenantContext();

  if (tenantCtx.status !== 'SUCCESS' || !tenantCtx.activeTenant) {
    return null;
  }

  const [order, timeline] = await Promise.all([
    getOrderById(tenantCtx.activeTenant.id, orderId),
    getOrderTimeline(tenantCtx.activeTenant.id, orderId),
  ]);

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button asChild variant="ghost" className="-ml-3 mb-2">
            <Link href="/dashboard/orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">{order.orderNumber}</h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-sm text-slate-500">Dibuat pada {formatDate(order.createdAt)}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <UserRound className="h-5 w-5 text-slate-500" />
              <h2 className="font-semibold text-slate-950">Info Pembeli</h2>
            </div>
            <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Nama</p>
                <p className="mt-1 font-semibold text-slate-900">{order.customer?.name ?? '-'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">HP</p>
                <p className="mt-1 font-semibold text-slate-900">{order.customer?.phone ?? '-'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Email</p>
                <p className="mt-1 font-semibold text-slate-900">{order.customer?.email ?? '-'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Alamat Pengiriman</p>
                <p className="mt-1 whitespace-pre-line font-medium leading-6 text-slate-700">{order.customer?.address ?? '-'}</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <Package className="h-5 w-5 text-slate-500" />
              <h2 className="font-semibold text-slate-950">Item Pesanan</h2>
            </div>
            <div className="mt-4 divide-y divide-slate-100">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 py-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                    {item.product.imageUrl ? (
                      <Image src={item.product.imageUrl} alt={item.productNameSnapshot} fill unoptimized sizes="64px" className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-5 w-5 text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-950">{item.productNameSnapshot}</p>
                    {item.variantNameSnapshot && (
                      <p className="text-xs text-slate-500">Varian: {item.variantNameSnapshot}</p>
                    )}
                    <p className="mt-1 text-xs text-slate-500">
                      {item.quantity} x {formatRupiah(Number(item.unitPrice))}
                    </p>
                  </div>
                  <p className="shrink-0 font-semibold text-slate-950">{formatRupiah(Number(item.totalPrice))}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <CalendarClock className="h-5 w-5 text-slate-500" />
              <h2 className="font-semibold text-slate-950">Riwayat Status</h2>
            </div>
            <div className="mt-4 space-y-4">
              <div className="flex gap-3">
                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-slate-900" />
                <div>
                  <p className="text-sm font-semibold text-slate-950">Pesanan dibuat</p>
                  <p className="text-xs text-slate-500">{formatDate(order.createdAt)}</p>
                </div>
              </div>
              {timeline.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      {item.action === 'UPDATE_ORDER_STATUS'
                        ? `Status menjadi ${readMetadataValue(item.metadata, 'newStatus') ?? '-'}`
                        : item.action}
                    </p>
                    {readMetadataValue(item.metadata, 'note') && (
                      <p className="text-xs text-slate-500">Catatan: {readMetadataValue(item.metadata, 'note')}</p>
                    )}
                    <p className="text-xs text-slate-500">{formatDate(item.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-950">Total Pesanan</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-semibold">{formatRupiah(Number(order.subtotal))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ongkir</span>
                <span className="font-semibold">{formatRupiah(Number(order.shippingCost))}</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-3">
                <span className="font-semibold text-slate-950">Grand Total</span>
                <span className="text-lg font-black text-slate-950">{formatRupiah(Number(order.grandTotal))}</span>
              </div>
              {order.trackingNumber && (
                <div className="rounded-xl bg-slate-50 p-3 text-xs font-semibold text-slate-700">
                  Nomor resi terakhir: {order.trackingNumber}
                </div>
              )}
            </div>
          </section>

          <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
        </aside>
      </div>
    </div>
  );
}

import Link from 'next/link';
import { OrderStatus } from '@prisma/client';
import { Search } from 'lucide-react';
import { getActiveTenantContext } from '@/lib/auth/tenant-access';
import { getOrdersByTenant } from '@/lib/data-access/orders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { OrderStatusBadge } from '@/components/dashboard/orders/OrderStatusBadge';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams?: Promise<{
    status?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
}

const filterableStatuses = [
  OrderStatus.PENDING_PAYMENT,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.COMPLETED,
  OrderStatus.CANCELED,
  OrderStatus.REFUNDED,
];

function parseOrderStatus(value?: string) {
  if (!value) {
    return undefined;
  }

  return Object.values(OrderStatus).includes(value as OrderStatus)
    ? (value as OrderStatus)
    : undefined;
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
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default async function OrdersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const tenantCtx = await getActiveTenantContext();

  if (tenantCtx.status !== 'SUCCESS' || !tenantCtx.activeTenant) {
    return null;
  }

  const status = parseOrderStatus(params?.status);
  const orders = await getOrdersByTenant(tenantCtx.activeTenant.id, {
    status,
    search: params?.search,
    dateFrom: params?.dateFrom,
    dateTo: params?.dateTo,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Pesanan</h1>
          <p className="mt-1 text-sm text-slate-500">
            Daftar pesanan tenant {tenantCtx.activeTenant.name}
          </p>
        </div>
      </div>

      <form className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[1fr_180px_160px_160px_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            name="search"
            defaultValue={params?.search ?? ''}
            placeholder="Cari pembeli atau nomor pesanan"
            className="pl-9"
          />
        </div>

        <select
          name="status"
          defaultValue={status ?? ''}
          className="h-8 rounded-lg border border-input bg-white px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="">Semua status</option>
          {filterableStatuses.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <Input name="dateFrom" type="date" defaultValue={params?.dateFrom ?? ''} />
        <Input name="dateTo" type="date" defaultValue={params?.dateTo ?? ''} />

        <Button type="submit">Filter</Button>
      </form>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">No. Pesanan</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Nama Pembeli</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    Tidak ada pesanan yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4 font-semibold text-slate-950">{order.orderNumber}</td>
                    <td className="px-4 py-4 text-slate-600">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-slate-900">{order.customer?.name ?? '-'}</p>
                      <p className="text-xs text-slate-500">{order.customer?.phone ?? '-'}</p>
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-950">{formatRupiah(Number(order.grandTotal))}</td>
                    <td className="px-4 py-4">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/orders/${order.id}`}>Detail</Link>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

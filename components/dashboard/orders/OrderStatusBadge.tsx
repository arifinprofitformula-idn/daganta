import { OrderStatus } from '@prisma/client';
import { Badge } from '@/components/ui/badge';

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  [OrderStatus.DRAFT]: {
    label: 'Draft',
    className: 'border-slate-200 bg-slate-100 text-slate-700',
  },
  [OrderStatus.PENDING_PAYMENT]: {
    label: 'Menunggu Pembayaran',
    className: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  [OrderStatus.PAID]: {
    label: 'Dibayar',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  [OrderStatus.PROCESSING]: {
    label: 'Diproses',
    className: 'border-blue-200 bg-blue-50 text-blue-700',
  },
  [OrderStatus.SHIPPED]: {
    label: 'Dikirim',
    className: 'border-violet-200 bg-violet-50 text-violet-700',
  },
  [OrderStatus.COMPLETED]: {
    label: 'Selesai',
    className: 'border-green-200 bg-green-50 text-green-700',
  },
  [OrderStatus.CANCELED]: {
    label: 'Dibatalkan',
    className: 'border-rose-200 bg-rose-50 text-rose-700',
  },
  [OrderStatus.EXPIRED]: {
    label: 'Kedaluwarsa',
    className: 'border-slate-200 bg-slate-100 text-slate-700',
  },
  [OrderStatus.REFUNDED]: {
    label: 'Refund',
    className: 'border-gray-200 bg-gray-50 text-gray-700',
  },
};

export function getOrderStatusLabel(status: OrderStatus) {
  return statusConfig[status]?.label ?? status;
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = statusConfig[status];

  return (
    <Badge variant="outline" className={config?.className}>
      {config?.label ?? status}
    </Badge>
  );
}

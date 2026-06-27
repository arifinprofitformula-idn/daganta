'use client';

import { OrderStatus } from '@prisma/client';
import { useState, useTransition } from 'react';
import { ExternalLink, Loader2 } from 'lucide-react';
import { updateOrderStatusAction } from '@/app/dashboard/orders/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { getOrderStatusLabel } from '@/components/dashboard/orders/OrderStatusBadge';

const updateableStatuses = [
  OrderStatus.PENDING_PAYMENT,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.COMPLETED,
  OrderStatus.CANCELED,
  OrderStatus.REFUNDED,
];

interface OrderStatusUpdaterProps {
  orderId: string;
  currentStatus: OrderStatus;
}

export default function OrderStatusUpdater({ orderId, currentStatus }: OrderStatusUpdaterProps) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [note, setNote] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    setMessage(null);
    setWhatsappUrl(null);

    startTransition(async () => {
      const result = await updateOrderStatusAction({
        orderId,
        status,
        trackingNumber: status === OrderStatus.SHIPPED ? trackingNumber : undefined,
        note,
      });

      if (result.success) {
        setMessage(result.message ?? 'Status pesanan berhasil diperbarui.');
        setWhatsappUrl(result.whatsappUrl ?? null);
      } else {
        setMessage(result.error ?? 'Gagal memperbarui status pesanan.');
      }
    });
  }

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <div>
        <h2 className="text-base font-semibold text-slate-950">Update Status Pesanan</h2>
        <p className="mt-1 text-sm text-slate-500">
          Status saat ini: {getOrderStatusLabel(currentStatus)}
        </p>
      </div>

      <div className="space-y-2">
        <Label>Status Baru</Label>
        <Select value={status} onValueChange={(value) => setStatus(value as OrderStatus)}>
          <SelectTrigger className="h-10 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {updateableStatuses.map((option) => (
              <SelectItem key={option} value={option}>
                {getOrderStatusLabel(option)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {status === OrderStatus.SHIPPED && (
        <div className="space-y-2">
          <Label htmlFor="trackingNumber">Nomor Resi</Label>
          <Input
            id="trackingNumber"
            value={trackingNumber}
            onChange={(event) => setTrackingNumber(event.target.value)}
            placeholder="Contoh: JNE123456789"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="statusNote">Catatan</Label>
        <Textarea
          id="statusNote"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Opsional"
          rows={3}
        />
      </div>

      {message && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
          {message}
        </div>
      )}

      {whatsappUrl && (
        <Button asChild variant="outline" className="w-full">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            Kirim Notifikasi WhatsApp
          </a>
        </Button>
      )}

      <Button onClick={handleSubmit} disabled={isPending} className="w-full">
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Update Status
      </Button>
    </div>
  );
}

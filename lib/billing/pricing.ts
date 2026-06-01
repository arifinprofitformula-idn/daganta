import type { BillingCycle, InvoiceStatus, SubscriptionStatus } from '@prisma/client';

export const PAYMENT_INSTRUCTION_PLACEHOLDER =
  'Instruksi pembayaran manual akan dikonfirmasi oleh admin Daganta.';

export function formatRupiah(value: number | string | { toString(): string }) {
  const amount = Number(value.toString());

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(value: Date | null | undefined) {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(value);
}

export function getBillingCycleLabel(cycle: BillingCycle) {
  return cycle === 'ANNUAL' ? 'Tahunan' : 'Bulanan';
}

export function getSubscriptionStatusLabel(status: SubscriptionStatus) {
  const labels: Record<SubscriptionStatus, string> = {
    TRIAL: 'Masa coba aktif',
    ACTIVE: 'Aktif',
    GRACE_PERIOD: 'Masa tenggang',
    LIMITED: 'Checkout sementara dibatasi',
    CANCELED: 'Dibatalkan',
  };

  return labels[status];
}

export function getInvoiceStatusLabel(status: InvoiceStatus) {
  const labels: Record<InvoiceStatus, string> = {
    DRAFT: 'Draft',
    UNPAID: 'Belum Dibayar',
    PAID: 'Lunas',
    VOID: 'Dibatalkan / Dibatalkan Sistem',
  };

  return labels[status];
}

export function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

export function addMonths(date: Date, months: number) {
  const nextDate = new Date(date);
  nextDate.setMonth(nextDate.getMonth() + months);
  return nextDate;
}

import { NotificationEventType } from '@prisma/client';

export type NotificationTemplateParams = Record<string, unknown>;

function textParam(params: NotificationTemplateParams, key: string, fallback = '') {
  const value = params[key];
  return typeof value === 'string' || typeof value === 'number' ? String(value) : fallback;
}

export const templates: Record<
  NotificationEventType,
  (params: NotificationTemplateParams) => { subject: string; message: string }
> = {
  ORDER_CREATED: (params) => ({
    subject: 'Pesanan Baru Masuk',
    message: `Halo ${textParam(params, 'buyerName', 'Pelanggan')}, pesanan Anda dengan nomor ${textParam(params, 'orderNumber')} telah kami terima. Total pembayaran: Rp ${Number(params.amount ?? 0).toLocaleString('id-ID')}. Silakan lakukan transfer pembayaran. Terima kasih.`,
  }),
  PAYMENT_WAITING_VERIFICATION: (params) => ({
    subject: 'Pembayaran Menunggu Verifikasi',
    message: `Halo, bukti transfer pembayaran untuk pesanan ${textParam(params, 'orderNumber')} telah diterima dan sekarang sedang menunggu verifikasi oleh tim admin kami.`,
  }),
  PAYMENT_VERIFIED: (params) => ({
    subject: 'Pembayaran Terverifikasi',
    message: `Selamat, pembayaran untuk pesanan Anda dengan nomor ${textParam(params, 'orderNumber')} telah berhasil diverifikasi. Pesanan Anda kini sedang kami proses.`,
  }),
  PAYMENT_REJECTED: (params) => ({
    subject: 'Pembayaran Ditolak',
    message: `Halo, verifikasi pembayaran untuk pesanan ${textParam(params, 'orderNumber')} ditolak. Alasan: ${textParam(params, 'reason', 'Bukti pembayaran tidak sesuai atau tidak terbaca')}. Silakan periksa kembali atau hubungi admin.`,
  }),
  ORDER_STATUS_UPDATED: (params) => ({
    subject: 'Status Pesanan Diperbarui',
    message: `Halo, status pesanan ${textParam(params, 'orderNumber')} Anda telah diperbarui menjadi ${textParam(params, 'newStatus', 'diperbarui')}.`,
  }),
  TENANT_SUBSCRIPTION_EXPIRING: (params) => ({
    subject: 'Masa Langganan Segera Berakhir',
    message: `Masa aktif langganan toko Anda (${textParam(params, 'tenantName')}) akan berakhir dalam ${textParam(params, 'daysRemaining')} hari. Segera lakukan perpanjangan agar toko tetap aktif.`,
  }),
  TENANT_SUBSCRIPTION_EXPIRED: (params) => ({
    subject: 'Masa Langganan Berakhir',
    message: `Masa aktif langganan toko Anda (${textParam(params, 'tenantName')}) telah berakhir. Toko Anda dialihkan ke mode terbatas. Segera perpanjang langganan untuk mengaktifkan kembali.`,
  }),
};

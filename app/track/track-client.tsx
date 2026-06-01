'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  ArrowLeft, 
  CheckCircle2, 
  Package, 
  CreditCard, 
  AlertCircle, 
  ShieldCheck,
  Truck,
  ExternalLink
} from 'lucide-react';
import { getTenantThemeConfig, TenantThemeConfig } from '../../lib/tenant/theme-config';
import { trackOrderAction, SafeOrderResult } from '../actions/track-order';

interface TrackClientProps {
  tenant: {
    id: string;
    name: string;
    slug: string;
    subdomain: string;
  };
  initialOrderNumber?: string;
}

export default function TrackClient({ tenant, initialOrderNumber = '' }: TrackClientProps) {
  const theme: TenantThemeConfig = getTenantThemeConfig(tenant.slug);
  
  // Search Form State
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [contact, setContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Loaded Order State
  const [order, setOrder] = useState<SafeOrderResult | null>(null);

  // Sync initial order number if provided via query param
  useEffect(() => {
    if (initialOrderNumber) {
      setOrderNumber(initialOrderNumber);
    }
  }, [initialOrderNumber]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOrder(null);

    if (!orderNumber.trim()) {
      setError('Nomor pesanan wajib diisi.');
      return;
    }
    if (!contact.trim()) {
      setError('Nomor WhatsApp atau email wajib diisi.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await trackOrderAction(orderNumber.trim(), contact.trim());
      if (result.success && result.order) {
        setOrder(result.order);
      } else {
        setError(result.error || 'Pesanan tidak ditemukan. Pastikan nomor pesanan dan kontak yang Anda masukkan sudah sesuai.');
      }
    } catch (err) {
      setError('Terjadi kesalahan tidak terduga. Silakan coba kembali.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getOrderStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      DRAFT: 'Draft',
      PENDING_PAYMENT: 'Menunggu Pembayaran',
      PAID: 'Pembayaran Diterima',
      PROCESSING: 'Diproses',
      SHIPPED: 'Dikirim',
      COMPLETED: 'Selesai',
      CANCELED: 'Dibatalkan',
      EXPIRED: 'Kedaluwarsa',
      REFUNDED: 'Dikembalikan',
    };
    return labels[status] || status;
  };

  const getOrderStatusBadgeClass = (status: string) => {
    const classes: Record<string, string> = {
      PENDING_PAYMENT: 'bg-amber-50 text-amber-700 border-amber-200',
      PROCESSING: 'bg-blue-50 text-blue-700 border-blue-200',
      SHIPPED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      CANCELED: 'bg-rose-50 text-rose-700 border-rose-200',
    };
    return classes[status] || 'bg-slate-50 text-slate-700 border-slate-200';
  };

  const getPaymentStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      WAITING_PAYMENT: 'Menunggu Pembayaran',
      WAITING_VERIFICATION: 'Menunggu Verifikasi',
      VERIFIED: 'Pembayaran Terverifikasi',
      REJECTED: 'Pembayaran Ditolak',
    };
    return labels[status] || status;
  };

  const getPaymentGuidanceMessage = (status: string) => {
    const guidance: Record<string, string> = {
      WAITING_PAYMENT: 'Silakan lakukan pembayaran sesuai instruksi dari admin toko.',
      WAITING_VERIFICATION: 'Pembayaran Anda sedang menunggu verifikasi admin toko.',
      VERIFIED: 'Pembayaran Anda sudah terverifikasi. Pesanan sedang diproses.',
      REJECTED: 'Pembayaran belum dapat diverifikasi. Silakan hubungi admin toko.',
    };
    return guidance[status] || 'Informasi status pembayaran akan diperbarui oleh admin toko.';
  };

  const getPaymentStatusBadgeClass = (status: string) => {
    const classes: Record<string, string> = {
      WAITING_PAYMENT: 'bg-amber-50 text-amber-750 border-amber-100',
      WAITING_VERIFICATION: 'bg-blue-50 text-blue-750 border-blue-100',
      VERIFIED: 'bg-emerald-50 text-emerald-750 border-emerald-100',
      REJECTED: 'bg-rose-50 text-rose-750 border-rose-100',
    };
    return classes[status] || 'bg-slate-50 text-slate-700 border-slate-100';
  };

  return (
    <div 
      className="min-h-screen bg-slate-50/50 text-slate-800 flex flex-col font-sans select-none antialiased"
      style={{ 
        '--primary': theme.primaryColor, 
        '--secondary': theme.secondaryColor,
        '--accent': theme.accentColor,
        '--primary-hover': theme.hoverColor
      } as React.CSSProperties}
    >
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center shadow-md">
              <span className="font-extrabold text-xs text-white uppercase">{tenant.name.substring(0, 1)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black tracking-tight text-slate-800 uppercase leading-none">{tenant.name}</span>
              <span className="text-[9px] text-slate-400 font-mono mt-0.5 leading-none">{tenant.subdomain}.daganta.store</span>
            </div>
          </Link>
          <Link 
            href="/"
            className="px-4 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-650 hover:text-slate-800 text-xs font-bold rounded-xl transition-all shadow-sm"
          >
            Belanja Lagi
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-10">
        
        {/* State 1: Display order tracking details */}
        {order ? (
          <div className="space-y-6 animate-scaleIn">
            
            {/* Back to search link */}
            <button 
              onClick={() => setOrder(null)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors focus:outline-none mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Cari Pesanan Lain</span>
            </button>

            {/* Main Result Card */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm space-y-8">
              
              {/* Order Banner & Top Status Indicator */}
              <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Pesanan Anda</span>
                  <h1 className="text-lg md:text-xl font-black text-slate-900 tracking-tight mt-0.5">
                    {order.orderNumber}
                  </h1>
                  <span className="text-[11px] text-slate-500 font-medium block mt-1">
                    Tanggal: {new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                
                <span className={`inline-flex rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-wide shrink-0 ${getOrderStatusBadgeClass(order.status)}`}>
                  {getOrderStatusLabel(order.status)}
                </span>
              </div>

              {/* Secure Customer Verification Card (PII Masked, No address shown) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs">
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Informasi Penerima</span>
                  <p className="text-slate-700 font-medium">Nama: <strong className="text-slate-800">{order.customerName}</strong></p>
                  <p className="text-slate-700 font-medium">WhatsApp: <strong className="text-slate-800">{order.customerPhoneMasked}</strong></p>
                  <p className="text-slate-700 font-medium">Email: <strong className="text-slate-800">{order.customerEmailMasked}</strong></p>
                </div>
                
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Alamat Pengiriman</span>
                  <div className="p-3 bg-white border border-slate-150 rounded-xl flex items-start gap-2 mt-1">
                    <ShieldCheck className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-[10.5px] leading-relaxed text-slate-500 font-medium">
                      Alamat pengiriman tersimpan aman di sistem toko.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step Status Flow Indicator */}
              <div className="py-4">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-4">Progres Pesanan</span>
                <div className="grid grid-cols-5 gap-1 text-center font-bold text-[9px] sm:text-[10px] text-slate-400">
                  <div className={`p-2 border rounded-xl ${['PENDING_PAYMENT', 'PROCESSING', 'SHIPPED', 'COMPLETED'].includes(order.status) ? 'bg-amber-50 text-amber-700 border-amber-200 font-black' : 'bg-slate-50 border-slate-100'}`}>
                    1. Belum Bayar
                  </div>
                  <div className={`p-2 border rounded-xl ${['PROCESSING', 'SHIPPED', 'COMPLETED'].includes(order.status) ? 'bg-blue-50 text-blue-700 border-blue-200 font-black' : 'bg-slate-50 border-slate-100'}`}>
                    2. Diproses
                  </div>
                  <div className={`p-2 border rounded-xl ${['SHIPPED', 'COMPLETED'].includes(order.status) ? 'bg-indigo-50 text-indigo-700 border-indigo-200 font-black' : 'bg-slate-50 border-slate-100'}`}>
                    3. Dikirim
                  </div>
                  <div className={`p-2 border rounded-xl ${order.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-black' : 'bg-slate-50 border-slate-100'}`}>
                    4. Selesai
                  </div>
                  <div className={`p-2 border rounded-xl ${order.status === 'CANCELED' ? 'bg-rose-50 text-rose-700 border-rose-200 font-black' : 'bg-slate-50 border-slate-100'}`}>
                    Dibatalkan
                  </div>
                </div>
              </div>

              {/* Items Summary list */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-850 uppercase tracking-wider pb-2 border-b border-slate-100">
                  Detail Rincian Produk
                </h3>
                
                <div className="divide-y divide-slate-100">
                  {order.items.map((item) => (
                    <div key={item.id} className="py-3 flex justify-between gap-4 text-xs font-medium">
                      <div className="space-y-0.5">
                        <p className="text-slate-850 font-bold leading-snug">{item.productNameSnapshot}</p>
                        {item.variantNameSnapshot && (
                          <p className="text-[10px] text-slate-400 font-semibold">Varian: {item.variantNameSnapshot}</p>
                        )}
                        <p className="text-[10px] text-slate-500 font-medium">Qty: {item.quantity} unit</p>
                      </div>
                      <span className="text-slate-700 font-bold shrink-0">{formatRupiah(item.totalPrice)}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-150 flex items-center justify-between text-xs">
                  <span className="font-black text-slate-800 uppercase">Total Tagihan</span>
                  <span className="text-base font-black text-[var(--primary)]">{formatRupiah(order.grandTotal)}</span>
                </div>
              </div>

              {/* Payment Status & Instructions Block */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-black text-slate-850 uppercase tracking-wider pb-2 border-b border-slate-100">
                  Status Pembayaran
                </h3>
                
                <div className="flex flex-wrap items-center gap-3 justify-between">
                  <p className="text-xs font-semibold text-slate-550">
                    Kondisi Pembayaran Saat Ini:
                  </p>
                  <span className={`rounded-full border px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide ${order.payment ? getPaymentStatusBadgeClass(order.payment.status) : 'bg-slate-50 text-slate-700 border-slate-100'}`}>
                    {order.payment ? getPaymentStatusLabel(order.payment.status) : 'Belum Tersedia'}
                  </span>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200/50 rounded-2xl text-[10.5px] leading-relaxed text-amber-850 font-medium space-y-1 shadow-inner">
                  <p className="font-bold uppercase tracking-wider text-amber-800 text-[9px] flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>⚠️ Panduan Pembayaran</span>
                  </p>
                  <p>
                    {order.payment ? getPaymentGuidanceMessage(order.payment.status) : 'Status pembayaran manual belum diatur oleh admin.'}
                  </p>
                </div>
              </div>

              {/* Shipping Status (Manual Logistics Placeholder) */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-black text-slate-850 uppercase tracking-wider pb-2 border-b border-slate-100">
                  Informasi Pengiriman
                </h3>

                <div className="p-4 bg-blue-50 border border-blue-200/50 rounded-2xl text-[10.5px] leading-relaxed text-blue-850 font-medium space-y-1 shadow-inner">
                  <p className="font-bold uppercase tracking-wider text-blue-800 text-[9px] flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" />
                    <span>📦 Status Pengiriman</span>
                  </p>
                  <p>
                    {order.status === 'SHIPPED' 
                      ? 'Pesanan Anda sudah ditandai dikirim oleh admin toko.' 
                      : 'Informasi pengiriman akan diperbarui oleh admin toko.'}
                  </p>
                </div>
              </div>

            </div>
          </div>
        ) : (
          /* State 2: Display public search form */
          <div className="max-w-md w-full mx-auto bg-white border border-slate-200/80 rounded-3xl p-8 shadow-sm space-y-6 mt-6">
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-indigo-50 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-brand-blue mx-auto shadow-sm">
                <Search className="w-5 h-5 text-[var(--primary)]" />
              </div>
              <div className="space-y-1">
                <h1 className="text-lg font-bold tracking-tight text-slate-900">Lacak Status Pesanan</h1>
                <p className="text-xs text-slate-500 font-medium">Masukkan detail pesanan untuk mengecek progres transaksi</p>
              </div>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs font-semibold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSearch} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label htmlFor="orderNumber" className="text-xs font-bold text-slate-550 block">Nomor Pesanan</label>
                <input
                  id="orderNumber"
                  type="text"
                  required
                  placeholder="Contoh: ORD-20260602-1234"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none text-xs font-medium bg-slate-50/30 transition-all placeholder:text-slate-350 uppercase"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="contact" className="text-xs font-bold text-slate-550 block">WhatsApp atau Email Penerima</label>
                <input
                  id="contact"
                  type="text"
                  required
                  placeholder="Masukkan nomor WhatsApp atau email saat checkout"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none text-xs font-medium bg-slate-50/30 transition-all placeholder:text-slate-350"
                />
                <span className="text-[10px] text-slate-400 font-medium block leading-normal">
                  Demi keamanan data, masukkan nomor kontak/email penerima yang sesuai saat checkout.
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 text-white font-black text-xs rounded-xl shadow-md transition-all text-center flex items-center justify-center gap-1.5 focus:outline-none"
                style={{ backgroundColor: theme.primaryColor }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.hoverColor}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.primaryColor}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Mencari Pesanan...</span>
                  </>
                ) : (
                  <>
                    <span>Cari Status Pesanan</span>
                    <Search className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto px-6 space-y-2">
          <p>&copy; {new Date().getFullYear()} {tenant.name}. Seluruh hak cipta dilindungi.</p>
          <p className="text-[10px] text-slate-350">
            Didukung oleh <a href="https://daganta.store" className="hover:underline text-[var(--primary)] font-bold">Daganta Storefront Platform</a>
          </p>
        </div>
      </footer>
    </div>
  );
}

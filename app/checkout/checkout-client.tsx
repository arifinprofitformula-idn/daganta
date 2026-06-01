'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../../lib/cart/use-cart';
import { getTenantThemeConfig, TenantThemeConfig } from '../../lib/tenant/theme-config';
import { processCheckout } from '../actions/checkout';

interface CheckoutClientProps {
  tenant: {
    id: string;
    name: string;
    slug: string;
    subdomain: string;
  };
}

export default function CheckoutClient({ tenant }: CheckoutClientProps) {
  const theme: TenantThemeConfig = getTenantThemeConfig(tenant.slug);
  const router = useRouter();
  const { cartItems, subtotal, totalWeight, clearCart, isHydrated } = useCart();

  // Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Processing states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validasi dasar client-side
    if (!name.trim()) return setFormError('Nama lengkap wajib diisi.');
    if (!phone.trim()) return setFormError('Nomor WhatsApp wajib diisi.');
    if (!province.trim()) return setFormError('Provinsi wajib diisi.');
    if (!city.trim()) return setFormError('Kota/Kabupaten wajib diisi.');
    if (!district.trim()) return setFormError('Kecamatan wajib diisi.');
    if (!fullAddress.trim()) return setFormError('Alamat lengkap pengiriman wajib diisi.');
    if (cartItems.length === 0) return setFormError('Keranjang belanja Anda kosong.');

    setIsSubmitting(true);

    try {
      const payload = {
        name,
        phone,
        email: email || undefined,
        province,
        city,
        district,
        postalCode: postalCode || undefined,
        fullAddress,
        notes: notes || undefined,
        items: cartItems.map((item) => ({
          id: item.id,
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      };

      const result = await processCheckout(payload);

      if (result.success && result.orderId) {
        clearCart();
        router.push(`/checkout/success/${result.orderId}`);
      } else {
        setFormError(result.error || 'Gagal memproses pesanan.');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setFormError('Terjadi kesalahan tidak terduga. Silakan coba kembali.');
      setIsSubmitting(false);
    }
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-slate-800 animate-spin" />
          <span className="text-xs text-slate-500 font-semibold">Memuat halaman checkout...</span>
        </div>
      </div>
    );
  }

  // Jika setelah hidrasi keranjang benar-benar kosong, arahkan ke beranda
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h2 className="text-base font-bold text-slate-800">Keranjang Belanja Anda Kosong</h2>
        <p className="text-xs text-slate-500 max-w-xs">
          Silakan tambahkan produk ke keranjang belanja Anda terlebih dahulu sebelum membuka halaman checkout.
        </p>
        <Link 
          href="/" 
          className="py-2.5 px-5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-bold rounded-xl transition-all"
        >
          Kembali ke Toko
        </Link>
      </div>
    );
  }

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
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center shadow-md">
              <span className="font-extrabold text-xs text-white uppercase">{tenant.name.substring(0, 1)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black tracking-tight text-slate-800 uppercase leading-none">{tenant.name}</span>
              <span className="text-[9px] text-slate-400 font-mono mt-0.5 leading-none">{tenant.subdomain}.daganta.store</span>
            </div>
          </Link>
          <Link 
            href="/cart"
            className="px-4 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-650 hover:text-slate-800 text-xs font-bold rounded-xl transition-all shadow-sm"
          >
            Kembali ke Keranjang
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10">
        <div className="max-w-5xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Checkout</h1>
            <p className="text-xs text-slate-500 font-medium">Lengkapi data pengiriman Anda untuk menyelesaikan pemesanan</p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            {/* Form Fields (Left Column) */}
            <div className="lg:col-span-3 space-y-6">
              {formError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{formError}</span>
                </div>
              )}

              {/* Section 1: Customer Contact */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[var(--primary)] text-white text-[10px] font-black flex items-center justify-center">1</span>
                  Informasi Kontak
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="name" className="text-xs font-bold text-slate-500">Nama Lengkap *</label>
                    <input
                      id="name"
                      type="text"
                      required
                      placeholder="Contoh: Andi Pratama"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none text-xs font-medium bg-slate-50/30 transition-all placeholder:text-slate-350"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="phone" className="text-xs font-bold text-slate-500">Nomor WhatsApp *</label>
                    <input
                      id="phone"
                      type="tel"
                      required
                      placeholder="Contoh: 081234567890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none text-xs font-medium bg-slate-50/30 transition-all placeholder:text-slate-350"
                    />
                    <span className="text-[10px] text-slate-400 font-medium block">Digunakan untuk konfirmasi pesanan dan transfer pembayaran.</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-xs font-bold text-slate-500">Alamat Email (Opsional)</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Contoh: andi@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none text-xs font-medium bg-slate-50/30 transition-all placeholder:text-slate-350"
                  />
                </div>
              </div>

              {/* Section 2: Shipping Address */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[var(--primary)] text-white text-[10px] font-black flex items-center justify-center">2</span>
                  Alamat Pengiriman
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="province" className="text-xs font-bold text-slate-500">Provinsi *</label>
                    <input
                      id="province"
                      type="text"
                      required
                      placeholder="Contoh: Jawa Barat"
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none text-xs font-medium bg-slate-50/30 transition-all placeholder:text-slate-350"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="city" className="text-xs font-bold text-slate-500">Kota / Kabupaten *</label>
                    <input
                      id="city"
                      type="text"
                      required
                      placeholder="Contoh: Bandung"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none text-xs font-medium bg-slate-50/30 transition-all placeholder:text-slate-350"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="district" className="text-xs font-bold text-slate-500">Kecamatan *</label>
                    <input
                      id="district"
                      type="text"
                      required
                      placeholder="Contoh: Coblong"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none text-xs font-medium bg-slate-50/30 transition-all placeholder:text-slate-350"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="postalCode" className="text-xs font-bold text-slate-500">Kode Pos (Opsional)</label>
                    <input
                      id="postalCode"
                      type="text"
                      placeholder="Contoh: 40135"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none text-xs font-medium bg-slate-50/30 transition-all placeholder:text-slate-350"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="fullAddress" className="text-xs font-bold text-slate-500">Alamat Lengkap Rumah *</label>
                  <textarea
                    id="fullAddress"
                    required
                    rows={3}
                    placeholder="Contoh: Jl. Dago No. 123, RT 02/RW 05, Blok C"
                    value={fullAddress}
                    onChange={(e) => setFullAddress(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none text-xs font-medium bg-slate-50/30 transition-all placeholder:text-slate-350 resize-none"
                  />
                </div>
              </div>

              {/* Section 3: Extra Info */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[var(--primary)] text-white text-[10px] font-black flex items-center justify-center">3</span>
                  Informasi Tambahan
                </h2>

                <div className="space-y-1.5">
                  <label htmlFor="notes" className="text-xs font-bold text-slate-500">Catatan Pengiriman (Opsional)</label>
                  <textarea
                    id="notes"
                    rows={2}
                    placeholder="Contoh: Warna merah cadangan, patokan dekat masjid Al-Ikhlas, titip ke pos satpam jika rumah kosong."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none text-xs font-medium bg-slate-50/30 transition-all placeholder:text-slate-350 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Order Sidebar Column (Right Column) */}
            <div className="lg:col-span-2 space-y-4 sticky top-[80px]">
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider pb-3 border-b border-slate-150">
                  Detail Pesanan
                </h2>

                {/* Items Mini List */}
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 pr-1">
                  {cartItems.map((item) => (
                    <div key={`${item.id}-${item.variantId || 'none'}`} className="py-3 flex items-center gap-3 text-xs">
                      <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="object-cover w-full h-full" />
                        ) : (
                          <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-850 truncate leading-tight">{item.name}</p>
                        {item.variantName && (
                          <p className="text-[10px] text-slate-400 font-semibold">Varian: {item.variantName}</p>
                        )}
                        <p className="text-[10px] text-slate-500 font-medium">Qty: {item.quantity}x</p>
                      </div>
                      <span className="font-bold text-slate-700">{formatRupiah(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 text-xs font-medium text-slate-600 pt-3 border-t border-slate-100">
                  <div className="flex justify-between">
                    <span>Estimasi Berat</span>
                    <span className="text-slate-850 font-bold">
                      {totalWeight >= 1000 
                        ? `${Number(totalWeight / 1000).toFixed(2)} kg` 
                        : `${totalWeight} gram`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subtotal Produk</span>
                    <span className="text-slate-850 font-bold">{formatRupiah(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ongkos Kirim</span>
                    <span className="text-emerald-600 font-black">Dihitung manual</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-150 flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800 uppercase">Grand Total</span>
                  <span className="text-lg font-black text-[var(--primary)]">{formatRupiah(subtotal)}</span>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200/70 rounded-2xl text-[10.5px] leading-relaxed text-amber-850 font-medium space-y-1 shadow-inner">
                  <p className="font-bold uppercase tracking-wider text-amber-800 text-[9px]">ℹ️ Pembayaran Manual</p>
                  <p>Instruksi pembayaran manual akan dikonfirmasi oleh admin toko melalui WhatsApp.</p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 px-4 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-black text-xs rounded-xl shadow-md transition-all text-center flex items-center justify-center gap-2
                    ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Memproses Pemesanan...</span>
                    </>
                  ) : (
                    <>
                      <span>Buat Pesanan & Bayar Manual</span>
                      <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth={2.3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
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

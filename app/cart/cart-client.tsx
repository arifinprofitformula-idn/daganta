'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart, CartItem } from '../../lib/cart/use-cart';
import { getTenantThemeConfig, TenantThemeConfig } from '../../lib/tenant/theme-config';

interface CartClientProps {
  tenant: {
    id: string;
    name: string;
    slug: string;
    subdomain: string;
  };
  tenantWhatsapp: string | null;
  isReadOnly?: boolean;
}

export default function CartClient({ tenant, tenantWhatsapp, isReadOnly = false }: CartClientProps) {
  const theme: TenantThemeConfig = getTenantThemeConfig(tenant.slug);
  const router = useRouter();
  const { cartItems, updateQuantity, removeFromCart, subtotal, totalWeight, isHydrated } = useCart();

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Handler increase quantity
  const handleIncrease = (item: CartItem) => {
    const res = updateQuantity(item.id, item.variantId, item.quantity + 1);
    if (!res.success) {
      alert(res.error || 'Gagal menambah jumlah item.');
    }
  };

  // Handler decrease quantity
  const handleDecrease = (item: CartItem) => {
    if (item.quantity <= 1) {
      removeFromCart(item.id, item.variantId);
    } else {
      updateQuantity(item.id, item.variantId, item.quantity - 1);
    }
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-slate-800 animate-spin" />
          <span className="text-xs text-slate-500 font-semibold">Memuat keranjang belanja...</span>
        </div>
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
            href="/"
            className="px-4 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-650 hover:text-slate-800 text-xs font-bold rounded-xl transition-all shadow-sm"
          >
            Lanjut Belanja
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10">
        <div className="max-w-4xl mx-auto space-y-6">
          {isReadOnly && (
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-800 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Checkout sementara dibatasi karena masa aktif toko perlu diperpanjang.</span>
            </div>
          )}

          {cartItems.length === 0 ? (
            /* Empty Cart State */
            <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-6 shadow-sm">
              <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-350 shadow-inner">
                <svg className="w-10 h-10 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="space-y-1.5 max-w-xs">
                <h2 className="text-base font-bold text-slate-800">Keranjang Belanja Kosong</h2>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Anda belum menambahkan produk apa pun ke keranjang belanja {tenant.name}.
                </p>
              </div>
              <Link 
                href="/"
                className="py-3 px-6 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-bold rounded-xl transition-all shadow-sm"
              >
                Mulai Belanja Sekarang
              </Link>
            </div>
          ) : (
            /* Cart Layout */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Items List Column (Left) */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm divide-y divide-slate-100">
                  {cartItems.map((item) => (
                    <div key={`${item.id}-${item.variantId || 'none'}`} className="p-5 flex gap-4">
                      {/* Product Thumbnail */}
                      <div className="relative w-20 h-20 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center overflow-hidden shrink-0">
                        {item.imageUrl ? (
                          <img 
                            src={item.imageUrl} 
                            alt={item.name}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <svg className="w-8 h-8 text-slate-300 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375 0 11-.75 0 .375 0 01.75 0z" />
                          </svg>
                        )}
                      </div>

                      {/* Product Info & Controls */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <Link 
                              href={`/p/${item.slug}`} 
                              className="text-sm font-black text-slate-800 hover:text-[var(--primary)] transition-colors leading-tight"
                            >
                              {item.name}
                            </Link>
                            <button 
                              type="button" 
                              onClick={() => removeFromCart(item.id, item.variantId)}
                              className="text-slate-400 hover:text-rose-600 transition-colors"
                              title="Hapus"
                            >
                              <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>

                          {/* Variant Badge */}
                          {item.variantName && (
                            <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-slate-100 border border-slate-200/50 text-slate-500 rounded-md">
                              Varian: {item.variantName}
                            </span>
                          )}
                        </div>

                        {/* Price & Qty Adjuster */}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-bold text-slate-700">{formatRupiah(item.price)}</span>
                          
                          <div className="flex items-center border border-slate-250 bg-slate-50 rounded-xl overflow-hidden shadow-inner">
                            <button
                              type="button"
                              onClick={() => handleDecrease(item)}
                              className="w-8 h-8 flex items-center justify-center font-bold text-slate-500 hover:bg-slate-100 active:bg-slate-200 text-xs transition-colors shrink-0"
                            >
                              –
                            </button>
                            <span className="w-8 text-center text-xs font-black text-slate-800 leading-none">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleIncrease(item)}
                              className="w-8 h-8 flex items-center justify-center font-bold text-slate-500 hover:bg-slate-100 active:bg-slate-200 text-xs transition-colors shrink-0"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary Column (Right) */}
              <div className="space-y-4">
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
                  <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider pb-3 border-b border-slate-150">
                    Ringkasan Belanja
                  </h2>

                  <div className="space-y-3 text-xs font-medium text-slate-600">
                    <div className="flex justify-between">
                      <span>Total Berat Estimasi</span>
                      <span className="text-slate-800 font-bold">
                        {totalWeight >= 1000 
                          ? `${Number(totalWeight / 1000).toFixed(2)} kg` 
                          : `${totalWeight} gram`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Subtotal Harga</span>
                      <span className="text-slate-800 font-bold">{formatRupiah(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Biaya Pengiriman</span>
                      <span className="text-emerald-600 font-bold">Dihitung manual</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-150 flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 uppercase">Total Belanja</span>
                    <span className="text-lg font-black text-[var(--primary)]">{formatRupiah(subtotal)}</span>
                  </div>

                  {isReadOnly ? (
                    <button
                      type="button"
                      disabled
                      className="w-full py-3.5 px-4 bg-slate-200 text-slate-400 font-bold text-xs rounded-xl cursor-not-allowed select-none text-center"
                    >
                      Checkout Dibatasi
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => router.push('/checkout')}
                      className="w-full py-3.5 px-4 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-black text-xs rounded-xl shadow-md transition-all text-center flex items-center justify-center gap-1.5"
                    >
                      <span>Lanjut ke Pembayaran</span>
                      <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth={2.3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
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

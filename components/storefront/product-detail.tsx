'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ProductCard from './product-card';
import { getTenantThemeConfig, TenantThemeConfig } from '../../lib/tenant/theme-config';
import { useCart } from '../../lib/cart/use-cart';

interface Variant {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  stock: number;
  weightGram: number;
}

interface ProductDetailProps {
  tenant: {
    id: string;
    name: string;
    slug: string;
    subdomain: string;
  };
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    basePrice: number;
    imageUrl: string | null;
    category: {
      name: string;
    } | null;
    variants: Variant[];
  };
  relatedProducts: any[];
  tenantWhatsapp: string | null; // Dinamis dari default address tenant, nullable
  isReadOnly?: boolean;
}

export default function ProductDetail({
  tenant,
  product,
  relatedProducts,
  tenantWhatsapp,
  isReadOnly = false,
}: ProductDetailProps) {
  // 1. Ambil Konfigurasi Tema Dinamis untuk Tenant ini
  const theme: TenantThemeConfig = getTenantThemeConfig(tenant.slug);
  const router = useRouter();
  const { addToCart, totalItems, isHydrated } = useCart();

  // States
  const hasVariants = product.variants && product.variants.length > 0;
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    hasVariants ? product.variants[0] : null
  );
  const [isAddedSuccess, setIsAddedSuccess] = useState<boolean>(false);

  // Format Price to Rupiah
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Dapatkan harga terendah untuk label "Mulai dari"
  const minPrice = hasVariants
    ? Math.min(...product.variants.map((v) => v.price))
    : product.basePrice;

  // Dapatkan harga saat ini yang perlu ditampilkan
  const currentPrice = selectedVariant ? selectedVariant.price : minPrice;

  // Menentukan status stok produk/varian
  const getStockBadge = (stock: number) => {
    if (stock > 10) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          🟢 Tersedia
        </span>
      );
    } else if (stock > 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          🟡 Stok Terbatas
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          🔴 Stok Habis
        </span>
      );
    }
  };

  // Stok global jika tidak memilih varian (untuk fallback, tapi default selalu memilih varian pertama)
  const totalStock = hasVariants
    ? product.variants.reduce((acc, v) => acc + v.stock, 0)
    : 0;

  const currentStock = selectedVariant ? selectedVariant.stock : totalStock;
  const currentWeight = selectedVariant ? selectedVariant.weightGram : 0;

  // Handler Tambah ke Keranjang
  const handleAddToCart = () => {
    if (currentStock <= 0) {
      alert('Maaf, produk ini sedang habis.');
      return;
    }

    const itemToAdd = {
      id: product.id,
      variantId: selectedVariant ? selectedVariant.id : null,
      name: product.name,
      variantName: selectedVariant ? selectedVariant.name : null,
      price: currentPrice,
      imageUrl: product.imageUrl,
      weightGram: currentWeight,
      stock: currentStock,
      slug: product.slug
    };

    const res = addToCart(itemToAdd, 1);
    if (res.success) {
      setIsAddedSuccess(true);
      setTimeout(() => setIsAddedSuccess(false), 2000);
    } else {
      alert(res.error || 'Gagal menambahkan ke keranjang');
    }
  };

  // Handler Beli Sekarang (Langsung ke Checkout)
  const handleBuyNow = () => {
    if (currentStock <= 0) {
      alert('Maaf, produk ini sedang habis.');
      return;
    }

    const itemToAdd = {
      id: product.id,
      variantId: selectedVariant ? selectedVariant.id : null,
      name: product.name,
      variantName: selectedVariant ? selectedVariant.name : null,
      price: currentPrice,
      imageUrl: product.imageUrl,
      weightGram: currentWeight,
      stock: currentStock,
      slug: product.slug
    };

    const res = addToCart(itemToAdd, 1);
    if (res.success) {
      router.push('/checkout');
    } else {
      alert(res.error || 'Gagal memproses pembelian');
    }
  };

  // Format link WhatsApp dinamis
  const getWhatsappUrl = () => {
    if (!tenantWhatsapp) return null;
    
    // Normalisasi nomor wa
    let normalizedPhone = tenantWhatsapp.replace(/[^0-9]/g, '');
    if (normalizedPhone.startsWith('0')) {
      normalizedPhone = '62' + normalizedPhone.substring(1);
    }
    
    // Custom message
    const message = `Halo ${tenant.name}, saya tertarik dengan produk:\n\n*${product.name}*${
      selectedVariant ? `\nVarian: *${selectedVariant.name}*` : ''
    }\n\nMohon informasinya.`;
    
    return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
  };

  const whatsappUrl = getWhatsappUrl();

  return (
    <div 
      className="min-h-screen bg-white text-slate-800 flex flex-col font-sans select-none antialiased scroll-smooth"
      style={{ 
        '--primary': theme.primaryColor, 
        '--secondary': theme.secondaryColor,
        '--accent': theme.accentColor,
        '--primary-hover': theme.hoverColor
      } as React.CSSProperties}
    >
      {/* Read-Only Warning Banner */}
      {isReadOnly && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-800 px-4 py-2 text-center text-xs font-semibold backdrop-blur-sm sticky top-0 z-50">
          ⚠️ Toko ini sedang dalam Mode Terbatas (Read-Only). Transaksi pembelian saat ini tidak dapat dilakukan.
        </div>
      )}

      {/* Header (Sticky Navigation) */}
      <header className={`border-b border-slate-100 bg-white/90 backdrop-blur-md sticky z-40 ${isReadOnly ? 'top-[33px]' : 'top-0'}`}>
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
          <div className="flex items-center gap-3">
            {/* Dynamic Cart Icon Link */}
            <Link 
              href="/cart"
              className="relative p-2.5 text-slate-600 hover:text-[var(--primary)] transition-all flex items-center justify-center shrink-0 bg-slate-50 hover:bg-slate-100/70 border border-slate-200/50 rounded-xl shadow-sm hover:shadow-md"
              title="Keranjang Belanja"
            >
              <svg className="w-4.5 h-4.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth={2.3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {isHydrated && totalItems > 0 && (
                <span 
                  className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full text-[9px] font-black text-white flex items-center justify-center px-1 border border-white"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  {totalItems}
                </span>
              )}
            </Link>

            <Link 
              href="/"
              className="px-4 py-2 bg-slate-50 border border-slate-200 text-slate-650 hover:text-slate-800 text-xs font-bold rounded-xl transition-all shadow-sm hover:shadow-md"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full space-y-8 pb-24 md:pb-12">
        {/* Breadcrumb */}
        <nav className="text-xs text-slate-400 flex items-center gap-2 font-medium">
          <Link href="/" className="hover:text-[var(--primary)] transition-colors">Etalase</Link>
          <svg className="w-3 h-3 stroke-current text-slate-350" fill="none" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-slate-600 truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Product Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left Column: Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[4/5] w-full bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-center overflow-hidden shadow-2xl">
              {product.imageUrl ? (
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-300 space-y-3 p-8">
                  <svg className="w-16 h-16 stroke-current text-slate-350" fill="none" viewBox="0 0 24 24" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375 0 11-.75 0 .375 0 01.75 0z" />
                  </svg>
                  <span className="text-xs font-bold text-slate-400 text-center">Gambar Produk Belum Tersedia</span>
                </div>
              )}
              
              {/* Category Tag */}
              {product.category?.name && (
                <span 
                  className="absolute top-4 left-4 px-3 py-1.5 text-xs font-bold text-white rounded-full shadow-md"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  {product.category.name}
                </span>
              )}
            </div>
          </div>

          {/* Right Column: Product Info */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              {/* Name & Stock */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  {getStockBadge(currentStock)}
                  {hasVariants && (
                    <span 
                      className="px-2.5 py-1 rounded-md text-[9px] font-bold border"
                      style={{ color: theme.primaryColor, backgroundColor: theme.accentColor, borderColor: theme.primaryColor + '20' }}
                    >
                      {product.variants.length} Varian Tersedia
                    </span>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-800 leading-snug">
                  {product.name}
                </h1>
              </div>

              {/* Price Area */}
              <div className="p-5 bg-slate-50 border border-slate-100 rounded-3xl flex flex-col gap-1 shadow-inner">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
                  <span>Harga Terbaik</span>
                  {hasVariants && (
                    <span 
                      className="text-[9px] font-extrabold normal-case px-2 py-0.5 rounded border"
                      style={{ color: theme.primaryColor, backgroundColor: theme.primaryColor + '10', borderColor: theme.primaryColor + '20' }}
                    >
                      Mulai dari {formatRupiah(minPrice)}
                    </span>
                  )}
                </span>
                <div className="flex items-baseline gap-2">
                  <span 
                    className="text-3xl font-black"
                    style={{ color: theme.primaryColor }}
                  >
                    {formatRupiah(currentPrice)}
                  </span>
                </div>
              </div>

              {/* Weight Information */}
              {currentWeight > 0 && (
                <div className="flex items-center gap-2.5 text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded-2xl p-4 font-medium">
                  <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                  <span>Estimasi Berat: <strong className="text-slate-700">{currentWeight} gram</strong> ({Number(currentWeight / 1000).toFixed(2)} kg)</span>
                </div>
              )}

              {/* Product Variants Selection */}
              {hasVariants && (
                <div className="space-y-3">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Pilih Varian Produk</span>
                  <div className="flex flex-wrap gap-2.5">
                    {product.variants.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        className={`px-4 py-2.5 text-xs font-bold rounded-xl border transition-all flex flex-col items-start gap-0.5
                          ${selectedVariant?.id === v.id
                            ? 'bg-slate-50 border-[var(--primary)] text-slate-800 shadow-sm'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-700'
                          }`}
                        style={selectedVariant?.id === v.id ? { borderColor: theme.primaryColor, color: theme.primaryColor } : {}}
                      >
                        <span>{v.name}</span>
                        <span className="text-[9px] font-bold text-slate-400">
                          {formatRupiah(v.price)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="space-y-3">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Deskripsi Lengkap</span>
                <div className="text-slate-655 text-xs sm:text-sm leading-relaxed whitespace-pre-line bg-slate-50/50 border border-slate-100 rounded-2xl p-5 font-medium">
                  {product.description || 'Tidak ada deskripsi tertulis untuk produk ini.'}
                </div>
              </div>
            </div>

            {/* Desktop Action CTA Area */}
            <div className="hidden md:block pt-6 border-t border-slate-100 space-y-3">
              {/* WhatsApp CTA */}
              {whatsappUrl && !isReadOnly ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-emerald-100 hover:scale-[1.01]"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.588 2.025 14.11 1 11.48 1c-5.44 0-9.866 4.372-9.87 9.802 0 1.714.45 3.387 1.302 4.887L1.888 20.3l4.759-1.146z" />
                  </svg>
                  <span>Tanya via WhatsApp</span>
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full py-4 px-6 bg-slate-100 border border-slate-200 text-slate-400 font-bold text-sm rounded-2xl flex items-center justify-center gap-2.5 cursor-not-allowed select-none"
                >
                  <svg className="w-5 h-5 fill-current text-slate-350" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.588 2.025 14.11 1 11.48 1c-5.44 0-9.866 4.372-9.87 9.802 0 1.714.45 3.387 1.302 4.887L1.888 20.3l4.759-1.146z" />
                  </svg>
                  <span>{isReadOnly ? 'Mode Terbatas (Read-Only)' : 'WhatsApp belum diatur'}</span>
                </button>
              )}

              {/* Actions Beli Sekarang & Tambah Keranjang */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={currentStock <= 0}
                  className={`py-3 px-4 font-bold text-xs rounded-xl transition-all select-none flex items-center justify-center gap-1.5 border
                    ${currentStock <= 0
                      ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-50'
                      : isAddedSuccess 
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-600 shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-800 shadow-sm hover:shadow'
                    }`}
                >
                  {isAddedSuccess ? (
                    <>
                      <svg className="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>✓ Ditambahkan</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5 fill-none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <span>Tambah Keranjang</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={currentStock <= 0}
                  className={`py-3 px-4 font-bold text-xs rounded-xl transition-all shadow-sm hover:shadow
                    ${currentStock <= 0
                      ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed opacity-50'
                      : 'bg-[var(--primary)] hover:bg-[var(--primary-hover)] border border-[var(--primary)] text-white'
                    }`}
                >
                  <span>Beli Sekarang</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="pt-12 border-t border-slate-100 space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Produk Lainnya</h2>
              <p className="text-xs text-slate-400 font-medium">Lihat katalog produk unggulan lainnya dari {tenant.name}</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard 
                  key={p.id} 
                  product={p} 
                  isReadOnly={isReadOnly} 
                  primaryColor={theme.primaryColor}
                  hoverColor={theme.hoverColor}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-8 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-6 space-y-2">
          <p>&copy; {new Date().getFullYear()} {tenant.name}. Seluruh hak cipta dilindungi.</p>
          <p className="text-[10px] text-slate-350">
            Didukung oleh <a href="https://daganta.store" className="hover:underline text-[var(--primary)] font-bold">Daganta Storefront Platform</a>
          </p>
        </div>
      </footer>

      {/* 6. MOBILE COMMERCE CTA (STICKY BOTTOM CTA FOR MOBILE SCREEN ONLY) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 px-6 py-3.5 flex gap-3 z-40 shadow-xl">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={currentStock <= 0}
          className={`flex-1 py-3 text-xs font-black rounded-xl border transition-all select-none
            ${currentStock <= 0
              ? 'bg-slate-50 text-slate-350 border-slate-100 cursor-not-allowed'
              : isAddedSuccess
                ? 'bg-emerald-50 border-emerald-500 text-emerald-600 shadow-sm'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
        >
          {isAddedSuccess ? '✓ Ditambahkan' : 'Keranjang'}
        </button>
        
        {whatsappUrl && !isReadOnly ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-3 w-[70%] py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-black rounded-xl text-center flex items-center justify-center gap-1.5 shadow-md shadow-emerald-100"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.588 2.025 14.11 1 11.48 1c-5.44 0-9.866 4.372-9.87 9.802 0 1.714.45 3.387 1.302 4.887L1.888 20.3l4.759-1.146z" />
            </svg>
            <span>Tanya via WhatsApp</span>
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="flex-3 w-[70%] py-3 bg-slate-200 text-slate-400 text-xs font-black rounded-xl cursor-not-allowed select-none"
          >
            Offline
          </button>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ProductCard from './product-card';

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
  // Format Price to Rupiah
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const hasVariants = product.variants && product.variants.length > 0;

  // State untuk varian terpilih
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    hasVariants ? product.variants[0] : null
  );

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
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          🟢 Tersedia
        </span>
      );
    } else if (stock > 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-400 border border-amber-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          🟡 Stok Terbatas
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-950/80 text-rose-400 border border-rose-500/20">
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

  // Format link WhatsApp dinamis
  const getWhatsappUrl = () => {
    if (!tenantWhatsapp) return null;
    
    // Normalisasi nomor wa
    let normalizedPhone = tenantWhatsapp.replace(/[^0-9]/g, '');
    if (normalizedPhone.startsWith('0')) {
      normalizedPhone = '62' + normalizedPhone.substring(1);
    }
    
    // Custom message
    const message = `Halo, saya tertarik dengan produk:\n\n*${product.name}*${
      selectedVariant ? `\nVarian: *${selectedVariant.name}*` : ''
    }\n\nMohon informasinya.`;
    
    return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
  };

  const whatsappUrl = getWhatsappUrl();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none antialiased">
      {/* Read-Only Warning Banner */}
      {isReadOnly && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-300 px-4 py-2.5 text-center text-xs font-semibold backdrop-blur-sm sticky top-0 z-50">
          ⚠️ Toko ini sedang dalam Mode Terbatas (Read-Only). Transaksi pembelian saat ini tidak dapat dilakukan.
        </div>
      )}

      {/* Header */}
      <header className={`border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky z-40 ${isReadOnly ? 'top-[37px]' : 'top-0'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <span className="font-extrabold text-sm text-white uppercase">{tenant.name.substring(0, 1)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-white leading-tight">{tenant.name}</span>
              <span className="text-[10px] text-slate-400 font-mono">{tenant.subdomain}.daganta.store</span>
            </div>
          </Link>
          <div>
            <Link 
              href="/"
              className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-350 hover:text-slate-200 text-xs font-semibold rounded-lg transition-all"
            >
              Kembali ke Toko
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full space-y-12">
        {/* Breadcrumb */}
        <nav className="text-xs text-slate-500 flex items-center gap-2">
          <Link href="/" className="hover:text-indigo-400 transition-colors">Etalase</Link>
          <svg className="w-3 h-3 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-slate-300 truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Product Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left Column: Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square w-full bg-slate-900/60 border border-slate-850 rounded-2xl flex items-center justify-center overflow-hidden shadow-2xl">
              {product.imageUrl ? (
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-650 space-y-3 p-8">
                  <svg className="w-16 h-16 stroke-current text-slate-700" fill="none" viewBox="0 0 24 24" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375 0 11-.75 0 .375 0 01.75 0z" />
                  </svg>
                  <span className="text-xs font-semibold text-slate-555 text-center">Gambar Produk Belum Diunggah</span>
                </div>
              )}
              
              {/* Category Tag */}
              {product.category?.name && (
                <span className="absolute top-4 left-4 px-3 py-1.5 text-xs font-semibold bg-slate-950/95 text-indigo-400 border border-slate-800 rounded-full shadow-lg">
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
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-indigo-950/50 text-indigo-400 border border-indigo-500/20">
                      {product.variants.length} Varian Tersedia
                    </span>
                  )}
                </div>
                <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white leading-snug">
                  {product.name}
                </h1>
              </div>

              {/* Price Area */}
              <div className="p-4 bg-slate-900 border border-slate-850 rounded-2xl flex flex-col gap-1 shadow-inner">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center justify-between">
                  <span>Harga</span>
                  {hasVariants && (
                    <span className="text-[9px] text-indigo-450 normal-case font-bold bg-indigo-950/40 px-2 py-0.5 border border-indigo-500/10 rounded-md">
                      Mulai dari {formatRupiah(minPrice)}
                    </span>
                  )}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-indigo-400">
                    {formatRupiah(currentPrice)}
                  </span>
                </div>
              </div>

              {/* Weight Information */}
              {currentWeight > 0 && (
                <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/30 border border-slate-900/80 rounded-xl p-3">
                  <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                  <span>Estimasi Berat: <strong className="text-slate-350">{currentWeight} gram</strong> ({Number(currentWeight / 1000).toFixed(2)} kg)</span>
                </div>
              )}

              {/* Product Variants Selection */}
              {hasVariants && (
                <div className="space-y-3">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Pilih Varian</span>
                  <div className="flex flex-wrap gap-2.5">
                    {product.variants.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all flex flex-col items-start gap-0.5
                          ${selectedVariant?.id === v.id
                            ? 'bg-indigo-600/10 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-500/5'
                            : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-400 hover:text-slate-300'
                          }`}
                      >
                        <span>{v.name}</span>
                        <span className="text-[9px] font-medium text-slate-500">
                          {formatRupiah(v.price)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Deskripsi Produk</span>
                <div className="text-slate-300 text-xs md:text-sm leading-relaxed whitespace-pre-line bg-slate-900/10 border border-slate-900/30 rounded-xl p-4">
                  {product.description || 'Tidak ada deskripsi tertulis untuk produk ini.'}
                </div>
              </div>
            </div>

            {/* Action CTA Area */}
            <div className="pt-6 border-t border-slate-900 space-y-3">
              {/* WhatsApp CTA */}
              {whatsappUrl && !isReadOnly ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-emerald-950/20"
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
                  className="w-full py-3.5 px-6 bg-slate-900 border border-slate-800 text-slate-500 font-bold text-sm rounded-xl flex items-center justify-center gap-2.5 cursor-not-allowed select-none"
                >
                  <svg className="w-5 h-5 fill-current text-slate-650" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.588 2.025 14.11 1 11.48 1c-5.44 0-9.866 4.372-9.87 9.802 0 1.714.45 3.387 1.302 4.887L1.888 20.3l4.759-1.146z" />
                  </svg>
                  <span>{isReadOnly ? 'Mode Terbatas (Read-Only)' : 'WhatsApp belum diatur'}</span>
                </button>
              )}

              {/* Placeholders Beli Sekarang & Tambah Keranjang */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled
                  className="py-3 px-4 bg-indigo-600/10 border border-indigo-500/20 hover:border-indigo-500/30 text-indigo-400 font-bold text-xs rounded-xl cursor-not-allowed transition-all select-none opacity-50 flex items-center justify-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5 fill-none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span>Tambah Keranjang</span>
                </button>

                <button
                  type="button"
                  disabled
                  className="py-3 px-4 bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 font-bold text-xs rounded-xl cursor-not-allowed transition-all select-none opacity-50 flex items-center justify-center gap-1.5"
                >
                  <span>Beli Sekarang</span>
                  <svg className="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="pt-10 border-t border-slate-900 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white">Produk Lainnya</h2>
              <p className="text-xs text-slate-500">Lihat produk unggulan lainnya dari {tenant.name}</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard 
                  key={p.id} 
                  product={p} 
                  isReadOnly={isReadOnly} 
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-6 space-y-2">
          <p>&copy; {new Date().getFullYear()} {tenant.name}. Seluruh hak cipta dilindungi.</p>
          <p className="text-[10px] text-slate-650">
            Didukung oleh <a href="https://daganta.store" className="hover:underline text-indigo-500 font-medium">Daganta Storefront Platform</a>
          </p>
        </div>
      </footer>
    </div>
  );
}

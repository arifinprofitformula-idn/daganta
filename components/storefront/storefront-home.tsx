'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ProductCard from './product-card';
import { getTenantThemeConfig, TenantThemeConfig } from '../../lib/tenant/theme-config';
import { useCart } from '../../lib/cart/use-cart';

interface StorefrontHomeProps {
  tenant: {
    id: string;
    name: string;
    slug: string;
    subdomain: string;
  };
  products: any[];
  isReadOnly?: boolean;
  tenantWhatsapp: string | null; // Dinamis dari default address tenant, nullable
}

export default function StorefrontHome({ 
  tenant, 
  products, 
  isReadOnly = false,
  tenantWhatsapp 
}: StorefrontHomeProps) {
  // 1. Ambil Konfigurasi Tema Dinamis untuk Tenant ini
  const theme: TenantThemeConfig = getTenantThemeConfig(tenant.slug);
  const { totalItems, isHydrated } = useCart();

  // States
  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [showMobileSticky, setShowMobileSticky] = useState<boolean>(false);

  // Refs untuk navigasi gulir mulus
  const heroRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);

  // Deteksi gulir untuk Header dan Mobile Sticky CTA
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Tampilkan sticky bottom mobile CTA hanya setelah melewati area Hero
      if (heroRef.current) {
        const heroHeight = heroRef.current.offsetHeight;
        if (window.scrollY > heroHeight - 100) {
          setShowMobileSticky(true);
        } else {
          setShowMobileSticky(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Format Rupiah
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Navigasi gulir mulus
  const scrollToSection = (elementRef: React.RefObject<HTMLDivElement | null>) => {
    if (elementRef.current) {
      const headerOffset = 70;
      const elementPosition = elementRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Dapatkan daftar kategori dinamis dari database produk
  const categories = ['Semua', ...Array.from(new Set(products
    .filter(p => p.category?.name)
    .map(p => p.category.name)
  ))];

  // Ambil produk unggulan utama (Apple-style featured)
  const featuredProduct = products.find(p => p.isFeatured) || products[0];

  // Ambil produk Best Seller (produk kedua jika ada)
  const bestSellerProduct = products.length > 1 ? products[1] : products[0];

  // Saring produk berdasarkan kategori dan bilah pencarian
  const filteredProducts = products.filter(product => {
    const matchesCategory = activeCategory === 'Semua' || product.category?.name === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Pembuatan link WhatsApp otomatis
  const getWhatsappUrl = (customText?: string) => {
    if (!tenantWhatsapp) return null;
    
    let normalizedPhone = tenantWhatsapp.replace(/[^0-9]/g, '');
    if (normalizedPhone.startsWith('0')) {
      normalizedPhone = '62' + normalizedPhone.substring(1);
    }
    
    const message = customText || `Halo ${tenant.name}, saya ingin berkonsultasi mengenai produk rotan latihan. Mohon informasinya.`;
    return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
  };

  const mainWhatsappUrl = getWhatsappUrl();

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
      {/* ⚠️ Warning Banner (Read-Only) */}
      {isReadOnly && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-800 px-4 py-2 text-center text-xs font-semibold backdrop-blur-sm sticky top-0 z-50">
          ⚠️ Checkout sementara dibatasi karena masa aktif toko perlu diperpanjang.
        </div>
      )}

      {/* 5. STICKY HEADER NAVIGATION */}
      <header className={`border-b border-slate-100 bg-white/90 backdrop-blur-md sticky z-40 transition-all duration-300 ${isReadOnly ? 'top-[33px]' : 'top-0'} ${isScrolled ? 'shadow-md shadow-slate-100/50 py-3' : 'py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo & Store Name */}
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2.5 text-left group">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
              <span className="font-black text-xs text-white uppercase">{tenant.name.substring(0, 1)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black tracking-tight text-slate-800 uppercase leading-none">{tenant.name}</span>
              <span className="text-[9px] text-slate-400 font-mono mt-0.5 leading-none">{tenant.subdomain}.daganta.store</span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-600">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-[var(--primary)] transition-colors">Beranda</button>
            <button onClick={() => scrollToSection(productsRef)} className="hover:text-[var(--primary)] transition-colors">Produk</button>
            <button onClick={() => scrollToSection(aboutRef)} className="hover:text-[var(--primary)] transition-colors">Tentang Kami</button>
            <button onClick={() => scrollToSection(faqRef)} className="hover:text-[var(--primary)] transition-colors">FAQ</button>
          </nav>

          {/* Actions Block */}
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

            {mainWhatsappUrl && !isReadOnly ? (
              <a 
                href={mainWhatsappUrl || undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-100 flex items-center gap-1.5 animate-scaleIn"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.588 2.025 14.11 1 11.48 1c-5.44 0-9.866 4.372-9.87 9.802 0 1.714.45 3.387 1.302 4.887L1.888 20.3l4.759-1.146z" />
                </svg>
                <span>WhatsApp</span>
              </a>
            ) : (
              <button 
                disabled
                className="px-4 py-2 bg-slate-100 border border-slate-200 text-slate-400 text-xs font-bold rounded-xl cursor-not-allowed"
              >
                Offline
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 1. SECTION 1: FULL BRAND HERO (Problem -> Solution -> Product) */}
      <section ref={heroRef} className="relative overflow-hidden bg-slate-50 border-b border-slate-100 py-16 lg:py-24">
        {/* Subtle decorative circles */}
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[var(--primary)]/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 translate-x-1/2 w-[250px] h-[250px] bg-[var(--secondary)]/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative">
          {/* Hero Left Content */}
          <div className="space-y-6 text-center lg:text-left">
            {/* Supporting Store Name Badge */}
            <span 
              className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm"
              style={{ color: theme.primaryColor, backgroundColor: theme.accentColor, borderColor: theme.primaryColor + '20' }}
            >
              🇮🇩 {tenant.name} Official
            </span>
            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.12]">
              {theme.headline}
            </h1>
            {/* Subheadline */}
            <p className="max-w-xl mx-auto lg:mx-0 text-sm sm:text-base text-slate-500 leading-relaxed font-medium">
              {theme.subheadline}
            </p>
            {/* Buttons CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={() => scrollToSection(productsRef)}
                className="w-full sm:w-auto px-7 py-3.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-extrabold rounded-xl transition-all shadow-lg shadow-slate-200 hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-1.5"
              >
                <span>Lihat Produk Unggulan</span>
                <svg className="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 13l-7 7-7-7m14-6l-7 7-7-7" />
                </svg>
              </button>
              {mainWhatsappUrl && !isReadOnly ? (
                <a
                  href={mainWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-7 py-3.5 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-350 text-xs font-extrabold rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4 fill-emerald-600" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.588 2.025 14.11 1 11.48 1c-5.44 0-9.866 4.372-9.87 9.802 0 1.714.45 3.387 1.302 4.887L1.888 20.3l4.759-1.146z" />
                  </svg>
                  <span>Hubungi WhatsApp</span>
                </a>
              ) : (
                <button
                  disabled
                  className="w-full sm:w-auto px-7 py-3.5 bg-slate-100 border border-slate-200 text-slate-400 text-xs font-extrabold rounded-xl cursor-not-allowed"
                >
                  WhatsApp Offline
                </button>
              )}
            </div>
          </div>

          {/* Hero Right visual Grid (Lifestyle Image) */}
          <div className="relative">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden border border-slate-100 shadow-2xl bg-slate-200 group">
              <img 
                src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1200&auto=format&fit=crop" 
                alt="Martial arts rattan training staff background" 
                className="object-cover w-full h-full group-hover:scale-102 transition-transform duration-700"
              />
            </div>
            {/* Overlay float badge */}
            <div className="absolute -bottom-6 -left-6 bg-white border border-slate-150 p-4 rounded-2xl shadow-xl flex items-center gap-3 max-w-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                🏆
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Garansi Toya</span>
                <span className="text-xs font-bold text-slate-800">100% Rotan Asli Lurus & Halus</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SECTION 2: TRUST BAR */}
      <section className="bg-white border-b border-slate-100 py-6 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {theme.whyChooseUs.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center justify-center p-3 space-y-1.5">
                <span className="text-xl">{item.title.split(' ')[0]}</span>
                <span className="text-xs font-extrabold text-slate-800">{item.title.substring(item.title.indexOf(' ') + 1)}</span>
                <span className="text-[10px] text-slate-400 font-medium">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. SECTION 3: WHY CHOOSE US CARDS */}
      <section className="bg-slate-50 border-b border-slate-100 py-16">
        <div className="max-w-7xl mx-auto px-6 space-y-12 text-center">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Kenapa Memilih {tenant.name}?
            </h2>
            <p className="max-w-md mx-auto text-xs sm:text-sm text-slate-400 font-medium">
              Kami berkomitmen menghadirkan produk dengan standar tertinggi untuk mendukung performa latihan Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-slate-100 rounded-2xl p-6 text-center space-y-3 hover:shadow-lg hover:shadow-slate-100/50 transition-all duration-300">
              <div className="mx-auto w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-xl">🎋</div>
              <h3 className="font-extrabold text-sm text-slate-800">Rotan Pilihan</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">Dibuat murni dari rotan alam kualitas teratas yang diseleksi tingkat kelurusannya secara presisi.</p>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-6 text-center space-y-3 hover:shadow-lg hover:shadow-slate-100/50 transition-all duration-300">
              <div className="mx-auto w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-xl">🔨</div>
              <h3 className="font-extrabold text-sm text-slate-800">Kuat & Tahan Lama</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">Melalui proses tradisional pengasapan dan pelurusan khusus untuk ketahanan maksimal benturan.</p>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-6 text-center space-y-3 hover:shadow-lg hover:shadow-slate-100/50 transition-all duration-300">
              <div className="mx-auto w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-xl">📏</div>
              <h3 className="font-extrabold text-sm text-slate-800">Ukuran Standar</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">Ukuran panjang dan berat disesuaikan dengan regulasi latihan bela diri praktis perguruan.</p>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-6 text-center space-y-3 hover:shadow-lg hover:shadow-slate-100/50 transition-all duration-300">
              <div className="mx-auto w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-xl">🚀</div>
              <h3 className="font-extrabold text-sm text-slate-800">Pengiriman Aman</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">Kemasan tabung pelindung berlapis khusus agar toya sampai tanpa melengkung/cacat fisik.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECTION 4: APPLE-STYLE FEATURED PRODUCT SHOWCASE */}
      {featuredProduct && (
        <section className="bg-white border-b border-slate-100 py-20 lg:py-28 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 lg:p-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative shadow-inner">
              {/* Highlight background text */}
              <div className="absolute top-6 right-8 text-7xl lg:text-9xl font-black text-slate-200/40 select-none font-sans pointer-events-none uppercase">
                FLAGSHIP
              </div>

              {/* Showcase Image (Left) */}
              <div className="relative aspect-[4/5] w-full max-w-sm mx-auto bg-slate-200/50 rounded-2xl overflow-hidden shadow-2xl border border-slate-200/30 group">
                {featuredProduct.imageUrl ? (
                  <img 
                    src={featuredProduct.imageUrl} 
                    alt={featuredProduct.name}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-350 p-8 w-full h-full select-none text-center">
                    <span className="text-4xl mb-2">🌾</span>
                    <span className="text-[10px] font-black uppercase text-slate-400">Ilustrasi Toya Rotan Berkualitas</span>
                  </div>
                )}
                
                {featuredProduct.category?.name && (
                  <span className="absolute top-4 left-4 px-3 py-1 bg-[var(--primary)] text-white text-[10px] font-black uppercase rounded-full shadow-md">
                    {featuredProduct.category.name}
                  </span>
                )}
              </div>

              {/* Showcase Description (Right) */}
              <div className="space-y-6 relative">
                <span className="text-[10px] text-[var(--primary)] font-black uppercase tracking-widest block">
                  Produk Andalan Terlaris
                </span>
                
                <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                  {featuredProduct.name}
                </h2>
                
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  {featuredProduct.description || 'Peralatan rotan berkualitas tinggi dengan tingkat kelurusan terbaik. Kuat menahan gesekan latihan silat/tradisional dengan presisi tinggi.'}
                </p>

                <div className="flex flex-col gap-1 pb-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Harga Penawaran</span>
                  <span className="text-2xl font-black text-[var(--primary)]">
                    {formatRupiah(Number(featuredProduct.basePrice))}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link 
                    href={`/p/${featuredProduct.slug}`}
                    className="px-6 py-3.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-extrabold rounded-xl transition-all shadow-md text-center flex items-center justify-center gap-1.5"
                  >
                    <span>Lihat Spesifikasi Lengkap</span>
                    <svg className="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>

                  {getWhatsappUrl(`Halo, saya tertarik dengan Produk Andalan: ${featuredProduct.name}. Mohon informasi ketersediaannya.`) && !isReadOnly && (
                    <a
                      href={getWhatsappUrl(`Halo, saya tertarik dengan Produk Andalan: ${featuredProduct.name}. Mohon informasi ketersediaannya.`) || undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-extrabold rounded-xl transition-all text-center flex items-center justify-center gap-2 shadow-sm"
                    >
                      <svg className="w-4 h-4 fill-emerald-600" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.588 2.025 14.11 1 11.48 1c-5.44 0-9.866 4.372-9.87 9.802 0 1.714.45 3.387 1.302 4.887L1.888 20.3l4.759-1.146z" />
                      </svg>
                      <span>Tanya via WhatsApp</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. SECTION 5: BEST SELLER SHOWCASE */}
      {bestSellerProduct && bestSellerProduct !== featuredProduct && (
        <section className="bg-slate-50 border-b border-slate-100 py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Image Left */}
              <div className="lg:col-span-5 relative aspect-[4/3] rounded-3xl overflow-hidden border border-slate-150 shadow-2xl bg-white flex items-center justify-center p-2 group">
                {bestSellerProduct.imageUrl ? (
                  <img 
                    src={bestSellerProduct.imageUrl} 
                    alt={bestSellerProduct.name}
                    className="object-cover w-full h-full group-hover:scale-103 transition-transform duration-500 rounded-2xl"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-350 p-6 select-none text-center">
                    <span className="text-4xl mb-2">🥋</span>
                    <span className="text-[10px] font-black uppercase text-slate-400">Rotan Pilihan Berkualitas Tinggi</span>
                  </div>
                )}
              </div>

              {/* Story Right */}
              <div className="lg:col-span-7 space-y-6">
                <span className="px-2.5 py-1 text-[9px] font-extrabold uppercase bg-amber-500/10 text-amber-700 border border-amber-500/20 rounded-md tracking-wider">
                  🔥 Best Seller
                </span>
                
                <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                  Pilihan Favorit Perguruan: {bestSellerProduct.name}
                </h2>
                
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                  Merupakan seri toya paling diminati oleh siswa perguruan di seluruh daerah. Menawarkan bobot latihan yang seimbang antara kelenturan alami rotan, durabilitas kayu, serta pemolesan ekstra lurus untuk mempermudah latihan jurus kiprah mapun tanding.
                </p>

                <div className="flex items-center gap-1">
                  <span className="text-xs text-slate-400 font-semibold">Harga Mulai</span>
                  <span className="text-xl font-extrabold text-[var(--primary)]">
                    {formatRupiah(Number(bestSellerProduct.basePrice))}
                  </span>
                </div>

                <div className="flex gap-4">
                  <Link 
                    href={`/p/${bestSellerProduct.slug}`}
                    className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-md"
                  >
                    Pesan Sekarang
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 6. SECTION 6: PRODUCT GRID (KATALOG UTAMA) */}
      <section ref={productsRef} className="bg-white border-b border-slate-100 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 space-y-8">
          
          {/* Headline & Search Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-1.5 text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Katalog Produk Pilihan</h2>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">
                Pilih ukuran dan spesifikasi produk yang paling sesuai dengan kebutuhan perguruan bela diri Anda.
              </p>
            </div>

            {/* Bilah Pencarian Ritel Premium */}
            <div className="relative max-w-sm w-full mx-auto lg:mx-0">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari alat rotan latihan..." 
                className="w-full bg-slate-50 border border-slate-200 focus:border-[var(--primary)] focus:bg-white rounded-xl py-3 pl-10 pr-4 text-xs text-slate-850 font-medium transition-all shadow-sm focus:outline-none"
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs font-bold font-sans"
                >
                  Batal
                </button>
              )}
            </div>
          </div>

          {/* 7. DYNAMIC CATEGORY CHIPS (Horizontal Scrollable on Mobile) */}
          {categories.length > 2 && (
            <div className="overflow-x-auto pb-2 scrollbar-none">
              <div className="flex gap-2 min-w-max">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all border
                      ${activeCategory === category
                        ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-md shadow-slate-100'
                        : 'bg-slate-50 text-slate-500 hover:text-slate-800 border-slate-200/60 hover:bg-slate-100'
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Product Cards Grid / Empty State */}
          {filteredProducts.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto bg-slate-50 border border-slate-150 rounded-2xl p-8 shadow-inner">
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-150 flex items-center justify-center text-slate-400 shadow-sm text-2xl">
                🍃
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-800 text-sm">Produk Tidak Ditemukan</h3>
                <p className="text-slate-500 text-xs font-medium leading-relaxed">
                  Maaf, tidak ada produk aktif yang cocok dengan pencarian atau filter kategori yang dipilih saat ini.
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => { setActiveCategory('Semua'); setSearchQuery(''); }}
                className="mt-2 px-5 py-2.5 bg-[var(--primary)] text-white text-xs font-extrabold rounded-xl transition-all shadow-md"
              >
                Reset Filter Katalog
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  isReadOnly={isReadOnly} 
                  primaryColor={theme.primaryColor}
                  hoverColor={theme.hoverColor}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 2. ENHANCEMENT #2: SOCIAL PROOF SECTION */}
      <section className="bg-slate-50 border-b border-slate-100 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {theme.stats.map((stat, idx) => (
              <div key={idx} className="bg-white border border-slate-100 p-6 rounded-2xl text-center space-y-1 shadow-sm hover:shadow-md transition-shadow">
                <span className="text-3xl lg:text-4xl font-black block" style={{ color: theme.primaryColor }}>
                  {stat.number}
                </span>
                <span className="text-xs font-extrabold text-slate-500 block uppercase tracking-wider">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. ENHANCEMENT #3: ABOUT THE BRAND (STORYTELLING SECTION) */}
      <section ref={aboutRef} className="bg-white border-b border-slate-100 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Story Left Description */}
          <div className="lg:col-span-7 space-y-6">
            <span className="text-[10px] text-[var(--primary)] font-black uppercase tracking-widest block">
              Tentang Kami
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {theme.aboutHeadline}
            </h2>
            <div className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium space-y-4">
              <p>{theme.aboutStory}</p>
              <blockquote 
                className="border-l-4 pl-4 font-bold text-slate-700 my-4"
                style={{ borderColor: theme.primaryColor }}
              >
                Misi Kami: {theme.aboutMission}
              </blockquote>
            </div>
          </div>

          {/* Story Right Image Placeholder */}
          <div className="lg:col-span-5 relative">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden border border-slate-100 shadow-2xl bg-slate-200">
              <img 
                src={theme.aboutImgPlaceholder} 
                alt="Tentang Toya Nusantara" 
                className="object-cover w-full h-full"
              />
            </div>
            {/* Soft backdrop accent shape */}
            <div 
              className="absolute -bottom-4 -right-4 w-24 h-24 rounded-3xl -z-10 opacity-30"
              style={{ backgroundColor: theme.primaryColor }}
            />
          </div>
        </div>
      </section>

      {/* 8. SECTION 8: CUSTOMER TESTIMONIALS */}
      <section className="bg-slate-50 border-b border-slate-100 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Komentar Pembeli</h2>
            <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-sm mx-auto">
              Bagaimana pengalaman praktisi bela diri Indonesia belanja alat latihan di {tenant.name}.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {theme.testimonials.map((testi, idx) => (
              <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow space-y-4">
                <div className="space-y-3">
                  {/* Rating Stars */}
                  <div className="flex gap-0.5 text-amber-400 text-sm">
                    {"★★★★★".split("").map((star, i) => (
                      <span key={i}>{star}</span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium italic">
                    "{testi.text}"
                  </p>
                </div>
                {/* User Info */}
                <div className="flex items-center gap-3 pt-3 border-t border-slate-50">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 shrink-0">
                    <img src={testi.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100'} alt={testi.name} className="object-cover w-full h-full" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[11px] font-black text-slate-800 leading-tight">{testi.name}</span>
                    <span className="text-[9px] text-slate-400 font-bold leading-none">{testi.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. SECTION 9: FAQ ACCORDION */}
      <section ref={faqRef} className="bg-white border-b border-slate-100 py-16 lg:py-20">
        <div className="max-w-3xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Tanya Jawab (FAQ)</h2>
            <p className="text-xs text-slate-400 font-medium">
              Informasi lengkap seputar pemesanan, kustomisasi ukuran, pengiriman, dan konfirmasi.
            </p>
          </div>

          <div className="space-y-4">
            {theme.faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div 
                  key={idx} 
                  className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left font-bold text-xs sm:text-sm text-slate-800 hover:bg-slate-50/50 transition-colors focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    <svg 
                      className={`w-4 h-4 text-slate-400 shrink-0 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor" 
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {isOpen && (
                    <div className="px-6 pb-5 text-xs text-slate-500 font-medium leading-relaxed bg-slate-50/20 border-t border-slate-50/50 pt-2 animate-fadeIn">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 10. SECTION 10: FINAL CTA */}
      <section className="relative overflow-hidden bg-slate-950 text-white py-16 lg:py-24 text-center">
        {/* Abstract glowing shapes */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[var(--primary)]/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-2xl mx-auto px-6 space-y-6 relative">
          <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Siap Melakukan Pemesanan?</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight"> Hubungi {tenant.name} Sekarang</h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-medium">
            Konsultasikan spesifikasi toya rotan latihan bela diri yang cocok dengan postur tubuh atau kebutuhan perguruan Anda secara langsung.
          </p>

          <div className="pt-4 flex justify-center">
            {mainWhatsappUrl && !isReadOnly ? (
              <a
                href={mainWhatsappUrl || undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm rounded-2xl flex items-center gap-2.5 transition-all shadow-lg shadow-emerald-950/20 hover:scale-[1.02]"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.588 2.025 14.11 1 11.48 1c-5.44 0-9.866 4.372-9.87 9.802 0 1.714.45 3.387 1.302 4.887L1.888 20.3l4.759-1.146z" />
                </svg>
                <span>Konsultasi Cepat via WhatsApp</span>
              </a>
            ) : (
              <button
                disabled
                className="px-8 py-4 bg-slate-900 border border-slate-800 text-slate-500 font-extrabold text-xs sm:text-sm rounded-2xl cursor-not-allowed select-none"
              >
                Offline
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-8 text-center text-[11px] text-slate-400">
        <div className="max-w-7xl mx-auto px-6 space-y-2">
          <p>&copy; {new Date().getFullYear()} {tenant.name}. Seluruh hak cipta dilindungi.</p>
          <p className="text-[9px] text-slate-350">
            Didukung oleh <a href="https://daganta.store" className="hover:underline text-[var(--primary)] font-bold">Daganta Storefront Platform</a>
          </p>
        </div>
      </footer>

      {/* 14. FLOATING WHATSAPP BUTTON (Conversion Trigger) */}
      {mainWhatsappUrl && !isReadOnly && (
        <a
          href={mainWhatsappUrl || undefined}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 w-14 h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-108 active:scale-95 transition-all z-40 group"
          title="Tanya WhatsApp"
        >
          <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.588 2.025 14.11 1 11.48 1c-5.44 0-9.866 4.372-9.87 9.802 0 1.714.45 3.387 1.302 4.887L1.888 20.3l4.759-1.146z" />
          </svg>
          {/* Hover dynamic label */}
          <span className="absolute right-16 bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider py-1.5 px-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Ada pertanyaan? Tanya Admin
          </span>
        </a>
      )}

      {/* 6. MOBILE COMMERCE CTA (Sticky Bottom Bar) */}
      {showMobileSticky && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 px-6 py-3 flex gap-3 z-40 animate-slideUp shadow-xl">
          <button
            onClick={() => scrollToSection(productsRef)}
            className="flex-1 py-3 bg-slate-100 text-slate-800 text-xs font-black rounded-xl border border-slate-200"
          >
            Lihat Produk
          </button>
          
          {mainWhatsappUrl && !isReadOnly ? (
            <a
              href={mainWhatsappUrl || undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl text-center flex items-center justify-center gap-1.5 shadow-md shadow-emerald-100"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.588 2.025 14.11 1 11.48 1c-5.44 0-9.866 4.372-9.87 9.802 0 1.714.45 3.387 1.302 4.887L1.888 20.3l4.759-1.146z" />
              </svg>
              <span>Hubungi WhatsApp</span>
            </a>
          ) : (
            <button
              disabled
              className="flex-1 py-3 bg-slate-200 text-slate-400 text-xs font-black rounded-xl cursor-not-allowed"
            >
              Offline
            </button>
          )}
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import {
  Store,
  Smartphone,
  MessageSquare,
  Users,
  TrendingUp,
  Layers,
  Settings,
  ShieldCheck,
  Check,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Menu,
  X,
  Briefcase,
  CreditCard,
  BarChart3,
  Clock,
  Sparkles,
  ShoppingBag,
  DollarSign,
  ArrowUpRight,
  HeartHandshake,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Database
} from 'lucide-react';

export default function MarketingHome() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const problemCards = [
    {
      icon: <DollarSign className="w-6 h-6 text-red-500" />,
      title: "Margin Makin Tertekan",
      text: "Biaya admin, promo wajib, dan perang harga di marketplace bisa membuat keuntungan bersih terasa makin tipis."
    },
    {
      icon: <Users className="w-6 h-6 text-orange-500" />,
      title: "Data Pelanggan Tidak Dimiliki",
      text: "Pelanggan membeli produk Anda, tetapi kontak, detail, dan riwayat belanja mereka tidak menjadi milik bisnis Anda."
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-amber-500" />,
      title: "Repeat Order Sulit Dibangun",
      text: "Tanpa database mandiri, pelanggan lama mudah sekali kembali ke marketplace dan beralih ke kompetitor."
    },
    {
      icon: <Settings className="w-6 h-6 text-rose-500" />,
      title: "Website Custom Terlalu Ribet",
      text: "Domain, hosting, instalasi server, desain, integrasi ongkir, dan pembayaran sering kali terlalu teknis untuk UMKM."
    }
  ];

  const features = [
    {
      icon: <ShoppingBag className="w-6 h-6 text-[#2563EB]" />,
      title: "Katalog Produk",
      text: "Tampilkan produk Anda secara profesional dengan foto berkualitas tinggi, harga, kategori, variasi, stok, serta berat produk."
    },
    {
      icon: <CheckCircle2 className="w-6 h-6 text-[#2563EB]" />,
      title: "Checkout Mudah",
      text: "Alur belanja teroptimasi yang memudahkan pembeli memilih produk dan mengisi data pengiriman dengan langkah yang ringkas."
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-[#2563EB]" />,
      title: "WhatsApp Follow-Up",
      text: "Hubungkan alur pesanan langsung dengan WhatsApp Anda untuk membangun kedekatan transaksi dan mempermudah negosiasi closing."
    },
    {
      icon: <Clock className="w-6 h-6 text-[#2563EB]" />,
      title: "Manajemen Pesanan",
      text: "Pantau status transaksi pelanggan mulai dari pesanan baru masuk, sedang diproses, telah dikirim, hingga selesai dalam satu dashboard."
    },
    {
      icon: <Database className="w-6 h-6 text-[#2563EB]" />,
      title: "Database Pelanggan",
      text: "Kumpulkan nama, nomor WhatsApp, alamat, dan riwayat pembelian pelanggan sebagai aset digital berharga milik bisnis Anda."
    },
    {
      icon: <CreditCard className="w-6 h-6 text-[#2563EB]" />,
      title: "Pembayaran",
      text: "Mulai dengan transfer bank manual yang praktis, dan dapat terus disesuaikan dengan kebutuhan pembayaran digital toko Anda."
    },
    {
      icon: <Layers className="w-6 h-6 text-[#2563EB]" />,
      title: "Ongkir & Pengiriman",
      text: "Siapkan estimasi biaya dan pilihan kurir ekspedisi pengiriman yang lebih rapi untuk memudahkan pelanggan bertransaksi."
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-[#2563EB]" />,
      title: "Laporan Penjualan",
      text: "Dapatkan metrik performa webstore Anda seperti total pesanan dan omzet secara berkala tanpa pusing kalkulasi manual."
    }
  ];

  const personas = [
    {
      tag: "UMKM Pemula",
      title: "Mulai Punya Toko Online Mandiri",
      text: "Langkah awal membangun brand profesional tanpa harus pusing memikirkan coding, hosting, atau setup server yang rumit."
    },
    {
      tag: "Seller Marketplace",
      title: "Bangun Saluran Penjualan Mandiri",
      text: "Pertahankan pelanggan setia Anda di wadah eksklusif milik Anda sendiri agar terhindar dari ketatnya perang harga kompetitor."
    },
    {
      tag: "Brand Lokal",
      title: "Tampil Lebih Profesional",
      text: "Sajikan identitas brand Anda dengan layout yang rapi, bersih, tepercaya, serta teroptimasi sempurna untuk perangkat mobile."
    },
    {
      tag: "Komunitas & Koperasi",
      title: "Digitalisasi Anggota Bersama",
      text: "Kelola banyak katalog produk anggota secara terorganisasi di bawah sistem pengelolaan webstore terpadu."
    }
  ];

  const faqs = [
    {
      q: "Apakah saya memerlukan keahlian coding untuk menggunakan Daganta?",
      a: "Sama sekali tidak. Daganta dirancang dengan antarmuka yang sangat mudah dipahami. Siapa saja dapat meluncurkan webstore dalam hitungan menit hanya dengan mengisi formulir sederhana, mengunggah foto produk, dan memasukkan nomor WhatsApp."
    },
    {
      q: "Bagaimana cara kerja pesanan yang masuk ke WhatsApp?",
      a: "Setelah pembeli memilih produk dan mengisi alamat pengiriman di webstore Anda, sistem akan membuat ringkasan belanja otomatis. Begitu tombol checkout ditekan, pembeli akan diarahkan langsung untuk mengirim pesan ringkasan tersebut ke WhatsApp Anda. Anda pun bisa langsung melakukan closing transaksi."
    },
    {
      q: "Apakah Daganta hadir sebagai pengganti toko saya di marketplace?",
      a: "Tidak harus. Daganta berfungsi sebagai saluran penjualan mandiri yang komplementer (saling melengkapi). Anda bisa tetap menggunakan marketplace untuk mendatangkan pelanggan baru, lalu mengarahkan pembeli setia ke webstore Daganta Anda agar keuntungan Anda tidak terpotong biaya admin yang tinggi."
    },
    {
      q: "Apakah data kontak pelanggan benar-benar menjadi milik toko saya?",
      a: "Ya, 100%. Setiap transaksi di webstore Anda akan otomatis tersimpan dalam dashboard berupa daftar pelanggan. Data nama, nomor kontak WhatsApp, dan riwayat pesanan sepenuhnya milik Anda dan tidak dibagikan dengan toko lain."
    },
    {
      q: "Saya seorang Digital Agent. Bagaimana Daganta bisa membantu saya?",
      a: "Daganta memiliki fitur khusus Agen yang memungkinkan Anda membuat, memperpanjang, dan mengelola puluhan hingga ratusan webstore klien UMKM dalam satu dashboard terpadu. Anda dapat membeli saldo kredit agen untuk mengaktifkan masa aktif toko klien dengan harga khusus, lalu mengenakan tarif jasa langganan berulang ke klien Anda."
    },
    {
      q: "Apakah webstore Daganta bisa menggunakan domain sendiri?",
      a: "Bisa. Secara default pada paket awal, toko online Anda akan mendapatkan subdomain gratis seperti namatoko.daganta.store. Bagi Anda yang membutuhkan branding eksklusif, opsi kustomisasi domain pribadi (.com, .id, dll.) dapat diaktifkan pada paket tingkat lanjut."
    },
    {
      q: "Bagaimana dengan sistem pembayaran di dalam webstore?",
      a: "Untuk mendukung kemudahan UMKM, sistem kami mendukung metode transfer bank manual (pembayaran langsung ke rekening pribadi Anda) serta konfirmasi melalui WhatsApp. Integrasi sistem pembayaran otomatis terus dikembangkan secara bertahap agar transaksi dapat berjalan semakin lancar."
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans select-none antialiased">
      
      {/* NAVBAR */}
      <header className="border-b border-[#E2E8F0] bg-white/90 backdrop-blur-md sticky top-0 z-50 transition-all duration-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          {/* Logo & Brand */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0B1F33] to-[#2563EB] flex items-center justify-center shadow-md shadow-[#2563EB]/25 transform group-hover:scale-105 transition-all">
              <span className="font-extrabold text-xl text-white">D</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-[#0B1F33]">Daganta</span>
              <span className="text-[10px] font-semibold text-[#14B8A6] tracking-wider -mt-1 uppercase">Webstore OS</span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#64748B]">
            <a href="#fitur" className="hover:text-[#2563EB] transition-colors">Fitur</a>
            <a href="#cara-kerja" className="hover:text-[#2563EB] transition-colors">Cara Kerja</a>
            <a href="#umkm" className="hover:text-[#2563EB] transition-colors">Untuk UMKM</a>
            <a href="#agen" className="hover:text-[#2563EB] transition-colors">Untuk Agen</a>
            <a href="#harga" className="hover:text-[#2563EB] transition-colors">Harga</a>
            <a href="#faq" className="hover:text-[#2563EB] transition-colors">FAQ</a>
          </nav>

          {/* Nav CTAs */}
          <div className="hidden md:flex items-center gap-4">
            <a 
              href="/login" 
              className="text-sm font-semibold text-[#0B1F33] hover:text-[#2563EB] transition-colors px-4 py-2"
            >
              Masuk
            </a>
            <a 
              href="/login?register=true" 
              className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1d4ed8] active:bg-[#1e40af] text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-[#2563EB]/15 hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Coba Gratis 14 Hari
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#64748B] hover:text-[#0B1F33] focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E2E8F0] bg-white px-4 py-6 space-y-4 shadow-inner animate-fadeIn">
            <nav className="flex flex-col gap-4 text-base font-semibold text-[#64748B]">
              <a 
                href="#fitur" 
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#2563EB] py-1 border-b border-slate-100"
              >
                Fitur
              </a>
              <a 
                href="#cara-kerja" 
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#2563EB] py-1 border-b border-slate-100"
              >
                Cara Kerja
              </a>
              <a 
                href="#umkm" 
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#2563EB] py-1 border-b border-slate-100"
              >
                Untuk UMKM
              </a>
              <a 
                href="#agen" 
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#2563EB] py-1 border-b border-slate-100"
              >
                Untuk Agen
              </a>
              <a 
                href="#harga" 
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#2563EB] py-1 border-b border-slate-100"
              >
                Harga
              </a>
              <a 
                href="#faq" 
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#2563EB] py-1 border-b border-slate-100"
              >
                FAQ
              </a>
            </nav>
            <div className="pt-4 flex flex-col gap-3">
              <a 
                href="/login" 
                className="w-full text-center py-3 text-sm font-semibold text-[#0B1F33] bg-slate-100 rounded-xl hover:bg-slate-200 transition-all"
              >
                Masuk
              </a>
              <a 
                href="/login?register=true" 
                className="w-full text-center py-3 bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-sm font-bold rounded-xl transition-all shadow-md"
              >
                Coba Gratis 14 Hari
              </a>
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#F8FAFC] to-[#F1F5F9] pt-16 pb-24 md:py-32">
        {/* Soft decorative background circles */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-[#2563EB]/5 to-[#14B8A6]/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-[#38BDF8]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Text Box */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#E2E8F0] shadow-sm text-sm font-semibold text-[#2563EB]">
              <Sparkles className="w-4 h-4 text-[#14B8A6]" />
              <span>Webstore Instan untuk UMKM Naik Kelas</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0B1F33] leading-[1.15]">
              Punya Webstore Sendiri, <br className="hidden sm:inline" />
              Terima Order Langsung <br className="hidden sm:inline" />
              ke WhatsApp. <br />
              <span className="relative inline-block mt-2">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#14B8A6]">
                  Tanpa Ribet Teknis.
                </span>
                <span className="absolute bottom-1.5 left-0 w-full h-3 bg-[#38BDF8]/20 rounded-md -z-10" />
              </span>
            </h1>

            <p className="max-w-2xl mx-auto lg:mx-0 text-[#64748B] text-base sm:text-lg lg:text-xl leading-relaxed">
              Daganta membantu UMKM membuat toko online profesional, mengelola katalog produk, menerima pesanan, dan membangun database pelanggan sendiri dalam satu dashboard yang mudah digunakan.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <a 
                href="/login?register=true"
                className="w-full sm:w-auto px-8 py-4 bg-[#2563EB] hover:bg-[#1d4ed8] active:bg-[#1e40af] text-white font-bold rounded-2xl transition-all shadow-xl shadow-[#2563EB]/20 hover:shadow-2xl transform hover:-translate-y-0.5 text-center text-base"
              >
                Coba Gratis 14 Hari
              </a>
              <a 
                href="#demo"
                className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 active:bg-slate-100 text-[#0B1F33] font-semibold rounded-2xl border border-[#E2E8F0] transition-all shadow-sm text-center text-base"
              >
                Lihat Demo Toko
              </a>
            </div>

            <p className="text-xs font-semibold tracking-wide text-[#64748B] flex flex-wrap items-center justify-center lg:justify-start gap-x-3 gap-y-1.5">
              <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-[#14B8A6]" /> Tanpa coding</span>
              <span className="hidden sm:inline text-slate-300">•</span>
              <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-[#14B8A6]" /> Siap jualan cepat</span>
              <span className="hidden sm:inline text-slate-300">•</span>
              <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-[#14B8A6]" /> WhatsApp-first</span>
              <span className="hidden sm:inline text-slate-300">•</span>
              <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-[#14B8A6]" /> Cocok untuk UMKM & Agen Digital</span>
            </p>
          </div>

          {/* Right Visual Box (Dashboard Mockup) */}
          <div className="lg:col-span-5 relative mt-6 lg:mt-0 flex justify-center">
            <div className="relative w-full max-w-[460px] aspect-[9/10] bg-white rounded-[24px] border border-[#E2E8F0] shadow-2xl p-4 overflow-hidden flex flex-col">
              
              {/* Browser bar */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] mb-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-mono text-slate-500 max-w-[200px] truncate">
                  toyanusantara.daganta.store
                </div>
                <div className="w-4" />
              </div>

              {/* Storefront Mockup Header */}
              <div className="flex items-center justify-between mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-[#0B1F33] flex items-center justify-center text-white text-[10px] font-bold">
                    T
                  </div>
                  <span className="text-xs font-bold text-[#0B1F33]">Toya Nusantara</span>
                </div>
                <span className="text-[9px] px-2 py-0.5 bg-green-100 text-green-700 font-bold rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Toko Online Aktif
                </span>
              </div>

              {/* Product Card Visual */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-3 shadow-sm mb-4 space-y-2">
                <div className="w-full h-24 bg-gradient-to-r from-slate-100 to-slate-200 rounded-lg overflow-hidden flex items-center justify-center text-slate-400 relative">
                  <Store className="w-10 h-10 opacity-30" />
                  <span className="absolute bottom-2 right-2 text-[9px] font-bold bg-[#14B8A6] text-white px-2 py-0.5 rounded">
                    Minyak Atsiri Premium
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-[#0B1F33]">Minyak Lavender Premium 10ml</h4>
                    <p className="text-[10px] text-[#64748B]">Kategori: Essential Oil</p>
                  </div>
                  <span className="text-xs font-extrabold text-[#2563EB]">Rp 150.000</span>
                </div>
              </div>

              {/* WhatsApp Checkout Mockup */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-2 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 fill-emerald-600 stroke-none" />
                    Format Pesan WhatsApp
                  </span>
                  <span className="text-[9px] text-emerald-600 font-bold">Auto-Checkout</span>
                </div>
                <div className="bg-white p-2 rounded border border-emerald-100 font-mono text-[9px] text-slate-600 leading-tight space-y-0.5">
                  <p>Halo Toya Nusantara, saya ingin memesan:</p>
                  <p>• Minyak Lavender 10ml (1 unit)</p>
                  <p>Total: Rp 150.000</p>
                  <p>Nama: Budi Santoso</p>
                  <p>Alamat: Jl. Sudirman No.12, Jakarta</p>
                </div>
              </div>

              {/* Customer Database preview */}
              <div className="mt-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex-1 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-[#0B1F33] mb-2 block">Daftar Pelanggan Mandiri</span>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center bg-white p-1.5 rounded border border-slate-100 text-[9px]">
                    <span className="font-bold text-[#0B1F33]">Budi Santoso</span>
                    <span className="text-slate-500">+62812-3456-xxxx</span>
                    <span className="bg-slate-100 text-[#0B1F33] px-1.5 py-0.2 rounded font-semibold">3 Order</span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-1.5 rounded border border-slate-100 text-[9px]">
                    <span className="font-bold text-[#0B1F33]">Siti Rahma</span>
                    <span className="text-slate-500">+62813-9876-xxxx</span>
                    <span className="bg-slate-100 text-[#0B1F33] px-1.5 py-0.2 rounded font-semibold">1 Order</span>
                  </div>
                </div>
              </div>

              {/* Floating Card 1: Pesanan Masuk */}
              <div className="absolute top-24 -left-6 bg-white p-3 rounded-xl border border-[#E2E8F0] shadow-lg flex items-center gap-3 transform -rotate-2 hover:rotate-0 transition-transform animate-bounce-slow max-w-[190px]">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                  <MessageSquare className="w-4 h-4 fill-green-600 stroke-none" />
                </div>
                <div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Pesanan Masuk</p>
                  <p className="text-[10px] font-bold text-[#0B1F33]">Minyak Atsiri (Rp 150k)</p>
                  <p className="text-[8px] text-green-600 font-bold">Terhubung ke WA</p>
                </div>
              </div>

              {/* Floating Card 2: Pelanggan Baru */}
              <div className="absolute top-1/2 -right-8 bg-white p-3 rounded-xl border border-[#E2E8F0] shadow-lg flex items-center gap-3 transform rotate-3 hover:rotate-0 transition-transform max-w-[160px]">
                <div className="w-8 h-8 rounded-lg bg-[#14B8A6]/10 flex items-center justify-center text-[#14B8A6]">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[8px] font-bold text-[#64748B] uppercase tracking-wider">Aset Digital</p>
                  <p className="text-[10px] font-extrabold text-[#0B1F33]">+8 Pelanggan</p>
                  <p className="text-[8px] text-[#64748B]">Terdaftar Hari Ini</p>
                </div>
              </div>

              {/* Floating Card 3: Status Toko */}
              <div className="absolute bottom-20 -left-8 bg-white p-3 rounded-xl border border-[#E2E8F0] shadow-lg flex items-center gap-3 transform rotate-6 hover:rotate-0 transition-transform max-w-[170px]">
                <div className="w-8 h-8 rounded-lg bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB]">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[8px] font-bold text-[#64748B] uppercase tracking-wider">Katalog Mandiri</p>
                  <p className="text-[10px] font-extrabold text-[#0B1F33]">24 Produk Aktif</p>
                  <p className="text-[8px] text-[#14B8A6] font-semibold">Toko Online Mandiri</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SOCIAL PROOF / TRUST BAR */}
      <section className="bg-white py-12 border-y border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-[#64748B] mb-8">
            Kenapa Ratusan Bisnis Mulai Memilih Daganta
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-extrabold text-[#0B1F33]">Lokal & Mudah</p>
              <p className="text-xs font-semibold text-[#64748B]">Dibangun untuk UMKM Indonesia</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-extrabold text-[#2563EB]">WhatsApp-First</p>
              <p className="text-xs font-semibold text-[#64748B]">Closing lebih cepat & ramah pembeli</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-extrabold text-[#14B8A6]">Multi-Toko</p>
              <p className="text-xs font-semibold text-[#64748B]">Sistem kelola terpadu untuk agen</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-extrabold text-[#38BDF8]">100% Milik Anda</p>
              <p className="text-xs font-semibold text-[#64748B]">Kontak & database pembeli aman</p>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B1F33] tracking-tight">
            Marketplace Ramai, Tapi Brand Anda Belum Tentu Bertumbuh.
          </h2>
          <p className="max-w-2xl mx-auto text-[#64748B] text-base sm:text-lg">
            Banyak UMKM sudah jualan online dengan giat, tetapi masih belum memiliki aset digital mandiri yang menopang pertumbuhan jangka panjang.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {problemCards.map((card, i) => (
            <div 
              key={i} 
              className="bg-white border border-[#E2E8F0] rounded-[22px] p-6 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:border-[#2563EB]/25"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center group-hover:scale-105 transition-transform">
                  {card.icon}
                </div>
                <h3 className="text-lg font-bold text-[#0B1F33]">{card.title}</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">{card.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SOLUTION SECTION */}
      <section className="py-20 bg-white border-t border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B1F33] tracking-tight">
              Daganta Bukan Sekadar Website. <br />Ini Sistem Jualan Mandiri Untuk UMKM.
            </h2>
            <p className="text-[#64748B] text-base sm:text-lg">
              Semua hal dasar yang Anda butuhkan untuk membangun channel penjualan sendiri, merapikan operasional, dan mengurangi ketergantungan.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center max-w-5xl mx-auto">
            
            {/* Before Box */}
            <div className="bg-[#FFF8F8] border border-red-100 rounded-[24px] p-8 space-y-6">
              <div className="flex items-center gap-2">
                <XCircle className="w-6 h-6 text-red-500" />
                <h3 className="text-xl font-bold text-[#0B1F33]">Kondisi Tercecer (Tanpa Daganta)</h3>
              </div>
              <ul className="space-y-4 text-sm font-medium text-[#64748B]">
                <li className="flex items-start gap-3">
                  <span className="text-red-500 font-bold mt-0.5">✗</span>
                  <span>Detail pesanan tersebar di berbagai obrolan chat WhatsApp yang tidak beraturan.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 font-bold mt-0.5">✗</span>
                  <span>Katalog produk tidak rapi, pembeli harus menanyakan foto dan harga berulang kali.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 font-bold mt-0.5">✗</span>
                  <span>Pencatatan order ditulis manual di kertas atau Excel, rawan selip dan salah kirim.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 font-bold mt-0.5">✗</span>
                  <span>Riwayat dan data kontak pembeli hilang setelah pesanan selesai dikirim.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 font-bold mt-0.5">✗</span>
                  <span>Merek bisnis sulit dikenal karena tidak mempunyai alamat tautan web toko online yang rapi.</span>
                </li>
              </ul>
            </div>

            {/* After Box */}
            <div className="bg-[#F0FDF4] border border-green-100 rounded-[24px] p-8 space-y-6 shadow-lg shadow-green-100/30">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-[#14B8A6]" />
                <h3 className="text-xl font-bold text-[#0B1F33]">Bersama Daganta (Rapi & Mandiri)</h3>
              </div>
              <ul className="space-y-4 text-sm font-semibold text-[#0B1F33]">
                <li className="flex items-start gap-3">
                  <span className="text-[#14B8A6] font-bold mt-0.5">✓</span>
                  <span>Webstore profesional yang siap diakses pembeli selama 24 jam penuh.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#14B8A6] font-bold mt-0.5">✓</span>
                  <span>Katalog produk rapi dengan foto, detail harga, kategori, serta stok yang transparan.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#14B8A6] font-bold mt-0.5">✓</span>
                  <span>Seluruh pesanan otomatis tercatat rapi di dalam dashboard kelola toko Anda.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#14B8A6] font-bold mt-0.5">✓</span>
                  <span>Database kontak pembeli tersimpan rapi untuk memudahkan promosi berulang.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#14B8A6] font-bold mt-0.5">✓</span>
                  <span>Membangun kredibilitas toko online berkat alur belanja mandiri dan teratur.</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="cara-kerja" className="py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B1F33] tracking-tight">
              Mulai Jualan Dengan Webstore Sendiri Dalam 3 Langkah.
            </h2>
            <p className="text-[#64748B] text-base">
              Hanya butuh waktu beberapa menit untuk mengaktifkan toko online mandiri Anda.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-8 border border-[#E2E8F0] shadow-sm relative space-y-4">
              <div className="absolute -top-5 left-8 w-10 h-10 rounded-full bg-[#0B1F33] text-white flex items-center justify-center font-extrabold text-sm shadow-md">
                1
              </div>
              <h3 className="text-lg font-bold text-[#0B1F33] pt-2">Buat Toko</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Masukkan informasi identitas toko Anda seperti nama toko, logo, warna brand, dan tautkan ke nomor WhatsApp bisnis Anda.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-8 border border-[#E2E8F0] shadow-sm relative space-y-4">
              <div className="absolute -top-5 left-8 w-10 h-10 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-extrabold text-sm shadow-md">
                2
              </div>
              <h3 className="text-lg font-bold text-[#0B1F33] pt-2">Upload Produk</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Tambahkan koleksi dagangan Anda dengan melampirkan foto produk, harga, deskripsi, persediaan stok, serta berat barang.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-8 border border-[#E2E8F0] shadow-sm relative space-y-4">
              <div className="absolute -top-5 left-8 w-10 h-10 rounded-full bg-[#14B8A6] text-white flex items-center justify-center font-extrabold text-sm shadow-md">
                3
              </div>
              <h3 className="text-lg font-bold text-[#0B1F33] pt-2">Terima Order</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Pembeli melakukan pemesanan di webstore Anda, rincian pesanan tercatat, dan proses negosiasi berlanjut langsung ke WhatsApp Anda.
              </p>
            </div>
          </div>

          <div className="text-center pt-12">
            <a 
              href="/login?register=true" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-bold rounded-2xl transition-all shadow-lg shadow-[#2563EB]/15 transform hover:-translate-y-0.5"
            >
              <span>Mulai Buat Webstore</span>
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>

        </div>
      </section>

      {/* FEATURE SECTION */}
      <section id="fitur" className="py-20 bg-white border-t border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B1F33] tracking-tight">
              Fitur Yang Benar-Benar Dibutuhkan Untuk Jualan Online.
            </h2>
            <p className="text-[#64748B] text-base">
              Seluruh perkakas dirancang praktis agar Anda bisa fokus melayani pembeli dan mengembangkan omzet bisnis.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, idx) => (
              <div 
                key={idx} 
                className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[22px] p-6 hover:bg-white hover:shadow-xl transition-all duration-300 space-y-4"
              >
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                  {feature.icon}
                </div>
                <h3 className="text-base font-bold text-[#0B1F33]">{feature.title}</h3>
                <p className="text-xs text-[#64748B] leading-relaxed">{feature.text}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* UMKM PERSONA SECTION */}
      <section id="umkm" className="py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-bold text-[#2563EB] tracking-widest uppercase block">Segmentasi Pengguna</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B1F33] tracking-tight">
              Cocok Untuk Berbagai Jenis Pelaku Usaha.
            </h2>
            <p className="text-[#64748B] text-base">
              Bagaimanapun bentuk bisnis Anda, Daganta hadir untuk merapikan alur penjualan online Anda.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {personas.map((persona, idx) => (
              <div key={idx} className="bg-white rounded-[24px] border border-[#E2E8F0] p-6 space-y-4 flex flex-col justify-between shadow-sm">
                <div className="space-y-3">
                  <span className="inline-block px-3 py-1 bg-[#14B8A6]/10 text-[#14B8A6] font-bold text-[10px] rounded-full uppercase tracking-wider">
                    {persona.tag}
                  </span>
                  <h3 className="text-base font-bold text-[#0B1F33]">{persona.title}</h3>
                  <p className="text-xs text-[#64748B] leading-relaxed">{persona.text}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* AGENT OPPORTUNITY SECTION */}
      <section id="agen" className="py-20 bg-white border-t border-[#E2E8F0] relative overflow-hidden">
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[#2563EB]/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text */}
          <div className="lg:col-span-6 space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0B1F33]/5 text-sm font-bold text-[#0B1F33]">
              <Briefcase className="w-4 h-4 text-[#14B8A6]" />
              <span>Peluang Kerja Sama Digital Agency</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B1F33] tracking-tight leading-tight">
              Punya Skill Digital? <br />
              Bangun Bisnis Webstore Agency <br />
              Dengan Daganta.
            </h2>

            <p className="text-[#64748B] text-base sm:text-lg leading-relaxed">
              Bantu UMKM sekitar Anda memiliki webstore profesional, kelola seluruh klien secara sentral, dan bangun penghasilan berulang yang stabil dari jasa layanan digital yang Anda kelola sendiri.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#14B8A6] mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-[#0B1F33]">Buatkan Webstore Klien</h4>
                  <p className="text-xs text-[#64748B] mt-0.5">Rilis toko online instan untuk puluhan UMKM dalam sekejap.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#14B8A6] mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-[#0B1F33]">Kelola Banyak Toko</h4>
                  <p className="text-xs text-[#64748B] mt-0.5">Kontrol katalog, detail kontak, dan performa dari satu dashboard agen.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#14B8A6] mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-[#0B1F33]">Pantau Masa Aktif</h4>
                  <p className="text-xs text-[#64748B] mt-0.5">Dapatkan notifikasi dan detail sisa durasi sewa toko klien Anda.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#14B8A6] mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-[#0B1F33]">Sistem Kredit Agen</h4>
                  <p className="text-xs text-[#64748B] mt-0.5">Gunakan saldo khusus agen untuk memperpanjang toko klien secara hemat.</p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
              <a 
                href="/login?register=true" 
                className="w-full sm:w-auto px-8 py-4 bg-[#0B1F33] hover:bg-[#153454] text-white font-bold rounded-2xl text-center shadow-lg transition-all transform hover:-translate-y-0.5 text-base"
              >
                Gabung Sebagai Agen Daganta
              </a>
              <span className="text-xs text-[#64748B] font-semibold text-center sm:text-left">
                Mendukung kemudahan kolaborasi digital terpercaya
              </span>
            </div>
          </div>

          {/* Right Visual (Agent Dashboard Mockup) */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-[480px] bg-slate-900 rounded-[28px] border border-slate-800 shadow-2xl p-5 text-slate-200 font-sans relative overflow-hidden">
              
              {/* Decorative top lighting */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2563EB] via-[#14B8A6] to-[#38BDF8]" />

              {/* Agent Panel Header */}
              <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-5">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#14B8A6]" />
                    Dashboard Agen Daganta
                  </h3>
                  <p className="text-[10px] text-slate-400">Kelola Akun Mitra Digital Agency</p>
                </div>
                <span className="text-[9px] px-2 py-0.5 bg-[#2563EB]/20 text-[#38BDF8] border border-[#2563EB]/40 font-bold rounded">
                  Status: Agen Premium
                </span>
              </div>

              {/* Agent Metrics Bar */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-800/80 text-center">
                  <span className="text-[9px] text-slate-400 block font-semibold uppercase">Klien Saya</span>
                  <span className="text-base font-extrabold text-white">12 Toko</span>
                </div>
                <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-800/80 text-center">
                  <span className="text-[9px] text-slate-400 block font-semibold uppercase">Saldo Kredit</span>
                  <span className="text-xs font-extrabold text-[#14B8A6]">Rp 1,450k</span>
                </div>
                <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-800/80 text-center">
                  <span className="text-[9px] text-slate-400 block font-semibold uppercase">Komisi</span>
                  <span className="text-xs font-extrabold text-[#38BDF8]">Rp 750k/Bln</span>
                </div>
              </div>

              {/* Client Store List Mockup */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider px-1">
                  <span>Daftar Toko Klien</span>
                  <span>Masa Aktif</span>
                </div>

                {/* Client 1 */}
                <div className="bg-slate-850 p-3 rounded-xl border border-slate-800 flex justify-between items-center hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#2563EB]/10 border border-[#2563EB]/25 flex items-center justify-center text-[#2563EB] font-bold text-xs">
                      TN
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Toya Nusantara</h4>
                      <p className="text-[9px] text-slate-400">toyanusantara.daganta.store</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-emerald-400 block">180 Hari Tersisa</span>
                    <span className="text-[8px] bg-emerald-950 text-emerald-400 border border-emerald-900 px-1.5 py-0.2 rounded uppercase font-semibold">
                      Aktif
                    </span>
                  </div>
                </div>

                {/* Client 2 */}
                <div className="bg-slate-850 p-3 rounded-xl border border-slate-800 flex justify-between items-center hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#14B8A6]/10 border border-[#14B8A6]/25 flex items-center justify-center text-[#14B8A6] font-bold text-xs">
                      WJ
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Warung Makan Bu Joko</h4>
                      <p className="text-[9px] text-slate-400">bujoko.daganta.store</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-emerald-400 block">320 Hari Tersisa</span>
                    <span className="text-[8px] bg-emerald-950 text-emerald-400 border border-emerald-900 px-1.5 py-0.2 rounded uppercase font-semibold">
                      Aktif
                    </span>
                  </div>
                </div>

                {/* Client 3 */}
                <div className="bg-slate-850 p-3 rounded-xl border border-slate-800 flex justify-between items-center hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-400 font-bold text-xs">
                      HC
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Hijab Cantik Syari</h4>
                      <p className="text-[9px] text-slate-400">hijabcantik.daganta.store</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-rose-400 block">4 Hari Lagi</span>
                    <button className="text-[8px] bg-rose-950 text-rose-300 border border-rose-900 px-2 py-0.5 rounded uppercase font-bold hover:bg-rose-900 transition-colors">
                      Perpanjang
                    </button>
                  </div>
                </div>
              </div>

              {/* Floating Alert inside Mockup */}
              <div className="mt-4 p-2 bg-[#2563EB]/15 border border-[#2563EB]/35 rounded-xl flex items-center gap-2.5 text-[10px]">
                <Sparkles className="w-4 h-4 text-[#38BDF8] flex-shrink-0" />
                <span className="text-slate-300 font-medium">Hemat hingga 30% menggunakan kredit agen Daganta untuk mengaktifkan webstore klien.</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* METRICS / PRODUCT PROMISE SECTION */}
      <section className="py-20 bg-[#F8FAFC] border-t border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B1F33] tracking-tight">
              Dibangun Untuk Cepat Dipakai, Bukan Untuk Membuat Anda Pusing.
            </h2>
            <p className="text-[#64748B] text-base">
              Daganta menghilangkan semua friksi teknis sehingga operasional digital berjalan instan.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto text-center">
            
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 space-y-2 shadow-sm">
              <p className="text-4xl font-extrabold text-[#2563EB]">&lt; 5 Menit</p>
              <h4 className="text-sm font-bold text-[#0B1F33]">Pembuatan Toko Baru</h4>
              <p className="text-xs text-[#64748B]">Hanya dengan melengkapi identitas dasar bisnis Anda langsung meluncur.</p>
            </div>

            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 space-y-2 shadow-sm">
              <p className="text-4xl font-extrabold text-[#14B8A6]">&lt; 2 Menit</p>
              <h4 className="text-sm font-bold text-[#0B1F33]">Unggah Produk Pertama</h4>
              <p className="text-xs text-[#64748B]">Unggah foto, tentukan harga, stok, dan kategori produk secara instan.</p>
            </div>

            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 space-y-2 shadow-sm">
              <p className="text-4xl font-extrabold text-[#0B1F33]">&lt; 1 Menit</p>
              <h4 className="text-sm font-bold text-[#0B1F33]">Checkout Pembeli</h4>
              <p className="text-xs text-[#64748B]">Sederhana tanpa hambatan untuk menjaga agar konversi pesanan tetap tinggi.</p>
            </div>

            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 space-y-2 shadow-sm">
              <p className="text-4xl font-extrabold text-[#38BDF8]">100%</p>
              <h4 className="text-sm font-bold text-[#0B1F33]">Berbahasa UMKM</h4>
              <p className="text-xs text-[#64748B]">Dashboard bebas dari istilah teknis rumit yang menyulitkan.</p>
            </div>

          </div>

          <p className="text-center text-[10px] font-semibold text-[#64748B] mt-8">
            * Hasil dapat bervariasi sesuai dengan kesiapan data deskripsi toko dan kelengkapan katalog produk Anda.
          </p>

        </div>
      </section>

      {/* DEMO TENANT SECTION */}
      <section id="demo" className="py-20 bg-white border-t border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-[#0B1F33] text-white rounded-[32px] p-8 sm:p-12 lg:p-16 grid lg:grid-cols-12 gap-8 items-center relative overflow-hidden shadow-2xl">
            {/* Background glowing sphere */}
            <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] bg-[#2563EB]/25 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-block px-3 py-1 bg-white/10 text-[#38BDF8] border border-white/20 font-bold text-xs rounded-full uppercase tracking-wider">
                Studi Kasus Pilot Tenant
              </span>
              
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                Lihat Contoh Webstore Daganta: Toya Nusantara
              </h2>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Toya Nusantara merupakan contoh tenant uji coba terintegrasi yang kami gunakan untuk membuktikan efektivitas katalog produk, kustomisasi pesanan, serta kemudahan pengalaman berbelanja langsung dari webstore mandiri.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row gap-4">
                <a 
                  href="http://toyanusantara.daganta.store" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="px-8 py-3.5 bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-sm font-bold rounded-xl text-center shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <span>Kunjungi Demo Webstore</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
                <span className="text-xs text-slate-400 flex items-center justify-center sm:justify-start font-semibold">
                  (subdomain: toyanusantara.daganta.store)
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-[320px] aspect-[4/3] bg-white/5 rounded-2xl border border-white/10 p-6 flex flex-col justify-between shadow-inner">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white text-lg font-bold">
                    T
                  </div>
                  <h4 className="text-sm font-bold">Toya Nusantara</h4>
                  <p className="text-xs text-slate-400">Menyediakan produk minyak atsiri alami premium asli nusantara.</p>
                </div>
                <div className="pt-4 border-t border-white/10 flex justify-between text-xs text-slate-400 font-semibold">
                  <span>Katalog: 8 Varian</span>
                  <span>WhatsApp Closing: Aktif</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* PRICING PREVIEW SECTION */}
      <section id="harga" className="py-20 bg-[#F8FAFC] border-t border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-bold text-[#2563EB] tracking-widest uppercase block">Paket Berlangganan</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B1F33] tracking-tight">
              Pilih Paket Sesuai Tahap Pertumbuhan Bisnis Anda.
            </h2>
            <p className="text-[#64748B] text-base">
              Mulai secara gratis dan kembangkan sesuai tingkat kebutuhan operasional toko Anda.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            {/* Starter Card */}
            <div className="bg-white rounded-[28px] border border-[#E2E8F0] p-8 flex flex-col justify-between hover:shadow-xl transition-all duration-300">
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-bold bg-slate-100 text-[#0B1F33] px-3 py-1 rounded-full uppercase tracking-wider">
                    Starter
                  </span>
                  <h3 className="text-xl font-bold text-[#0B1F33] mt-3">Untuk UMKM Pemula</h3>
                  <p className="text-xs text-[#64748B] mt-1">Luncurkan katalog online instan perdana Anda secara mandiri.</p>
                </div>

                <div className="border-t border-[#E2E8F0] pt-6 space-y-4">
                  <p className="text-xs font-bold text-[#0B1F33] uppercase tracking-wider">Fitur Utama:</p>
                  <ul className="space-y-3 text-xs text-slate-600 font-semibold">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#14B8A6]" />
                      <span>Webstore Subdomain Daganta</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#14B8A6]" />
                      <span>Katalog Produk Dasar (Hingga 20 Produk)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#14B8A6]" />
                      <span>Alur Belanja Checkout Standard</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#14B8A6]" />
                      <span>WhatsApp Follow-Up & Negosiasi</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#14B8A6]" />
                      <span>Template Tampilan Standar</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-8">
                <a 
                  href="/login?register=true" 
                  className="block w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-[#0B1F33] text-xs font-extrabold rounded-xl text-center transition-colors"
                >
                  Mulai Sekarang
                </a>
              </div>
            </div>

            {/* Growth Card */}
            <div className="bg-white rounded-[28px] border-2 border-[#2563EB] p-8 flex flex-col justify-between shadow-xl relative hover:shadow-2xl transition-all duration-300">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#2563EB] text-white text-[10px] font-extrabold px-4 py-1 rounded-full uppercase tracking-wider">
                Paling Banyak Dipilih
              </div>
              
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-bold bg-[#2563EB]/10 text-[#2563EB] px-3 py-1 rounded-full uppercase tracking-wider">
                    Growth
                  </span>
                  <h3 className="text-xl font-bold text-[#0B1F33] mt-3">Untuk UMKM Bertumbuh</h3>
                  <p className="text-xs text-[#64748B] mt-1">Lengkapi branding mandiri secara profesional dan ekspansif.</p>
                </div>

                <div className="border-t border-[#E2E8F0] pt-6 space-y-4">
                  <p className="text-xs font-bold text-[#0B1F33] uppercase tracking-wider">Seluruh Fitur Starter, Ditambah:</p>
                  <ul className="space-y-3 text-xs text-slate-600 font-semibold">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#14B8A6]" />
                      <span className="text-[#0B1F33]">Mendukung Kustom Domain Pribadi</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#14B8A6]" />
                      <span>Kode Promo & Kupon Potongan Harga</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#14B8A6]" />
                      <span>Laporan Performa & Statistik Penjualan</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#14B8A6]" />
                      <span>Katalog Produk Lebih Banyak (Hingga 100)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#14B8A6]" />
                      <span>Pengaturan Profil Toko Lebih Lengkap</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-8">
                <a 
                  href="/login?register=true" 
                  className="block w-full py-3.5 bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-xs font-extrabold rounded-xl text-center shadow-md shadow-[#2563EB]/15 transition-colors"
                >
                  Pilih Paket Growth
                </a>
              </div>
            </div>

            {/* Agent Card */}
            <div className="bg-white rounded-[28px] border border-[#E2E8F0] p-8 flex flex-col justify-between hover:shadow-xl transition-all duration-300">
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-bold bg-[#14B8A6]/10 text-[#14B8A6] px-3 py-1 rounded-full uppercase tracking-wider">
                    Agent
                  </span>
                  <h3 className="text-xl font-bold text-[#0B1F33] mt-3">Untuk Digital Agent</h3>
                  <p className="text-xs text-[#64748B] mt-1">Kelola dan jual kembali puluhan webstore untuk UMKM lokal.</p>
                </div>

                <div className="border-t border-[#E2E8F0] pt-6 space-y-4">
                  <p className="text-xs font-bold text-[#0B1F33] uppercase tracking-wider">Fitur Khusus Agensi:</p>
                  <ul className="space-y-3 text-xs text-slate-600 font-semibold">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#14B8A6]" />
                      <span className="text-[#0B1F33]">Kelola Banyak Toko Sekaligus</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#14B8A6]" />
                      <span>Dashboard Khusus Manajemen Klien</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#14B8A6]" />
                      <span>Beli Saldo Kredit Agen untuk Sewa Toko</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#14B8A6]" />
                      <span>Pantau Masa Aktif Masing-masing Klien</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#14B8A6]" />
                      <span>Skema Pendapatan Berulang (Recurring)</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-8">
                <a 
                  href="/login?register=true" 
                  className="block w-full py-3.5 bg-[#0B1F33] hover:bg-[#153454] text-white text-xs font-extrabold rounded-xl text-center transition-colors"
                >
                  Pilih Paket Agen
                </a>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* TRUST BUILDER SECTION */}
      <section className="py-20 bg-white border-t border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          
          <div className="max-w-xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B1F33] tracking-tight">
              Dibangun Dengan Fondasi Yang Aman Dan Bertahap.
            </h2>
            <p className="text-[#64748B] text-base">
              Daganta menjaga keberlangsungan operasional bisnis online Anda secara transparan dan andal.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto text-left">
            
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#2563EB]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[#0B1F33]">Data Pelanggan Lebih Tertata</h4>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Seluruh data transaksi dan informasi kontak pembeli tersimpan aman hanya untuk keperluan promosi toko Anda sendiri.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#2563EB]">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[#0B1F33]">Toko Terpisah Secara Sistem</h4>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Arsitektur kami mengisolasi data masing-masing toko dengan aman demi menghindari risiko kebocoran data operasional.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#2563EB]">
                <CreditCard className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[#0B1F33]">Dana Diarahkan ke Pemilik Toko</h4>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Semua uang pembayaran dari pembeli langsung ditransfer ke rekening bank pribadi Anda tanpa ditahan oleh platform.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#2563EB]">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[#0B1F33]">Dukungan Customer Support</h4>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Tim support kami siap membantu menjawab kebingungan Anda dalam mengelola webstore melalui WhatsApp.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#2563EB]">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[#0B1F33]">Roadmap Produk Bertahap</h4>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Kami terus melakukan penyempurnaan sistem secara bertahap demi menghadirkan fitur-fitur baru pendukung omzet.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#2563EB]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[#0B1F33]">Tidak Overbuild</h4>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Fokus penuh hanya pada fitur-fitur penting yang nyata-nyata dibutuhkan untuk membantu kelancaran transaksi belanja harian.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-20 bg-[#F8FAFC] border-t border-[#E2E8F0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          
          <div className="text-center space-y-4 mb-16">
            <span className="text-xs font-bold text-[#2563EB] tracking-widest uppercase block">Tanya Jawab</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B1F33] tracking-tight">
              Pertanyaan yang Sering Diajukan.
            </h2>
            <p className="text-[#64748B] text-base">
              Temukan jawaban atas kebingungan dasar Anda seputar penggunaan platform Daganta.
            </p>
          </div>

          <div className="space-y-4 max-w-3xl mx-auto">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-slate-50/50 transition-colors"
                >
                  <span className="text-sm sm:text-base font-bold text-[#0B1F33]">{faq.q}</span>
                  {activeFaq === idx ? (
                    <ChevronUp className="w-5 h-5 text-[#64748B] flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[#64748B] flex-shrink-0" />
                  )}
                </button>
                
                {activeFaq === idx && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-[#64748B] leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="py-20 bg-white border-t border-[#E2E8F0]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="bg-gradient-to-r from-[#0B1F33] to-[#2563EB] text-white rounded-[32px] p-8 sm:p-12 lg:p-16 space-y-8 relative overflow-hidden shadow-2xl">
            {/* Background sphere decorative pattern */}
            <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-white/5 rounded-full blur-[80px] pointer-events-none" />

            <div className="space-y-4 max-w-3xl mx-auto relative z-10">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                Saatnya Punya Toko Online Yang Benar-Benar Milik Anda.
              </h2>
              <p className="text-slate-300 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed">
                Bangun webstore profesional, terima pesanan langsung ke WhatsApp pribadi, dan kembangkan database pelanggan mandiri bersama Daganta.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 max-w-md mx-auto">
              <a 
                href="/login?register=true" 
                className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-[#0B1F33] font-bold rounded-2xl text-center shadow-lg transition-all transform hover:-translate-y-0.5 text-base"
              >
                Coba Gratis 14 Hari
              </a>
              <a 
                href="#demo" 
                className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-2xl text-center transition-all text-base"
              >
                Lihat Demo Webstore
              </a>
            </div>

            <p className="text-xs text-slate-300 font-semibold tracking-wider pt-2 relative z-10">
              Mudah. Mandiri. Bertumbuh.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#E2E8F0] bg-white pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-12">
            
            {/* Col 1 */}
            <div className="space-y-4 col-span-2 md:col-span-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0B1F33] flex items-center justify-center text-white text-sm font-extrabold">
                  D
                </div>
                <span className="text-lg font-bold text-[#0B1F33] tracking-tight">Daganta</span>
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed max-w-[200px]">
                Webstore Instan untuk UMKM dan Agen Digital Indonesia.
              </p>
            </div>

            {/* Col 2 */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-[#0B1F33] uppercase tracking-wider">Daganta</h4>
              <ul className="space-y-2 text-xs text-[#64748B] font-semibold">
                <li><a href="#" className="hover:text-[#2563EB] transition-colors">Tentang Kami</a></li>
                <li><a href="#fitur" className="hover:text-[#2563EB] transition-colors">Fitur</a></li>
                <li><a href="#harga" className="hover:text-[#2563EB] transition-colors">Harga</a></li>
                <li><a href="#demo" className="hover:text-[#2563EB] transition-colors">Demo</a></li>
              </ul>
            </div>

            {/* Col 3 */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-[#0B1F33] uppercase tracking-wider">Produk</h4>
              <ul className="space-y-2 text-xs text-[#64748B] font-semibold">
                <li><a href="#umkm" className="hover:text-[#2563EB] transition-colors">Webstore UMKM</a></li>
                <li><a href="#agen" className="hover:text-[#2563EB] transition-colors">Daganta Agent</a></li>
                <li><a href="/login" className="hover:text-[#2563EB] transition-colors">Dashboard Toko</a></li>
                <li><a href="#cara-kerja" className="hover:text-[#2563EB] transition-colors">WhatsApp Commerce</a></li>
              </ul>
            </div>

            {/* Col 4 */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-[#0B1F33] uppercase tracking-wider">Dukungan</h4>
              <ul className="space-y-2 text-xs text-[#64748B] font-semibold">
                <li><a href="#faq" className="hover:text-[#2563EB] transition-colors">FAQ</a></li>
                <li><a href="#faq" className="hover:text-[#2563EB] transition-colors">Panduan</a></li>
                <li><a href="mailto:support@daganta.id" className="hover:text-[#2563EB] transition-colors">Kontak</a></li>
                <li><span className="text-slate-400">Status Sistem: Normal</span></li>
              </ul>
            </div>

          </div>

          <div className="border-t border-[#E2E8F0] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] sm:text-xs text-[#64748B] font-semibold">
            <p>&copy; {new Date().getFullYear()} Daganta. Webstore Instan untuk UMKM dan Agen Digital.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-[#2563EB] transition-colors">Kebijakan Privasi</a>
              <a href="#" className="hover:text-[#2563EB] transition-colors">Syarat Layanan</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

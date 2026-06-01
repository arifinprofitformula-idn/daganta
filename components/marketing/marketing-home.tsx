import React from 'react';

export default function MarketingHome() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none antialiased">
      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <span className="font-extrabold text-lg text-white">D</span>
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Daganta</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Fitur</a>
            <a href="#pricing" className="hover:text-white transition-colors">Harga</a>
            <a href="#about" className="hover:text-white transition-colors">Tentang Kami</a>
          </nav>
          <div>
            <a 
              href="#register" 
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-600/20"
            >
              Coba Gratis
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden py-24 md:py-32">
          {/* Subtle light effects */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-5xl mx-auto px-6 text-center space-y-8 relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-indigo-400 text-xs font-semibold tracking-wide">
              <span>🚀 Platform Webstore Instan v0.1</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Miliki Webstore Instan,<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-200">
                WhatsApp-First Commerce
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-slate-400 md:text-lg leading-relaxed">
              Bantu UMKM memiliki toko online mandiri yang mudah, cepat, dan mobile-first. Serta mudahkan Digital Agency mengelola ratusan toko klien dalam satu platform terpusat.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <a 
                href="#demo"
                className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-xl shadow-indigo-600/20 text-center"
              >
                Buat Toko Sekarang
              </a>
              <a 
                href="#learn-more"
                className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 active:bg-slate-850 text-slate-350 font-semibold rounded-xl border border-slate-800 transition-all text-center"
              >
                Lihat Demo Toko
              </a>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 border-t border-slate-900 bg-slate-950/40 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-xl mx-auto space-y-4 mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-white">Dirancang untuk Pertumbuhan Bisnis</h2>
              <p className="text-slate-400 text-sm">
                Segala hal yang Anda butuhkan untuk berjualan online dengan mudah tanpa ribet urusan teknis.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-8 hover:border-indigo-500/20 hover:bg-slate-900/60 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-indigo-950 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-6">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Mobile-First Design</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  90% pembeli berbelanja lewat smartphone. Toko online Anda teroptimasi dengan sempurna untuk performa seluler super cepat.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-8 hover:border-indigo-500/20 hover:bg-slate-900/60 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-indigo-950 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-6">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">WhatsApp-First Commerce</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Transaksi langsung diteruskan ke WhatsApp Anda. Mempersingkat proses transaksi dan meningkatkan konversi penjualan.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-8 hover:border-indigo-500/20 hover:bg-slate-900/60 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-indigo-950 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-6">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Multi-Tenant Platform</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Dukungan arsitektur multi-tenant instan dengan domain unik yang terisolasi aman demi privasi data bisnis Anda.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} Daganta. Seluruh hak cipta dilindungi.</p>
          <p>Membangun Masa Depan UMKM Indonesia secara Mandiri &amp; Bertumbuh</p>
        </div>
      </footer>
    </div>
  );
}

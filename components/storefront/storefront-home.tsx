import React from 'react';
import ProductCard from './product-card';

interface StorefrontHomeProps {
  tenant: {
    id: string;
    name: string;
    slug: string;
    subdomain: string;
  };
  products: any[];
  isReadOnly?: boolean;
}

export default function StorefrontHome({ tenant, products, isReadOnly = false }: StorefrontHomeProps) {
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
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <span className="font-extrabold text-sm text-white uppercase">{tenant.name.substring(0, 1)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-white leading-tight">{tenant.name}</span>
              <span className="text-[10px] text-slate-400 font-mono">{tenant.subdomain}.daganta.store</span>
            </div>
          </div>
          <div>
            <button 
              type="button"
              disabled
              className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-300 text-xs font-semibold rounded-lg transition-all cursor-not-allowed"
            >
              Hubungi Toko
            </button>
          </div>
        </div>
      </header>

      {/* Hero Store Banner */}
      <section className="relative overflow-hidden py-16 bg-slate-900/30 border-b border-slate-900/60">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 text-center space-y-4 relative">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
            Selamat Datang di {tenant.name}
          </h1>
          <p className="max-w-md mx-auto text-slate-400 text-xs md:text-sm">
            Temukan berbagai produk pilihan terbaik kami dengan kualitas terjamin. Belanja mudah, cepat, dan aman langsung melalui WhatsApp.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
        {/* Section Title & Static Search Placeholder */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-lg font-bold text-white">Daftar Produk</h2>
            <p className="text-xs text-slate-500">Menampilkan produk unggulan dari {tenant.name}</p>
          </div>
          
          {/* Static Search Placeholder */}
          <div className="relative max-w-xs w-full">
            <input 
              type="text" 
              placeholder="Cari produk di toko ini..." 
              disabled
              className="w-full bg-slate-900/60 border border-slate-850 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-400 placeholder-slate-650 cursor-not-allowed select-none focus:outline-none"
            />
            <svg className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Product Grid / Empty State */}
        {products.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto bg-slate-900/10 border border-slate-900/40 rounded-2xl p-8">
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-200 text-sm">Belum Ada Produk</h3>
              <p className="text-slate-400 text-xs">
                Toko ini belum menambahkan produk aktif ke dalam etalase storefront mereka.
              </p>
            </div>
            <button 
              type="button" 
              disabled
              className="mt-2 px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 text-xs font-semibold rounded-xl transition-all cursor-not-allowed"
            >
              Hubungi Pemilik Toko
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                isReadOnly={isReadOnly} 
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500">
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

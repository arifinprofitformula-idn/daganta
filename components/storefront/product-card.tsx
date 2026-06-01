import React from 'react';
import { Prisma } from '@prisma/client';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    basePrice: Prisma.Decimal | number;
    imageUrl?: string | null;
    category?: {
      name: string;
    } | null;
    variants?: Array<{
      id: string;
      name: string;
      price: Prisma.Decimal | number;
    }>;
  };
  isReadOnly?: boolean;
}

export default function ProductCard({ product, isReadOnly = false }: ProductCardProps) {
  // Format Price to Rupiah currency representation
  const formatRupiah = (value: Prisma.Decimal | number) => {
    const numericValue = typeof value === 'number' ? value : Number(value);
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numericValue);
  };

  const hasVariants = product.variants && product.variants.length > 0;

  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl overflow-hidden flex flex-col h-full group hover:shadow-xl hover:shadow-indigo-950/20 transition-all duration-300 transform hover:-translate-y-1">
      {/* Product Image */}
      <div className="relative aspect-square w-full bg-slate-950 flex items-center justify-center overflow-hidden border-b border-slate-900">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-350"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-650 space-y-2 select-none">
            <svg className="w-10 h-10 stroke-current text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <span className="text-[10px] font-medium text-slate-500">Gambar tidak tersedia</span>
          </div>
        )}
        
        {/* Category Tag */}
        {product.category?.name && (
          <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-semibold bg-slate-950/90 text-indigo-400 border border-slate-800 rounded-full backdrop-blur-sm">
            {product.category.name}
          </span>
        )}
      </div>

      {/* Product Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <h3 className="font-bold text-slate-100 group-hover:text-indigo-400 transition-colors text-sm line-clamp-2 leading-snug">
            {product.name}
          </h3>
          <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
            {product.description || 'Tidak ada deskripsi produk.'}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] text-slate-500 font-medium">Harga Dasar</span>
            <span className="font-extrabold text-indigo-400 text-base">
              {formatRupiah(product.basePrice)}
            </span>
          </div>

          {/* Variants info */}
          {hasVariants && (
            <div className="text-[10px] text-slate-400 bg-slate-950 border border-slate-850 rounded-lg p-2 flex items-center justify-between">
              <span>Pilihan varian tersedia</span>
              <span className="font-bold text-indigo-400 px-1.5 py-0.5 rounded bg-indigo-950/50 border border-indigo-500/20">{product.variants!.length} Varian</span>
            </div>
          )}

          {/* Action CTA Button */}
          <button 
            type="button"
            disabled={true}
            className={`w-full py-2.5 px-4 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border transition-all select-none
              ${isReadOnly 
                ? 'bg-slate-950 border-slate-850 text-slate-500 cursor-not-allowed'
                : 'bg-emerald-600/10 hover:bg-emerald-600/15 border-emerald-500/20 hover:border-emerald-500/30 text-emerald-400 cursor-not-allowed'
              }`}
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.588 2.025 14.11 1 11.48 1c-5.44 0-9.866 4.372-9.87 9.802 0 1.714.45 3.387 1.302 4.887L1.888 20.3l4.759-1.146z" />
            </svg>
            <span>{isReadOnly ? 'Mode Terbatas' : 'Beli via WhatsApp'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

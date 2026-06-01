import React from 'react';
import { Prisma } from '@prisma/client';
import Link from 'next/link';

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
  primaryColor?: string; // Menyuntikkan warna primer secara dinamis
  hoverColor?: string;
}

export default function ProductCard({ 
  product, 
  isReadOnly = false, 
  primaryColor = '#4F46E5', // Default Indigo
  hoverColor = '#4338CA'
}: ProductCardProps) {
  // Format Price to Rupiah
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

  // Cari harga terendah untuk label "Mulai dari"
  const getMinPrice = () => {
    if (hasVariants) {
      const prices = product.variants!.map(v => Number(v.price));
      return Math.min(...prices);
    }
    return Number(product.basePrice);
  };

  const minPrice = getMinPrice();

  return (
    <div 
      className="bg-white border border-slate-100 hover:border-slate-200 rounded-2xl overflow-hidden flex flex-col h-full group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 transform hover:-translate-y-1.5"
      style={{ '--primary': primaryColor, '--primary-hover': hoverColor } as React.CSSProperties}
    >
      {/* Product Image (Rasio 4:5 Premium Dominan) */}
      <Link href={`/p/${product.slug}`} className="relative aspect-[4/5] w-full bg-slate-50 flex items-center justify-center overflow-hidden border-b border-slate-100 block cursor-pointer">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-300 space-y-2 select-none p-6">
            <svg className="w-12 h-12 stroke-current text-slate-350" fill="none" viewBox="0 0 24 24" strokeWidth={1.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375 0 11-.75 0 .375 0 01.75 0z" />
            </svg>
            <span className="text-[10px] font-semibold text-slate-400">Gambar tidak tersedia</span>
          </div>
        )}
        
        {/* Category Tag */}
        {product.category?.name && (
          <span 
            className="absolute top-4 left-4 px-2.5 py-1 text-[10px] font-bold text-white rounded-full shadow-sm"
            style={{ backgroundColor: primaryColor }}
          >
            {product.category.name}
          </span>
        )}
      </Link>

      {/* Product Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-1.5">
          <Link href={`/p/${product.slug}`} className="block">
            <h3 
              className="font-bold text-slate-800 transition-colors text-sm line-clamp-2 leading-snug group-hover:underline"
              style={{ '--hover-color': primaryColor } as React.CSSProperties}
            >
              {product.name}
            </h3>
          </Link>
          <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
            {product.description || 'Tidak ada deskripsi produk.'}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
              {hasVariants ? 'Harga Mulai Dari' : 'Harga Terbaik'}
            </span>
            <span 
              className="font-black text-lg"
              style={{ color: primaryColor }}
            >
              {formatRupiah(minPrice)}
            </span>
          </div>

          {/* Variants info */}
          {hasVariants && (
            <div className="text-[9px] text-slate-500 bg-slate-50 border border-slate-100 rounded-lg p-2 flex items-center justify-between font-semibold">
              <span>Pilihan varian tersedia</span>
              <span 
                className="font-extrabold px-1.5 py-0.5 rounded border text-[9px]"
                style={{ color: primaryColor, backgroundColor: primaryColor + '10', borderColor: primaryColor + '20' }}
              >
                {product.variants!.length} Varian
              </span>
            </div>
          )}

          {/* Action CTA Button */}
          <Link 
            href={`/p/${product.slug}`}
            className="w-full py-2.5 px-4 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border transition-all text-white shadow-md shadow-slate-100 hover:shadow-lg bg-[var(--primary)] border-[var(--primary)] hover:bg-[var(--primary-hover)] hover:border-[var(--primary-hover)]"
          >
            <span>Lihat Detail</span>
            <svg className="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

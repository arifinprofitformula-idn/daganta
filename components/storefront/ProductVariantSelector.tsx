'use client';

import { useMemo, useState } from 'react';
import { MessageCircle, ShoppingCart } from 'lucide-react';

export interface StorefrontVariantOption {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  stock: number;
}

interface ProductVariantSelectorProps {
  productName: string;
  tenantName: string;
  basePrice: number;
  variants: StorefrontVariantOption[];
  whatsappNumber: string | null;
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function normalizeWhatsappNumber(phone: string) {
  const digits = phone.replace(/[^0-9]/g, '');

  if (digits.startsWith('0')) {
    return `62${digits.slice(1)}`;
  }

  return digits;
}

export default function ProductVariantSelector({
  productName,
  tenantName,
  basePrice,
  variants,
  whatsappNumber,
}: ProductVariantSelectorProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(variants[0]?.id ?? null);
  const selectedVariant = variants.find((variant) => variant.id === selectedVariantId) ?? null;
  const currentPrice = selectedVariant?.price ?? basePrice;
  const currentStock = selectedVariant ? selectedVariant.stock : variants.reduce((total, variant) => total + variant.stock, 0);
  const hasVariantStock = variants.length > 0;
  const formattedPrice = formatRupiah(currentPrice);

  const whatsappUrl = useMemo(() => {
    if (!whatsappNumber) {
      return null;
    }

    const normalizedPhone = normalizeWhatsappNumber(whatsappNumber);
    if (!normalizedPhone) {
      return null;
    }

    const message = `Halo, saya tertarik dengan produk *${productName}* (${formattedPrice}) dari toko ${tenantName}. Apakah masih tersedia?`;
    return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
  }, [formattedPrice, productName, tenantName, whatsappNumber]);

  return (
    <div className="space-y-6">
      {variants.length > 0 && (
        <div className="space-y-3">
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Pilih Varian</p>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => {
              const isSelected = variant.id === selectedVariantId;

              return (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => setSelectedVariantId(variant.id)}
                  className={`rounded-xl border px-4 py-3 text-left text-xs transition ${
                    isSelected
                      ? 'border-slate-900 bg-slate-950 text-white shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                  }`}
                >
                  <span className="block font-bold">{variant.name}</span>
                  <span className={isSelected ? 'text-slate-300' : 'text-slate-500'}>
                    {formatRupiah(variant.price)} · Stok {variant.stock}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Stok</p>
        <p className={`mt-1 text-sm font-bold ${!hasVariantStock || currentStock > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
          {!hasVariantStock ? 'Tersedia' : currentStock > 0 ? `${currentStock} tersedia` : 'Habis'}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {whatsappUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#1FB457]"
          >
            <MessageCircle className="h-4 w-4" />
            Tanya via WhatsApp
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-200 px-5 py-3 text-sm font-black text-slate-500"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp belum tersedia
          </button>
        )}

        <button
          type="button"
          disabled
          className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-400"
        >
          <ShoppingCart className="h-4 w-4" />
          Tambah ke Keranjang
        </button>
      </div>
    </div>
  );
}

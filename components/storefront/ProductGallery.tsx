'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';

interface ProductGalleryProps {
  productName: string;
  images: string[];
}

export default function ProductGallery({ productName, images }: ProductGalleryProps) {
  const validImages = images.filter(Boolean);
  const [activeImage, setActiveImage] = useState<string | null>(validImages[0] ?? null);

  return (
    <div className="space-y-4">
      <div className="relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
        {activeImage ? (
          <Image
            src={activeImage}
            alt={productName}
            fill
            unoptimized
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <ImageIcon className="h-14 w-14" strokeWidth={1.4} />
            <span className="text-xs font-semibold">Gambar produk belum tersedia</span>
          </div>
        )}
      </div>

      {validImages.length > 1 && (
        <div className="grid grid-cols-5 gap-3">
          {validImages.slice(0, 5).map((image) => {
            const isActive = image === activeImage;

            return (
              <button
                key={image}
                type="button"
                onClick={() => setActiveImage(image)}
                className={`relative aspect-square overflow-hidden rounded-xl border bg-slate-50 transition ${
                  isActive ? 'border-slate-900 ring-2 ring-slate-900/10' : 'border-slate-200 hover:border-slate-400'
                }`}
                aria-label={`Lihat gambar ${productName}`}
              >
                <Image
                  src={image}
                  alt={productName}
                  fill
                  unoptimized
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

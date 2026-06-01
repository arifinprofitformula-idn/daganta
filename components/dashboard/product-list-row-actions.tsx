'use client';

import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, EyeOff, Loader2 } from 'lucide-react';
import { ProductStatus } from '@prisma/client';
import { deactivateProductAction } from '@/app/dashboard/products/actions';

interface ProductListRowActionsProps {
  productId: string;
  productName: string;
  status: ProductStatus;
}

export function ProductListRowActions({ productId, productName, status }: ProductListRowActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDeactivate = async () => {
    if (!confirm(`Apakah Anda yakin ingin menonaktifkan produk "${productName}"? Produk ini tidak akan tampil lagi di storefront publik.`)) {
      return;
    }

    startTransition(async () => {
      const result = await deactivateProductAction(productId);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || 'Gagal menonaktifkan produk.');
      }
    });
  };

  const isArchived = status === ProductStatus.ARCHIVED;

  return (
    <div className="flex items-center justify-end gap-1.5 select-none">
      <button
        type="button"
        onClick={() => router.push(`/dashboard/products/${productId}/edit`)}
        className="inline-flex items-center gap-1 py-1.5 px-3 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 rounded-lg text-[10px] font-semibold transition-all"
        disabled={isPending}
      >
        <Edit className="w-3.5 h-3.5" />
        <span>Edit</span>
      </button>

      {!isArchived && (
        <button
          type="button"
          onClick={handleDeactivate}
          className="inline-flex items-center gap-1 py-1.5 px-3 bg-rose-950/40 border border-rose-500/10 text-rose-450 hover:bg-rose-950 hover:text-rose-400 rounded-lg text-[10px] font-semibold transition-all"
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <EyeOff className="w-3.5 h-3.5" />
          )}
          <span>Nonaktifkan</span>
        </button>
      )}
    </div>
  );
}

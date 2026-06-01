import React from 'react';
import { ProductStatus } from '@prisma/client';

interface ProductStatusBadgeProps {
  status: ProductStatus;
}

export function ProductStatusBadge({ status }: ProductStatusBadgeProps) {
  switch (status) {
    case ProductStatus.ACTIVE:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 font-bold text-[10px]">
          Aktif
        </span>
      );
    case ProductStatus.DRAFT:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-800 text-slate-350 border border-slate-700/50 font-bold text-[10px]">
          Draft
        </span>
      );
    case ProductStatus.OUT_OF_STOCK:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-950/40 text-amber-400 border border-amber-500/20 font-bold text-[10px]">
          Stok Habis
        </span>
      );
    case ProductStatus.ARCHIVED:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-rose-950/40 text-rose-450 border border-rose-500/10 font-bold text-[10px]">
          Nonaktif
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800 font-bold text-[10px]">
          {status}
        </span>
      );
  }
}

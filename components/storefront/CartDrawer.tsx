'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { removeCartItemAction, updateCartItemAction } from '@/app/actions/cart';
import type { EnrichedCart } from '@/lib/cart/cart';

interface CartDrawerProps {
  cart: EnrichedCart;
  children: React.ReactNode;
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function CartDrawer({ cart, children }: CartDrawerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function updateQuantity(productId: string, variantId: string | null | undefined, quantity: number) {
    startTransition(async () => {
      await updateCartItemAction(productId, quantity, variantId);
      router.refresh();
    });
  }

  function removeItem(productId: string, variantId: string | null | undefined) {
    startTransition(async () => {
      await removeCartItemAction(productId, variantId);
      router.refresh();
    });
  }

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Keranjang Belanja</SheetTitle>
          <SheetDescription>{cart.totalItems} item siap diproses.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4">
          {cart.items.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
              <ShoppingBag className="h-12 w-12 text-slate-300" strokeWidth={1.5} />
              <p className="mt-4 text-sm font-bold text-slate-900">Keranjang masih kosong</p>
              <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">
                Tambahkan produk dari katalog untuk melanjutkan checkout.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {cart.items.map((item) => (
                <div key={`${item.productId}-${item.variantId ?? 'default'}`} className="flex gap-3 py-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.name} fill unoptimized sizes="64px" className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ShoppingBag className="h-5 w-5 text-slate-300" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <Link href={`/products/${item.slug}`} className="line-clamp-2 text-sm font-bold text-slate-900 hover:underline">
                      {item.name}
                    </Link>
                    {item.variantName && (
                      <p className="mt-0.5 text-[11px] font-semibold text-slate-400">Varian: {item.variantName}</p>
                    )}
                    <p className="mt-1 text-xs font-black text-slate-700">{formatRupiah(item.price)}</p>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="flex h-8 items-center rounded-lg border border-slate-200 bg-white">
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                          className="flex h-8 w-8 items-center justify-center text-slate-500 hover:text-slate-900 disabled:opacity-50"
                          aria-label="Kurangi kuantitas"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-8 text-center text-xs font-black">{item.quantity}</span>
                        <button
                          type="button"
                          disabled={isPending || (item.stock !== null && item.quantity >= item.stock)}
                          onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                          className="flex h-8 w-8 items-center justify-center text-slate-500 hover:text-slate-900 disabled:opacity-50"
                          aria-label="Tambah kuantitas"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => removeItem(item.productId, item.variantId)}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                        aria-label="Hapus item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <SheetFooter className="border-t border-slate-100">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold text-slate-500">Subtotal</span>
              <span className="text-lg font-black text-slate-950">{formatRupiah(cart.subtotal)}</span>
            </div>
            <Button asChild disabled={cart.items.length === 0} className="w-full bg-slate-950 text-white hover:bg-slate-800">
              <Link href="/checkout">Lanjut ke Checkout</Link>
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

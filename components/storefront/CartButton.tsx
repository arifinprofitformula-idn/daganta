'use client';

import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CartDrawer from '@/components/storefront/CartDrawer';
import type { EnrichedCart } from '@/lib/cart/cart';

interface CartButtonProps {
  cart: EnrichedCart;
}

export default function CartButton({ cart }: CartButtonProps) {
  return (
    <CartDrawer cart={cart}>
      <Button type="button" variant="outline" className="relative h-10 rounded-xl px-3">
        <ShoppingCart className="h-4 w-4" />
        <span className="sr-only">Buka keranjang</span>
        {cart.totalItems > 0 && (
          <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-black text-white">
            {cart.totalItems}
          </span>
        )}
      </Button>
    </CartDrawer>
  );
}

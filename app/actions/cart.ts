'use server';

import { revalidatePath } from 'next/cache';
import { ProductStatus } from '@prisma/client';
import { addToCart, clearCart, removeFromCart, updateCartItem } from '@/lib/cart/cart';
import { prisma } from '@/lib/prisma';
import { getStorefrontTenantContext } from '@/lib/tenant/storefront-tenant';

export interface CartActionResult {
  success: boolean;
  error?: string;
}

async function getTenantIdForCartAction() {
  const result = await getStorefrontTenantContext();

  if (result.status !== 'SUCCESS' || !result.tenant) {
    throw new Error('Toko tidak aktif atau tidak ditemukan.');
  }

  return result.tenant.id;
}

async function validateCartProduct(
  tenantId: string,
  productId: string,
  variantId?: string | null,
  quantity?: number
) {
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      tenantId,
      status: ProductStatus.ACTIVE,
    },
    include: {
      variants: {
        where: {
          tenantId,
          isActive: true,
        },
      },
    },
  });

  if (!product) {
    throw new Error('Produk tidak ditemukan atau tidak aktif.');
  }

  if (variantId && !product.variants.some((variant) => variant.id === variantId)) {
    throw new Error('Varian produk tidak tersedia.');
  }

  const selectedVariant = variantId
    ? product.variants.find((variant) => variant.id === variantId)
    : product.variants[0] ?? null;

  if (selectedVariant && quantity && selectedVariant.stock < quantity) {
    throw new Error(`Stok tidak mencukupi. Tersedia: ${selectedVariant.stock} unit.`);
  }
}

export async function addCartItemAction(
  productId: string,
  variantId?: string | null,
  quantity = 1
): Promise<CartActionResult> {
  try {
    const tenantId = await getTenantIdForCartAction();
    await validateCartProduct(tenantId, productId, variantId, quantity);
    await addToCart(tenantId, { productId, variantId, quantity });

    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath('/checkout');

    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Gagal menambahkan produk ke keranjang.',
    };
  }
}

export async function updateCartItemAction(
  productId: string,
  quantity: number,
  variantId?: string | null
): Promise<CartActionResult> {
  try {
    const tenantId = await getTenantIdForCartAction();
    await validateCartProduct(tenantId, productId, variantId, quantity);
    await updateCartItem(tenantId, productId, quantity, variantId);

    revalidatePath('/checkout');
    revalidatePath('/cart');

    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Gagal memperbarui keranjang.',
    };
  }
}

export async function removeCartItemAction(
  productId: string,
  variantId?: string | null
): Promise<CartActionResult> {
  try {
    const tenantId = await getTenantIdForCartAction();
    await removeFromCart(tenantId, productId, variantId);

    revalidatePath('/checkout');
    revalidatePath('/cart');

    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Gagal menghapus item keranjang.',
    };
  }
}

export async function clearCartAction(): Promise<CartActionResult> {
  try {
    const tenantId = await getTenantIdForCartAction();
    await clearCart(tenantId);

    revalidatePath('/checkout');
    revalidatePath('/cart');

    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Gagal mengosongkan keranjang.',
    };
  }
}

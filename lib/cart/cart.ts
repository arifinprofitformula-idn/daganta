import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { ProductStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';

const CART_COOKIE_NAME = 'daganta_cart_v1';

export interface CartItem {
  productId: string;
  variantId?: string | null;
  quantity: number;
  tenantId: string;
}

export interface EnrichedCartItem extends CartItem {
  name: string;
  slug: string;
  imageUrl: string | null;
  variantName: string | null;
  price: number;
  stock: number | null;
  weightGram: number;
  lineTotal: number;
}

export interface EnrichedCart {
  items: EnrichedCartItem[];
  totalItems: number;
  subtotal: number;
  totalWeightGram: number;
}

interface SignedCartPayload {
  items: CartItem[];
}

function getCartSecret() {
  return process.env.NEXTAUTH_SECRET || process.env.CART_COOKIE_SECRET || 'daganta-dev-cart-secret';
}

function encodeBase64Url(value: string) {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function decodeBase64Url(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function signPayload(payload: string) {
  return createHmac('sha256', getCartSecret()).update(payload).digest('base64url');
}

function verifySignature(payload: string, signature: string) {
  const expected = signPayload(payload);
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signature);

  return expectedBuffer.length === actualBuffer.length && timingSafeEqual(expectedBuffer, actualBuffer);
}

function normalizeQuantity(quantity: number) {
  return Math.min(99, Math.max(1, Math.floor(quantity)));
}

async function readCartPayload(): Promise<SignedCartPayload> {
  const cookieStore = await cookies();
  const signedValue = cookieStore.get(CART_COOKIE_NAME)?.value;

  if (!signedValue) {
    return { items: [] };
  }

  const [payload, signature] = signedValue.split('.');
  if (!payload || !signature || !verifySignature(payload, signature)) {
    return { items: [] };
  }

  try {
    const parsed = JSON.parse(decodeBase64Url(payload)) as SignedCartPayload;
    if (!Array.isArray(parsed.items)) {
      return { items: [] };
    }

    return {
      items: parsed.items.filter(
        (item) =>
          typeof item.productId === 'string' &&
          typeof item.tenantId === 'string' &&
          typeof item.quantity === 'number'
      ),
    };
  } catch {
    return { items: [] };
  }
}

async function writeCartPayload(payload: SignedCartPayload) {
  const cookieStore = await cookies();
  const rawPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = signPayload(rawPayload);

  cookieStore.set(CART_COOKIE_NAME, `${rawPayload}.${signature}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getCart(tenantId: string): Promise<CartItem[]> {
  if (!tenantId) {
    throw new Error('tenantId is required for tenant-scoped cart reads');
  }

  const payload = await readCartPayload();
  return payload.items.filter((item) => item.tenantId === tenantId);
}

export async function addToCart(
  tenantId: string,
  item: { productId: string; variantId?: string | null; quantity?: number }
): Promise<CartItem[]> {
  if (!tenantId || !item.productId) {
    throw new Error('tenantId and productId are required for tenant-scoped cart mutations');
  }

  const payload = await readCartPayload();
  const quantity = normalizeQuantity(item.quantity ?? 1);
  const variantId = item.variantId ?? null;
  const existingItem = payload.items.find(
    (cartItem) =>
      cartItem.tenantId === tenantId &&
      cartItem.productId === item.productId &&
      (cartItem.variantId ?? null) === variantId
  );

  if (existingItem) {
    existingItem.quantity = normalizeQuantity(existingItem.quantity + quantity);
  } else {
    payload.items.push({
      tenantId,
      productId: item.productId,
      variantId,
      quantity,
    });
  }

  await writeCartPayload(payload);
  return getCart(tenantId);
}

export async function updateCartItem(
  tenantId: string,
  productId: string,
  qty: number,
  variantId?: string | null
): Promise<CartItem[]> {
  if (!tenantId || !productId) {
    throw new Error('tenantId and productId are required for tenant-scoped cart mutations');
  }

  const payload = await readCartPayload();
  const normalizedVariantId = variantId ?? null;

  if (qty <= 0) {
    payload.items = payload.items.filter(
      (item) =>
        !(
          item.tenantId === tenantId &&
          item.productId === productId &&
          (item.variantId ?? null) === normalizedVariantId
        )
    );
  } else {
    payload.items = payload.items.map((item) =>
      item.tenantId === tenantId &&
      item.productId === productId &&
      (item.variantId ?? null) === normalizedVariantId
        ? { ...item, quantity: normalizeQuantity(qty) }
        : item
    );
  }

  await writeCartPayload(payload);
  return getCart(tenantId);
}

export async function removeFromCart(
  tenantId: string,
  productId: string,
  variantId?: string | null
): Promise<CartItem[]> {
  return updateCartItem(tenantId, productId, 0, variantId);
}

export async function clearCart(tenantId: string): Promise<void> {
  if (!tenantId) {
    throw new Error('tenantId is required for tenant-scoped cart mutations');
  }

  const payload = await readCartPayload();
  payload.items = payload.items.filter((item) => item.tenantId !== tenantId);
  await writeCartPayload(payload);
}

export async function getEnrichedCart(tenantId: string): Promise<EnrichedCart> {
  const items = await getCart(tenantId);

  if (items.length === 0) {
    return {
      items: [],
      totalItems: 0,
      subtotal: 0,
      totalWeightGram: 0,
    };
  }

  const products = await prisma.product.findMany({
    where: {
      tenantId,
      status: ProductStatus.ACTIVE,
      id: {
        in: items.map((item) => item.productId),
      },
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

  const enrichedItems = items.flatMap((item) => {
    const product = products.find((candidate) => candidate.id === item.productId);
    if (!product) {
      return [];
    }

    const variant = item.variantId
      ? product.variants.find((candidate) => candidate.id === item.variantId)
      : product.variants[0] ?? null;
    const price = variant ? Number(variant.price) : Number(product.basePrice);
    const stock = variant ? variant.stock : null;
    const weightGram = variant?.weightGram ?? 0;

    return {
      ...item,
      variantId: variant?.id ?? item.variantId ?? null,
      name: product.name,
      slug: product.slug,
      imageUrl: product.imageUrl,
      variantName: variant?.name ?? null,
      price,
      stock,
      weightGram,
      lineTotal: price * item.quantity,
    };
  });

  return {
    items: enrichedItems,
    totalItems: enrichedItems.reduce((total, item) => total + item.quantity, 0),
    subtotal: enrichedItems.reduce((total, item) => total + item.lineTotal, 0),
    totalWeightGram: enrichedItems.reduce((total, item) => total + item.weightGram * item.quantity, 0),
  };
}

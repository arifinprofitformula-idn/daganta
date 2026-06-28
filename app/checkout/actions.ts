'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { z } from 'zod';
import {
  NotificationChannel,
  NotificationEventType,
  OrderStatus,
  PaymentMethod,
  PaymentProvider,
  ProductStatus,
} from '@prisma/client';
import { clearCart, getCart } from '@/lib/cart/cart';
import { getDistricts, getRegencies } from '@/lib/data-access/regions';
import { createNotificationEvent } from '@/lib/notifications/create-event';
import { prisma } from '@/lib/prisma';
import { getClientIp, rateLimitByIP } from '@/lib/rate-limit';
import { getStorefrontTenantContext } from '@/lib/tenant/storefront-tenant';

export interface CheckoutActionState {
  success: boolean;
  error?: string;
}

const CheckoutSchema = z.object({
  name: z.string().trim().min(2, 'Nama lengkap wajib diisi.'),
  phone: z
    .string()
    .trim()
    .regex(/^(\+62|62|0)8[1-9][0-9]{6,11}$/, 'Nomor HP Indonesia tidak valid.'),
  email: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined))
    .pipe(z.string().email('Email tidak valid.').optional()),
  provinceId: z.string().trim().min(1, 'Provinsi wajib dipilih.'),
  regencyId: z.string().trim().min(1, 'Kabupaten/Kota wajib dipilih.'),
  districtId: z.string().trim().min(1, 'Kecamatan wajib dipilih.'),
  fullAddress: z.string().trim().min(8, 'Alamat lengkap minimal 8 karakter.'),
  notes: z.string().trim().optional(),
});

interface VerifiedItem {
  productId: string;
  variantId: string | null;
  productNameSnapshot: string;
  variantNameSnapshot: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  weightGram: number;
}

function formatZodError(error: z.ZodError) {
  return error.issues.map((issue) => issue.message).join(' ');
}

async function getCheckoutTenantId() {
  const result = await getStorefrontTenantContext();

  if (result.status !== 'SUCCESS' || !result.tenant) {
    throw new Error('Toko tidak aktif atau tidak ditemukan.');
  }

  if (result.accessMode === 'STOREFRONT_READONLY') {
    throw new Error('Checkout sementara dibatasi karena masa aktif toko perlu diperpanjang.');
  }

  return result.tenant.id;
}

export async function getRegenciesAction(provinceId: string) {
  return getRegencies(provinceId);
}

export async function getDistrictsAction(regencyId: string) {
  return getDistricts(regencyId);
}

async function createOrderNumber(tenantId: string) {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');

  for (let attempt = 0; attempt < 10; attempt++) {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-${datePart}-${randomDigits}`;
    const existing = await prisma.order.findFirst({
      where: {
        tenantId,
        orderNumber,
      },
      select: {
        id: true,
      },
    });

    if (!existing) {
      return orderNumber;
    }
  }

  return `ORD-${datePart}-${Date.now().toString().slice(-6)}`;
}

export async function createOrderAction(
  _previousState: CheckoutActionState,
  formData: FormData
): Promise<CheckoutActionState> {
  let orderId: string | null = null;

  try {
    const requestHeaders = await headers();
    const checkoutLimit = await rateLimitByIP(getClientIp(requestHeaders), 5, 60);

    if (!checkoutLimit.success) {
      return { success: false, error: 'Terlalu banyak percobaan checkout. Coba lagi sebentar lagi.' };
    }

    const tenantId = await getCheckoutTenantId();
    const parsed = CheckoutSchema.safeParse({
      name: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      provinceId: formData.get('provinceId'),
      regencyId: formData.get('regencyId'),
      districtId: formData.get('districtId'),
      fullAddress: formData.get('fullAddress'),
      notes: formData.get('notes'),
    });

    if (!parsed.success) {
      return { success: false, error: formatZodError(parsed.error) };
    }

    const values = parsed.data;
    const cartItems = await getCart(tenantId);
    if (cartItems.length === 0) {
      return { success: false, error: 'Keranjang belanja kosong.' };
    }

    const [province, regency, district] = await Promise.all([
      prisma.province.findFirst({
        where: {
          id: values.provinceId,
        },
        select: {
          id: true,
          name: true,
        },
      }),
      prisma.regency.findFirst({
        where: {
          id: values.regencyId,
          provinceId: values.provinceId,
        },
        select: {
          id: true,
          name: true,
        },
      }),
      prisma.district.findFirst({
        where: {
          id: values.districtId,
          regencyId: values.regencyId,
        },
        select: {
          id: true,
          name: true,
        },
      }),
    ]);

    if (!province || !regency || !district) {
      return { success: false, error: 'Data wilayah tidak valid.' };
    }

    const products = await prisma.product.findMany({
      where: {
        tenantId,
        status: ProductStatus.ACTIVE,
        id: {
          in: cartItems.map((item) => item.productId),
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

    const verifiedItems: VerifiedItem[] = [];
    let subtotal = 0;

    for (const item of cartItems) {
      const product = products.find((candidate) => candidate.id === item.productId);
      if (!product) {
        return { success: false, error: 'Salah satu produk di keranjang sudah tidak tersedia.' };
      }

      const variant = item.variantId
        ? product.variants.find((candidate) => candidate.id === item.variantId)
        : product.variants[0] ?? null;

      if (item.variantId && !variant) {
        return { success: false, error: `Varian produk "${product.name}" sudah tidak tersedia.` };
      }

      if (variant && variant.stock < item.quantity) {
        return {
          success: false,
          error: `Stok "${product.name} - ${variant.name}" tidak mencukupi. Tersedia: ${variant.stock} unit.`,
        };
      }

      const unitPrice = variant ? Number(variant.price) : Number(product.basePrice);
      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      verifiedItems.push({
        productId: product.id,
        variantId: variant?.id ?? null,
        productNameSnapshot: product.name,
        variantNameSnapshot: variant?.name ?? null,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
        weightGram: variant?.weightGram ?? 0,
      });
    }

    const formattedAddress = [
      values.fullAddress,
      `Kecamatan: ${district.name}`,
      `Kota/Kabupaten: ${regency.name}`,
      `Provinsi: ${province.name}`,
    ].join('\n');

    const orderNumber = await createOrderNumber(tenantId);
    const order = await prisma.$transaction(async (tx) => {
      const existingCustomer = await tx.customer.findFirst({
        where: {
          tenantId,
          phone: values.phone,
        },
        select: {
          id: true,
        },
      });

      let customerId = existingCustomer?.id;

      if (customerId) {
        await tx.customer.updateMany({
          where: {
            id: customerId,
            tenantId,
          },
          data: {
            name: values.name,
            email: values.email ?? null,
            address: formattedAddress,
            provinceId: province.id,
            regencyId: regency.id,
            districtId: district.id,
          },
        });
      } else {
        const customer = await tx.customer.create({
          data: {
            tenantId,
            name: values.name,
            phone: values.phone,
            email: values.email ?? null,
            address: formattedAddress,
            provinceId: province.id,
            regencyId: regency.id,
            districtId: district.id,
          },
        });
        customerId = customer.id;
      }

      const newOrder = await tx.order.create({
        data: {
          tenantId,
          customerId,
          orderNumber,
          status: OrderStatus.PENDING_PAYMENT,
          subtotal,
          shippingCost: 0,
          discountTotal: 0,
          grandTotal: subtotal,
          notes: values.notes || null,
        },
      });

      await tx.orderPayment.create({
        data: {
          tenantId,
          orderId: newOrder.id,
          provider: PaymentProvider.MANUAL,
          method: PaymentMethod.MANUAL_TRANSFER,
          amount: subtotal,
        },
      });

      for (const item of verifiedItems) {
        await tx.orderItem.create({
          data: {
            tenantId,
            orderId: newOrder.id,
            productId: item.productId,
            variantId: item.variantId,
            productNameSnapshot: item.productNameSnapshot,
            variantNameSnapshot: item.variantNameSnapshot,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            weightGram: item.weightGram,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          tenantId,
          action: 'CUSTOMER_CHECKOUT',
          entityType: 'Order',
          entityId: newOrder.id,
          metadata: {
            orderNumber: newOrder.orderNumber,
            buyerName: values.name,
            buyerPhone: values.phone,
            totalAmount: subtotal,
          },
        },
      });

      await createNotificationEvent(tx, {
        tenantId,
        orderId: newOrder.id,
        customerId,
        channel: NotificationChannel.INTERNAL,
        type: NotificationEventType.ORDER_CREATED,
        recipient: values.phone,
        params: {
          buyerName: values.name,
          orderNumber: newOrder.orderNumber,
          amount: newOrder.grandTotal,
        },
      });

      return newOrder;
    });

    orderId = order.id;
    await clearCart(tenantId);
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Checkout gagal diproses.',
    };
  }

  if (orderId) {
    redirect(`/checkout/success/${orderId}`);
  }

  return { success: false, error: 'Checkout gagal diproses.' };
}

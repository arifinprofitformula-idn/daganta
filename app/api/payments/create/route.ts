import { NextRequest, NextResponse } from 'next/server';
import { PaymentMethod } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getPaymentAdapter } from '@/lib/payments';
import type { PaymentRequestItem } from '@/lib/payments';
import { resolveTenantFromHost } from '@/lib/tenant/resolve-tenant';

interface CreatePaymentBody {
  orderId?: string;
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status });
}

async function getTenantIdFromRequest(request: NextRequest) {
  const resolution = await resolveTenantFromHost(request.headers.get('host') ?? '');

  if (resolution.status !== 'SUCCESS' || !resolution.tenant) {
    return null;
  }

  return resolution.tenant.id;
}

export async function POST(request: NextRequest) {
  let body: CreatePaymentBody;

  try {
    body = (await request.json()) as CreatePaymentBody;
  } catch {
    return jsonResponse({ success: false, error: 'Request body harus JSON.' }, 400);
  }

  if (!body.orderId) {
    return jsonResponse({ success: false, error: 'orderId wajib diisi.' }, 400);
  }

  const tenantId = await getTenantIdFromRequest(request);

  if (!tenantId) {
    return jsonResponse({ success: false, error: 'Toko tidak ditemukan.' }, 404);
  }

  const order = await prisma.order.findFirst({
    where: {
      id: body.orderId,
      tenantId,
    },
    include: {
      tenant: {
        select: {
          id: true,
          paymentProvider: true,
        },
      },
      customer: {
        select: {
          name: true,
          email: true,
          phone: true,
        },
      },
      items: {
        select: {
          id: true,
          productNameSnapshot: true,
          variantNameSnapshot: true,
          quantity: true,
          unitPrice: true,
        },
      },
      payment: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!order) {
    return jsonResponse({ success: false, error: 'Order tidak ditemukan.' }, 404);
  }

  const adapter = getPaymentAdapter(order.tenant.paymentProvider);
  const items: PaymentRequestItem[] = order.items.map((item) => ({
    id: item.id,
    name: item.variantNameSnapshot
      ? `${item.productNameSnapshot} - ${item.variantNameSnapshot}`
      : item.productNameSnapshot,
    price: Number(item.unitPrice),
    quantity: item.quantity,
  }));
  const payment = await adapter.createPayment({
    tenantId,
    orderId: order.id,
    orderNumber: order.orderNumber,
    amount: Math.round(Number(order.grandTotal)),
    customerName: order.customer?.name ?? 'Pelanggan Daganta',
    customerEmail: order.customer?.email ?? null,
    customerPhone: order.customer?.phone ?? null,
    items,
  });

  if (order.payment) {
    await prisma.orderPayment.updateMany({
      where: {
        id: order.payment.id,
        tenantId,
      },
      data: {
        provider: adapter.provider,
        method: PaymentMethod.MANUAL_TRANSFER,
        status: adapter.createInitialStatus(),
        amount: order.grandTotal,
        adminNote: payment.transactionId,
      },
    });
  } else {
    await prisma.orderPayment.create({
      data: {
        tenantId,
        orderId: order.id,
        provider: adapter.provider,
        method: PaymentMethod.MANUAL_TRANSFER,
        status: adapter.createInitialStatus(),
        amount: order.grandTotal,
        adminNote: payment.transactionId,
      },
    });
  }

  return jsonResponse({
    success: true,
    provider: adapter.provider,
    paymentUrl: payment.paymentUrl,
    transactionId: payment.transactionId,
    expiresAt: payment.expiresAt?.toISOString() ?? null,
    instructions: payment.instructions ?? null,
  });
}

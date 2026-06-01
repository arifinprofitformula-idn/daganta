import React from 'react';
import { RefreshCw } from 'lucide-react';
import { getActiveTenantContext } from '@/lib/auth/tenant-access';
import { prisma } from '@/lib/prisma';
import OrdersClient from './orders-client';

export const dynamic = 'force-dynamic';

export default async function Page() {
  // 1. Dapatkan konteks toko aktif dari sesi pengelola
  const tenantCtx = await getActiveTenantContext();
  if (tenantCtx.status !== 'SUCCESS' || !tenantCtx.activeTenant) {
    return null; // Layout induk dashboard_shell menangani pembatasan
  }

  const tenant = tenantCtx.activeTenant;

  // 2. Query seluruh pesanan aktif (Strict Tenant Isolation)
  const dbOrders = await prisma.order.findMany({
    where: {
      tenantId: tenant.id,
    },
    include: {
      customer: {
        select: {
          name: true,
          phone: true,
          email: true,
          address: true,
        },
      },
      items: {
        select: {
          id: true,
          productId: true,
          variantId: true,
          productNameSnapshot: true,
          variantNameSnapshot: true,
          quantity: true,
          unitPrice: true,
          totalPrice: true,
          weightGram: true,
        },
      },
      payment: {
        select: {
          id: true,
          provider: true,
          method: true,
          status: true,
          amount: true,
          proofNote: true,
          adminNote: true,
          verifiedAt: true,
          rejectedAt: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // 3. Serialisasi Decimal -> number untuk mencegah Next.js Serialization error di Client Component
  const serializedOrders = dbOrders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    subtotal: Number(order.subtotal),
    shippingCost: Number(order.shippingCost),
    discountTotal: Number(order.discountTotal),
    grandTotal: Number(order.grandTotal),
    notes: order.notes,
    createdAt: order.createdAt.toISOString(),
    customer: order.customer,
    payment: order.payment
      ? {
          id: order.payment.id,
          provider: order.payment.provider,
          method: order.payment.method,
          status: order.payment.status,
          amount: Number(order.payment.amount),
          proofNote: order.payment.proofNote,
          adminNote: order.payment.adminNote,
          verifiedAt: order.payment.verifiedAt?.toISOString() || null,
          rejectedAt: order.payment.rejectedAt?.toISOString() || null,
          createdAt: order.payment.createdAt.toISOString(),
          updatedAt: order.payment.updatedAt.toISOString(),
        }
      : null,
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      productNameSnapshot: item.productNameSnapshot,
      variantNameSnapshot: item.variantNameSnapshot,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      totalPrice: Number(item.totalPrice),
      weightGram: item.weightGram,
    })),
  }));

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-5">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Pesanan Masuk</h1>
          <p className="text-xs text-slate-500 mt-1">
            Daftar seluruh pesanan pembeli yang masuk di etalase toko <span className="text-indigo-350 font-extrabold">{tenant.name}</span>
          </p>
        </div>

        {/* Dynamic Context Info */}
        <div className="flex items-center gap-3 select-none">
          <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 font-bold px-3 py-2 rounded-xl">
            Toko: {tenant.name} ({tenant.subdomain})
          </span>
        </div>
      </div>

      {/* Orders Dashboard client content */}
      <OrdersClient orders={serializedOrders} tenantName={tenant.name} />
    </div>
  );
}

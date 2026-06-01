'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getActiveTenantContext } from '@/lib/auth/tenant-access';
import { OrderStatus } from '@prisma/client';

export async function updateOrderStatusAction(orderId: string, newStatus: OrderStatus) {
  try {
    // 1. Verifikasi Otentikasi Dashboard Pengelola Toko
    const tenantCtx = await getActiveTenantContext();
    if (tenantCtx.status !== 'SUCCESS' || !tenantCtx.activeTenant || !tenantCtx.userProfile) {
      return { success: false, error: 'Sesi kedaluwarsa atau Anda tidak diizinkan mengakses halaman ini.' };
    }

    const tenant = tenantCtx.activeTenant;
    const actor = tenantCtx.userProfile;

    // 2. Query data pesanan aktif memastikan milik tenant ini (Strict Tenant Isolation Guard)
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        tenantId: tenant.id,
      },
    });

    if (!order) {
      return { success: false, error: 'Pesanan tidak ditemukan atau berada di luar wewenang kelola Anda.' };
    }

    if (order.status === newStatus) {
      return { success: true, message: 'Status pesanan sudah sesuai.' };
    }

    const previousStatus = order.status;

    // 3. Update status secara Transaksional dengan pencatatan AuditLog
    await prisma.$transaction(async (tx) => {
      // a. Perbarui status kolom pesanan
      await tx.order.update({
        where: { id: orderId },
        data: { status: newStatus },
      });

      // b. Catat ke AuditLog sistem
      await tx.auditLog.create({
        data: {
          tenantId: tenant.id,
          actorId: actor.id,
          action: 'UPDATE_ORDER_STATUS',
          entityType: 'ORDER',
          entityId: orderId,
          metadata: {
            orderNumber: order.orderNumber,
            previousStatus: previousStatus,
            newStatus: newStatus,
          },
        },
      });
    });

    // Revalidate Path agar data dashboard langsung terbarui
    revalidatePath('/dashboard/orders');

    return { success: true };
  } catch (error: any) {
    console.error('Update order status error:', error);
    return {
      success: false,
      error: error.message || 'Terjadi kesalahan sistem saat memperbarui status pesanan.',
    };
  }
}

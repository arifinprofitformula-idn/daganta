'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getActiveTenantContext } from '@/lib/auth/tenant-access';
import { OrderStatus, PaymentStatus, NotificationChannel, NotificationEventType } from '@prisma/client';
import { createNotificationEvent } from '@/lib/notifications/create-event';

const allowedPaymentTransitions: Record<PaymentStatus, PaymentStatus[]> = {
  [PaymentStatus.WAITING_PAYMENT]: [PaymentStatus.WAITING_VERIFICATION],
  [PaymentStatus.WAITING_VERIFICATION]: [PaymentStatus.VERIFIED, PaymentStatus.REJECTED],
  [PaymentStatus.VERIFIED]: [],
  [PaymentStatus.REJECTED]: [PaymentStatus.WAITING_PAYMENT],
};

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

export async function updateOrderPaymentStatusAction(orderId: string, newStatus: PaymentStatus, adminNote?: string) {
  try {
    const tenantCtx = await getActiveTenantContext();
    if (tenantCtx.status !== 'SUCCESS' || !tenantCtx.activeTenant || !tenantCtx.userProfile) {
      return { success: false, error: 'Sesi kedaluwarsa atau Anda tidak diizinkan mengakses halaman ini.' };
    }

    const tenant = tenantCtx.activeTenant;
    const actor = tenantCtx.userProfile;
    const cleanAdminNote = adminNote?.trim() || null;

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        tenantId: tenant.id,
      },
      include: {
        payment: true,
        customer: true,
      },
    });

    if (!order) {
      return { success: false, error: 'Pesanan tidak ditemukan atau berada di luar wewenang kelola Anda.' };
    }

    if (!order.payment) {
      return { success: false, error: 'Belum ada catatan pembayaran untuk pesanan ini.' };
    }

    const previousPaymentStatus = order.payment.status;

    if (previousPaymentStatus === newStatus) {
      return { success: true, message: 'Status pembayaran sudah sesuai.' };
    }

    if (!allowedPaymentTransitions[previousPaymentStatus].includes(newStatus)) {
      return {
        success: false,
        error: 'Perubahan status pembayaran tidak valid untuk kondisi pembayaran saat ini.',
      };
    }

    const now = new Date();
    const previousOrderStatus = order.status;
    let nextOrderStatus = order.status;

    if (newStatus === PaymentStatus.VERIFIED && order.status === OrderStatus.PENDING_PAYMENT) {
      nextOrderStatus = OrderStatus.PROCESSING;
    }

    await prisma.$transaction(async (tx) => {
      await tx.orderPayment.update({
        where: {
          id: order.payment!.id,
        },
        data: {
          status: newStatus,
          adminNote: cleanAdminNote,
          verifiedAt: newStatus === PaymentStatus.VERIFIED ? now : null,
          rejectedAt: newStatus === PaymentStatus.REJECTED ? now : null,
        },
      });

      await tx.auditLog.create({
        data: {
          tenantId: tenant.id,
          actorId: actor.id,
          action: 'UPDATE_PAYMENT_STATUS',
          entityType: 'ORDER_PAYMENT',
          entityId: order.payment!.id,
          metadata: {
            orderId: order.id,
            orderNumber: order.orderNumber,
            paymentId: order.payment!.id,
            previousPaymentStatus,
            newPaymentStatus: newStatus,
            adminNote: cleanAdminNote,
          },
        },
      });

      if (nextOrderStatus !== previousOrderStatus) {
        await tx.order.update({
          where: {
            id: order.id,
          },
          data: {
            status: nextOrderStatus,
          },
        });

        await tx.auditLog.create({
          data: {
            tenantId: tenant.id,
            actorId: actor.id,
            action: 'UPDATE_ORDER_STATUS_FROM_PAYMENT',
            entityType: 'ORDER',
            entityId: order.id,
            metadata: {
              orderId: order.id,
              orderNumber: order.orderNumber,
              paymentId: order.payment!.id,
              previousOrderStatus,
              newOrderStatus: nextOrderStatus,
              previousPaymentStatus,
              newPaymentStatus: newStatus,
            },
          },
        });
      }

      // Create transaction-safe NotificationEvent if matching life-cycle states
      if (newStatus === PaymentStatus.WAITING_VERIFICATION) {
        await createNotificationEvent(tx, {
          tenantId: tenant.id,
          orderId: order.id,
          customerId: order.customerId,
          channel: NotificationChannel.INTERNAL,
          type: NotificationEventType.PAYMENT_WAITING_VERIFICATION,
          recipient: order.customer?.phone || null,
          params: {
            orderNumber: order.orderNumber,
          },
        });
      } else if (newStatus === PaymentStatus.VERIFIED) {
        await createNotificationEvent(tx, {
          tenantId: tenant.id,
          orderId: order.id,
          customerId: order.customerId,
          channel: NotificationChannel.INTERNAL,
          type: NotificationEventType.PAYMENT_VERIFIED,
          recipient: order.customer?.phone || null,
          params: {
            orderNumber: order.orderNumber,
          },
        });
      } else if (newStatus === PaymentStatus.REJECTED) {
        await createNotificationEvent(tx, {
          tenantId: tenant.id,
          orderId: order.id,
          customerId: order.customerId,
          channel: NotificationChannel.INTERNAL,
          type: NotificationEventType.PAYMENT_REJECTED,
          recipient: order.customer?.phone || null,
          params: {
            orderNumber: order.orderNumber,
            reason: cleanAdminNote || undefined,
          },
        });
      }
    });

    revalidatePath('/dashboard/orders');

    return { success: true };
  } catch (error: any) {
    console.error('Update payment status error:', error);
    return {
      success: false,
      error: error.message || 'Terjadi kesalahan sistem saat memperbarui status pembayaran.',
    };
  }
}

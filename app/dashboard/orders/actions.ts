'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getActiveTenantContext } from '@/lib/auth/tenant-access';
import { OrderStatus, PaymentStatus, NotificationChannel, NotificationEventType } from '@prisma/client';
import { createNotificationEvent } from '@/lib/notifications/create-event';
import { enqueueNotification } from '@/lib/notifications/queue';
import { validateTenantAccess } from '@/lib/auth/validate-tenant-access';
import { logAuditAction } from '@/lib/audit/log-action';
import { updateOrderStatus } from '@/lib/data-access/orders';

export interface UpdateOrderStatusInput {
  orderId: string;
  status: OrderStatus;
  trackingNumber?: string;
  note?: string;
}

export interface UpdateOrderStatusResult {
  success: boolean;
  error?: string;
  message?: string;
  whatsappUrl?: string;
}

const allowedPaymentTransitions: Record<PaymentStatus, PaymentStatus[]> = {
  [PaymentStatus.WAITING_PAYMENT]: [PaymentStatus.WAITING_VERIFICATION],
  [PaymentStatus.WAITING_VERIFICATION]: [PaymentStatus.VERIFIED, PaymentStatus.REJECTED],
  [PaymentStatus.VERIFIED]: [],
  [PaymentStatus.REJECTED]: [PaymentStatus.WAITING_PAYMENT],
};

function normalizeWhatsAppNumber(phone: string) {
  const digits = phone.replace(/[^0-9]/g, '');
  return digits.startsWith('0') ? `62${digits.slice(1)}` : digits;
}

function buildStatusWhatsAppUrl(phone: string | null | undefined, orderNumber: string, status: OrderStatus) {
  if (!phone) {
    return null;
  }

  const normalizedPhone = normalizeWhatsAppNumber(phone);
  if (!normalizedPhone) {
    return null;
  }

  const message = `Pesanan #${orderNumber} Anda sudah ${status}.`;
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
}

export async function updateOrderStatusAction(
  input: UpdateOrderStatusInput | string,
  fallbackStatus?: OrderStatus
): Promise<UpdateOrderStatusResult> {
  try {
    // 1. Verifikasi Otentikasi Dashboard Pengelola Toko
    const tenantCtx = await getActiveTenantContext();
    if (tenantCtx.status !== 'SUCCESS' || !tenantCtx.activeTenant || !tenantCtx.userProfile) {
      return { success: false, error: 'Sesi kedaluwarsa atau Anda tidak diizinkan mengakses halaman ini.' };
    }

    const tenant = tenantCtx.activeTenant;
    const actor = tenantCtx.userProfile;
    await validateTenantAccess(actor.id, tenant.id);
    const orderId = typeof input === 'string' ? input : input.orderId;
    const newStatus = typeof input === 'string' ? fallbackStatus : input.status;
    const trackingNumber = typeof input === 'string' ? undefined : input.trackingNumber?.trim();
    const note = typeof input === 'string' ? undefined : input.note?.trim();

    if (!orderId || !newStatus) {
      return { success: false, error: 'Data update status tidak lengkap.' };
    }

    // 2. Query data pesanan aktif memastikan milik tenant ini (Strict Tenant Isolation Guard)
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        tenantId: tenant.id,
      },
      include: {
        customer: {
          select: {
            phone: true,
          },
        },
      },
    });

    if (!order) {
      return { success: false, error: 'Pesanan tidak ditemukan atau berada di luar wewenang kelola Anda.' };
    }

    if (order.status === newStatus) {
      return {
        success: true,
        message: 'Status pesanan sudah sesuai.',
        whatsappUrl: buildStatusWhatsAppUrl(order.customer?.phone, order.orderNumber, newStatus) ?? undefined,
      };
    }

    const previousStatus = order.status;

    const result = await updateOrderStatus(
      tenant.id,
      orderId,
      newStatus,
      newStatus === OrderStatus.SHIPPED ? trackingNumber : undefined
    );
    if (result.count === 0) {
      return { success: false, error: 'Pesanan tidak ditemukan atau bukan milik toko Anda.' };
    }

    await logAuditAction({
      tenantId: tenant.id,
      userId: actor.id,
      action: 'UPDATE_ORDER_STATUS',
      entityType: 'Order',
      entityId: orderId,
      metadata: {
        orderNumber: order.orderNumber,
        previousStatus,
        newStatus,
        trackingNumber: newStatus === OrderStatus.SHIPPED ? trackingNumber || null : null,
        note: note || null,
      },
    });

    try {
      await enqueueNotification({
        tenantId: tenant.id,
        orderId: order.id,
        customerId: order.customerId,
        channel: NotificationChannel.WHATSAPP_LINK,
        eventType: NotificationEventType.ORDER_STATUS_UPDATED,
        recipient: order.customer?.phone ?? null,
        payload: {
          orderNumber: order.orderNumber,
          newStatus,
          trackingNumber: newStatus === OrderStatus.SHIPPED ? trackingNumber || null : null,
        },
      });
    } catch (notificationError: unknown) {
      console.warn(
        'Gagal enqueue notifikasi update status pesanan:',
        notificationError instanceof Error ? notificationError.message : 'Unknown notification queue error'
      );
    }

    // Revalidate Path agar data dashboard langsung terbarui
    revalidatePath('/dashboard/orders');
    revalidatePath(`/dashboard/orders/${orderId}`);

    return {
      success: true,
      message: 'Status pesanan berhasil diperbarui.',
      whatsappUrl: buildStatusWhatsAppUrl(order.customer?.phone, order.orderNumber, newStatus) ?? undefined,
    };
  } catch (error: unknown) {
    console.error('Update order status error:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan sistem saat memperbarui status pesanan.',
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
    await validateTenantAccess(actor.id, tenant.id);
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
      await tx.orderPayment.updateMany({
        where: {
          id: order.payment!.id,
          tenantId: tenant.id,
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
        await tx.order.updateMany({
          where: {
            id: order.id,
            tenantId: tenant.id,
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
  } catch (error: unknown) {
    console.error('Update payment status error:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan sistem saat memperbarui status pembayaran.',
    };
  }
}

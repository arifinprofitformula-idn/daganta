'use server';

import {
  InvoiceStatus,
  NotificationChannel,
  NotificationEventStatus,
  NotificationEventType,
  Prisma,
  SubscriptionStatus,
  TenantStatus,
} from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { assertSuperAdmin } from '@/lib/auth/platform-access';
import { addDays, addMonths } from '@/lib/billing/pricing';
import { enqueueNotification } from '@/lib/notifications/queue';
import { prisma } from '@/lib/prisma';

function redirectWithError(message: string): never {
  redirect(`/admin/payments?error=${encodeURIComponent(message)}`);
}

function redirectWithSuccess(message: string): never {
  redirect(`/admin/payments?success=${encodeURIComponent(message)}`);
}

export async function confirmPaymentAction(invoiceId: string) {
  let platformUser;

  try {
    platformUser = await assertSuperAdmin();
  } catch {
    redirectWithError('Halaman ini hanya tersedia untuk super admin Daganta.');
  }

  const invoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      tenantId: {
        not: '',
      },
    },
    include: {
      plan: true,
      subscription: true,
      tenant: {
        include: {
          owner: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!invoice) {
    redirectWithError('Invoice tidak ditemukan.');
  }

  if (invoice.status !== InvoiceStatus.PENDING_VERIFICATION) {
    redirectWithError('Invoice belum berada dalam status menunggu verifikasi.');
  }

  const now = new Date();
  const baseEndDate =
    invoice.subscription?.currentPeriodEnd && invoice.subscription.currentPeriodEnd > now
      ? invoice.subscription.currentPeriodEnd
      : invoice.tenant.subscriptionEndsAt && invoice.tenant.subscriptionEndsAt > now
        ? invoice.tenant.subscriptionEndsAt
        : now;
  const nextEndDate = addMonths(baseEndDate, invoice.plan.activeMonths);
  const nextGraceEndDate = addDays(nextEndDate, invoice.plan.gracePeriodDays);

  await prisma.$transaction(
    async (tx) => {
      const invoiceUpdate = await tx.invoice.updateMany({
        where: {
          id: invoice.id,
          tenantId: invoice.tenantId,
          status: InvoiceStatus.PENDING_VERIFICATION,
        },
        data: {
          status: InvoiceStatus.PAID,
          paidAt: now,
        },
      });

      if (invoiceUpdate.count === 0) {
        throw new Error('Invoice sudah diproses oleh admin lain.');
      }

      if (invoice.subscriptionId) {
        await tx.tenantSubscription.updateMany({
          where: {
            id: invoice.subscriptionId,
            tenantId: invoice.tenantId,
          },
          data: {
            planId: invoice.planId,
            status: SubscriptionStatus.ACTIVE,
            billingCycle: invoice.billingCycle,
            currentPeriodStart: now,
            currentPeriodEnd: nextEndDate,
            gracePeriodEndsAt: nextGraceEndDate,
            canceledAt: null,
          },
        });
      } else {
        await tx.tenantSubscription.create({
          data: {
            tenantId: invoice.tenantId,
            planId: invoice.planId,
            status: SubscriptionStatus.ACTIVE,
            billingCycle: invoice.billingCycle,
            currentPeriodStart: now,
            currentPeriodEnd: nextEndDate,
            gracePeriodEndsAt: nextGraceEndDate,
          },
        });
      }

      await tx.tenant.update({
        where: {
          id: invoice.tenantId,
        },
        data: {
          status: TenantStatus.ACTIVE,
          subscriptionEndsAt: nextEndDate,
          gracePeriodEndsAt: nextGraceEndDate,
          limitedAt: null,
          suspendedAt: null,
        },
      });

      await tx.auditLog.create({
        data: {
          tenantId: invoice.tenantId,
          actorId: platformUser.profile.id,
          action: 'CONFIRM_INVOICE_PAYMENT',
          entityType: 'Invoice',
          entityId: invoice.id,
          metadata: {
            invoiceNumber: invoice.invoiceNumber,
            planCode: invoice.plan.code,
            activeMonths: invoice.plan.activeMonths,
            previousPeriodEnd: baseEndDate.toISOString(),
            nextPeriodEnd: nextEndDate.toISOString(),
          },
        },
      });
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  );

  try {
    await enqueueNotification({
      tenantId: invoice.tenantId,
      channel: NotificationChannel.EMAIL,
      eventType: NotificationEventType.TENANT_SUBSCRIPTION_EXPIRING,
      recipient: invoice.tenant.owner.email,
      subject: 'Pembayaran paket berhasil dikonfirmasi',
      message: `Pembayaran invoice ${invoice.invoiceNumber} berhasil dikonfirmasi. Paket ${invoice.plan.name} aktif sampai ${nextEndDate.toLocaleDateString('id-ID')}.`,
      payload: {
        tenantName: invoice.tenant.name,
        invoiceNumber: invoice.invoiceNumber,
        planName: invoice.plan.name,
        subscriptionEndsAt: nextEndDate.toISOString(),
      },
    });
  } catch (notificationError: unknown) {
    console.warn(
      'Gagal enqueue notifikasi konfirmasi pembayaran:',
      notificationError instanceof Error ? notificationError.message : 'Unknown notification queue error'
    );
  }

  revalidatePath('/admin/payments');
  redirectWithSuccess('Pembayaran berhasil dikonfirmasi dan subscription tenant sudah diperpanjang.');
}

export async function rejectPaymentAction(invoiceId: string, formData: FormData) {
  let platformUser;

  try {
    platformUser = await assertSuperAdmin();
  } catch {
    redirectWithError('Halaman ini hanya tersedia untuk super admin Daganta.');
  }

  const reason = String(formData.get('reason') || '').trim();

  const invoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      tenantId: {
        not: '',
      },
    },
    include: {
      tenant: {
        include: {
          owner: true,
        },
      },
    },
  });

  if (!invoice) {
    redirectWithError('Invoice tidak ditemukan.');
  }

  if (invoice.status !== InvoiceStatus.PENDING_VERIFICATION) {
    redirectWithError('Invoice belum berada dalam status menunggu verifikasi.');
  }

  await prisma.$transaction(async (tx) => {
    const invoiceUpdate = await tx.invoice.updateMany({
      where: {
        id: invoice.id,
        tenantId: invoice.tenantId,
        status: InvoiceStatus.PENDING_VERIFICATION,
      },
      data: {
        status: InvoiceStatus.REJECTED,
      },
    });

    if (invoiceUpdate.count === 0) {
      throw new Error('Invoice sudah diproses oleh admin lain.');
    }

    await tx.notificationEvent.create({
      data: {
        tenantId: invoice.tenantId,
        channel: NotificationChannel.INTERNAL,
        type: NotificationEventType.PAYMENT_REJECTED,
        status: NotificationEventStatus.PENDING,
        recipient: invoice.tenant.owner.email,
        subject: 'Bukti pembayaran ditolak',
        message: `Bukti pembayaran untuk invoice ${invoice.invoiceNumber} ditolak. ${reason || 'Silakan unggah bukti pembayaran yang benar.'}`,
        payload: {
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          reason: reason || null,
        },
      },
    });

    await tx.auditLog.create({
      data: {
        tenantId: invoice.tenantId,
        actorId: platformUser.profile.id,
        action: 'REJECT_INVOICE_PAYMENT',
        entityType: 'Invoice',
        entityId: invoice.id,
        metadata: {
          invoiceNumber: invoice.invoiceNumber,
          reason: reason || null,
        },
      },
    });
  });

  revalidatePath('/admin/payments');
  redirectWithSuccess('Bukti pembayaran ditolak dan notifikasi internal sudah dibuat.');
}

import {
  InvoiceStatus,
  OrderStatus,
  PaymentProvider,
  PaymentStatus,
  Prisma,
  SubscriptionStatus,
  TenantStatus,
} from '@prisma/client';
import { addDays, addMonths } from '@/lib/billing/pricing';
import { prisma } from '@/lib/prisma';

export type WebhookProvider = Exclude<PaymentProvider, 'MANUAL'>;
export type WebhookPayload = Record<string, unknown>;

export interface PaymentWebhookEvent {
  provider: WebhookProvider;
  transactionId: string;
  payload: WebhookPayload;
}

export interface PaymentWebhookResult {
  success: boolean;
  targetType?: 'Invoice' | 'Order';
  targetId?: string;
  status?: 'PAID' | 'PENDING' | 'FAILED' | 'IGNORED';
  error?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getStringValue(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function getNestedRecord(payload: WebhookPayload, key: string) {
  const value = payload[key];
  return isRecord(value) ? value : null;
}

function getNestedString(payload: WebhookPayload, parentKey: string, childKey: string) {
  const parent = getNestedRecord(payload, parentKey);
  return parent ? getStringValue(parent[childKey]) : null;
}

function extractTenantId(payload: WebhookPayload) {
  return (
    getStringValue(payload.tenantId) ||
    getStringValue(payload.tenant_id) ||
    getNestedString(payload, 'metadata', 'tenantId') ||
    getNestedString(payload, 'metadata', 'tenant_id') ||
    getNestedString(payload, 'custom_fields', 'tenantId') ||
    getNestedString(payload, 'custom_fields', 'tenant_id')
  );
}

export function extractWebhookTransactionId(provider: WebhookProvider, payload: WebhookPayload) {
  if (provider === PaymentProvider.MIDTRANS) {
    return getStringValue(payload.transaction_id) || getStringValue(payload.order_id);
  }

  if (provider === PaymentProvider.XENDIT) {
    return getStringValue(payload.id) || getStringValue(payload.external_id);
  }

  return getStringValue(payload.reference) || getStringValue(payload.merchant_ref) || getStringValue(payload.tripay_reference);
}

function extractExternalReference(provider: WebhookProvider, payload: WebhookPayload, transactionId: string) {
  if (provider === PaymentProvider.MIDTRANS) {
    return getStringValue(payload.order_id) || transactionId;
  }

  if (provider === PaymentProvider.XENDIT) {
    return getStringValue(payload.external_id) || transactionId;
  }

  return getStringValue(payload.merchant_ref) || getStringValue(payload.reference) || transactionId;
}

function getProviderPaymentStatus(provider: WebhookProvider, payload: WebhookPayload): 'PAID' | 'PENDING' | 'FAILED' | 'IGNORED' {
  const rawStatus =
    getStringValue(payload.transaction_status) ||
    getStringValue(payload.status) ||
    getStringValue(payload.payment_status) ||
    '';
  const status = rawStatus.toUpperCase();

  if (provider === PaymentProvider.MIDTRANS) {
    if (['SETTLEMENT', 'CAPTURE'].includes(status)) return 'PAID';
    if (['PENDING'].includes(status)) return 'PENDING';
    if (['DENY', 'CANCEL', 'EXPIRE', 'FAILURE'].includes(status)) return 'FAILED';
    return 'IGNORED';
  }

  if (provider === PaymentProvider.XENDIT) {
    if (['PAID', 'SETTLED', 'COMPLETED'].includes(status)) return 'PAID';
    if (['PENDING'].includes(status)) return 'PENDING';
    if (['EXPIRED', 'FAILED', 'CANCELED', 'CANCELLED'].includes(status)) return 'FAILED';
    return 'IGNORED';
  }

  if (['PAID'].includes(status)) return 'PAID';
  if (['UNPAID', 'PENDING'].includes(status)) return 'PENDING';
  if (['EXPIRED', 'FAILED', 'REFUND'].includes(status)) return 'FAILED';
  return 'IGNORED';
}

async function markInvoicePaid(tenantId: string, invoiceId: string) {
  const invoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      tenantId,
    },
    include: {
      plan: true,
      subscription: true,
      tenant: true,
    },
  });

  if (!invoice) {
    throw new Error('Invoice tidak ditemukan.');
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
      await tx.invoice.updateMany({
        where: {
          id: invoice.id,
          tenantId,
        },
        data: {
          status: InvoiceStatus.PAID,
          paidAt: invoice.paidAt ?? now,
        },
      });

      if (invoice.subscriptionId) {
        await tx.tenantSubscription.updateMany({
          where: {
            id: invoice.subscriptionId,
            tenantId,
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
            tenantId,
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
          id: tenantId,
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
          tenantId,
          action: 'PAYMENT_WEBHOOK_INVOICE_PAID',
          entityType: 'Invoice',
          entityId: invoice.id,
          metadata: {
            invoiceNumber: invoice.invoiceNumber,
            planCode: invoice.plan.code,
            nextPeriodEnd: nextEndDate.toISOString(),
          },
        },
      });
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  );
}

export async function processPaymentWebhook(
  provider: WebhookProvider,
  event: PaymentWebhookEvent
): Promise<PaymentWebhookResult> {
  const tenantId = extractTenantId(event.payload);

  if (!tenantId) {
    return {
      success: false,
      status: 'FAILED',
      error: 'Payload webhook tidak memiliki tenantId.',
    };
  }

  const externalReference = extractExternalReference(provider, event.payload, event.transactionId);
  const paymentStatus = getProviderPaymentStatus(provider, event.payload);

  if (paymentStatus === 'IGNORED') {
    return {
      success: true,
      status: 'IGNORED',
    };
  }

  const invoice = await prisma.invoice.findFirst({
    where: {
      tenantId,
      OR: [
        {
          id: externalReference,
        },
        {
          invoiceNumber: externalReference,
        },
      ],
    },
    select: {
      id: true,
    },
  });

  if (invoice) {
    if (paymentStatus === 'PAID') {
      await markInvoicePaid(tenantId, invoice.id);
    } else {
      await prisma.invoice.updateMany({
        where: {
          id: invoice.id,
          tenantId,
        },
        data: {
          status: paymentStatus === 'FAILED' ? InvoiceStatus.REJECTED : InvoiceStatus.UNPAID,
        },
      });
    }

    return {
      success: true,
      targetType: 'Invoice',
      targetId: invoice.id,
      status: paymentStatus,
    };
  }

  const order = await prisma.order.findFirst({
    where: {
      tenantId,
      OR: [
        {
          id: externalReference,
        },
        {
          orderNumber: externalReference,
        },
      ],
    },
    include: {
      payment: true,
    },
  });

  if (!order) {
    return {
      success: false,
      status: 'FAILED',
      error: 'Invoice atau order tidak ditemukan untuk tenant ini.',
    };
  }

  if (paymentStatus === 'PAID') {
    await prisma.$transaction(async (tx) => {
      await tx.orderPayment.updateMany({
        where: {
          tenantId,
          orderId: order.id,
        },
        data: {
          provider,
          status: PaymentStatus.VERIFIED,
          verifiedAt: new Date(),
          rejectedAt: null,
        },
      });

      await tx.order.updateMany({
        where: {
          id: order.id,
          tenantId,
        },
        data: {
          status: OrderStatus.PAID,
        },
      });
    });
  } else if (paymentStatus === 'FAILED') {
    await prisma.$transaction(async (tx) => {
      await tx.orderPayment.updateMany({
        where: {
          tenantId,
          orderId: order.id,
        },
        data: {
          provider,
          status: PaymentStatus.REJECTED,
          rejectedAt: new Date(),
        },
      });

      await tx.order.updateMany({
        where: {
          id: order.id,
          tenantId,
        },
        data: {
          status: OrderStatus.CANCELED,
        },
      });
    });
  } else {
    await prisma.orderPayment.updateMany({
      where: {
        tenantId,
        orderId: order.id,
      },
      data: {
        provider,
        status: PaymentStatus.WAITING_PAYMENT,
      },
    });
  }

  return {
    success: true,
    targetType: 'Order',
    targetId: order.id,
    status: paymentStatus,
  };
}

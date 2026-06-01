'use server';

import { revalidatePath } from 'next/cache';
import { BillingCycle, InvoiceStatus, SubscriptionStatus, TenantStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getActiveTenantContext } from '@/lib/auth/tenant-access';
import { canManageBillingManually, canUseBillingPaymentSimulation } from '@/lib/billing/access';
import { addDays, addMonths } from '@/lib/billing/pricing';

function buildInvoiceNumber(tenantSlug: string) {
  const dateCode = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(new Date())
    .replaceAll('-', '');

  return `INV-${tenantSlug.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10)}-${dateCode}-${Date.now()
    .toString()
    .slice(-6)}`;
}

async function getBillingTenantContext() {
  const tenantCtx = await getActiveTenantContext();

  if (tenantCtx.status !== 'SUCCESS' || !tenantCtx.activeTenant || !tenantCtx.userProfile) {
    throw new Error('Akses billing tidak tersedia.');
  }

  return tenantCtx;
}

export async function createManualInvoiceAction(formData: FormData) {
  const tenantCtx = await getBillingTenantContext();

  if (!canManageBillingManually(tenantCtx)) {
    throw new Error('Hanya pemilik toko atau admin Daganta yang dapat membuat tagihan manual.');
  }

  const activeTenant = tenantCtx.activeTenant!;
  const userProfile = tenantCtx.userProfile!;
  const planCode = String(formData.get('planCode') || '');
  const plan = await prisma.subscriptionPlan.findFirst({
    where: {
      code: planCode,
      isActive: true,
    },
  });

  if (!plan) {
    throw new Error('Paket tidak tersedia.');
  }

  const tenantId = activeTenant.id;
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    let subscription = await tx.tenantSubscription.findFirst({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });

    if (!subscription) {
      const trialEndsAt = addDays(now, plan.trialDays);
      const gracePeriodEndsAt = addDays(trialEndsAt, plan.gracePeriodDays);

      subscription = await tx.tenantSubscription.create({
        data: {
          tenantId,
          planId: plan.id,
          status: SubscriptionStatus.TRIAL,
          billingCycle: plan.billingCycle,
          trialStartsAt: now,
          trialEndsAt,
          currentPeriodStart: now,
          currentPeriodEnd: trialEndsAt,
          gracePeriodEndsAt,
        },
      });

      await tx.tenant.update({
        where: { id: tenantId },
        data: {
          status: TenantStatus.ACTIVE,
          trialEndsAt,
          subscriptionEndsAt: trialEndsAt,
          gracePeriodEndsAt,
        },
      });

      await tx.auditLog.create({
        data: {
          tenantId,
          actorId: userProfile.id,
          action: 'BILLING_TRIAL_CREATED',
          entityType: 'TenantSubscription',
          entityId: subscription.id,
          metadata: {
            source: 'manual_invoice_creation',
            planCode: plan.code,
            trialDays: plan.trialDays,
          },
        },
      });
    }

    const currentPeriodEnd = subscription.currentPeriodEnd;
    const periodStart = currentPeriodEnd && currentPeriodEnd > now ? currentPeriodEnd : now;
    const periodEnd = addMonths(periodStart, plan.activeMonths);

    const invoice = await tx.invoice.create({
      data: {
        tenantId,
        subscriptionId: subscription.id,
        invoiceNumber: buildInvoiceNumber(activeTenant.slug),
        status: InvoiceStatus.UNPAID,
        billingCycle: plan.billingCycle,
        amount: plan.price,
        currency: plan.currency,
        productLimitSnapshot: plan.productLimit,
        periodStart,
        periodEnd,
        dueAt: addDays(now, plan.gracePeriodDays),
        paymentInstructions: null,
      },
    });

    await tx.auditLog.create({
      data: {
        tenantId,
        actorId: userProfile.id,
        action: 'BILLING_INVOICE_CREATED',
        entityType: 'Invoice',
        entityId: invoice.id,
        metadata: {
          invoiceNumber: invoice.invoiceNumber,
          planCode: plan.code,
          billingCycle: plan.billingCycle,
          amount: plan.price.toString(),
          source: 'manual',
        },
      },
    });
  });

  revalidatePath('/dashboard/billing');
}

export async function simulateInvoicePaymentAction(formData: FormData) {
  const tenantCtx = await getBillingTenantContext();

  if (!canUseBillingPaymentSimulation(tenantCtx)) {
    throw new Error('Simulasi pembayaran hanya tersedia untuk dev, demo, atau admin Daganta.');
  }

  const activeTenant = tenantCtx.activeTenant!;
  const userProfile = tenantCtx.userProfile!;
  const invoiceId = String(formData.get('invoiceId') || '');
  const tenantId = activeTenant.id;
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.findFirst({
      where: {
        id: invoiceId,
        tenantId,
        status: InvoiceStatus.UNPAID,
      },
      include: {
        subscription: true,
      },
    });

    if (!invoice || !invoice.subscriptionId || !invoice.subscription) {
      throw new Error('Tagihan belum dibayar tidak ditemukan untuk toko ini.');
    }

    const plan = await tx.subscriptionPlan.findUniqueOrThrow({
      where: { id: invoice.subscription.planId },
    });
    const periodStart = invoice.periodStart || now;
    const periodEnd = invoice.periodEnd || addMonths(periodStart, plan.activeMonths);
    const gracePeriodEndsAt = addDays(periodEnd, plan.gracePeriodDays);

    await tx.invoice.update({
      where: { id: invoice.id },
      data: {
        status: InvoiceStatus.PAID,
        paidAt: now,
      },
    });

    await tx.tenantSubscription.update({
      where: { id: invoice.subscriptionId },
      data: {
        planId: plan.id,
        status: SubscriptionStatus.ACTIVE,
        billingCycle: invoice.billingCycle || BillingCycle.MONTHLY,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        gracePeriodEndsAt,
      },
    });

    await tx.tenant.update({
      where: { id: tenantId },
      data: {
        status: TenantStatus.ACTIVE,
        subscriptionEndsAt: periodEnd,
        gracePeriodEndsAt,
        limitedAt: null,
        suspendedAt: null,
      },
    });

    await tx.auditLog.create({
      data: {
        tenantId,
        actorId: userProfile.id,
        action: 'BILLING_PAYMENT_SIMULATED',
        entityType: 'Invoice',
        entityId: invoice.id,
        metadata: {
          invoiceNumber: invoice.invoiceNumber,
          subscriptionId: invoice.subscriptionId,
          amount: invoice.amount.toString(),
          allowedFlow: canUseBillingPaymentSimulation(tenantCtx) ? 'dev_demo_or_internal' : 'blocked',
        },
      },
    });
  });

  revalidatePath('/dashboard/billing');
}

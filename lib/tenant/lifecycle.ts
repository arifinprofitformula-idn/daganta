import { TenantStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';

const EXPIRING_SOON_DAYS = 14;
const LIMITED_TO_SUSPENDED_DAYS = 30;
const DEFAULT_GRACE_PERIOD_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

export interface TenantLifecycleResult {
  tenantId: string;
  previousStatus: TenantStatus;
  nextStatus: TenantStatus;
  changed: boolean;
  subscriptionEndsAt: Date | null;
  gracePeriodEndsAt: Date | null;
  limitedAt: Date | null;
  suspendedAt: Date | null;
}

export interface TenantRestrictions {
  canAddProducts: boolean;
  canEditProducts: boolean;
  canReceiveOrders: boolean;
  storefrontActive: boolean;
  dashboardReadOnly: boolean;
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function diffDays(from: Date, to: Date) {
  return Math.ceil((to.getTime() - from.getTime()) / DAY_MS);
}

/**
 * Updates a tenant lifecycle status using only tenant-scoped data selected by tenantId.
 */
export async function checkAndUpdateTenantStatus(
  tenantId: string,
  now: Date = new Date()
): Promise<TenantLifecycleResult> {
  const tenant = await prisma.tenant.findUnique({
    where: {
      id: tenantId,
    },
    include: {
      subscriptions: {
        include: {
          plan: {
            select: {
              gracePeriodDays: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
      },
    },
  });

  if (!tenant) {
    throw new Error('Tenant tidak ditemukan.');
  }

  const currentStatus = tenant.status;
  const latestSubscription = tenant.subscriptions[0] ?? null;
  const gracePeriodDays = latestSubscription?.plan.gracePeriodDays ?? DEFAULT_GRACE_PERIOD_DAYS;
  const subscriptionEndsAt = tenant.subscriptionEndsAt;

  if (currentStatus === TenantStatus.ARCHIVED || currentStatus === TenantStatus.SUSPENDED) {
    return {
      tenantId,
      previousStatus: currentStatus,
      nextStatus: currentStatus,
      changed: false,
      subscriptionEndsAt,
      gracePeriodEndsAt: tenant.gracePeriodEndsAt,
      limitedAt: tenant.limitedAt,
      suspendedAt: tenant.suspendedAt,
    };
  }

  if (!subscriptionEndsAt) {
    return {
      tenantId,
      previousStatus: currentStatus,
      nextStatus: currentStatus,
      changed: false,
      subscriptionEndsAt,
      gracePeriodEndsAt: tenant.gracePeriodEndsAt,
      limitedAt: tenant.limitedAt,
      suspendedAt: tenant.suspendedAt,
    };
  }

  let nextStatus: TenantStatus = currentStatus;
  let gracePeriodEndsAt = tenant.gracePeriodEndsAt;
  let limitedAt = tenant.limitedAt;
  let suspendedAt = tenant.suspendedAt;

  if (subscriptionEndsAt > now) {
    nextStatus =
      diffDays(now, subscriptionEndsAt) < EXPIRING_SOON_DAYS
        ? TenantStatus.EXPIRING_SOON
        : TenantStatus.ACTIVE;
    gracePeriodEndsAt = null;
    limitedAt = null;
    suspendedAt = null;
  } else {
    gracePeriodEndsAt = gracePeriodEndsAt ?? addDays(subscriptionEndsAt, gracePeriodDays);

    if (now <= gracePeriodEndsAt) {
      nextStatus = TenantStatus.GRACE_PERIOD;
      limitedAt = null;
      suspendedAt = null;
    } else {
      const effectiveLimitedAt = limitedAt ?? now;
      const limitedAgeDays = diffDays(effectiveLimitedAt, now);

      if (currentStatus === TenantStatus.LIMITED && limitedAgeDays > LIMITED_TO_SUSPENDED_DAYS) {
        nextStatus = TenantStatus.SUSPENDED;
        limitedAt = effectiveLimitedAt;
        suspendedAt = suspendedAt ?? now;
      } else {
        nextStatus = TenantStatus.LIMITED;
        limitedAt = effectiveLimitedAt;
        suspendedAt = null;
      }
    }
  }

  const shouldUpdate =
    nextStatus !== currentStatus ||
    gracePeriodEndsAt?.getTime() !== tenant.gracePeriodEndsAt?.getTime() ||
    limitedAt?.getTime() !== tenant.limitedAt?.getTime() ||
    suspendedAt?.getTime() !== tenant.suspendedAt?.getTime();

  if (shouldUpdate) {
    await prisma.tenant.update({
      where: {
        id: tenantId,
      },
      data: {
        status: nextStatus,
        gracePeriodEndsAt,
        limitedAt,
        suspendedAt,
      },
    });
  }

  return {
    tenantId,
    previousStatus: currentStatus,
    nextStatus,
    changed: shouldUpdate,
    subscriptionEndsAt,
    gracePeriodEndsAt,
    limitedAt,
    suspendedAt,
  };
}

export function getTenantRestrictions(tenantStatus: TenantStatus | string): TenantRestrictions {
  switch (tenantStatus) {
    case TenantStatus.ACTIVE:
    case TenantStatus.EXPIRING_SOON:
      return {
        canAddProducts: true,
        canEditProducts: true,
        canReceiveOrders: true,
        storefrontActive: true,
        dashboardReadOnly: false,
      };
    case TenantStatus.GRACE_PERIOD:
      return {
        canAddProducts: true,
        canEditProducts: true,
        canReceiveOrders: false,
        storefrontActive: true,
        dashboardReadOnly: false,
      };
    case TenantStatus.LIMITED:
      return {
        canAddProducts: false,
        canEditProducts: false,
        canReceiveOrders: false,
        storefrontActive: true,
        dashboardReadOnly: true,
      };
    case TenantStatus.SUSPENDED:
    case TenantStatus.ARCHIVED:
    default:
      return {
        canAddProducts: false,
        canEditProducts: false,
        canReceiveOrders: false,
        storefrontActive: false,
        dashboardReadOnly: true,
      };
  }
}

import { SubscriptionStatus } from '@prisma/client';
import { prisma } from '../prisma';

/**
 * Calculates the dynamic effective subscription status based on the database subscription record.
 * This function is completely side-effect free and does not write to the database.
 */
export function resolveEffectiveSubscription(
  sub: {
    status: SubscriptionStatus;
    trialEndsAt: Date | null;
    currentPeriodEnd: Date | null;
    gracePeriodEndsAt: Date | null;
  } | null,
  now: Date = new Date()
): SubscriptionStatus {
  if (!sub) {
    return 'SUSPENDED'; // Fallback if no subscription exists
  }

  const { status, trialEndsAt, currentPeriodEnd, gracePeriodEndsAt } = sub;

  // DB Terminal states/explicit overrides take immediate precedence
  if (status === 'CANCELED') return 'CANCELED';
  if (status === 'SUSPENDED') return 'SUSPENDED';
  if (status === 'LIMITED_MODE') return 'LIMITED_MODE';

  // For TRIAL status
  if (status === 'TRIAL') {
    if (trialEndsAt && now > trialEndsAt) {
      if (gracePeriodEndsAt && now <= gracePeriodEndsAt) {
        return 'GRACE_PERIOD';
      }
      return 'LIMITED_MODE';
    }
    
    // Check if within 3 days warning window of trialEndsAt
    const warningWindowMs = 3 * 24 * 60 * 60 * 1000;
    if (trialEndsAt && (trialEndsAt.getTime() - now.getTime()) <= warningWindowMs) {
      return 'EXPIRING_SOON';
    }
    
    return 'TRIAL';
  }

  // For ACTIVE, EXPIRING_SOON, GRACE_PERIOD
  if (currentPeriodEnd && now > currentPeriodEnd) {
    if (gracePeriodEndsAt && now <= gracePeriodEndsAt) {
      return 'GRACE_PERIOD';
    }
    return 'LIMITED_MODE';
  }

  // Soft warning window: check if within 3 days of expiration
  const warningWindowMs = 3 * 24 * 60 * 60 * 1000; // 3 days
  
  if (currentPeriodEnd && (currentPeriodEnd.getTime() - now.getTime()) <= warningWindowMs) {
    return 'EXPIRING_SOON';
  }

  if (status === 'EXPIRING_SOON') {
    return 'EXPIRING_SOON';
  }

  if (status === 'GRACE_PERIOD') {
    if (gracePeriodEndsAt && now > gracePeriodEndsAt) {
      return 'LIMITED_MODE';
    }
    return 'GRACE_PERIOD';
  }

  return 'ACTIVE';
}

export interface SubscriptionAccessPolicy {
  effectiveStatus: SubscriptionStatus;
  canViewStorefront: boolean;
  canCheckout: boolean;
  canCreateProduct: boolean;
  canManageOrders: boolean;
  canAccessBilling: boolean;
  shouldShowWarning: boolean;
  warningTitle: string | null;
  warningMessage: string | null;
}

/**
 * Returns access permissions and warning notices for each subscription status.
 */
export function getSubscriptionAccessPolicy(effectiveStatus: SubscriptionStatus): SubscriptionAccessPolicy {
  const policy: Omit<SubscriptionAccessPolicy, 'effectiveStatus'> = {
    canViewStorefront: true,
    canCheckout: true,
    canCreateProduct: true,
    canManageOrders: true,
    canAccessBilling: true,
    shouldShowWarning: false,
    warningTitle: null,
    warningMessage: null,
  };

  switch (effectiveStatus) {
    case 'TRIAL':
      break;
    case 'ACTIVE':
      break;
    case 'EXPIRING_SOON':
      policy.shouldShowWarning = true;
      policy.warningTitle = 'Masa aktif toko hampir habis';
      policy.warningMessage = 'Masa aktif toko Anda akan segera habis. Silakan perpanjang paket Anda agar toko tetap aktif sepenuhnya.';
      break;
    case 'GRACE_PERIOD':
      policy.shouldShowWarning = true;
      policy.warningTitle = 'Toko sedang dalam masa tenggang';
      policy.warningMessage = 'Masa aktif toko Anda telah habis. Toko berada dalam masa tenggang. Silakan perpanjang paket segera sebelum checkout dibatasi.';
      break;
    case 'LIMITED_MODE':
      policy.canCheckout = false;
      policy.canCreateProduct = false;
      policy.shouldShowWarning = true;
      policy.warningTitle = 'Checkout sementara dibatasi';
      policy.warningMessage = 'Masa aktif dan masa tenggang toko telah habis. Checkout dan pembuatan produk baru sementara dibatasi. Perpanjang paket sekarang untuk mengaktifkan kembali.';
      break;
    case 'SUSPENDED':
      policy.canViewStorefront = false;
      policy.canCheckout = false;
      policy.canCreateProduct = false;
      policy.shouldShowWarning = true;
      policy.warningTitle = 'Toko sementara belum aktif';
      policy.warningMessage = 'Toko Anda ditangguhkan oleh sistem. Pembeli tidak dapat melihat etalase Anda. Silakan perpanjang paket Anda atau hubungi admin.';
      break;
    case 'CANCELED':
      policy.canViewStorefront = false;
      policy.canCheckout = false;
      policy.canCreateProduct = false;
      policy.shouldShowWarning = true;
      policy.warningTitle = 'Toko dinonaktifkan';
      policy.warningMessage = 'Layanan toko Anda telah dibatalkan. Pembeli tidak dapat melihat etalase Anda. Silakan hubungi admin atau aktifkan kembali paket Anda.';
      break;
  }

  return {
    effectiveStatus,
    ...policy,
  };
}

/**
 * Helper to fetch the latest subscription and compute its access policy dynamically.
 */
export async function getTenantSubscriptionPolicy(tenantId: string, now: Date = new Date()): Promise<SubscriptionAccessPolicy> {
  const sub = await prisma.tenantSubscription.findFirst({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
  });

  const effectiveStatus = resolveEffectiveSubscription(sub, now);
  return getSubscriptionAccessPolicy(effectiveStatus);
}

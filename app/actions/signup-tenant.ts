'use server';

import { prisma } from '../../lib/prisma';
import { setActiveTenantCookie } from '../../lib/auth/dashboard-tenant-cookie';
import { getAuthAdapter } from '@/lib/platform/auth';
import { 
  UserRole, 
  TenantStatus, 
  SubscriptionStatus, 
  BillingCycle 
} from '@prisma/client';

export interface SignupResult {
  success: boolean;
  error?: string;
  sessionCreated?: boolean;
}

const RESERVED_SLUGS = new Set([
  'admin', 'app', 'api', 'www', 'dashboard', 'login', 'signup',
  'billing', 'checkout', 'cart', 'track', 'pricing', 'faq',
  'help', 'support', 'root', 'me', 'account', 'settings',
  'superadmin', 'daganta'
]);

const PLAN_MAPPING: Record<string, string> = {
  starter: 'STARTER_MONTHLY',
  growth: 'GROWTH_MONTHLY',
  pro: 'PRO_MONTHLY'
};

export async function signupTenantAction(formData: FormData): Promise<SignupResult> {
  try {
    // 1. Capture fields
    const ownerName = (formData.get('ownerName') as string || '').trim();
    const email = (formData.get('email') as string || '').trim().toLowerCase();
    const whatsappRaw = (formData.get('whatsapp') as string || '').trim();
    const password = formData.get('password') as string || '';
    const storeName = (formData.get('storeName') as string || '').trim();
    const tenantSlug = (formData.get('tenantSlug') as string || '').trim().toLowerCase();
    const selectedPlanSlug = (formData.get('plan') as string || 'starter').trim().toLowerCase();

    // 2. Validate all inputs before invoking Supabase Auth
    if (!ownerName || !email || !whatsappRaw || !password || !storeName || !tenantSlug) {
      return { success: false, error: 'Semua kolom wajib diisi.' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Kata sandi minimal terdiri dari 6 karakter.' };
    }

    // Email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, error: 'Format alamat email tidak valid.' };
    }

    // Normalize WhatsApp phone
    const whatsapp = whatsappRaw.replace(/[^0-9]/g, '');
    if (whatsapp.length < 10 || whatsapp.length > 15) {
      return { success: false, error: 'Nomor WhatsApp tidak valid. Masukkan minimal 10 digit angka.' };
    }

    // Validate plan
    const planCode = PLAN_MAPPING[selectedPlanSlug] || 'STARTER_MONTHLY';
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { code: planCode }
    });
    if (!plan) {
      return { success: false, error: 'Paket langganan pilihan tidak ditemukan di sistem.' };
    }

    // Validate Email Uniqueness in UserProfile
    const existingUser = await prisma.userProfile.findUnique({
      where: { email }
    });
    if (existingUser) {
      return { success: false, error: 'Email sudah terdaftar. Silakan gunakan email lain atau masuk ke akun Anda.' };
    }

    // Validate Subdomain Slug Format
    // - Lowercase, letters, numbers, hyphen only
    // - Min 3, Max 32 chars
    // - Cannot start or end with hyphen
    // - No double hyphens
    if (tenantSlug.length < 3) {
      return { success: false, error: 'Alamat toko minimal terdiri dari 3 karakter.' };
    }
    if (tenantSlug.length > 32) {
      return { success: false, error: 'Alamat toko maksimal terdiri dari 32 karakter.' };
    }
    if (!/^[a-z0-9-]+$/.test(tenantSlug)) {
      return { success: false, error: 'Alamat toko hanya boleh terdiri dari huruf kecil, angka, dan tanda hubung (-).' };
    }
    if (tenantSlug.startsWith('-') || tenantSlug.endsWith('-')) {
      return { success: false, error: 'Alamat toko tidak boleh diawali atau diakhiri dengan tanda hubung (-).' };
    }
    if (tenantSlug.includes('--')) {
      return { success: false, error: 'Alamat toko tidak boleh menggunakan tanda hubung ganda (--).' };
    }

    // Validate Reserved Slugs
    if (RESERVED_SLUGS.has(tenantSlug)) {
      return { success: false, error: 'Alamat toko ini dilindungi sistem. Silakan pilih alamat lain.' };
    }

    // Validate Tenant Slug Uniqueness
    const existingTenant = await prisma.tenant.findFirst({
      where: {
        OR: [
          { slug: tenantSlug },
          { subdomain: tenantSlug }
        ]
      }
    });
    if (existingTenant) {
      return { success: false, error: 'Nama alamat toko sudah digunakan. Silakan pilih nama lain.' };
    }

    // 3. Invoke configured auth provider signUp
    const auth = await getAuthAdapter();
    const signUpResult = await auth.signupAuthUser({
      email,
      password,
      name: ownerName,
      phone: whatsapp,
    });

    if (!signUpResult.success || !signUpResult.authUser) {
      return { success: false, error: signUpResult.error || 'Gagal mendaftarkan akun di server keamanan.' };
    }

    const authUser = signUpResult.authUser;

    // 4. Create UserProfile, Tenant, TenantMember OWNER, TenantSubscription TRIAL in one transaction
    try {
      const now = new Date();
      const trialEndsAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 Days free trial
      const gracePeriodEndsAt = new Date(trialEndsAt.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 Days grace period

      const result = await prisma.$transaction(async (tx) => {
        // Create User Profile
        const userProfile = await tx.userProfile.create({
          data: {
            email,
            name: ownerName,
            authUserId: authUser.id
          }
        });

        // Create Tenant
        const tenant = await tx.tenant.create({
          data: {
            name: storeName,
            slug: tenantSlug,
            subdomain: tenantSlug,
            ownerId: userProfile.id,
            status: TenantStatus.ACTIVE,
            trialEndsAt,
            subscriptionEndsAt: trialEndsAt,
            gracePeriodEndsAt,
          }
        });

        // Create TenantMember as OWNER
        const tenantMember = await tx.tenantMember.create({
          data: {
            tenantId: tenant.id,
            userId: userProfile.id,
            role: UserRole.TENANT_OWNER
          }
        });

        // Create Trial TenantSubscription
        const tenantSubscription = await tx.tenantSubscription.create({
          data: {
            tenantId: tenant.id,
            planId: plan.id,
            status: SubscriptionStatus.TRIAL,
            billingCycle: BillingCycle.MONTHLY,
            trialStartsAt: now,
            trialEndsAt,
            currentPeriodStart: now,
            currentPeriodEnd: trialEndsAt,
            gracePeriodEndsAt,
          }
        });

        // Create Audit Log
        await tx.auditLog.create({
          data: {
            tenantId: tenant.id,
            actorId: userProfile.id,
            action: 'SIGNUP_TENANT_CREATED',
            entityType: 'Tenant',
            entityId: tenant.id,
            metadata: {
              planCode: plan.code,
              trialDays: 14,
              gracePeriodDays: 7,
              stage: 'v0.3F'
            }
          }
        });

        return { tenantId: tenant.id };
      });

      // 5. Evaluate active session state immediately
      const sessionCreated = signUpResult.sessionCreated;

      if (sessionCreated) {
        // Set the active tenant cookie for the dashboard
        await setActiveTenantCookie(result.tenantId);
      }

      return {
        success: true,
        sessionCreated,
      };
    } catch (dbErr: any) {
      console.error('Database transaction failed during signup:', dbErr);
      
      // TODO: Implement provider-specific orphan cleanup for external auth users in a future phase.

      return {
        success: false,
        error: 'Terjadi kesalahan sistem saat menyimpan data toko Anda. Silakan hubungi admin Daganta.',
      };
    }
  } catch (err: any) {
    console.error('Tenant signup general error:', err);
    return {
      success: false,
      error: 'Terjadi kesalahan sistem yang tidak terduga. Silakan coba beberapa saat lagi.',
    };
  }
}

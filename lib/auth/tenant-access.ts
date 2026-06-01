import { prisma } from '@/lib/prisma';
import { getCurrentUserProfile } from './session';
import { getActiveTenantCookie, clearActiveTenantCookie } from './dashboard-tenant-cookie';

export interface SafeTenantInfo {
  id: string;
  name: string;
  slug: string;
  subdomain: string;
  status: string;
}

export interface TenantContext {
  status: 'SUCCESS' | 'NO_PROFILE' | 'NO_MEMBERSHIP';
  user: any;
  userProfile: {
    id: string;
    email: string;
    name: string | null;
    authUserId: string | null;
  } | null;
  activeTenant: SafeTenantInfo | null;
  activeMembership: {
    id: string;
    tenantId: string;
    userId: string;
    role: string;
  } | null;
  availableTenants: SafeTenantInfo[] | null;
}

export async function getActiveTenantContext(): Promise<TenantContext> {
  // 1. Dapatkan status sesi pengguna aktif beserta profil
  const authData = await getCurrentUserProfile();
  
  if (!authData || !authData.user) {
    return {
      status: 'NO_PROFILE',
      user: null,
      userProfile: null,
      activeTenant: null,
      activeMembership: null,
      availableTenants: null
    };
  }

  const user = authData.user;

  if (!authData.profile) {
    return {
      status: 'NO_PROFILE',
      user,
      userProfile: null,
      activeTenant: null,
      activeMembership: null,
      availableTenants: null
    };
  }

  const userProfile = authData.profile;

  // 2. Ambil daftar keanggotaan TenantMember milik pengguna dengan saringan field aman
  const memberships = await prisma.tenantMember.findMany({
    where: { userId: userProfile.id },
    include: {
      tenant: {
        select: {
          id: true,
          name: true,
          slug: true,
          subdomain: true,
          status: true
        }
      }
    }
  });

  if (memberships.length === 0) {
    return {
      status: 'NO_MEMBERSHIP',
      user,
      userProfile,
      activeTenant: null,
      activeMembership: null,
      availableTenants: null
    };
  }

  // Filter daftar toko aman (hanya data dasar bebas metadata sensitif)
  const availableTenants: SafeTenantInfo[] = memberships.map(m => ({
    id: m.tenant.id,
    name: m.tenant.name,
    slug: m.tenant.slug,
    subdomain: m.tenant.subdomain,
    status: m.tenant.status
  }));

  // 3. Baca preferensi dari cookie active tenant
  const activeTenantCookieId = await getActiveTenantCookie();

  let activeMembership = null;

  if (activeTenantCookieId) {
    // Cari apakah tenantId pada cookie ada dalam daftar keanggotaan sah milik user
    activeMembership = memberships.find(m => m.tenantId === activeTenantCookieId) || null;
    
    // Jika tidak valid (manipulasi cookie, palsu, atau milik user lain), bersihkan cookie
    if (!activeMembership) {
      await clearActiveTenantCookie();
    }
  }

  // 4. Mekanisme Fallback Otomatis: Jika cookie tidak ada atau tidak valid, pilih membership pertama
  if (!activeMembership) {
    activeMembership = memberships[0];
  }

  const activeTenant: SafeTenantInfo = {
    id: activeMembership.tenant.id,
    name: activeMembership.tenant.name,
    slug: activeMembership.tenant.slug,
    subdomain: activeMembership.tenant.subdomain,
    status: activeMembership.tenant.status
  };

  return {
    status: 'SUCCESS',
    user,
    userProfile,
    activeTenant,
    activeMembership: {
      id: activeMembership.id,
      tenantId: activeMembership.tenantId,
      userId: activeMembership.userId,
      role: activeMembership.role
    },
    availableTenants
  };
}

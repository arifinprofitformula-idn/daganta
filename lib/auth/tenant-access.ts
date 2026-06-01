import { prisma } from '@/lib/prisma';
import { getCurrentUserProfile } from './session';

export interface TenantContext {
  status: 'SUCCESS' | 'NO_PROFILE' | 'NO_MEMBERSHIP';
  user: any;
  userProfile: {
    id: string;
    email: string;
    name: string | null;
    authUserId: string | null;
  } | null;
  activeTenant: {
    id: string;
    name: string;
    slug: string;
    subdomain: string;
  } | null;
  activeMembership: {
    id: string;
    tenantId: string;
    userId: string;
    role: string;
  } | null;
}

export async function getActiveTenantContext(): Promise<TenantContext> {
  const authData = await getCurrentUserProfile();
  
  if (!authData || !authData.user) {
    return {
      status: 'NO_PROFILE',
      user: null,
      userProfile: null,
      activeTenant: null,
      activeMembership: null
    };
  }

  const user = authData.user;

  if (!authData.profile) {
    return {
      status: 'NO_PROFILE',
      user,
      userProfile: null,
      activeTenant: null,
      activeMembership: null
    };
  }

  const userProfile = authData.profile;

  // Cari TenantMember berdasarkan UserProfile.id
  const memberships = await prisma.tenantMember.findMany({
    where: { userId: userProfile.id },
    include: {
      tenant: {
        select: {
          id: true,
          name: true,
          slug: true,
          subdomain: true,
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
      activeMembership: null
    };
  }

  // Pilih membership pertama sebagai default aktif untuk v0.1I
  // Catatan pengembangan: Pemindah toko (tenant switcher) ditunda ke fase berikutnya.
  const activeMembership = memberships[0];

  return {
    status: 'SUCCESS',
    user,
    userProfile,
    activeTenant: activeMembership.tenant,
    activeMembership: {
      id: activeMembership.id,
      tenantId: activeMembership.tenantId,
      userId: activeMembership.userId,
      role: activeMembership.role
    }
  };
}

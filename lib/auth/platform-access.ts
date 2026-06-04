import { PlatformRole } from '@prisma/client';
import { getCurrentUserProfile } from './session';

export async function getCurrentPlatformUser() {
  const authData = await getCurrentUserProfile();

  if (!authData?.user || !authData.profile) {
    return null;
  }

  return {
    user: authData.user,
    profile: {
      id: authData.profile.id,
      email: authData.profile.email,
      name: authData.profile.name,
      authUserId: authData.profile.authUserId,
      platformRole: authData.profile.platformRole,
    },
  };
}

export async function assertSuperAdmin() {
  const platformUser = await getCurrentPlatformUser();

  if (!platformUser || platformUser.profile.platformRole !== PlatformRole.SUPER_ADMIN) {
    throw new Error('Akses hanya tersedia untuk super admin Daganta.');
  }

  return platformUser;
}

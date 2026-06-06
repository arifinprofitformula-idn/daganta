import type { PlatformRole } from '@prisma/client';
import { getAuthAdapter } from '@/lib/platform/auth';

export async function getCurrentUser() {
  const auth = await getAuthAdapter();
  return auth.getCurrentUser();
}

export interface UserAuthProfile {
  user: any;
  profile: {
    id: string;
    email: string;
    name: string | null;
    authUserId: string | null;
    platformRole: PlatformRole;
  } | null;
  hasProfile: boolean;
}

export async function getCurrentUserProfile(): Promise<UserAuthProfile | null> {
  const auth = await getAuthAdapter();
  return auth.getCurrentUserProfile();
}

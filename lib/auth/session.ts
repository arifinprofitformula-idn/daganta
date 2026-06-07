import type { PlatformRole } from '@prisma/client';
import { getAuthAdapter } from '@/lib/platform/auth';

export async function getCurrentUser() {
  const auth = await getAuthAdapter();
  return auth.getCurrentUser();
}

function isRecoverablePrismaBootstrapError(error: unknown) {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? (error as { code?: string }).code
      : null;

  return code === 'P1017' || code === 'P2021';
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

  try {
    return await auth.getCurrentUserProfile();
  } catch (error) {
    if (isRecoverablePrismaBootstrapError(error)) {
      return null;
    }

    throw error;
  }
}

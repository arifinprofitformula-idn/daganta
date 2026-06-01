import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function getCurrentUser() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return null;
    }
    return user;
  } catch {
    return null;
  }
}

export interface UserAuthProfile {
  user: any;
  profile: {
    id: string;
    email: string;
    name: string | null;
    authUserId: string | null;
  } | null;
  hasProfile: boolean;
}

export async function getCurrentUserProfile(): Promise<UserAuthProfile | null> {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  // 1. Primary check: Cari UserProfile berdasarkan authUserId = user.id
  let profile = await prisma.userProfile.findUnique({
    where: { authUserId: user.id }
  });

  // 2. Development Fallback: Jika tidak ketemu, cari berdasarkan email user
  if (!profile && user.email) {
    profile = await prisma.userProfile.findUnique({
      where: { email: user.email }
    });
  }

  return {
    user,
    profile,
    hasProfile: !!profile
  };
}

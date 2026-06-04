import { prisma } from '@/lib/prisma';
import type { PlatformRole } from '@prisma/client';
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
    platformRole: PlatformRole;
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

  // 2. Safe Auto-Link Fallback: Jika tidak ketemu, cocokkan email jika authUserId null
  if (!profile && user.email) {
    // Jalankan updateMany yang aman guna menjamin tidak pernah menimpa authUserId yang sudah terisi
    await prisma.userProfile.updateMany({
      where: {
        email: user.email,
        authUserId: null
      },
      data: {
        authUserId: user.id
      }
    });

    // Ambil ulang UserProfile berdasarkan authUserId hasil update
    profile = await prisma.userProfile.findUnique({
      where: { authUserId: user.id }
    });
  }

  return {
    user,
    profile,
    hasProfile: !!profile
  };
}

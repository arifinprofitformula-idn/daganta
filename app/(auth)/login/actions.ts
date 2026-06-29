'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { PlatformRole } from '@prisma/client';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { getClientIp, rateLimitByIP } from '@/lib/rate-limit';

function getRequiredString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

export async function login(formData: FormData) {
  const requestHeaders = await headers();
  const loginLimit = await rateLimitByIP(getClientIp(requestHeaders), 10, 60);

  if (!loginLimit.success) {
    redirect('/login?error=' + encodeURIComponent('Terlalu banyak percobaan login. Coba lagi sebentar lagi.'));
  }

  const email = getRequiredString(formData, 'email');
  const password = getRequiredString(formData, 'password');

  if (!email || !password) {
    redirect('/login?error=' + encodeURIComponent('Email dan kata sandi wajib diisi.'));
  }

  let signInError: string | null = null;
  let redirectTarget = '/dashboard';

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    signInError = error?.message || null;

    if (!signInError && data.user) {
      let profile = await prisma.userProfile.findUnique({
        where: { authUserId: data.user.id },
        select: { platformRole: true },
      });

      if (!profile && data.user.email) {
        await prisma.userProfile.updateMany({
          where: {
            email: data.user.email,
            authUserId: null,
          },
          data: {
            authUserId: data.user.id,
          },
        });

        profile = await prisma.userProfile.findUnique({
          where: { authUserId: data.user.id },
          select: { platformRole: true },
        });
      }

      if (profile?.platformRole === PlatformRole.SUPER_ADMIN) {
        redirectTarget = '/dashboard/admin/agent-clients';
      }
    }
  } catch {
    signInError =
      'Login Supabase belum bisa diproses. Periksa konfigurasi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY.';
  }

  if (signInError) {
    redirect('/login?error=' + encodeURIComponent(signInError));
  }

  redirect(redirectTarget);
}

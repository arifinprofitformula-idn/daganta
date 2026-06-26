'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

function getRequiredString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

export async function login(formData: FormData) {
  const email = getRequiredString(formData, 'email');
  const password = getRequiredString(formData, 'password');

  if (!email || !password) {
    redirect('/login?error=' + encodeURIComponent('Email dan kata sandi wajib diisi.'));
  }

  let signInError: string | null = null;

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    signInError = error?.message || null;
  } catch {
    signInError =
      'Login Supabase belum bisa diproses. Periksa konfigurasi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY.';
  }

  if (signInError) {
    redirect('/login?error=' + encodeURIComponent(signInError));
  }

  redirect('/dashboard');
}

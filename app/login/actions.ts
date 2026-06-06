'use server';

import { redirect } from 'next/navigation';
import { getAuthAdapter } from '@/lib/platform/auth';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    redirect('/login?error=' + encodeURIComponent('Email dan kata sandi wajib diisi.'));
  }

  const auth = await getAuthAdapter();
  const result = await auth.loginWithPassword(email, password);

  if (!result.success) {
    redirect('/login?error=' + encodeURIComponent(result.error || 'Login belum berhasil.'));
  }

  // Pengalihan ke dasbor setelah login berhasil
  redirect('/dashboard');
}

export async function logout() {
  const auth = await getAuthAdapter();
  await auth.logout();
  
  // Pengalihan kembali ke login setelah keluar
  redirect('/login');
}

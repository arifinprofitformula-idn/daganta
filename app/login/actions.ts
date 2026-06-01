'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    redirect('/login?error=' + encodeURIComponent('Email dan kata sandi wajib diisi.'));
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Redirect ke login dengan pesan error jika otentikasi gagal
    redirect('/login?error=' + encodeURIComponent(error.message));
  }

  // Pengalihan ke dasbor setelah login berhasil
  redirect('/dashboard');
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  
  // Pengalihan kembali ke login setelah keluar
  redirect('/login');
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Tetap kembalikan pengguna ke login jika konfigurasi/session Supabase belum siap.
  }

  return NextResponse.redirect(new URL('/login', request.url), {
    status: 303,
  });
}

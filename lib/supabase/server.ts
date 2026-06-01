import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Konfigurasi Supabase tidak lengkap. Pastikan URL dan Key telah diatur secara benar.');
  }

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Klien dipanggil dari Server Component (bukan Server Action / Route Handler).
          // Set cookie di Server Component aman diabaikan karena ada middleware 
          // yang merefresh sesi secara mandiri jika diperlukan.
        }
      },
    },
  });
}

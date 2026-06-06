import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabasePublicConfig } from '@/lib/config/env';

export async function createClient() {
  const { url, key } = getSupabasePublicConfig();

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

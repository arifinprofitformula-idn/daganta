import { createBrowserClient } from '@supabase/ssr';
import { getSupabasePublicConfig } from '@/lib/config/env';

export function createClient() {
  const { url, key } = getSupabasePublicConfig();

  return createBrowserClient(url, key);
}

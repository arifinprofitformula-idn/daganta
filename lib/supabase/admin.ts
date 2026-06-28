import { createClient } from '@supabase/supabase-js';
import { getSupabasePublicConfig, requireSupabaseServiceRoleKey } from '@/lib/config/env';

export function createSupabaseAdminClient() {
  const { url } = getSupabasePublicConfig();
  const serviceRoleKey = requireSupabaseServiceRoleKey();

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

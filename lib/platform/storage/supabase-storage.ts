import { getSupabasePublicConfig } from '@/lib/config/env';
import type { StorageAdapter } from './index';

export const supabaseStorageAdapter: StorageAdapter = {
  provider: 'supabase',
  isAvailable() {
    getSupabasePublicConfig();
    return true;
  },
};

import { getStorageProvider } from '@/lib/config/env';

export interface StorageAdapter {
  provider: 'local' | 'supabase';
  isAvailable(): boolean;
}

export async function getStorageAdapter(): Promise<StorageAdapter> {
  if (getStorageProvider() === 'supabase') {
    const mod = await import('./supabase-storage');
    return mod.supabaseStorageAdapter;
  }

  const mod = await import('./placeholder-storage');
  return mod.placeholderStorageAdapter;
}

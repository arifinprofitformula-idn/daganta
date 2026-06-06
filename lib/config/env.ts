export type AuthProvider = 'credentials' | 'demo' | 'supabase';
export type StorageProvider = 'local' | 'supabase';

function readEnv(name: string) {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : null;
}

export function getAuthProvider(): AuthProvider {
  const provider = (readEnv('AUTH_PROVIDER') || 'credentials').toLowerCase();

  if (provider === 'supabase' || provider === 'demo' || provider === 'credentials') {
    return provider;
  }

  return 'credentials';
}

export function getStorageProvider(): StorageProvider {
  const provider = (readEnv('STORAGE_PROVIDER') || 'local').toLowerCase();

  return provider === 'supabase' ? 'supabase' : 'local';
}

export function requireAuthSecret() {
  const secret = readEnv('AUTH_SECRET');

  if (!secret) {
    throw new Error('AUTH_SECRET wajib diatur untuk auth provider non-Supabase.');
  }

  return secret;
}

export function getSupabasePublicConfig() {
  const url = readEnv('NEXT_PUBLIC_SUPABASE_URL');
  const key = readEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY') || readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  if (!url || !key) {
    throw new Error('Konfigurasi Supabase tidak lengkap. Pastikan URL dan Key telah diatur secara benar.');
  }

  return { url, key };
}

export function hasSupabasePublicConfig() {
  const url = readEnv('NEXT_PUBLIC_SUPABASE_URL');
  const key = readEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY') || readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  return Boolean(url && key);
}

export function requireSupabaseServiceRoleKey() {
  const key = readEnv('SUPABASE_SERVICE_ROLE_KEY');

  if (!key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY wajib untuk operasi admin Supabase.');
  }

  return key;
}

export function isDemoAuthEnabled() {
  return readEnv('DEMO_AUTH_ENABLED') === 'true';
}

export function assertDemoAuthEnabled() {
  if (!isDemoAuthEnabled()) {
    throw new Error('Demo auth tidak aktif. Set DEMO_AUTH_ENABLED=true untuk memakai AUTH_PROVIDER=demo.');
  }
}

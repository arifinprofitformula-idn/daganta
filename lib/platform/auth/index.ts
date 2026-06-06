import type { PlatformRole } from '@prisma/client';
import { getAuthProvider, hasSupabasePublicConfig } from '@/lib/config/env';

export interface PlatformAuthUser {
  id: string;
  email: string | null;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
  isDemo?: boolean;
}

export interface PlatformUserProfile {
  id: string;
  email: string;
  name: string | null;
  authUserId: string | null;
  platformRole: PlatformRole;
}

export interface PlatformAuthProfile {
  user: PlatformAuthUser;
  profile: PlatformUserProfile | null;
  hasProfile: boolean;
}

export interface SignupAuthInput {
  email: string;
  password: string;
  name: string;
  phone: string;
}

export interface SignupAuthResult {
  success: boolean;
  error?: string;
  authUser?: PlatformAuthUser;
  sessionCreated: boolean;
}

export interface AuthProviderAdapter {
  getCurrentUser(): Promise<PlatformAuthUser | null>;
  getCurrentUserProfile(): Promise<PlatformAuthProfile | null>;
  loginWithPassword(email: string, password: string): Promise<{ success: boolean; error?: string }>;
  logout(): Promise<void>;
  signupAuthUser(input: SignupAuthInput): Promise<SignupAuthResult>;
}

export async function getAuthAdapter(): Promise<AuthProviderAdapter> {
  const provider = getAuthProvider();

  if (provider === 'supabase' && hasSupabasePublicConfig()) {
    const mod = await import('./supabase-auth');
    return mod.supabaseAuthAdapter;
  }

  if (provider === 'demo') {
    const mod = await import('./demo-auth');
    return mod.demoAuthAdapter;
  }

  const mod = await import('./credentials-auth');
  return mod.credentialsAuthAdapter;
}

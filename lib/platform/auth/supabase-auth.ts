import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import type { AuthProviderAdapter, SignupAuthInput } from './index';

export const supabaseAuthAdapter: AuthProviderAdapter = {
  async getCurrentUser() {
    try {
      const supabase = await createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        return null;
      }

      return {
        id: user.id,
        email: user.email || null,
        user_metadata: user.user_metadata,
        app_metadata: user.app_metadata,
      };
    } catch {
      return null;
    }
  },

  async getCurrentUserProfile() {
    const user = await this.getCurrentUser();
    if (!user) {
      return null;
    }

    let profile = await prisma.userProfile.findUnique({
      where: { authUserId: user.id },
    });

    if (!profile && user.email) {
      await prisma.userProfile.updateMany({
        where: {
          email: user.email,
          authUserId: null,
        },
        data: {
          authUserId: user.id,
        },
      });

      profile = await prisma.userProfile.findUnique({
        where: { authUserId: user.id },
      });
    }

    return {
      user,
      profile,
      hasProfile: !!profile,
    };
  },

  async loginWithPassword(email: string, password: string) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }
    } catch {
      return {
        success: false,
        error: 'Login Supabase belum tersedia karena konfigurasi Supabase belum lengkap.',
      };
    }

    return { success: true };
  },

  async logout() {
    try {
      const supabase = await createClient();
      await supabase.auth.signOut();
    } catch {
      return;
    }
  },

  async signupAuthUser(input: SignupAuthInput) {
    try {
      const supabase = await createClient();
      const {
        data: signUpData,
        error,
      } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          data: {
            name: input.name,
            phone: input.phone,
          },
        },
      });

      if (error || !signUpData.user) {
        return {
          success: false,
          error: error?.message || 'Gagal mendaftarkan akun di server keamanan.',
          sessionCreated: false,
        };
      }

      return {
        success: true,
        authUser: {
          id: signUpData.user.id,
          email: signUpData.user.email || input.email,
          user_metadata: signUpData.user.user_metadata,
          app_metadata: signUpData.user.app_metadata,
        },
        sessionCreated: !!signUpData.session,
      };
    } catch {
      return {
        success: false,
        error: 'Signup Supabase belum tersedia karena konfigurasi Supabase belum lengkap.',
        sessionCreated: false,
      };
    }
  },
};

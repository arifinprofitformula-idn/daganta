import { requireAuthSecret } from '@/lib/config/env';
import type { AuthProviderAdapter } from './index';

const CREDENTIALS_PENDING_MESSAGE =
  'Credentials auth belum diaktifkan. Migration kredensial perlu disetujui sebelum login password berbasis database dapat digunakan.';

export const credentialsAuthAdapter: AuthProviderAdapter = {
  async getCurrentUser() {
    return null;
  },

  async getCurrentUserProfile() {
    return null;
  },

  async loginWithPassword() {
    requireAuthSecret();

    return {
      success: false,
      error: CREDENTIALS_PENDING_MESSAGE,
    };
  },

  async logout() {
    return;
  },

  async signupAuthUser() {
    requireAuthSecret();

    return {
      success: false,
      error: CREDENTIALS_PENDING_MESSAGE,
      sessionCreated: false,
    };
  },
};

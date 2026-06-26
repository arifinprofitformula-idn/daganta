import { prisma } from '@/lib/prisma';
import { assertDemoAuthEnabled, requireAuthSecret } from '@/lib/config/env';
import { isRecoverablePrismaConnectionError } from '@/lib/prisma-errors';
import type { AuthProviderAdapter } from './index';

const DEMO_USER_EMAIL = 'owner.toya@daganta.com';
const DEMO_USER_ID = 'demo:toya-owner';

export const demoAuthAdapter: AuthProviderAdapter = {
  async getCurrentUser() {
    assertDemoAuthEnabled();
    requireAuthSecret();

    return {
      id: DEMO_USER_ID,
      email: DEMO_USER_EMAIL,
      isDemo: true,
      app_metadata: {
        mode: 'demo',
      },
    };
  },

  async getCurrentUserProfile() {
    const user = await this.getCurrentUser();
    if (!user) {
      return null;
    }

    let profile = null;

    try {
      profile = await prisma.userProfile.findUnique({
        where: { email: DEMO_USER_EMAIL },
      });
    } catch (error) {
      if (!isRecoverablePrismaConnectionError(error)) {
        throw error;
      }
    }

    return {
      user,
      profile,
      hasProfile: !!profile,
    };
  },

  async loginWithPassword() {
    assertDemoAuthEnabled();
    requireAuthSecret();
    return { success: true };
  },

  async logout() {
    return;
  },

  async signupAuthUser() {
    assertDemoAuthEnabled();
    requireAuthSecret();

    return {
      success: false,
      error: 'Signup tidak tersedia pada mode demo internal.',
      sessionCreated: false,
    };
  },
};

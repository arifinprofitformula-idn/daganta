import { cookies } from 'next/headers';

const ACTIVE_TENANT_COOKIE_NAME = 'daganta_active_tenant_id';

export async function getActiveTenantCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ACTIVE_TENANT_COOKIE_NAME)?.value || null;
}

export async function setActiveTenantCookie(tenantId: string) {
  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_TENANT_COOKIE_NAME, tenantId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/dashboard',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30 // 30 days
  });
}

export async function clearActiveTenantCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(ACTIVE_TENANT_COOKIE_NAME);
}

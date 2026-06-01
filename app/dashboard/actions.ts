'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getActiveTenantContext } from '@/lib/auth/tenant-access';
import { setActiveTenantCookie } from '@/lib/auth/dashboard-tenant-cookie';

export async function switchActiveTenantAction(formData: FormData) {
  const tenantId = formData.get('tenantId') as string;
  if (!tenantId) {
    redirect('/dashboard');
  }

  // 1. Validasi sesi keanggotaan pengguna dan hak akses secara server-side
  const tenantCtx = await getActiveTenantContext();
  
  if (tenantCtx.status !== 'SUCCESS' || !tenantCtx.availableTenants) {
    redirect('/dashboard');
  }

  // 2. Cek apakah tenantId pilihan benar-benar ada dalam daftar keanggotaan sah milik user
  const hasAccess = tenantCtx.availableTenants.some(t => t.id === tenantId);
  
  if (hasAccess) {
    // 3. Tulis cookie preferensi toko aktif (httpOnly, sameSite lax, secure in production, maxAge 30 days)
    await setActiveTenantCookie(tenantId);
  }

  // 4. Segarkan cache Next.js untuk seluruh rute dasbor secara instan dan alihkan kembali secara aman
  revalidatePath('/dashboard');
  redirect('/dashboard');
}

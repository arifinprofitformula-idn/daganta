import React from 'react';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/dashboard/dashboard-shell';
import { getActiveTenantContext } from '@/lib/auth/tenant-access';
import AccountAccessState from '@/components/dashboard/account-access-state';

export const dynamic = 'force-dynamic';

export default async function Layout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  // 1. Evaluasi keanggotaan dan sesi otorisasi aktif secara terpusat
  const tenantCtx = await getActiveTenantContext();

  // 2. Jika tidak ada sesi user aktif, langsung alihkan ke login
  if (!tenantCtx.user) {
    redirect('/login');
  }

  // 3. Jika status error, cegah pembacaan data toko dan tampilkan kartu peringatan
  if (tenantCtx.status === 'NO_PROFILE' || tenantCtx.status === 'NO_MEMBERSHIP') {
    return (
      <AccountAccessState 
        error={tenantCtx.status} 
        userEmail={tenantCtx.user.email || ''} 
      />
    );
  }

  // 4. Konteks toko aktif yang sah hasil saringan membership
  const tenantName = tenantCtx.activeTenant?.name || 'Nama Toko';

  return (
    <DashboardShell 
      tenantName={tenantName}
      userEmail={tenantCtx.user.email || ''}
      hasProfile={true}
    >
      {children}
    </DashboardShell>
  );
}

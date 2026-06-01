import React from 'react';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/dashboard/dashboard-shell';
import { getDashboardSummaryBySubdomain } from '@/lib/data-access/dashboard';
import { getCurrentUserProfile } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function Layout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  // 1. Validasi sesi aktif pengguna. Jika tidak valid, alihkan ke login.
  const authData = await getCurrentUserProfile();
  if (!authData || !authData.user) {
    redirect('/login');
  }

  // 2. Dapatkan data agregasi tenant demo dari database
  const summary = await getDashboardSummaryBySubdomain('toyanusantara');
  const tenantName = summary?.tenant.name || 'Toya Nusantara';

  return (
    <DashboardShell 
      tenantName={tenantName}
      userEmail={authData.user.email || ''}
      hasProfile={authData.hasProfile}
    >
      {children}
    </DashboardShell>
  );
}

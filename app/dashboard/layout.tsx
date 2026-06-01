import React from 'react';
import DashboardShell from '@/components/dashboard/dashboard-shell';
import { getDashboardSummaryBySubdomain } from '@/lib/data-access/dashboard';

export const dynamic = 'force-dynamic';

export default async function Layout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  // Dapatkan ringkasan dan profil tenant demo dari database
  const summary = await getDashboardSummaryBySubdomain('toyanusantara');
  const tenantName = summary?.tenant.name || 'Toya Nusantara';

  return (
    <DashboardShell tenantName={tenantName}>
      {children}
    </DashboardShell>
  );
}

import React from 'react';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/dashboard/dashboard-shell';
import { getActiveTenantContext } from '@/lib/auth/tenant-access';
import AccountAccessState from '@/components/dashboard/account-access-state';
import { getTenantSubscriptionPolicy } from '@/lib/billing/lifecycle';
import { prisma } from '@/lib/prisma';

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

  // Check if the user has an AgentProfile
  const agentProfile = tenantCtx.userProfile
    ? await prisma.agentProfile.findUnique({
        where: { userProfileId: tenantCtx.userProfile.id }
      })
    : null;
  const isAgent = !!agentProfile;

  // 3. Jika status error, cegah pembacaan data toko dan tampilkan kartu peringatan
  // Namun bypass NO_MEMBERSHIP jika user adalah agent
  if (tenantCtx.status === 'NO_PROFILE') {
    return (
      <AccountAccessState 
        error={tenantCtx.status} 
        userEmail={tenantCtx.user.email || ''} 
      />
    );
  }

  if (tenantCtx.status === 'NO_MEMBERSHIP' && !isAgent) {
    return (
      <AccountAccessState 
        error={tenantCtx.status} 
        userEmail={tenantCtx.user.email || ''} 
      />
    );
  }

  // 4. Konteks toko aktif yang sah hasil saringan membership
  const tenantName = tenantCtx.activeTenant?.name || agentProfile?.displayName || 'Nama Toko';

  // 5. Query dynamic subscription policy and build warning banner
  let warningBanner = null;
  if (tenantCtx.activeTenant) {
    const policy = await getTenantSubscriptionPolicy(tenantCtx.activeTenant.id);
    if (policy.shouldShowWarning && policy.warningTitle && policy.warningMessage) {
      const isDanger = ['LIMITED_MODE', 'SUSPENDED', 'CANCELED'].includes(policy.effectiveStatus);
      const bgClass = isDanger ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-amber-50 border-amber-200 text-amber-800';
      const textTitleClass = isDanger ? 'text-rose-900 font-extrabold' : 'text-amber-900 font-extrabold';
      const buttonBgClass = isDanger ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/20' : 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm shadow-amber-600/20';

      warningBanner = (
        <div className={`flex flex-col gap-4 rounded-3xl border p-5 sm:flex-row sm:items-center sm:justify-between ${bgClass} transition-all duration-300 shadow-sm mb-6`}>
          <div className="space-y-1">
            <h4 className={`text-sm ${textTitleClass}`}>{policy.warningTitle}</h4>
            <p className="text-xs leading-relaxed opacity-90 font-medium">{policy.warningMessage}</p>
          </div>
          <a
            href="/dashboard/billing"
            className={`inline-block rounded-2xl px-5 py-2.5 text-center text-xs font-extrabold transition-all ${buttonBgClass} shrink-0`}
          >
            Perpanjang Paket
          </a>
        </div>
      );
    }
  }

  return (
    <DashboardShell 
      tenantName={tenantName}
      userEmail={tenantCtx.user.email || ''}
      hasProfile={true}
      activeTenant={tenantCtx.activeTenant}
      availableTenants={tenantCtx.availableTenants || []}
      isAgent={isAgent}
      hasTenant={!!tenantCtx.activeTenant}
    >
      {warningBanner}
      {children}
    </DashboardShell>
  );
}

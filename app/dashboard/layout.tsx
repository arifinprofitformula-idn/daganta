import React from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { PlatformRole } from '@prisma/client';
import { getActiveTenantContext } from '@/lib/auth/tenant-access';
import AccountAccessState from '@/components/dashboard/account-access-state';
import { getTenantSubscriptionPolicy } from '@/lib/billing/lifecycle';
import { prisma } from '@/lib/prisma';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardTopbar } from '@/components/dashboard/DashboardTopbar';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function Layout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const headersList = await headers();
  const dashboardPathname = headersList.get('x-daganta-pathname') || '';

  // 1. Defense in depth: validasi sesi Supabase di server layout.
  let sessionUser = null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    sessionUser = user;
  } catch {
    redirect('/login');
  }

  if (!sessionUser) {
    redirect('/login');
  }

  // 2. Evaluasi keanggotaan dan sesi otorisasi aktif secara terpusat
  const tenantCtx = await getActiveTenantContext();

  // 3. Jika tidak ada sesi user aktif, langsung alihkan ke login
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
  const isPlatformAdmin = tenantCtx.userProfile?.platformRole === PlatformRole.SUPER_ADMIN;
  const isAdminRoute = dashboardPathname === '/dashboard/admin' || dashboardPathname.startsWith('/dashboard/admin/');
  const isAgentRoute = dashboardPathname === '/dashboard/agent' || dashboardPathname.startsWith('/dashboard/agent/');
  const canBypassNoMembership = (isAgent && isAgentRoute) || (isPlatformAdmin && isAdminRoute);

  // 4. Jika status error, cegah pembacaan data toko dan tampilkan kartu peringatan
  // Bypass NO_MEMBERSHIP hanya berlaku untuk route agent/admin yang memang dijaga lagi oleh page terkait.
  if (tenantCtx.status === 'NO_PROFILE') {
    return (
      <AccountAccessState 
        error={tenantCtx.status} 
        userEmail={tenantCtx.user.email || ''} 
      />
    );
  }

  if (tenantCtx.status === 'NO_MEMBERSHIP' && !canBypassNoMembership) {
    return (
      <AccountAccessState 
        error={tenantCtx.status} 
        userEmail={tenantCtx.user.email || ''} 
      />
    );
  }

  // 5. Konteks toko aktif yang sah hasil saringan membership
  const tenantName = tenantCtx.activeTenant?.name || agentProfile?.displayName || (isPlatformAdmin ? 'Platform Admin' : 'Nama Toko');
  const sessionUserName =
    typeof sessionUser.user_metadata?.name === 'string'
      ? sessionUser.user_metadata.name
      : tenantCtx.userProfile?.name || null;
  const sessionUserEmail = sessionUser.email || tenantCtx.user.email || '';

  // 6. Query dynamic subscription policy and build warning banner
  let warningBanner = null;
  const demoBanner = tenantCtx.user?.isDemo ? (
    <div className="mb-6 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-xs font-bold leading-relaxed text-amber-900 shadow-sm">
      Mode demo internal aktif. Sesi ini hanya untuk staging atau QA dan bukan autentikasi production.
    </div>
  ) : null;

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
    <div className="flex min-h-screen bg-slate-50 text-slate-950">
      <div className="hidden min-h-screen shrink-0 md:block">
        <DashboardSidebar tenantName={tenantName} ownerName="Owner Toko" />
      </div>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <DashboardTopbar
          tenantName={tenantName}
          userName={sessionUserName}
          userEmail={sessionUserEmail}
        />
        <main className="flex-1 p-4 md:p-8">
          <div className="mx-auto w-full max-w-7xl space-y-6">
            {demoBanner}
            {warningBanner}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

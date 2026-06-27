import React from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { PlatformRole } from '@prisma/client';
import { getActiveTenantContext } from '@/lib/auth/tenant-access';
import AccountAccessState from '@/components/dashboard/account-access-state';
import { prisma } from '@/lib/prisma';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardTopbar } from '@/components/dashboard/DashboardTopbar';
import { TenantStatusBanner } from '@/components/dashboard/TenantStatusBanner';
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

  const demoBanner = tenantCtx.user?.isDemo ? (
    <div className="mb-6 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-xs font-bold leading-relaxed text-amber-900 shadow-sm">
      Mode demo internal aktif. Sesi ini hanya untuk staging atau QA dan bukan autentikasi production.
    </div>
  ) : null;

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
            {tenantCtx.activeTenant ? <TenantStatusBanner tenantId={tenantCtx.activeTenant.id} /> : null}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

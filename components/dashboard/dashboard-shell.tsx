'use client';

import React from 'react';
import Sidebar from './sidebar';
import Topbar from './topbar';

interface DashboardShellProps {
  tenantName: string;
  userEmail: string;
  hasProfile: boolean;
  activeTenant: { id: string; name: string; slug: string; subdomain: string } | null;
  availableTenants: Array<{ id: string; name: string; slug: string; subdomain: string }>;
  children: React.ReactNode;
  isAgent?: boolean;
  hasTenant?: boolean;
}

export default function DashboardShell({ 
  tenantName, 
  userEmail, 
  hasProfile, 
  activeTenant,
  availableTenants,
  children,
  isAgent = false,
  hasTenant = false
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-brand-slate-bg text-brand-navy flex font-sans antialiased overflow-hidden">
      {/* Dynamic Sidebar */}
      <Sidebar tenantName={tenantName} isAgent={isAgent} hasTenant={hasTenant} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Dynamic Topbar */}
        <Topbar 
          tenantName={tenantName} 
          userEmail={userEmail} 
          hasProfile={hasProfile} 
          activeTenant={activeTenant}
          availableTenants={availableTenants}
        />

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto bg-brand-slate-bg p-8">
          <div className="max-w-7xl mx-auto w-full space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

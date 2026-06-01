'use client';

import React from 'react';
import Sidebar from './sidebar';
import Topbar from './topbar';

interface DashboardShellProps {
  tenantName: string;
  userEmail: string;
  hasProfile: boolean;
  children: React.ReactNode;
}

export default function DashboardShell({ 
  tenantName, 
  userEmail, 
  hasProfile, 
  children 
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans antialiased overflow-hidden">
      {/* Dynamic Sidebar */}
      <Sidebar tenantName={tenantName} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Dynamic Topbar */}
        <Topbar 
          tenantName={tenantName} 
          userEmail={userEmail} 
          hasProfile={hasProfile} 
        />

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-8">
          <div className="max-w-7xl mx-auto w-full space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

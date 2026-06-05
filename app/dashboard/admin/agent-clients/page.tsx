import React from 'react';
import {
  AlertCircle,
  ArrowRightLeft,
  Briefcase,
  CheckCircle,
  ShieldCheck,
  Store,
} from 'lucide-react';
import {
  AgentClientOwnershipStatus,
  AgentClientStatus,
  PlatformRole,
} from '@prisma/client';
import { getCurrentPlatformUser } from '@/lib/auth/platform-access';
import { prisma } from '@/lib/prisma';
import { transferAgentClientOwnershipAction } from './actions';

export const dynamic = 'force-dynamic';

interface AdminAgentClientsPageProps {
  searchParams?: Promise<{
    error?: string;
    success?: string;
  }>;
}

function formatDate(value: Date | null) {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(value);
}

function statusLabel(status: AgentClientStatus) {
  const labels: Record<AgentClientStatus, string> = {
    DRAFT: 'Draft',
    ACTIVE: 'Aktif',
    LIMITED: 'Terbatas',
    SUSPENDED: 'Ditangguhkan',
    TRANSFERRED: 'Sudah Transfer',
    ARCHIVED: 'Diarsipkan',
  };

  return labels[status];
}

function ownershipLabel(status: AgentClientOwnershipStatus) {
  const labels: Record<AgentClientOwnershipStatus, string> = {
    AGENT_MANAGED: 'Dikelola Agen',
    DIRECT_DAGANTA: 'Dikelola Daganta',
    TRANSFERRED_TO_CLIENT: 'Transfer ke Klien',
    TRANSFERRED_TO_DAGANTA: 'Transfer ke Daganta',
  };

  return labels[status];
}

function RestrictedState() {
  return (
    <div className="mx-auto my-12 max-w-xl rounded-[24px] border border-brand-border bg-white p-8 text-center font-sans shadow-sm select-none">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-600">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h1 className="text-lg font-extrabold text-brand-navy">Akses Terbatas</h1>
      <p className="mx-auto mt-2 max-w-xs text-xs font-semibold leading-relaxed text-slate-500">
        Halaman ini hanya tersedia untuk admin platform Daganta.
      </p>
    </div>
  );
}

export default async function AdminAgentClientsPage({ searchParams }: AdminAgentClientsPageProps) {
  const params = searchParams ? await searchParams : {};
  const platformUser = await getCurrentPlatformUser();

  if (!platformUser || platformUser.profile.platformRole !== PlatformRole.SUPER_ADMIN) {
    return <RestrictedState />;
  }

  const agentClients = await prisma.agentClient.findMany({
    include: {
      agent: {
        select: {
          displayName: true,
          agentCode: true,
        },
      },
      tenant: {
        select: {
          id: true,
          name: true,
          slug: true,
          subdomain: true,
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              authUserId: true,
            },
          },
        },
      },
      transferredByUser: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="space-y-6 pb-10 font-sans select-none">
      <div className="rounded-[24px] border border-brand-border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-brand-blue">
              <ShieldCheck className="h-3.5 w-3.5" />
              Platform Admin
            </span>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-brand-navy">
                Transfer Kepemilikan Toko Klien
              </h1>
              <p className="mt-1 max-w-2xl text-xs font-semibold leading-relaxed text-slate-500">
                Pindahkan toko klien dari status dikelola agen ke pemilik klien atau ke Daganta secara terkontrol.
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-600">
            {agentClients.length} Toko Klien
          </div>
        </div>
      </div>

      {params.success && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-xs font-bold leading-relaxed text-emerald-800">
          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <span>{params.success}</span>
        </div>
      )}

      {params.error && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-xs font-bold leading-relaxed text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
          <span>{params.error}</span>
        </div>
      )}

      <div className="overflow-hidden rounded-[24px] border border-brand-border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-brand-border bg-slate-50 text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-4">Agen</th>
                <th className="px-5 py-4">Tenant</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Kepemilikan</th>
                <th className="px-5 py-4">Owner Saat Ini</th>
                <th className="px-5 py-4">Transfer</th>
                <th className="px-5 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {agentClients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-xs font-bold text-slate-400">
                    Belum ada toko klien agen.
                  </td>
                </tr>
              ) : (
                agentClients.map((client) => {
                  const canTransfer =
                    client.ownershipStatus === AgentClientOwnershipStatus.AGENT_MANAGED &&
                    (client.status === AgentClientStatus.DRAFT || client.status === AgentClientStatus.ACTIVE) &&
                    Boolean(client.tenant?.owner);

                  return (
                    <tr key={client.id} className="align-top transition hover:bg-slate-50/50">
                      <td className="px-5 py-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-brand-blue">
                            <Briefcase className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 space-y-1">
                            <div className="font-extrabold text-brand-navy">{client.agent.displayName}</div>
                            <div className="font-semibold text-slate-400">{client.agent.agentCode}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500">
                            <Store className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 space-y-1">
                            <div className="font-extrabold text-brand-navy">{client.tenant?.name || '-'}</div>
                            <div className="font-semibold text-slate-400">
                              {client.tenant?.subdomain || client.tenant?.slug || '-'}.daganta.store
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider text-slate-600">
                          {statusLabel(client.status)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-md border border-blue-100 bg-blue-50 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider text-blue-700">
                          {ownershipLabel(client.ownershipStatus)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-1 font-semibold text-slate-500">
                          <div className="font-extrabold text-brand-navy">{client.tenant?.owner?.name || '-'}</div>
                          <div>{client.tenant?.owner?.email || '-'}</div>
                          <div className="text-[10px] text-slate-400">
                            {client.tenant?.owner?.authUserId ? 'Auth terhubung' : 'Belum claim auth'}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-1 font-semibold text-slate-500">
                          <div>{formatDate(client.transferredAt)}</div>
                          <div className="text-[10px] text-slate-400">
                            {client.transferredByUser?.name || client.transferredByUser?.email || '-'}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        {canTransfer ? (
                          <div className="flex justify-end gap-2">
                            <form action={transferAgentClientOwnershipAction}>
                              <input type="hidden" name="agentClientId" value={client.id} />
                              <input type="hidden" name="transferTarget" value="CLIENT" />
                              <button
                                type="submit"
                                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[10px] font-extrabold text-emerald-700 transition hover:bg-emerald-100"
                              >
                                <ArrowRightLeft className="h-3.5 w-3.5" />
                                Ke Pemilik Klien
                              </button>
                            </form>
                            <form action={transferAgentClientOwnershipAction}>
                              <input type="hidden" name="agentClientId" value={client.id} />
                              <input type="hidden" name="transferTarget" value="DAGANTA" />
                              <button
                                type="submit"
                                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-[10px] font-extrabold text-blue-700 transition hover:bg-blue-100"
                              >
                                <ShieldCheck className="h-3.5 w-3.5" />
                                Ke Daganta
                              </button>
                            </form>
                          </div>
                        ) : (
                          <span className="inline-flex rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-extrabold text-slate-400">
                            Tidak tersedia
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

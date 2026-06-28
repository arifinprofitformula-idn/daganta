import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowUpRight, Repeat2 } from 'lucide-react';
import { AgentClientOwnershipStatus } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getCurrentUserProfile } from '@/lib/auth/session';
import { getAgentClients } from '@/lib/data-access/agent';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface AgentClientsPageProps {
  searchParams: Promise<{
    ownershipStatus?: string;
  }>;
}

const ownershipOptions = [
  { label: 'Semua', value: 'all' },
  { label: 'Dikelola Agen', value: AgentClientOwnershipStatus.AGENT_MANAGED },
  { label: 'Direct Daganta', value: AgentClientOwnershipStatus.DIRECT_DAGANTA },
  { label: 'Ditransfer ke Klien', value: AgentClientOwnershipStatus.TRANSFERRED_TO_CLIENT },
  { label: 'Ditransfer ke Daganta', value: AgentClientOwnershipStatus.TRANSFERRED_TO_DAGANTA },
];

function parseOwnershipStatus(value: string | undefined) {
  if (!value || value === 'all') {
    return undefined;
  }

  return Object.values(AgentClientOwnershipStatus).includes(value as AgentClientOwnershipStatus)
    ? (value as AgentClientOwnershipStatus)
    : undefined;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function getTenantStatusClass(status: string) {
  if (status === 'ACTIVE') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  }

  if (status === 'SUSPENDED' || status === 'ARCHIVED') {
    return 'border-rose-200 bg-rose-50 text-rose-700';
  }

  return 'border-amber-200 bg-amber-50 text-amber-700';
}

function getOwnershipLabel(status: AgentClientOwnershipStatus) {
  const labels: Record<AgentClientOwnershipStatus, string> = {
    AGENT_MANAGED: 'Dikelola Agen',
    DIRECT_DAGANTA: 'Direct Daganta',
    TRANSFERRED_TO_CLIENT: 'Ditransfer ke Klien',
    TRANSFERRED_TO_DAGANTA: 'Ditransfer ke Daganta',
  };

  return labels[status];
}

export default async function AgentClientsPage({ searchParams }: AgentClientsPageProps) {
  const params = await searchParams;
  const authData = await getCurrentUserProfile();

  if (!authData?.user || !authData.profile) {
    redirect('/login');
  }

  const agentProfile = await prisma.agentProfile.findUnique({
    where: {
      userProfileId: authData.profile.id,
    },
    select: {
      id: true,
    },
  });

  if (!agentProfile) {
    redirect('/dashboard');
  }

  const selectedOwnership = parseOwnershipStatus(params.ownershipStatus);
  const clients = await getAgentClients(agentProfile.id, {
    ownershipStatus: selectedOwnership,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">Agent Clients</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Klien Saya</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Kelola daftar webstore klien yang terhubung dengan akun agen Anda.
          </p>
        </div>
        <Button asChild>
          <Link href="/agent/clients/new">Buat Toko Klien</Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Daftar Klien</CardTitle>
            <div className="flex flex-wrap gap-2">
              {ownershipOptions.map((option) => {
                const active = (params.ownershipStatus ?? 'all') === option.value;
                const href = option.value === 'all' ? '/agent/clients' : `/agent/clients?ownershipStatus=${option.value}`;

                return (
                  <Button key={option.value} asChild variant={active ? 'default' : 'outline'} size="sm">
                    <Link href={href}>{option.label}</Link>
                  </Button>
                );
              })}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {clients.length === 0 ? (
            <div className="p-8 text-sm text-slate-500">Belum ada klien untuk filter ini.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Toko</TableHead>
                  <TableHead>Subdomain</TableHead>
                  <TableHead>Status Toko</TableHead>
                  <TableHead>Tanggal Dibuat</TableHead>
                  <TableHead>Ownership</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-semibold text-slate-950">{client.tenant.name}</TableCell>
                    <TableCell className="text-slate-600">{client.tenant.subdomain}.daganta.store</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getTenantStatusClass(client.tenant.status)}>
                        {client.tenant.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(client.createdAt)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getOwnershipLabel(client.ownershipStatus)}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/dashboard?tenantId=${client.tenantId}`}>
                            Lihat Dashboard
                            <ArrowUpRight className="ml-2 h-4 w-4" aria-hidden="true" />
                          </Link>
                        </Button>
                        <Button type="button" size="sm" variant="outline" disabled>
                          <Repeat2 className="mr-2 h-4 w-4" aria-hidden="true" />
                          Transfer
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

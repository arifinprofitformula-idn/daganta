import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  Briefcase,
  DollarSign,
  Users,
  FileText,
  Sparkles,
  Clock,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Percent,
  AlertCircle,
  CheckCircle,
  Copy,
  ExternalLink,
  Store
} from 'lucide-react';
import { getCurrentUserProfile } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { activateAgentClientStoreAction } from './clients/actions';

export const dynamic = 'force-dynamic';

interface AgentDashboardPageProps {
  searchParams?: Promise<{
    created?: string;
    activated?: string;
    error?: string;
  }>;
}

// Helper to format currency in IDR
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Helper to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export default async function AgentDashboardPage({ searchParams }: AgentDashboardPageProps) {
  const params = searchParams ? await searchParams : {};

  // 1. Authenticate user
  const authData = await getCurrentUserProfile();
  if (!authData || !authData.user) {
    redirect('/login');
  }

  const user = authData.user;
  const userProfile = authData.profile;

  if (!userProfile) {
    return (
      <div className="p-8 text-center bg-white border border-brand-border rounded-3xl max-w-xl mx-auto shadow-sm my-12 font-sans">
        <h3 className="text-lg font-bold text-brand-navy">Profil Pengguna Tidak Ditemukan</h3>
        <p className="text-xs text-slate-500 mt-2">Silakan hubungi administrator Daganta.</p>
      </div>
    );
  }

  // 2. Fetch Agent Profile
  const agentProfile = await prisma.agentProfile.findUnique({
    where: { userProfileId: userProfile.id },
    include: {
      clients: {
        include: {
          tenant: {
            select: {
              name: true,
              subdomain: true,
              slug: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      },
      creditLedger: {
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    }
  });

  const starterPlan = await prisma.subscriptionPlan.findFirst({
    where: {
      code: 'STARTER_MONTHLY',
      isActive: true,
    },
    select: {
      price: true,
    },
  });

  // Check user role from metadata to handle missing profile cases
  const userRole = user?.user_metadata?.role || user?.app_metadata?.role;
  const hasAgentRole = userRole === 'AGENT' || userRole === 'UserRole.AGENT';

  // Access rules implementation
  if (!agentProfile) {
    if (!hasAgentRole) {
      // If user has no AgentProfile and is not AGENT
      return (
        <div className="p-8 text-center bg-white border border-brand-border rounded-[24px] max-w-xl mx-auto shadow-sm my-12 font-sans select-none">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200/50 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-rose-600" />
          </div>
          <h3 className="text-lg font-extrabold text-brand-navy">Akses Terbatas</h3>
          <p className="text-xs font-semibold text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed">
            Dashboard Agen hanya tersedia untuk akun agen Daganta.
          </p>
        </div>
      );
    } else {
      // If user has UserRole.AGENT but no AgentProfile
      return (
        <div className="p-8 text-center bg-white border border-brand-border rounded-[24px] max-w-xl mx-auto shadow-sm my-12 font-sans select-none">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200/50 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-amber-500" />
          </div>
          <h3 className="text-lg font-extrabold text-brand-navy">Profil Belum Aktif</h3>
          <p className="text-xs font-semibold text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed">
            Profil agen Anda belum aktif. Hubungi tim admin Daganta untuk mengaktifkan akun agen Anda.
          </p>
        </div>
      );
    }
  }

  // If AgentProfile.status is SUSPENDED or ARCHIVED
  if (agentProfile.status === 'SUSPENDED' || agentProfile.status === 'ARCHIVED') {
    const statusLabel = agentProfile.status === 'SUSPENDED' ? 'DITANGGUHKAN' : 'DIARSIPKAN';
    return (
      <div className="p-8 text-center bg-white border border-brand-border rounded-[24px] max-w-xl mx-auto shadow-sm my-12 font-sans select-none">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200/50 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-rose-600" />
        </div>
        <h3 className="text-lg font-extrabold text-brand-navy">Akun Agen {statusLabel}</h3>
        <p className="text-xs font-semibold text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed">
          Akses ke Dashboard Agen ditutup karena status akun Anda saat ini adalah {statusLabel.toLowerCase()}. Silakan hubungi dukungan Daganta untuk bantuan lebih lanjut.
        </p>
      </div>
    );
  }

  // Safe Serialization of Decimal and Date values before rendering
  const creditBalance = Number(agentProfile.creditBalance);
  const maxActiveClients = agentProfile.maxActiveClients;
  const maxDraftClients = agentProfile.maxDraftClients;

  const clients = agentProfile.clients.map(client => ({
    id: client.id,
    tenantName: client.tenant.name,
    tenantSubdomain: client.tenant.subdomain,
    tenantSlug: client.tenant.slug,
    status: client.status,
    ownershipStatus: client.ownershipStatus,
    createdAt: client.createdAt.toISOString(),
  }));

  const creditLedger = agentProfile.creditLedger.map(ledger => ({
    id: ledger.id,
    type: ledger.type,
    direction: ledger.direction,
    amount: Number(ledger.amount),
    balanceBefore: Number(ledger.balanceBefore),
    balanceAfter: Number(ledger.balanceAfter),
    description: ledger.description || '',
    createdAt: ledger.createdAt.toISOString(),
  }));

  // Calculations for metric summary cards
  const activeClientsCount = clients.filter(c => c.status === 'ACTIVE').length;
  const draftClientsCount = clients.filter(c => c.status === 'DRAFT').length;
  const totalClientsCount = clients.length;
  const activationCost = starterPlan ? Number(starterPlan.price) : null;
  const isActiveQuotaFull = activeClientsCount >= maxActiveClients;
  const hasInsufficientActivationBalance = activationCost !== null && creditBalance < activationCost;

  const isPending = agentProfile.status === 'PENDING';
  const isActiveAgent = agentProfile.status === 'ACTIVE';
  const showClientDraftCreatedBanner = params.created === 'client-draft';
  const showClientStoreActivatedBanner = params.activated === 'client-store';

  return (
    <div className="space-y-8 select-none font-sans pb-10">
      {params.error && (
        <div className="flex flex-col gap-4 rounded-3xl border border-rose-200 bg-rose-50 p-5 sm:flex-row sm:items-center sm:justify-between transition-all duration-300 shadow-sm">
          <div className="space-y-1">
            <h4 className="text-sm text-rose-900 font-extrabold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              Aktivasi Toko Belum Berhasil
            </h4>
            <p className="text-xs leading-relaxed text-rose-800 opacity-90 font-medium">
              {params.error}
            </p>
          </div>
        </div>
      )}

      {showClientDraftCreatedBanner && (
        <div className="flex flex-col gap-4 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 sm:flex-row sm:items-center sm:justify-between transition-all duration-300 shadow-sm">
          <div className="space-y-1">
            <h4 className="text-sm text-emerald-900 font-extrabold flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              Draft Toko Klien Dibuat
            </h4>
            <p className="text-xs leading-relaxed text-emerald-800 opacity-90 font-medium">
              Toko klien berhasil dibuat sebagai draft. Aktivasi kredit akan tersedia pada tahap berikutnya.
            </p>
          </div>
        </div>
      )}

      {showClientStoreActivatedBanner && (
        <div className="flex flex-col gap-4 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 sm:flex-row sm:items-center sm:justify-between transition-all duration-300 shadow-sm">
          <div className="space-y-1">
            <h4 className="text-sm text-emerald-900 font-extrabold flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              Toko Klien Aktif
            </h4>
            <p className="text-xs leading-relaxed text-emerald-800 opacity-90 font-medium">
              Toko klien berhasil diaktifkan. Saldo kredit telah diperbarui.
            </p>
          </div>
        </div>
      )}
      
      {/* PENDING NOTIFICATION BANNER */}
      {isPending && (
        <div className="flex flex-col gap-4 rounded-3xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between transition-all duration-300 shadow-sm">
          <div className="space-y-1">
            <h4 className="text-sm text-amber-900 font-extrabold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              Status Akun: Menunggu Aktivasi
            </h4>
            <p className="text-xs leading-relaxed text-amber-800 opacity-90 font-medium">
              Akun agen Anda sedang dalam proses peninjauan oleh administrator. Dashboard saat ini berjalan dalam mode baca-saja. Anda tidak dapat melakukan transaksi kredit atau mengaktifkan toko klien baru.
            </p>
          </div>
          <span className="inline-block rounded-2xl px-5 py-2.5 bg-amber-600 text-white shadow-sm shadow-amber-600/20 text-center text-xs font-extrabold select-none shrink-0">
            Menunggu Verifikasi
          </span>
        </div>
      )}

      {/* SECTION 1: HEADER & PROFILE DETAILS */}
      <div className="bg-gradient-to-br from-white via-slate-50 to-[#EEF6FF] border border-brand-border rounded-3xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.015)] relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="absolute top-0 right-0 w-72 h-72 bg-brand-blue/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="space-y-4 relative z-10 flex-1">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-brand-border rounded-full text-[10px] font-bold text-brand-blue shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-brand-teal" />
                Kemitraan Digital Daganta
              </span>
              {isPending ? (
                <span className="px-3 py-1 text-[10px] font-bold text-amber-700 bg-amber-100/70 border border-amber-200 rounded-full uppercase tracking-wider">
                  Menunggu Aktivasi
                </span>
              ) : (
                <span className="px-3 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/70 border border-emerald-200 rounded-full uppercase tracking-wider animate-pulse">
                  Agen Aktif
                </span>
              )}
            </div>
            
            <h1 className="text-3xl font-extrabold tracking-tight text-brand-navy">
              Dashboard Agen: {agentProfile.displayName} 💼
            </h1>
            <p className="text-xs text-slate-500 max-w-xl font-medium leading-relaxed">
              Kelola saldo kredit, pantau aktivitas toko klien Anda, dan kembangkan bisnis agensi digital Anda bersama platform Webstore SaaS Daganta.
            </p>
          </div>

          {/* Details Row: Code & Referral */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="bg-white/80 backdrop-blur-sm border border-brand-border rounded-2xl px-4 py-2 shadow-sm text-xs font-semibold text-slate-600 flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Kode Agen:</span>
              <strong className="text-brand-navy font-extrabold">{agentProfile.agentCode}</strong>
            </div>

            {agentProfile.referralCode && (
              <div className="bg-white/80 backdrop-blur-sm border border-brand-border rounded-2xl px-4 py-2 shadow-sm text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Referral:</span>
                <strong className="text-brand-navy font-extrabold">{agentProfile.referralCode}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Right CTA Area: Create Store */}
        <div className="w-full md:w-auto shrink-0 relative z-10 flex flex-col items-stretch gap-2.5">
          {isActiveAgent ? (
            <Link
              href="/dashboard/agent/clients/new"
              className="flex items-center justify-center gap-2 py-3.5 px-6 bg-brand-blue hover:bg-blue-700 active:bg-blue-800 text-white border border-brand-blue text-xs font-extrabold rounded-xl transition-all shadow-sm shadow-blue-600/20 uppercase tracking-wider"
            >
              <Plus className="w-4 h-4 shrink-0" />
              Buat Toko Klien
            </Link>
          ) : (
            <button
              type="button"
              disabled
              title="Akun agen harus aktif untuk membuat toko klien"
              className="flex items-center justify-center gap-2 py-3.5 px-6 bg-slate-100 text-slate-400 border border-slate-200 text-xs font-extrabold rounded-xl transition-all shadow-sm cursor-not-allowed uppercase tracking-wider"
            >
              <Plus className="w-4 h-4 shrink-0" />
              Buat Toko Klien
            </button>
          )}
          <span className="text-[10px] text-slate-400 font-semibold text-center leading-normal">
            Draft toko tidak memotong saldo kredit pada v0.4C.
          </span>
        </div>
      </div>

      {/* SECTION 2: SUMMARY KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        
        {/* Credit Balance Card */}
        <div className="bg-white border border-brand-border rounded-[24px] p-5 space-y-3 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:border-brand-blue/30 transition-all duration-300">
          <div className="space-y-1 text-left">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Saldo Kredit</span>
            <span className="text-xl font-black text-brand-blue block tracking-tight">
              {formatCurrency(creditBalance)}
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold pt-1 border-t border-slate-50">
            <span>Saldo Aktif Agen</span>
            <DollarSign className="w-3.5 h-3.5 text-brand-blue" />
          </div>
        </div>

        {/* Active Clients Quota Card */}
        <div className="bg-white border border-brand-border rounded-[24px] p-5 space-y-3 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:border-brand-teal/30 transition-all duration-300">
          <div className="space-y-1 text-left">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Klien Aktif</span>
            <span className="text-xl font-black text-brand-navy block tracking-tight">
              {activeClientsCount} <span className="text-xs font-medium text-slate-400">/ {maxActiveClients} Toko</span>
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold pt-1 border-t border-slate-50">
            <span>Kuota Toko Aktif</span>
            <Users className="w-3.5 h-3.5 text-brand-teal" />
          </div>
        </div>

        {/* Draft Clients Quota Card */}
        <div className="bg-white border border-brand-border rounded-[24px] p-5 space-y-3 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:border-slate-300 transition-all duration-300">
          <div className="space-y-1 text-left">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Draft Toko</span>
            <span className="text-xl font-black text-brand-navy block tracking-tight">
              {draftClientsCount} <span className="text-xs font-medium text-slate-400">/ {maxDraftClients} Toko</span>
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold pt-1 border-t border-slate-50">
            <span>Batas Penyimpanan Draft</span>
            <FileText className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>

        {/* Total Clients Card */}
        <div className="bg-white border border-brand-border rounded-[24px] p-5 space-y-3 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:border-slate-300 transition-all duration-300">
          <div className="space-y-1 text-left">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Klien</span>
            <span className="text-xl font-black text-brand-navy block tracking-tight">
              {totalClientsCount} <span className="text-xs font-medium text-slate-400">Terdaftar</span>
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold pt-1 border-t border-slate-50">
            <span>Jumlah Seluruh Toko</span>
            <Store className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>

        {/* Commission Placeholder Card */}
        <div className="bg-white border border-brand-border rounded-[24px] p-5 space-y-3 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:border-brand-teal/30 transition-all duration-300 opacity-90">
          <div className="space-y-1 text-left">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Komisi Agen</span>
            <span className="text-xs font-bold text-brand-teal block">
              Segera Hadir
            </span>
          </div>
          <div className="flex items-center justify-between text-[9px] text-slate-400 leading-tight pt-1 border-t border-slate-50">
            <span>Bagi hasil & komisi afiliasi otomatis</span>
            <Percent className="w-3.5 h-3.5 text-brand-teal shrink-0" />
          </div>
        </div>

      </div>

      {/* SECTION 3: MY CLIENTS TABLE */}
      <div className="bg-white border border-brand-border rounded-[24px] p-6 space-y-5 shadow-sm text-left">
        <div className="flex items-center justify-between border-b border-slate-50 pb-4">
          <div className="space-y-0.5">
            <h3 className="font-bold text-sm text-brand-navy">Klien Saya</h3>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Daftar Webstore Klien Yang Dikelola</p>
          </div>
          <span className="text-[10px] px-2 py-0.5 bg-slate-50 border border-brand-border rounded-full font-bold text-slate-500">
            {clients.length} Toko
          </span>
        </div>

        {clients.length === 0 ? (
          <div className="text-center py-12 px-6 space-y-4">
            <div className="w-12 h-12 bg-slate-50 border border-brand-border rounded-xl flex items-center justify-center text-xl mx-auto shadow-sm">
              📁
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-brand-navy">Belum ada klien terdaftar</h4>
              <p className="text-[10px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                Anda belum membuat toko klien apa pun. Hubungi pemilik UMKM untuk menawarkan pembuatan toko online mandiri.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-brand-border text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                  <th className="pb-3 pt-1">Nama Toko</th>
                  <th className="pb-3 pt-1">Domain/Subdomain</th>
                  <th className="pb-3 pt-1">Status Toko</th>
                  <th className="pb-3 pt-1">Kepemilikan</th>
                  <th className="pb-3 pt-1">Tanggal Dibuat</th>
                  <th className="pb-3 pt-1 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {clients.map((client) => {
                  const isActive = client.status === 'ACTIVE';
                  const isDraft = client.status === 'DRAFT';
                  
                  return (
                    <tr key={client.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="py-4 font-bold text-brand-navy">
                        {client.tenantName}
                      </td>
                      <td className="py-4 text-slate-500 font-semibold select-all">
                        {client.tenantSubdomain}.daganta.store
                      </td>
                      <td className="py-4">
                        {isDraft ? (
                          <span className="px-2.5 py-0.5 text-[9px] font-bold text-slate-600 bg-slate-100 border border-slate-200 rounded-md">
                            DRAFT
                          </span>
                        ) : isActive ? (
                          <span className="px-2.5 py-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md">
                            AKTIF
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 text-[9px] font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded-md">
                            {client.status}
                          </span>
                        )}
                      </td>
                      <td className="py-4">
                        <span className="px-2.5 py-0.5 text-[9px] font-bold text-blue-700 bg-blue-50 border border-blue-100 rounded-md">
                          {client.ownershipStatus === 'AGENT_MANAGED' ? 'DIKELOLA AGEN' : client.ownershipStatus}
                        </span>
                      </td>
                      <td className="py-4 text-slate-400 font-semibold">
                        {formatDate(client.createdAt)}
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex flex-col items-end gap-2">
                          {isDraft && (
                            <div className="space-y-2 text-right">
                              <div className="space-y-0.5">
                                <p className="text-[10px] font-extrabold text-brand-navy">
                                  Biaya aktivasi: {activationCost === null ? '-' : formatCurrency(activationCost)} kredit
                                </p>
                                <p className="text-[10px] font-semibold text-slate-400">
                                  Saldo akan dipotong saat toko diaktifkan.
                                </p>
                              </div>
                              <form action={activateAgentClientStoreAction.bind(null, client.id)}>
                                <button
                                  disabled={!isActiveAgent || activationCost === null || hasInsufficientActivationBalance || isActiveQuotaFull}
                                  type="submit"
                                  title={
                                    activationCost === null
                                      ? 'Paket aktivasi default belum tersedia.'
                                      : hasInsufficientActivationBalance
                                        ? 'Saldo kredit tidak cukup untuk mengaktifkan toko klien ini.'
                                        : isActiveQuotaFull
                                          ? 'Kuota toko aktif Anda sudah penuh.'
                                          : 'Aktifkan toko klien'
                                  }
                                  className="py-1.5 px-3 bg-brand-blue text-white border border-brand-blue hover:bg-blue-700 active:bg-blue-800 text-[10px] font-extrabold rounded-lg transition-all disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200"
                                >
                                  Aktifkan Toko
                                </button>
                              </form>
                            </div>
                          )}
                          {isActive && (
                            <span className="inline-flex rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-extrabold text-emerald-700">
                              Aktif
                            </span>
                          )}
                          <button
                            disabled
                            type="button"
                            title="Pengelolaan toko segera hadir"
                            className="py-1 px-3 bg-slate-50 text-slate-400 border border-slate-200 hover:bg-slate-100 active:bg-slate-200 text-[10px] font-bold rounded-lg transition-all cursor-not-allowed"
                          >
                            Kelola Toko
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 4: CREDIT LEDGER HISTORY */}
      <div className="bg-white border border-brand-border rounded-[24px] p-6 space-y-5 shadow-sm text-left">
        <div className="flex items-center justify-between border-b border-slate-50 pb-4">
          <div className="space-y-0.5">
            <h3 className="font-bold text-sm text-brand-navy">Riwayat Kredit</h3>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Aktivitas Dan Catatan Pemakaian Kredit Terbaru</p>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            10 Transaksi Terakhir
          </span>
        </div>

        {creditLedger.length === 0 ? (
          <div className="text-center py-12 px-6 space-y-4">
            <div className="w-12 h-12 bg-slate-50 border border-brand-border rounded-xl flex items-center justify-center text-xl mx-auto shadow-sm">
              💸
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-brand-navy">Belum ada riwayat transaksi</h4>
              <p className="text-[10px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                Akun Anda belum memiliki transaksi kredit terdaftar.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-brand-border text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                  <th className="pb-3 pt-1">Tanggal</th>
                  <th className="pb-3 pt-1">Tipe Transaksi</th>
                  <th className="pb-3 pt-1">Nominal</th>
                  <th className="pb-3 pt-1">Saldo Akhir</th>
                  <th className="pb-3 pt-1">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {creditLedger.map((ledger) => {
                  const isCredit = ledger.direction === 'CREDIT';
                  
                  // Translate ledger types to human readable Indonesian
                  let typeLabel: string = ledger.type;
                  if (ledger.type === 'TOP_UP') typeLabel = 'Top Up Kredit';
                  else if (ledger.type === 'STORE_ACTIVATION') typeLabel = 'Aktivasi Toko';
                  else if (ledger.type === 'STORE_RENEWAL') typeLabel = 'Perpanjangan Toko';
                  else if (ledger.type === 'REFUND') typeLabel = 'Pengembalian Dana';
                  else if (ledger.type === 'ADMIN_ADJUSTMENT') typeLabel = 'Penyesuaian Admin';
                  else if (ledger.type === 'TRANSFER_OUT') typeLabel = 'Transfer Keluar';
                  else if (ledger.type === 'TRANSFER_IN') typeLabel = 'Transfer Masuk';

                  return (
                    <tr key={ledger.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="py-4 text-slate-400 font-semibold">
                        {formatDate(ledger.createdAt)}
                      </td>
                      <td className="py-4">
                        <span className="inline-flex items-center gap-1 font-bold text-brand-navy">
                          {isCredit ? (
                            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          ) : (
                            <ArrowDownLeft className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          )}
                          {typeLabel}
                        </span>
                      </td>
                      <td className={`py-4 font-extrabold ${isCredit ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isCredit ? '+' : '-'}{formatCurrency(ledger.amount)}
                      </td>
                      <td className="py-4 text-slate-650 font-bold select-all">
                        {formatCurrency(ledger.balanceAfter)}
                      </td>
                      <td className="py-4 text-slate-500 font-semibold max-w-xs truncate leading-normal" title={ledger.description}>
                        {ledger.description}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

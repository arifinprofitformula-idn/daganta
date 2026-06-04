import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AlertCircle, ArrowLeft, Briefcase, Plus, Store } from 'lucide-react';
import { AgentStatus } from '@prisma/client';
import { getCurrentUserProfile } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { createAgentClientStoreAction } from '../actions';

export const dynamic = 'force-dynamic';

interface NewAgentClientStorePageProps {
  searchParams: Promise<{
    error?: string;
  }>;
}

function AccessState({
  title,
  message,
  tone = 'rose',
}: {
  title: string;
  message: string;
  tone?: 'rose' | 'amber';
}) {
  const toneClasses =
    tone === 'amber'
      ? 'bg-amber-50 border-amber-200 text-amber-600'
      : 'bg-rose-50 border-rose-200 text-rose-600';

  return (
    <div className="p-8 text-center bg-white border border-brand-border rounded-[24px] max-w-xl mx-auto shadow-sm my-12 font-sans select-none">
      <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center mx-auto mb-6 ${toneClasses}`}>
        <AlertCircle className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-extrabold text-brand-navy">{title}</h3>
      <p className="text-xs font-semibold text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed">
        {message}
      </p>
      <Link
        href="/dashboard/agent"
        className="inline-flex items-center justify-center gap-2 mt-6 rounded-xl border border-brand-border bg-white px-4 py-2.5 text-xs font-extrabold text-slate-600 shadow-sm transition hover:bg-slate-50"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Dashboard Agen
      </Link>
    </div>
  );
}

export default async function NewAgentClientStorePage({ searchParams }: NewAgentClientStorePageProps) {
  const params = await searchParams;
  const authData = await getCurrentUserProfile();

  if (!authData?.user) {
    redirect('/login');
  }

  if (!authData.profile) {
    return (
      <AccessState
        title="Akses Terbatas"
        message="Fitur ini hanya tersedia untuk akun agen Daganta."
      />
    );
  }

  const agentProfile = await prisma.agentProfile.findUnique({
    where: { userProfileId: authData.profile.id },
    select: {
      id: true,
      displayName: true,
      status: true,
      maxDraftClients: true,
      clients: {
        where: { status: 'DRAFT' },
        select: { id: true },
      },
    },
  });

  if (!agentProfile) {
    return (
      <AccessState
        title="Akses Terbatas"
        message="Fitur ini hanya tersedia untuk akun agen Daganta."
      />
    );
  }

  if (agentProfile.status === AgentStatus.PENDING) {
    return (
      <AccessState
        title="Profil Agen Menunggu Aktivasi"
        message="Profil agen Anda masih menunggu aktivasi."
        tone="amber"
      />
    );
  }

  if (agentProfile.status === AgentStatus.SUSPENDED || agentProfile.status === AgentStatus.ARCHIVED) {
    return (
      <AccessState
        title="Akun Agen Tidak Tersedia"
        message="Akun agen Anda sementara tidak dapat membuat toko klien."
      />
    );
  }

  const draftCount = agentProfile.clients.length;
  const quotaFull = draftCount >= agentProfile.maxDraftClients;

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10 font-sans select-none">
      <div className="flex flex-col gap-4 rounded-[24px] border border-brand-border bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Link
            href="/dashboard/agent"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 transition hover:text-brand-blue"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard Agen
          </Link>
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold tracking-tight text-brand-navy">
              Buat Toko Klien
            </h1>
            <p className="max-w-2xl text-xs font-semibold leading-relaxed text-slate-500">
              Buat draft webstore klien dalam mode aman. Aktivasi kredit, undangan pemilik, dan transfer kepemilikan akan tersedia pada tahap berikutnya.
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-600">
          Draft: {draftCount} / {agentProfile.maxDraftClients}
        </div>
      </div>

      {params.error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-xs font-bold leading-relaxed text-rose-700">
          {params.error}
        </div>
      )}

      {quotaFull && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-xs font-bold leading-relaxed text-amber-800">
          Kuota draft toko klien Anda sudah penuh. Selesaikan atau arsipkan draft sebelumnya untuk membuat toko baru.
        </div>
      )}

      <form action={createAgentClientStoreAction} className="grid gap-6 rounded-[24px] border border-brand-border bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="storeName" className="text-xs font-extrabold text-brand-navy">
              Nama toko klien
            </label>
            <div className="relative">
              <Store className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="storeName"
                name="storeName"
                type="text"
                minLength={3}
                required
                disabled={quotaFull}
                placeholder="Contoh: Warung Maju Jaya"
                className="w-full rounded-xl border border-brand-border bg-white py-3 pl-10 pr-4 text-sm font-semibold text-brand-navy outline-none transition placeholder:text-slate-300 focus:border-brand-blue disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="tenantSlug" className="text-xs font-extrabold text-brand-navy">
              Slug/subdomain toko klien
            </label>
            <div className="flex overflow-hidden rounded-xl border border-brand-border bg-white focus-within:border-brand-blue">
              <input
                id="tenantSlug"
                name="tenantSlug"
                type="text"
                minLength={3}
                maxLength={32}
                pattern="[a-z0-9-]+"
                required
                disabled={quotaFull}
                placeholder="warung-maju"
                className="min-w-0 flex-1 bg-white px-4 py-3 text-sm font-semibold text-brand-navy outline-none placeholder:text-slate-300 disabled:bg-slate-50 disabled:text-slate-400"
              />
              <span className="flex items-center border-l border-brand-border bg-slate-50 px-3 text-xs font-bold text-slate-400">
                .daganta.store
              </span>
            </div>
            <p className="text-[10px] font-semibold leading-relaxed text-slate-400">
              Gunakan huruf kecil, angka, dan tanda hubung. Tanpa spasi, underscore, awalan/akhiran tanda hubung, atau tanda hubung ganda.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="ownerName" className="text-xs font-extrabold text-brand-navy">
              Nama pemilik klien
            </label>
            <input
              id="ownerName"
              name="ownerName"
              type="text"
              required
              disabled={quotaFull}
              placeholder="Nama pemilik UMKM"
              className="w-full rounded-xl border border-brand-border bg-white px-4 py-3 text-sm font-semibold text-brand-navy outline-none transition placeholder:text-slate-300 focus:border-brand-blue disabled:bg-slate-50 disabled:text-slate-400"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="ownerEmail" className="text-xs font-extrabold text-brand-navy">
              Email pemilik klien
            </label>
            <input
              id="ownerEmail"
              name="ownerEmail"
              type="email"
              required
              disabled={quotaFull}
              placeholder="pemilik@email.com"
              className="w-full rounded-xl border border-brand-border bg-white px-4 py-3 text-sm font-semibold text-brand-navy outline-none transition placeholder:text-slate-300 focus:border-brand-blue disabled:bg-slate-50 disabled:text-slate-400"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="ownerWhatsapp" className="text-xs font-extrabold text-brand-navy">
              Nomor WhatsApp pemilik klien
            </label>
            <input
              id="ownerWhatsapp"
              name="ownerWhatsapp"
              type="tel"
              required
              disabled={quotaFull}
              placeholder="081234567890"
              className="w-full rounded-xl border border-brand-border bg-white px-4 py-3 text-sm font-semibold text-brand-navy outline-none transition placeholder:text-slate-300 focus:border-brand-blue disabled:bg-slate-50 disabled:text-slate-400"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="notes" className="text-xs font-extrabold text-brand-navy">
              Catatan internal agen
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              disabled={quotaFull}
              placeholder="Opsional, hanya untuk catatan internal."
              className="w-full resize-none rounded-xl border border-brand-border bg-white px-4 py-3 text-sm font-semibold text-brand-navy outline-none transition placeholder:text-slate-300 focus:border-brand-blue disabled:bg-slate-50 disabled:text-slate-400"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-[11px] font-semibold leading-relaxed text-slate-500">
          Draft toko tidak memotong saldo kredit, tidak membuat invoice, tidak mengirim email/WhatsApp, dan belum memberi akses login kepada pemilik klien.
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Link
            href="/dashboard/agent"
            className="inline-flex items-center justify-center rounded-xl border border-brand-border bg-white px-5 py-3 text-xs font-extrabold text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={quotaFull}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-blue px-5 py-3 text-xs font-extrabold uppercase tracking-wider text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
          >
            <Plus className="h-4 w-4" />
            Buat Draft Toko
          </button>
        </div>
      </form>
    </div>
  );
}

import React from 'react';
import { Settings, Save, AlertCircle } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getActiveTenantContext } from '@/lib/auth/tenant-access';

export const dynamic = 'force-dynamic';

export default async function Page() {
  // 1. Dapatkan konteks toko aktif dari membership pengguna sesi
  const tenantCtx = await getActiveTenantContext();
  if (tenantCtx.status !== 'SUCCESS' || !tenantCtx.activeTenant) {
    return null; // Layout induk sudah menangani AccountAccessState
  }

  // 2. Ambil informasi detail toko dari database ter-filter tenantId aktif
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantCtx.activeTenant.id },
    include: {
      owner: { select: { email: true } },
      addresses: {
        where: { isDefault: true },
        take: 1
      }
    }
  });

  const storeName = tenant?.name || '';
  const subdomain = tenant?.subdomain || '';
  const ownerEmail = tenant?.owner?.email || '';
  const addressDetail = tenant?.addresses?.[0];
  const addressString = addressDetail 
    ? `${addressDetail.streetAddress} (Postal: ${addressDetail.postalCode || '-'})`
    : 'Alamat gudang utama belum dikonfigurasi.';

  return (
    <div className="space-y-6 select-none">
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-5">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Pengaturan Toko</h1>
          <p className="text-xs text-slate-500 mt-1">Kelola profil toko online, alamat gudang pengiriman, dan konfigurasi integrasi</p>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Form Card */}
        <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 lg:col-span-2 space-y-6">
          <div className="border-b border-slate-950 pb-4">
            <h3 className="font-bold text-sm text-slate-100">Informasi Dasar Toko</h3>
          </div>

          <div className="space-y-4 text-xs">
            {/* Store Name Input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nama Toko</label>
                <input 
                  type="text" 
                  value={storeName} 
                  disabled
                  className="w-full bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-xl px-4 py-2.5 text-slate-300 font-medium cursor-not-allowed select-all focus:outline-none"
                />
              </div>

              {/* Subdomain Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Subdomain Toko</label>
                <div className="flex rounded-xl overflow-hidden border border-slate-850">
                  <span className="bg-slate-950/70 border-r border-slate-850 px-3 py-2.5 text-slate-550 font-mono select-none">https://</span>
                  <input 
                    type="text" 
                    value={subdomain} 
                    disabled
                    className="flex-1 bg-slate-950 px-4 py-2.5 text-slate-300 font-medium cursor-not-allowed select-all focus:outline-none"
                  />
                  <span className="bg-slate-950/70 border-l border-slate-850 px-3 py-2.5 text-slate-550 font-mono select-none">.daganta.store</span>
                </div>
              </div>
            </div>

            {/* WhatsApp Phone and Email Input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nomor WhatsApp Penerima</label>
                <input 
                  type="text" 
                  value="0812-XXXX-XXXX" 
                  disabled
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-slate-300 font-medium cursor-not-allowed select-all focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Kontak</label>
                <input 
                  type="text" 
                  value={ownerEmail} 
                  disabled
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-slate-300 font-medium cursor-not-allowed select-all focus:outline-none"
                />
              </div>
            </div>

            {/* Warehouse Address */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Alamat Gudang Utama (Pengiriman)</label>
              <textarea 
                value={addressString} 
                disabled
                rows={3}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-slate-300 font-medium cursor-not-allowed select-all focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Action button placeholder */}
          <div className="pt-2 border-t border-slate-950 flex justify-end">
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-2 py-2.5 px-4 bg-slate-900 border border-slate-800 text-slate-500 text-xs font-bold rounded-xl cursor-not-allowed select-none"
            >
              <Save className="w-4 h-4 shrink-0" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </div>

        {/* Sidebar Notice Card */}
        <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-950 pb-4 text-indigo-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <h3 className="font-bold text-sm text-slate-100">Informasi Penting</h3>
            </div>

            <div className="space-y-2 text-[10px] text-slate-400 leading-relaxed">
              <p>
                Konfigurasi di atas diambil secara *read-only* dari database utama secara *tenant-scoped* untuk toko aktif Anda.
              </p>
              <p>
                Dalam mode draf visual v0.1I, form di atas dikunci demi keamanan integritas database. Penyimpanan data konseptual dan submit form akan diaktifkan setelah integrasi otentikasi serta fungsionalitas admin selesai dipasang.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-950">
            <span className="text-[9px] text-slate-500 font-bold block select-none">
              Daganta Platform Version 0.1I
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

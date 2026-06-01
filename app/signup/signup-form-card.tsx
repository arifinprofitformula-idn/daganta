'use client';

import React, { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Store, 
  Globe, 
  ShieldAlert, 
  ArrowRight, 
  Sparkles,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { signupTenantAction } from '../actions/signup-tenant';

interface SignupFormCardProps {
  initialPlanSlug: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      suppressHydrationWarning={true}
      className="w-full h-12 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-black rounded-xl transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 border border-white/5 disabled:opacity-75 disabled:cursor-not-allowed text-xs tracking-wider uppercase"
    >
      {pending ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Membuat Toko...</span>
        </>
      ) : (
        <>
          <span>Buat Toko Online Sekarang</span>
          <ArrowRight className="w-4 h-4" />
        </>
      )}
    </button>
  );
}

export default function SignupFormCard({ initialPlanSlug }: SignupFormCardProps) {
  const router = useRouter();
  const [plan, setPlan] = useState(initialPlanSlug);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    formData.set('plan', plan);

    try {
      const res = await signupTenantAction(formData);
      
      if (res.success) {
        setIsSuccess(true);
        if (res.sessionCreated) {
          router.push('/dashboard');
        } else {
          router.push('/login?message=' + encodeURIComponent('Akun berhasil dibuat. Silakan masuk untuk mulai mengelola toko Anda.'));
        }
      } else {
        setErrorMsg(res.error || 'Terjadi kesalahan tidak terduga.');
      }
    } catch (err) {
      setErrorMsg('Gagal menghubungkan ke server. Silakan coba beberapa saat lagi.');
    }
  };

  return (
    <div className="w-full max-w-[500px] bg-white rounded-[24px] p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-slate-200/80 select-none">
      
      {/* Header */}
      <div className="text-center space-y-2 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-500/20 flex items-center justify-center text-blue-600 mx-auto shadow-sm">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h1 className="text-lg font-bold tracking-tight text-[#0B1F33]">
            Mulai trial gratis 14 hari
          </h1>
          <p className="text-slate-500 text-xs font-semibold leading-relaxed">
            Luncurkan webstore mandiri Anda tanpa kendala teknis
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 text-xs text-rose-700 leading-normal animate-in fade-in duration-300">
          <ShieldAlert className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-rose-800 block">Registrasi Dibatasi</span>
            <span className="font-medium">{errorMsg}</span>
          </div>
        </div>
      )}

      {/* Success Alert */}
      {isSuccess && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3 text-xs text-emerald-700 leading-normal animate-in fade-in duration-300">
          <CheckCircle className="w-5 h-5 shrink-0 text-emerald-500 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-emerald-800 block">Toko Berhasil Dibuat</span>
            <span className="font-medium">Menghubungkan ke dasbor kelola toko Anda...</span>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
        
        {/* Nama Pemilik */}
        <div className="space-y-1.5">
          <label htmlFor="ownerName" className="text-xs font-bold text-slate-700 tracking-wide block">
            Nama Pemilik
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
              <User className="w-4 h-4" />
            </div>
            <input
              id="ownerName"
              type="text"
              name="ownerName"
              placeholder="Contoh: Arifin Wijaya"
              required
              suppressHydrationWarning={true}
              className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-xl pl-11 pr-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all duration-200 font-medium"
            />
          </div>
        </div>

        {/* Email & WhatsApp Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-bold text-slate-700 tracking-wide block">
              Alamat Email
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="nama@email.com"
                required
                suppressHydrationWarning={true}
                className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-xl pl-11 pr-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all duration-200 font-medium"
              />
            </div>
          </div>

          {/* WhatsApp */}
          <div className="space-y-1.5">
            <label htmlFor="whatsapp" className="text-xs font-bold text-slate-700 tracking-wide block">
              Nomor WhatsApp
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <Phone className="w-4 h-4" />
              </div>
              <input
                id="whatsapp"
                type="text"
                name="whatsapp"
                placeholder="Contoh: 0812345678"
                required
                suppressHydrationWarning={true}
                className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-xl pl-11 pr-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all duration-200 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-xs font-bold text-slate-700 tracking-wide block">
            Kata Sandi Akun
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Minimal 6 karakter"
              required
              suppressHydrationWarning={true}
              className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-xl pl-11 pr-11 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all duration-200 font-medium"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-blue-500 transition-colors focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Nama Toko */}
        <div className="space-y-1.5">
          <label htmlFor="storeName" className="text-xs font-bold text-slate-700 tracking-wide block">
            Nama Toko
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
              <Store className="w-4 h-4" />
            </div>
            <input
              id="storeName"
              type="text"
              name="storeName"
              placeholder="Contoh: Toya Nusantara"
              required
              suppressHydrationWarning={true}
              className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-xl pl-11 pr-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all duration-200 font-medium"
            />
          </div>
        </div>

        {/* Subdomain / Slug Toko */}
        <div className="space-y-1.5">
          <label htmlFor="tenantSlug" className="text-xs font-bold text-slate-700 tracking-wide block">
            Alamat Toko (Subdomain)
          </label>
          <div className="relative group flex items-center">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
              <Globe className="w-4 h-4" />
            </div>
            <input
              id="tenantSlug"
              type="text"
              name="tenantSlug"
              placeholder="contoh-toko"
              required
              suppressHydrationWarning={true}
              className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-xl pl-11 pr-[110px] py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all duration-200 font-medium lowercase"
            />
            <span className="absolute right-3.5 text-[11px] font-bold text-slate-400 select-none">
              .daganta.store
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium block leading-normal">
            Hanya huruf kecil, angka, dan tanda hubung (-). Contoh: <code>toya-nusantara</code>
          </span>
        </div>

        {/* Paket Pilihan */}
        <div className="space-y-1.5">
          <label htmlFor="plan-select" className="text-xs font-bold text-slate-700 tracking-wide block">
            Pilih Paket Toko
          </label>
          <select
            id="plan-select"
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            suppressHydrationWarning={true}
            className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-xl px-3.5 py-3 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all font-semibold outline-none"
          >
            <option value="starter">Starter (Maksimal 20 Produk)</option>
            <option value="growth">Growth (Maksimal 100 Produk)</option>
            <option value="pro">Pro (Maksimal 500 Produk)</option>
          </select>
        </div>

        {/* Onboarding info copy */}
        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-1.5 text-[10.5px] leading-relaxed text-slate-500 font-medium shadow-inner">
          <p className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Toko Anda akan aktif tanpa biaya selama masa trial.</span>
          </p>
          <p className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Tidak ada komisi transaksi dari Daganta pada masa MVP.</span>
          </p>
          <p className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Anda bisa mulai menambahkan produk setelah toko berhasil dibuat.</span>
          </p>
        </div>

        {/* CTA Submit Button */}
        <div className="pt-2">
          <SubmitButton />
        </div>

      </form>
      
    </div>
  );
}

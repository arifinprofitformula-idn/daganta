'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { login } from './actions';

interface LoginFormProps {
  errorMessage?: string;
  infoMessage?: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="group flex h-[58px] w-full items-center justify-center rounded-[14px] bg-gradient-to-br from-[#2563EB] to-[#14B8A6] px-5 text-base font-bold text-white shadow-xl shadow-blue-500/25 transition duration-200 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-blue-500/30 disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-75"
    >
      {pending ? 'Memproses...' : 'Masuk'}
    </button>
  );
}

export default function LoginForm({ errorMessage, infoMessage }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="rounded-[28px] border border-[#E2E8F0] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.12)] sm:p-10 lg:p-12">
      <div>
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#2563EB]">
          <ShieldCheck className="h-6 w-6" aria-hidden="true" />
        </div>
        <h2 className="mt-6 text-3xl font-black tracking-tight text-[#0F172A]">
          Selamat datang kembali
        </h2>
        <p className="mt-2 text-base leading-7 text-[#64748B]">
          Masuk untuk mengelola webstore Anda.
        </p>
      </div>

      {infoMessage ? (
        <div className="mt-7 rounded-2xl border border-teal-100 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800">
          {infoMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="mt-7 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      ) : null}

      <form action={login} className="mt-8 space-y-5">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-bold text-[#0F172A]">
            Email
          </label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#64748B]"
              aria-hidden="true"
            />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="nama@tokoonline.com"
              required
              className="h-14 w-full rounded-[14px] border border-[#CBD5E1] bg-white pl-12 pr-4 text-base font-medium text-[#0F172A] outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-[#2563EB] focus:ring-4 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-bold text-[#0F172A]">
            Password
          </label>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#64748B]"
              aria-hidden="true"
            />
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Masukkan password"
              required
              className="h-14 w-full rounded-[14px] border border-[#CBD5E1] bg-white pl-12 pr-12 text-base font-medium text-[#0F172A] outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-[#2563EB] focus:ring-4 focus:ring-blue-100"
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-1 text-[#64748B] transition hover:bg-slate-100 hover:text-[#2563EB] focus:outline-none focus:ring-2 focus:ring-blue-200"
              aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Eye className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 pt-1 text-sm">
          <label className="flex cursor-pointer items-center gap-2 font-semibold text-[#64748B]">
            <input
              type="checkbox"
              name="remember"
              className="h-4 w-4 rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB]"
            />
            Ingat saya
          </label>
          <button
            type="button"
            className="font-bold text-[#2563EB] transition hover:text-[#1D4ED8] hover:underline"
          >
            Lupa password?
          </button>
        </div>

        <SubmitButton />

        <div className="relative py-2 text-center">
          <div className="absolute inset-x-0 top-1/2 border-t border-[#E2E8F0]" />
          <span className="relative bg-white px-4 text-sm font-semibold text-[#64748B]">
            atau masuk dengan
          </span>
        </div>

        <button
          type="button"
          className="flex h-14 w-full items-center justify-center gap-3 rounded-[14px] border border-[#E2E8F0] bg-white text-base font-bold text-[#0F172A] shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#EA4335"
              d="M12 5.04c1.62 0 3.08.56 4.22 1.65l3.15-3.15C17.45 1.76 14.93 1 12 1 7.35 1 3.4 3.65 1.5 7.5l3.8 2.95C6.2 7.2 8.85 5.04 12 5.04z"
            />
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.47h6.44c-.28 1.48-1.12 2.73-2.38 3.58l3.7 2.87c2.16-2 3.73-4.94 3.73-8.56z"
            />
            <path
              fill="#FBBC05"
              d="M5.3 14.55A7.16 7.16 0 0 1 4.9 12c0-.88.15-1.74.4-2.55L1.5 6.5A11.94 11.94 0 0 0 0 12c0 2.05.52 4 1.5 5.5l3.8-2.95z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.24 0 5.97-1.08 7.96-2.92l-3.7-2.87c-1.03.69-2.35 1.1-4.26 1.1-3.15 0-5.8-2.16-6.75-5.41L1.45 15.8C3.35 19.65 7.3 23 12 23z"
            />
          </svg>
          Masuk dengan Google
        </button>
      </form>

      <p className="mt-8 text-center text-sm font-medium text-[#64748B]">
        Belum punya akun?{' '}
        <span className="font-bold text-[#2563EB]">Hubungi admin Daganta</span>
      </p>
    </div>
  );
}

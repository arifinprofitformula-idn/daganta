'use client';

import React, { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  ShieldAlert,
  ArrowRight,
  Check
} from 'lucide-react';
import { login } from './actions';

interface LoginFormCardProps {
  errorMsg?: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full h-12 bg-brand-navy hover:bg-[#152e4a] active:bg-[#071524] text-white font-semibold rounded-xl transition-all duration-300 shadow-[0_0_12px_rgba(20,184,166,0.12)] hover:shadow-[0_0_20px_rgba(20,184,166,0.25)] flex items-center justify-center gap-2 border border-white/5 disabled:opacity-75 disabled:cursor-not-allowed text-sm tracking-wide"
    >
      {pending ? (
        <>
          <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Menghubungkan ke Dasbor...</span>
        </>
      ) : (
        <>
          <span>Masuk ke Dasbor Toko</span>
          <ArrowRight className="w-4 h-4" />
        </>
      )}
    </button>
  );
}

export default function LoginFormCard({ errorMsg }: LoginFormCardProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <div className="w-full max-w-[460px] bg-white rounded-[24px] p-8 md:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-brand-border select-none">
      
      {/* Top Logo and Header */}
      <div className="flex flex-col items-center text-center space-y-3 mb-6">
        
        {/* Official Logo Brand Asset */}
        <div className="w-32 h-auto flex items-center justify-center">
          <img
            src="/logo.png"
            alt="Daganta Logo"
            className="w-full h-auto object-contain"
          />
        </div>
        
        <div className="space-y-1">
          <h1 className="text-lg font-bold tracking-tight text-brand-navy">
            Masuk ke Panel Daganta
          </h1>
          <p className="text-slate-500 text-xs font-semibold">
            Kelola toko Anda dengan lebih rapi dan mandiri
          </p>
        </div>
      </div>

      {/* Error Alert Display */}
      {errorMsg && (
        <div className="mb-6 p-4 bg-rose-50/50 border border-rose-100 rounded-2xl flex items-start gap-3 text-xs text-rose-700 leading-normal animate-in fade-in slide-in-from-top-4 duration-300">
          <ShieldAlert className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-rose-800 block">Gagal Masuk</span>
            <span className="font-medium text-rose-605">{errorMsg}</span>
          </div>
        </div>
      )}

      {/* Login Form */}
      <form action={login} className="space-y-5 text-sm">
        
        {/* Email input field */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 tracking-wide block">
            Alamat Email
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-blue transition-colors">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              name="email"
              placeholder="nama@toko.com"
              required
              className="w-full bg-white border border-brand-border hover:border-slate-300 focus:border-brand-blue rounded-xl pl-11 pr-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/5 transition-all duration-200 font-medium"
            />
          </div>
        </div>

        {/* Password input field */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 tracking-wide block">
            Kata Sandi
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-blue transition-colors">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Masukkan kata sandi"
              required
              className="w-full bg-white border border-brand-border hover:border-slate-300 focus:border-brand-blue rounded-xl pl-11 pr-11 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/5 transition-all duration-200 font-medium"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-brand-blue transition-colors focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Options Row (Remember Me & Forgot Password) */}
        <div className="flex items-center justify-between text-xs font-medium pt-1">
          <label className="flex items-center gap-2 cursor-pointer group text-slate-600">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-brand-border text-brand-blue focus:ring-brand-blue focus:ring-offset-0 cursor-pointer"
            />
            <span className="group-hover:text-brand-navy transition-colors">
              Ingat Saya
            </span>
          </label>

          <a 
            href="#" 
            className="text-brand-blue hover:text-brand-blue/80 hover:underline transition-colors focus:outline-none"
            onClick={(e) => e.preventDefault()}
          >
            Lupa Kata Sandi?
          </a>
        </div>

        {/* Primary Submit Button */}
        <div className="pt-2">
          <SubmitButton />
        </div>

        {/* Divider "atau" */}
        <div className="relative flex items-center justify-center py-2">
          <div className="absolute inset-x-0 border-t border-brand-border" />
          <span className="relative px-3 bg-white text-[11px] text-slate-400 uppercase tracking-wider font-bold">
            atau
          </span>
        </div>

        {/* Google SSO Button (UI Placeholder) */}
        <button
          type="button"
          onClick={() => {}}
          className="w-full h-12 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-705 font-semibold rounded-xl border border-brand-border transition-all duration-200 flex items-center justify-center gap-2.5 text-xs focus:outline-none"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
          <span className="font-semibold text-slate-700">Masuk dengan Google</span>
        </button>
      </form>

      {/* Trust Section Grid */}
      <div className="mt-8 pt-6 border-t border-brand-border grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs text-slate-600 font-medium">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-brand-teal shrink-0">
            <Check className="w-2.5 h-2.5 stroke-[3]" />
          </span>
          <span className="text-[11px] truncate">Data toko aman</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-brand-teal shrink-0">
            <Check className="w-2.5 h-2.5 stroke-[3]" />
          </span>
          <span className="text-[11px] truncate">Support WhatsApp</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-brand-teal shrink-0">
            <Check className="w-2.5 h-2.5 stroke-[3]" />
          </span>
          <span className="text-[11px] truncate">Infrastruktur cloud modern</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-brand-teal shrink-0">
            <Check className="w-2.5 h-2.5 stroke-[3]" />
          </span>
          <span className="text-[11px] truncate">Multi-tenant secure</span>
        </div>
      </div>
      
    </div>
  );
}

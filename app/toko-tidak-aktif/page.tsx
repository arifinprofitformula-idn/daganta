import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

export default function InactiveStorePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-white">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-amber-500/30 bg-amber-950 text-amber-300">
          <AlertCircle className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-50">
          Toko tidak aktif
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Toko ini sedang tidak aktif. Silakan hubungi pemilik toko.
        </p>
        <Link
          href="https://daganta.store"
          className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white"
        >
          Kembali ke Daganta
        </Link>
      </section>
    </main>
  );
}

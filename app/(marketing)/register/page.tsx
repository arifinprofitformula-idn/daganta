import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import SignupFormCard from '@/app/signup/signup-form-card';

export const dynamic = 'force-dynamic';

interface RegisterPageProps {
  searchParams: Promise<{
    plan?: string;
  }>;
}

const ALLOWED_PLANS = new Set(['starter', 'growth', 'pro']);

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const user = await getCurrentUser();

  if (user) {
    redirect('/dashboard');
  }

  const resolvedParams = await searchParams;
  let planSlug = (resolvedParams.plan || 'starter').trim().toLowerCase();

  if (!ALLOWED_PLANS.has(planSlug)) {
    planSlug = 'starter';
  }

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-[#F8FAFC] via-[#EEF6FF] to-[#F8FAFC] px-4 py-8 text-[#0B1F33] sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[1fr_500px]">
          <section className="hidden space-y-6 lg:block">
            <div className="inline-flex rounded-full border border-blue-100 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-600 shadow-sm">
              Trial gratis 14 hari
            </div>
            <div className="space-y-4">
              <h1 className="max-w-xl text-5xl font-black leading-tight tracking-tight">
                Buat webstore Daganta untuk toko Anda.
              </h1>
              <p className="max-w-lg text-base font-semibold leading-relaxed text-slate-500">
                Kelola produk, pesanan, pelanggan, dan alur WhatsApp-first commerce dari satu dashboard mandiri.
              </p>
            </div>
          </section>

          <SignupFormCard initialPlanSlug={planSlug} />
        </div>
      </div>
    </main>
  );
}

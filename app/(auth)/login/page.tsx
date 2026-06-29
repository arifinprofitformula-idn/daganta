import Image from 'next/image';
import {
  BarChart3,
  Boxes,
  CheckCircle2,
  Globe2,
  MessageCircle,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import LoginForm from './login-form';

interface LoginPageProps {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
}

const benefits = [
  {
    title: 'Webstore Profesional',
    description: 'Tampilan modern, domain custom, dan fitur lengkap.',
    icon: Globe2,
  },
  {
    title: 'Kelola Lebih Mudah',
    description: 'Dashboard intuitif untuk kelola produk, pesanan, dan pelanggan.',
    icon: Boxes,
  },
  {
    title: 'Terhubung ke Pelanggan',
    description: 'WhatsApp, katalog digital, dan komunikasi lebih dekat.',
    icon: MessageCircle,
  },
];

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F8FAFC] text-[#0F172A]">
      <div className="relative isolate min-h-screen">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_16%_18%,rgba(56,189,248,0.22),transparent_30%),radial-gradient(circle_at_82%_12%,rgba(20,184,166,0.16),transparent_28%),linear-gradient(135deg,#ffffff_0%,#f8fafc_44%,#eaf6ff_100%)]" />
        <div className="absolute left-0 top-0 -z-10 h-full w-full opacity-[0.32] [background-image:linear-gradient(to_right,rgba(37,99,235,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(37,99,235,0.08)_1px,transparent_1px)] [background-size:44px_44px]" />

        <div className="mx-auto grid min-h-screen w-full max-w-[1440px] grid-cols-1 lg:grid-cols-[1.08fr_0.92fr]">
          <section className="relative flex min-h-[540px] flex-col px-5 py-8 sm:px-8 lg:min-h-screen lg:px-14 lg:py-12 xl:px-20">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-[#2563EB] shadow-lg shadow-blue-500/20">
                <Image
                  src="/logo.png"
                  alt="Daganta"
                  width={44}
                  height={44}
                  className="h-10 w-10 object-contain"
                  priority
                />
              </div>
              <div>
                <p className="text-xl font-black tracking-tight text-[#0B1F33]">Daganta</p>
                <p className="bg-gradient-to-r from-[#2563EB] to-[#14B8A6] bg-clip-text text-[11px] font-bold uppercase tracking-[0.28em] text-transparent">
                  Webstore OS
                </p>
              </div>
            </div>

            <div className="mt-10 max-w-2xl lg:mt-16">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-4 py-2 text-sm font-semibold text-[#2563EB] shadow-sm shadow-blue-100/60 backdrop-blur">
                <Sparkles className="h-4 w-4 text-[#14B8A6]" aria-hidden="true" />
                Webstore Instan untuk UMKM Naik Kelas
              </div>

              <h1 className="mt-7 text-4xl font-black leading-[1.06] tracking-tight text-[#0B1F33] sm:text-5xl xl:text-[64px]">
                Kelola webstore Anda dengan{' '}
                <span className="bg-gradient-to-r from-[#2563EB] to-[#14B8A6] bg-clip-text text-transparent">
                  lebih mudah dan profesional.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-8 text-[#64748B] sm:text-lg">
                Daganta membantu UMKM membangun, mengelola, dan mengembangkan toko online
                profesional dalam satu platform yang mudah digunakan.
              </p>
            </div>

            <div className="mt-8 grid max-w-2xl gap-4">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;

                return (
                  <div
                    key={benefit.title}
                    className="flex items-start gap-4 rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm shadow-blue-100/50 backdrop-blur"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#14B8A6] text-white shadow-lg shadow-blue-500/20">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h2 className="font-bold text-[#0B1F33]">{benefit.title}</h2>
                      <p className="mt-1 text-sm leading-6 text-[#64748B]">{benefit.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="relative mt-10 hidden min-h-[290px] max-w-3xl lg:block">
              <div className="absolute left-0 top-6 w-[560px] rounded-[28px] border border-slate-200 bg-white p-4 shadow-2xl shadow-blue-900/10">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-rose-300" />
                    <span className="h-3 w-3 rounded-full bg-amber-300" />
                    <span className="h-3 w-3 rounded-full bg-[#14B8A6]" />
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#2563EB]">
                    Dashboard Toko
                  </span>
                </div>
                <div className="grid grid-cols-[0.8fr_1.2fr] gap-4 pt-4">
                  <div className="space-y-3 rounded-2xl bg-slate-50 p-3">
                    {['Produk', 'Pesanan', 'Pelanggan', 'Promosi'].map((item, index) => (
                      <div
                        key={item}
                        className={`h-9 rounded-xl ${index === 1 ? 'bg-[#2563EB] text-white' : 'bg-white text-slate-500'} flex items-center px-3 text-xs font-bold shadow-sm`}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        ['Omzet', '+28%'],
                        ['Pesanan', '132'],
                        ['Produk', '48'],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
                          <p className="text-[10px] font-semibold text-slate-400">{label}</p>
                          <p className="mt-1 text-lg font-black text-[#0B1F33]">{value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                      <div className="mb-4 flex items-center justify-between">
                        <p className="text-xs font-bold text-[#0B1F33]">Pertumbuhan Penjualan</p>
                        <TrendingUp className="h-4 w-4 text-[#14B8A6]" aria-hidden="true" />
                      </div>
                      <div className="flex h-24 items-end gap-2">
                        {[36, 52, 44, 70, 58, 84, 76, 96].map((height, index) => (
                          <span
                            key={index}
                            className="flex-1 rounded-t-lg bg-gradient-to-t from-[#2563EB] to-[#38BDF8]"
                            style={{ height: `${height}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-0 left-[420px] w-[150px] rounded-[30px] border border-slate-200 bg-white p-2 shadow-2xl shadow-teal-900/10">
                <div className="rounded-[24px] bg-slate-50 p-3">
                  <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-slate-300" />
                  <div className="rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#14B8A6] p-3 text-white">
                    <Smartphone className="h-5 w-5" aria-hidden="true" />
                    <p className="mt-6 text-xs font-bold">Katalog Digital</p>
                  </div>
                  <div className="mt-3 space-y-2">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="flex items-center gap-2 rounded-xl bg-white p-2">
                        <span className="h-8 w-8 rounded-lg bg-blue-100" />
                        <span className="h-2 flex-1 rounded-full bg-slate-200" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="absolute left-[38px] top-[238px] flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl shadow-blue-900/10">
                <ShoppingBag className="h-5 w-5 text-[#2563EB]" aria-hidden="true" />
                <div>
                  <p className="text-xs font-bold text-[#0B1F33]">12 pesanan baru</p>
                  <p className="text-[11px] text-slate-400">Siap diproses hari ini</p>
                </div>
              </div>

              <div className="absolute left-[300px] top-[18px] flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl shadow-teal-900/10">
                <BarChart3 className="h-5 w-5 text-[#14B8A6]" aria-hidden="true" />
                <div>
                  <p className="text-xs font-bold text-[#0B1F33]">Konversi naik</p>
                  <p className="text-[11px] text-slate-400">Katalog tampil optimal</p>
                </div>
              </div>
            </div>

            <div className="mt-auto hidden pt-8 lg:block">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-sm font-semibold text-[#0B1F33] shadow-sm">
                <ShieldCheck className="h-4 w-4 text-[#14B8A6]" aria-hidden="true" />
                Aman & Terpercaya · Data bisnis Anda selalu terlindungi
              </div>
            </div>
          </section>

          <section className="flex items-center justify-center px-5 pb-10 pt-2 sm:px-8 lg:min-h-screen lg:px-12 lg:py-12">
            <div className="w-full max-w-[560px]">
              <LoginForm
                errorMessage={resolvedSearchParams.error}
                infoMessage={resolvedSearchParams.message}
              />

              <div className="mt-7 grid grid-cols-1 gap-3 text-sm font-semibold text-[#64748B] sm:grid-cols-3">
                {[
                  ['Keamanan Terjamin', ShieldCheck],
                  ['Backup Harian', CheckCircle2],
                  ['Support 24/7', MessageCircle],
                ].map(([label, Icon]) => {
                  const TrustIcon = Icon as typeof ShieldCheck;

                  return (
                    <div
                      key={label as string}
                      className="flex items-center justify-center gap-2 rounded-2xl border border-white/80 bg-white/70 px-3 py-3 shadow-sm backdrop-blur"
                    >
                      <TrustIcon className="h-4 w-4 text-[#2563EB]" aria-hidden="true" />
                      <span>{label as string}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

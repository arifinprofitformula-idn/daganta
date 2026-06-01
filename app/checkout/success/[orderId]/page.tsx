import { headers } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { resolveTenantFromHost } from '../../../../lib/tenant/resolve-tenant';
import { prisma } from '../../../../lib/prisma';
import { getTenantThemeConfig, TenantThemeConfig } from '../../../../lib/tenant/theme-config';
import MarketingHome from '../../../../components/marketing/marketing-home';

interface PageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export default async function SuccessPage({ params }: PageProps) {
  const { orderId } = await params;
  const headersList = await headers();
  const host = headersList.get('host') ?? '';

  // 1. Resolusi Tenant
  const result = await resolveTenantFromHost(host);

  if (result.status === 'MARKETING_SITE') {
    return <MarketingHome />;
  }

  if (result.status === 'NOT_FOUND') {
    return notFound();
  }

  const tenant = result.tenant!;
  const theme: TenantThemeConfig = getTenantThemeConfig(tenant.slug);

  // 2. Fetch Order with strict tenantId validation (tenant-scoped query)
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      tenantId: tenant.id,
    },
    include: {
      customer: true,
      items: true,
    },
  });

  if (!order) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-6 shadow-2xl">
          <div className="mx-auto w-16 h-16 bg-rose-950 border border-rose-500/30 rounded-full flex items-center justify-center text-rose-400">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">Pesanan Tidak Ditemukan</h1>
            <p className="text-slate-400 text-sm">
              Maaf, pesanan yang Anda cari tidak dapat ditemukan atau tidak berada di bawah toko ini.
            </p>
          </div>
          <div className="pt-2">
            <Link 
              href="/" 
              className="inline-block w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-all shadow-lg text-sm"
            >
              Kembali ke Toko
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // 3. Ambil nomor WhatsApp dari database alamat default tenant
  const address = await prisma.address.findFirst({
    where: {
      tenantId: tenant.id,
      isDefault: true,
    },
  });

  let tenantPhone = address?.phone || null;
  if (!tenantPhone) {
    const anyAddress = await prisma.address.findFirst({
      where: {
        tenantId: tenant.id,
      },
    });
    tenantPhone = anyAddress?.phone || null;
  }

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // 4. Buat URL WhatsApp dinamis jika ada
  let whatsappUrl = null;
  if (tenantPhone) {
    let normalizedPhone = tenantPhone.replace(/[^0-9]/g, '');
    if (normalizedPhone.startsWith('0')) {
      normalizedPhone = '62' + normalizedPhone.substring(1);
    }
    const message = `Halo ${tenant.name}, saya baru saja membuat pesanan dengan detail berikut:\n\n` +
      `*Nomor Pesanan:* ${order.orderNumber}\n` +
      `*Nama:* ${order.customer?.name || '-'}\n` +
      `*WhatsApp:* ${order.customer?.phone || '-'}\n\n` +
      `*Daftar Produk:*\n` +
      order.items
        .map(
          (item) =>
            `- ${item.productNameSnapshot}${
              item.variantNameSnapshot ? ` (${item.variantNameSnapshot})` : ''
            } x${item.quantity} (${formatRupiah(Number(item.unitPrice))})`
        )
        .join('\n') +
      `\n\n*Total Tagihan:* ${formatRupiah(Number(order.grandTotal))}\n\n` +
      `Mohon dibantu konfirmasi instruksi pembayaran manual dan kelanjutan pengirimannya. Terima kasih!`;

    whatsappUrl = `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
  }

  return (
    <div 
      className="min-h-screen bg-slate-50/50 text-slate-800 flex flex-col font-sans select-none antialiased"
      style={{ 
        '--primary': theme.primaryColor, 
        '--secondary': theme.secondaryColor,
        '--accent': theme.accentColor,
        '--primary-hover': theme.hoverColor
      } as React.CSSProperties}
    >
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center shadow-md">
              <span className="font-extrabold text-xs text-white uppercase">{tenant.name.substring(0, 1)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black tracking-tight text-slate-800 uppercase leading-none">{tenant.name}</span>
              <span className="text-[9px] text-slate-400 font-mono mt-0.5 leading-none">{tenant.subdomain}.daganta.store</span>
            </div>
          </Link>
          <Link 
            href="/"
            className="px-4 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-650 hover:text-slate-800 text-xs font-bold rounded-xl transition-all shadow-sm"
          >
            Kembali ke Toko
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-10">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm space-y-8">
          
          {/* Success Banner */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-50 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-600 mx-auto shadow-inner">
              <svg className="w-8 h-8 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="space-y-1">
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Pesanan Berhasil Dibuat!</h1>
              <p className="text-xs text-slate-500 font-medium">Terima kasih atas pesanan Anda di {tenant.name}.</p>
            </div>
          </div>

          {/* Info Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 border border-slate-100 rounded-2xl p-5 text-xs">
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Detail Pesanan</span>
              <p className="text-slate-600 font-medium">Nomor Pesanan: <strong className="text-slate-800">{order.orderNumber}</strong></p>
              <p className="text-slate-600 font-medium">Tanggal: <span className="text-slate-800 font-bold">{new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span></p>
              <p className="text-slate-600 font-medium">Status: <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-500/10 font-bold text-[9px] uppercase tracking-wide">Menunggu Pembayaran</span></p>
            </div>
            
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Alamat Pengiriman</span>
              <p className="text-slate-850 font-bold leading-tight">{order.customer?.name}</p>
              <p className="text-slate-600 font-medium">{order.customer?.phone}</p>
              <p className="text-slate-500 font-medium leading-relaxed whitespace-pre-line">{order.customer?.address}</p>
            </div>
          </div>

          {/* Items Summary list */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
              Rincian Belanja
            </h3>
            
            <div className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <div key={item.id} className="py-3.5 flex justify-between gap-4 text-xs font-medium">
                  <div className="space-y-0.5">
                    <p className="text-slate-800 font-bold leading-snug">{item.productNameSnapshot}</p>
                    {item.variantNameSnapshot && (
                      <p className="text-[10px] text-slate-400 font-semibold">Varian: {item.variantNameSnapshot}</p>
                    )}
                    <p className="text-[10px] text-slate-500 font-medium">Kuantitas: {item.quantity} unit</p>
                  </div>
                  <span className="text-slate-700 font-bold shrink-0">{formatRupiah(Number(item.totalPrice))}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-150 flex items-center justify-between text-xs">
              <span className="font-black text-slate-800 uppercase">Total Tagihan</span>
              <span className="text-base font-black text-[var(--primary)]">{formatRupiah(Number(order.grandTotal))}</span>
            </div>
          </div>

          {/* Payment Instructions & Action */}
          <div className="pt-4 border-t border-slate-100 space-y-6">
            <div className="p-5 bg-amber-50 border border-amber-200/50 rounded-2xl space-y-2 text-xs font-medium leading-relaxed shadow-inner">
              <h4 className="font-black uppercase tracking-wider text-amber-800 text-[10px] flex items-center gap-1.5">
                <span>⚠️ Instruksi Pembayaran Manual</span>
              </h4>
              <p className="text-amber-850">
                Instruksi pembayaran manual akan dikonfirmasi oleh admin toko melalui WhatsApp.
              </p>
            </div>

            {/* WhatsApp CTA (only visible if tenant phone exists) */}
            {whatsappUrl && (
              <div className="space-y-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-emerald-100 hover:scale-[1.01]"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.588 2.025 14.11 1 11.48 1c-5.44 0-9.866 4.372-9.87 9.802 0 1.714.45 3.387 1.302 4.887L1.888 20.3l4.759-1.146z" />
                  </svg>
                  <span>Konfirmasi via WhatsApp</span>
                </a>
                <p className="text-[10px] text-slate-400 font-medium text-center">
                  Silakan klik tombol di atas untuk mengirimkan konfirmasi pesanan langsung ke admin kami melalui WhatsApp.
                </p>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto px-6 space-y-2">
          <p>&copy; {new Date().getFullYear()} {tenant.name}. Seluruh hak cipta dilindungi.</p>
          <p className="text-[10px] text-slate-350">
            Didukung oleh <a href="https://daganta.store" className="hover:underline text-[var(--primary)] font-bold">Daganta Storefront Platform</a>
          </p>
        </div>
      </footer>
    </div>
  );
}

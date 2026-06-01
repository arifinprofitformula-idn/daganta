import { headers } from 'next/headers';
import Link from 'next/link';
import { resolveTenantFromHost } from '../../../lib/tenant/resolve-tenant';
import { getProductBySlug } from '../../../lib/data-access/products';
import { prisma } from '../../../lib/prisma';
import MarketingHome from '../../../components/marketing/marketing-home';
import ProductDetail from '../../../components/storefront/product-detail';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const headersList = await headers();
  const host = headersList.get('host') ?? '';

  // 1. Resolusi Tenant berdasarkan domain host aktif
  const result = await resolveTenantFromHost(host);

  if (result.status === 'MARKETING_SITE') {
    return <MarketingHome />;
  }

  if (result.status === 'NOT_FOUND') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-6 shadow-2xl">
          <div className="mx-auto w-16 h-16 bg-indigo-950 border border-indigo-500/30 rounded-full flex items-center justify-center text-indigo-400">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">Toko Tidak Ditemukan</h1>
            <p className="text-slate-400 text-sm">
              Maaf, kami tidak dapat menemukan toko online dengan alamat domain <code className="px-2 py-1 bg-slate-950 border border-slate-800 rounded font-mono text-indigo-300 text-xs">{host}</code>.
            </p>
          </div>
          <div className="pt-2">
            <a 
              href="https://daganta.store" 
              className="inline-block w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-600/20 text-sm"
            >
              Kembali ke Daganta
            </a>
          </div>
        </div>
      </main>
    );
  }

  if (result.status === 'BLOCKED') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-6 shadow-2xl">
          <div className="mx-auto w-16 h-16 bg-rose-950 border border-rose-500/30 rounded-full flex items-center justify-center text-rose-400">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">Toko Dinonaktifkan</h1>
            <p className="text-slate-400 text-sm">
              Toko online pada alamat <code className="px-2 py-1 bg-slate-950 border border-slate-800 rounded font-mono text-rose-300 text-xs">{host}</code> saat ini sedang dinonaktifkan atau ditangguhkan oleh platform.
            </p>
          </div>
          <div className="pt-2">
            <a 
              href="mailto:support@daganta.id" 
              className="inline-block w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 font-medium rounded-xl transition-all border border-slate-700 text-sm"
            >
              Hubungi Dukungan Daganta
            </a>
          </div>
        </div>
      </main>
    );
  }

  const tenant = result.tenant!;
  const isReadOnly = result.accessMode === 'STOREFRONT_READONLY';

  // 2. Fetch data produk dari database menggunakan helper tenant-scoped
  const product = await getProductBySlug(tenant.id, slug);

  // Jika produk tidak ditemukan atau statusnya tidak aktif, tampilkan fallback 404 berkonteks toko
  if (!product || product.status !== 'ACTIVE') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none antialiased">
        <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center">
                <span className="font-extrabold text-sm text-white uppercase">{tenant.name.substring(0, 1)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight text-white leading-tight">{tenant.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">{tenant.subdomain}.daganta.store</span>
              </div>
            </Link>
            <div>
              <Link 
                href="/"
                className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-350 hover:text-slate-200 text-xs font-semibold rounded-lg transition-all"
              >
                Kembali ke Toko
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-md mx-auto flex flex-col items-center justify-center p-6 text-center space-y-6">
          <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-500 shadow-2xl">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-white">Produk Tidak Ditemukan</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Maaf, produk yang Anda cari tidak tersedia, sedang tidak aktif, atau telah dihapus dari etalase {tenant.name}.
            </p>
          </div>
          <Link 
            href="/"
            className="inline-block w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md"
          >
            Lihat Produk Lain di Toko
          </Link>
        </main>

        <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500 mt-12">
          <div className="max-w-7xl mx-auto px-6 space-y-2">
            <p>&copy; {new Date().getFullYear()} {tenant.name}. Seluruh hak cipta dilindungi.</p>
          </div>
        </footer>
      </div>
    );
  }

  // 3. Query 4 produk aktif lainnya dari tenant yang sama (tenant-scoped)
  const relatedProducts = await prisma.product.findMany({
    where: {
      tenantId: tenant.id,
      status: 'ACTIVE',
      id: { not: product.id },
    },
    take: 4,
    include: {
      variants: {
        where: { isActive: true },
      },
      category: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // 4. Hubungkan nomor WhatsApp dari database alamat default tenant
  const address = await prisma.address.findFirst({
    where: {
      tenantId: tenant.id,
      isDefault: true,
    },
  });

  // Ambil no telp, jika tidak ada cari alamat mana saja milik tenant
  let tenantPhone = address?.phone || null;
  if (!tenantPhone) {
    const anyAddress = await prisma.address.findFirst({
      where: {
        tenantId: tenant.id,
      },
    });
    tenantPhone = anyAddress?.phone || null;
  }

  // 5. Bersihkan data (Decimal -> number) untuk mencegah Next.js Serialization error
  const serializedProduct = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    basePrice: Number(product.basePrice),
    imageUrl: product.imageUrl,
    category: product.category ? { name: product.category.name } : null,
    variants: product.variants.map((v) => ({
      id: v.id,
      name: v.name,
      sku: v.sku,
      price: Number(v.price),
      stock: v.stock,
      weightGram: v.weightGram,
    })),
  };

  const serializedRelated = relatedProducts.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    basePrice: Number(p.basePrice),
    imageUrl: p.imageUrl,
    category: p.category ? { name: p.category.name } : null,
    variants: p.variants.map((v) => ({
      id: v.id,
      name: v.name,
      price: Number(v.price),
    })),
  }));

  return (
    <ProductDetail
      tenant={tenant}
      product={serializedProduct}
      relatedProducts={serializedRelated}
      tenantWhatsapp={tenantPhone}
      isReadOnly={isReadOnly}
    />
  );
}

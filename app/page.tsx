import { headers } from 'next/headers';
import { resolveTenantFromHost } from '../lib/tenant/resolve-tenant';
import { getProductsByTenantId } from '../lib/data-access/products';
import { prisma } from '../lib/prisma';
import MarketingHome from '../components/marketing/marketing-home';
import StorefrontHome from '../components/storefront/storefront-home';
import { CartProvider } from '../lib/cart/use-cart';

export default async function Page() {
  const headersList = await headers();
  const host = headersList.get('host') ?? '';
  
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
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">Toko sementara belum aktif</h1>
            <p className="text-slate-400 text-sm">
              Silakan hubungi pemilik toko atau admin Daganta untuk informasi lebih lanjut.
            </p>
          </div>
          <div className="pt-2">
            <a 
              href="mailto:support@daganta.id" 
              className="inline-block w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-350 font-medium rounded-xl transition-all border border-slate-700 text-sm"
            >
              Hubungi Dukungan Daganta
            </a>
          </div>
        </div>
      </main>
    );
  }
  
  // Successful resolution (SUCCESS)
  const tenant = result.tenant!;
  const products = await getProductsByTenantId(tenant.id);
  const isReadOnly = result.accessMode === 'STOREFRONT_READONLY';

  // Hubungkan nomor WhatsApp dari database alamat default tenant
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

  // Bersihkan data (Decimal -> number) untuk mencegah Next.js Serialization error di Client Component
  const serializedProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    basePrice: Number(p.basePrice),
    imageUrl: p.imageUrl,
    isFeatured: p.isFeatured,
    category: p.category ? { name: p.category.name } : null,
    variants: p.variants.map((v) => ({
      id: v.id,
      name: v.name,
      price: Number(v.price),
    })),
  }));
  
  return (
    <CartProvider subdomain={tenant.subdomain}>
      <StorefrontHome 
        tenant={tenant} 
        products={serializedProducts} 
        isReadOnly={isReadOnly} 
        tenantWhatsapp={tenantPhone}
      />
    </CartProvider>
  );
}

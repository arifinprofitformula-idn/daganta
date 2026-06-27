import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, PackageSearch } from 'lucide-react';
import CartButton from '../../../components/storefront/CartButton';
import ProductCard from '../../../components/storefront/product-card';
import { getStorefrontProductsByTenant } from '../../../lib/data-access/products';
import { getStorefrontTenantContext } from '../../../lib/tenant/storefront-tenant';
import { getEnrichedCart } from '../../../lib/cart/cart';

function serializeProduct(product: Awaited<ReturnType<typeof getStorefrontProductsByTenant>>[number]) {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    basePrice: Number(product.basePrice),
    imageUrl: product.imageUrl,
    category: product.category ? { name: product.category.name } : null,
    variants: product.variants.map((variant) => ({
      id: variant.id,
      name: variant.name,
      price: Number(variant.price),
    })),
  };
}

export default async function StorefrontProductsPage() {
  const result = await getStorefrontTenantContext();

  if (result.status !== 'SUCCESS' || !result.tenant) {
    notFound();
  }

  const tenant = result.tenant;
  const [products, cart] = await Promise.all([
    getStorefrontProductsByTenant(tenant.id),
    getEnrichedCart(tenant.id),
  ]);
  const serializedProducts = products.map(serializeProduct);
  const isReadOnly = result.accessMode === 'STOREFRONT_READONLY';

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-sm font-black uppercase text-white">
              {tenant.name.substring(0, 1)}
            </div>
            <div>
              <p className="text-sm font-black uppercase leading-none tracking-tight">{tenant.name}</p>
              <p className="mt-1 text-[10px] font-semibold text-slate-400">{tenant.subdomain}.daganta.store</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Beranda
            </Link>
            <CartButton cart={cart} />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-2">
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Katalog Toko</p>
          <h1 className="text-3xl font-black tracking-tight text-slate-950">Semua Produk</h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-500">
            Temukan produk aktif dari {tenant.name}. Pilih produk untuk melihat detail dan bertanya langsung lewat WhatsApp.
          </p>
        </div>

        {serializedProducts.length === 0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <PackageSearch className="h-12 w-12 text-slate-350" strokeWidth={1.5} />
            <h2 className="mt-4 text-lg font-black text-slate-900">Belum ada produk aktif</h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Produk toko ini belum tersedia untuk ditampilkan. Silakan cek kembali nanti.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {serializedProducts.map((product) => (
              <ProductCard key={product.id} product={product} isReadOnly={isReadOnly} primaryColor="#1A355C" hoverColor="#142845" />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

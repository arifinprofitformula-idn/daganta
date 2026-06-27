import Link from 'next/link';
import { notFound } from 'next/navigation';
import CheckoutForm from '@/components/storefront/CheckoutForm';
import { getEnrichedCart } from '@/lib/cart/cart';
import { getProvinces } from '@/lib/data-access/regions';
import { getStorefrontTenantContext } from '@/lib/tenant/storefront-tenant';
import MarketingHome from '@/components/marketing/marketing-home';

export default async function CheckoutPage() {
  const result = await getStorefrontTenantContext();

  if (result.status === 'MARKETING_SITE') {
    return <MarketingHome />;
  }

  if (result.status !== 'SUCCESS' || !result.tenant) {
    notFound();
  }

  if (result.accessMode === 'STOREFRONT_READONLY') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6 text-white">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl">
          <h1 className="text-2xl font-bold tracking-tight">Checkout Dibatasi</h1>
          <p className="mt-3 text-sm text-slate-400">
            Checkout sementara dibatasi karena masa aktif toko perlu diperpanjang.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block w-full rounded-xl bg-amber-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-amber-500"
          >
            Kembali ke Beranda Toko
          </Link>
        </div>
      </main>
    );
  }

  const tenant = result.tenant;
  const [cart, provinces] = await Promise.all([
    getEnrichedCart(tenant.id),
    getProvinces(),
  ]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
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

          <Link href="/products" className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50">
            Kembali ke Produk
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Checkout</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">Selesaikan Pesanan</h1>
          <p className="mt-2 text-sm text-slate-500">
            Isi data pengiriman. Total pesanan akan dihitung ulang dari database toko.
          </p>
        </div>

        {cart.items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
            <h2 className="text-lg font-black text-slate-900">Keranjang masih kosong</h2>
            <p className="mt-2 text-sm text-slate-500">Tambahkan produk terlebih dahulu sebelum checkout.</p>
            <Link
              href="/products"
              className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800"
            >
              Lihat Produk
            </Link>
          </div>
        ) : (
          <CheckoutForm tenantName={tenant.name} provinces={provinces} cart={cart} />
        )}
      </section>
    </main>
  );
}

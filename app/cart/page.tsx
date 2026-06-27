import Link from 'next/link';
import { notFound } from 'next/navigation';
import CartDrawer from '@/components/storefront/CartDrawer';
import { Button } from '@/components/ui/button';
import { getEnrichedCart } from '@/lib/cart/cart';
import { getStorefrontTenantContext } from '@/lib/tenant/storefront-tenant';
import MarketingHome from '@/components/marketing/marketing-home';

function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function CartPage() {
  const result = await getStorefrontTenantContext();

  if (result.status === 'MARKETING_SITE') {
    return <MarketingHome />;
  }

  if (result.status !== 'SUCCESS' || !result.tenant) {
    notFound();
  }

  const tenant = result.tenant;
  const cart = await getEnrichedCart(tenant.id);

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
            Lanjut Belanja
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Keranjang</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">Keranjang Belanja</h1>
          <p className="mt-2 text-sm text-slate-500">
            {cart.totalItems > 0
              ? `${cart.totalItems} item di keranjang. Subtotal ${formatRupiah(cart.subtotal)}.`
              : 'Keranjang masih kosong.'}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <CartDrawer cart={cart}>
              <Button type="button" className="h-11 bg-slate-950 text-white hover:bg-slate-800">
                Kelola Keranjang
              </Button>
            </CartDrawer>
            <Button asChild variant="outline" className="h-11">
              <Link href="/checkout">Lanjut ke Checkout</Link>
            </Button>
            <Button asChild variant="outline" className="h-11">
              <Link href="/products">Tambah Produk</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

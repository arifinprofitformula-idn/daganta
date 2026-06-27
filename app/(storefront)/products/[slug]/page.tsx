import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import ProductCard from '../../../../components/storefront/product-card';
import CartButton from '../../../../components/storefront/CartButton';
import ProductGallery from '../../../../components/storefront/ProductGallery';
import ProductVariantSelector from '../../../../components/storefront/ProductVariantSelector';
import {
  getStorefrontProductBySlug,
  getStorefrontProductsByTenant,
  getTenantStorefrontWhatsappNumber,
} from '../../../../lib/data-access/products';
import { getStorefrontTenantContext } from '../../../../lib/tenant/storefront-tenant';
import { getEnrichedCart } from '../../../../lib/cart/cart';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

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

export default async function StorefrontProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await getStorefrontTenantContext();

  if (result.status !== 'SUCCESS' || !result.tenant) {
    notFound();
  }

  const tenant = result.tenant;
  const product = await getStorefrontProductBySlug(tenant.id, slug);

  if (!product) {
    notFound();
  }

  const [relatedProducts, whatsappNumber, cart] = await Promise.all([
    getStorefrontProductsByTenant(tenant.id, { limit: 4 }),
    getTenantStorefrontWhatsappNumber(tenant.id),
    getEnrichedCart(tenant.id),
  ]);

  const variants = product.variants.map((variant) => ({
    id: variant.id,
    name: variant.name,
    sku: variant.sku,
    price: Number(variant.price),
    stock: variant.stock,
  }));
  const basePrice = Number(product.basePrice);
  const minVariantPrice = variants.length > 0 ? Math.min(...variants.map((variant) => variant.price)) : basePrice;
  const displayPrice = formatRupiah(minVariantPrice);
  const totalStock = variants.length > 0 ? variants.reduce((total, variant) => total + variant.stock, 0) : null;
  const related = relatedProducts
    .filter((item) => item.id !== product.id)
    .slice(0, 4)
    .map(serializeProduct);
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

          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Semua Produk
          </Link>
          <CartButton cart={cart} />
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(380px,480px)]">
        <ProductGallery productName={product.name} images={product.imageUrl ? [product.imageUrl] : []} />

        <div className="flex flex-col gap-7">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {product.category?.name && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-slate-600">
                  {product.category.name}
                </span>
              )}
              <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide ${
                totalStock === null || totalStock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}>
                {totalStock === null || totalStock > 0 ? 'Stok tersedia' : 'Habis'}
              </span>
            </div>

            <div>
              <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-950 md:text-4xl">{product.name}</h1>
              <p className="mt-4 text-3xl font-black text-[#1A355C]">{displayPrice}</p>
            </div>
          </div>

          <ProductVariantSelector
            productId={product.id}
            productName={product.name}
            tenantName={tenant.name}
            basePrice={basePrice}
            variants={variants}
            whatsappNumber={isReadOnly ? null : whatsappNumber}
          />

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Deskripsi Produk</p>
            <div className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
              {product.description || 'Belum ada deskripsi produk.'}
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-slate-100 bg-slate-50 py-12">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Produk Lainnya</p>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">Pilihan dari {tenant.name}</h2>
              </div>
              <Link href="/products" className="hidden text-xs font-black text-slate-600 hover:text-slate-950 sm:inline">
                Lihat semua
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} isReadOnly={isReadOnly} primaryColor="#1A355C" hoverColor="#142845" />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

import Link from 'next/link';
import { FolderOpen, Plus } from 'lucide-react';
import { getActiveTenantContext } from '@/lib/auth/tenant-access';
import { getCategoriesByTenantId, getProductsByTenant } from '@/lib/data-access/products';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductTable } from '@/components/dashboard/products/ProductTable';
import { getTenantRestrictions } from '@/lib/tenant/lifecycle';

export const dynamic = 'force-dynamic';

interface ProductsPageProps {
  searchParams: Promise<{
    search?: string;
    categoryId?: string;
    page?: string;
  }>;
}

function parsePage(value: string | undefined) {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const tenantCtx = await getActiveTenantContext();

  if (tenantCtx.status !== 'SUCCESS' || !tenantCtx.activeTenant) {
    return null;
  }

  const tenantId = tenantCtx.activeTenant.id;
  const restrictions = getTenantRestrictions(tenantCtx.activeTenant.status);
  const [productsResult, categories] = await Promise.all([
    getProductsByTenant(tenantId, {
      search: params.search,
      categoryId: params.categoryId,
      page: parsePage(params.page),
      limit: 10,
    }),
    getCategoriesByTenantId(tenantId, true),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Produk</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola katalog produk, stok, harga, dan status tampil di etalase.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button asChild variant="outline">
            <Link href="/dashboard/categories">
              <FolderOpen className="mr-2 h-4 w-4" aria-hidden="true" />
              Kategori
            </Link>
          </Button>
          {restrictions.canAddProducts ? (
            <Button asChild>
              <Link href="/dashboard/products/new">
                <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                Tambah Produk
              </Link>
            </Button>
          ) : (
            <Button disabled title="Paket Anda tidak aktif. Perpanjang untuk melanjutkan.">
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              Tambah Produk
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Produk</CardTitle>
          <CardDescription>
            Menampilkan produk toko {tenantCtx.activeTenant.name} dengan isolasi tenant aktif.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductTable
            products={productsResult.items.map((product) => ({
              id: product.id,
              name: product.name,
              imageUrl: product.imageUrl,
              status: product.status,
              basePrice: Number(product.basePrice),
              category: product.category,
              stock: product.stock,
              variantCount: product.variantCount,
            }))}
            categories={categories.map((category) => ({
              id: category.id,
              name: category.name,
            }))}
            pagination={productsResult.pagination}
          />
        </CardContent>
      </Card>
    </div>
  );
}

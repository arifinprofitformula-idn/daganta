import Link from 'next/link';
import { ArrowLeft, FolderOpen } from 'lucide-react';
import { getActiveTenantContext } from '@/lib/auth/tenant-access';
import { getCategoriesByTenant } from '@/lib/data-access/categories';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CategoryDeleteButton } from '@/components/dashboard/categories/CategoryDeleteButton';
import { CategoryDialog } from '@/components/dashboard/categories/CategoryDialog';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  const tenantCtx = await getActiveTenantContext();

  if (tenantCtx.status !== 'SUCCESS' || !tenantCtx.activeTenant) {
    return null;
  }

  const categories = await getCategoriesByTenant(tenantCtx.activeTenant.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Kategori</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola kategori produk untuk toko {tenantCtx.activeTenant.name}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/products">
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              Produk
            </Link>
          </Button>
          <CategoryDialog />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Kategori</CardTitle>
          <CardDescription>
            Kategori hanya berlaku untuk tenant aktif dan tidak bisa dihapus jika masih memiliki produk.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Kategori</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Jumlah Produk</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <FolderOpen className="h-8 w-8" aria-hidden="true" />
                        <span>Belum ada kategori.</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{category.slug}</TableCell>
                      <TableCell>{category.productCount}</TableCell>
                      <TableCell>
                        <Badge variant={category.isActive ? 'default' : 'secondary'}>
                          {category.isActive ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <CategoryDialog
                            category={{
                              id: category.id,
                              name: category.name,
                              slug: category.slug,
                            }}
                          />
                          <CategoryDeleteButton
                            categoryId={category.id}
                            productCount={category.productCount}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

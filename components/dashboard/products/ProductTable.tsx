'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { Edit, Eye, EyeOff, ImageIcon, Search, Trash2 } from 'lucide-react';
import { deleteProductAction, toggleStatusAction } from '@/app/dashboard/products/actions';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export interface ProductTableItem {
  id: string;
  name: string;
  imageUrl: string | null;
  status: ProductStatusValue;
  basePrice: number;
  category: {
    id: string;
    name: string;
  } | null;
  stock: number;
  variantCount: number;
}

export interface ProductTableCategory {
  id: string;
  name: string;
}

export interface ProductTablePagination {
  page: number;
  totalPages: number;
  totalItems: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

type ProductStatusValue = 'ACTIVE' | 'DRAFT' | 'OUT_OF_STOCK' | 'ARCHIVED';

interface ProductTableProps {
  products: ProductTableItem[];
  categories: ProductTableCategory[];
  pagination: ProductTablePagination;
}

const categoryAllValue = 'all';

function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function getStatusLabel(status: ProductStatusValue) {
  if (status === 'ACTIVE') {
    return 'Aktif';
  }

  if (status === 'DRAFT') {
    return 'Draft';
  }

  if (status === 'OUT_OF_STOCK') {
    return 'Stok Habis';
  }

  return 'Arsip';
}

function getStatusVariant(status: ProductStatusValue) {
  return status === 'ACTIVE' ? 'default' : 'secondary';
}

export function ProductTable({ products, categories, pagination }: ProductTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const selectedCategory = searchParams.get('categoryId') ?? categoryAllValue;
  const searchValue = searchParams.get('search') ?? '';

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (!value || value === categoryAllValue) {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  }

  function setPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`${pathname}?${params.toString()}`);
  }

  function runMutation(action: () => Promise<{ success: boolean; error?: string }>) {
    startTransition(async () => {
      const result = await action();

      if (!result.success) {
        window.alert(result.error ?? 'Aksi gagal diproses.');
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            defaultValue={searchValue}
            placeholder="Cari nama produk..."
            className="pl-9"
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                setParam('search', event.currentTarget.value.trim());
              }
            }}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select value={selectedCategory} onValueChange={(value) => setParam('categoryId', value)}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Semua kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={categoryAllValue}>Semua kategori</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => router.push(pathname)}>
            Reset
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[72px]">Gambar</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead>Stok</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-sm text-muted-foreground">
                  Tidak ada produk yang cocok dengan filter saat ini.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-md border bg-muted">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[240px] truncate font-medium" title={product.name}>
                      {product.name}
                    </div>
                    <div className="text-xs text-muted-foreground">{product.variantCount} varian</div>
                  </TableCell>
                  <TableCell>{product.category?.name ?? 'Tanpa kategori'}</TableCell>
                  <TableCell className="font-medium">{formatRupiah(product.basePrice)}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(product.status)}>{getStatusLabel(product.status)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button asChild size="icon" variant="outline" title="Edit produk">
                        <Link href={`/dashboard/products/${product.id}/edit`}>
                          <Edit className="h-4 w-4" aria-hidden="true" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>

                      <Button
                        size="icon"
                        variant="outline"
                        disabled={isPending}
                        title="Toggle status produk"
                        onClick={() => runMutation(() => toggleStatusAction(product.id))}
                      >
                        {product.status === 'ACTIVE' ? (
                          <EyeOff className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        )}
                        <span className="sr-only">Toggle status</span>
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="destructive" disabled={isPending} title="Hapus produk">
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                            <span className="sr-only">Hapus</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus produk?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Produk {product.name} akan diarsipkan dari dashboard dan tidak tampil di etalase.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => runMutation(() => deleteProductAction(product.id))}
                            >
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div>
          Total {pagination.totalItems} produk, halaman {pagination.page} dari {pagination.totalPages}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            disabled={!pagination.hasPreviousPage || isPending}
            onClick={() => setPage(pagination.page - 1)}
          >
            Sebelumnya
          </Button>
          <Button
            variant="outline"
            disabled={!pagination.hasNextPage || isPending}
            onClick={() => setPage(pagination.page + 1)}
          >
            Selanjutnya
          </Button>
        </div>
      </div>
    </div>
  );
}

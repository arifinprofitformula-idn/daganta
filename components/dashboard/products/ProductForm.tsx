'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useState, useTransition } from 'react';
import { ArrowLeft, ImageIcon, Loader2, Plus, Save, Trash2, Upload, X } from 'lucide-react';
import { createProductAction, updateProductAction } from '@/app/dashboard/products/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

interface ProductFormCategory {
  id: string;
  name: string;
}

interface ProductFormInitialData {
  id: string;
  name: string;
  description: string;
  categoryId: string | null;
  basePrice: number;
  imageUrl: string | null;
  status: 'ACTIVE' | 'DRAFT' | 'OUT_OF_STOCK' | 'ARCHIVED';
  stock: number;
  variants: ProductFormVariant[];
}

interface ProductFormVariant {
  id?: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
}

interface ProductFormProps {
  mode: 'create' | 'edit';
  categories: ProductFormCategory[];
  initialData?: ProductFormInitialData;
}

const emptyCategoryValue = 'none';

function formatFileSize(size: number) {
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}

export function ProductForm({ mode, categories, initialData }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialData?.categoryId ?? '');
  const [isActive, setIsActive] = useState(initialData?.status === 'ACTIVE' || mode === 'create');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [hasVariants, setHasVariants] = useState(() => {
    const variants = initialData?.variants ?? [];
    return variants.length > 1 || variants.some((variant) => variant.name !== 'Standar');
  });
  const [variants, setVariants] = useState<ProductFormVariant[]>(() => {
    const initialVariants = initialData?.variants ?? [];

    if (initialVariants.length > 0) {
      return initialVariants;
    }

    return [
      {
        name: 'Standar',
        sku: '',
        price: initialData?.basePrice ?? 0,
        stock: initialData?.stock ?? 0,
      },
    ];
  });

  const previewUrls = useMemo(() => {
    return selectedFiles.map((file) => URL.createObjectURL(file));
  }, [selectedFiles]);

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  function updateFiles(files: FileList | null) {
    if (!files) {
      return;
    }

    const nextFiles = Array.from(files).slice(0, 5);
    setSelectedFiles(nextFiles);
    setErrorMessage(nextFiles.length < files.length ? 'Maksimal 5 gambar. Hanya 5 gambar pertama yang dipilih.' : null);
  }

  function removeFile(index: number) {
    setSelectedFiles((current) => current.filter((_, currentIndex) => currentIndex !== index));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    formData.set('categoryId', selectedCategoryId);
    formData.set('isActive', isActive ? 'true' : 'false');
    formData.delete('images');

    if (hasVariants) {
      const activeVariants = variants.filter((variant) => variant.name.trim());

      if (activeVariants.length === 0) {
        setErrorMessage('Tambahkan minimal satu varian produk.');
        return;
      }

      const minPrice = Math.min(...activeVariants.map((variant) => Number(variant.price)));
      const totalStock = activeVariants.reduce((total, variant) => total + Number(variant.stock), 0);

      formData.set('price', minPrice.toString());
      formData.set('stock', totalStock.toString());
      formData.set('variantsJson', JSON.stringify(activeVariants));
    } else {
      formData.delete('variantsJson');
    }

    selectedFiles.forEach((file) => {
      formData.append('images', file);
    });

    startTransition(async () => {
      const result =
        mode === 'edit' && initialData
          ? await updateProductAction(initialData.id, formData)
          : await createProductAction(formData);

      if (!result.success) {
        setErrorMessage(result.error ?? 'Produk gagal disimpan.');
        return;
      }

      router.push('/dashboard/products');
      router.refresh();
    });
  }

  function addVariant() {
    setVariants((current) => [
      ...current,
      {
        name: '',
        sku: '',
        price: initialData?.basePrice ?? 0,
        stock: 0,
      },
    ]);
  }

  function updateVariant(index: number, key: keyof ProductFormVariant, value: string | number) {
    setVariants((current) =>
      current.map((variant, currentIndex) =>
        currentIndex === index
          ? {
              ...variant,
              [key]: value,
            }
          : variant
      )
    );
  }

  function removeVariant(index: number) {
    setVariants((current) => current.filter((_, currentIndex) => currentIndex !== index));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {mode === 'edit' ? 'Edit Produk' : 'Tambah Produk'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Lengkapi detail produk agar siap tampil di etalase toko.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={() => router.push('/dashboard/products')}>
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            Kembali
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="mr-2 h-4 w-4" aria-hidden="true" />
            )}
            Simpan Produk
          </Button>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Produk</CardTitle>
              <CardDescription>Nama, deskripsi, kategori, dan status produk.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Produk</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={initialData?.name ?? ''}
                  minLength={3}
                  maxLength={255}
                  required
                  placeholder="Contoh: Toya Rotan Latihan 150 cm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={initialData?.description ?? ''}
                  rows={6}
                  placeholder="Jelaskan bahan, ukuran, manfaat, dan informasi penting lainnya."
                />
              </div>

              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select
                  value={selectedCategoryId || emptyCategoryValue}
                  onValueChange={(value) => setSelectedCategoryId(value === emptyCategoryValue ? '' : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={emptyCategoryValue}>Tanpa kategori</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-1">
                  <Label htmlFor="isActive">Status produk</Label>
                  <p className="text-sm text-muted-foreground">
                    {isActive ? 'Aktif dan tampil di etalase.' : 'Draft dan belum tampil di etalase.'}
                  </p>
                </div>
                <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Harga & Stok</CardTitle>
              <CardDescription>
                Harga normal, harga coret opsional, dan stok dasar. Jika varian aktif, stok dihitung dari varian.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="price">Harga Normal</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min={1}
                  defaultValue={initialData?.basePrice ?? ''}
                  required
                  placeholder="45000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="comparePrice">Harga Coret</Label>
                <Input id="comparePrice" name="comparePrice" type="number" min={1} placeholder="65000" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Stok</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  min={0}
                  defaultValue={initialData?.stock ?? 0}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle>Varian Produk</CardTitle>
                  <CardDescription>Gunakan varian untuk ukuran, warna, paket, atau pilihan lain.</CardDescription>
                </div>
                <Switch checked={hasVariants} onCheckedChange={setHasVariants} aria-label="Produk ini punya varian" />
              </div>
            </CardHeader>
            {hasVariants && (
              <CardContent className="space-y-4">
                <div className="overflow-hidden rounded-lg border">
                  <div className="grid grid-cols-[1.2fr_1fr_1fr_0.8fr_48px] gap-3 border-b bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground">
                    <span>Nama Varian</span>
                    <span>SKU</span>
                    <span>Harga</span>
                    <span>Stok</span>
                    <span />
                  </div>
                  <div className="divide-y">
                    {variants.map((variant, index) => (
                      <div
                        key={variant.id ?? index}
                        className="grid grid-cols-[1.2fr_1fr_1fr_0.8fr_48px] gap-3 px-3 py-3"
                      >
                        <Input
                          value={variant.name}
                          onChange={(event) => updateVariant(index, 'name', event.target.value)}
                          placeholder="Ukuran L"
                        />
                        <Input
                          value={variant.sku}
                          onChange={(event) => updateVariant(index, 'sku', event.target.value)}
                          placeholder="SKU-L"
                        />
                        <Input
                          type="number"
                          min={1}
                          value={variant.price}
                          onChange={(event) => updateVariant(index, 'price', Number(event.target.value))}
                        />
                        <Input
                          type="number"
                          min={0}
                          value={variant.stock}
                          onChange={(event) => updateVariant(index, 'stock', Number(event.target.value))}
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => removeVariant(index)}
                          disabled={variants.length === 1}
                          title="Hapus varian"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <Button type="button" variant="outline" onClick={addVariant}>
                  <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                  Tambah Varian
                </Button>
              </CardContent>
            )}
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Gambar Produk</CardTitle>
            <CardDescription>Upload sampai 5 gambar. Gambar pertama menjadi foto utama.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Label
              htmlFor="images"
              className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed bg-muted/40 px-4 py-8 text-center transition hover:bg-muted"
            >
              <Upload className="mb-3 h-8 w-8 text-muted-foreground" aria-hidden="true" />
              <span className="font-medium">Pilih gambar produk</span>
              <span className="mt-1 text-xs text-muted-foreground">JPG, PNG, atau WEBP. Maksimal 2MB per gambar.</span>
              <Input
                id="images"
                name="images"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="sr-only"
                onChange={(event) => updateFiles(event.target.files)}
              />
            </Label>

            {selectedFiles.length === 0 && initialData?.imageUrl && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Gambar saat ini</p>
                <div className="overflow-hidden rounded-lg border">
                  <Image
                    src={initialData.imageUrl}
                    alt={initialData.name}
                    width={320}
                    height={240}
                    className="aspect-[4/3] w-full object-cover"
                  />
                </div>
              </div>
            )}

            {selectedFiles.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {selectedFiles.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="group relative overflow-hidden rounded-lg border">
                    <Image
                      src={previewUrls[index]}
                      alt={file.name}
                      width={180}
                      height={140}
                      className="aspect-[4/3] w-full object-cover"
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-2 rounded-full bg-background/90 p-1 text-foreground shadow-sm"
                      onClick={() => removeFile(index)}
                      aria-label={`Hapus ${file.name}`}
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <div className="absolute inset-x-0 bottom-0 bg-background/90 px-2 py-1 text-[11px] text-muted-foreground">
                      <p className="truncate">{file.name}</p>
                      <p>{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedFiles.length === 0 && !initialData?.imageUrl && (
              <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                <ImageIcon className="h-4 w-4" aria-hidden="true" />
                Belum ada gambar dipilih.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </form>
  );
}

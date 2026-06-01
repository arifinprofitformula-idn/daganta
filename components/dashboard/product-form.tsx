'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Sparkles, Loader2, Package, Coins, BarChart3, Scale, Key } from 'lucide-react';
import { ProductStatus } from '@prisma/client';
import { createProductAction, editProductAction } from '@/app/dashboard/products/actions';

interface ProductFormProps {
  categories: { id: string; name: string }[];
  initialData?: any; // Product with variants and category
}

export function ProductForm({ categories, initialData }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Varian default dari data awal jika ada
  const defaultVariant = initialData?.variants?.[0] || null;

  // State Formulir
  const [name, setName] = useState(initialData?.name || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [basePrice, setBasePrice] = useState(initialData?.basePrice ? Number(initialData.basePrice) : 0);
  const [stock, setStock] = useState(defaultVariant ? Number(defaultVariant.stock) : 0);
  const [weightGram, setWeightGram] = useState(defaultVariant ? Number(defaultVariant.weightGram) : 0);
  const [sku, setSku] = useState(defaultVariant?.sku || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [status, setStatus] = useState<ProductStatus>(initialData?.status || ProductStatus.ACTIVE);

  const isEdit = !!initialData;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validasi sederhana di sisi klien
    if (!name.trim()) {
      setErrorMessage('Nama produk wajib diisi.');
      return;
    }
    if (basePrice < 0) {
      setErrorMessage('Harga dasar tidak boleh bernilai negatif.');
      return;
    }
    if (stock < 0) {
      setErrorMessage('Stok tidak boleh bernilai negatif.');
      return;
    }
    if (weightGram < 0) {
      setErrorMessage('Berat tidak boleh bernilai negatif.');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('Deskripsi produk wajib diisi.');
      return;
    }

    startTransition(async () => {
      const payload = {
        name,
        categoryId: categoryId || null,
        basePrice,
        stock,
        weightGram,
        sku: sku || undefined,
        description,
        status,
      };

      const result = isEdit
        ? await editProductAction(initialData.id, payload)
        : await createProductAction(payload);

      if (result.success) {
        router.push('/dashboard/products');
        router.refresh();
      } else {
        setErrorMessage(result.error || 'Terjadi kesalahan saat menyimpan produk.');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header Form */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/dashboard/products')}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
            title="Kembali"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              {isEdit ? 'Edit Produk' : 'Tambah Produk Baru'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {isEdit ? 'Perbarui informasi dan spesifikasi produk Anda' : 'Buat produk baru beserta varian standar dan simpan ke katalog'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/dashboard/products')}
            className="py-2.5 px-4 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-350 hover:text-white text-xs font-bold rounded-xl transition-all"
            disabled={isPending}
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isEdit ? 'Simpan Perubahan' : 'Terbitkan Produk'}</span>
          </button>
        </div>
      </div>

      {/* Mode Demo Alert Banner */}
      <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-slate-200">Mode Demo Internal — belum menggunakan role final.</h4>
          <p className="text-[10px] text-slate-400 leading-normal">
            Perubahan yang Anda lakukan akan langsung memodifikasi database lokal secara aman dan terisolasi untuk toko aktif Anda saat ini.
          </p>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-rose-950/20 border border-rose-500/30 text-rose-400 text-xs font-semibold rounded-2xl p-4">
          {errorMessage}
        </div>
      )}

      {/* Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Informasi Utama & Harga */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Informasi Produk */}
          <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 pb-3 border-b border-slate-850">
              <Package className="w-4 h-4 text-indigo-400" />
              <span>Detail Produk</span>
            </h3>

            <div className="space-y-2">
              <label htmlFor="product-name" className="block text-xs font-semibold text-slate-400">
                Nama Produk <span className="text-rose-500">*</span>
              </label>
              <input
                id="product-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Toya Rotan Latihan Standar 180 cm"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-650 outline-none transition-all"
                required
                disabled={isPending}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="product-category" className="block text-xs font-semibold text-slate-400">
                  Kategori Produk
                </label>
                <select
                  id="product-category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition-all"
                  disabled={isPending}
                >
                  <option value="">-- Tanpa Kategori --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="product-status" className="block text-xs font-semibold text-slate-400">
                  Status Publikasi
                </label>
                <select
                  id="product-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProductStatus)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition-all font-semibold"
                  disabled={isPending}
                >
                  <option value={ProductStatus.ACTIVE} className="text-emerald-450 font-semibold">Aktif (Tampil di Storefront)</option>
                  <option value={ProductStatus.DRAFT} className="text-slate-400 font-semibold">Draft (Simpan Internal)</option>
                  <option value={ProductStatus.OUT_OF_STOCK} className="text-amber-450 font-semibold">Stok Habis</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="product-description" className="block text-xs font-semibold text-slate-400">
                Deskripsi Produk <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="product-description"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tulis spesifikasi lengkap produk, kelebihan, bahan, dan instruksi lainnya..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-650 outline-none transition-all resize-y"
                required
                disabled={isPending}
              />
            </div>
          </div>

          {/* Section 2: Keuangan / Harga */}
          <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 pb-3 border-b border-slate-850">
              <Coins className="w-4 h-4 text-indigo-400" />
              <span>Harga & Keuangan</span>
            </h3>

            <div className="space-y-2">
              <label htmlFor="product-price" className="block text-xs font-semibold text-slate-400">
                Harga Dasar (Rupiah) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-2.5 text-xs text-slate-500 font-bold">Rp</span>
                <input
                  id="product-price"
                  type="number"
                  value={basePrice}
                  onChange={(e) => setBasePrice(Math.max(0, Number(e.target.value)))}
                  placeholder="0"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-12 pr-4 py-2.5 text-xs text-white font-bold placeholder-slate-650 outline-none transition-all"
                  required
                  min="0"
                  disabled={isPending}
                />
              </div>
              <p className="text-[10px] text-slate-500">Harga dasar yang akan ditawarkan di storefront untuk varian standar.</p>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Spesifikasi Varian Default (Stok, Berat, SKU) */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 pb-3 border-b border-slate-850">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              <span>Varian & Stok</span>
            </h3>

            <div className="space-y-2">
              <label htmlFor="product-stock" className="block text-xs font-semibold text-slate-400">
                Jumlah Stok <span className="text-rose-500">*</span>
              </label>
              <input
                id="product-stock"
                type="number"
                value={stock}
                onChange={(e) => setStock(Math.max(0, Math.floor(Number(e.target.value))))}
                placeholder="0"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-white font-bold outline-none transition-all"
                required
                min="0"
                disabled={isPending}
              />
              <p className="text-[10px] text-slate-500">Persediaan fisik yang dapat dibeli oleh pelanggan.</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="product-weight" className="block text-xs font-semibold text-slate-400">
                Berat Produk (Gram) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="product-weight"
                  type="number"
                  value={weightGram}
                  onChange={(e) => setWeightGram(Math.max(0, Math.floor(Number(e.target.value))))}
                  placeholder="0"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-4 pr-12 py-2.5 text-xs text-white font-bold outline-none transition-all"
                  required
                  min="0"
                  disabled={isPending}
                />
                <span className="absolute right-4 top-2.5 text-[10px] text-slate-500 font-bold">gram</span>
              </div>
              <p className="text-[10px] text-slate-500">Berat aktual produk. Sangat penting untuk menghitung biaya pengiriman/ongkir nanti.</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="product-sku" className="block text-xs font-semibold text-slate-400">
                SKU (Unit Penyimpanan Stok)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-2.5 text-slate-500">
                  <Key className="w-3.5 h-3.5" />
                </span>
                <input
                  id="product-sku"
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="Contoh: TY-ROT-180-STD"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white font-semibold placeholder-slate-650 outline-none transition-all"
                  disabled={isPending}
                />
              </div>
              <p className="text-[10px] text-slate-500">Kode unik opsional untuk manajemen inventaris internal toko Anda.</p>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

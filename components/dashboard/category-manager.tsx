'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Folder, Edit, EyeOff, Loader2, ArrowLeft, Layers, Sparkles } from 'lucide-react';
import { CategoryForm } from './category-form';
import { deactivateCategoryAction } from '@/app/dashboard/products/actions';

interface CategoryManagerProps {
  initialCategories: any[];
  tenantName: string;
}

export function CategoryManager({ initialCategories, tenantName }: CategoryManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDeactivate = async (categoryId: string) => {
    if (!confirm('Apakah Anda yakin ingin menonaktifkan kategori ini? Produk yang menggunakan kategori ini akan otomatis disetel tanpa kategori.')) {
      return;
    }

    setErrorMessage(null);
    startTransition(async () => {
      const result = await deactivateCategoryAction(categoryId);
      if (result.success) {
        setEditingCategory(null);
        router.refresh();
      } else {
        setErrorMessage(result.error || 'Gagal menonaktifkan kategori.');
      }
    });
  };

  const handleSuccess = () => {
    setEditingCategory(null);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/dashboard/products')}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
            title="Kembali ke Produk"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Kategori Produk</h1>
            <p className="text-xs text-slate-500 mt-1">Kelompokkan produk Anda untuk mempermudah navigasi pembeli di etalase</p>
          </div>
        </div>
      </div>

      {/* Mode Demo Alert Banner */}
      <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-slate-200">Mode Demo Internal — belum menggunakan role final.</h4>
          <p className="text-[10px] text-slate-400 leading-normal">
            Mengelola kategori untuk toko <span className="text-indigo-350 font-extrabold">{tenantName}</span> secara langsung. Penonaktifan kategori tidak akan menghapus produk Anda.
          </p>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-rose-950/20 border border-rose-500/30 text-rose-450 text-xs font-semibold rounded-2xl p-4">
          {errorMessage}
        </div>
      )}

      {/* Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Tabel Kategori */}
        <div className="lg:col-span-2 space-y-4">
          {initialCategories.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 bg-slate-900 border border-slate-850 rounded-2xl p-8">
              <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-900 flex items-center justify-center text-slate-650">
                <Folder className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-200 text-sm">Belum Ada Kategori</h3>
                <p className="text-slate-400 text-xs">
                  Toko ini belum menambahkan kategori produk. Gunakan formulir di sebelah kanan untuk menambahkan.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950/60 border-b border-slate-850 text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">
                      <th className="px-6 py-4">Urutan</th>
                      <th className="px-6 py-4">Nama Kategori</th>
                      <th className="px-6 py-4">Slug</th>
                      <th className="px-6 py-4">Deskripsi</th>
                      <th className="px-6 py-4 text-center">Status</th>
                      <th className="px-6 py-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-xs">
                    {initialCategories.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-850/30 transition-colors">
                        <td className="px-6 py-4 font-bold text-indigo-400 select-all w-16">{c.sortOrder}</td>
                        <td className="px-6 py-4 font-bold text-slate-200 select-all">{c.name}</td>
                        <td className="px-6 py-4 text-slate-450 font-mono text-[10px] select-all">{c.slug}</td>
                        <td className="px-6 py-4 text-slate-400 truncate max-w-[200px]" title={c.description}>
                          {c.description || '-'}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {c.isActive ? (
                            <span className="inline-flex px-2 py-0.5 rounded bg-emerald-950/30 text-emerald-400 border border-emerald-500/10 font-bold text-[9px]">
                              Aktif
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-0.5 rounded bg-rose-950/30 text-rose-450 border border-rose-500/10 font-bold text-[9px]">
                              Nonaktif
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditingCategory(c)}
                              className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 rounded-lg text-[10px] font-semibold transition-all"
                              disabled={isPending}
                            >
                              <Edit className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            {c.isActive && (
                              <button
                                type="button"
                                onClick={() => handleDeactivate(c.id)}
                                className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-rose-950/40 border border-rose-500/10 text-rose-450 hover:bg-rose-950 hover:text-rose-400 rounded-lg text-[10px] font-semibold transition-all"
                                disabled={isPending}
                              >
                                {isPending ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <EyeOff className="w-3 h-3" />
                                )}
                                <span>Nonaktifkan</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Kolom Kanan: Formulir Add / Edit */}
        <div>
          <CategoryForm
            editingCategory={editingCategory}
            onSuccess={handleSuccess}
            onCancel={() => setEditingCategory(null)}
          />
        </div>
      </div>
    </div>
  );
}

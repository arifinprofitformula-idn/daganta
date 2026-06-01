'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { Save, Loader2, Plus, Sparkles, X, FolderOpen } from 'lucide-react';
import { createCategoryAction, editCategoryAction } from '@/app/dashboard/products/actions';

interface CategoryFormProps {
  editingCategory?: any; // null or category object
  onSuccess: () => void;
  onCancel?: () => void;
}

export function CategoryForm({ editingCategory, onSuccess, onCancel }: CategoryFormProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // State Formulir
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState(0);

  const isEdit = !!editingCategory;

  // Sync state dengan data pengeditan secara dinamis
  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name);
      setDescription(editingCategory.description || '');
      setSortOrder(editingCategory.sortOrder || 0);
      setErrorMessage(null);
    } else {
      setName('');
      setDescription('');
      setSortOrder(0);
      setErrorMessage(null);
    }
  }, [editingCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Nama kategori wajib diisi.');
      return;
    }

    startTransition(async () => {
      const payload = {
        name,
        description: description || undefined,
        sortOrder,
      };

      const result = isEdit
        ? await editCategoryAction(editingCategory.id, payload)
        : await createCategoryAction(payload);

      if (result.success) {
        setName('');
        setDescription('');
        setSortOrder(0);
        onSuccess();
      } else {
        setErrorMessage(result.error || 'Gagal menyimpan kategori.');
      }
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 space-y-4 shadow-xl">
      {/* Title */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-850">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-indigo-400" />
          <span>{isEdit ? 'Edit Kategori' : 'Tambah Kategori Baru'}</span>
        </h3>
        {isEdit && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
            title="Batal Edit"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Mode Demo Text */}
      <p className="text-[10px] text-slate-500 leading-relaxed">
        Mode Demo Internal — kategori unik per toko aktif.
      </p>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-rose-950/20 border border-rose-500/30 text-rose-450 text-[11px] font-semibold rounded-xl p-3">
          {errorMessage}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="category-name" className="block text-[11px] font-semibold text-slate-400">
            Nama Kategori <span className="text-rose-500">*</span>
          </label>
          <input
            id="category-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Aksesoris Beladiri"
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-650 outline-none transition-all"
            required
            disabled={isPending}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="category-sort" className="block text-[11px] font-semibold text-slate-400">
            Urutan Tampilan
          </label>
          <input
            id="category-sort"
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            placeholder="0"
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white font-bold outline-none transition-all"
            min="0"
            disabled={isPending}
          />
          <p className="text-[9px] text-slate-500">Urutan kecil tampil lebih dahulu di storefront.</p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="category-desc" className="block text-[11px] font-semibold text-slate-400">
            Deskripsi Kategori (Opsional)
          </label>
          <textarea
            id="category-desc"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Deskripsi singkat mengenai jenis produk dalam kategori ini..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-650 outline-none transition-all resize-none"
            disabled={isPending}
          />
        </div>

        <div className="pt-2 flex items-center gap-2">
          {isEdit && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-1/3 py-2 px-3 bg-slate-950 border border-slate-850 hover:border-slate-700 text-slate-400 hover:text-white text-xs font-semibold rounded-xl transition-all"
              disabled={isPending}
            >
              Batal
            </button>
          )}
          <button
            type="submit"
            disabled={isPending}
            className={`inline-flex items-center justify-center gap-1.5 py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              isEdit ? 'w-2/3' : 'w-full'
            }`}
          >
            {isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : isEdit ? (
              <Save className="w-3.5 h-3.5" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
            <span>{isEdit ? 'Simpan' : 'Tambah'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

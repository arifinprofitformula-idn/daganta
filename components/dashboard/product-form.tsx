'use client';

import React, { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Save, 
  Sparkles, 
  Loader2, 
  Package, 
  Coins, 
  BarChart3, 
  Key, 
  Upload, 
  Trash2, 
  Plus, 
  Check, 
  AlertCircle, 
  Eye, 
  Globe, 
  ChevronDown, 
  ChevronUp, 
  Info, 
  Image as ImageIcon,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { ProductStatus } from '@prisma/client';
import { createProductAction, editProductAction } from '@/app/dashboard/products/actions';

interface ProductFormProps {
  categories: { id: string; name: string }[];
  initialData?: any; // Product with variants and category
}

interface UIVariant {
  id?: string;
  name: string;
  price: number;
  stock: number;
  weightGram: number;
  sku: string;
}

// Convert string to URL-friendly slug
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-'); // Replace multiple - with single -
}

export function ProductForm({ categories, initialData }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isEdit = !!initialData;
  const defaultVariant = initialData?.variants?.[0] || null;

  // --- CORE FORM STATE ---
  const [name, setName] = useState(initialData?.name || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [status, setStatus] = useState<ProductStatus>(initialData?.status || ProductStatus.ACTIVE);
  const [imageUrl, setImageUrl] = useState<string | null>(initialData?.imageUrl || null);
  const [slug, setSlug] = useState(initialData?.slug || '');
  
  // Single Variant fields (fallback if no multi-variants)
  const [basePrice, setBasePrice] = useState(initialData?.basePrice ? Number(initialData.basePrice) : 0);
  const [stock, setStock] = useState(defaultVariant ? Number(defaultVariant.stock) : 0);
  const [weightGram, setWeightGram] = useState(defaultVariant ? Number(defaultVariant.weightGram) : 0);
  const [sku, setSku] = useState(defaultVariant?.sku || '');

  // Multi-Variant state
  const hasInitialMultiVariants = initialData?.variants && 
    initialData.variants.length > 0 && 
    initialData.variants.some((v: any) => v.name !== 'Standar');

  const [hasVariants, setHasVariants] = useState(hasInitialMultiVariants);
  const [variantsList, setVariantsList] = useState<UIVariant[]>(
    hasInitialMultiVariants && initialData?.variants
      ? initialData.variants.map((v: any) => ({
          id: v.id,
          name: v.name,
          price: Number(v.price),
          stock: v.stock,
          weightGram: v.weightGram,
          sku: v.sku || '',
        }))
      : []
  );

  // Variant Option Generator states
  const [optName, setOptName] = useState('Ukuran');
  const [optValues, setOptValues] = useState('');

  // SEO Helpers (simulated frontend state, not stored)
  const [metaTitle, setMetaTitle] = useState(initialData?.name ? `${initialData.name} | Toko Resmi` : '');
  const [metaDesc, setMetaDesc] = useState(initialData?.description ? initialData.description.slice(0, 150) : '');

  // UI Sections Toggle
  const [isSeoOpen, setIsSeoOpen] = useState(false);
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);

  // Auto-sync slug & SEO helpers when name changes (only in Create mode)
  useEffect(() => {
    if (!isEdit) {
      setSlug(slugify(name));
      setMetaTitle(name ? `${name} | Toko Resmi` : '');
    }
  }, [name, isEdit]);

  useEffect(() => {
    if (!isEdit) {
      setMetaDesc(description.slice(0, 150));
    }
  }, [description, isEdit]);

  // Image validation & Canvas compression
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate format
    const validFormats = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validFormats.includes(file.type)) {
      setUploadError('Format berkas tidak didukung. Gunakan JPG, PNG, atau WEBP.');
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const compressedBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target?.result as string;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxW = 800; // reasonable dimension limit
            const maxH = 800;
            let width = img.width;
            let height = img.height;

            if (width > maxW || height > maxH) {
              if (width > height) {
                height = Math.round((height * maxW) / width);
                width = maxW;
              } else {
                width = Math.round((width * maxH) / height);
                height = maxH;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);

            // Compress to JPEG with 0.7 quality to target under 500KB
            const base64 = canvas.toDataURL('image/jpeg', 0.7);
            
            // Check size of base64 (approx 1.33 times original byte size)
            const approxBytes = (base64.length * 3) / 4;
            if (approxBytes > 512 * 1024) {
              // Re-compress tighter if still large
              const extraCompressed = canvas.toDataURL('image/jpeg', 0.5);
              resolve(extraCompressed);
            } else {
              resolve(base64);
            }
          };
          img.onerror = () => reject(new Error('Gagal memuat format gambar.'));
        };
        reader.onerror = () => reject(new Error('Gagal membaca file.'));
      });

      setImageUrl(compressedBase64);
    } catch (err: any) {
      setUploadError(err.message || 'Terjadi kesalahan saat memproses gambar.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const validFormats = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validFormats.includes(file.type)) {
      setUploadError('Format berkas tidak didukung. Gunakan JPG, PNG, atau WEBP.');
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const compressedBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target?.result as string;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxW = 800;
            const maxH = 800;
            let width = img.width;
            let height = img.height;

            if (width > maxW || height > maxH) {
              if (width > height) {
                height = Math.round((height * maxW) / width);
                width = maxW;
              } else {
                width = Math.round((width * maxH) / height);
                height = maxH;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            const base64 = canvas.toDataURL('image/jpeg', 0.7);
            resolve(base64);
          };
          img.onerror = () => reject(new Error('Gagal memuat format gambar.'));
        };
        reader.onerror = () => reject(new Error('Gagal membaca file.'));
      });

      setImageUrl(compressedBase64);
    } catch (err: any) {
      setUploadError(err.message || 'Terjadi kesalahan saat memproses gambar.');
    } finally {
      setIsUploading(false);
    }
  };

  // Generate variants from option values input (separated by comma)
  const generateVariants = () => {
    if (!optName.trim() || !optValues.trim()) return;
    const values = optValues
      .split(',')
      .map(v => v.trim())
      .filter(Boolean);

    if (values.length === 0) return;

    const newVariants = values.map(val => ({
      name: `${val}`,
      price: basePrice || 0,
      stock: stock || 0,
      weightGram: weightGram || 0,
      sku: sku ? `${sku}-${val.toUpperCase().replace(/\s+/g, '-')}` : `${name.slice(0, 3).toUpperCase()}-${val.toUpperCase().replace(/\s+/g, '-')}`
    }));

    setVariantsList(prev => [...prev, ...newVariants]);
    setOptValues('');
  };

  // Update specific variant field
  const updateVariantField = (index: number, field: keyof UIVariant, value: any) => {
    const updated = [...variantsList];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setVariantsList(updated);
  };

  // Remove variant from list
  const removeVariant = (index: number) => {
    const updated = variantsList.filter((_, i) => i !== index);
    setVariantsList(updated);
  };

  // Checklist Validation
  const hasName = name.trim().length >= 3;
  const hasPrice = hasVariants ? variantsList.length > 0 : basePrice > 0;
  const hasPhoto = !!imageUrl;
  const hasDesc = description.trim().length >= 5;
  const hasCat = !!categoryId;

  const completedChecklistCount = [hasName, hasPrice, hasPhoto, hasDesc, hasCat].filter(Boolean).length;

  // Animated Quality Score Calculation
  const nameScore = hasName ? 20 : 0;
  const photoScore = hasPhoto ? 25 : 0;
  const priceScore = hasPrice ? 20 : 0;
  const descScore = description.trim().length >= 10 ? 20 : 0;
  const catScore = hasCat ? 15 : 0;
  
  const qualityScore = nameScore + photoScore + priceScore + descScore + catScore;

  // Get dynamic tips based on progress
  const getDynamicTip = () => {
    if (!hasPhoto) {
      return {
        title: 'Foto Produk Menarik',
        text: 'Produk dengan foto berlatar bersih dan terang dapat meningkatkan konversi pembelian hingga 40%.'
      };
    }
    if (description.trim().length < 20) {
      return {
        title: 'Tulis Deskripsi Lengkap',
        text: 'Jelaskan keunggulan dan ukuran produk Anda untuk mempermudah calon pembeli memesan via WhatsApp.'
      };
    }
    if (!hasCat) {
      return {
        title: 'Gunakan Kategori Toko',
        text: 'Mengelompokkan produk membantu pembeli mencari barang sejenis lebih cepat di webstore Anda.'
      };
    }
    if (!hasVariants) {
      return {
        title: 'Tawarkan Pilihan Variasi',
        text: 'Jika produk memiliki variasi warna/ukuran, tambahkan variasi agar pembeli tidak perlu bertanya manual.'
      };
    }
    return {
      title: 'Kualitas Produk Sempurna!',
      text: 'Informasi produk Anda sudah lengkap. Siap dibagikan dan dipromosikan ke pelanggan.'
    };
  };

  const currentTip = getDynamicTip();

  // Save submit handler
  const saveProduct = (targetStatus?: ProductStatus) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setErrorMessage('Nama produk wajib diisi.');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('Deskripsi produk wajib diisi.');
      return;
    }
    if (hasVariants && variantsList.length === 0) {
      setErrorMessage('Anda mengaktifkan variasi, harap tambahkan minimal 1 variasi produk.');
      return;
    }

    const currentStatus = targetStatus || status;

    startTransition(async () => {
      // Calculate final pricing & stock to reflect on parent product model
      const finalPrice = hasVariants 
        ? Math.min(...variantsList.map(v => v.price)) 
        : basePrice;
      
      const finalStock = hasVariants
        ? variantsList.reduce((sum, v) => sum + v.stock, 0)
        : stock;

      const finalWeight = hasVariants
        ? variantsList[0]?.weightGram || 0
        : weightGram;

      const finalSku = hasVariants
        ? variantsList[0]?.sku || ''
        : sku;

      const payload = {
        name,
        categoryId: categoryId || null,
        basePrice: finalPrice,
        stock: finalStock,
        weightGram: finalWeight,
        sku: finalSku || undefined,
        description,
        status: currentStatus,
        imageUrl,
        variants: hasVariants 
          ? variantsList.map(v => ({
              id: v.id,
              name: v.name,
              price: v.price,
              stock: v.stock,
              weightGram: v.weightGram,
              sku: v.sku || undefined
            }))
          : undefined
      };

      const result = isEdit
        ? await editProductAction(initialData.id, payload)
        : await createProductAction(payload);

      if (result.success) {
        setSuccessMessage(isEdit ? 'Produk berhasil diperbarui!' : 'Produk berhasil diterbitkan!');
        setTimeout(() => {
          router.push('/dashboard/products');
          router.refresh();
        }, 1500);
      } else {
        setErrorMessage(result.error || 'Terjadi kesalahan saat menyimpan produk.');
      }
    });
  };

  // Helper for currency formatting
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6 font-sans bg-[#F8FAFC] pb-24 text-slate-800">
      
      {/* HEADER HERO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-[#E2E8F0] rounded-[24px] p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push('/dashboard/products')}
            className="p-3 rounded-xl bg-slate-50 border border-[#E2E8F0] text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
            title="Kembali"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#0B1F33] tracking-tight">
              {isEdit ? 'Edit Produk' : 'Buat Produk Baru'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Siapkan produk terbaik Anda agar tampil profesional di webstore dan lebih mudah ditemukan pelanggan.
            </p>
          </div>
        </div>

        {/* Product Score on Top (Mobile & Desktop) */}
        <div className="w-full md:w-auto flex items-center gap-3 bg-slate-50 border border-[#E2E8F0] px-4 py-3 rounded-2xl">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Kualitas Produk</span>
            <div className="w-28 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  qualityScore >= 80 ? 'bg-[#10B981]' : qualityScore >= 50 ? 'bg-[#F59E0B]' : 'bg-[#EF4444]'
                }`}
                style={{ width: `${qualityScore}%` }}
              />
            </div>
          </div>
          <span className={`text-lg font-black shrink-0 ${
            qualityScore >= 80 ? 'text-[#10B981]' : qualityScore >= 50 ? 'text-[#F59E0B]' : 'text-[#EF4444]'
          }`}>
            {qualityScore}%
          </span>
        </div>
      </div>

      {/* Mode Demo Alert Banner */}
      <div className="bg-blue-50/50 border border-blue-200/50 rounded-[20px] p-4 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-slate-800">Workspace Terisolasi Mandiri</h4>
          <p className="text-[10px] text-slate-500 leading-normal font-medium">
            Perubahan yang Anda simpan akan langsung merefleksikan storefront online aktif untuk toko ini secara aman.
          </p>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-[#EF4444] text-xs font-semibold rounded-2xl p-4 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-[#10B981] text-xs font-semibold rounded-2xl p-4 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* MAIN TWO COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT COLUMN: WORKSPACE */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* STEP PROGRESS INDICATOR */}
          <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-5 shadow-sm">
            <div className="flex justify-between items-center text-xs font-bold text-slate-400">
              <div className={`flex items-center gap-1.5 ${hasName && hasDesc ? 'text-[#2563EB]' : ''}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center border text-[10px] ${
                  hasName && hasDesc ? 'bg-blue-50 border-[#2563EB]' : 'border-slate-350'
                }`}>1</span>
                <span>Produk</span>
              </div>
              <div className="w-8 h-px bg-slate-200" />
              <div className={`flex items-center gap-1.5 ${hasPhoto ? 'text-[#2563EB]' : ''}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center border text-[10px] ${
                  hasPhoto ? 'bg-blue-50 border-[#2563EB]' : 'border-slate-350'
                }`}>2</span>
                <span>Foto</span>
              </div>
              <div className="w-8 h-px bg-slate-200" />
              <div className={`flex items-center gap-1.5 ${hasPrice ? 'text-[#2563EB]' : ''}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center border text-[10px] ${
                  hasPrice ? 'bg-blue-50 border-[#2563EB]' : 'border-slate-350'
                }`}>3</span>
                <span>Harga</span>
              </div>
              <div className="w-8 h-px bg-slate-200" />
              <div className={`flex items-center gap-1.5 ${hasVariants ? 'text-[#2563EB]' : ''}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center border text-[10px] ${
                  hasVariants ? 'bg-blue-50 border-[#2563EB]' : 'border-slate-350'
                }`}>4</span>
                <span>Variasi</span>
              </div>
              <div className="w-8 h-px bg-slate-200" />
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full flex items-center justify-center border border-slate-300 text-[10px]">5</span>
                <span>Publikasi</span>
              </div>
            </div>
          </div>

          {/* SECTION 1: IDENTITAS PRODUK */}
          <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#2563EB]">
                <Package className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0B1F33]">Identitas Produk</h3>
                <p className="text-[10px] text-slate-400">Tentukan nama, deskripsi, dan kategori etalase produk Anda</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Nama Produk */}
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-xs font-bold text-[#0B1F33] flex items-center justify-between">
                  <span>Nama Produk Anda <span className="text-[#EF4444]">*</span></span>
                  <span className="text-[10px] text-slate-400 font-medium">{name.length}/80</span>
                </label>
                <input
                  id="name"
                  type="text"
                  maxLength={80}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Toya Rotan Latihan Standar 180 cm"
                  className="w-full bg-slate-50 border border-[#E2E8F0] focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] rounded-xl px-4 py-3 text-xs outline-none transition-all placeholder:text-slate-400"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Kategori Produk */}
                <div className="space-y-1.5">
                  <label htmlFor="category" className="text-xs font-bold text-[#0B1F33]">
                    Kategori Produk
                  </label>
                  {categories.length === 0 ? (
                    <div className="text-[11px] text-[#F59E0B] bg-amber-50/50 border border-amber-100 p-2.5 rounded-xl flex items-center gap-1.5 font-medium">
                      <Info className="w-3.5 h-3.5" />
                      <span>Belum ada kategori aktif. Produk ini akan disimpan sebagai tanpa kategori.</span>
                    </div>
                  ) : (
                    <select
                      id="category"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full bg-slate-50 border border-[#E2E8F0] focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] rounded-xl px-4 py-3 text-xs outline-none transition-all text-slate-700"
                    >
                      <option value="">-- Tanpa Kategori --</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Tampilkan di Webstore / Status */}
                <div className="space-y-1.5">
                  <label htmlFor="status" className="text-xs font-bold text-[#0B1F33]">
                    Apakah produk ini ingin ditampilkan di webstore?
                  </label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProductStatus)}
                    className="w-full bg-slate-50 border border-[#E2E8F0] focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] rounded-xl px-4 py-3 text-xs outline-none transition-all text-slate-700 font-bold"
                  >
                    <option value={ProductStatus.ACTIVE} className="text-[#10B981]">Ya, Tampilkan Langsung (Aktif)</option>
                    <option value={ProductStatus.DRAFT} className="text-slate-400">Simpan Sebagai Draft Internal</option>
                    <option value={ProductStatus.OUT_OF_STOCK} className="text-[#F59E0B]">Tampilkan tapi Stok Sedang Habis</option>
                  </select>
                </div>
              </div>

              {/* Deskripsi */}
              <div className="space-y-1.5">
                <label htmlFor="description" className="text-xs font-bold text-[#0B1F33] flex items-center justify-between">
                  <span>Ceritakan keunggulan produk Anda <span className="text-[#EF4444]">*</span></span>
                  <span className="text-[10px] text-slate-400 font-medium">Bahan, ukuran detail, dan kelebihan</span>
                </label>
                <textarea
                  id="description"
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tuliskan detail produk secara lengkap di sini. Gunakan bahasa yang mudah dipahami pembeli..."
                  className="w-full bg-slate-50 border border-[#E2E8F0] focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] rounded-xl px-4 py-3 text-xs outline-none transition-all resize-y placeholder:text-slate-400"
                  required
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: FOTO PRODUK (DOMINANT AREA) */}
          <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-[#14B8A6]">
                <ImageIcon className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0B1F33]">Foto Produk</h3>
                <p className="text-[10px] text-slate-400">Upload foto cover produk berkualitas tinggi untuk menarik pembeli</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {/* Drag and Drop Zone (Left 2/3) */}
              <div className="md:col-span-2 space-y-4">
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="relative group border-2 border-dashed border-[#E2E8F0] hover:border-[#2563EB] bg-slate-50 hover:bg-slate-100/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 min-h-[200px]"
                >
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isUploading}
                  />
                  {isUploading ? (
                    <div className="space-y-2 flex flex-col items-center">
                      <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
                      <p className="text-xs font-bold text-[#0B1F33]">Sedang mengompres gambar...</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-400 shadow-sm border border-slate-100 mx-auto group-hover:scale-105 transition-transform duration-300">
                        <Upload className="w-5 h-5 text-[#2563EB]" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-[#0B1F33]">Tarik foto ke sini atau Klik untuk memilih berkas</p>
                        <p className="text-[10px] text-slate-400">Mendukung format JPG, PNG, atau WEBP (Maks. 500KB)</p>
                      </div>
                    </div>
                  )}
                </div>

                {uploadError && (
                  <p className="text-[10px] text-[#EF4444] font-bold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {uploadError}
                  </p>
                )}

                {/* Cover & Gallery UI Previews */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Daftar Foto</span>
                  <div className="flex flex-wrap gap-3">
                    {/* Cover Preview Card */}
                    {imageUrl ? (
                      <div className="relative w-24 h-24 rounded-xl border border-[#E2E8F0] overflow-hidden group/img bg-slate-100 shadow-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={imageUrl} 
                          alt="Cover Preview" 
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute top-1 left-1 bg-[#10B981] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full select-none shadow">
                          Cover
                        </div>
                        <button
                          type="button"
                          onClick={() => setImageUrl(null)}
                          className="absolute inset-0 bg-black/45 flex items-center justify-center text-white opacity-0 group-hover/img:opacity-100 transition-opacity rounded-xl"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-xl border-2 border-dashed border-[#E2E8F0] bg-slate-50 flex items-center justify-center text-slate-400 select-none text-[10px] font-bold">
                        Belum ada foto
                      </div>
                    )}

                    {/* Placeholder Gallery Slots (UI only) */}
                    <div className="w-24 h-24 rounded-xl border border-[#E2E8F0] bg-slate-50/50 flex flex-col items-center justify-center text-slate-350 select-none text-[9px] font-medium border-dashed cursor-not-allowed">
                      <Plus className="w-3.5 h-3.5 text-slate-400 mb-1" />
                      <span>Foto Tambahan</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations Checklist (Right 1/3) */}
              <div className="bg-slate-50/50 border border-[#E2E8F0] p-4 rounded-2xl space-y-3">
                <span className="text-[10px] font-bold text-[#0B1F33] uppercase tracking-wider block">Rekomendasi Foto</span>
                <ul className="space-y-2 text-[10px] font-medium text-slate-550">
                  <li className="flex items-center gap-1.5 text-[#10B981]">
                    <Check className="w-4 h-4 stroke-[3] shrink-0" />
                    <span>Foto produk terang</span>
                  </li>
                  <li className="flex items-center gap-1.5 text-[#10B981]">
                    <Check className="w-4 h-4 stroke-[3] shrink-0" />
                    <span>Resolusi tinggi (min 800px)</span>
                  </li>
                  <li className="flex items-center gap-1.5 text-[#10B981]">
                    <Check className="w-4 h-4 stroke-[3] shrink-0" />
                    <span>Latar belakang bersih</span>
                  </li>
                </ul>
                <div className="border-t border-[#E2E8F0] pt-2 text-[9px] text-slate-400">
                  <p className="leading-relaxed">
                    *Foto yang rapi dan seragam mempermudah pembeli membandingkan spesifikasi produk.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: HARGA & PENJUALAN */}
          <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-[#10B981]">
                <Coins className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0B1F33]">Harga & Penjualan</h3>
                <p className="text-[10px] text-slate-400">Tentukan harga standar, kode SKU produk, berat, dan status persediaan</p>
              </div>
            </div>

            {/* Price question label */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="basePrice" className="text-xs font-bold text-[#0B1F33]">
                  Berapa harga produk ini? <span className="text-[#EF4444]">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-xs text-slate-500 font-bold">Rp</span>
                  <input
                    id="basePrice"
                    type="number"
                    value={basePrice}
                    onChange={(e) => setBasePrice(Math.max(0, Number(e.target.value)))}
                    placeholder="0"
                    disabled={hasVariants}
                    className="w-full bg-slate-50 border border-[#E2E8F0] focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] rounded-xl pl-12 pr-4 py-3 text-xs text-[#0B1F33] font-bold placeholder:text-slate-400 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                    required
                  />
                </div>
                {hasVariants && (
                  <p className="text-[10px] text-slate-400 italic">
                    *Harga dasar diisi otomatis berdasarkan harga variasi termurah di bawah.
                  </p>
                )}
              </div>

              {/* If Single Variant, Show Stock, Weight and SKU inputs here */}
              {!hasVariants && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Stock */}
                  <div className="space-y-1.5">
                    <label htmlFor="stock" className="text-xs font-bold text-[#0B1F33]">
                      Jumlah Stok Fisik <span className="text-[#EF4444]">*</span>
                    </label>
                    <input
                      id="stock"
                      type="number"
                      value={stock}
                      onChange={(e) => setStock(Math.max(0, Math.floor(Number(e.target.value))))}
                      className="w-full bg-slate-50 border border-[#E2E8F0] focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] rounded-xl px-4 py-3 text-xs outline-none transition-all font-bold"
                      required
                    />
                  </div>

                  {/* Weight */}
                  <div className="space-y-1.5">
                    <label htmlFor="weight" className="text-xs font-bold text-[#0B1F33]">
                      Berat Produk (Gram) <span className="text-[#EF4444]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="weight"
                        type="number"
                        value={weightGram}
                        onChange={(e) => setWeightGram(Math.max(0, Math.floor(Number(e.target.value))))}
                        className="w-full bg-slate-50 border border-[#E2E8F0] focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] rounded-xl pl-4 pr-12 py-3 text-xs outline-none transition-all font-bold"
                        required
                      />
                      <span className="absolute right-4 top-3 text-[10px] text-slate-400 font-bold">gram</span>
                    </div>
                  </div>

                  {/* SKU */}
                  <div className="space-y-1.5">
                    <label htmlFor="sku" className="text-xs font-bold text-[#0B1F33]">
                      Kode Produk (Opsional)
                    </label>
                    <input
                      id="sku"
                      type="text"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      placeholder="Contoh: TY-ROT-180-STD"
                      className="w-full bg-slate-50 border border-[#E2E8F0] focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] rounded-xl px-4 py-3 text-xs outline-none transition-all font-semibold"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 4: VARIASI PRODUK */}
          <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-[#F59E0B]">
                  <BarChart3 className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0B1F33]">Variasi Produk</h3>
                  <p className="text-[10px] text-slate-400">Aktifkan jika produk memiliki warna, ukuran, atau kemasan yang berbeda</p>
                </div>
              </div>

              {/* Active Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={hasVariants}
                  onChange={(e) => setHasVariants(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563EB]"></div>
              </label>
            </div>

            {hasVariants && (
              <div className="space-y-6">
                
                {/* Variant Generator Card */}
                <div className="bg-slate-50/50 border border-[#E2E8F0] p-4 rounded-2xl space-y-4">
                  <span className="text-[10px] font-bold text-[#0B1F33] uppercase tracking-wider block">Buat Pilihan Varian</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#0B1F33]">Nama Opsi (Warna/Ukuran)</label>
                      <input 
                        type="text"
                        value={optName}
                        onChange={(e) => setOptName(e.target.value)}
                        placeholder="Contoh: Ukuran"
                        className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs outline-none"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[10px] font-bold text-[#0B1F33]">Pilihan Nilai (Pisahkan dengan koma)</label>
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          value={optValues}
                          onChange={(e) => setOptValues(e.target.value)}
                          placeholder="S, M, L"
                          className="flex-1 bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs outline-none"
                        />
                        <button
                          type="button"
                          onClick={generateVariants}
                          className="py-2 px-4 bg-[#2563EB] hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition-all"
                        >
                          Generate
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Generated Combinations List */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Daftar Variasi Aktif ({variantsList.length})</span>
                  
                  {variantsList.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-slate-200 rounded-2xl text-xs text-slate-400">
                      Belum ada opsi variasi. Masukkan opsi di atas lalu klik &quot;Generate&quot;.
                    </div>
                  ) : (
                    <div className="border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm bg-white">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-50 border-b border-[#E2E8F0] text-[10px] font-bold text-slate-500 uppercase tracking-wider select-none">
                              <th className="px-4 py-3">Nama Varian</th>
                              <th className="px-4 py-3 w-32">Harga (Rp)</th>
                              <th className="px-4 py-3 w-20">Stok</th>
                              <th className="px-4 py-3 w-24">Berat (gr)</th>
                              <th className="px-4 py-3">Kode SKU</th>
                              <th className="px-4 py-3 text-center w-12">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {variantsList.map((variant, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/50">
                                <td className="px-4 py-2 font-bold text-[#0B1F33]">
                                  {variant.name}
                                </td>
                                <td className="px-4 py-2">
                                  <input 
                                    type="number"
                                    value={variant.price}
                                    onChange={(e) => updateVariantField(idx, 'price', Math.max(0, Number(e.target.value)))}
                                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none text-xs font-semibold focus:bg-white focus:border-[#2563EB]"
                                  />
                                </td>
                                <td className="px-4 py-2">
                                  <input 
                                    type="number"
                                    value={variant.stock}
                                    onChange={(e) => updateVariantField(idx, 'stock', Math.max(0, Math.floor(Number(e.target.value))))}
                                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none text-xs font-semibold focus:bg-white focus:border-[#2563EB]"
                                  />
                                </td>
                                <td className="px-4 py-2">
                                  <input 
                                    type="number"
                                    value={variant.weightGram}
                                    onChange={(e) => updateVariantField(idx, 'weightGram', Math.max(0, Math.floor(Number(e.target.value))))}
                                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none text-xs font-semibold focus:bg-white focus:border-[#2563EB]"
                                  />
                                </td>
                                <td className="px-4 py-2">
                                  <input 
                                    type="text"
                                    value={variant.sku}
                                    onChange={(e) => updateVariantField(idx, 'sku', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none text-[10px] font-mono focus:bg-white focus:border-[#2563EB]"
                                    placeholder="SKU"
                                  />
                                </td>
                                <td className="px-4 py-2 text-center">
                                  <button
                                    type="button"
                                    onClick={() => removeVariant(idx)}
                                    className="text-slate-400 hover:text-[#EF4444] transition-colors p-1"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 5: SEO & VISIBILITY (COLLAPSED BY DEFAULT) */}
          <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 shadow-sm">
            <button
              type="button"
              onClick={() => setIsSeoOpen(!isSeoOpen)}
              className="w-full flex justify-between items-center text-left"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Globe className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0B1F33]">SEO & Visibility</h3>
                  <p className="text-[10px] text-slate-400">Atur link produk (slug) dan bagaimana produk tampil di pencarian Google</p>
                </div>
              </div>
              <div>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isSeoOpen ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {isSeoOpen && (
              <div className="space-y-6 pt-6 border-t border-slate-100 mt-5">
                
                {/* Search Engine Listing Preview */}
                <div className="bg-slate-50 border border-[#E2E8F0] p-4 rounded-xl space-y-1.5 font-sans leading-normal">
                  <span className="text-[9px] font-bold text-[#2563EB] uppercase tracking-wider block">Google Search Preview</span>
                  <span className="text-sm font-semibold text-[#1a0dab] line-clamp-1 hover:underline cursor-pointer">
                    {metaTitle || (name ? `${name} | Toko Resmi` : 'Nama Produk Anda | Toko')}
                  </span>
                  <span className="text-[10px] text-[#006621] line-clamp-1 block">
                    https://daganta.store/p/{slug || 'link-produk'}
                  </span>
                  <span className="text-[11px] text-[#545454] line-clamp-2">
                    {metaDesc || (description ? description.slice(0, 150) : 'Tulis deskripsi produk di atas untuk melihat preview ringkasan SEO di sini...')}
                  </span>
                </div>

                {/* Slug Input */}
                <div className="space-y-1.5">
                  <label htmlFor="slug" className="text-xs font-bold text-[#0B1F33]">
                    Slug / Link Produk
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-[10px] text-slate-400 font-semibold select-none">/p/</span>
                    <input
                      id="slug"
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(slugify(e.target.value))}
                      placeholder="link-produk"
                      className="w-full bg-slate-50 border border-[#E2E8F0] focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] rounded-xl pl-10 pr-4 py-3 text-xs outline-none transition-all font-semibold"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">Link pendek otomatis yang akan diakses pembeli untuk melihat halaman produk ini.</p>
                </div>

                {/* Meta Title (UI Preview Helper Only) */}
                <div className="space-y-1.5">
                  <label htmlFor="metaTitle" className="text-xs font-bold text-[#0B1F33] flex items-center justify-between">
                    <span>Meta Title <span className="text-slate-400 font-medium">(Hanya Preview)</span></span>
                    <span className="text-[10px] text-slate-400 font-medium">{metaTitle.length}/60</span>
                  </label>
                  <input
                    id="metaTitle"
                    type="text"
                    maxLength={60}
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="Nama produk dan nama toko"
                    className="w-full bg-slate-50 border border-[#E2E8F0] focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] rounded-xl px-4 py-3 text-xs outline-none transition-all placeholder:text-slate-400"
                  />
                </div>

                {/* Meta Description (UI Preview Helper Only) */}
                <div className="space-y-1.5">
                  <label htmlFor="metaDesc" className="text-xs font-bold text-[#0B1F33] flex items-center justify-between">
                    <span>Meta Description <span className="text-slate-400 font-medium">(Hanya Preview)</span></span>
                    <span className="text-[10px] text-slate-400 font-medium">{metaDesc.length}/160</span>
                  </label>
                  <textarea
                    id="metaDesc"
                    maxLength={160}
                    rows={2}
                    value={metaDesc}
                    onChange={(e) => setMetaDesc(e.target.value)}
                    placeholder="Ringkasan penjelas produk"
                    className="w-full bg-slate-50 border border-[#E2E8F0] focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] rounded-xl px-4 py-3 text-xs outline-none transition-all resize-none placeholder:text-slate-400"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: STICKY LIVE PREVIEW PANEL */}
        <div className="space-y-6 lg:sticky lg:top-8">
          
          {/* LIVE STOREFRONT PREVIEW */}
          <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-5 shadow-sm space-y-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pratinjau Toko Online</span>

            <div className="border border-[#E2E8F0] rounded-[20px] overflow-hidden bg-white shadow-sm flex flex-col max-w-sm mx-auto select-none">
              {/* Product Cover image */}
              <div className="aspect-square bg-slate-100 relative overflow-hidden flex items-center justify-center">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={imageUrl} 
                    alt="Preview" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-350 space-y-2 p-6">
                    <ImageIcon className="w-10 h-10" />
                    <span className="text-[10px] font-bold">Belum Ada Gambar</span>
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-1.5 rounded-full shadow-sm text-slate-600">
                  <ImageIcon className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold bg-blue-50 text-[#2563EB] px-2 py-0.5 rounded-full select-none inline-block">
                    {categoryId 
                      ? categories.find(c => c.id === categoryId)?.name || 'Katalog' 
                      : 'Umum'
                    }
                  </span>
                  <h4 className="text-sm font-bold text-[#0B1F33] line-clamp-2">
                    {name || 'Nama Produk Anda'}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-medium line-clamp-2 leading-relaxed">
                    {description || 'Ceritakan keunggulan produk Anda agar pembeli tertarik langsung memesan.'}
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-base font-black text-[#2563EB]">
                      {hasVariants && variantsList.length > 0
                        ? formatRupiah(Math.min(...variantsList.map(v => v.price)))
                        : formatRupiah(basePrice)
                      }
                    </span>
                    {hasVariants && variantsList.length > 1 && (
                      <span className="text-[10px] text-slate-400 font-bold">
                        - {formatRupiah(Math.max(...variantsList.map(v => v.price)))}
                      </span>
                    )}
                  </div>

                  {/* Buy/WhatsApp button */}
                  <button
                    type="button"
                    className="w-full py-2.5 px-4 bg-[#10B981] hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-emerald-500/10 flex items-center justify-center gap-1.5"
                  >
                    {/* Simulated WA icon */}
                    <span className="font-extrabold text-sm">💬</span>
                    <span>Pesan via WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* CHECKLIST & SCORES */}
          <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kualitas Data</span>
              <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-[#2563EB] border border-blue-100 rounded-full font-bold">
                {completedChecklistCount} / 5 Lengkap
              </span>
            </div>

            {/* Checklist items */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2.5 font-medium text-slate-650">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                  hasName ? 'bg-emerald-50 border border-emerald-100 text-[#10B981]' : 'bg-slate-50 border border-slate-200 text-slate-350'
                }`}>
                  <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                </span>
                <span className={hasName ? 'text-slate-550' : 'text-slate-400 line-through decoration-slate-300'}>Nama Produk Jelas</span>
              </div>
              <div className="flex items-center gap-2.5 font-medium text-slate-650">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                  hasPrice ? 'bg-emerald-50 border border-emerald-100 text-[#10B981]' : 'bg-slate-50 border border-slate-200 text-slate-350'
                }`}>
                  <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                </span>
                <span className={hasPrice ? 'text-slate-550' : 'text-slate-400 line-through decoration-slate-300'}>Harga Dasar Diisi</span>
              </div>
              <div className="flex items-center gap-2.5 font-medium text-slate-650">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                  hasPhoto ? 'bg-emerald-50 border border-emerald-100 text-[#10B981]' : 'bg-slate-50 border border-slate-200 text-slate-350'
                }`}>
                  <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                </span>
                <span className={hasPhoto ? 'text-slate-550' : 'text-slate-400 line-through decoration-slate-300'}>Foto Utama Diupload</span>
              </div>
              <div className="flex items-center gap-2.5 font-medium text-slate-650">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                  hasDesc ? 'bg-emerald-50 border border-emerald-100 text-[#10B981]' : 'bg-slate-50 border border-slate-200 text-slate-350'
                }`}>
                  <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                </span>
                <span className={hasDesc ? 'text-slate-550' : 'text-slate-400 line-through decoration-slate-300'}>Deskripsi Lengkap</span>
              </div>
              <div className="flex items-center gap-2.5 font-medium text-slate-650">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                  hasCat ? 'bg-emerald-50 border border-emerald-100 text-[#10B981]' : 'bg-slate-50 border border-slate-200 text-slate-350'
                }`}>
                  <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                </span>
                <span className={hasCat ? 'text-slate-550' : 'text-slate-400 line-through decoration-slate-300'}>Kategori Dipilih</span>
              </div>
            </div>
          </div>

          {/* DYNAMIC TIPS CARD */}
          <div className="bg-slate-50 border border-[#E2E8F0] p-5 rounded-[24px] space-y-2">
            <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-wider block">Tips Daganta</span>
            <h5 className="text-xs font-bold text-[#0B1F33] flex items-center gap-1.5">
              <Sparkles className="w-4.5 h-4.5 text-[#14B8A6]" />
              <span>{currentTip.title}</span>
            </h5>
            <p className="text-[10px] text-slate-550 font-medium leading-relaxed">
              {currentTip.text}
            </p>
          </div>
        </div>
      </div>

      {/* STICKY BOTTOM ACTIONS BAR (DESKTOP STICKY, MOBILE FIXED) */}
      <div className="fixed sm:sticky bottom-0 left-0 right-0 sm:right-auto sm:left-auto bg-white border-t border-[#E2E8F0] py-4 px-6 sm:px-8 -mx-0 sm:-mx-8 flex items-center justify-between z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] sm:rounded-[24px] sm:my-8 sm:border sm:mx-0">
        
        {/* Save Draft Trigger (Invisible on mobile, simple click) */}
        <button
          type="button"
          onClick={() => saveProduct(ProductStatus.DRAFT)}
          disabled={isPending}
          className="py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-[#E2E8F0] text-slate-700 text-xs font-bold rounded-xl transition-all disabled:opacity-50"
        >
          {isPending ? 'Memproses...' : 'Simpan Draft'}
        </button>

        {/* Desktop Buttons Right */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/dashboard/products')}
            className="py-2.5 px-4 text-slate-400 hover:text-slate-800 text-xs font-bold rounded-xl transition-all"
            disabled={isPending}
          >
            Batal
          </button>
          
          <button
            type="button"
            onClick={() => saveProduct(ProductStatus.ACTIVE)}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 py-2.5 px-5 bg-[#2563EB] hover:bg-blue-600 active:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Floating mobile preview card toggle */}
      <div className="block lg:hidden fixed bottom-20 right-6 z-50">
        <button
          type="button"
          onClick={() => setIsMobilePreviewOpen(!isMobilePreviewOpen)}
          className="p-3 bg-[#0B1F33] text-white hover:bg-slate-800 rounded-full shadow-lg shadow-[#0B1F33]/25 flex items-center justify-center transition-transform hover:scale-105"
        >
          <Eye className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Preview Sheet Overlay */}
      {isMobilePreviewOpen && (
        <div 
          onClick={() => setIsMobilePreviewOpen(false)}
          className="block lg:hidden fixed inset-0 bg-black/40 z-50 flex items-end justify-center"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-white rounded-t-[30px] p-6 max-h-[90vh] overflow-y-auto space-y-4 animate-slide-up"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-[#0B1F33]">Pratinjau Tampilan Toko</span>
              <button
                type="button"
                onClick={() => setIsMobilePreviewOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-800 font-bold"
              >
                Tutup
              </button>
            </div>
            
            {/* Storefront preview card */}
            <div className="border border-[#E2E8F0] rounded-[20px] overflow-hidden bg-white shadow-sm flex flex-col max-w-sm mx-auto select-none">
              <div className="aspect-square bg-slate-100 relative overflow-hidden flex items-center justify-center">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={imageUrl} 
                    alt="Preview" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-350 space-y-2 p-6">
                    <ImageIcon className="w-10 h-10" />
                    <span className="text-[10px] font-bold">Belum Ada Gambar</span>
                  </div>
                )}
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold bg-blue-50 text-[#2563EB] px-2 py-0.5 rounded-full select-none inline-block">
                    {categoryId 
                      ? categories.find(c => c.id === categoryId)?.name || 'Katalog' 
                      : 'Umum'
                    }
                  </span>
                  <h4 className="text-sm font-bold text-[#0B1F33] line-clamp-2">
                    {name || 'Nama Produk Anda'}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-medium line-clamp-2 leading-relaxed">
                    {description || 'Ceritakan keunggulan produk Anda agar pembeli tertarik.'}
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-base font-black text-[#2563EB]">
                      {hasVariants && variantsList.length > 0
                        ? formatRupiah(Math.min(...variantsList.map(v => v.price)))
                        : formatRupiah(basePrice)
                      }
                    </span>
                    {hasVariants && variantsList.length > 1 && (
                      <span className="text-[10px] text-slate-400 font-bold">
                        - {formatRupiah(Math.max(...variantsList.map(v => v.price)))}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    className="w-full py-2.5 px-4 bg-[#10B981] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <span className="font-extrabold text-sm">💬</span>
                    <span>Pesan via WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

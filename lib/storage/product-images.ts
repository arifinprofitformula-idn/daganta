import { createClient } from '@supabase/supabase-js';
import { getSupabasePublicConfig, requireSupabaseServiceRoleKey } from '@/lib/config/env';

const PRODUCT_IMAGES_BUCKET = 'product-images';

function createStorageClient() {
  const { url } = getSupabasePublicConfig();
  const serviceRoleKey = requireSupabaseServiceRoleKey();

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function sanitizeFileName(fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase() || 'jpg';
  const baseName = fileName
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

  return `${baseName || 'product-image'}.${extension}`;
}

function getStoragePathFromPublicUrl(url: string) {
  const marker = `/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/`;
  const markerIndex = url.indexOf(marker);

  if (markerIndex === -1) {
    return null;
  }

  return decodeURIComponent(url.slice(markerIndex + marker.length));
}

export async function uploadProductImage(tenantId: string, productId: string, file: File) {
  if (!tenantId || !productId) {
    throw new Error('tenantId and productId are required for product image uploads');
  }

  if (!file || file.size === 0) {
    throw new Error('File gambar tidak valid.');
  }

  const safeFileName = sanitizeFileName(file.name);
  const path = `${tenantId}/${productId}/${Date.now()}-${safeFileName}`;
  const supabase = createStorageClient();

  const { error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(path, file, {
      contentType: file.type || 'image/jpeg',
      upsert: false,
    });

  if (error) {
    throw new Error(`Gagal mengunggah gambar produk: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path);

  return publicUrl;
}

export async function deleteProductImage(url: string) {
  const path = getStoragePathFromPublicUrl(url);

  if (!path) {
    return;
  }

  const supabase = createStorageClient();
  const { error } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove([path]);

  if (error) {
    throw new Error(`Gagal menghapus gambar produk: ${error.message}`);
  }
}

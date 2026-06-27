import { createClient } from '@supabase/supabase-js';
import { getSupabasePublicConfig, requireSupabaseServiceRoleKey } from '@/lib/config/env';

const PAYMENT_PROOFS_BUCKET = 'payment-proofs';

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

  return `${baseName || 'payment-proof'}.${extension}`;
}

export async function uploadPaymentProof(tenantId: string, invoiceId: string, file: File) {
  if (!tenantId || !invoiceId) {
    throw new Error('tenantId and invoiceId are required for payment proof uploads');
  }

  if (!file || file.size === 0) {
    throw new Error('File bukti pembayaran tidak valid.');
  }

  const safeFileName = sanitizeFileName(file.name);
  const path = `${tenantId}/${invoiceId}/${Date.now()}-${safeFileName}`;
  const supabase = createStorageClient();

  const { error } = await supabase.storage.from(PAYMENT_PROOFS_BUCKET).upload(path, file, {
    contentType: file.type || 'image/jpeg',
    upsert: false,
  });

  if (error) {
    throw new Error(`Gagal mengunggah bukti pembayaran: ${error.message}`);
  }

  return path;
}

export async function createPaymentProofSignedUrl(path: string) {
  if (!path) {
    return null;
  }

  const supabase = createStorageClient();
  const { data, error } = await supabase.storage.from(PAYMENT_PROOFS_BUCKET).createSignedUrl(path, 60 * 10);

  if (error) {
    throw new Error(`Gagal membuat tautan bukti pembayaran: ${error.message}`);
  }

  return data.signedUrl;
}

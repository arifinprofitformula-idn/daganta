'use server';

import { InvoiceStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { logAuditAction } from '@/lib/audit/log-action';
import { getActiveTenantContext } from '@/lib/auth/tenant-access';
import { validateTenantAccess } from '@/lib/auth/validate-tenant-access';
import { prisma } from '@/lib/prisma';
import { uploadPaymentProof } from '@/lib/storage/payment-proofs';

const MAX_PROOF_SIZE = 5 * 1024 * 1024;
const ALLOWED_PROOF_TYPES = new Set(['image/jpeg', 'image/png']);

function redirectWithError(invoiceId: string, message: string): never {
  redirect(`/dashboard/billing/pay/${invoiceId}?error=${encodeURIComponent(message)}`);
}

function redirectWithSuccess(invoiceId: string): never {
  redirect(`/dashboard/billing/pay/${invoiceId}?success=proof-submitted`);
}

function getRequiredFile(formData: FormData) {
  const value = formData.get('proof');

  if (!(value instanceof File) || value.size === 0) {
    throw new Error('Bukti transfer wajib diunggah.');
  }

  if (!ALLOWED_PROOF_TYPES.has(value.type)) {
    throw new Error('Format bukti transfer harus JPG atau PNG.');
  }

  if (value.size > MAX_PROOF_SIZE) {
    throw new Error('Ukuran bukti transfer maksimal 5MB.');
  }

  return value;
}

export async function submitPaymentProofAction(invoiceId: string, formData: FormData) {
  const tenantCtx = await getActiveTenantContext();

  if (tenantCtx.status !== 'SUCCESS' || !tenantCtx.activeTenant || !tenantCtx.userProfile) {
    redirect('/login');
  }

  const tenantId = tenantCtx.activeTenant.id;
  const actorId = tenantCtx.userProfile.id;

  try {
    await validateTenantAccess(actorId, tenantId);

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        tenantId,
      },
      select: {
        id: true,
        invoiceNumber: true,
        status: true,
      },
    });

    if (!invoice) {
      redirectWithError(invoiceId, 'Invoice tidak ditemukan untuk toko aktif Anda.');
    }

    if (invoice.status === InvoiceStatus.PAID) {
      redirectWithError(invoiceId, 'Invoice ini sudah lunas.');
    }

    const file = getRequiredFile(formData);
    const note = String(formData.get('note') || '').trim();
    const proofPath = await uploadPaymentProof(tenantId, invoiceId, file);
    const uploadedAt = new Date();

    const updateResult = await prisma.invoice.updateMany({
      where: {
        id: invoiceId,
        tenantId,
      },
      data: {
        status: InvoiceStatus.PENDING_VERIFICATION,
        paymentProofUrl: proofPath,
        paymentProofNote: note || null,
        paymentProofUploadedAt: uploadedAt,
      },
    });

    if (updateResult.count === 0) {
      redirectWithError(invoiceId, 'Invoice tidak ditemukan atau berada di luar akses toko Anda.');
    }

    await logAuditAction({
      tenantId,
      userId: actorId,
      action: 'SUBMIT_PAYMENT_PROOF',
      entityType: 'Invoice',
      entityId: invoiceId,
      metadata: {
        invoiceNumber: invoice.invoiceNumber,
        proofPath,
        uploadedAt: uploadedAt.toISOString(),
        hasNote: Boolean(note),
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      redirectWithError(invoiceId, error.message);
    }

    redirectWithError(invoiceId, 'Bukti pembayaran belum berhasil dikirim.');
  }

  revalidatePath('/dashboard/billing');
  revalidatePath(`/dashboard/billing/pay/${invoiceId}`);
  redirectWithSuccess(invoiceId);
}

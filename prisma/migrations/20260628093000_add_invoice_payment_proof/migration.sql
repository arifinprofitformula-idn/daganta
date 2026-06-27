-- Add manual transfer proof workflow for tenant billing invoices.
ALTER TYPE "InvoiceStatus" ADD VALUE IF NOT EXISTS 'PENDING_VERIFICATION';
ALTER TYPE "InvoiceStatus" ADD VALUE IF NOT EXISTS 'REJECTED';

ALTER TABLE "Invoice"
  ADD COLUMN "paymentProofUrl" TEXT,
  ADD COLUMN "paymentProofNote" TEXT,
  ADD COLUMN "paymentProofUploadedAt" TIMESTAMP(3);

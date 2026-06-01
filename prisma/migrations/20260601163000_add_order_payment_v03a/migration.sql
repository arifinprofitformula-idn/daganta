-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('MANUAL', 'MIDTRANS', 'XENDIT', 'TRIPAY');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('MANUAL_TRANSFER');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('WAITING_PAYMENT', 'WAITING_VERIFICATION', 'VERIFIED', 'REJECTED');

-- CreateTable
CREATE TABLE "OrderPayment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "provider" "PaymentProvider" NOT NULL DEFAULT 'MANUAL',
    "method" "PaymentMethod" NOT NULL DEFAULT 'MANUAL_TRANSFER',
    "status" "PaymentStatus" NOT NULL DEFAULT 'WAITING_PAYMENT',
    "amount" DECIMAL(12,2) NOT NULL,
    "proofNote" TEXT,
    "adminNote" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrderPayment_orderId_key" ON "OrderPayment"("orderId");

-- CreateIndex
CREATE INDEX "OrderPayment_tenantId_idx" ON "OrderPayment"("tenantId");

-- CreateIndex
CREATE INDEX "OrderPayment_tenantId_status_idx" ON "OrderPayment"("tenantId", "status");

-- CreateIndex
CREATE INDEX "OrderPayment_tenantId_orderId_idx" ON "OrderPayment"("tenantId", "orderId");

-- AddForeignKey
ALTER TABLE "OrderPayment" ADD CONSTRAINT "OrderPayment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderPayment" ADD CONSTRAINT "OrderPayment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

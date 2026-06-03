-- CreateEnum
CREATE TYPE "AgentStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AgentClientStatus" AS ENUM ('DRAFT', 'ACTIVE', 'LIMITED', 'SUSPENDED', 'TRANSFERRED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AgentClientOwnershipStatus" AS ENUM ('AGENT_MANAGED', 'DIRECT_DAGANTA', 'TRANSFERRED_TO_CLIENT', 'TRANSFERRED_TO_DAGANTA');

-- CreateEnum
CREATE TYPE "AgentCreditLedgerType" AS ENUM ('TOP_UP', 'STORE_ACTIVATION', 'STORE_RENEWAL', 'REFUND', 'ADMIN_ADJUSTMENT', 'TRANSFER_OUT', 'TRANSFER_IN');

-- CreateEnum
CREATE TYPE "AgentCreditDirection" AS ENUM ('CREDIT', 'DEBIT');

-- CreateTable
CREATE TABLE "AgentProfile" (
    "id" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "agentCode" TEXT NOT NULL,
    "referralCode" TEXT,
    "displayName" TEXT NOT NULL,
    "status" "AgentStatus" NOT NULL DEFAULT 'PENDING',
    "maxActiveClients" INTEGER NOT NULL DEFAULT 3,
    "maxDraftClients" INTEGER NOT NULL DEFAULT 5,
    "creditBalance" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentClient" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "status" "AgentClientStatus" NOT NULL DEFAULT 'DRAFT',
    "ownershipStatus" "AgentClientOwnershipStatus" NOT NULL DEFAULT 'AGENT_MANAGED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "transferredAt" TIMESTAMP(3),
    "transferredByUserId" TEXT,
    "notes" TEXT,

    CONSTRAINT "AgentClient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentCreditLedger" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "type" "AgentCreditLedgerType" NOT NULL,
    "direction" "AgentCreditDirection" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "balanceBefore" DECIMAL(12,2) NOT NULL,
    "balanceAfter" DECIMAL(12,2) NOT NULL,
    "referenceTenantId" TEXT,
    "referenceInvoiceId" TEXT,
    "referenceClientId" TEXT,
    "description" TEXT,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentCreditLedger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AgentProfile_userProfileId_key" ON "AgentProfile"("userProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "AgentProfile_agentCode_key" ON "AgentProfile"("agentCode");

-- CreateIndex
CREATE UNIQUE INDEX "AgentProfile_referralCode_key" ON "AgentProfile"("referralCode");

-- CreateIndex
CREATE UNIQUE INDEX "AgentClient_tenantId_key" ON "AgentClient"("tenantId");

-- CreateIndex
CREATE INDEX "AgentClient_agentId_status_idx" ON "AgentClient"("agentId", "status");

-- CreateIndex
CREATE INDEX "AgentCreditLedger_agentId_idx" ON "AgentCreditLedger"("agentId");

-- CreateIndex
CREATE INDEX "AgentCreditLedger_createdAt_idx" ON "AgentCreditLedger"("createdAt");

-- AddForeignKey
ALTER TABLE "AgentProfile" ADD CONSTRAINT "AgentProfile_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentClient" ADD CONSTRAINT "AgentClient_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AgentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentClient" ADD CONSTRAINT "AgentClient_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentClient" ADD CONSTRAINT "AgentClient_transferredByUserId_fkey" FOREIGN KEY ("transferredByUserId") REFERENCES "UserProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentCreditLedger" ADD CONSTRAINT "AgentCreditLedger_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AgentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentCreditLedger" ADD CONSTRAINT "AgentCreditLedger_referenceTenantId_fkey" FOREIGN KEY ("referenceTenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentCreditLedger" ADD CONSTRAINT "AgentCreditLedger_referenceInvoiceId_fkey" FOREIGN KEY ("referenceInvoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentCreditLedger" ADD CONSTRAINT "AgentCreditLedger_referenceClientId_fkey" FOREIGN KEY ("referenceClientId") REFERENCES "AgentClient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentCreditLedger" ADD CONSTRAINT "AgentCreditLedger_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "UserProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

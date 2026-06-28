CREATE TYPE "AgentCreditTopupStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE "AgentCreditTopupRequest" (
  "id" TEXT NOT NULL,
  "agentId" TEXT NOT NULL,
  "amount" DECIMAL(12, 2) NOT NULL,
  "note" TEXT,
  "status" "AgentCreditTopupStatus" NOT NULL DEFAULT 'PENDING',
  "reviewedByUserId" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "AgentCreditTopupRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AgentCreditTopupRequest_agentId_status_idx" ON "AgentCreditTopupRequest"("agentId", "status");
CREATE INDEX "AgentCreditTopupRequest_status_createdAt_idx" ON "AgentCreditTopupRequest"("status", "createdAt");

ALTER TABLE "AgentCreditTopupRequest"
  ADD CONSTRAINT "AgentCreditTopupRequest_agentId_fkey"
  FOREIGN KEY ("agentId") REFERENCES "AgentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AgentCreditTopupRequest"
  ADD CONSTRAINT "AgentCreditTopupRequest_reviewedByUserId_fkey"
  FOREIGN KEY ("reviewedByUserId") REFERENCES "UserProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

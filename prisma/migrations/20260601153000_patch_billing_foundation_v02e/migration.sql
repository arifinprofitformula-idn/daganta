-- Patch SubscriptionStatus to match the approved v0.2E billing lifecycle.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'SubscriptionStatus'
      AND e.enumlabel = 'LIMITED'
  ) THEN
    ALTER TYPE "SubscriptionStatus" RENAME VALUE 'LIMITED' TO 'LIMITED_MODE';
  END IF;
END $$;

ALTER TYPE "SubscriptionStatus" ADD VALUE IF NOT EXISTS 'EXPIRING_SOON' AFTER 'ACTIVE';
ALTER TYPE "SubscriptionStatus" ADD VALUE IF NOT EXISTS 'SUSPENDED' AFTER 'LIMITED_MODE';

-- Keep invoice subscription optional, but make the invoiced plan explicit and required.
ALTER TABLE "Invoice" ADD COLUMN "planId" TEXT;

UPDATE "Invoice"
SET "planId" = COALESCE(
  (
    SELECT "TenantSubscription"."planId"
    FROM "TenantSubscription"
    WHERE "TenantSubscription"."id" = "Invoice"."subscriptionId"
  ),
  (
    SELECT "SubscriptionPlan"."id"
    FROM "SubscriptionPlan"
    WHERE "SubscriptionPlan"."code" = 'STARTER_MONTHLY'
    LIMIT 1
  ),
  (
    SELECT "SubscriptionPlan"."id"
    FROM "SubscriptionPlan"
    ORDER BY "SubscriptionPlan"."createdAt" ASC
    LIMIT 1
  )
);

ALTER TABLE "Invoice" ALTER COLUMN "planId" SET NOT NULL;

CREATE INDEX "Invoice_planId_idx" ON "Invoice"("planId");

ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

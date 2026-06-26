-- Add tenant-level WhatsApp number used by storefront CTA.
-- Apply manually from Supabase/Sumopod SQL editor before relying on Tenant.whatsappNumber.

ALTER TABLE "Tenant"
  ADD COLUMN IF NOT EXISTS "whatsappNumber" TEXT;

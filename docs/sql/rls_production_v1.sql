-- ============================================================================
-- Daganta RLS Production Policy v1
-- Apply manually from Supabase/Sumopod SQL editor after review.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- Helper functions
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.daganta_is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM "UserProfile" up
    WHERE up."authUserId" = auth.uid()::text
      AND up."platformRole" = 'SUPER_ADMIN'
  );
$$;

CREATE OR REPLACE FUNCTION public.daganta_is_tenant_member(target_tenant_id TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT target_tenant_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM "TenantMember" tm
      JOIN "UserProfile" up ON up."id" = tm."userId"
      WHERE tm."tenantId"::text = target_tenant_id
        AND up."authUserId" = auth.uid()::text
    );
$$;

-- ----------------------------------------------------------------------------
-- Enable RLS
-- ----------------------------------------------------------------------------

ALTER TABLE "Tenant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TenantMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductCategory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductVariant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Customer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderPayment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Address" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TenantSubscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Invoice" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "NotificationEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AgentClient" ENABLE ROW LEVEL SECURITY;

-- Public reference data remains readable.
ALTER TABLE "Province" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Regency" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "District" ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- Drop old policies for idempotent re-apply
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "superadmin_all" ON "Tenant";
DROP POLICY IF EXISTS "tenant_isolation_select" ON "Tenant";
DROP POLICY IF EXISTS "tenant_isolation_insert" ON "Tenant";
DROP POLICY IF EXISTS "tenant_isolation_update" ON "Tenant";
DROP POLICY IF EXISTS "tenant_isolation_delete" ON "Tenant";
DROP POLICY IF EXISTS "public_storefront_select" ON "Tenant";

DROP POLICY IF EXISTS "superadmin_all" ON "TenantMember";
DROP POLICY IF EXISTS "tenant_isolation_select" ON "TenantMember";
DROP POLICY IF EXISTS "tenant_isolation_insert" ON "TenantMember";
DROP POLICY IF EXISTS "tenant_isolation_update" ON "TenantMember";
DROP POLICY IF EXISTS "tenant_isolation_delete" ON "TenantMember";

DROP POLICY IF EXISTS "superadmin_all" ON "ProductCategory";
DROP POLICY IF EXISTS "tenant_isolation_select" ON "ProductCategory";
DROP POLICY IF EXISTS "tenant_isolation_insert" ON "ProductCategory";
DROP POLICY IF EXISTS "tenant_isolation_update" ON "ProductCategory";
DROP POLICY IF EXISTS "tenant_isolation_delete" ON "ProductCategory";
DROP POLICY IF EXISTS "public_storefront_select" ON "ProductCategory";

DROP POLICY IF EXISTS "superadmin_all" ON "Product";
DROP POLICY IF EXISTS "tenant_isolation_select" ON "Product";
DROP POLICY IF EXISTS "tenant_isolation_insert" ON "Product";
DROP POLICY IF EXISTS "tenant_isolation_update" ON "Product";
DROP POLICY IF EXISTS "tenant_isolation_delete" ON "Product";
DROP POLICY IF EXISTS "public_storefront_select" ON "Product";

DROP POLICY IF EXISTS "superadmin_all" ON "ProductVariant";
DROP POLICY IF EXISTS "tenant_isolation_select" ON "ProductVariant";
DROP POLICY IF EXISTS "tenant_isolation_insert" ON "ProductVariant";
DROP POLICY IF EXISTS "tenant_isolation_update" ON "ProductVariant";
DROP POLICY IF EXISTS "tenant_isolation_delete" ON "ProductVariant";
DROP POLICY IF EXISTS "public_storefront_select" ON "ProductVariant";

DROP POLICY IF EXISTS "superadmin_all" ON "Customer";
DROP POLICY IF EXISTS "tenant_isolation_select" ON "Customer";
DROP POLICY IF EXISTS "tenant_isolation_insert" ON "Customer";
DROP POLICY IF EXISTS "tenant_isolation_update" ON "Customer";
DROP POLICY IF EXISTS "tenant_isolation_delete" ON "Customer";

DROP POLICY IF EXISTS "superadmin_all" ON "Order";
DROP POLICY IF EXISTS "tenant_isolation_select" ON "Order";
DROP POLICY IF EXISTS "tenant_isolation_insert" ON "Order";
DROP POLICY IF EXISTS "tenant_isolation_update" ON "Order";
DROP POLICY IF EXISTS "tenant_isolation_delete" ON "Order";

DROP POLICY IF EXISTS "superadmin_all" ON "OrderPayment";
DROP POLICY IF EXISTS "tenant_isolation_select" ON "OrderPayment";
DROP POLICY IF EXISTS "tenant_isolation_insert" ON "OrderPayment";
DROP POLICY IF EXISTS "tenant_isolation_update" ON "OrderPayment";
DROP POLICY IF EXISTS "tenant_isolation_delete" ON "OrderPayment";

DROP POLICY IF EXISTS "superadmin_all" ON "OrderItem";
DROP POLICY IF EXISTS "tenant_isolation_select" ON "OrderItem";
DROP POLICY IF EXISTS "tenant_isolation_insert" ON "OrderItem";
DROP POLICY IF EXISTS "tenant_isolation_update" ON "OrderItem";
DROP POLICY IF EXISTS "tenant_isolation_delete" ON "OrderItem";

DROP POLICY IF EXISTS "superadmin_all" ON "Address";
DROP POLICY IF EXISTS "tenant_isolation_select" ON "Address";
DROP POLICY IF EXISTS "tenant_isolation_insert" ON "Address";
DROP POLICY IF EXISTS "tenant_isolation_update" ON "Address";
DROP POLICY IF EXISTS "tenant_isolation_delete" ON "Address";

DROP POLICY IF EXISTS "superadmin_all" ON "AuditLog";
DROP POLICY IF EXISTS "tenant_isolation_select" ON "AuditLog";
DROP POLICY IF EXISTS "tenant_isolation_insert" ON "AuditLog";
DROP POLICY IF EXISTS "tenant_isolation_update" ON "AuditLog";
DROP POLICY IF EXISTS "tenant_isolation_delete" ON "AuditLog";

DROP POLICY IF EXISTS "superadmin_all" ON "TenantSubscription";
DROP POLICY IF EXISTS "tenant_isolation_select" ON "TenantSubscription";
DROP POLICY IF EXISTS "tenant_isolation_insert" ON "TenantSubscription";
DROP POLICY IF EXISTS "tenant_isolation_update" ON "TenantSubscription";
DROP POLICY IF EXISTS "tenant_isolation_delete" ON "TenantSubscription";

DROP POLICY IF EXISTS "superadmin_all" ON "Invoice";
DROP POLICY IF EXISTS "tenant_isolation_select" ON "Invoice";
DROP POLICY IF EXISTS "tenant_isolation_insert" ON "Invoice";
DROP POLICY IF EXISTS "tenant_isolation_update" ON "Invoice";
DROP POLICY IF EXISTS "tenant_isolation_delete" ON "Invoice";

DROP POLICY IF EXISTS "superadmin_all" ON "NotificationEvent";
DROP POLICY IF EXISTS "tenant_isolation_select" ON "NotificationEvent";
DROP POLICY IF EXISTS "tenant_isolation_insert" ON "NotificationEvent";
DROP POLICY IF EXISTS "tenant_isolation_update" ON "NotificationEvent";
DROP POLICY IF EXISTS "tenant_isolation_delete" ON "NotificationEvent";

DROP POLICY IF EXISTS "superadmin_all" ON "AgentClient";
DROP POLICY IF EXISTS "tenant_isolation_select" ON "AgentClient";
DROP POLICY IF EXISTS "tenant_isolation_insert" ON "AgentClient";
DROP POLICY IF EXISTS "tenant_isolation_update" ON "AgentClient";
DROP POLICY IF EXISTS "tenant_isolation_delete" ON "AgentClient";

DROP POLICY IF EXISTS "public_read" ON "Province";
DROP POLICY IF EXISTS "public_read" ON "Regency";
DROP POLICY IF EXISTS "public_read" ON "District";

-- ----------------------------------------------------------------------------
-- Public non-business reference policies
-- ----------------------------------------------------------------------------

CREATE POLICY "public_read" ON "Province"
  FOR SELECT TO public USING (true);

CREATE POLICY "public_read" ON "Regency"
  FOR SELECT TO public USING (true);

CREATE POLICY "public_read" ON "District"
  FOR SELECT TO public USING (true);

-- ----------------------------------------------------------------------------
-- Tenant table policies
-- ----------------------------------------------------------------------------

CREATE POLICY "superadmin_all" ON "Tenant"
  FOR ALL TO authenticated
  USING (public.daganta_is_super_admin())
  WITH CHECK (public.daganta_is_super_admin());

CREATE POLICY "tenant_isolation_select" ON "Tenant"
  FOR SELECT TO authenticated
  USING (public.daganta_is_tenant_member("id"::text));

CREATE POLICY "tenant_isolation_insert" ON "Tenant"
  FOR INSERT TO authenticated
  WITH CHECK (public.daganta_is_super_admin());

CREATE POLICY "tenant_isolation_update" ON "Tenant"
  FOR UPDATE TO authenticated
  USING (public.daganta_is_tenant_member("id"::text))
  WITH CHECK (public.daganta_is_tenant_member("id"::text));

CREATE POLICY "tenant_isolation_delete" ON "Tenant"
  FOR DELETE TO authenticated
  USING (public.daganta_is_super_admin());

-- ----------------------------------------------------------------------------
-- Tenant-scoped table policies
-- ----------------------------------------------------------------------------

CREATE POLICY "superadmin_all" ON "TenantMember" FOR ALL TO authenticated USING (public.daganta_is_super_admin()) WITH CHECK (public.daganta_is_super_admin());
CREATE POLICY "tenant_isolation_select" ON "TenantMember" FOR SELECT TO authenticated USING (public.daganta_is_tenant_member("tenantId"::text));
CREATE POLICY "tenant_isolation_insert" ON "TenantMember" FOR INSERT TO authenticated WITH CHECK (public.daganta_is_tenant_member("tenantId"::text));
CREATE POLICY "tenant_isolation_update" ON "TenantMember" FOR UPDATE TO authenticated USING (public.daganta_is_tenant_member("tenantId"::text)) WITH CHECK (public.daganta_is_tenant_member("tenantId"::text));
CREATE POLICY "tenant_isolation_delete" ON "TenantMember" FOR DELETE TO authenticated USING (public.daganta_is_tenant_member("tenantId"::text));

CREATE POLICY "superadmin_all" ON "ProductCategory" FOR ALL TO authenticated USING (public.daganta_is_super_admin()) WITH CHECK (public.daganta_is_super_admin());
CREATE POLICY "tenant_isolation_select" ON "ProductCategory" FOR SELECT TO authenticated USING (public.daganta_is_tenant_member("tenantId"::text));
CREATE POLICY "tenant_isolation_insert" ON "ProductCategory" FOR INSERT TO authenticated WITH CHECK (public.daganta_is_tenant_member("tenantId"::text));
CREATE POLICY "tenant_isolation_update" ON "ProductCategory" FOR UPDATE TO authenticated USING (public.daganta_is_tenant_member("tenantId"::text)) WITH CHECK (public.daganta_is_tenant_member("tenantId"::text));
CREATE POLICY "tenant_isolation_delete" ON "ProductCategory" FOR DELETE TO authenticated USING (public.daganta_is_tenant_member("tenantId"::text));

CREATE POLICY "superadmin_all" ON "Product" FOR ALL TO authenticated USING (public.daganta_is_super_admin()) WITH CHECK (public.daganta_is_super_admin());
CREATE POLICY "tenant_isolation_select" ON "Product" FOR SELECT TO authenticated USING (public.daganta_is_tenant_member("tenantId"::text));
CREATE POLICY "tenant_isolation_insert" ON "Product" FOR INSERT TO authenticated WITH CHECK (public.daganta_is_tenant_member("tenantId"::text));
CREATE POLICY "tenant_isolation_update" ON "Product" FOR UPDATE TO authenticated USING (public.daganta_is_tenant_member("tenantId"::text)) WITH CHECK (public.daganta_is_tenant_member("tenantId"::text));
CREATE POLICY "tenant_isolation_delete" ON "Product" FOR DELETE TO authenticated USING (public.daganta_is_tenant_member("tenantId"::text));

CREATE POLICY "superadmin_all" ON "ProductVariant" FOR ALL TO authenticated USING (public.daganta_is_super_admin()) WITH CHECK (public.daganta_is_super_admin());
CREATE POLICY "tenant_isolation_select" ON "ProductVariant" FOR SELECT TO authenticated USING (public.daganta_is_tenant_member("tenantId"::text));
CREATE POLICY "tenant_isolation_insert" ON "ProductVariant" FOR INSERT TO authenticated WITH CHECK (public.daganta_is_tenant_member("tenantId"::text));
CREATE POLICY "tenant_isolation_update" ON "ProductVariant" FOR UPDATE TO authenticated USING (public.daganta_is_tenant_member("tenantId"::text)) WITH CHECK (public.daganta_is_tenant_member("tenantId"::text));
CREATE POLICY "tenant_isolation_delete" ON "ProductVariant" FOR DELETE TO authenticated USING (public.daganta_is_tenant_member("tenantId"::text));

CREATE POLICY "superadmin_all" ON "Customer" FOR ALL TO authenticated USING (public.daganta_is_super_admin()) WITH CHECK (public.daganta_is_super_admin());
CREATE POLICY "tenant_isolation_select" ON "Customer" FOR SELECT TO authenticated USING (public.daganta_is_tenant_member("tenantId"::text));
CREATE POLICY "tenant_isolation_insert" ON "Customer" FOR INSERT TO authenticated WITH CHECK (public.daganta_is_tenant_member("tenantId"::text));
CREATE POLICY "tenant_isolation_update" ON "Customer" FOR UPDATE TO authenticated USING (public.daganta_is_tenant_member("tenantId"::text)) WITH CHECK (public.daganta_is_tenant_member("tenantId"::text));
CREATE POLICY "tenant_isolation_delete" ON "Customer" FOR DELETE TO authenticated USING (public.daganta_is_tenant_member("tenantId"::text));

CREATE POLICY "superadmin_all" ON "Order" FOR ALL TO authenticated USING (public.daganta_is_super_admin()) WITH CHECK (public.daganta_is_super_admin());
CREATE POLICY "tenant_isolation_select" ON "Order" FOR SELECT TO authenticated USING (public.daganta_is_tenant_member("tenantId"::text));
CREATE POLICY "tenant_isolation_insert" ON "Order" FOR INSERT TO authenticated WITH CHECK (public.daganta_is_tenant_member("tenantId"::text));
CREATE POLICY "tenant_isolation_update" ON "Order" FOR UPDATE TO authenticated USING (public.daganta_is_tenant_member("tenantId"::text)) WITH CHECK (public.daganta_is_tenant_member("tenantId"::text));
CREATE POLICY "tenant_isolation_delete" ON "Order" FOR DELETE TO authenticated USING (public.daganta_is_tenant_member("tenantId"::text));

CREATE POLICY "superadmin_all" ON "OrderPayment" FOR ALL TO authenticated USING (public.daganta_is_super_admin()) WITH CHECK (public.daganta_is_super_admin());
CREATE POLICY "tenant_isolation_select" ON "OrderPayment" FOR SELECT TO authenticated USING (public.daganta_is_tenant_member("tenantId"::text));
CREATE POLICY "tenant_isolation_insert" ON "OrderPayment" FOR INSERT TO authenticated WITH CHECK (public.daganta_is_tenant_member("tenantId"::text));
CREATE POLICY "tenant_isolation_update" ON "OrderPayment" FOR UPDATE TO authenticated USING (public.daganta_is_tenant_member("tenantId"::text)) WITH CHECK (public.daganta_is_tenant_member("tenantId"::text));
CREATE POLICY "tenant_isolation_delete" ON "OrderPayment" FOR DELETE TO authenticated USING (public.daganta_is_tenant_member("tenantId"::text));

CREATE POLICY "superadmin_all" ON "OrderItem" FOR ALL TO authenticated USING (public.daganta_is_super_admin()) WITH CHECK (public.daganta_is_super_admin());
CREATE POLICY "tenant_isolation_select" ON "OrderItem" FOR SELECT TO authenticated USING (public.daganta_is_tenant_member("tenantId"::text));
CREATE POLICY "tenant_isolation_insert" ON "OrderItem" FOR INSERT TO authenticated WITH CHECK (public.daganta_is_tenant_member("tenantId"::text));
CREATE POLICY "tenant_isolation_update" ON "OrderItem" FOR UPDATE TO authenticated USING (public.daganta_is_tenant_member("tenantId"::text)) WITH CHECK (public.daganta_is_tenant_member("tenantId"::text));
CREATE POLICY "tenant_isolation_delete" ON "OrderItem" FOR DELETE TO authenticated USING (public.daganta_is_tenant_member("tenantId"::text));

CREATE POLICY "superadmin_all" ON "Address" FOR ALL TO authenticated USING (public.daganta_is_super_admin()) WITH CHECK (public.daganta_is_super_admin());
CREATE POLICY "tenant_isolation_select" ON "Address" FOR SELECT TO authenticated USING (public.daganta_is_tenant_member("tenantId"::text));
CREATE POLICY "tenant_isolation_insert" ON "Address" FOR INSERT TO authenticated WITH CHECK (public.daganta_is_tenant_member("tenantId"::text));
CREATE POLICY "tenant_isolation_update" ON "Address" FOR UPDATE TO authenticated USING (public.daganta_is_tenant_member("tenantId"::text)) WITH CHECK (public.daganta_is_tenant_member("tenantId"::text));
CREATE POLICY "tenant_isolation_delete" ON "Address" FOR DELETE TO authenticated USING (public.daganta_is_tenant_member("tenantId"::text));

CREATE POLICY "superadmin_all" ON "AuditLog" FOR ALL TO authenticated USING (public.daganta_is_super_admin()) WITH CHECK (public.daganta_is_super_admin());
CREATE POLICY "tenant_isolation_select" ON "AuditLog" FOR SELECT TO authenticated USING (public.daganta_is_tenant_member("tenantId"::text));
CREATE POLICY "tenant_isolation_insert" ON "AuditLog" FOR INSERT TO authenticated WITH CHECK (public.daganta_is_tenant_member("tenantId"::text));
CREATE POLICY "tenant_isolation_update" ON "AuditLog" FOR UPDATE TO authenticated USING (public.daganta_is_tenant_member("tenantId"::text)) WITH CHECK (public.daganta_is_tenant_member("tenantId"::text));
CREATE POLICY "tenant_isolation_delete" ON "AuditLog" FOR DELETE TO authenticated USING (public.daganta_is_tenant_member("tenantId"::text));

CREATE POLICY "superadmin_all" ON "TenantSubscription" FOR ALL TO authenticated USING (public.daganta_is_super_admin()) WITH CHECK (public.daganta_is_super_admin());
CREATE POLICY "tenant_isolation_select" ON "TenantSubscription" FOR SELECT TO authenticated USING (public.daganta_is_tenant_member("tenantId"::text));
CREATE POLICY "tenant_isolation_insert" ON "TenantSubscription" FOR INSERT TO authenticated WITH CHECK (public.daganta_is_tenant_member("tenantId"::text));
CREATE POLICY "tenant_isolation_update" ON "TenantSubscription" FOR UPDATE TO authenticated USING (public.daganta_is_tenant_member("tenantId"::text)) WITH CHECK (public.daganta_is_tenant_member("tenantId"::text));
CREATE POLICY "tenant_isolation_delete" ON "TenantSubscription" FOR DELETE TO authenticated USING (public.daganta_is_tenant_member("tenantId"::text));

CREATE POLICY "superadmin_all" ON "Invoice" FOR ALL TO authenticated USING (public.daganta_is_super_admin()) WITH CHECK (public.daganta_is_super_admin());
CREATE POLICY "tenant_isolation_select" ON "Invoice" FOR SELECT TO authenticated USING (public.daganta_is_tenant_member("tenantId"::text));
CREATE POLICY "tenant_isolation_insert" ON "Invoice" FOR INSERT TO authenticated WITH CHECK (public.daganta_is_tenant_member("tenantId"::text));
CREATE POLICY "tenant_isolation_update" ON "Invoice" FOR UPDATE TO authenticated USING (public.daganta_is_tenant_member("tenantId"::text)) WITH CHECK (public.daganta_is_tenant_member("tenantId"::text));
CREATE POLICY "tenant_isolation_delete" ON "Invoice" FOR DELETE TO authenticated USING (public.daganta_is_tenant_member("tenantId"::text));

CREATE POLICY "superadmin_all" ON "NotificationEvent" FOR ALL TO authenticated USING (public.daganta_is_super_admin()) WITH CHECK (public.daganta_is_super_admin());
CREATE POLICY "tenant_isolation_select" ON "NotificationEvent" FOR SELECT TO authenticated USING (public.daganta_is_tenant_member("tenantId"::text));
CREATE POLICY "tenant_isolation_insert" ON "NotificationEvent" FOR INSERT TO authenticated WITH CHECK (public.daganta_is_tenant_member("tenantId"::text));
CREATE POLICY "tenant_isolation_update" ON "NotificationEvent" FOR UPDATE TO authenticated USING (public.daganta_is_tenant_member("tenantId"::text)) WITH CHECK (public.daganta_is_tenant_member("tenantId"::text));
CREATE POLICY "tenant_isolation_delete" ON "NotificationEvent" FOR DELETE TO authenticated USING (public.daganta_is_tenant_member("tenantId"::text));

CREATE POLICY "superadmin_all" ON "AgentClient" FOR ALL TO authenticated USING (public.daganta_is_super_admin()) WITH CHECK (public.daganta_is_super_admin());
CREATE POLICY "tenant_isolation_select" ON "AgentClient" FOR SELECT TO authenticated USING (public.daganta_is_tenant_member("tenantId"::text));
CREATE POLICY "tenant_isolation_insert" ON "AgentClient" FOR INSERT TO authenticated WITH CHECK (public.daganta_is_tenant_member("tenantId"::text));
CREATE POLICY "tenant_isolation_update" ON "AgentClient" FOR UPDATE TO authenticated USING (public.daganta_is_tenant_member("tenantId"::text)) WITH CHECK (public.daganta_is_tenant_member("tenantId"::text));
CREATE POLICY "tenant_isolation_delete" ON "AgentClient" FOR DELETE TO authenticated USING (public.daganta_is_tenant_member("tenantId"::text));

COMMIT;

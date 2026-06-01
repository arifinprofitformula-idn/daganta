-- ============================================================================
-- DRAFT SQL MIGRATION: row level security (RLS) POLICIES
-- Phase: v0.1F (Storefront RLS Planning & Migration Draft)
-- Status: DRAFT PREPARED FOR REVIEW - DO NOT APPLY DIRECTLY TO DATABASE
--         Not yet applied to database. Do not apply directly.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. CLEANUP / ROLLBACK DRAFT SECTION (For reference & clean application)
-- ----------------------------------------------------------------------------
/*
-- To rollback this draft migration, uncomment and run the following commands:

DROP POLICY IF EXISTS "allow_public_read_provinces" ON "Province";
DROP POLICY IF EXISTS "allow_public_read_regencies" ON "Regency";
DROP POLICY IF EXISTS "allow_public_read_districts" ON "District";

DROP POLICY IF EXISTS "allow_public_read_active_tenants" ON "Tenant";
DROP POLICY IF EXISTS "allow_member_select_tenant" ON "Tenant";
DROP POLICY IF EXISTS "allow_member_insert_tenant" ON "Tenant";
DROP POLICY IF EXISTS "allow_member_update_tenant" ON "Tenant";
DROP POLICY IF EXISTS "allow_member_delete_tenant" ON "Tenant";
DROP POLICY IF EXISTS "allow_admin_all_access_tenant" ON "Tenant";

DROP POLICY IF EXISTS "allow_public_read_active_categories" ON "ProductCategory";
DROP POLICY IF EXISTS "allow_member_select_categories" ON "ProductCategory";
DROP POLICY IF EXISTS "allow_member_insert_categories" ON "ProductCategory";
DROP POLICY IF EXISTS "allow_member_update_categories" ON "ProductCategory";
DROP POLICY IF EXISTS "allow_member_delete_categories" ON "ProductCategory";
DROP POLICY IF EXISTS "allow_admin_all_access_categories" ON "ProductCategory";

DROP POLICY IF EXISTS "allow_public_read_active_products" ON "Product";
DROP POLICY IF EXISTS "allow_member_select_products" ON "Product";
DROP POLICY IF EXISTS "allow_member_insert_products" ON "Product";
DROP POLICY IF EXISTS "allow_member_update_products" ON "Product";
DROP POLICY IF EXISTS "allow_member_delete_products" ON "Product";
DROP POLICY IF EXISTS "allow_admin_all_access_products" ON "Product";

DROP POLICY IF EXISTS "allow_public_read_active_variants" ON "ProductVariant";
DROP POLICY IF EXISTS "allow_member_select_variants" ON "ProductVariant";
DROP POLICY IF EXISTS "allow_member_insert_variants" ON "ProductVariant";
DROP POLICY IF EXISTS "allow_member_update_variants" ON "ProductVariant";
DROP POLICY IF EXISTS "allow_member_delete_variants" ON "ProductVariant";
DROP POLICY IF EXISTS "allow_admin_all_access_variants" ON "ProductVariant";

DROP POLICY IF EXISTS "allow_member_select_members" ON "TenantMember";
DROP POLICY IF EXISTS "allow_member_insert_members" ON "TenantMember";
DROP POLICY IF EXISTS "allow_member_update_members" ON "TenantMember";
DROP POLICY IF EXISTS "allow_member_delete_members" ON "TenantMember";
DROP POLICY IF EXISTS "allow_admin_all_access_members" ON "TenantMember";

DROP POLICY IF EXISTS "allow_member_select_customers" ON "Customer";
DROP POLICY IF EXISTS "allow_member_insert_customers" ON "Customer";
DROP POLICY IF EXISTS "allow_member_update_customers" ON "Customer";
DROP POLICY IF EXISTS "allow_member_delete_customers" ON "Customer";
DROP POLICY IF EXISTS "allow_admin_all_access_customers" ON "Customer";

DROP POLICY IF EXISTS "allow_member_select_orders" ON "Order";
DROP POLICY IF EXISTS "allow_member_insert_orders" ON "Order";
DROP POLICY IF EXISTS "allow_member_update_orders" ON "Order";
DROP POLICY IF EXISTS "allow_member_delete_orders" ON "Order";
DROP POLICY IF EXISTS "allow_admin_all_access_orders" ON "Order";

DROP POLICY IF EXISTS "allow_member_select_order_items" ON "OrderItem";
DROP POLICY IF EXISTS "allow_member_insert_order_items" ON "OrderItem";
DROP POLICY IF EXISTS "allow_member_update_order_items" ON "OrderItem";
DROP POLICY IF EXISTS "allow_member_delete_order_items" ON "OrderItem";
DROP POLICY IF EXISTS "allow_admin_all_access_order_items" ON "OrderItem";

DROP POLICY IF EXISTS "allow_member_select_addresses" ON "Address";
DROP POLICY IF EXISTS "allow_member_insert_addresses" ON "Address";
DROP POLICY IF EXISTS "allow_member_update_addresses" ON "Address";
DROP POLICY IF EXISTS "allow_member_delete_addresses" ON "Address";
DROP POLICY IF EXISTS "allow_admin_all_access_addresses" ON "Address";

DROP POLICY IF EXISTS "allow_member_select_audit_logs" ON "AuditLog";
DROP POLICY IF EXISTS "allow_admin_all_access_audit_logs" ON "AuditLog";

ALTER TABLE "Tenant" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "TenantMember" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductCategory" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Product" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductVariant" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Customer" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Address" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Province" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Regency" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "District" DISABLE ROW LEVEL SECURITY;

DROP FUNCTION IF EXISTS is_super_admin();
DROP FUNCTION IF EXISTS is_tenant_member(TEXT);
DROP FUNCTION IF EXISTS is_tenant_accessible_public(TEXT);
*/

-- ----------------------------------------------------------------------------
-- 2. HELPER FUNCTIONS SECTION (SECURITY DEFINER to prevent recursion)
-- ----------------------------------------------------------------------------

-- A. Helper: is_tenant_accessible_public
-- Memeriksa apakah status tenant layak diakses oleh etalase publik (Storefront).
-- Menggunakan parameter bertipe TEXT dan return boolean saja.
CREATE OR REPLACE FUNCTION is_tenant_accessible_public(target_tenant_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status TEXT;
BEGIN
  SELECT "status"::TEXT INTO v_status
  FROM "Tenant"
  WHERE "id"::TEXT = target_tenant_id;
  
  RETURN v_status IN ('ACTIVE', 'EXPIRING_SOON', 'GRACE_PERIOD', 'LIMITED');
END;
$$;

-- B. Helper: is_tenant_member
-- Memverifikasi apakah auth.uid() saat ini terdaftar sebagai anggota aktif tenant terkait.
-- Identitas dicek secara utama via u."authUserId" = auth.uid()::text.
CREATE OR REPLACE FUNCTION is_tenant_member(target_tenant_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_exists BOOLEAN;
  v_auth_uid TEXT;
BEGIN
  -- Dapatkan auth.uid() dari context Supabase Auth secara native
  v_auth_uid := auth.uid()::text;
  
  IF v_auth_uid IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Validasi keanggotaan berdasarkan UserProfile yang terhubung dengan authUserId
  SELECT EXISTS (
    SELECT 1 
    FROM "TenantMember" m
    JOIN "UserProfile" u ON m."userId" = u."id"
    WHERE m."tenantId"::TEXT = target_tenant_id AND u."authUserId" = v_auth_uid
  ) INTO v_exists;

  -- DEVELOPMENT NOTE / FALLBACK ONLY:
  -- Jika pencarian berbasis authUserId tidak ditemukan, email fallback dapat dipertimbangkan 
  -- untuk kemudahan seeding data lokal/dev. Namun, di bawah ini kueri tetap ketat berbasis auth.uid().
  
  RETURN COALESCE(v_exists, FALSE);
END;
$$;

-- C. Helper: is_super_admin (FUTURE DRAFT ONLY)
-- Memvalidasi apakah user terotentikasi memiliki peran sistem global SUPER_ADMIN.
-- CATATAN PENTING: Karena skema v0.1A belum memiliki global platform role, fungsi ini
-- bersifat FUTURE DRAFT ONLY dan mengembalikan FALSE secara default untuk menghindari bypass tak sah.
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- FUTURE IMPLEMENTATION REQUIRES: UserProfile.globalRole ATAU PlatformAdmin table.
  -- Draf ini disiapkan sebagai placeholder peninjauan dan belum boleh digunakan untuk bypass nyata.
  RETURN FALSE;
END;
$$;


-- ----------------------------------------------------------------------------
-- 3. ENABLE RLS ON BUSINESS AND LOGISTICS TABLES
-- ----------------------------------------------------------------------------
ALTER TABLE "Tenant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TenantMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductCategory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductVariant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Customer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Address" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;

-- Tabel logistik diaktifkan RLS demi standar, namun menggunakan policy terbuka
ALTER TABLE "Province" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Regency" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "District" ENABLE ROW LEVEL SECURITY;


-- ----------------------------------------------------------------------------
-- 4. POLICIES: PUBLIC LOGISTICS DATA (Province, Regency, District)
-- ----------------------------------------------------------------------------
CREATE POLICY "allow_public_read_provinces" ON "Province"
  FOR SELECT TO public USING (true);

CREATE POLICY "allow_public_read_regencies" ON "Regency"
  FOR SELECT TO public USING (true);

CREATE POLICY "allow_public_read_districts" ON "District"
  FOR SELECT TO public USING (true);


-- ----------------------------------------------------------------------------
-- 5. POLICIES: LIMITED PUBLIC STOREFRONT ACCESS
-- ----------------------------------------------------------------------------

-- A. Tenant Storefront Read (Mengekspos seluruh baris tapi dibatasi oleh status)
CREATE POLICY "allow_public_read_active_tenants" ON "Tenant"
  FOR SELECT TO public
  USING ("status" IN ('ACTIVE', 'EXPIRING_SOON', 'GRACE_PERIOD', 'LIMITED'));

-- B. ProductCategory Storefront Read
CREATE POLICY "allow_public_read_active_categories" ON "ProductCategory"
  FOR SELECT TO public
  USING ("isActive" = true AND is_tenant_accessible_public("tenantId"::TEXT));

-- C. Product Storefront Read
CREATE POLICY "allow_public_read_active_products" ON "Product"
  FOR SELECT TO public
  USING ("status" = 'ACTIVE' AND is_tenant_accessible_public("tenantId"::TEXT));

-- D. ProductVariant Storefront Read
CREATE POLICY "allow_public_read_active_variants" ON "ProductVariant"
  FOR SELECT TO public
  USING (
    "isActive" = true 
    AND is_tenant_accessible_public("tenantId"::TEXT)
    AND EXISTS (
      SELECT 1 FROM "Product" p 
      WHERE p."id" = "productId" AND p."status" = 'ACTIVE'
    )
  );


-- ----------------------------------------------------------------------------
-- 6. POLICIES: PRIVATE SECURED DATA ACCESS BY EXPLICIT OPERATIONS (DRAFT)
-- ----------------------------------------------------------------------------

-- A. Tenant Table
CREATE POLICY "allow_member_select_tenant" ON "Tenant"
  FOR SELECT TO authenticated USING (is_tenant_member("id"::TEXT));

CREATE POLICY "allow_member_insert_tenant" ON "Tenant"
  FOR INSERT TO authenticated WITH CHECK (is_tenant_member("id"::TEXT));

CREATE POLICY "allow_member_update_tenant" ON "Tenant"
  FOR UPDATE TO authenticated USING (is_tenant_member("id"::TEXT)) WITH CHECK (is_tenant_member("id"::TEXT));

CREATE POLICY "allow_member_delete_tenant" ON "Tenant"
  FOR DELETE TO authenticated USING (is_super_admin()); -- Hanya super admin di masa depan

-- B. ProductCategory Table
CREATE POLICY "allow_member_select_categories" ON "ProductCategory"
  FOR SELECT TO authenticated USING (is_tenant_member("tenantId"::TEXT));

CREATE POLICY "allow_member_insert_categories" ON "ProductCategory"
  FOR INSERT TO authenticated WITH CHECK (is_tenant_member("tenantId"::TEXT));

CREATE POLICY "allow_member_update_categories" ON "ProductCategory"
  FOR UPDATE TO authenticated USING (is_tenant_member("tenantId"::TEXT)) WITH CHECK (is_tenant_member("tenantId"::TEXT));

CREATE POLICY "allow_member_delete_categories" ON "ProductCategory"
  FOR DELETE TO authenticated USING (is_tenant_member("tenantId"::TEXT));

-- C. Product Table
CREATE POLICY "allow_member_select_products" ON "Product"
  FOR SELECT TO authenticated USING (is_tenant_member("tenantId"::TEXT));

CREATE POLICY "allow_member_insert_products" ON "Product"
  FOR INSERT TO authenticated WITH CHECK (is_tenant_member("tenantId"::TEXT));

CREATE POLICY "allow_member_update_products" ON "Product"
  FOR UPDATE TO authenticated USING (is_tenant_member("tenantId"::TEXT)) WITH CHECK (is_tenant_member("tenantId"::TEXT));

CREATE POLICY "allow_member_delete_products" ON "Product"
  FOR DELETE TO authenticated USING (is_tenant_member("tenantId"::TEXT));

-- D. ProductVariant Table
CREATE POLICY "allow_member_select_variants" ON "ProductVariant"
  FOR SELECT TO authenticated USING (is_tenant_member("tenantId"::TEXT));

CREATE POLICY "allow_member_insert_variants" ON "ProductVariant"
  FOR INSERT TO authenticated WITH CHECK (is_tenant_member("tenantId"::TEXT));

CREATE POLICY "allow_member_update_variants" ON "ProductVariant"
  FOR UPDATE TO authenticated USING (is_tenant_member("tenantId"::TEXT)) WITH CHECK (is_tenant_member("tenantId"::TEXT));

CREATE POLICY "allow_member_delete_variants" ON "ProductVariant"
  FOR DELETE TO authenticated USING (is_tenant_member("tenantId"::TEXT));

-- E. TenantMember Table
CREATE POLICY "allow_member_select_members" ON "TenantMember"
  FOR SELECT TO authenticated USING (is_tenant_member("tenantId"::TEXT));

CREATE POLICY "allow_member_insert_members" ON "TenantMember"
  FOR INSERT TO authenticated WITH CHECK (is_super_admin()); -- Hanya admin global

CREATE POLICY "allow_member_update_members" ON "TenantMember"
  FOR UPDATE TO authenticated USING (is_tenant_member("tenantId"::TEXT)) WITH CHECK (is_tenant_member("tenantId"::TEXT));

CREATE POLICY "allow_member_delete_members" ON "TenantMember"
  FOR DELETE TO authenticated USING (is_tenant_member("tenantId"::TEXT));

-- F. Customer Table
CREATE POLICY "allow_member_select_customers" ON "Customer"
  FOR SELECT TO authenticated USING (is_tenant_member("tenantId"::TEXT));

CREATE POLICY "allow_member_insert_customers" ON "Customer"
  FOR INSERT TO authenticated WITH CHECK (is_tenant_member("tenantId"::TEXT));

CREATE POLICY "allow_member_update_customers" ON "Customer"
  FOR UPDATE TO authenticated USING (is_tenant_member("tenantId"::TEXT)) WITH CHECK (is_tenant_member("tenantId"::TEXT));

CREATE POLICY "allow_member_delete_customers" ON "Customer"
  FOR DELETE TO authenticated USING (is_tenant_member("tenantId"::TEXT));

-- G. Order Table
CREATE POLICY "allow_member_select_orders" ON "Order"
  FOR SELECT TO authenticated USING (is_tenant_member("tenantId"::TEXT));

CREATE POLICY "allow_member_insert_orders" ON "Order"
  FOR INSERT TO authenticated WITH CHECK (is_tenant_member("tenantId"::TEXT));

CREATE POLICY "allow_member_update_orders" ON "Order"
  FOR UPDATE TO authenticated USING (is_tenant_member("tenantId"::TEXT)) WITH CHECK (is_tenant_member("tenantId"::TEXT));

CREATE POLICY "allow_member_delete_orders" ON "Order"
  FOR DELETE TO authenticated USING (is_super_admin());

-- H. OrderItem Table
CREATE POLICY "allow_member_select_order_items" ON "OrderItem"
  FOR SELECT TO authenticated USING (is_tenant_member("tenantId"::TEXT));

CREATE POLICY "allow_member_insert_order_items" ON "OrderItem"
  FOR INSERT TO authenticated WITH CHECK (is_tenant_member("tenantId"::TEXT));

CREATE POLICY "allow_member_update_order_items" ON "OrderItem"
  FOR UPDATE TO authenticated USING (is_tenant_member("tenantId"::TEXT)) WITH CHECK (is_tenant_member("tenantId"::TEXT));

CREATE POLICY "allow_member_delete_order_items" ON "OrderItem"
  FOR DELETE TO authenticated USING (is_super_admin());

-- I. Address Table
CREATE POLICY "allow_member_select_addresses" ON "Address"
  FOR SELECT TO authenticated USING (is_tenant_member("tenantId"::TEXT));

CREATE POLICY "allow_member_insert_addresses" ON "Address"
  FOR INSERT TO authenticated WITH CHECK (is_tenant_member("tenantId"::TEXT));

CREATE POLICY "allow_member_update_addresses" ON "Address"
  FOR UPDATE TO authenticated USING (is_tenant_member("tenantId"::TEXT)) WITH CHECK (is_tenant_member("tenantId"::TEXT));

CREATE POLICY "allow_member_delete_addresses" ON "Address"
  FOR DELETE TO authenticated USING (is_tenant_member("tenantId"::TEXT));

-- J. AuditLog Table (Tabel Khusus: Tenant Member maksimal hanya boleh membaca/SELECT)
CREATE POLICY "allow_member_select_audit_logs" ON "AuditLog"
  FOR SELECT TO authenticated USING (is_tenant_member("tenantId"::TEXT));

-- Catatan Keamanan: Aksi INSERT/UPDATE/DELETE diblokir mutlak dari client-side.
-- Penulisan audit logs diizinkan bypass hanya untuk proses background / server-side service role.

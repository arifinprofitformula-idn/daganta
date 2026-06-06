# QA Test Plan - Daganta

Dokumen ini menjadi rencana QA v0.5A sebelum beta user testing.

## Test Accounts

Gunakan placeholder akun berikut. Jangan menulis password, token, atau credential asli ke repository.

1. Tenant owner test account: `[tenant-owner-test-email]`
2. Agent test account: `[agent-test-email]`
3. Platform admin test account: `[platform-admin-test-email]`
4. Buyer/contact test data: `[buyer-phone-or-email]`

## Tenant Owner Login And Merchant Dashboard

Tujuan: memastikan pemilik toko hanya melihat toko yang sah.

Steps:

1. Login sebagai tenant owner.
2. Buka `/dashboard`.
3. Verifikasi nama toko aktif benar.
4. Buka `/dashboard/products`, `/dashboard/orders`, dan `/dashboard/billing`.
5. Coba manipulasi active tenant cookie ke tenant lain.

Expected:

1. Dashboard tampil untuk tenant yang sah.
2. Tenant lain tidak dapat diakses.
3. Cookie tidak valid diabaikan/dibersihkan.

## Public Signup Trial

Steps:

1. Buka `/signup?plan=starter`, `/signup?plan=growth`, dan `/signup?plan=pro`.
2. Coba plan invalid.
3. Coba reserved slug.
4. Coba duplicate slug.
5. Coba duplicate email.
6. Lakukan signup valid di environment QA.

Expected:

1. Invalid plan fallback ke Starter.
2. Reserved/duplicate slug ditolak.
3. Duplicate email ditolak.
4. Signup valid membuat `UserProfile`, `Tenant`, `TenantMember`, `TenantSubscription TRIAL`, dan `AuditLog SIGNUP_TENANT_CREATED`.
5. Trial 14 hari dan grace 7 hari.

## Product Creation

Steps:

1. Login sebagai tenant owner.
2. Buka `/dashboard/products/new`.
3. Buat produk aktif dengan varian default.
4. Edit produk.
5. Arsipkan produk.

Expected:

1. Produk tersimpan dengan `tenantId` toko aktif.
2. Product limit paket dihormati.
3. Limited mode memblokir create product.
4. Audit log dibuat.

## Storefront Product Detail

Steps:

1. Buka storefront tenant.
2. Buka `/p/[slug]`.
3. Coba slug tidak valid.

Expected:

1. Produk tenant tampil.
2. Produk tenant lain tidak tampil.
3. Produk tidak ditemukan menampilkan state aman.

## Cart And Checkout

Steps:

1. Tambah produk ke cart.
2. Buka `/cart`.
3. Buka `/checkout`.
4. Submit checkout valid.

Expected:

1. Checkout membuat `Order`, `OrderItem`, `OrderPayment`, `NotificationEvent ORDER_CREATED`, dan audit log.
2. Harga dihitung ulang server-side.
3. Limited mode memblokir checkout.

## Manual Payment Validation

Steps:

1. Login sebagai tenant owner.
2. Buka `/dashboard/orders`.
3. Ubah payment status dari waiting payment ke waiting verification.
4. Verifikasi pembayaran.
5. Reject pembayaran pada skenario lain.

Expected:

1. Transisi status valid dipatuhi.
2. Payment verified mengubah order menjadi `PROCESSING` jika sebelumnya `PENDING_PAYMENT`.
3. NotificationEvent internal dibuat.
4. Query tetap tenant-scoped.

## Order Tracking

Steps:

1. Buka `/track?order=[orderNumber]`.
2. Masukkan kontak yang benar.
3. Masukkan kontak salah.
4. Coba order number tenant lain dari host berbeda.

Expected:

1. Kontak benar menampilkan status aman.
2. Kontak salah ditolak dengan pesan generic.
3. Cross-tenant tracking ditolak.
4. Data alamat/detail pribadi tidak terekspos.

## Billing Lifecycle States

Steps:

1. Verifikasi tenant TRIAL.
2. Simulasikan state `LIMITED_MODE` di environment QA.
3. Simulasikan `SUSPENDED`/`CANCELED` di environment QA.
4. Buka storefront, checkout, product creation, dan billing page.

Expected:

1. TRIAL/ACTIVE mengizinkan checkout dan product creation.
2. LIMITED_MODE memblokir checkout dan product creation.
3. SUSPENDED/CANCELED memblokir storefront.
4. Billing page tetap dapat diakses oleh tenant owner.

## Agent Dashboard

Steps:

1. Login sebagai agent.
2. Buka `/dashboard/agent`.
3. Pastikan non-agent tidak bisa melihat data agent.

Expected:

1. Agent hanya melihat profil, clients, dan ledger miliknya.
2. Pending/suspended/archived agent mendapat restricted state.

## Agent Draft Client Creation

Steps:

1. Login sebagai ACTIVE agent.
2. Buka `/dashboard/agent/clients/new`.
3. Coba reserved slug.
4. Coba duplicate slug.
5. Buat draft valid.

Expected:

1. Draft valid membuat `Tenant LIMITED`, `TenantSubscription LIMITED_MODE`, `AgentClient DRAFT`, dan audit log.
2. Tidak ada credit deduction, invoice, payment, email, atau WhatsApp.

## Agent Credit Activation

Steps:

1. Login sebagai ACTIVE agent dengan saldo cukup.
2. Aktifkan draft client.
3. Coba aktifkan dengan saldo kurang di skenario QA terpisah.

Expected:

1. Aktivasi sukses memotong `creditBalance`, membuat AgentCreditLedger DEBIT, dan mengaktifkan tenant/subscription/client.
2. Failed activation tidak membuat ledger.
3. Balance before/after benar.

## Platform Admin Ownership Transfer

Steps:

1. Login sebagai platform admin.
2. Buka `/dashboard/admin/agent-clients`.
3. Transfer AGENT_MANAGED ACTIVE client ke client.
4. Transfer AGENT_MANAGED DRAFT client ke client.
5. Transfer AGENT_MANAGED ACTIVE client ke Daganta.
6. Coba transfer already transferred/archived/suspended client.
7. Login sebagai non-admin dan coba akses route admin.

Expected:

1. Hanya `platformRole SUPER_ADMIN` yang bisa mengakses dan menjalankan transfer.
2. `Tenant.ownerId`, `TenantMember`, `AgentClient.status`, `ownershipStatus`, `transferredAt`, dan `transferredByUserId` benar.
3. AuditLog `AGENT_CLIENT_OWNERSHIP_TRANSFERRED` dibuat.
4. Tidak ada billing/credit mutation.

## Webhook Idempotency

Steps:

1. POST payload valid ke `/api/webhooks/payments/manual`.
2. POST payload sama untuk duplicate test.
3. POST provider unsupported.
4. POST known unconfigured provider tanpa signature valid.

Expected:

1. WebhookEvent tercatat.
2. Duplicate return safe duplicate.
3. Unsupported provider ditolak.
4. Known unconfigured provider ignored/unauthorized sesuai signature skeleton.
5. Tidak ada mutasi `OrderPayment` atau `Order`.

## Notification Outbox Behavior

Steps:

1. Trigger checkout/order/payment state yang membuat NotificationEvent.
2. Verifikasi event tersimpan sebagai outbox.
3. Jangan jalankan worker di beta readiness tanpa approval.

Expected:

1. NotificationEvent dibuat.
2. WhatsApp/email tidak terkirim sungguhan.
3. Worker tidak wired ke cron/runtime.

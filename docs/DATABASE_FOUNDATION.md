# DATABASE_FOUNDATION.md

> [!IMPORTANT]
> **Status: DASHBOARD SHELL COMPLETE (Phase v0.1G)**
> - Kerangka skema database dasar v0.1A telah berhasil dimigrasikan ke Supabase Dev pada tanggal 2026-06-01.
> - Berkas skema tersimpan di [schema.prisma](file:///c:/laragon/www/daganta/prisma/schema.prisma).
> - Folder migrasi fisik: [20260601035742_init_v01a_foundation](file:///c:/laragon/www/daganta/prisma/migrations/20260601035742_init_v01a_foundation/).
> - Prisma Client berhasil digenerate.
> - Belum ada RLS policy yang diterapkan secara fisik pada database pada fase ini (tetap berstatus draf aman).
> - Data awal (seed data) untuk tenant demo Toya Nusantara dan wilayah logistik minimal telah berhasil dimasukkan secara lokal/Dev pada tanggal 2026-06-01 menggunakan [seed.ts](file:///c:/laragon/www/daganta/prisma/seed.ts).
> - **Tenant Resolver & Data Access Layer (v0.1D)**: Telah selesai diimplementasikan secara aman pada tanggal 2026-06-01. Host resolver terbukti berhasil menyaring port, menangani situs pemasaran utama (`daganta.store`, `localhost`, `127.0.0.1`), memetakan status tenant ke mode akses storefront (`STOREFRONT_FULL`, `STOREFRONT_READONLY`, `BLOCKED`), dan membatasi penarikan produk secara ketat berbasis `tenantId`.
> - **Storefront Shell (v0.1E)**: Telah selesai diimplementasikan dan diverifikasi secara sukses pada tanggal 2026-06-01. Host resolver terbukti berhasil menyaring port, menangani situs pemasaran utama (`daganta.store`), memetakan status tenant ke mode akses storefront, membatasi penarikan produk secara ketat berbasis `tenantId`, dan menampilkan halaman etalase Toya Nusantara dengan 3 produk, halaman Demo Store dengan empty state, serta halaman Toko Tidak Ditemukan dengan aman dan rapi.
> - **RLS Policy Planning & Migration Draft (v0.1F)**: Draf rencana RLS dan berkas DDL SQL untuk Supabase/PostgreSQL telah selesai disusun di [docs/RLS_POLICY_PLAN.md](file:///c:/laragon/www/daganta/docs/RLS_POLICY_PLAN.md) and [docs/sql/rls_v01f_draft.sql](file:///c:/laragon/www/daganta/docs/sql/rls_v01f_draft.sql). Seluruh kebijakan diklasifikasikan dengan jelas (Public, Storefront Limited, Private) menggunakan helper function `SECURITY DEFINER` bebas rekursi, serta mendokumentasikan mitigasi bypass Prisma server-side. Kebijakan ini berstatus sebagai draf rancangan yang siap direview dan belum diterapkan ke database fisik.
> - **Dashboard Shell (v0.1G)**: Halaman dasbor visual untuk pemilik toko (*tenant owner*) telah berhasil diimplementasikan penuh menggunakan Bahasa Indonesia terintegrasi data demo tenant **Toya Nusantara** secara dinamis dari database. Seluruh halaman (/dashboard, /dashboard/products dengan 3 produk terdaftar, /dashboard/orders, /dashboard/customers, /dashboard/billing, /dashboard/settings) terbukti sukses dikompilasi (`npm run build`) dan berhasil lolos uji verifikasi rute HTTP server lokal.




## 1. Purpose

Dokumen ini menjelaskan fondasi database Daganta v0.1 sebagai platform webstore SaaS multi-tenant untuk UMKM dan agen digital.

Database harus dirancang untuk:
- mendukung banyak tenant/toko;
- menjaga isolasi data antar tenant;
- mendukung billing internal Daganta;
- mendukung sistem kredit agen;
- mendukung katalog produk;
- mendukung order lifecycle;
- mendukung event notifikasi;
- mendukung ekspansi ke payment, shipping, dan custom domain.

---

## 2. Database Principles

1. Semua data bisnis wajib memiliki `tenantId`.
2. Semua query data bisnis wajib tenant-scoped.
3. Data antar tenant tidak boleh bocor.
4. Prisma digunakan untuk schema dan relasi.
5. RLS Supabase/PostgreSQL dibuat melalui SQL migration, bukan langsung di `schema.prisma`.
6. Enum digunakan untuk status penting.
7. Audit log digunakan untuk perubahan penting.
8. Soft delete lebih disarankan daripada hard delete untuk data bisnis utama.
9. Vendor credential tidak boleh disimpan plain text.
10. Database harus bisa tumbuh tanpa rewrite total.

---

## 3. Multi-Tenant Model

Daganta menggunakan model single database multi-tenant.

Setiap tenant adalah satu toko/brand UMKM.

Contoh tenant:
- Toya Nusantara
- Demo Store
- UMKM Fashion
- UMKM Makanan

Relasi utama:
- Tenant memiliki banyak produk.
- Tenant memiliki banyak customer.
- Tenant memiliki banyak order.
- Tenant memiliki subscription.
- Tenant dapat dikelola oleh owner/staff.
- Tenant dapat berada di bawah agen.

---

## 4. Core Entities v0.1

Model inti yang perlu ada pada `schema.prisma` v0.1:

### Identity & Access
- UserProfile
- Tenant
- TenantMember
- Agent
- AgentClient

### Billing
- Plan
- Subscription
- AgentCreditBalance
- AgentCreditLedger

### Domain
- Domain

### Catalog
- ProductCategory
- Product
- ProductVariant

### Customer & Order
- Customer
- Order
- OrderItem
- Payment
- Shipment

### Notification
- NotificationEvent

### Logistics Region
- Province
- Regency
- District

### System
- AuditLog

---

## 5. Required Enums

Minimal enum yang harus tersedia:

```prisma
enum UserRole {
  SUPER_ADMIN
  AGENT
  TENANT_OWNER
  TENANT_STAFF
  CUSTOMER
}

enum TenantStatus {
  ACTIVE
  EXPIRING_SOON
  GRACE_PERIOD
  LIMITED
  SUSPENDED
  ARCHIVED
}

enum SubscriptionStatus {
  TRIAL
  ACTIVE
  PAST_DUE
  GRACE_PERIOD
  CANCELED
  EXPIRED
}

enum OrderStatus {
  DRAFT
  PENDING_PAYMENT
  PAID
  PROCESSING
  SHIPPED
  COMPLETED
  CANCELED
  EXPIRED
  REFUNDED
}

enum PaymentStatus {
  UNPAID
  PENDING
  PAID
  FAILED
  EXPIRED
  REFUNDED
}

enum ShipmentStatus {
  NOT_REQUIRED
  PENDING
  READY_TO_SHIP
  SHIPPED
  DELIVERED
  RETURNED
  CANCELED
}

enum NotificationStatus {
  PENDING
  QUEUED
  SENT
  FAILED
  RETRYING
  CANCELED
}

enum DomainStatus {
  NOT_CONNECTED
  PENDING_VERIFICATION
  VERIFIED
  SSL_PROVISIONING
  ACTIVE
  ERROR
}
```

---

## 6. Tenant Table Requirements

`Tenant` minimal memiliki field:
- id
- name
- slug
- subdomain
- status
- ownerId
- agentId nullable
- planId nullable
- trialEndsAt nullable
- subscriptionEndsAt nullable
- gracePeriodEndsAt nullable
- limitedAt nullable
- suspendedAt nullable
- archivedAt nullable
- createdAt
- updatedAt

Aturan:
- `slug` harus unik.
- `subdomain` harus unik.
- status default: `ACTIVE` atau `TRIAL` tergantung implementasi subscription.
- Tenant tidak langsung dihapus jika subscription habis.
- Gunakan status lifecycle: ACTIVE → GRACE_PERIOD → LIMITED → SUSPENDED → ARCHIVED.

---

## 7. Billing Foundation

Daganta harus punya billing internal sejak awal.

### Plan
Menyimpan paket layanan:
- Basic
- Pro
- Business

Field minimal:
- id
- name
- code
- priceMonthly
- priceYearly
- maxProducts
- maxStaff
- maxDomains
- allowCustomDomain
- allowAgentManaged
- isActive
- createdAt
- updatedAt

### Subscription
Menyimpan masa aktif tenant.

Field minimal:
- id
- tenantId
- planId
- status
- startsAt
- endsAt
- gracePeriodEndsAt
- canceledAt
- createdAt
- updatedAt

### AgentCreditBalance
Menyimpan saldo kredit agen.

Field minimal:
- id
- agentId
- balance
- currency
- updatedAt

### AgentCreditLedger
Menyimpan riwayat kredit agen.

Field minimal:
- id
- agentId
- tenantId nullable
- type
- amount
- balanceAfter
- description
- referenceId nullable
- createdAt

Aturan:
- Jangan hanya simpan saldo akhir.
- Semua perubahan saldo wajib masuk ledger.
- Saldo tidak boleh negatif kecuali ada kebijakan khusus.

---

## 8. Agent Model

### Agent
Mewakili agen digital yang menjual/mengelola webstore klien.

Field minimal:
- id
- userId
- displayName
- status
- referralCode
- createdAt
- updatedAt

### AgentClient
Menghubungkan agen dengan tenant.

Field minimal:
- id
- agentId
- tenantId
- status
- startedAt
- endedAt nullable
- createdAt
- updatedAt

Aturan:
- Tenant boleh berada di bawah agen.
- Jika agen churn, tenant tidak boleh otomatis mati.
- Tenant dapat dipindahkan menjadi direct billing ke Daganta.

---

## 9. Catalog Foundation

### ProductCategory
Field minimal:
- id
- tenantId
- name
- slug
- description nullable
- sortOrder
- isActive
- createdAt
- updatedAt

### Product
Field minimal:
- id
- tenantId
- categoryId nullable
- name
- slug
- description
- status
- basePrice
- imageUrl nullable
- isFeatured
- createdAt
- updatedAt

### ProductVariant
Field minimal:
- id
- tenantId
- productId
- name
- sku nullable
- price
- stock
- weightGram
- isActive
- createdAt
- updatedAt

Aturan:
- Product dan ProductVariant wajib punya tenantId.
- ProductVariant tetap membawa tenantId agar query lebih aman dan cepat.
- SKU tidak wajib untuk MVP.
- Berat produk disiapkan untuk kebutuhan ongkir.

---

## 10. Customer & Order Foundation

### Customer
Field minimal:
- id
- tenantId
- name
- phone
- email nullable
- address nullable
- provinceId nullable
- regencyId nullable
- districtId nullable
- createdAt
- updatedAt

### Order
Field minimal:
- id
- tenantId
- customerId nullable
- orderNumber
- status
- subtotal
- shippingCost
- discountTotal
- grandTotal
- paymentStatus
- shipmentStatus
- notes nullable
- expiredAt nullable
- paidAt nullable
- createdAt
- updatedAt

### OrderItem
Field minimal:
- id
- tenantId
- orderId
- productId
- variantId nullable
- productNameSnapshot
- variantNameSnapshot nullable
- quantity
- unitPrice
- totalPrice
- weightGram
- createdAt

Aturan:
- OrderItem menyimpan snapshot nama dan harga produk.
- Perubahan nama produk setelah order tidak boleh mengubah histori order.
- Order number harus unik per tenant atau global dengan prefix.

---

## 11. Payment Foundation

### Payment
Field minimal:
- id
- tenantId
- orderId
- provider
- method
- status
- amount
- providerReference nullable
- paidAt nullable
- expiredAt nullable
- rawPayload nullable
- createdAt
- updatedAt

Aturan:
- Payment v0.1 boleh manual.
- Payment gateway real masuk fase berikutnya.
- Webhook payment nanti harus idempotent.
- `providerReference` harus bisa dicek agar webhook tidak double-process.

---

## 12. Shipment Foundation

### Shipment
Field minimal:
- id
- tenantId
- orderId
- provider nullable
- courier nullable
- service nullable
- trackingNumber nullable
- status
- originAddress nullable
- destinationAddress nullable
- shippingCost
- rawPayload nullable
- createdAt
- updatedAt

Aturan:
- Shipping API real belum wajib v0.1.
- Ongkir manual harus tetap didukung.
- Tracking disiapkan untuk fase berikutnya.

---

## 13. Notification Event Foundation

### NotificationEvent
Dipakai sebagai fondasi queue/event sebelum integrasi vendor real.

Field minimal:
- id
- tenantId nullable
- orderId nullable
- type
- channel
- recipient
- status
- payload
- attempts
- lastError nullable
- scheduledAt nullable
- sentAt nullable
- createdAt
- updatedAt

Aturan:
- Jangan kirim WhatsApp/email langsung dari payment webhook.
- Buat event terlebih dahulu.
- Worker/queue memproses event.
- Jika gagal, event dapat retry.

---

## 14. Region Database Foundation

Untuk kebutuhan logistik, struktur wilayah harus presisi.

Tabel minimal:
- Province
- Regency
- District

### Province
Field:
- id
- name
- normalizedName
- externalCode nullable
- createdAt
- updatedAt

### Regency
Field:
- id
- provinceId
- name
- normalizedName
- type nullable
- externalCode nullable
- createdAt
- updatedAt

### District
Field:
- id
- regencyId
- name
- normalizedName
- externalCode nullable
- createdAt
- updatedAt

Aturan penting:
- Provinsi harus berada sebelum kota/kabupaten dalam struktur relasi dan proses input.
- Semua nama wilayah harus dinormalisasi.
- Hapus teks tambahan di dalam tanda kurung.
- Simpan `normalizedName` untuk pencocokan API.
- Jangan mengandalkan input bebas user untuk kalkulasi ongkir.
- Gunakan dropdown wilayah saat fitur logistik mulai aktif.

---

## 15. Domain Foundation

### Domain
Field minimal:
- id
- tenantId
- hostname
- type
- status
- verificationToken nullable
- verifiedAt nullable
- sslStatus nullable
- createdAt
- updatedAt

Aturan:
- v0.1 fokus subdomain bawaan.
- Custom domain controlled beta di fase berikutnya.
- Domain status harus eksplisit.

---

## 16. Audit Log Foundation

### AuditLog
Field minimal:
- id
- tenantId nullable
- actorId nullable
- action
- entityType
- entityId nullable
- metadata
- ipAddress nullable
- userAgent nullable
- createdAt

Gunakan audit log untuk:
- perubahan status order;
- perubahan status tenant;
- perubahan subscription;
- perubahan saldo agen;
- proses reaktivasi;
- suspend/limited mode.

---

## 17. Seed Data v0.1

Seed minimal:
- plan Basic;
- plan Pro;
- plan Business;
- tenant Demo Store;
- tenant Toya Nusantara;
- agent demo;
- beberapa produk dummy Toya Nusantara;
- kategori produk dummy;
- user profile demo jika auth belum final.

---

## 18. RLS Plan

RLS tidak ditulis langsung di Prisma.

RLS dibuat melalui SQL migration di folder:

```txt
supabase/migrations/
```

RLS minimum:
- enable RLS untuk tabel bisnis;
- tenant member hanya bisa membaca data tenant-nya;
- tenant owner bisa mengelola data tenant-nya;
- super admin bisa mengakses semua data;
- agent hanya bisa melihat tenant yang terhubung dengannya;
- public storefront hanya bisa membaca tenant/product yang aktif.

---

## 19. Database Validation Checklist

Sebelum schema dianggap aman:
- semua data bisnis punya tenantId;
- relasi tenant jelas;
- enum status tersedia;
- billing model tersedia;
- agent credit ledger tersedia;
- order item menyimpan snapshot;
- region punya normalizedName;
- audit log tersedia;
- tidak ada credential plain text;
- RLS plan tersedia.

# SECURITY_GUARDRAILS.md

## 1. Purpose

Dokumen ini berisi aturan keamanan utama untuk membangun Daganta sebagai platform webstore SaaS multi-tenant.

Karena Daganta akan menyimpan data banyak UMKM, pelanggan, produk, order, billing, dan potensi credential vendor, keamanan harus dirancang sejak awal.

Prinsip utama:

Security first.  
Tenant isolation first.  
No secret leakage.  
No unsafe shortcut.

---

## 2. Critical Security Principles

1. Jangan expose secret ke frontend.
2. Jangan commit file `.env`.
3. Jangan gunakan credential asli di development terbuka.
4. Semua data bisnis harus tenant-scoped.
5. RLS harus diaktifkan untuk tabel bisnis.
6. Service role key hanya boleh digunakan server-side.
7. Webhook harus divalidasi dan idempotent.
8. Vendor credentials harus dienkripsi sebelum disimpan.
9. Semua perubahan status penting harus tercatat di audit log.
10. Production database tidak boleh dipakai untuk eksperimen vibe coding.

---

## 3. Environment Variable Rules

File `.env` tidak boleh masuk repository.

Wajib tersedia:
- `.env.example`
- `.gitignore` yang memasukkan `.env`, `.env.local`, `.env.production`

Contoh `.gitignore`:

```gitignore
.env
.env.local
.env.development
.env.production
.env*.local
```

Variable yang boleh digunakan di frontend harus diawali dengan `NEXT_PUBLIC_`.

Variable sensitif tidak boleh diawali dengan `NEXT_PUBLIC_`.

---

## 4. Secret Management

### Public-safe
Boleh dipakai di frontend:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_STOREFRONT_ROOT_DOMAIN`

### Server-only
Tidak boleh bocor ke frontend:
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `DIRECT_URL`
- `JWT_SECRET`
- `ENCRYPTION_KEY`
- `WEBHOOK_SECRET`
- `DRIPSENDER_API_KEY`
- `MAILKETING_SMTP_PASS`
- `MIDTRANS_SERVER_KEY`
- `QSTASH_TOKEN`

Jika `SUPABASE_SERVICE_ROLE_KEY` bocor ke frontend, itu dianggap insiden keamanan besar.

---

## 5. Tenant Isolation Rules

Setiap data bisnis wajib memiliki `tenantId`.

Tabel yang wajib tenant-scoped:
- ProductCategory
- Product
- ProductVariant
- Customer
- Order
- OrderItem
- Payment
- Shipment
- NotificationEvent
- Domain
- Subscription
- AuditLog jika relevan

Query bisnis tidak boleh mengambil data tanpa filter tenant.

Contoh yang salah:
```ts
const products = await prisma.product.findMany()
```

Contoh yang benar:
```ts
const products = await prisma.product.findMany({
  where: { tenantId }
})
```

---

## 6. Row Level Security Rules

RLS harus dibuat melalui SQL migration Supabase/PostgreSQL.

RLS minimum:
- tenant owner hanya bisa akses tenant sendiri;
- tenant staff hanya bisa akses tenant tempat ia menjadi member;
- agent hanya bisa akses tenant yang menjadi client-nya;
- super admin bisa akses semua data melalui role khusus;
- public storefront hanya bisa membaca data tenant aktif dan produk aktif.

Prisma schema tidak cukup untuk security.  
RLS adalah lapisan database-level security.

---

## 7. Authentication & Authorization Rules

Daganta memiliki role:
- SUPER_ADMIN
- AGENT
- TENANT_OWNER
- TENANT_STAFF
- CUSTOMER

Aturan:
- Auth memastikan siapa user.
- Authorization memastikan user boleh mengakses tenant/data tertentu.
- Role harus dicek di server-side.
- Jangan hanya mengandalkan UI untuk menyembunyikan menu.
- API route harus tetap memvalidasi permission.

---

## 8. Service Role Key Rules

`SUPABASE_SERVICE_ROLE_KEY` hanya boleh digunakan:
- di server-side;
- untuk admin operation tertentu;
- tidak di client component;
- tidak di browser;
- tidak di public repository.

Jika menggunakan Next.js:
- gunakan hanya pada route handler server;
- jangan import service role client ke file yang bisa dipanggil client;
- pisahkan file `supabase-admin.ts` dari `supabase-client.ts`.

---

## 9. Webhook Security Rules

Payment, queue, email, WhatsApp, dan logistics webhook harus:
- validasi signature;
- validasi timestamp jika tersedia;
- idempotent;
- tidak langsung menjalankan aksi berat;
- menyimpan raw payload jika diperlukan;
- mencatat audit log;
- tidak mempercayai payload tanpa verifikasi.

Webhook payment harus:
1. menerima request;
2. validasi signature;
3. cek apakah event sudah diproses;
4. update payment/order jika valid;
5. buat notification event;
6. return response cepat;
7. proses notifikasi melalui queue/background job.

---

## 10. Idempotency Rules

Setiap webhook yang dapat dipanggil lebih dari satu kali harus idempotent.

Gunakan:
- provider reference;
- event id;
- order id;
- unique constraint;
- processed flag;
- audit log.

Tujuan:
- order tidak double paid;
- notifikasi tidak terkirim berkali-kali;
- saldo agen tidak terpotong dua kali;
- shipment tidak dibuat dua kali.

---

## 11. Notification Security Rules

Dripsender dan Mailketing tidak boleh dipanggil langsung dari proses utama checkout/payment.

Gunakan:
- NotificationEvent table;
- queue;
- retry mechanism;
- status;
- attempts;
- lastError.

Channel:
- WHATSAPP
- EMAIL
- SYSTEM

Status:
- PENDING
- QUEUED
- SENT
- FAILED
- RETRYING
- CANCELED

---

## 12. Vendor Credential Rules

Jika tenant memiliki credential vendor sendiri, credential tidak boleh disimpan plain text.

Wajib:
- enkripsi credential sebelum disimpan;
- gunakan `ENCRYPTION_KEY`;
- batasi akses hanya server-side;
- jangan tampilkan credential lengkap di dashboard;
- tampilkan masked value saja.

Base64 bukan enkripsi.  
Hash password bukan metode untuk API key yang perlu didekripsi.  
Untuk API key vendor, gunakan encryption/decryption yang benar.

---

## 13. Billing Security Rules

Saldo agen harus aman.

Aturan:
- jangan hanya update balance tanpa ledger;
- setiap perubahan saldo wajib masuk AgentCreditLedger;
- gunakan transaksi database untuk debit/credit;
- saldo tidak boleh negatif kecuali kebijakan disetujui;
- pemotongan saldo harus idempotent;
- perubahan saldo masuk audit log.

---

## 14. Order Security Rules

Order lifecycle harus jelas.

Perubahan status penting:
- PENDING_PAYMENT → PAID
- PAID → PROCESSING
- PROCESSING → SHIPPED
- SHIPPED → COMPLETED
- any → CANCELED
- any → REFUNDED

Setiap perubahan harus:
- valid;
- tercatat;
- tenant-scoped;
- tidak bisa dilakukan oleh user tanpa permission.

---

## 15. Domain Security Rules

Subdomain bawaan aman untuk MVP.

Custom domain perlu guardrails:
- verifikasi domain;
- status domain eksplisit;
- SSL provisioning status;
- tidak langsung aktif sebelum DNS valid;
- admin monitoring;
- jangan izinkan tenant mengambil domain milik tenant lain.

Domain status:
- NOT_CONNECTED
- PENDING_VERIFICATION
- VERIFIED
- SSL_PROVISIONING
- ACTIVE
- ERROR

---

## 16. Production Safety Rules

Dilarang di production tanpa approval:
- migration langsung;
- reset database;
- delete tenant;
- delete order;
- deploy production;
- rotate secret;
- update domain config;
- menjalankan script seed;
- menjalankan script mass update.

Production harus dipisah dari development/staging.

---

## 17. Development Safety Rules

Saat development:
- gunakan Supabase Dev;
- gunakan dummy tenant;
- gunakan dummy customer;
- gunakan dummy product;
- jangan gunakan data asli pelanggan;
- jangan gunakan credential vendor asli kecuali di environment aman;
- jangan commit file hasil export database.

---

## 18. Audit Log Rules

AuditLog harus digunakan untuk:
- perubahan status tenant;
- suspend/limited/reactivate tenant;
- perubahan subscription;
- perubahan saldo agen;
- perubahan status order;
- perubahan payment;
- perubahan shipment;
- perubahan role member;
- perubahan domain.

Audit log minimal menyimpan:
- actorId;
- tenantId jika relevan;
- action;
- entityType;
- entityId;
- metadata;
- ipAddress;
- userAgent;
- createdAt.

---

## 19. Security Checklist v0.1

Sebelum Daganta v0.1 dianggap aman:
- `.env` tidak masuk repo;
- `.env.example` tersedia;
- service role key tidak dipakai frontend;
- semua data bisnis punya tenantId;
- tenant-scoped query diterapkan;
- RLS plan tersedia;
- audit log model tersedia;
- notification event model tersedia;
- billing ledger tersedia;
- webhook plan idempotent;
- vendor adapter masih placeholder;
- production belum disentuh untuk eksperimen.

---

## 20. Golden Rule

Jika ragu apakah sesuatu aman atau tidak, jangan lakukan otomatis.

Buat plan.  
Minta approval.  
Eksekusi kecil.  
Validasi.  
Catat hasil.

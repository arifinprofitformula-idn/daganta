# BUILD_RULES.md

## 1. Purpose

File ini menjadi aturan kerja untuk semua proses build Daganta, terutama ketika menggunakan Antigravity IDE dan AI Agent melalui teknik vibe coding.

Tujuan utama aturan ini adalah menjaga agar pembangunan Daganta tetap:
- terarah;
- aman;
- tidak keluar scope;
- mudah diuji;
- mudah dikembangkan;
- konsisten dengan blueprint Daganta v1.2.

---

## 2. Required Workflow for AI Agent

AI Agent tidak boleh langsung coding tanpa membuat rencana.

Setiap task wajib melalui alur berikut:

### Step 1 — Understand
Agent harus membaca:
- AGENTS.md
- docs/DAGANTA_CONTEXT.md
- docs/BUILD_RULES.md
- docs/DATABASE_FOUNDATION.md
- docs/SECURITY_GUARDRAILS.md
- docs/ROADMAP_V0_1.md
- docs/DECISION_LOG.md

### Step 2 — Plan
Sebelum coding, agent harus menjelaskan:
- tujuan task;
- file/folder yang akan dibuat;
- file/folder yang akan diubah;
- risiko teknis;
- validasi yang akan dijalankan;
- hal yang tidak akan dikerjakan.

### Step 3 — Approval
Agent harus menunggu approval sebelum menulis kode besar, menjalankan command penting, atau mengubah struktur project.

### Step 4 — Execute
Agent mengerjakan task kecil dan spesifik sesuai scope.

### Step 5 — Validate
Setelah coding, agent harus menjalankan validasi jika memungkinkan:
- typecheck;
- lint;
- build;
- test;
- prisma validate;
- prisma format.

### Step 6 — Report
Agent harus melaporkan:
- file yang dibuat;
- file yang diubah;
- command yang dijalankan;
- error yang muncul;
- solusi yang diterapkan;
- next recommended task.

---

## 3. Scope Daganta Foundation v0.1

v0.1 hanya fokus membangun fondasi.

Yang boleh dikerjakan:
- project skeleton;
- Next.js App Router setup;
- TypeScript setup;
- Tailwind setup;
- shadcn/ui setup;
- Prisma schema v0.1;
- Supabase connection;
- seed tenant demo;
- tenant resolver;
- dashboard shell;
- storefront shell;
- billing foundation;
- agent credit foundation;
- notification event foundation;
- adapter placeholder;
- dokumentasi awal.

Yang tidak boleh dikerjakan tanpa approval:
- real payment gateway integration;
- real Dripsender integration;
- real Mailketing integration;
- real logistics API integration;
- custom domain automation;
- marketplace sync;
- accounting module;
- AI content generator;
- native mobile app;
- affiliate kompleks;
- POS offline;
- deployment production;
- database reset production.

---

## 4. Tech Stack Rules

Gunakan stack berikut:
- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Prisma ORM
- Supabase PostgreSQL
- Supabase Auth
- Supabase Storage
- Vercel
- Modular monolith architecture

Dilarang mengganti stack utama tanpa persetujuan.

Dilarang menambahkan package baru tanpa menjelaskan:
- alasan package;
- alternatif yang dipertimbangkan;
- dampak terhadap bundle size;
- risiko maintenance.

---

## 5. Architecture Rules

1. Semua data bisnis wajib memiliki tenantId.
2. Semua query bisnis wajib tenant-scoped.
3. Tenant resolver harus mendukung subdomain seperti toyanusantara.daganta.store.
4. Custom domain tidak menjadi prioritas v0.1.
5. Dashboard dan storefront berada dalam satu codebase.
6. Gunakan modular monolith, bukan microservices.
7. Vendor integration dibuat melalui adapter pattern.
8. Jangan hardcode vendor ke core business logic.
9. Semua status penting harus menggunakan enum.
10. Semua perubahan status penting harus bisa diaudit.

---

## 6. Folder Structure Rules

Struktur project yang direkomendasikan:

```txt
daganta/
├── app/
│   ├── (marketing)/
│   ├── (dashboard)/
│   ├── (storefront)/
│   └── api/
├── components/
├── lib/
│   ├── tenant/
│   ├── auth/
│   ├── billing/
│   ├── notifications/
│   ├── payments/
│   ├── shipping/
│   └── security/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── supabase/
│   └── migrations/
├── docs/
├── public/
├── AGENTS.md
├── README.md
├── .env.example
├── .gitignore
└── package.json
```

Jangan membuat struktur folder baru yang menyimpang tanpa alasan kuat.

---

## 7. Naming Convention

Gunakan bahasa Inggris untuk:
- nama file;
- nama folder;
- model database;
- function;
- variable;
- enum;
- API route internal.

Gunakan bahasa Indonesia untuk:
- copy UI yang dibaca user Daganta;
- menu dashboard;
- label form;
- pesan error untuk user;
- landing page copy.

Contoh:
- `Product`
- `Order`
- `Tenant`
- `AgentCreditLedger`
- `resolveTenantFromHost`
- `Kelola Produk`
- `Pesanan`
- `Saldo Agen`

---

## 8. UI Rules

Dashboard harus:
- mudah dipahami UMKM;
- tidak terasa seperti dashboard developer;
- menggunakan bahasa sederhana;
- mobile-friendly;
- tidak terlalu banyak jargon teknis;
- fokus pada pekerjaan user.

Menu awal dashboard:
- Beranda
- Produk
- Pesanan
- Pelanggan
- Billing
- Pengaturan

Menu agen:
- Klien Saya
- Buat Toko
- Saldo Agen
- Riwayat Kredit
- Komisi
- Pengaturan

---

## 9. Vendor Integration Rules

Untuk v0.1, vendor hanya dibuat sebagai placeholder adapter.

Contoh adapter:
- `lib/payments/payment-adapter.ts`
- `lib/shipping/shipping-adapter.ts`
- `lib/notifications/whatsapp-adapter.ts`
- `lib/notifications/email-adapter.ts`

Setiap adapter harus punya interface yang jelas.

Jangan memanggil API Dripsender, Mailketing, payment gateway, atau logistics API langsung dari UI component.

---

## 10. Billing Rules

Billing internal Daganta harus diperlakukan sebagai core platform.

Minimal sejak v0.1 harus disiapkan:
- Plan
- Subscription
- AgentCreditBalance
- AgentCreditLedger
- TenantStatus
- Grace period field
- Limited mode field
- Suspended status

Model billing yang direkomendasikan:
- UMKM direct subscription;
- agent credit system;
- revenue share agent di fase berikutnya.

---

## 11. Git Rules

Gunakan branch:
- `main` untuk production-ready;
- `develop` untuk staging;
- `feature/*` untuk task kecil.

Contoh:
- `feature/project-skeleton`
- `feature/prisma-schema-v01`
- `feature/tenant-resolver`
- `feature/dashboard-shell`

AI Agent tidak boleh push ke `main` tanpa persetujuan.

---

## 12. Terminal Command Rules

Command berikut wajib minta approval sebelum dijalankan:

```bash
npm install
npm update
npx prisma migrate reset
npx prisma db push
supabase db reset
rm -rf
git push
vercel --prod
```

Command destructive tidak boleh dijalankan tanpa izin eksplisit.

---

## 13. Definition of Done

Setiap task dianggap selesai jika:
- scope sesuai instruksi;
- file yang berubah dilaporkan;
- tidak ada credential asli;
- tidak ada data bisnis tanpa tenantId;
- typecheck/build dijalankan jika memungkinkan;
- error dicatat;
- next task direkomendasikan.

---

## 14. Anti-Overbuilding Rule

Jangan membangun fitur besar hanya karena terlihat keren.

Prinsip Daganta v0.1:

Build small.  
Validate fast.  
Secure first.  
Scale later.

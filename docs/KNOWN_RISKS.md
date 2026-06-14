# Known Risks - Daganta

Dokumen ini mencatat risiko yang diketahui sebelum beta. Risiko harus ditinjau ulang pada setiap checkpoint v0.5A.

## Critical

Tidak ada risiko Critical terbuka dari Batch 1 audit dan Batch 2A access consistency patch.

## High

1. Authenticated browser E2E masih pending sebelum beta.
   - Impact: Flow tenant owner, agent, dan platform admin belum terbukti end-to-end dengan sesi login nyata.
   - Mitigation: Jalankan v0.5A Batch 3 Authenticated E2E QA sebelum beta user testing.

## Medium

1. Supabase orphan auth user risk jika `signUp` berhasil tetapi transaksi Prisma gagal.
   - Impact: Auth user bisa tercipta tanpa profil/toko database.
   - Mitigation: Rancang cleanup worker/manual ops flow sebelum production hardening.

2. Belum ada RLS enforcement aktif.
   - Impact: Isolasi tenant bergantung pada application-level tenant-scoped query.
   - Additional risk: Draf RLS saat ini bergantung pada Supabase `auth.uid()` dan tidak kompatibel langsung dengan Sumobase PostgreSQL.
   - Mitigation: Jangan apply draf RLS Supabase ke Sumobase; lanjutkan audit query dan rancang strategi database-level isolation yang provider-compatible.

3. Belum ada notification provider sungguhan.
   - Impact: WhatsApp/email belum terkirim ke pengguna nyata.
   - Mitigation: Pertahankan outbox skeleton sampai fase provider disetujui.

4. Belum ada payment gateway production.
   - Impact: Pembayaran masih manual/skeleton.
   - Mitigation: Jangan integrasikan gateway sampai roadmap mengizinkan.

5. Belum ada client claim/invitation flow.
   - Impact: Placeholder client owner belum bisa login/claim toko secara mandiri.
   - Mitigation: Rancang fase claim/invitation setelah beta hardening.

6. Belum ada credit top-up flow.
   - Impact: Saldo agen belum bisa diisi sendiri melalui UI/flow production.
   - Mitigation: Gunakan kontrol internal/manual sampai roadmap top-up disetujui.

## Low

1. Prisma `package.json#prisma` config deprecation warning.
   - Impact: Tidak mengganggu build saat ini, tetapi perlu migrasi config sebelum Prisma 7.
   - Mitigation: Jadwalkan cleanup teknis non-urgent.

2. Notification worker exists but is not wired.
   - Impact: Worker bisa dipanggil manual oleh developer, walau tidak aktif di runtime.
   - Mitigation: Tetapkan guardrails ops bahwa worker tidak dijalankan sebelum provider phase.

3. Some authenticated UI smoke checks depend on real sessions.
   - Impact: QA otomatis terbatas tanpa seeded auth sessions/browser state.
   - Mitigation: Siapkan test account placeholders dan jalankan QA manual/authenticated di Batch 3.

4. Product images are still stored as base64 values in the database.
   - Impact: Database size, request payload, backup duration, and page rendering cost can grow quickly.
   - Mitigation: Move product image upload to Supabase Storage before production image volume increases.

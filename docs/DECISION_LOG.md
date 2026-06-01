# Decision Log — Daganta

## Locked Decisions

1. Nama platform adalah Daganta.
2. Daganta adalah platform webstore SaaS untuk UMKM dan Agen Digital.
3. Toya Nusantara adalah tenant demo, bukan platform utama.
4. Architecture menggunakan modular monolith.
5. Stack utama:
   - Next.js
   - TypeScript
   - Tailwind CSS
   - shadcn/ui
   - Prisma
   - Supabase PostgreSQL
   - Vercel
6. Domain staging adalah daganta.store.
7. Domain production adalah daganta.id.
8. v0.1 fokus pada fondasi, bukan fitur lengkap.
9. Semua data bisnis wajib tenant-scoped.
10. Billing internal harus disiapkan sejak awal.
11. Custom domain bukan fitur inti MVP.
12. WhatsApp-first commerce menjadi strategi utama, tetapi integrasi real Dripsender belum masuk v0.1.
13. RLS dibuat melalui SQL migration, bukan langsung di schema.prisma.
14. Database Schema v0.1A menggunakan `UserProfile` sebagai jembatan otentikasi Supabase Auth.
15. Scope v0.1A disederhanakan dan hanya mencakup 14 entitas dasar: `UserProfile`, `Tenant`, `TenantMember`, `ProductCategory`, `Product`, `ProductVariant`, `Customer`, `Order`, `OrderItem`, `Address`, `Province`, `Regency`, `District`, dan `AuditLog`.
16. Entitas fungsional lanjutan (`Agent`, `AgentClient`, `Plan`, `Subscription`, `AgentCreditBalance`, `AgentCreditLedger`, `Domain`, `Payment`, `Shipment`, `NotificationEvent`) ditunda dan dipindahkan ke fase v0.1B.
17. Seluruh data bisnis utama wajib memiliki `tenantId` dan terisolasi dengan tenant-scope index.
18. Berkas `prisma/schema.prisma` v0.1A dideklarasikan locked dan valid secara offline, tanpa ada eksekusi database fisik (`prisma db push` atau migrasi) pada fase ini.
19. Migrasi awal ke Supabase Dev (v0.1A) sukses dilakukan menggunakan `prisma/migrations/20260601035742_init_v01a_foundation/`.
20. Database fisik yang dimodifikasi hanya Supabase Dev/Staging. Database Production tidak disentuh sama sekali.
21. RLS policy akan dibuat pada fase terpisah setelah demo seed data selesai dilakukan.
22. Seeding data awal untuk tenant demo (Toya Nusantara, Demo Store) dan data wilayah logistik minimal telah berhasil dimasukkan pada tanggal 2026-06-01 menggunakan `prisma/seed.ts` dan pustaka `tsx`.
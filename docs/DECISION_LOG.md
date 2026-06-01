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
23. Arsitektur penyelesaian tenant dan isolasi data diimplementasikan pada tanggal 2026-06-01 dengan keputusan:
    - Tenant resolver menggunakan hostname/subdomain untuk mengidentifikasi tenant.
    - Root domain `daganta.store` dan `www.daganta.store` dipetakan sebagai `MARKETING_SITE`.
    - Localhost dan `127.0.0.1` dipetakan sebagai `MARKETING_SITE`/development context.
    - Subdomain tenant seperti `toyanusantara.daganta.store` dan `demostore.daganta.store` berhasil resolve ke tenant terkait dengan pemetaan mode akses yang aman (`STOREFRONT_FULL`, `STOREFRONT_READONLY`, `BLOCKED`).
    - Seluruh query produk wajib menyertakan `tenantId` secara mutlak melalui tenant-scoped data access layer guna menjaga isolasi data.
24. Implementasi Storefront Shell (v0.1E) difokuskan penuh hanya pada Storefront Shell dan Marketing Home, menunda pembuatan Dashboard Shell serta fitur transaksional lainnya (cart, checkout, payment, shipping, login, custom domain automation).
25. Transaksi pembelian WhatsApp-first diimplementasikan sebagai tombol CTA "Beli via WhatsApp" yang bersifat non-fungsional placeholder tanpa memakai nomor riil dan tanpa membuat checkout.
26. Seluruh skema database (`schema.prisma`) dan berkas konfigurasi `.env` / `.env.local` tidak diubah, serta tidak ada migrasi atau database command destruktif yang dijalankan.
27. Seluruh verifikasi fungsionalitas (Host: `daganta.store` untuk Marketing, `toyanusantara.daganta.store` untuk Toya Storefront dengan 3 produk, `demostore.daganta.store` untuk Demo Storefront kosong, dan `unknown.daganta.store` untuk Toko Tidak Ditemukan) terbukti berhasil dikompilasi (`npm run build`) dan berjalan sukses di lingkungan lokal (`npm run dev`).
28. Perancangan RLS Policy Plan dan SQL migration draft (v0.1F) telah selesai disusun tanpa diterapkan secara fisik ke database. Status pencapaian ini dicatat sebagai `RLS policy plan and SQL draft prepared for review`.
29. Draf rancangan RLS diimplementasikan sebagai *defense-in-depth*. Untuk fase pengembangan saat ini, isolasi utama tetap dikelola penuh di tingkat aplikasi menggunakan *tenant-scoped query* (Prisma filter `tenantId`), mengingat koneksi Prisma server-side saat ini berjalan dengan role bypass RLS.
30. Draf SQL RLS menggunakan helper function (`is_tenant_accessible_public`, `is_tenant_member`, `is_super_admin`) dengan deklarasi `SECURITY DEFINER` dan `SET search_path = public` guna menghindari kebocoran data serta memitigasi risiko loop tak terbatas (*infinite recursion*) pada tabel `TenantMember`. Parameter helper function bertipe TEXT, identifikasi keanggotaan menggunakan `auth.uid()` (ID JWT), kebijakan pada private tables dipecah per operasi (SELECT/INSERT/UPDATE/DELETE), AuditLog dibatasi maksimal SELECT bagi member, dan warning column-level security didokumentasikan untuk tabel Tenant.
31. Dashboard Shell (v0.1G) diimplementasikan sebagai panel visual pemilik toko (*tenant owner*) menggunakan Bahasa Indonesia yang mudah dipahami pelaku UMKM, meniadakan istilah teknis (seperti tenant, resolver, database, query, mutation) pada antarmuka pengguna.
32. Pengambilan konteks toko demo dilakukan secara aman dengan melakukan kueri subdomain `toyanusantara` pada database untuk mendapatkan ID tenant dinamis, serta melakukan *tenant-scoped query* secara mutlak untuk seluruh agregasi data bisnis dan daftar produk.
33. Panel dashboard menyertakan label visual permanen: "Mode Demo Internal — belum menggunakan login asli." guna menegaskan batasan pengerjaan fase draf read-only, menunda seluruh fitur penulisan database (*write form submits*), otentikasi riil, dasbor agen, dan fungsionalitas transaksional.
34. Integrasi otentikasi Supabase Auth SSR (v0.1H) dilakukan dengan menggunakan `@supabase/ssr` dan Next.js 15 async `cookies()` untuk penanganan sesi berbasis cookies yang aman pada Server Components, Server Actions, dan Route Handlers.
35. Proteksi rute diletakkan secara terpusat di `app/dashboard/layout.tsx`. Pengguna tidak terotentikasi otomatis dialihkan (*server-side redirect*) ke `/login`, sedangkan halaman `/login` otomatis dialihkan ke `/dashboard` jika sesi terdeteksi aktif.
36. Draf pencarian profil `getCurrentUserProfile()` diimplementasikan secara aman tanpa memicu penulisan otomatis data ke database. Peringatan visual `"Akun belum terhubung ke profil toko."` ditampilkan di Topbar apabila relasi `UserProfile.authUserId` dengan ID sesi Supabase kosong.
37. Mekanisme pengikatan profil (`UserProfile`) otomatis sekali pakai dipasang pada `getCurrentUserProfile()`. Jika pencarian berdasarkan `authUserId` kosong namun email cocok persis dengan `UserProfile.email` dan `authUserId` database masih `null`, sistem menjalankan `updateMany` yang aman untuk mengikat token Supabase Auth `user.id`. Pengecekan ketat mencegah pengunggahan ulang atau menimpa UUID yang sudah terisi.
38. Evaluasi akses keanggotaan toko dilakukan menggunakan modul modular `getActiveTenantContext()` yang mengembalikan struktur status otorisasi (`SUCCESS`, `NO_PROFILE`, `NO_MEMBERSHIP`). Jika keanggotaan kosong, sistem menolak mengambil data toko dan meredirender secara utuh komponen penengah `AccountAccessState` yang memiliki tombol logout fungsional.
39. Seluruh saringan data bebas berbasis subdomain Toya Nusantara atau storefront pada halaman dasbor (/dashboard, /dashboard/products, /dashboard/settings, /dashboard/billing, /dashboard/orders, /dashboard/customers) dihilangkan seutuhnya. Seluruh kueri data bisnis dipaksa mengambil filter `tenantId` dinamis dari keanggotaan sesi aktif. Untuk pengguna yang memiliki lebih dari satu toko, sistem memilih keanggotaan pertama untuk v0.1I dan switcher toko dicatat ditunda.


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
22. Seeding data awal untuk tenant demo (Toya Nusantara, Demo Store) dan data wilayah logistik minimal telah berhasil dimasukkan pada tanggal 2026-06-01 menggunakan `prisma/seed.ts` and `tsx`.
23. Arsitektur penyelesaian tenant dan isolasi data diimplementasikan pada tanggal 2026-06-01 dengan keputusan:
    - Tenant resolver menggunakan hostname/subdomain untuk mengidentifikasi tenant.
    - Root domain `daganta.store` and `www.daganta.store` dipetakan sebagai `MARKETING_SITE`.
    - Localhost and `127.0.0.1` dipetakan sebagai `MARKETING_SITE`/development context.
    - Subdomain tenant seperti `toyanusantara.daganta.store` dan `demostore.daganta.store` berhasil resolve ke tenant terkait dengan pemetaan mode akses yang aman (`STOREFRONT_FULL`, `STOREFRONT_READONLY`, `BLOCKED`).
    - Seluruh query produk wajib menyertakan `tenantId` secara mutlak melalui tenant-scoped data access layer guna menjaga isolasi data.
24. Implementasi Storefront Shell (v0.1E) difokuskan penuh hanya pada Storefront Shell dan Marketing Home, menunda pembuatan Dashboard Shell serta fitur transaksional lainnya (cart, checkout, payment, shipping, login, custom domain automation).
25. Transaksi pembelian WhatsApp-first diimplementasikan sebagai tombol CTA "Beli via WhatsApp" yang bersifat non-fungsional placeholder tanpa memakai nomor riil dan tanpa membuat checkout.
26. Seluruh skema database (`schema.prisma`) dan berkas konfigurasi `.env` / `.env.local` tidak diubah, serta tidak ada migrasi atau database command destruktif yang dijalankan.
27. Seluruh verifikasi fungsionalitas (Host: `daganta.store` untuk Marketing, `toyanusantara.daganta.store` untuk Toya Storefront dengan 3 produk, `demostore.daganta.store` untuk Demo Storefront kosong, dan `unknown.daganta.store` untuk Toko Tidak Ditemukan) terbukti berhasil dikompilasi (`npm run build`) dan berjalan sukses di lingkungan lokal (`npm run dev`).
28. Perancangan RLS Policy Plan dan SQL migration draft (v0.1F) telah selesai disusun tanpa diterapkan secara fisik ke database. Status pencapaian ini dicatat sebagai `RLS policy plan and SQL draft prepared for review`.
29. Draf rancangan RLS diimplementasikan sebagai *defense-in-depth*. Untuk fase pengembangan saat ini, isolasi utama tetap dikelola penuh di tingkat aplikasi menggunakan *tenant-scoped query* (Prisma filter `tenantId`), mengingat koneksi Prisma server-side saat ini berjalan dengan role bypass RLS.
30. Draf SQL RLS menggunakan helper function (`is_tenant_accessible_public`, `is_tenant_member`, `is_super_admin`) dengan deklarasi `SECURITY DEFINER` and `SET search_path = public` guna menghindari kebocoran data serta memitigasi risiko loop tak terbatas (*infinite recursion*) pada tabel `TenantMember`. Parameter helper function bertipe TEXT, identifikasi keanggotaan menggunakan `auth.uid()` (ID JWT), kebijakan pada private tables dipecah per operasi (SELECT/INSERT/UPDATE/DELETE), AuditLog dibatasi maksimal SELECT bagi member, dan warning column-level security didokumentasikan untuk tabel Tenant.
31. Dashboard Shell (v0.1G) diimplementasikan sebagai panel visual pemilik toko (*tenant owner*) menggunakan Bahasa Indonesia yang mudah dipahami pelaku UMKM, meniadakan istilah teknis (seperti tenant, resolver, database, query, mutation) pada antarmuka pengguna.
32. Pengambilan konteks toko demo dilakukan secara aman dengan melakukan kueri subdomain `toyanusantara` pada database untuk mendapatkan ID tenant dinamis, serta melakukan *tenant-scoped query* secara mutlak untuk seluruh agregasi data bisnis dan daftar produk.
33. Panel dashboard menyertakan label visual permanen: "Mode Demo Internal — belum menggunakan login asli." guna menegaskan batasan pengerjaan fase draf read-only, menunda seluruh fitur penulisan database (*write form submits*), otentikasi riil, dasbor agen, dan fungsionalitas transaksional.
34. Integrasi otentikasi Supabase Auth SSR (v0.1H) dilakukan dengan menggunakan `@supabase/ssr` and Next.js 15 async `cookies()` untuk penanganan sesi berbasis cookies yang aman pada Server Components, Server Actions, dan Route Handlers.
35. Proteksi rute diletakkan secara terpusat di `app/dashboard/layout.tsx`. Pengguna tidak terotentikasi otomatis dialihkan (*server-side redirect*) ke `/login`, sedangkan halaman `/login` otomatis dialihkan ke `/dashboard` jika sesi terdeteksi aktif.
36. Draf pencarian profil `getCurrentUserProfile()` diimplementasikan secara aman tanpa memicu penulisan otomatis data ke database. Peringatan visual `"Akun belum terhubung ke profil toko."` ditampilkan di Topbar apabila relasi `UserProfile.authUserId` dengan ID sesi Supabase kosong.
37. Mekanisme pengikatan profil (`UserProfile`) otomatis sekali pakai dipasang pada `getCurrentUserProfile()`. Jika pencarian berdasarkan `authUserId` kosong namun email cocok persis dengan `UserProfile.email` dan `authUserId` database masih `null`, sistem menjalankan `updateMany` yang aman untuk mengikat token Supabase Auth `user.id`. Pengecekan ketat mencegah pengunggahan ulang atau menimpa UUID yang sudah terisi.
38. Evaluasi akses keanggotaan toko dilakukan menggunakan modul modular `getActiveTenantContext()` yang mengembalikan struktur status otorisasi (`SUCCESS`, `NO_PROFILE`, `NO_MEMBERSHIP`). Jika keanggotaan kosong, sistem menolak mengambil data toko dan meredirender secara utuh komponen penengah `AccountAccessState` yang memiliki tombol logout fungsional.
39. Seluruh saringan data bebas berbasis subdomain Toya Nusantara atau storefront pada halaman dasbor (/dashboard, /dashboard/products, /dashboard/settings, /dashboard/billing, /dashboard/orders, /dashboard/customers) dihilangkan seutuhnya. Seluruh kueri data bisnis dipaksa mengambil filter `tenantId` dinamis dari keanggotaan sesi aktif. Untuk pengguna yang memiliki lebih dari satu toko, sistem memilih keanggotaan pertama untuk v0.1I dan switcher toko dicatat ditunda.
40. Penyimpanan preferensi toko aktif dikelola menggunakan *Server-Side Cookie* `daganta_active_tenant_id` (`httpOnly`, `sameSite: "lax"`, `path: "/dashboard"`, `secure` di produksi, kadaluarsa 30 hari). Penggunaan `localStorage` di sisi klien dihindari demi integritas keamanan.
41. Pengerasan otorisasi (*dashboard access hardening*) dipasang di `getActiveTenantContext()`. Sistem memvalidasi UUID toko pada cookie terhadap daftar keanggotaan `TenantMember` sah milik user di database. Jika tidak cocok (cookie palsu, termanipulasi, atau milik toko lain), sistem mengabaikan cookie, menghapus cookie dari browser devtools, dan fallback otomatis ke keanggotaan toko pertama yang sah milik pengguna.
42. Daftar toko yang dikirimkan ke klien (`availableTenants`) dipotong ketat murni hanya menyertakan kolom dasar visual (`id`, `name`, `slug`, `subdomain`, `status`) guna memitigasi kebocoran metadata internal (seperti `ownerId` atau ID user). Aksi beralih toko dikelola secara server-side melalui Server Action `switchActiveTenantAction` yang memvalidasi otorisasi hak akses sebelum memperbarui cookie.
43. Pembangunan modul Manajemen Produk & Kategori (v0.2A) dilakukan sepenuhnya tanpa memodifikasi berkas `schema.prisma` dan tanpa memicu database migration/push fisik ke database.
44. Mutasi data bisnis (Create, Edit, Deactivate) dikunci secara ketat di tingkat server menggunakan saringan tenant-scoped (`tenantId` dari `getActiveTenantContext()`). Input `tenantId` dari sisi klien sama sekali tidak digunakan sebagai penentu kebenaran (source of truth).
45. Aksi deaktifasi diimplementasikan as soft-delete yang aman: status produk berubah menjadi `ARCHIVED` and kolom `isActive` kategori disetel `false`. Hal ini mempertahankan integritas relasi historis transaksi.
46. Pengelolaan varian produk dilakukan dengan pembuatan otomatis varian default `"Standar"` sewaktu pembuatan produk, serta melakukan sinkronisasi otomatis detail harga, stok, berat, dan SKU saat pengeditan produk. Hal ini memberikan kemudahan antarmuka bagi pengguna UMKM.
47. Setiap mutasi yang berhasil di sisi server dicatat secara transaksional ke tabel `AuditLog` dengan detail ID aktor (`actorId`) and ID tenant (`tenantId`) guna menunjang transparansi sistem.
48. Generator slug otomatis dikonfigurasikan agar aman dan unik per tenant dengan mendeteksi duplikasi terlebih dahulu, lalu otomatis menyematkan akhiran pembeda numerik jika terjadi benturan nama.
49. Redesain halaman pemasaran Daganta (v0.1K) beralih ke model Bright SaaS yang outcome-oriented dalam Bahasa Indonesia, serta menghilangkan Purple Dominance, gaya developer cyberpunk, dan visual dashboard/game neon.
50. Domain `daganta.store` dan `www.daganta.store` resmi disahkan dan diintegrasikan sebagai domain staging / live validation untuk proyek `daganta-staging` di Vercel.
51. Pola wildcard `*.daganta.store` resmi ditambahkan dan dihubungkan ke proyek `daganta-staging` di Vercel untuk mendukung rilis storefront tenant yang dinamis dan terisolasi.
52. Domain utama bisnis `daganta.id` dideklarasikan locked dan sama sekali belum disentuh/dimodifikasi pada fase ini karena merupakan domain produksi riil jangka panjang.
53. Daganta adalah SaaS multi-tenant untuk UMKM dan agen digital.
54. Toya Nusantara adalah tenant demo/pilot, bukan produk utama.
55. MVP Daganta tidak menjadi escrow.
56. Payment buyer tetap direct-to-tenant.
57. Payment gateway belum aktif pada fase berjalan.
58. Webhook masih berupa skeleton.
59. Notification masih berupa outbox skeleton.
60. WhatsApp/email belum dikirim sungguhan.
61. Agent Dashboard v0.4B bersifat read-only.
62. Agent credit ledger harus immutable.
63. AgentClient `tenantId` unique untuk MVP.
64. Agent tidak boleh menyandera UMKM; ownership transfer harus disiapkan.
65. Public signup membuka trial 14 hari.
66. Paket resmi MVP: Starter Rp39.000, Growth Rp89.000, Pro Rp179.000.
67. Annual pricing: bayar 10 bulan, aktif 12 bulan.
68. Grace period ditetapkan 7 hari.
69. Transaction commission MVP ditetapkan Rp0.
70. Platform-level permission menggunakan `UserProfile.platformRole`.
71. `TenantMember.role` tetap bersifat tenant-scoped dan tidak boleh menjadi sumber kebenaran izin platform.
72. SUPER_ADMIN dashboard bypass dibatasi hanya untuk route `/dashboard/admin/*`.
73. Agent dashboard bypass dibatasi hanya untuk route `/dashboard/agent/*`.
74. Billing simulation helper menggunakan `platformRole = SUPER_ADMIN`.
75. AgentClient ownership transfer dikendalikan oleh platform admin.
76. Agent tidak boleh melakukan self-transfer ownership toko klien.
77. Ownership transfer tidak membuat refund, invoice, billing mutation, atau perubahan AgentCreditLedger.
78. Agent credit activation memotong saldo dan membuat ledger secara atomik mengikuti pola transaksi v0.4D.
79. Public signup membuka trial 14 hari.
80. Pembelian publik untuk program agen tetap dinonaktifkan dan diarahkan ke waitlist.
81. Webhook payment tetap skeleton dan tidak melakukan mutasi `OrderPayment` atau `Order`.
82. Notification tetap outbox skeleton dan tidak mengirim WhatsApp/email sungguhan.
83. v0.5A difokuskan pada beta readiness, full system hardening, audit, dokumentasi, dan QA.

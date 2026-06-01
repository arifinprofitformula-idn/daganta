# DAGANTA_CONTEXT.md

## 1. Project Identity

**Project Name:** Daganta  
**Product Type:** Platform Webstore SaaS Multi-Tenant  
**Primary Users:** UMKM, Agen Digital, Reseller Webstore, Konsultan Bisnis, dan komunitas bisnis lokal  
**Demo Tenant:** Toya Nusantara  
**Staging Domain:** daganta.store  
**Production Domain:** daganta.id  

Daganta adalah platform webstore instan yang membantu UMKM memiliki toko online mandiri, profesional, dan siap jualan tanpa bergantung penuh pada marketplace. Daganta juga dirancang untuk membantu agen digital membangun penghasilan berulang melalui pembuatan dan pengelolaan webstore untuk klien UMKM.

Daganta bukan hanya website builder. Daganta adalah infrastruktur webstore untuk UMKM dan agen digital.

---

## 2. Brand Positioning

**Daganta — Webstore Instan untuk UMKM dan Agen Digital**

Daganta memposisikan diri sebagai platform yang:
- mudah digunakan oleh UMKM non-teknis;
- mendukung penjualan langsung melalui webstore mandiri;
- mendukung alur jualan berbasis WhatsApp;
- memberi ruang bagi agen digital untuk membuat dan mengelola banyak toko klien;
- menjadi pondasi bisnis digital yang ringan, aman, dan scalable.

---

## 3. Brand Promise

Daganta membantu UMKM punya webstore sendiri dengan lebih mudah, rapi, dan profesional, sekaligus membantu agen digital membangun layanan berulang dari kebutuhan digitalisasi UMKM.

---

## 4. Core Value Proposition

### Untuk UMKM
- Punya webstore mandiri tanpa ribet teknis.
- Bisa menampilkan katalog produk secara profesional.
- Bisa menerima order dan mengelola pelanggan.
- Bisa menggunakan subdomain bawaan Daganta.
- Bisa tetap closing melalui WhatsApp.
- Tidak sepenuhnya bergantung pada marketplace.

### Untuk Agen Digital
- Bisa membuatkan toko online untuk klien.
- Bisa mengelola banyak toko dari satu dashboard.
- Bisa mendapatkan recurring income.
- Bisa menggunakan sistem kredit agen.
- Bisa membangun layanan digital untuk UMKM lokal.

### Untuk Platform Owner
- Membangun SaaS modular yang bisa tumbuh.
- Mendapat revenue dari subscription, kredit agen, dan paket layanan.
- Memiliki sistem multi-tenant yang bisa dikembangkan menjadi white-label platform.

---

## 5. Strategic Keywords

Daganta harus selalu dibangun dengan kata kunci berikut:
- Mudah
- Mandiri
- Bertumbuh
- Mobile-first
- WhatsApp-first commerce
- Multi-tenant
- Agent-friendly
- Secure by design
- Modular
- Scalable
- UMKM-oriented

---

## 6. Target User

### A. UMKM Langsung
Pelaku usaha kecil dan menengah yang sudah berjualan, tetapi ingin memiliki toko online mandiri.

Contoh:
- produk makanan;
- fashion;
- herbal;
- kerajinan;
- aksesoris;
- perlengkapan olahraga;
- produk digital;
- jasa lokal;
- brand niche seperti Toya Nusantara.

### B. Agen Digital
Individu atau tim kecil yang ingin menjual jasa pembuatan webstore kepada UMKM.

Contoh:
- freelancer digital marketing;
- admin sosial media;
- reseller digital;
- konsultan UMKM;
- komunitas bisnis;
- agency kecil;
- pengelola komunitas pesantrenpreneur atau koperasi.

### C. Super Admin Daganta
Tim internal Daganta yang mengelola:
- tenant;
- agen;
- paket;
- subscription;
- billing;
- domain;
- status toko;
- sistem platform;
- laporan revenue.

---

## 7. Demo Tenant: Toya Nusantara

Toya Nusantara adalah contoh tenant pertama untuk menguji fleksibilitas Daganta.

Toya Nusantara adalah brand spesialis toya rotan asli untuk kebutuhan pencak silat, dengan fokus B2B perguruan dan B2C sebagai alternatif pembelian.

Toya Nusantara digunakan sebagai:
- demo storefront;
- validasi kebutuhan B2B dan B2C;
- validasi katalog produk khusus;
- validasi custom order;
- contoh brand UMKM yang naik kelas melalui webstore.

Catatan penting:
Toya Nusantara bukan platform utama. Toya Nusantara hanya tenant/client yang menggunakan Daganta.

---

## 8. Product Direction v0.1

Fokus Daganta v0.1 adalah membangun fondasi teknis SaaS multi-tenant yang aman, ringan, dan siap bertumbuh.

v0.1 bukan versi final platform.  
v0.1 bukan super-app.  
v0.1 bukan integrasi vendor lengkap.

Target v0.1:
- project Next.js berjalan;
- database schema awal tersedia;
- tenant demo tersedia;
- tenant resolver tersedia;
- dashboard shell tersedia;
- storefront shell tersedia;
- billing foundation tersedia;
- agent credit foundation tersedia;
- security guardrails tersedia;
- vendor integration masih berupa adapter placeholder.

---

## 9. What Daganta Is

Daganta adalah:
- webstore SaaS;
- platform multi-tenant;
- platform untuk UMKM;
- platform untuk agen digital;
- alat bantu digitalisasi penjualan;
- sistem katalog, order, pelanggan, dan billing;
- fondasi white-label marketplace-independent webstore.

---

## 10. What Daganta Is Not

Daganta bukan:
- marketplace;
- jasa desain website manual;
- hanya landing page builder;
- ERP lengkap;
- accounting software lengkap;
- POS offline;
- native mobile app;
- payment aggregator yang menampung dana buyer;
- escrow system pada MVP;
- platform yang langsung bergantung pada custom domain setiap tenant.

---

## 11. MVP Business Guardrails

1. Dana transaksi buyer tidak ditampung Daganta pada MVP.
2. Dana transaksi diarahkan ke tenant atau payment gateway milik tenant.
3. Revenue Daganta berasal dari subscription, kredit agen, dan paket layanan.
4. Billing internal Daganta harus dibangun sejak awal.
5. Agen adalah channel distribusi, tetapi tenant UMKM tidak boleh disandera oleh churn agen.
6. Custom domain bukan fitur wajib v0.1.
7. Subdomain bawaan menjadi default MVP.
8. WhatsApp-first commerce adalah strategi utama, tetapi integrasi vendor real masuk fase berikutnya.

---

## 12. Primary User Journey

### UMKM
1. UMKM daftar.
2. UMKM membuat toko.
3. UMKM memilih subdomain.
4. UMKM mengisi profil toko.
5. UMKM menambahkan produk.
6. UMKM menerima order.
7. UMKM follow-up buyer melalui WhatsApp atau sistem order.
8. UMKM memperpanjang langganan.

### Agen Digital
1. Agen daftar.
2. Agen memiliki saldo kredit.
3. Agen membuat toko untuk klien.
4. Agen mengatur profil toko klien.
5. Agen membantu input produk awal.
6. Agen memantau masa aktif klien.
7. Agen mendapatkan potensi recurring income.

### Customer/Pembeli
1. Customer membuka storefront tenant.
2. Customer melihat katalog.
3. Customer memilih produk.
4. Customer checkout.
5. Customer mendapat instruksi pembayaran atau diarahkan ke WhatsApp.
6. Tenant memproses order.

---

## 13. v0.1 Success Definition

Daganta Foundation v0.1 dianggap berhasil jika:
- project bisa berjalan lokal;
- schema Prisma tersedia;
- Supabase dev terkoneksi;
- tenant demo dapat dibuat;
- Toya Nusantara tersedia sebagai tenant demo;
- dashboard shell tersedia;
- storefront shell tersedia;
- tenant resolver tersedia;
- belum ada data bisnis tanpa tenantId;
- belum ada secret yang terekspos;
- dokumentasi teknis tersedia;
- Antigravity agent dapat memahami konteks project melalui file dokumentasi ini.

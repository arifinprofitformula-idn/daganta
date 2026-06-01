# RLS Policy Plan (Phase v0.1F)

> [!IMPORTANT]
> **Status: RLS Policy Plan & SQL Draft Prepared for Review**
> - Dokumen ini berisi perencanaan kebijakan *Row Level Security* (RLS) di tingkat database PostgreSQL (Supabase) sebagai pertahanan lapis kedua (*defense-in-depth*).
> - **DRAFT ONLY**: Seluruh detail kebijakan dan draf SQL dalam berkas ini bersifat **perencanaan dan draf rancangan saja**, serta **belum/tidak diterapkan secara fisik** (*Not yet applied to database*) ke database pada fase ini. **DO NOT APPLY DIRECTLY**.
> - **Isolasi Utama Saat Ini**: Untuk fase pengembangan saat ini, isolasi data bisnis antar-tenant tetap bertumpu sepenuhnya pada **Application Layer** melalui **tenant-scoped query** (menggunakan parameter `tenantId` pada setiap kueri Prisma).

---

## 1. Arsitektur Isolasi Data & Pertimbangan ORM Prisma

### 1.1 Konsep Defense-in-Depth
RLS dirancang untuk menyaring data langsung pada tingkat database PostgreSQL. Meskipun demikian, RLS v0.1F adalah draf *defense-in-depth* dan **bukan merupakan klaim bahwa seluruh kueri Prisma saat ini sudah otomatis dilindungi oleh RLS**. Isolasi utama tetap dikelola oleh aplikasi melalui query yang secara eksplisit disaring menggunakan `tenantId` demi menjamin kinerja dan keamanan storefront.

### 1.2 Dampak Koneksi Server-Side Prisma
Secara default, koneksi server-side yang digunakan oleh ORM Prisma melalui variabel `DATABASE_URL` di `.env` menggunakan role database dengan tingkat otorisasi tinggi (seperti *superuser*, `postgres`, atau `service_role` di Supabase). Role database ini memiliki hak istimewa khusus yang **secara otomatis membypass seluruh aturan RLS** (`BYPASSRLS`). 

Oleh karena itu:
- Perilaku kueri Prisma saat ini yang berjalan server-side **tidak boleh dianggap sebagai pembuktian atau validasi penuh terhadap berjalannya RLS**.
- Pengujian RLS secara riil dan mutlak memerlukan koneksi database yang menggunakan role non-bypass (seperti `anon` atau `authenticated`) atau secara eksplisit meneruskan *auth context* JWT pengguna (misalnya melalui kueri dinamis `SET LOCAL request.jwt.claims TO ...` di awal transaksi).

---

## 2. Klasifikasi Akses Tabel & Matriks Keamanan

Setiap tabel di dalam database diklasifikasikan ke dalam tiga tingkat keamanan akses:

| Klasifikasi Akses | Deskripsi Keamanan | Daftar Tabel |
| :--- | :--- | :--- |
| **Public Read-Only** | Dapat dibaca secara bebas tanpa otentikasi maupun pembatasan tenant. | `Province`, `Regency`, `District` |
| **Limited Public Storefront Read** | Dapat dibaca oleh publik secara anonim, tetapi dibatasi secara ketat berdasarkan status tenant yang aktif dan kelayakan produk. | `Tenant`, `ProductCategory`, `Product`, `ProductVariant` |
| **Private Secured Data** | Sama sekali tidak boleh dibaca oleh publik anonim. Hanya dapat diakses oleh anggota (*Tenant Member*) yang sah atau administrator platform. | `TenantMember`, `Customer`, `Order`, `OrderItem`, `Address`, `AuditLog` |

---

## 3. Matriks Kebijakan RLS (Policy Matrix)

### 3.1 Tabel Wilayah (Public Read)
Tabel-tabel logistik berikut tidak berisi data rahasia bisnis dan diizinkan untuk dibaca secara bebas oleh siapa saja untuk kebutuhan pengisian alamat pengiriman:
- **`Province`**: Read diizinkan secara bebas (`USING (true)`).
- **`Regency`**: Read diizinkan secara bebas (`USING (true)`).
- **`District`**: Read diizinkan secara bebas (`USING (true)`).

### 3.2 Tabel Terbatas Storefront (Limited Public Storefront Read)
Katalog produk dan profil toko diizinkan dibaca secara publik oleh pengunjung storefront anonim dengan syarat:
1. **`Tenant`**:
   - Publik hanya dapat membaca tenant yang memiliki status: `ACTIVE`, `EXPIRING_SOON`, `GRACE_PERIOD`, atau `LIMITED`.
   - Tenant dengan status `SUSPENDED` or `ARCHIVED` akan diblokir total dari storefront publik.
2. **`ProductCategory`**:
   - Publik hanya dapat membaca kategori produk jika kategori tersebut berstatus aktif (`isActive = true`) **DAN** tenant pemilik kategori tersebut berada dalam status layak dibaca (aksesibel).
3. **`Product`**:
   - Publik hanya dapat membaca produk jika produk tersebut berstatus aktif (`status = 'ACTIVE'`) **DAN** tenant pemilik produk berada dalam status layak dibaca (aksesibel).
4. **`ProductVariant`**:
   - Publik hanya dapat membaca varian produk jika varian tersebut aktif (`isActive = true`) **DAN** produk terkait berstatus aktif (`status = 'ACTIVE'`) **DAN** tenant pemilik berada dalam status layak dibaca (aksesibel).

> [!WARNING]
> **Warning Keamanan (Row-Level vs Column-Level Security):**
> RLS hanya mengatur pembatasan baris (*row-level*), bukan pembatasan kolom (*column-level*). Akses baca langsung (*Public Read*) ke tabel `Tenant` berisiko mengekspos kolom internal yang sensitif seperti `ownerId`, `subscriptionEndsAt`, dan `trialEndsAt`.
> **Rekomendasi Produksi di Masa Depan**: Gunakan *public storefront view* (misalnya `storefront_tenants_view`) yang secara eksplisit membatasi kolom yang diekspos ke publik untuk lingkungan produksi, alih-alih membuka tabel `Tenant` secara langsung.

### 3.3 Tabel Data Sensitif (Private Secured Data)
Seluruh transaksi, data diri pelanggan, alamat lengkap, hak akses member, dan log aktivitas audit dikunci rapat dari publik. Kebijakan untuk tabel ini dipecah secara eksplisit per operasi untuk keamanan terperinci:

- **`TenantMember`**, **`Customer`**, **`Order`**, **`OrderItem`**, **`Address`**:
   - **`SELECT`**: Diizinkan bagi pengguna terotentikasi yang terbukti secara sah terdaftar sebagai anggota (`TenantMember`) aktif pada tenant terkait, atau administrator platform.
   - **`INSERT`**: Diizinkan bagi pengguna terotentikasi yang merupakan anggota dari tenant terkait.
   - **`UPDATE`**: Diizinkan bagi pengguna terotentikasi yang merupakan anggota dari tenant terkait.
   - **`DELETE`**: Ditolak secara default bagi anggota biasa, hanya dapat dioperasikan oleh administrator platform atau pemilik khusus.
   - **Publik Anonim**: Akses `SELECT`, `INSERT`, `UPDATE`, `DELETE` ditolak secara absolut.

- **`AuditLog` (Tabel Khusus Riwayat Aktivitas)**:
   - **`SELECT`**: Pengguna terotentikasi yang merupakan anggota tenant terkait hanya memiliki hak baca maksimal (`SELECT`).
   - **`INSERT` / `UPDATE` / `DELETE`**: Ditolak secara mutlak bagi anggota biasa. Operasi penulisan log audit hanya diizinkan untuk proses server-side aman atau administrator platform di fase berikutnya guna mencegah manipulasi log riwayat.
   - **Publik Anonim**: Akses ditolak secara absolut.

---

## 4. Pencegahan Infinite Recursion & Perancangan Helper Function

### 4.1 Risiko Infinite Recursion
Jika kebijakan RLS pada tabel `TenantMember` didefinisikan dengan melakukan kueri langsung (membaca ulang) tabel `TenantMember` untuk memeriksa hak akses user, database PostgreSQL akan terjebak dalam putaran tanpa akhir (*infinite recursion* / kebocoran tumpukan panggilan). Untuk mencegah hal ini, draf arsitektur v0.1F menggunakan **helper function** eksternal dengan properti `SECURITY DEFINER`.

### 4.2 Rancangan Helper Function Keamanan
Fungsi pembantu diimplementasikan dengan standar keamanan tinggi:
1. **`SECURITY DEFINER`**: Berjalan dengan hak istimewa pembuat fungsi, memungkinkan pemeriksaan langsung ke tabel keanggotaan tanpa memicu RLS rekursif.
2. **`search_path = public`**: Properti wajib (`SET search_path = public`) untuk mencegah eksploitasi injeksi skema (*schema-injection attacks*).
3. **Bebas Kebocoran Data**: Fungsi hanya mengembalikan nilai boolean (`true` atau `false`) dan tidak mengekspos isi record internal tabel keanggotaan kepada pengguna luar.
4. **Parameter Bertipe `TEXT`**: Parameter input tenant ID dideklarasikan sebagai `TEXT` alih-alih `UUID` untuk fleksibilitas parsing string dari JWT claims di application layer.

---

## 5. Draf Kebijakan SQL (SQL Policy Outline)

### 5.1 Helper Function Draft
- **`is_tenant_accessible_public(target_tenant_id TEXT)`**:
  Memvalidasi apakah status tenant adalah layak dibaca untuk etalase publik (`ACTIVE`, `EXPIRING_SOON`, `GRACE_PERIOD`, `LIMITED`).
- **`is_tenant_member(target_tenant_id TEXT)`**:
  Memvalidasi apakah `auth.uid()` terotentikasi saat ini memiliki keterhubungan dengan `authUserId` milik `UserProfile` yang terdaftar sebagai anggota (`TenantMember`) dari `target_tenant_id`.
  - *Catatan Identitas Utama*: Pemeriksaan didasarkan secara ketat pada ID otentikasi unik (`auth.uid()::text = u."authUserId"`).
  - *Catatan Pengembangan*: Pemeriksaan berbasis email JWT dapat dicadangkan sebagai fallback pengembangan, namun bukan sebagai validasi utama di tingkat produksi.
- **`is_super_admin()`** (*FUTURE DRAFT ONLY*):
  - *Catatan Penting*: Karena skema dasar v0.1A belum memiliki sistem peran platform global (*global platform role*), fungsi ini ditandai sebagai **future draft only**.
  - Implementasi final di masa depan membutuhkan penambahan kolom `UserProfile.globalRole` atau pembuatan tabel administratif khusus seperti `PlatformAdmin`. Kebijakan ini tidak siap diaplikasikan langsung pada fase ini.

---

## 6. Rencana Pengujian Keamanan (Test Plan)

Rencana pengujian berikut dirancang untuk dijalankan di lingkungan Supabase Dev dengan menggunakan role non-bypass (seperti role `anon` untuk storefront publik dan `authenticated` dengan mock JWT untuk admin):

### 6.1 Skenario Uji 1: Public Storefront Read (Tenant Layak)
- **Tujuan**: Memastikan pengunjung toko anonim dapat melihat informasi toko dan katalog produk.
- **Langkah Uji**:
  1. Login sebagai pengguna anonim (role `anon`).
  2. Lakukan kueri `SELECT * FROM "Tenant" WHERE subdomain = 'toyanusantara'`.
  3. Lakukan kueri `SELECT * FROM "Product" WHERE "tenantId" = [Toya-ID]`.
- **Ekspektasi Hasil**: Kueri berhasil mengembalikan data toko Toya Nusantara dan 3 produk aktif yang terdaftar.

### 6.2 Skenario Uji 2: Public Storefront Read (Tenant Nonaktif/Suspended)
- **Tujuan**: Memastikan toko yang dinonaktifkan tidak membocorkan informasi atau katalog produk.
- **Langkah Uji**:
  1. Ubah status tenant Demo Store menjadi `SUSPENDED` di database.
  2. Login sebagai pengguna anonim (role `anon`).
  3. Lakukan kueri `SELECT * FROM "Tenant" WHERE subdomain = 'demostore'`.
  4. Lakukan kueri `SELECT * FROM "Product" WHERE "tenantId" = [DemoStore-ID]`.
- **Ekspektasi Hasil**: Kueri mengembalikan hasil kosong (0 baris), menandakan data tenant dan produk terkunci aman dari publik.

### 6.3 Skenario Uji 3: Proteksi Data Pribadi (Private Tables)
- **Tujuan**: Memastikan data transaksi dan data pelanggan tidak dapat diakses secara publik.
- **Langkah Uji**:
  1. Login sebagai pengguna anonim (role `anon`).
  2. Lakukan kueri `SELECT * FROM "Customer"`.
  3. Lakukan kueri `SELECT * FROM "Order"`.
- **Ekspektasi Hasil**: Database mengembalikan hasil kosong atau melempar pesan *Access Denied* (kebijakan RLS memblokir akses).

### 6.4 Skenario Uji 4: Hak Akses Anggota Tenant (Tenant Member Isolation)
- **Tujuan**: Memastikan anggota toko A tidak dapat mengintip data pribadi toko B.
- **Langkah Uji**:
  1. Simulasikan login (role `authenticated` dengan auth uid milik Owner Toya Nusantara).
  2. Lakukan kueri `SELECT * FROM "Order" WHERE "tenantId" = [Toya-ID]`. (Ekspektasi: Data pesanan Toya terlihat).
  3. Lakukan kueri `SELECT * FROM "Order" WHERE "tenantId" = [DemoStore-ID]`. (Ekspektasi: Data kosong karena tidak memiliki hak keanggotaan di Demo Store).
- **Ekspektasi Hasil**: Isolasi data berjalan sempurna antar-tenant pada level otentikasi member.

### 6.5 Skenario Uji 5: Pembuktian Prisma Server-Side Bypass
- **Tujuan**: Memverifikasi bahwa kueri server-side default Prisma membypass RLS.
- **Langkah Uji**:
  1. Pastikan RLS aktif di database.
  2. Jalankan aplikasi Next.js tanpa mengirimkan auth context JWT dari sisi frontend ke kueri server Prisma.
  3. Buka halaman storefront publik.
- **Ekspektasi Hasil**: Storefront tetap berjalan sukses mengembalikan data produk karena Prisma server-side menggunakan role bypass. Ini membuktikan bahwa Prisma server-side saat ini bypass RLS dan isolasi utama saat ini tetap dikawal penuh oleh *tenant-scoped query* di tingkat aplikasi.

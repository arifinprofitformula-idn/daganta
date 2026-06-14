# Daganta VPS Deployment

## 1. Target Architecture

Deployment beta yang direkomendasikan:

```text
Internet
  -> DNS root + wildcard tenant
  -> HTTPS reverse proxy
  -> Daganta Next.js container
  -> Sumobase managed PostgreSQL
  -> Supabase Auth (optional provider)
```

VPS tidak menjalankan PostgreSQL. Database utama Daganta menggunakan PostgreSQL
terkelola dari Sumobase. Supabase tidak menjadi sumber database Daganta; Supabase
hanya dipakai jika `AUTH_PROVIDER=supabase` dan kelak dapat dipakai untuk Storage
setelah adapter upload diselesaikan.

Baseline VPS untuk beta:

- Ubuntu LTS;
- 2 vCPU;
- 4 GB RAM;
- 40 GB SSD;
- Docker Engine dan Docker Compose plugin;
- firewall provider hanya membuka SSH, HTTP, dan HTTPS.

## 2. Deployment Contract

Release selalu dipisah menjadi:

1. build dan validasi image;
2. backup/checkpoint database;
3. satu kali release migration;
4. rollout aplikasi;
5. readiness dan smoke test;
6. rollback image jika verifikasi gagal.

Container aplikasi tidak menjalankan migration saat start. Restart, health
recovery, dan scaling tidak boleh mengubah schema database.

## 3. Environment

Buat `.env.production` hanya di VPS dari `.env.example`, lalu batasi permission
file agar hanya user deployment yang dapat membacanya.

Untuk development saat ini, `.env` adalah sumber koneksi Sumobase. Jangan
menyimpan `DATABASE_URL` atau `DIRECT_URL` lama di `.env.local`, karena Next.js
akan memprioritaskan `.env.local` dan dapat mengarahkan aplikasi ke database
yang berbeda. `.env.local` boleh tetap dipakai untuk konfigurasi publik
Supabase Auth.

Production minimum:

```dotenv
NODE_ENV="production"
DATABASE_PROVIDER="postgres"
# Sumobase Transaction Pooler untuk query runtime aplikasi.
DATABASE_URL="postgresql://USER:PASSWORD@SUMOBASE_HOST:6432/DATABASE?..."
# Sumobase Direct Connection untuk Prisma migration.
DIRECT_URL="postgresql://USER:PASSWORD@SUMOBASE_DIRECT_HOST:DIRECT_PORT/DATABASE?..."

AUTH_PROVIDER="supabase"
DEMO_AUTH_ENABLED="false"
AUTH_SECRET="..."

# Upload adapter masih placeholder; pertahankan local sampai integrasi disetujui.
STORAGE_PROVIDER="local"
NEXT_PUBLIC_SUPABASE_URL="https://PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=""

NEXT_PUBLIC_APP_URL="https://daganta.store"
NEXT_PUBLIC_STOREFRONT_ROOT_DOMAIN="daganta.store"

RUN_MIGRATIONS="false"
RUN_DB_SEED="false"
ALLOW_DB_SEED="false"
```

Rules:

- gunakan connection string tab **Transaction Pooler** Sumobase untuk
  `DATABASE_URL`;
- gunakan connection string tab **Direct Connection** Sumobase untuk
  `DIRECT_URL`;
- jangan memakai Transaction Pooler sebagai `DIRECT_URL` untuk migration;
- jika Direct Connection tidak tersedia dari jaringan VPS, evaluasi Session
  Pooler hanya setelah `prisma migrate status` dan migration replay lulus;
- pertahankan parameter SSL dan pooler persis sesuai connection string yang
  diberikan Sumobase;
- URL database harus di-URL-encode jika password memuat karakter khusus;
- jangan memakai service role key jika belum ada operasi server yang memerlukannya;
- jangan pernah menjalankan seed pada production;
- nilai `NEXT_PUBLIC_*` harus tersedia saat build dan runtime.
- pastikan hanya ada satu sumber aktif untuk `DATABASE_URL` dan `DIRECT_URL`
  pada setiap environment.

### Sumobase Connection Roles

| Kebutuhan | Sumobase method | Environment |
| --- | --- | --- |
| Query aplikasi normal | Transaction Pooler | `DATABASE_URL` |
| Prisma migration | Direct Connection | `DIRECT_URL` |
| Troubleshooting koneksi panjang | Session Pooler | Hanya jika disetujui dan diuji |

Screenshot Transaction Pooler saja belum cukup untuk menetapkan `DIRECT_URL`.
Ambil connection string terpisah dari tab **Direct Connection**, tanpa menaruh
password atau connection string asli di repository maupun dokumentasi.

## 4. DNS and TLS

Untuk staging `daganta.store`, arahkan record berikut ke public IP VPS:

```text
A  @      VPS_IP
A  www    VPS_IP
A  *      VPS_IP
```

Wildcard DNS diperlukan agar tenant baru langsung dapat memakai
`tenant.daganta.store` tanpa membuat record baru.

Reverse proxy harus:

- melayani `daganta.store`, `www.daganta.store`, dan `*.daganta.store`;
- meneruskan header `Host` asli;
- meneruskan `X-Forwarded-For` dan `X-Forwarded-Proto`;
- mengaktifkan HTTPS;
- tidak mengekspos port `3000` ke internet.

Sertifikat wildcard memerlukan DNS challenge. Pastikan reverse proxy atau panel
deployment mendukung DNS provider domain Daganta. Jangan menyimpan DNS API token
di repository.

Tambahkan URL production yang tepat ke Supabase Auth:

- Site URL: `https://daganta.store`;
- redirect URL production yang benar-benar dipakai aplikasi;
- hindari wildcard redirect yang terlalu luas untuk production.

## 5. First Deployment with Compose

Clone repository ke direktori deployment, checkout commit yang sudah diverifikasi,
dan buat `.env.production`.

Validasi source:

```bash
npm ci
npm run check
```

Build kedua target:

```bash
docker compose --env-file .env.production -f compose.production.yml build app migrate
```

Jalankan migration satu kali:

```bash
docker compose --env-file .env.production -f compose.production.yml \
  --profile release run --rm migrate
```

Deploy aplikasi:

```bash
docker compose --env-file .env.production -f compose.production.yml up -d app
```

Periksa status:

```bash
docker compose -f compose.production.yml ps
curl --fail http://127.0.0.1:3000/api/health/live
curl --fail http://127.0.0.1:3000/api/health/ready
```

## 6. Coolify

Coolify dapat dipakai sebagai UI deployment, reverse proxy, log viewer, dan image
rollback. Gunakan Dockerfile, expose port `3000`, dan jangan membuat host port
mapping manual.

Konfigurasi penting:

- build target aplikasi: `runner`;
- health path: `/api/health/ready`;
- `NEXT_PUBLIC_*` ditandai tersedia saat build;
- hapus `BUILD_DATABASE_URL` dan `BUILD_DIRECT_URL` dari Coolify. Dockerfile
  tidak menerima kedua build argument tersebut;
- database production tidak diperlukan saat image dibangun. Dockerfile memakai
  placeholder PostgreSQL yang tidak dihubungi selama build;
- runtime environment mengikuti bagian Environment;
- root domain dan wildcard tenant diarahkan ke resource yang sama;
- migration dijalankan sebagai release job terpisah menggunakan target
  `migrator`, bukan start command aplikasi.

Jika panel tidak menyediakan release job yang berjalan tepat sekali, jalankan
target migrator dari CI atau terminal VPS sebelum meminta Coolify melakukan
rollout aplikasi.

Jika log build masih menampilkan:

```text
BUILD_DATABASE_URL
BUILD_DIRECT_URL
```

berarti Coolify masih membangun commit atau cache Dockerfile lama. Pastikan
perubahan terbaru sudah di-push, lalu jalankan redeploy dengan **Clear Build
Cache**. Dockerfile terbaru memakai placeholder database internal dan tidak
menerima secret database pada tahap build.

## 7. Release Procedure

Untuk setiap release:

1. Catat commit SHA dan image/tag yang akan dirilis.
2. Jalankan `npm ci` dan `npm run check` di CI.
3. Review seluruh file baru di `prisma/migrations`.
4. Pastikan backup/checkpoint database tersedia.
5. Build image aplikasi dan migrator dari commit yang sama.
6. Jalankan migrator tepat sekali.
7. Deploy aplikasi baru.
8. Tunggu readiness menjadi sehat.
9. Jalankan smoke test root domain dan satu tenant.
10. Simpan commit SHA, waktu release, dan hasil verifikasi.

Jangan menjalankan dua release Daganta secara bersamaan.

## 8. Smoke Test

Minimum setelah rollout:

```text
GET https://daganta.store/api/health/live
GET https://daganta.store/api/health/ready
GET https://daganta.store
GET https://toyanusantara.daganta.store
GET https://toyanusantara.daganta.store/p/<known-product>
GET https://toyanusantara.daganta.store/track
```

Verifikasi manual:

- marketing site tampil pada root domain;
- tenant resolver tidak mencampur data tenant;
- login Supabase dan dashboard bekerja;
- cookie dashboard memakai `Secure`;
- tambah/edit produk tetap tenant-scoped;
- checkout manual dan tracking bekerja;
- domain tenant yang tidak dikenal menampilkan not-found store.

## 9. Rollback

Rollback aplikasi:

1. hentikan rollout baru;
2. deploy kembali image atau commit SHA terakhir yang sehat;
3. verifikasi `/api/health/ready`;
4. ulangi smoke test;
5. catat insiden dan release yang dibatalkan.

Prisma Migrate tidak menyediakan rollback schema otomatis. Karena itu migration
production harus backward-compatible dengan versi aplikasi sebelumnya. Gunakan
pola expand-and-contract untuk perubahan destructive.

Jika migration merusak data atau schema:

- jangan membuat migration balasan secara spontan;
- aktifkan maintenance response bila perlu;
- review dampak dan backup;
- pulihkan melalui backup/restore Sumobase yang telah diuji dan disetujui.

## 10. Operations

- Pantau container restart, status readiness, error 5xx, dan koneksi database.
- Simpan log di luar lifecycle container.
- Terapkan patch OS dan Docker secara terjadwal.
- Batasi SSH dengan key dan firewall provider.
- Aktifkan dan verifikasi jadwal backup Sumobase.
- Uji restore Sumobase pada database terisolasi sebelum production launch.
- Jangan menjalankan notification worker sampai provider phase disetujui.
- Base64 product image masih menjadi risiko database; migrasikan ke Supabase
  Storage sebelum volume gambar production meningkat.

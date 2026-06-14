# Production Deployment Checklist

## Approval and Scope

- [ ] Production deployment telah mendapat approval eksplisit.
- [ ] Commit SHA dan release owner dicatat.
- [ ] Tidak ada fitur di luar milestone yang ikut masuk.
- [ ] Working tree release bersih.

## Static Verification

- [ ] `npm ci` berhasil.
- [ ] `npm run check` berhasil.
- [ ] Migration SQL direview.
- [ ] Tidak ada credential atau data pelanggan di repository/image.
- [ ] Dependency vulnerability telah direview dan diterima atau ditangani.

## Infrastructure

- [ ] VPS memakai Ubuntu LTS dan Docker versi terdukung.
- [ ] Firewall provider hanya membuka port yang diperlukan.
- [ ] SSH menggunakan key dan akses administratif dibatasi.
- [ ] Reverse proxy meneruskan header `Host`.
- [ ] HTTPS root domain aktif.
- [ ] HTTPS wildcard tenant aktif.
- [ ] Port aplikasi `3000` tidak terbuka ke internet.

## DNS and Auth

- [ ] Record root domain mengarah ke VPS.
- [ ] Record `www` mengarah ke VPS.
- [ ] Record wildcard mengarah ke VPS.
- [ ] Supabase Site URL menggunakan domain production yang tepat.
- [ ] Supabase redirect allow-list telah direview.
- [ ] `AUTH_PROVIDER=supabase`.
- [ ] `DEMO_AUTH_ENABLED=false`.

## Environment

- [ ] `.env.production` hanya tersedia di server/secret manager.
- [ ] Coolify tidak mengirim `BUILD_DATABASE_URL`/`BUILD_DIRECT_URL` kosong.
- [ ] `DATABASE_URL` menggunakan Sumobase Transaction Pooler.
- [ ] `DIRECT_URL` menggunakan Sumobase Direct Connection.
- [ ] `DATABASE_URL` dan `DIRECT_URL` tidak memakai connection string yang sama.
- [ ] Parameter SSL/pooler sesuai connection string resmi Sumobase.
- [ ] Password dengan karakter khusus telah di-URL-encode.
- [ ] Seluruh `NEXT_PUBLIC_*` tersedia saat build dan runtime.
- [ ] `RUN_MIGRATIONS=false`.
- [ ] `RUN_DB_SEED=false`.
- [ ] `ALLOW_DB_SEED=false`.
- [ ] Tidak ada service role key di browser bundle.

## Database

- [ ] Backup/checkpoint Sumobase terbaru tersedia.
- [ ] Restore Sumobase pernah diuji di database terisolasi.
- [ ] `prisma migrate status` berhasil melalui `DIRECT_URL`.
- [ ] Fresh migration replay pernah diverifikasi.
- [ ] Hanya satu release migration berjalan.
- [ ] `prisma migrate deploy` berhasil sebelum rollout.
- [ ] Migration kompatibel dengan image aplikasi sebelumnya.
- [ ] Keputusan isolasi database-level telah direview.
- [ ] Draf RLS Supabase berbasis `auth.uid()` tidak diterapkan ke Sumobase.

## Rollout

- [ ] Image ditandai dengan commit SHA, bukan hanya `latest`.
- [ ] Image lama masih tersedia untuk rollback.
- [ ] Health liveness berhasil.
- [ ] Health readiness berhasil.
- [ ] Container tidak berjalan sebagai root.
- [ ] Restart policy aktif.
- [ ] Log aplikasi dapat diakses setelah container diganti.

## Smoke Test

- [ ] Root marketing domain berhasil.
- [ ] Toya Nusantara storefront berhasil.
- [ ] Unknown tenant tidak membuka tenant lain.
- [ ] Login tenant owner berhasil.
- [ ] Dashboard tenant berhasil.
- [ ] Product create/edit berhasil.
- [ ] Checkout manual berhasil.
- [ ] Order tracking berhasil.
- [ ] Agent login dan route guard berhasil.
- [ ] Platform admin route guard berhasil.

## Go or No-Go

- [ ] Tidak ada Critical atau High risk terbuka.
- [ ] Medium risk memiliki acceptance atau mitigation owner.
- [ ] Authenticated E2E QA telah lulus.
- [ ] Rollback owner tersedia selama release window.
- [ ] Release dinyatakan GO oleh approver.

## Post-Deployment

- [ ] Commit SHA dan waktu deployment dicatat.
- [ ] Migration yang diterapkan dicatat.
- [ ] Hasil smoke test dicatat.
- [ ] Error rate dan restart dipantau.
- [ ] Backup berikutnya terjadwal.
- [ ] Known risks dan roadmap status diperbarui.

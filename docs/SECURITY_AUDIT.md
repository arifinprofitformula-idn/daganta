# Daganta Security Audit

Tanggal audit: 2026-06-28

## Scope

Audit ini mencakup file di `app/` dan `lib/` dengan fokus pada tenant isolation, auth guard, API exposure, rate limiting, input sanitization, dan security headers.

## Status Fix

| Area | Status | Catatan |
| --- | --- | --- |
| Tenant-scoped business query | Fixed/Reviewed | Query produk, pesanan, billing, checkout, dan write action utama sudah memakai `tenantId`. |
| Product write server actions | Fixed | Semua operasi produk memakai `getActiveTenantContext()`, `validateTenantAccess()`, dan audit log. |
| Login brute force | Fixed | `app/login/actions.ts` dan `app/(auth)/login/actions.ts` dibatasi 10 request/menit per IP. |
| Public payment create | Fixed | `POST /api/payments/create` dibatasi 5 request/menit per IP. Endpoint ini public karena dipakai pembeli storefront tanpa auth. |
| Webhook abuse | Fixed | `POST /api/webhooks/*` dibatasi 100 request/menit per IP dan tetap validasi signature. |
| Checkout abuse | Fixed | Checkout server actions dibatasi 5 request/menit per IP. |
| Input sanitization | Fixed | `sanitize-html` dipasang. Deskripsi produk disanitasi sebelum masuk DB; deskripsi kategori disanitasi sebagai plain text. |
| Security headers | Fixed | `next.config.js` menambahkan X-Frame-Options, X-Content-Type-Options, Referrer-Policy, CSP minimal, dan Permissions-Policy. |
| Security tests | Added | Test statis ditambahkan untuk cross-tenant guard, auth bypass guard, dan rate limiter. |

## Public Route Exceptions

Beberapa route sengaja tidak memakai auth user:

- `GET /api/health`, `/api/health/live`, `/api/health/ready`: health check deployment.
- `GET /api/internal/tenant-resolve`: dipakai middleware Edge untuk resolve tenant tanpa import Prisma langsung di middleware.
- `POST /api/webhooks/[provider]` dan legacy `POST /api/webhooks/payments/[provider]`: public by design, dilindungi signature validation, idempotency, dan rate limit.
- `POST /api/payments/create`: public storefront/customer flow, dilindungi tenant resolution, order lookup dengan `tenantId`, dan rate limit IP.
- Storefront checkout action: public by design, dilindungi tenant resolution dari host, validasi Zod, hitung ulang harga dari DB dengan `tenantId`, dan rate limit IP.

## Query Review Notes

Query tanpa `tenantId` yang ditemukan dan dinilai valid:

- Reference data: `Province`, `Regency`, `District`.
- Platform/admin data: `SubscriptionPlan`, super admin payment/top-up screens, cron lifecycle, webhook event table.
- Auth/session lookups: `UserProfile` by Supabase auth id/email, `AgentProfile` by authenticated agent id.
- Tenant resolver: lookup by subdomain/custom domain sebelum tenant context tersedia.
- Health checks and internal middleware helpers.

Query bisnis tenant-scoped yang diperiksa:

- `Product`, `ProductVariant`, `ProductCategory`.
- `Order`, `OrderItem`, `OrderPayment`, `Customer`.
- `Invoice`, `TenantSubscription`.
- `AgentClient` where tenant-owned behavior is filtered by authenticated `agentId` or platform role.

## Remaining Follow-Up

- Tambahkan Redis production env `UPSTASH_REDIS_REST_URL` dan `UPSTASH_REDIS_REST_TOKEN` agar rate limit tidak hanya in-memory di multi-container deployment.
- Audit manual ulang sebelum production saat fitur vendor payment/logistics production aktif.
- Pertimbangkan test runner formal di `package.json` untuk menjalankan `node --test`/`tsx --test` di CI.

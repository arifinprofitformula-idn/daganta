# Beta Readiness Checklist - Daganta

Status saat ini:

1. Static verification: PASS
2. v0.5A Batch 1 Beta Audit: PASS
3. v0.5A Batch 2A Access Consistency Patch: PASS
4. Authenticated E2E QA: PENDING

## Repository Health

- [x] Git status clean after latest verified checkpoint.
- [x] `npm run build` passes.
- [x] `git diff --check` passes.
- [x] Production deployment checklist documented.

## Migration Health

- [x] `npx prisma validate` passes.
- [x] `npx prisma generate` passes.
- [x] `npx prisma migrate status` reports database schema up to date.
- [ ] Fresh database migration replay verified in an approved isolated environment.

## Route Inventory

- [x] Public routes inventoried.
- [x] Storefront routes inventoried.
- [x] Tenant dashboard routes inventoried.
- [x] Agent routes inventoried.
- [x] Platform admin routes inventoried.
- [x] Webhook route inventoried.

## Access Control

- [x] Tenant dashboard uses membership-derived active tenant context.
- [x] Agent routes require AgentProfile.
- [x] Platform admin route uses `UserProfile.platformRole = SUPER_ADMIN`.
- [x] SUPER_ADMIN no-membership bypass scoped to `/dashboard/admin/*`.
- [x] Agent no-membership bypass scoped to `/dashboard/agent/*`.
- [ ] Authenticated browser QA completed for tenant owner, agent, and platform admin.

## Tenant Isolation

- [x] Product queries are tenant-scoped.
- [x] Checkout product validation is tenant-scoped.
- [x] Order dashboard actions are tenant-scoped.
- [x] Order tracking uses tenant host, order number, and contact verification.
- [x] Billing queries are tenant-scoped.

## Billing/Lifecycle

- [x] Trial period is 14 days.
- [x] Grace period is 7 days.
- [x] Starter/Growth/Pro pricing is seeded.
- [x] Product limits are seeded.
- [x] LIMITED_MODE blocks checkout and product creation.
- [x] SUSPENDED/CANCELED blocks storefront view.

## Commerce Flow

- [x] Checkout creates order, items, payment, audit log, and notification event by code pattern.
- [x] Manual payment validation updates payment and order status by code pattern.
- [ ] End-to-end checkout QA completed in browser.
- [ ] Wrong-contact and cross-tenant tracking QA completed.

## Signup/Onboarding

- [x] Signup supports Starter/Growth/Pro.
- [x] Invalid plan falls back to Starter.
- [x] Reserved and duplicate slugs are blocked.
- [x] Duplicate email is blocked.
- [x] Signup creates trial subscription and audit log.
- [ ] Supabase orphan auth user cleanup strategy documented and approved.

## Agent Flow

- [x] Agent dashboard shell exists.
- [x] Agent can create draft client store by code pattern.
- [x] Draft client store starts in limited mode.
- [x] Agent credit activation uses atomic transaction pattern.
- [ ] Authenticated agent E2E QA completed.

## Platform Admin Flow

- [x] Platform admin ownership transfer page exists.
- [x] Transfer action uses `platformRole = SUPER_ADMIN`.
- [x] Ownership transfer creates no billing or credit mutation.
- [ ] Authenticated platform admin E2E QA completed.

## Webhook/Notification

- [x] Webhook idempotency skeleton exists.
- [x] Webhook does not mutate order/payment.
- [x] NotificationEvent outbox exists.
- [x] WhatsApp/email adapters are dry-run skeletons.
- [x] Notification worker is not wired to cron/runtime.

## Ledger/Financial Integrity

- [x] Seeded credit balance matches initial top-up pattern.
- [x] Agent activation debit ledger is atomic by code pattern.
- [x] Ownership transfer does not mutate ledger.
- [x] Billing invoices and agent credit ledger remain separate concepts.

## Documentation Readiness

- [x] Roadmap status updated for v0.5A.
- [x] Decision log updated for access and beta-readiness decisions.
- [x] Guardrails updated for platform admin, agent scope, and beta safety.
- [x] Known risks documented.
- [x] QA test plan documented.

## Manual QA

- [ ] Tenant owner login and merchant dashboard.
- [ ] Public signup trial.
- [ ] Product creation.
- [ ] Storefront product detail.
- [ ] Cart and checkout.
- [ ] Manual payment validation.
- [ ] Order tracking.
- [ ] Billing lifecycle states.
- [ ] Agent dashboard and client store flow.
- [ ] Platform admin ownership transfer.

## Go/No-Go Criteria

Go only if:

1. Static verification remains PASS.
2. Authenticated E2E QA passes for tenant owner, agent, and platform admin.
3. No Critical or High risk remains open.
4. Known Medium risks are accepted or assigned an approved patch plan.
5. Production deployment checklist is completed before any production deploy.

# Guardrails - Daganta

Dokumen ini berisi batas aman utama untuk semua AI Agent dan developer yang mengerjakan Daganta.

## Production And Environment

1. No production deploy without explicit approval.
2. No env changes unless approved.
3. No real credentials in repository.
4. No `SUPABASE_SERVICE_ROLE_KEY` exposure to frontend.
5. No production database command without explicit approval.

## Database And Migration

1. No db push.
2. No migrate reset without explicit approval.
3. No RLS apply unless approved.
4. Every schema change must have migration and verification.
5. Separate Prisma schema changes from SQL migration for RLS and policies.
6. No direct production migration without review and explicit approval.

## Multi-Tenant Security

1. Every tenant query must be tenant-scoped.
2. Every business data model must include `tenantId` unless explicitly documented as global reference data.
3. Do not trust client-submitted `tenantId` as source of truth.
4. Tenant resolver must support subdomain access such as `toyanusantara.daganta.store`.
5. Do not expose internal tenant metadata to unauthorized users.

## Platform And Role Security

1. Every platform admin action must use `UserProfile.platformRole = SUPER_ADMIN`.
2. `TenantMember.role` remains tenant-scoped and must not authorize platform-level actions.
3. No ownership transfer outside the `platformRole = SUPER_ADMIN` guard.
4. No public client claim or invitation flow until explicitly approved.
5. Agent dashboard bypass is limited to `/dashboard/agent/*`.
6. Platform admin dashboard bypass is limited to `/dashboard/admin/*`.

## Agent System

1. Every agent mutation must be agent-scoped.
2. No agent credit deduction outside the approved v0.4D transaction pattern.
3. Agent credit ledger must be immutable by convention.
4. AgentClient `tenantId` is unique for MVP.
5. Agent must not lock in UMKM ownership; ownership transfer must remain platform-controlled until a future approved claim/invitation flow.

## Vendor And Integration

1. No payment gateway integration until roadmap allows.
2. No WhatsApp/email sending until notification provider phase.
3. No queue provider until approved.
4. Vendor integrations must use adapter placeholders before production integration.
5. Webhook handlers must be idempotent.
6. Notification work must use queue or event table, not direct sending from the main request.

## Product And Commerce

1. No stock decrement policy change unless approved.
2. Payment buyer remains direct-to-tenant for MVP.
3. Transaction commission MVP is Rp0.
4. Daganta MVP is not an escrow.
5. Payment gateway production is not active yet.

## Domain And Release

1. No custom domain mass rollout before beta hardening.
2. Custom domain automation is not core v0.1.
3. Focus on default subdomain before custom domain workflow.

## Milestone Control

1. Every milestone must end with commit checkpoint.
2. Every change must have verification command.
3. Every schema change must have migration and verification.
4. Do not jump roadmap milestone without approval.
5. Do not proceed to beta user testing until authenticated E2E QA passes.

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

1. Every business query must be tenant-scoped.
2. Every business data model must include `tenantId` unless explicitly documented as global reference data.
3. Do not trust client-submitted `tenantId` as source of truth.
4. Tenant resolver must support subdomain access such as `toyanusantara.daganta.store`.
5. Do not expose internal tenant metadata to unauthorized users.

## Vendor And Integration

1. No payment gateway integration until roadmap allows.
2. No WhatsApp/email sending until notification provider phase.
3. No queue provider until approved.
4. Vendor integrations must use adapter placeholders before production integration.
5. Webhook handlers must be idempotent.
6. Notification work must use queue or event table, not direct sending from the main request.

## Product And Commerce

1. No stock decrement unless stock policy approved.
2. Payment buyer remains direct-to-tenant for MVP.
3. Transaction commission MVP is Rp0.
4. Daganta MVP is not an escrow.
5. Payment gateway production is not active yet.

## Agent System

1. No agent credit deduction before v0.4D.
2. No create client store before v0.4C.
3. Agent Dashboard v0.4B is read-only.
4. Agent credit ledger must be immutable.
5. AgentClient `tenantId` is unique for MVP.
6. Agent must not lock in UMKM ownership; ownership transfer must be prepared.

## Domain And Release

1. No custom domain mass rollout before beta hardening.
2. Custom domain automation is not core v0.1.
3. Focus on default subdomain before custom domain workflow.

## Milestone Control

1. Every milestone must end with commit checkpoint.
2. Every change must have verification command.
3. Do not jump roadmap milestone without approval.
4. Do not start v0.4D until v0.4C passes verification and is closed.

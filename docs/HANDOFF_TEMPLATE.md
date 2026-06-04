# Handoff Report - [Step Name]

## A. Task Summary

Tuliskan ringkasan singkat task, milestone terkait, dan batas scope yang dikerjakan.

## B. Files Changed

Tuliskan file yang dibuat, diubah, atau dihapus.

## C. Schema Change

Tuliskan apakah ada perubahan schema.

Format:

`No schema change.`

atau

`Schema changed: [brief description].`

## D. Migration Created

Tuliskan apakah ada migration baru.

Format:

`No migration created.`

atau

`Migration created: [migration path].`

## E. Verification Results

Tuliskan command yang dijalankan dan hasilnya.

Contoh:

1. `npx prisma validate` - PASS
2. `npx prisma migrate status` - PASS
3. `npm run build` - PASS

## F. Runtime Smoke Results

Tuliskan hasil smoke test runtime jika dilakukan.

Contoh:

`Not run because this task only changes documentation.`

## G. Git Commit

Tuliskan commit hash dan pesan commit.

Contoh:

`abc1234 docs: add multi-agent development workflow`

## H. Guardrails Checked

Checklist guardrails yang sudah dicek:

1. No production deploy.
2. No db push.
3. No migrate reset.
4. No env changes unless approved.
5. No RLS apply unless approved.
6. Business query remains tenant-scoped.
7. Verification command executed.
8. Commit checkpoint created.

## I. Remaining Risks

Tuliskan risiko tersisa, asumsi, atau hal yang belum diverifikasi.

## J. Recommended Next Action

Tuliskan langkah berikutnya yang paling disarankan.

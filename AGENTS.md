# AGENTS.md — Daganta Project Instructions

## Project Identity

Nama project: Daganta  
Jenis project: Platform Webstore SaaS Multi-Tenant untuk UMKM dan Agen Digital  
Tenant demo utama: Toya Nusantara  
Domain staging: daganta.store  
Domain production: daganta.id  

Daganta bukan sekadar website builder. Daganta adalah platform webstore instan untuk membantu UMKM memiliki toko online mandiri dan membantu agen digital membangun penghasilan berulang melalui pembuatan serta pengelolaan webstore klien.

## Core Positioning

Daganta = Webstore Instan untuk UMKM dan Agen Digital.

Brand keywords:
- mudah
- mandiri
- bertumbuh
- mobile-first
- WhatsApp-first commerce
- multi-tenant
- agent-friendly
- secure by design

## Tech Stack

Gunakan stack berikut:
- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Prisma ORM
- Supabase PostgreSQL
- Supabase Auth
- Supabase Storage
- Vercel
- Modular monolith architecture

Integrasi vendor seperti Dripsender, Mailketing, Payment Gateway, dan Logistics API dibuat sebagai adapter placeholder terlebih dahulu. Jangan hardcode vendor secara langsung ke core business logic.

## Architecture Rules

1. Semua data bisnis wajib memiliki tenantId.
2. Semua query bisnis wajib tenant-scoped.
3. Jangan membuat fitur di luar scope v0.1 tanpa persetujuan.
4. Pisahkan schema.prisma untuk struktur database dan SQL migration untuk RLS/policies.
5. Jangan expose SUPABASE_SERVICE_ROLE_KEY ke frontend.
6. Jangan memasukkan credential asli ke repository.
7. Gunakan .env.example untuk daftar variable.
8. Gunakan audit log untuk perubahan status penting.
9. Payment webhook harus idempotent.
10. Notification job harus memakai queue atau event table, bukan langsung ditembak dari request utama.
11. Custom domain bukan fitur inti v0.1. Fokus dulu pada subdomain bawaan.
12. Tenant resolver harus mendukung subdomain seperti toyanusantara.daganta.store.

## Scope v0.1

Bangun fondasi aman dan ringan:
- project skeleton
- database schema v0.1
- tenant model
- role model
- billing model dasar
- agent credit model dasar
- product model
- order model
- notification event model
- tenant resolver
- dashboard shell
- storefront shell
- seed tenant demo
- dokumentasi teknis awal

Jangan dulu membangun:
- payment gateway production
- logistics production
- custom domain automation
- AI content generator
- marketplace sync
- accounting lengkap
- mobile app native
- affiliate kompleks

## Required Workflow for AI Agent

Sebelum coding:
1. Buat execution plan.
2. Sebutkan file yang akan dibuat atau diubah.
3. Jelaskan alasan perubahan.
4. Tunggu approval user.

Saat coding:
1. Kerjakan kecil-kecil.
2. Jangan mengubah file yang tidak relevan.
3. Jangan menghapus kode tanpa alasan.
4. Jangan membuat package baru tanpa menjelaskan alasannya.
5. Jangan menjalankan command destruktif tanpa izin.

Setelah coding:
1. Jalankan typecheck/build jika memungkinkan.
2. Laporkan file yang berubah.
3. Laporkan error jika ada.
4. Berikan next recommended task.

## Naming Convention

Gunakan bahasa Inggris untuk nama file, folder, model, function, dan variable.

Gunakan bahasa Indonesia untuk copy UI jika ditujukan untuk user Daganta.

Contoh:
- Product
- Order
- Tenant
- AgentCreditLedger
- resolveTenantFromHost
- Dashboard Pesanan
- Kelola Produk
- Saldo Agen

## Security Guardrails

Dilarang:
- commit file .env
- expose service role key
- menyimpan API key vendor dalam plain text tenant settings
- menjalankan reset database production tanpa izin
- membuat query tanpa tenantId untuk data bisnis
- menjalankan migration langsung ke production tanpa review
- menggunakan data asli pelanggan untuk testing

## Definition of Done v0.1

Fondasi v0.1 dianggap selesai jika:
- project Next.js berjalan lokal
- schema Prisma tersedia
- Supabase dev terkoneksi
- tenant demo bisa diseed
- Toya Nusantara tersedia sebagai tenant demo
- dashboard shell tersedia
- storefront shell tersedia
- tenant resolver tersedia
- .env.example aman
- dokumentasi build rules tersedia
- belum ada integrasi vendor production yang dipaksakan
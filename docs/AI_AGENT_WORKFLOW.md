# AI Agent Workflow - Daganta

Dokumen ini menjadi pedoman kerja internal untuk penggunaan banyak AI Agent dalam pengembangan Daganta. Tujuannya adalah menjaga seluruh pekerjaan tetap sinkron dengan roadmap, aman untuk arsitektur multi-tenant, dan tidak saling bertabrakan antar-agent.

## Tujuan Penggunaan Multi-Agent

Penggunaan multi-agent bertujuan untuk:

1. Memisahkan peran strategi produk, implementasi kode, review UX, review dokumentasi, dan analisis risiko.
2. Menjaga roadmap Daganta tetap menjadi sumber kebenaran utama.
3. Mencegah perubahan schema, migration, RLS, environment, atau deployment tanpa approval eksplisit.
4. Memastikan setiap perubahan memiliki execution plan, verification command, commit checkpoint, dan handoff report.
5. Membantu pengembangan berjalan paralel namun tetap terkontrol.

## Role Masing-Masing Agent

### ChatGPT/Aksa

Role utama: product architect, roadmap guardian, dan final reviewer.

Tanggung jawab:

1. Menjaga arah produk tetap sesuai positioning Daganta.
2. Menentukan prioritas roadmap dan batas scope milestone.
3. Menilai apakah suatu usulan fitur boleh masuk milestone berjalan.
4. Melakukan final review sebelum milestone dinyatakan closed.
5. Menjaga konsistensi keputusan produk dalam `docs/DECISION_LOG.md`.

### Codex

Role utama: code implementation, migration, build, dan commit.

Tanggung jawab:

1. Membaca roadmap status dan guardrails sebelum coding.
2. Membuat execution plan sebelum perubahan file.
3. Mengimplementasikan perubahan kode atau dokumentasi sesuai approval.
4. Membuat migration hanya setelah approval eksplisit.
5. Menjalankan verification command yang relevan.
6. Membuat commit checkpoint setelah milestone selesai dan verified.
7. Menyusun handoff report setelah task selesai.

### Claude

Role utama: UX review, copy review, documentation review, dan edge case review.

Tanggung jawab:

1. Meninjau alur UX agar cocok untuk UMKM dan agen digital.
2. Meninjau copy Bahasa Indonesia agar jelas, ramah, dan tidak terlalu teknis.
3. Meninjau dokumentasi agar mudah dipahami agent lain.
4. Mengidentifikasi edge case pada flow pengguna dan status subscription.
5. Memberi masukan tanpa langsung mengubah roadmap atau schema.

### Gemini

Role utama: second opinion, risk analysis, stress test, dan architecture challenge.

Tanggung jawab:

1. Menguji asumsi teknis dan produk dari sudut pandang risiko.
2. Menantang keputusan arsitektur yang berpotensi rapuh.
3. Melakukan stress test konseptual terhadap multi-tenant isolation, billing, agent credit, dan ownership transfer.
4. Memberi second opinion sebelum milestone besar ditutup.
5. Mengidentifikasi potensi regresi, security issue, dan operational risk.

## Aturan Kerja

1. Semua agent wajib membaca `docs/ROADMAP_STATUS.md` sebelum memulai task.
2. Semua agent wajib membaca `docs/GUARDRAILS.md` sebelum mengusulkan perubahan.
3. Tidak boleh coding sebelum execution plan disetujui.
4. Tidak boleh migration sebelum approval eksplisit.
5. Tidak boleh menjalankan `prisma db push`.
6. Tidak boleh menjalankan `prisma migrate reset` tanpa approval eksplisit.
7. Tidak boleh production deploy tanpa approval eksplisit.
8. Semua perubahan harus memiliki verification command.
9. Semua milestone harus berakhir dengan commit checkpoint.
10. Semua perubahan bisnis wajib menjaga tenant scope.
11. Vendor integration harus tetap melalui adapter placeholder sampai roadmap mengizinkan integrasi production.
12. Perubahan environment variable harus diajukan dan disetujui sebelum dilakukan.

## Alur Kerja Standar

1. Task definition
   - Jelaskan tujuan task, batas scope, dan milestone terkait.

2. Audit codebase
   - Periksa file terkait, status git, dokumentasi roadmap, dan guardrails.

3. Execution plan
   - Sebutkan file yang akan dibuat atau diubah.
   - Jelaskan alasan perubahan.
   - Sebutkan verification command.

4. Approval
   - Tunggu approval user sebelum coding atau mengubah file.

5. Implementation
   - Kerjakan perubahan kecil-kecil dan tetap dalam scope.
   - Jangan mengubah file yang tidak relevan.

6. Verification
   - Jalankan command yang relevan.
   - Minimal untuk perubahan umum:
     - `npx prisma validate`
     - `npx prisma migrate status`
     - `npm run build`

7. Commit
   - Buat commit checkpoint setelah perubahan verified.
   - Gunakan pesan commit yang jelas dan scoped.

8. Handoff report
   - Gunakan format `docs/HANDOFF_TEMPLATE.md`.
   - Laporkan file berubah, hasil verifikasi, risiko, dan next action.

9. Final review
   - ChatGPT/Aksa atau reviewer akhir memastikan scope, roadmap, guardrails, dan hasil verifikasi sudah sesuai.

## Single Source of Truth

Dokumen utama yang wajib dirujuk:

1. `docs/ROADMAP_STATUS.md`
2. `docs/DECISION_LOG.md`
3. `docs/GUARDRAILS.md`
4. `docs/AI_AGENT_WORKFLOW.md`
5. `docs/HANDOFF_TEMPLATE.md`

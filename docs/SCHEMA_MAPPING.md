# Dokumentasi Pemetaan Tabel & Relasi SQLite ke Supabase Postgres

Dokumen ini memetakan seluruh tabel, kolom, tipe data, indeks, dan integritas relasional (Foreign Keys) dari `dasbor.db` (SQLite) ke Supabase (PostgreSQL 15+).

## 1. Strategi Konversi Tipe Data
| SQLite Type | PostgreSQL Supabase Type | Keterangan & Alasan Desain |
|---|---|---|
| `INTEGER PRIMARY KEY AUTOINCREMENT` | `BIGSERIAL PRIMARY KEY` | Kompatibilitas skala baris besar dan relasi Foreign Key yang konsisten. |
| `TEXT` (Nama / Singkat) | `VARCHAR(50..255)` | Validasi panjang karakter eksplisit untuk integritas data. |
| `TEXT` (Konten / Markdown / HTML) | `TEXT` | Tanpa batasan arbitrer untuk naskah liputan, rincian SOP, dan deskripsi. |
| `DATETIME` / `CURRENT_TIMESTAMP` | `TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP` | Waktu sadar zona (UTC di database, disajikan dalam WIB / UTC+7 di UI). |
| `BOOLEAN` / `INTEGER` (0/1) | `BOOLEAN DEFAULT TRUE/FALSE` | Tipe data boolean asli Postgres, menggantikan 0/1 SQLite. |
| `REAL` (Angka Desimal / Mata Uang) | `NUMERIC` | Mencegah presisi floating-point drift pada anggaran RAB/LRA dan donasi. |
| `TEXT` (JSON serialized) | `JSONB` | Pengindeksan biner GIN dan query operator `->`, `->>` di Postgres. |

---

## 2. Peta Relasi Antar Tabel (Foreign Keys & Cascade Rules)

### A. Modul Identitas & RBAC
- `roles` (1) ──< `users` (M) via `users.role_id` (`ON DELETE SET NULL`)
- `roles` (1) ──< `role_permissions` (M) via `role_permissions.role_id` (`ON DELETE CASCADE`)
- `permissions` (1) ──< `role_permissions` (M) via `role_permissions.permission_id` (`ON DELETE CASCADE`)
  - *Catatan:* Peran `head`, `admin`, `staff`, `reviewer` dipetakan ke klaim JWT `app_metadata.role` untuk kebijakan RLS.

### B. Modul Kalender Konten & Pengingat
- `content_pillars` (1) ──< `content_themes` (M) via `content_themes.pillar_id` (`ON DELETE CASCADE`)
- `content_pillars` (1) ──< `content_calendar` (M) via `content_calendar.pillar_id` (`ON DELETE SET NULL`)
- `users` (1) ──< `content_calendar` (M) via `content_calendar.assignee_id` (`ON DELETE SET NULL`)
- `content_calendar` (1) ──< `reminders` (M) via `reminders.content_id` (`ON DELETE CASCADE`)

### C. Modul Manajemen Proyek (Kanban)
- `users` (1) ──< `projects` (M) via `projects.owner_id` (`ON DELETE SET NULL`)
- `projects` (1) ──< `project_tasks` (M) via `project_tasks.project_id` (`ON DELETE CASCADE`)
- `users` (1) ──< `project_tasks` (M) via `project_tasks.assignee_id` (`ON DELETE SET NULL`)

### D. Modul Pemantauan Berita & Live Feed
- `news_sources` (1) ──< `news_items` (M) via `news_items.source_id` (`ON DELETE SET NULL`)
- `news_items` (1) ──< `news_bookmarks` (M) via `news_bookmarks.news_id` (`ON DELETE CASCADE`)
- `users` (1) ──< `news_bookmarks` (M) via `news_bookmarks.user_id` (`ON DELETE SET NULL`)
- `news_items` (1) ──< `news_references` (M) via `news_references.news_id` (`ON DELETE CASCADE`)
- `users` (1) ──< `news_references` (M) via `news_references.marked_by_id` (`ON DELETE SET NULL`)
- `content_calendar` (1) ──< `news_references` (M) via `news_references.content_calendar_id` (`ON DELETE SET NULL`)

### E. Modul Insight Konten & Rekomendasi Ide
- `idea_recommendations` (1) ──< `saved_ideas` (M) via `saved_ideas.recommendation_id` (`ON DELETE SET NULL`)
- `content_calendar` (1) ──< `saved_ideas` (M) via `saved_ideas.calendar_id` (`ON DELETE SET NULL`)
- `users` (1) ──< `saved_ideas` (M) via `saved_ideas.user_id` (`ON DELETE SET NULL`)

### F. Modul Laporan Kinerja, RAB & LRA
- `users` (1) ──< `performance_reports` (M) via `performance_reports.generated_by` (`ON DELETE SET NULL`)
- `performance_reports` (1) ──< `performance_rows` (M) via `performance_rows.report_id` (`ON DELETE CASCADE`)
- `performance_reports` (1) ──< `performance_notes` (M) via `performance_notes.report_id` (`ON DELETE SET NULL`)
- `users` (1) ──< `performance_notes` (M) via `performance_notes.created_by` (`ON DELETE SET NULL`)
- `users` (1) ──< `budget_lines` (M) via `budget_lines.owner_id` (`ON DELETE SET NULL`)
- `budget_lines` (1) ──< `budget_revisions` (M) via `budget_revisions.budget_line_id` (`ON DELETE CASCADE`)
- `users` (1) ──< `budget_revisions` (M) via `budget_revisions.changed_by` (`ON DELETE SET NULL`)
- `users` (1) ──< `shared_reports` (M) via `shared_reports.created_by` (`ON DELETE SET NULL`)

### G. Modul Basis Pengetahuan & SOP
- `knowledge_categories` (1) ──< `knowledge_docs` (M) via `knowledge_docs.category_id` (`ON DELETE SET NULL`)
- `knowledge_docs` (1) ──< `doc_sections` (M) via `doc_sections.doc_id` (`ON DELETE CASCADE`)
- `knowledge_docs` (1) ──< `sop_steps` (M) via `sop_steps.doc_id` (`ON DELETE CASCADE`)
- `doc_proposals` (1) ──< `doc_proposal_logs` (M) via `doc_proposal_logs.proposal_id` (`ON DELETE CASCADE`)

### H. Modul Pengaturan & Jejak Audit
- `users` (1) ──< `system_settings` (M) via `system_settings.updated_by` (`ON DELETE SET NULL`)
- `users` (1) ──< `audit_logs` (M) via `audit_logs.user_id` (`ON DELETE SET NULL`)

---

## 3. Matriks Indeks Performa PostgreSQL
Untuk menjamin respons kueri sub-100ms pada Supabase:
1. `users(email)` & `users(role_id)` (B-Tree)
2. `content_calendar(scheduled_at)`, `(status)`, `(channel)` (B-Tree)
3. `reminders(remind_at)`, `(status)` (B-Tree untuk Vercel Cron worker)
4. `metric_snapshots(source, metric_name, period)` (Multi-column Index)
5. `project_tasks(project_id, stage)` (Composite Index untuk Papan Kanban)
6. `news_items(published_at DESC)`, `(is_important)` (B-Tree untuk Live Feed)
7. `audit_logs(user_id)`, `(action)`, `(created_at DESC)` (Time-series audit search)

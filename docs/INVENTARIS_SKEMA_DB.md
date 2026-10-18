# Audit Lengkap Inventaris Tabel, Kolom, dan Relasi (dasbor.db / src/lib/db.ts)

Dokumen ini merupakan hasil audit komprehensif skema database SQLite `dasbor.db` yang diinisialisasi melalui `src/lib/db.ts`.
Total tabel terdaftar: **40 tabel**.

---

## Tabel: `ad_campaigns`

### Kolom (10)
| CID | Nama Kolom | Tipe Data | Not Null | Default Value | Primary Key |
|---|---|---|---|---|---|
| 0 | `id` | `INTEGER` | TIDAK | - | PK (1) |
| 1 | `name` | `TEXT` | YA | - | - |
| 2 | `platform` | `TEXT` | YA | `'Meta'` | - |
| 3 | `objective` | `TEXT` | YA | - | - |
| 4 | `status` | `TEXT` | YA | `'Aktif'` | - |
| 5 | `spend` | `REAL` | YA | - | - |
| 6 | `reach` | `INTEGER` | YA | - | - |
| 7 | `conversions` | `INTEGER` | YA | - | - |
| 8 | `period` | `TEXT` | TIDAK | `'30d'` | - |
| 9 | `created_at` | `DATETIME` | TIDAK | `CURRENT_TIMESTAMP` | - |

*Tidak memiliki relasi Foreign Key keluar.*

---

## Tabel: `annual_reports`

### Kolom (13)
| CID | Nama Kolom | Tipe Data | Not Null | Default Value | Primary Key |
|---|---|---|---|---|---|
| 0 | `id` | `INTEGER` | TIDAK | - | PK (1) |
| 1 | `year` | `INTEGER` | YA | - | - |
| 2 | `theme` | `TEXT` | YA | - | - |
| 3 | `executive_summary` | `TEXT` | YA | - | - |
| 4 | `total_donors` | `INTEGER` | YA | `0` | - |
| 5 | `total_beneficiaries` | `INTEGER` | YA | `0` | - |
| 6 | `total_funds_raised` | `REAL` | YA | `0` | - |
| 7 | `total_funds_distributed` | `REAL` | YA | `0` | - |
| 8 | `milestones` | `TEXT` | TIDAK | - | - |
| 9 | `quarterly_progress` | `TEXT` | TIDAK | - | - |
| 10 | `status` | `TEXT` | YA | `'published'` | - |
| 11 | `created_at` | `DATETIME` | TIDAK | `CURRENT_TIMESTAMP` | - |
| 12 | `updated_at` | `DATETIME` | TIDAK | `CURRENT_TIMESTAMP` | - |

*Tidak memiliki relasi Foreign Key keluar.*

### Indeks (1)
- `sqlite_autoindex_annual_reports_1` (Unique: YA, Origin: `u`)

---

## Tabel: `audit_logs`

### Kolom (10)
| CID | Nama Kolom | Tipe Data | Not Null | Default Value | Primary Key |
|---|---|---|---|---|---|
| 0 | `id` | `INTEGER` | TIDAK | - | PK (1) |
| 1 | `user_id` | `INTEGER` | TIDAK | - | - |
| 2 | `user_name` | `TEXT` | YA | - | - |
| 3 | `user_role` | `TEXT` | YA | - | - |
| 4 | `action` | `TEXT` | YA | - | - |
| 5 | `target` | `TEXT` | YA | - | - |
| 6 | `ip_address` | `TEXT` | TIDAK | - | - |
| 7 | `status` | `TEXT` | YA | `'success'` | - |
| 8 | `details` | `TEXT` | TIDAK | - | - |
| 9 | `created_at` | `DATETIME` | TIDAK | `CURRENT_TIMESTAMP` | - |

### Foreign Keys (1)
| Kolom Asal | Tabel Target | Kolom Target | On Update | On Delete |
|---|---|---|---|---|
| `user_id` | `users` | `id` | `NO ACTION` | `SET NULL` |

---

## Tabel: `budget_lines`

### Kolom (13)
| CID | Nama Kolom | Tipe Data | Not Null | Default Value | Primary Key |
|---|---|---|---|---|---|
| 0 | `id` | `INTEGER` | TIDAK | - | PK (1) |
| 1 | `program` | `TEXT` | YA | - | - |
| 2 | `category` | `TEXT` | YA | - | - |
| 3 | `rab` | `REAL` | YA | - | - |
| 4 | `lra` | `REAL` | YA | - | - |
| 5 | `owner` | `TEXT` | YA | - | - |
| 6 | `owner_id` | `INTEGER` | TIDAK | - | - |
| 7 | `year` | `INTEGER` | YA | - | - |
| 8 | `quarter` | `TEXT` | YA | - | - |
| 9 | `status` | `TEXT` | YA | `'sesuai'` | - |
| 10 | `notes` | `TEXT` | TIDAK | - | - |
| 11 | `created_at` | `DATETIME` | TIDAK | `CURRENT_TIMESTAMP` | - |
| 12 | `updated_at` | `DATETIME` | TIDAK | `CURRENT_TIMESTAMP` | - |

### Foreign Keys (1)
| Kolom Asal | Tabel Target | Kolom Target | On Update | On Delete |
|---|---|---|---|---|
| `owner_id` | `users` | `id` | `NO ACTION` | `SET NULL` |

---

## Tabel: `budget_revisions`

### Kolom (9)
| CID | Nama Kolom | Tipe Data | Not Null | Default Value | Primary Key |
|---|---|---|---|---|---|
| 0 | `id` | `INTEGER` | TIDAK | - | PK (1) |
| 1 | `budget_line_id` | `INTEGER` | YA | - | - |
| 2 | `previous_rab` | `REAL` | YA | - | - |
| 3 | `new_rab` | `REAL` | YA | - | - |
| 4 | `previous_lra` | `REAL` | YA | - | - |
| 5 | `new_lra` | `REAL` | YA | - | - |
| 6 | `change_reason` | `TEXT` | YA | - | - |
| 7 | `changed_by` | `INTEGER` | TIDAK | - | - |
| 8 | `changed_at` | `DATETIME` | TIDAK | `CURRENT_TIMESTAMP` | - |

### Foreign Keys (2)
| Kolom Asal | Tabel Target | Kolom Target | On Update | On Delete |
|---|---|---|---|---|
| `changed_by` | `users` | `id` | `NO ACTION` | `SET NULL` |
| `budget_line_id` | `budget_lines` | `id` | `NO ACTION` | `CASCADE` |

---

## Tabel: `content_calendar`

### Kolom (12)
| CID | Nama Kolom | Tipe Data | Not Null | Default Value | Primary Key |
|---|---|---|---|---|---|
| 0 | `id` | `INTEGER` | TIDAK | - | PK (1) |
| 1 | `title` | `TEXT` | YA | - | - |
| 2 | `scheduled_at` | `DATETIME` | YA | - | - |
| 3 | `channel` | `TEXT` | YA | - | - |
| 4 | `pillar_id` | `INTEGER` | TIDAK | - | - |
| 5 | `assignee_id` | `INTEGER` | TIDAK | - | - |
| 6 | `status` | `TEXT` | YA | `'draft'` | - |
| 7 | `remind_before` | `INTEGER` | TIDAK | `0` | - |
| 8 | `created_at` | `DATETIME` | TIDAK | `CURRENT_TIMESTAMP` | - |
| 9 | `content_type` | `TEXT` | TIDAK | - | - |
| 10 | `sub_type` | `TEXT` | TIDAK | - | - |
| 11 | `request_bidang` | `TEXT` | TIDAK | - | - |

### Foreign Keys (2)
| Kolom Asal | Tabel Target | Kolom Target | On Update | On Delete |
|---|---|---|---|---|
| `assignee_id` | `users` | `id` | `NO ACTION` | `SET NULL` |
| `pillar_id` | `content_pillars` | `id` | `NO ACTION` | `SET NULL` |

---

## Tabel: `content_gaps`

### Kolom (10)
| CID | Nama Kolom | Tipe Data | Not Null | Default Value | Primary Key |
|---|---|---|---|---|---|
| 0 | `id` | `INTEGER` | TIDAK | - | PK (1) |
| 1 | `gap_topic` | `TEXT` | YA | - | - |
| 2 | `target_pillar` | `TEXT` | YA | - | - |
| 3 | `suggested_format` | `TEXT` | YA | - | - |
| 4 | `potential_audience` | `TEXT` | YA | - | - |
| 5 | `reason` | `TEXT` | YA | - | - |
| 6 | `urgency` | `TEXT` | YA | `'Sedang'` | - |
| 7 | `is_adopted` | `BOOLEAN` | TIDAK | `0` | - |
| 8 | `adopted_at` | `DATETIME` | TIDAK | - | - |
| 9 | `created_at` | `DATETIME` | TIDAK | `CURRENT_TIMESTAMP` | - |

*Tidak memiliki relasi Foreign Key keluar.*

---

## Tabel: `content_pillars`

### Kolom (4)
| CID | Nama Kolom | Tipe Data | Not Null | Default Value | Primary Key |
|---|---|---|---|---|---|
| 0 | `id` | `INTEGER` | TIDAK | - | PK (1) |
| 1 | `name` | `TEXT` | YA | - | - |
| 2 | `description` | `TEXT` | TIDAK | - | - |
| 3 | `color` | `TEXT` | YA | `'#2563eb'` | - |

*Tidak memiliki relasi Foreign Key keluar.*

---

## Tabel: `content_themes`

### Kolom (4)
| CID | Nama Kolom | Tipe Data | Not Null | Default Value | Primary Key |
|---|---|---|---|---|---|
| 0 | `id` | `INTEGER` | TIDAK | - | PK (1) |
| 1 | `pillar_id` | `INTEGER` | YA | - | - |
| 2 | `name` | `TEXT` | YA | - | - |
| 3 | `description` | `TEXT` | TIDAK | - | - |

### Foreign Keys (1)
| Kolom Asal | Tabel Target | Kolom Target | On Update | On Delete |
|---|---|---|---|---|
| `pillar_id` | `content_pillars` | `id` | `NO ACTION` | `CASCADE` |

---

## Tabel: `dam_shares`

### Kolom (9)
| CID | Nama Kolom | Tipe Data | Not Null | Default Value | Primary Key |
|---|---|---|---|---|---|
| 0 | `id` | `INTEGER` | TIDAK | - | PK (1) |
| 1 | `name` | `TEXT` | YA | - | - |
| 2 | `smb_path` | `TEXT` | YA | - | - |
| 3 | `description` | `TEXT` | TIDAK | - | - |
| 4 | `total_assets` | `INTEGER` | TIDAK | `0` | - |
| 5 | `total_size` | `TEXT` | TIDAK | `'0 MB'` | - |
| 6 | `allowed_roles` | `TEXT` | TIDAK | `'["head","admin","staff"]'` | - |
| 7 | `last_indexed_at` | `DATETIME` | TIDAK | - | - |
| 8 | `created_at` | `DATETIME` | TIDAK | `CURRENT_TIMESTAMP` | - |

*Tidak memiliki relasi Foreign Key keluar.*

### Indeks (1)
- `sqlite_autoindex_dam_shares_1` (Unique: YA, Origin: `u`)

---

## Tabel: `doc_proposal_logs`

### Kolom (9)
| CID | Nama Kolom | Tipe Data | Not Null | Default Value | Primary Key |
|---|---|---|---|---|---|
| 0 | `id` | `INTEGER` | TIDAK | - | PK (1) |
| 1 | `proposal_id` | `INTEGER` | YA | - | - |
| 2 | `action` | `TEXT` | YA | - | - |
| 3 | `previous_status` | `TEXT` | TIDAK | - | - |
| 4 | `new_status` | `TEXT` | YA | - | - |
| 5 | `actor_name` | `TEXT` | YA | - | - |
| 6 | `actor_role` | `TEXT` | YA | - | - |
| 7 | `notes` | `TEXT` | TIDAK | - | - |
| 8 | `created_at` | `DATETIME` | TIDAK | `CURRENT_TIMESTAMP` | - |

### Foreign Keys (1)
| Kolom Asal | Tabel Target | Kolom Target | On Update | On Delete |
|---|---|---|---|---|
| `proposal_id` | `doc_proposals` | `id` | `NO ACTION` | `CASCADE` |

---

## Tabel: `doc_proposals`

### Kolom (18)
| CID | Nama Kolom | Tipe Data | Not Null | Default Value | Primary Key |
|---|---|---|---|---|---|
| 0 | `id` | `INTEGER` | TIDAK | - | PK (1) |
| 1 | `proposal_code` | `TEXT` | YA | - | - |
| 2 | `type` | `TEXT` | YA | - | - |
| 3 | `title` | `TEXT` | YA | - | - |
| 4 | `category` | `TEXT` | YA | - | - |
| 5 | `target_doc_code` | `TEXT` | TIDAK | - | - |
| 6 | `target_doc_title` | `TEXT` | TIDAK | - | - |
| 7 | `submitter_name` | `TEXT` | YA | - | - |
| 8 | `submitter_role` | `TEXT` | YA | `'staff'` | - |
| 9 | `urgency` | `TEXT` | YA | `'normal'` | - |
| 10 | `reason` | `TEXT` | YA | - | - |
| 11 | `suggested_content` | `TEXT` | YA | - | - |
| 12 | `status` | `TEXT` | YA | `'menunggu_tinjauan'` | - |
| 13 | `reviewed_by` | `TEXT` | TIDAK | - | - |
| 14 | `reviewed_at` | `DATETIME` | TIDAK | - | - |
| 15 | `review_notes` | `TEXT` | TIDAK | - | - |
| 16 | `created_at` | `DATETIME` | TIDAK | `CURRENT_TIMESTAMP` | - |
| 17 | `updated_at` | `DATETIME` | TIDAK | `CURRENT_TIMESTAMP` | - |

*Tidak memiliki relasi Foreign Key keluar.*

### Indeks (1)
- `sqlite_autoindex_doc_proposals_1` (Unique: YA, Origin: `u`)

---

## Tabel: `doc_sections`

### Kolom (7)
| CID | Nama Kolom | Tipe Data | Not Null | Default Value | Primary Key |
|---|---|---|---|---|---|
| 0 | `id` | `INTEGER` | TIDAK | - | PK (1) |
| 1 | `doc_id` | `INTEGER` | YA | - | - |
| 2 | `position` | `INTEGER` | YA | `1` | - |
| 3 | `heading` | `TEXT` | YA | - | - |
| 4 | `content` | `TEXT` | YA | - | - |
| 5 | `checklist` | `TEXT` | TIDAK | - | - |
| 6 | `notes` | `TEXT` | TIDAK | - | - |

### Foreign Keys (1)
| Kolom Asal | Tabel Target | Kolom Target | On Update | On Delete |
|---|---|---|---|---|
| `doc_id` | `knowledge_docs` | `id` | `NO ACTION` | `CASCADE` |

---

## Tabel: `donations`

### Kolom (9)
| CID | Nama Kolom | Tipe Data | Not Null | Default Value | Primary Key |
|---|---|---|---|---|---|
| 0 | `id` | `INTEGER` | TIDAK | - | PK (1) |
| 1 | `campaign_name` | `TEXT` | YA | - | - |
| 2 | `platform` | `TEXT` | YA | - | - |
| 3 | `amount` | `REAL` | YA | - | - |
| 4 | `donors_count` | `INTEGER` | YA | - | - |
| 5 | `target_amount` | `REAL` | YA | - | - |
| 6 | `period` | `TEXT` | TIDAK | `'30d'` | - |
| 7 | `status` | `TEXT` | TIDAK | `'active'` | - |
| 8 | `created_at` | `DATETIME` | TIDAK | `CURRENT_TIMESTAMP` | - |

*Tidak memiliki relasi Foreign Key keluar.*

---

## Tabel: `idea_recommendations`

### Kolom (10)
| CID | Nama Kolom | Tipe Data | Not Null | Default Value | Primary Key |
|---|---|---|---|---|---|
| 0 | `id` | `INTEGER` | TIDAK | - | PK (1) |
| 1 | `hook_title` | `TEXT` | YA | - | - |
| 2 | `source_context` | `TEXT` | YA | - | - |
| 3 | `pillar` | `TEXT` | YA | - | - |
| 4 | `suggested_channel` | `TEXT` | YA | - | - |
| 5 | `expected_impact` | `TEXT` | YA | - | - |
| 6 | `rationale` | `TEXT` | YA | - | - |
| 7 | `key_points` | `TEXT` | TIDAK | - | - |
| 8 | `is_skipped` | `BOOLEAN` | TIDAK | `0` | - |
| 9 | `created_at` | `DATETIME` | TIDAK | `CURRENT_TIMESTAMP` | - |

*Tidak memiliki relasi Foreign Key keluar.*

---

## Tabel: `integration_sync_jobs`

### Kolom (9)
| CID | Nama Kolom | Tipe Data | Not Null | Default Value | Primary Key |
|---|---|---|---|---|---|
| 0 | `id` | `INTEGER` | TIDAK | - | PK (1) |
| 1 | `service_key` | `TEXT` | YA | - | - |
| 2 | `target_object` | `TEXT` | YA | - | - |
| 3 | `status` | `TEXT` | YA | `'pending'` | - |
| 4 | `items_processed` | `INTEGER` | TIDAK | `0` | - |
| 5 | `details` | `TEXT` | TIDAK | - | - |
| 6 | `triggered_by` | `TEXT` | TIDAK | `'system'` | - |
| 7 | `created_at` | `DATETIME` | TIDAK | `CURRENT_TIMESTAMP` | - |
| 8 | `finished_at` | `DATETIME` | TIDAK | - | - |

*Tidak memiliki relasi Foreign Key keluar.*

---

## Tabel: `knowledge_categories`

### Kolom (6)
| CID | Nama Kolom | Tipe Data | Not Null | Default Value | Primary Key |
|---|---|---|---|---|---|
| 0 | `id` | `INTEGER` | TIDAK | - | PK (1) |
| 1 | `name` | `TEXT` | YA | - | - |
| 2 | `slug` | `TEXT` | YA | - | - |
| 3 | `description` | `TEXT` | TIDAK | - | - |
| 4 | `icon` | `TEXT` | TIDAK | - | - |
| 5 | `color` | `TEXT` | TIDAK | `'#2563eb'` | - |

*Tidak memiliki relasi Foreign Key keluar.*

### Indeks (2)
- `sqlite_autoindex_knowledge_categories_2` (Unique: YA, Origin: `u`)
- `sqlite_autoindex_knowledge_categories_1` (Unique: YA, Origin: `u`)

---

## Tabel: `knowledge_docs`

### Kolom (15)
| CID | Nama Kolom | Tipe Data | Not Null | Default Value | Primary Key |
|---|---|---|---|---|---|
| 0 | `id` | `INTEGER` | TIDAK | - | PK (1) |
| 1 | `code` | `TEXT` | YA | - | - |
| 2 | `title` | `TEXT` | YA | - | - |
| 3 | `category` | `TEXT` | YA | - | - |
| 4 | `description` | `TEXT` | YA | - | - |
| 5 | `version` | `TEXT` | YA | `'v1.0'` | - |
| 6 | `author` | `TEXT` | YA | - | - |
| 7 | `access_role` | `TEXT` | YA | `'all'` | - |
| 8 | `read_time` | `TEXT` | TIDAK | `'5 menit'` | - |
| 9 | `download_url` | `TEXT` | TIDAK | - | - |
| 10 | `related_codes` | `TEXT` | TIDAK | - | - |
| 11 | `is_archived` | `BOOLEAN` | TIDAK | `0` | - |
| 12 | `created_at` | `DATETIME` | TIDAK | `CURRENT_TIMESTAMP` | - |
| 13 | `updated_at` | `DATETIME` | TIDAK | `CURRENT_TIMESTAMP` | - |
| 14 | `category_id` | `INTEGER` | TIDAK | - | - |

*Tidak memiliki relasi Foreign Key keluar.*

### Indeks (1)
- `sqlite_autoindex_knowledge_docs_1` (Unique: YA, Origin: `u`)

---

## Tabel: `metric_snapshots`

### Kolom (8)
| CID | Nama Kolom | Tipe Data | Not Null | Default Value | Primary Key |
|---|---|---|---|---|---|
| 0 | `id` | `INTEGER` | TIDAK | - | PK (1) |
| 1 | `source` | `TEXT` | YA | - | - |
| 2 | `channel` | `TEXT` | TIDAK | - | - |
| 3 | `period` | `TEXT` | YA | `'30d'` | - |
| 4 | `metric_name` | `TEXT` | YA | - | - |
| 5 | `metric_value` | `REAL` | YA | - | - |
| 6 | `delta` | `REAL` | TIDAK | `0` | - |
| 7 | `created_at` | `DATETIME` | TIDAK | `CURRENT_TIMESTAMP` | - |

*Tidak memiliki relasi Foreign Key keluar.*

---

## Tabel: `news_bookmarks`

### Kolom (5)
| CID | Nama Kolom | Tipe Data | Not Null | Default Value | Primary Key |
|---|---|---|---|---|---|
| 0 | `id` | `INTEGER` | TIDAK | - | PK (1) |
| 1 | `news_id` | `INTEGER` | YA | - | - |
| 2 | `user_id` | `INTEGER` | TIDAK | - | - |
| 3 | `notes` | `TEXT` | TIDAK | - | - |
| 4 | `created_at` | `DATETIME` | TIDAK | `CURRENT_TIMESTAMP` | - |

### Foreign Keys (2)
| Kolom Asal | Tabel Target | Kolom Target | On Update | On Delete |
|---|---|---|---|---|
| `user_id` | `users` | `id` | `NO ACTION` | `SET NULL` |
| `news_id` | `news_items` | `id` | `NO ACTION` | `CASCADE` |

### Indeks (1)
- `sqlite_autoindex_news_bookmarks_1` (Unique: YA, Origin: `u`)

---

## Tabel: `news_items`

### Kolom (15)
| CID | Nama Kolom | Tipe Data | Not Null | Default Value | Primary Key |
|---|---|---|---|---|---|
| 0 | `id` | `INTEGER` | TIDAK | - | PK (1) |
| 1 | `source_id` | `INTEGER` | TIDAK | - | - |
| 2 | `title` | `TEXT` | YA | - | - |
| 3 | `source_type` | `TEXT` | YA | - | - |
| 4 | `source_name` | `TEXT` | YA | - | - |
| 5 | `url` | `TEXT` | YA | - | - |
| 6 | `published_at` | `DATETIME` | YA | - | - |
| 7 | `summary` | `TEXT` | YA | - | - |
| 8 | `category` | `TEXT` | YA | - | - |
| 9 | `is_curated` | `BOOLEAN` | TIDAK | `1` | - |
| 10 | `is_important` | `BOOLEAN` | TIDAK | `0` | - |
| 11 | `channel_handle` | `TEXT` | TIDAK | - | - |
| 12 | `is_read` | `BOOLEAN` | TIDAK | `0` | - |
| 13 | `read_at` | `DATETIME` | TIDAK | - | - |
| 14 | `created_at` | `DATETIME` | TIDAK | `CURRENT_TIMESTAMP` | - |

### Foreign Keys (1)
| Kolom Asal | Tabel Target | Kolom Target | On Update | On Delete |
|---|---|---|---|---|
| `source_id` | `news_sources` | `id` | `NO ACTION` | `SET NULL` |

### Indeks (1)
- `sqlite_autoindex_news_items_1` (Unique: YA, Origin: `u`)

---

## Tabel: `news_references`

### Kolom (6)
| CID | Nama Kolom | Tipe Data | Not Null | Default Value | Primary Key |
|---|---|---|---|---|---|
| 0 | `id` | `INTEGER` | TIDAK | - | PK (1) |
| 1 | `news_id` | `INTEGER` | YA | - | - |
| 2 | `marked_by_id` | `INTEGER` | TIDAK | - | - |
| 3 | `content_calendar_id` | `INTEGER` | TIDAK | - | - |
| 4 | `reason` | `TEXT` | TIDAK | - | - |
| 5 | `created_at` | `DATETIME` | TIDAK | `CURRENT_TIMESTAMP` | - |

### Foreign Keys (3)
| Kolom Asal | Tabel Target | Kolom Target | On Update | On Delete |
|---|---|---|---|---|
| `content_calendar_id` | `content_calendar` | `id` | `NO ACTION` | `SET NULL` |
| `marked_by_id` | `users` | `id` | `NO ACTION` | `SET NULL` |
| `news_id` | `news_items` | `id` | `NO ACTION` | `CASCADE` |

---

## Tabel: `news_sources`

### Kolom (9)
| CID | Nama Kolom | Tipe Data | Not Null | Default Value | Primary Key |
|---|---|---|---|---|---|
| 0 | `id` | `INTEGER` | TIDAK | - | PK (1) |
| 1 | `name` | `TEXT` | YA | - | - |
| 2 | `type` | `TEXT` | YA | - | - |
| 3 | `url_or_handle` | `TEXT` | YA | - | - |
| 4 | `category` | `TEXT` | YA | - | - |
| 5 | `is_active` | `BOOLEAN` | YA | `1` | - |
| 6 | `last_synced` | `DATETIME` | TIDAK | - | - |
| 7 | `unread_count` | `INTEGER` | TIDAK | `0` | - |
| 8 | `created_at` | `DATETIME` | TIDAK | `CURRENT_TIMESTAMP` | - |

*Tidak memiliki relasi Foreign Key keluar.*

---

## Tabel: `performance_notes`

### Kolom (9)
| CID | Nama Kolom | Tipe Data | Not Null | Default Value | Primary Key |
|---|---|---|---|---|---|
| 0 | `id` | `INTEGER` | TIDAK | - | PK (1) |
| 1 | `report_id` | `INTEGER` | TIDAK | - | - |
| 2 | `title` | `TEXT` | YA | - | - |
| 3 | `body` | `TEXT` | TIDAK | - | - |
| 4 | `channel` | `TEXT` | TIDAK | - | - |
| 5 | `period` | `TEXT` | TIDAK | - | - |
| 6 | `meta` | `TEXT` | TIDAK | - | - |
| 7 | `created_by` | `INTEGER` | TIDAK | - | - |
| 8 | `created_at` | `DATETIME` | TIDAK | `CURRENT_TIMESTAMP` | - |

### Foreign Keys (2)
| Kolom Asal | Tabel Target | Kolom Target | On Update | On Delete |
|---|---|---|---|---|
| `created_by` | `users` | `id` | `NO ACTION` | `SET NULL` |
| `report_id` | `performance_reports` | `id` | `NO ACTION` | `SET NULL` |

---

## Tabel: `performance_reports`

### Kolom (8)
| CID | Nama Kolom | Tipe Data | Not Null | Default Value | Primary Key |
|---|---|---|---|---|---|
| 0 | `id` | `INTEGER` | TIDAK | - | PK (1) |
| 1 | `title` | `TEXT` | YA | - | - |
| 2 | `period` | `TEXT` | YA | `'30d'` | - |
| 3 | `start_date` | `DATE` | TIDAK | - | - |
| 4 | `end_date` | `DATE` | TIDAK | - | - |
| 5 | `generated_by` | `INTEGER` | TIDAK | - | - |
| 6 | `notes` | `TEXT` | TIDAK | - | - |
| 7 | `created_at` | `DATETIME` | TIDAK | `CURRENT_TIMESTAMP` | - |

### Foreign Keys (1)
| Kolom Asal | Tabel Target | Kolom Target | On Update | On Delete |
|---|---|---|---|---|
| `generated_by` | `users` | `id` | `NO ACTION` | `SET NULL` |

---

## Tabel: `performance_rows`

### Kolom (9)
| CID | Nama Kolom | Tipe Data | Not Null | Default Value | Primary Key |
|---|---|---|---|---|---|
| 0 | `id` | `INTEGER` | TIDAK | - | PK (1) |
| 1 | `report_id` | `INTEGER` | TIDAK | - | - |
| 2 | `channel` | `TEXT` | YA | - | - |
| 3 | `period` | `TEXT` | YA | `'30d'` | - |
| 4 | `reach` | `INTEGER` | YA | `0` | - |
| 5 | `engagement` | `INTEGER` | YA | `0` | - |
| 6 | `conversions` | `INTEGER` | YA | `0` | - |
| 7 | `delta` | `REAL` | TIDAK | `0` | - |
| 8 | `created_at` | `DATETIME` | TIDAK | `CURRENT_TIMESTAMP` | - |

### Foreign Keys (1)
| Kolom Asal | Tabel Target | Kolom Target | On Update | On Delete |
|---|---|---|---|---|
| `report_id` | `performance_reports` | `id` | `NO ACTION` | `CASCADE` |

---

## Tabel: `permissions`

### Kolom (6)
| CID | Nama Kolom | Tipe Data | Not Null | Default Value | Primary Key |
|---|---|---|---|---|---|
| 0 | `id` | `INTEGER` | TIDAK | - | PK (1) |
| 1 | `key` | `TEXT` | YA | - | - |
| 2 | `label` | `TEXT` | YA | - | - |
| 3 | `description` | `TEXT` | TIDAK | - | - |
| 4 | `module` | `TEXT` | YA | - | - |
| 5 | `created_at` | `DATETIME` | TIDAK | `CURRENT_TIMESTAMP` | - |

*Tidak memiliki relasi Foreign Key keluar.*

### Indeks (1)
- `sqlite_autoindex_permissions_1` (Unique: YA, Origin: `u`)

---

## Tabel: `project_tasks`

### Kolom (10)
| CID | Nama Kolom | Tipe Data | Not Null | Default Value | Primary Key |
|---|---|---|---|---|---|
| 0 | `id` | `INTEGER` | TIDAK | - | PK (1) |
| 1 | `project_id` | `INTEGER` | YA | - | - |
| 2 | `title` | `TEXT` | YA | - | - |
| 3 | `stage` | `TEXT` | YA | `'todo'` | - |
| 4 | `assignee` | `TEXT` | YA | - | - |
| 5 | `assignee_id` | `INTEGER` | TIDAK | - | - |
| 6 | `due_date` | `DATE` | YA | - | - |
| 7 | `priority` | `TEXT` | YA | `'Sedang'` | - |
| 8 | `created_at` | `DATETIME` | TIDAK | `CURRENT_TIMESTAMP` | - |
| 9 | `position` | `INTEGER` | TIDAK | `0` | - |

### Foreign Keys (2)
| Kolom Asal | Tabel Target | Kolom Target | On Update | On Delete |
|---|---|---|---|---|
| `assignee_id` | `users` | `id` | `NO ACTION` | `SET NULL` |
| `project_id` | `projects` | `id` | `NO ACTION` | `CASCADE` |

---

## Tabel: `projects`

### Kolom (9)
| CID | Nama Kolom | Tipe Data | Not Null | Default Value | Primary Key |
|---|---|---|---|---|---|
| 0 | `id` | `INTEGER` | TIDAK | - | PK (1) |
| 1 | `name` | `TEXT` | YA | - | - |
| 2 | `owner` | `TEXT` | YA | - | - |
| 3 | `owner_id` | `INTEGER` | TIDAK | - | - |
| 4 | `start_date` | `DATE` | YA | - | - |
| 5 | `end_date` | `DATE` | YA | - | - |
| 6 | `progress` | `INTEGER` | YA | `0` | - |
| 7 | `status` | `TEXT` | YA | `'active'` | - |
| 8 | `created_at` | `DATETIME` | TIDAK | `CURRENT_TIMESTAMP` | - |

### Foreign Keys (1)
| Kolom Asal | Tabel Target | Kolom Target | On Update | On Delete |
|---|---|---|---|---|
| `owner_id` | `users` | `id` | `NO ACTION` | `SET NULL` |

---

## Tabel: `reminders`

### Kolom (11)
| CID | Nama Kolom | Tipe Data | Not Null | Default Value | Primary Key |
|---|---|---|---|---|---|
| 0 | `id` | `INTEGER` | TIDAK | - | PK (1) |
| 1 | `content_id` | `INTEGER` | TIDAK | - | - |
| 2 | `task_id` | `INTEGER` | TIDAK | - | - |
| 3 | `remind_at` | `DATETIME` | YA | - | - |
| 4 | `is_sent` | `BOOLEAN` | TIDAK | `0` | - |
| 5 | `title` | `TEXT` | TIDAK | `''` | - |
| 6 | `message` | `TEXT` | TIDAK | - | - |
| 7 | `channel` | `TEXT` | TIDAK | `'in_app'` | - |
| 8 | `sent_at` | `DATETIME` | TIDAK | - | - |
| 9 | `status` | `TEXT` | TIDAK | `'pending'` | - |
| 10 | `created_at` | `DATETIME` | TIDAK | `CURRENT_TIMESTAMP` | - |

### Foreign Keys (1)
| Kolom Asal | Tabel Target | Kolom Target | On Update | On Delete |
|---|---|---|---|---|
| `content_id` | `content_calendar` | `id` | `NO ACTION` | `CASCADE` |

---

## Tabel: `role_permissions`

### Kolom (5)
| CID | Nama Kolom | Tipe Data | Not Null | Default Value | Primary Key |
|---|---|---|---|---|---|
| 0 | `id` | `INTEGER` | TIDAK | - | PK (1) |
| 1 | `role_id` | `INTEGER` | YA | - | - |
| 2 | `permission_id` | `INTEGER` | YA | - | - |
| 3 | `granted` | `BOOLEAN` | YA | `1` | - |
| 4 | `created_at` | `DATETIME` | TIDAK | `CURRENT_TIMESTAMP` | - |

### Foreign Keys (2)
| Kolom Asal | Tabel Target | Kolom Target | On Update | On Delete |
|---|---|---|---|---|
| `permission_id` | `permissions` | `id` | `NO ACTION` | `CASCADE` |
| `role_id` | `roles` | `id` | `NO ACTION` | `CASCADE` |

### Indeks (1)
- `sqlite_autoindex_role_permissions_1` (Unique: YA, Origin: `u`)

---

## Tabel: `roles`

### Kolom (3)
| CID | Nama Kolom | Tipe Data | Not Null | Default Value | Primary Key |
|---|---|---|---|---|---|
| 0 | `id` | `INTEGER` | TIDAK | - | PK (1) |
| 1 | `name` | `TEXT` | YA | - | - |
| 2 | `permissions` | `TEXT` | YA | - | - |

*Tidak memiliki relasi Foreign Key keluar.*

### Indeks (1)
- `sqlite_autoindex_roles_1` (Unique: YA, Origin: `u`)

---

## Tabel: `saved_ideas`

### Kolom (12)
| CID | Nama Kolom | Tipe Data | Not Null | Default Value | Primary Key |
|---|---|---|---|---|---|
| 0 | `id` | `INTEGER` | TIDAK | - | PK (1) |
| 1 | `recommendation_id` | `INTEGER` | TIDAK | - | - |
| 2 | `hook_title` | `TEXT` | YA | - | - |
| 3 | `suggested_channel` | `TEXT` | YA | - | - |
| 4 | `pillar` | `TEXT` | YA | - | - |
| 5 | `rationale` | `TEXT` | TIDAK | - | - |
| 6 | `key_points` | `TEXT` | TIDAK | - | - |
| 7 | `status` | `TEXT` | YA | `'tersimpan'` | - |
| 8 | `calendar_id` | `INTEGER` | TIDAK | - | - |
| 9 | `user_id` | `INTEGER` | TIDAK | - | - |
| 10 | `created_at` | `DATETIME` | TIDAK | `CURRENT_TIMESTAMP` | - |
| 11 | `updated_at` | `DATETIME` | TIDAK | `CURRENT_TIMESTAMP` | - |

### Foreign Keys (3)
| Kolom Asal | Tabel Target | Kolom Target | On Update | On Delete |
|---|---|---|---|---|
| `user_id` | `users` | `id` | `NO ACTION` | `SET NULL` |
| `calendar_id` | `content_calendar` | `id` | `NO ACTION` | `SET NULL` |
| `recommendation_id` | `idea_recommendations` | `id` | `NO ACTION` | `SET NULL` |

---

## Tabel: `shared_reports`

### Kolom (15)
| CID | Nama Kolom | Tipe Data | Not Null | Default Value | Primary Key |
|---|---|---|---|---|---|
| 0 | `id` | `INTEGER` | TIDAK | - | PK (1) |
| 1 | `share_token` | `TEXT` | YA | - | - |
| 2 | `report_type` | `TEXT` | YA | - | - |
| 3 | `title` | `TEXT` | YA | - | - |
| 4 | `target_recipient` | `TEXT` | TIDAK | - | - |
| 5 | `recipient_channel` | `TEXT` | YA | `'link'` | - |
| 6 | `download_url` | `TEXT` | YA | - | - |
| 7 | `year` | `INTEGER` | TIDAK | - | - |
| 8 | `period` | `TEXT` | TIDAK | - | - |
| 9 | `expires_at` | `DATETIME` | TIDAK | - | - |
| 10 | `access_count` | `INTEGER` | TIDAK | `0` | - |
| 11 | `last_accessed_at` | `DATETIME` | TIDAK | - | - |
| 12 | `created_by` | `INTEGER` | TIDAK | - | - |
| 13 | `notes` | `TEXT` | TIDAK | - | - |
| 14 | `created_at` | `DATETIME` | TIDAK | `CURRENT_TIMESTAMP` | - |

### Foreign Keys (1)
| Kolom Asal | Tabel Target | Kolom Target | On Update | On Delete |
|---|---|---|---|---|
| `created_by` | `users` | `id` | `NO ACTION` | `SET NULL` |

### Indeks (1)
- `sqlite_autoindex_shared_reports_1` (Unique: YA, Origin: `u`)

---

## Tabel: `sop_steps`

### Kolom (9)
| CID | Nama Kolom | Tipe Data | Not Null | Default Value | Primary Key |
|---|---|---|---|---|---|
| 0 | `id` | `INTEGER` | TIDAK | - | PK (1) |
| 1 | `doc_id` | `INTEGER` | YA | - | - |
| 2 | `step_number` | `INTEGER` | YA | - | - |
| 3 | `phase` | `TEXT` | YA | - | - |
| 4 | `title` | `TEXT` | YA | - | - |
| 5 | `actor` | `TEXT` | YA | - | - |
| 6 | `action` | `TEXT` | YA | - | - |
| 7 | `output` | `TEXT` | YA | - | - |
| 8 | `sla_time` | `TEXT` | TIDAK | - | - |

### Foreign Keys (1)
| Kolom Asal | Tabel Target | Kolom Target | On Update | On Delete |
|---|---|---|---|---|
| `doc_id` | `knowledge_docs` | `id` | `NO ACTION` | `CASCADE` |

---

## Tabel: `system_integrations`

### Kolom (10)
| CID | Nama Kolom | Tipe Data | Not Null | Default Value | Primary Key |
|---|---|---|---|---|---|
| 0 | `id` | `INTEGER` | TIDAK | - | PK (1) |
| 1 | `service_key` | `TEXT` | YA | - | - |
| 2 | `name` | `TEXT` | YA | - | - |
| 3 | `category` | `TEXT` | YA | - | - |
| 4 | `status` | `TEXT` | YA | `'disconnected'` | - |
| 5 | `endpoint` | `TEXT` | TIDAK | - | - |
| 6 | `config_json` | `TEXT` | TIDAK | - | - |
| 7 | `last_sync_at` | `DATETIME` | TIDAK | - | - |
| 8 | `last_status_message` | `TEXT` | TIDAK | - | - |
| 9 | `updated_at` | `DATETIME` | TIDAK | `CURRENT_TIMESTAMP` | - |

*Tidak memiliki relasi Foreign Key keluar.*

### Indeks (1)
- `sqlite_autoindex_system_integrations_1` (Unique: YA, Origin: `u`)

---

## Tabel: `system_settings`

### Kolom (7)
| CID | Nama Kolom | Tipe Data | Not Null | Default Value | Primary Key |
|---|---|---|---|---|---|
| 0 | `id` | `INTEGER` | TIDAK | - | PK (1) |
| 1 | `key` | `TEXT` | YA | - | - |
| 2 | `value` | `TEXT` | YA | - | - |
| 3 | `category` | `TEXT` | YA | `'general'` | - |
| 4 | `description` | `TEXT` | TIDAK | - | - |
| 5 | `updated_by` | `INTEGER` | TIDAK | - | - |
| 6 | `updated_at` | `DATETIME` | TIDAK | `CURRENT_TIMESTAMP` | - |

### Foreign Keys (1)
| Kolom Asal | Tabel Target | Kolom Target | On Update | On Delete |
|---|---|---|---|---|
| `updated_by` | `users` | `id` | `NO ACTION` | `SET NULL` |

### Indeks (1)
- `sqlite_autoindex_system_settings_1` (Unique: YA, Origin: `u`)

---

## Tabel: `top_pages`

### Kolom (5)
| CID | Nama Kolom | Tipe Data | Not Null | Default Value | Primary Key |
|---|---|---|---|---|---|
| 0 | `id` | `INTEGER` | TIDAK | - | PK (1) |
| 1 | `path` | `TEXT` | YA | - | - |
| 2 | `views` | `INTEGER` | YA | - | - |
| 3 | `avg_time` | `TEXT` | YA | - | - |
| 4 | `period` | `TEXT` | TIDAK | `'30d'` | - |

*Tidak memiliki relasi Foreign Key keluar.*

---

## Tabel: `trending_topics`

### Kolom (9)
| CID | Nama Kolom | Tipe Data | Not Null | Default Value | Primary Key |
|---|---|---|---|---|---|
| 0 | `id` | `INTEGER` | TIDAK | - | PK (1) |
| 1 | `rank` | `INTEGER` | YA | - | - |
| 2 | `topic` | `TEXT` | YA | - | - |
| 3 | `category` | `TEXT` | YA | - | - |
| 4 | `growth_percentage` | `REAL` | YA | - | - |
| 5 | `mention_count` | `INTEGER` | YA | - | - |
| 6 | `recommended_angle` | `TEXT` | YA | - | - |
| 7 | `momentum` | `TEXT` | YA | `'Meningkat'` | - |
| 8 | `created_at` | `DATETIME` | TIDAK | `CURRENT_TIMESTAMP` | - |

*Tidak memiliki relasi Foreign Key keluar.*

---

## Tabel: `users`

### Kolom (7)
| CID | Nama Kolom | Tipe Data | Not Null | Default Value | Primary Key |
|---|---|---|---|---|---|
| 0 | `id` | `INTEGER` | TIDAK | - | PK (1) |
| 1 | `name` | `TEXT` | YA | - | - |
| 2 | `email` | `TEXT` | YA | - | - |
| 3 | `password_hash` | `TEXT` | YA | - | - |
| 4 | `role_id` | `INTEGER` | TIDAK | - | - |
| 5 | `created_at` | `DATETIME` | TIDAK | `CURRENT_TIMESTAMP` | - |
| 6 | `avatar_url` | `TEXT` | TIDAK | - | - |

### Foreign Keys (1)
| Kolom Asal | Tabel Target | Kolom Target | On Update | On Delete |
|---|---|---|---|---|
| `role_id` | `roles` | `id` | `NO ACTION` | `SET NULL` |

### Indeks (1)
- `sqlite_autoindex_users_1` (Unique: YA, Origin: `u`)

---


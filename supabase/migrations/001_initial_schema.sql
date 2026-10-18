-- ==============================================================================
-- DASBOR HUMAS & MEDIA - SKEMA SUPABASE POSTGRESQL (MIGRASI LENGKAP)
-- ==============================================================================
-- File ini mentranslasikan seluruh 30+ tabel dari SQLite ke PostgreSQL (Supabase)
-- Termasuk primary keys, foreign keys dengan ON DELETE cascade/set null,
-- tipe data native (TIMESTAMPTZ, UUID/BIGSERIAL, JSONB, BOOLEAN), dan indeks performa.
-- ==============================================================================

-- 1. ROLES & USERS (AUTH & IDENTITAS)
CREATE TABLE IF NOT EXISTS roles (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  permissions TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role_id BIGINT REFERENCES roles(id) ON DELETE SET NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);

-- 2. PILAR & TEMA KONTEN
CREATE TABLE IF NOT EXISTS content_pillars (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(20) NOT NULL DEFAULT '#2563eb'
);

CREATE TABLE IF NOT EXISTS content_themes (
  id BIGSERIAL PRIMARY KEY,
  pillar_id BIGINT NOT NULL REFERENCES content_pillars(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  description TEXT
);

CREATE INDEX IF NOT EXISTS idx_content_themes_pillar_id ON content_themes(pillar_id);

-- 3. KALENDER KONTEN & PENGINGAT
CREATE TABLE IF NOT EXISTS content_calendar (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  channel VARCHAR(50) NOT NULL,
  content_type VARCHAR(100),
  sub_type VARCHAR(100),
  request_bidang VARCHAR(100),
  pillar_id BIGINT REFERENCES content_pillars(id) ON DELETE SET NULL,
  assignee_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  remind_before INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_content_calendar_scheduled ON content_calendar(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_content_calendar_status ON content_calendar(status);
CREATE INDEX IF NOT EXISTS idx_content_calendar_channel ON content_calendar(channel);

CREATE TABLE IF NOT EXISTS reminders (
  id BIGSERIAL PRIMARY KEY,
  content_id BIGINT REFERENCES content_calendar(id) ON DELETE CASCADE,
  task_id BIGINT,
  title VARCHAR(255) NOT NULL DEFAULT '',
  message TEXT,
  remind_at TIMESTAMPTZ NOT NULL,
  channel VARCHAR(50) DEFAULT 'in_app',
  is_sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reminders_remind_at ON reminders(remind_at);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON reminders(status);

-- 4. METRIK & AGREGASI PERFORMA
CREATE TABLE IF NOT EXISTS metric_snapshots (
  id BIGSERIAL PRIMARY KEY,
  source VARCHAR(50) NOT NULL,
  channel VARCHAR(50),
  period VARCHAR(20) NOT NULL DEFAULT '30d',
  metric_name VARCHAR(100) NOT NULL,
  metric_value NUMERIC NOT NULL,
  delta NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_metric_snapshots_query ON metric_snapshots(source, metric_name, period);

CREATE TABLE IF NOT EXISTS donations (
  id BIGSERIAL PRIMARY KEY,
  campaign_name VARCHAR(255) NOT NULL,
  platform VARCHAR(100) NOT NULL,
  amount NUMERIC NOT NULL,
  donors_count INTEGER NOT NULL,
  target_amount NUMERIC NOT NULL,
  period VARCHAR(20) DEFAULT '30d',
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ad_campaigns (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  platform VARCHAR(50) NOT NULL DEFAULT 'Meta',
  objective VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Aktif',
  spend NUMERIC NOT NULL,
  reach BIGINT NOT NULL,
  conversions BIGINT NOT NULL,
  period VARCHAR(20) DEFAULT '30d',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS top_pages (
  id BIGSERIAL PRIMARY KEY,
  path TEXT NOT NULL,
  views BIGINT NOT NULL,
  avg_time VARCHAR(50) NOT NULL,
  period VARCHAR(20) DEFAULT '30d'
);

-- 5. MANAJEMEN PROYEK & TUGAS (KANBAN)
CREATE TABLE IF NOT EXISTS projects (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  owner VARCHAR(150) NOT NULL,
  owner_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project_tasks (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  stage VARCHAR(50) NOT NULL DEFAULT 'todo',
  assignee VARCHAR(150) NOT NULL,
  assignee_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  due_date DATE NOT NULL,
  priority VARCHAR(50) NOT NULL DEFAULT 'Sedang',
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_project_tasks_proj_stage ON project_tasks(project_id, stage);

-- 6. PUSAT PANTAUAN BERITA & TELEGRAM
CREATE TABLE IF NOT EXISTS news_sources (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  type VARCHAR(50) NOT NULL,
  url_or_handle TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_synced TIMESTAMPTZ,
  unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS news_items (
  id BIGSERIAL PRIMARY KEY,
  source_id BIGINT REFERENCES news_sources(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  source_type VARCHAR(50) NOT NULL,
  source_name VARCHAR(150) NOT NULL,
  url TEXT NOT NULL UNIQUE,
  published_at TIMESTAMPTZ NOT NULL,
  summary TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  is_curated BOOLEAN DEFAULT TRUE,
  is_important BOOLEAN DEFAULT FALSE,
  channel_handle VARCHAR(100),
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_news_items_published ON news_items(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_items_important ON news_items(is_important);

CREATE TABLE IF NOT EXISTS news_bookmarks (
  id BIGSERIAL PRIMARY KEY,
  news_id BIGINT NOT NULL REFERENCES news_items(id) ON DELETE CASCADE,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(news_id, user_id)
);

CREATE TABLE IF NOT EXISTS news_references (
  id BIGSERIAL PRIMARY KEY,
  news_id BIGINT NOT NULL REFERENCES news_items(id) ON DELETE CASCADE,
  marked_by_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  content_calendar_id BIGINT REFERENCES content_calendar(id) ON DELETE SET NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. INSIGHT KONTEN & REKOMENDASI IDE
CREATE TABLE IF NOT EXISTS trending_topics (
  id BIGSERIAL PRIMARY KEY,
  rank INTEGER NOT NULL,
  topic VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  growth_percentage NUMERIC NOT NULL,
  mention_count INTEGER NOT NULL,
  recommended_angle TEXT NOT NULL,
  momentum VARCHAR(50) NOT NULL DEFAULT 'Meningkat',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS content_gaps (
  id BIGSERIAL PRIMARY KEY,
  gap_topic TEXT NOT NULL,
  target_pillar VARCHAR(100) NOT NULL,
  suggested_format VARCHAR(100) NOT NULL,
  potential_audience VARCHAR(100) NOT NULL,
  reason TEXT NOT NULL,
  urgency VARCHAR(50) NOT NULL DEFAULT 'Sedang',
  is_adopted BOOLEAN DEFAULT FALSE,
  adopted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS idea_recommendations (
  id BIGSERIAL PRIMARY KEY,
  hook_title TEXT NOT NULL,
  source_context VARCHAR(100) NOT NULL,
  pillar VARCHAR(100) NOT NULL,
  suggested_channel VARCHAR(50) NOT NULL,
  expected_impact TEXT NOT NULL,
  rationale TEXT NOT NULL,
  key_points JSONB,
  is_skipped BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS saved_ideas (
  id BIGSERIAL PRIMARY KEY,
  recommendation_id BIGINT REFERENCES idea_recommendations(id) ON DELETE SET NULL,
  hook_title TEXT NOT NULL,
  suggested_channel VARCHAR(50) NOT NULL,
  pillar VARCHAR(100) NOT NULL,
  rationale TEXT,
  key_points JSONB,
  status VARCHAR(50) NOT NULL DEFAULT 'tersimpan',
  calendar_id BIGINT REFERENCES content_calendar(id) ON DELETE SET NULL,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. LAPORAN KINERJA, PROGRAM RAB & LRA
CREATE TABLE IF NOT EXISTS performance_reports (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  period VARCHAR(50) NOT NULL DEFAULT '30d',
  start_date DATE,
  end_date DATE,
  generated_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS performance_rows (
  id BIGSERIAL PRIMARY KEY,
  report_id BIGINT REFERENCES performance_reports(id) ON DELETE CASCADE,
  channel VARCHAR(50) NOT NULL,
  period VARCHAR(50) NOT NULL DEFAULT '30d',
  reach BIGINT NOT NULL DEFAULT 0,
  engagement BIGINT NOT NULL DEFAULT 0,
  conversions BIGINT NOT NULL DEFAULT 0,
  delta NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS performance_notes (
  id BIGSERIAL PRIMARY KEY,
  report_id BIGINT REFERENCES performance_reports(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT,
  channel VARCHAR(50),
  period VARCHAR(50),
  meta TEXT,
  created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS budget_lines (
  id BIGSERIAL PRIMARY KEY,
  program VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  rab NUMERIC NOT NULL,
  lra NUMERIC NOT NULL,
  owner VARCHAR(100) NOT NULL,
  owner_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  year INTEGER NOT NULL,
  quarter VARCHAR(10) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'sesuai',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS budget_revisions (
  id BIGSERIAL PRIMARY KEY,
  budget_line_id BIGINT NOT NULL REFERENCES budget_lines(id) ON DELETE CASCADE,
  previous_rab NUMERIC NOT NULL,
  new_rab NUMERIC NOT NULL,
  previous_lra NUMERIC NOT NULL,
  new_lra NUMERIC NOT NULL,
  change_reason TEXT NOT NULL,
  changed_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  changed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS annual_reports (
  id BIGSERIAL PRIMARY KEY,
  year INTEGER NOT NULL UNIQUE,
  theme VARCHAR(255) NOT NULL,
  executive_summary TEXT NOT NULL,
  total_donors INTEGER NOT NULL DEFAULT 0,
  total_beneficiaries INTEGER NOT NULL DEFAULT 0,
  total_funds_raised NUMERIC NOT NULL DEFAULT 0,
  total_funds_distributed NUMERIC NOT NULL DEFAULT 0,
  milestones JSONB,
  quarterly_progress JSONB,
  status VARCHAR(50) NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shared_reports (
  id BIGSERIAL PRIMARY KEY,
  share_token VARCHAR(255) NOT NULL UNIQUE,
  report_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  target_recipient VARCHAR(255),
  recipient_channel VARCHAR(50) NOT NULL DEFAULT 'link',
  download_url TEXT NOT NULL,
  year INTEGER,
  period VARCHAR(50),
  expires_at TIMESTAMPTZ,
  access_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 9. BASIS PENGETAHUAN & SOP (KNOWLEDGE BASE)
CREATE TABLE IF NOT EXISTS knowledge_categories (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(20) DEFAULT '#2563eb'
);

CREATE TABLE IF NOT EXISTS knowledge_docs (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  category_id BIGINT REFERENCES knowledge_categories(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  version VARCHAR(20) NOT NULL DEFAULT 'v1.0',
  author VARCHAR(150) NOT NULL,
  access_role VARCHAR(50) NOT NULL DEFAULT 'all',
  read_time VARCHAR(50) DEFAULT '5 menit',
  download_url TEXT,
  related_codes JSONB,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS doc_sections (
  id BIGSERIAL PRIMARY KEY,
  doc_id BIGINT NOT NULL REFERENCES knowledge_docs(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 1,
  heading VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  checklist JSONB,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS sop_steps (
  id BIGSERIAL PRIMARY KEY,
  doc_id BIGINT NOT NULL REFERENCES knowledge_docs(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  phase VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  actor VARCHAR(100) NOT NULL,
  action TEXT NOT NULL,
  output TEXT NOT NULL,
  sla_time VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS doc_proposals (
  id BIGSERIAL PRIMARY KEY,
  proposal_code VARCHAR(50) NOT NULL UNIQUE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  target_doc_code VARCHAR(50),
  target_doc_title VARCHAR(255),
  submitter_name VARCHAR(150) NOT NULL,
  submitter_role VARCHAR(50) NOT NULL DEFAULT 'staff',
  urgency VARCHAR(50) NOT NULL DEFAULT 'normal',
  reason TEXT NOT NULL,
  suggested_content TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'menunggu_tinjauan',
  reviewed_by VARCHAR(150),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS doc_proposal_logs (
  id BIGSERIAL PRIMARY KEY,
  proposal_id BIGINT NOT NULL REFERENCES doc_proposals(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  previous_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  actor_name VARCHAR(150) NOT NULL,
  actor_role VARCHAR(50) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 10. PENGATURAN, INTEGRASI & AUDIT LOGS
CREATE TABLE IF NOT EXISTS permissions (
  id BIGSERIAL PRIMARY KEY,
  key VARCHAR(100) NOT NULL UNIQUE,
  label VARCHAR(255) NOT NULL,
  description TEXT,
  module VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS role_permissions (
  id BIGSERIAL PRIMARY KEY,
  role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id BIGINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  granted BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS system_settings (
  id BIGSERIAL PRIMARY KEY,
  key VARCHAR(100) NOT NULL UNIQUE,
  value TEXT NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'general',
  description TEXT,
  updated_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_integrations (
  id BIGSERIAL PRIMARY KEY,
  service_key VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'disconnected',
  endpoint TEXT,
  config_json JSONB,
  last_sync_at TIMESTAMPTZ,
  last_status_message TEXT,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dam_shares (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  smb_path TEXT NOT NULL UNIQUE,
  description TEXT,
  total_assets INTEGER DEFAULT 0,
  total_size VARCHAR(50) DEFAULT '0 MB',
  allowed_roles JSONB DEFAULT '["head","admin","staff"]'::jsonb,
  last_indexed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS integration_sync_jobs (
  id BIGSERIAL PRIMARY KEY,
  service_key VARCHAR(100) NOT NULL,
  target_object VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  items_processed INTEGER DEFAULT 0,
  details TEXT,
  triggered_by VARCHAR(100) DEFAULT 'system',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  finished_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  user_name VARCHAR(150) NOT NULL,
  user_role VARCHAR(50) NOT NULL,
  action VARCHAR(100) NOT NULL,
  target TEXT NOT NULL,
  ip_address VARCHAR(50),
  status VARCHAR(50) NOT NULL DEFAULT 'success',
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

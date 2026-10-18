-- ==============================================================================
-- DASBOR HUMAS & MEDIA - INTEGRITAS FOREIGN KEYS & CONSTRAINTS (SUPABASE)
-- ==============================================================================
-- Skrip ini memastikan seluruh foreign key, validasi CHECK constraints,
-- dan indeks pencarian foreign key terpasang dengan kuat di Postgres.
-- ==============================================================================

-- 1. ENUM / CHECK CONSTRAINTS UNTUK VALIDASI STATUS
DO $$
BEGIN
  -- Validasi status content_calendar
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_content_status') THEN
    ALTER TABLE content_calendar ADD CONSTRAINT chk_content_status
      CHECK (status IN ('draft', 'review', 'ready', 'published'));
  END IF;

  -- Validasi status project_tasks
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_task_stage') THEN
    ALTER TABLE project_tasks ADD CONSTRAINT chk_task_stage
      CHECK (stage IN ('backlog', 'todo', 'in_progress', 'review', 'done'));
  END IF;

  -- Validasi status budget_lines
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_budget_status') THEN
    ALTER TABLE budget_lines ADD CONSTRAINT chk_budget_status
      CHECK (status IN ('sesuai', 'melebihi', 'hemat'));
  END IF;

  -- Validasi tipe sumber berita
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_news_source_type') THEN
    ALTER TABLE news_sources ADD CONSTRAINT chk_news_source_type
      CHECK (type IN ('rss', 'google_news', 'telegram', 'manual'));
  END IF;

  -- Validasi peran hak akses knowledge_docs
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_doc_access_role') THEN
    ALTER TABLE knowledge_docs ADD CONSTRAINT chk_doc_access_role
      CHECK (access_role IN ('all', 'staff', 'admin', 'head'));
  END IF;

  -- Validasi status usulan doc_proposals
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_proposal_status') THEN
    ALTER TABLE doc_proposals ADD CONSTRAINT chk_proposal_status
      CHECK (status IN ('menunggu_tinjauan', 'disetujui', 'ditolak', 'perlu_revisi'));
  END IF;
END $$;

-- 2. INDEKS FOREIGN KEYS UNTUK OPTIMASI JOIN PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_fk_content_calendar_pillar ON content_calendar(pillar_id);
CREATE INDEX IF NOT EXISTS idx_fk_content_calendar_assignee ON content_calendar(assignee_id);
CREATE INDEX IF NOT EXISTS idx_fk_reminders_content ON reminders(content_id);
CREATE INDEX IF NOT EXISTS idx_fk_projects_owner ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_fk_project_tasks_project ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_fk_project_tasks_assignee ON project_tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_fk_news_items_source ON news_items(source_id);
CREATE INDEX IF NOT EXISTS idx_fk_news_bookmarks_news ON news_bookmarks(news_id);
CREATE INDEX IF NOT EXISTS idx_fk_news_bookmarks_user ON news_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_fk_news_references_news ON news_references(news_id);
CREATE INDEX IF NOT EXISTS idx_fk_news_references_calendar ON news_references(content_calendar_id);
CREATE INDEX IF NOT EXISTS idx_fk_saved_ideas_rec ON saved_ideas(recommendation_id);
CREATE INDEX IF NOT EXISTS idx_fk_saved_ideas_cal ON saved_ideas(calendar_id);
CREATE INDEX IF NOT EXISTS idx_fk_saved_ideas_user ON saved_ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_fk_performance_rows_report ON performance_rows(report_id);
CREATE INDEX IF NOT EXISTS idx_fk_performance_notes_report ON performance_notes(report_id);
CREATE INDEX IF NOT EXISTS idx_fk_budget_lines_owner ON budget_lines(owner_id);
CREATE INDEX IF NOT EXISTS idx_fk_budget_revisions_line ON budget_revisions(budget_line_id);
CREATE INDEX IF NOT EXISTS idx_fk_doc_sections_doc ON doc_sections(doc_id);
CREATE INDEX IF NOT EXISTS idx_fk_sop_steps_doc ON sop_steps(doc_id);
CREATE INDEX IF NOT EXISTS idx_fk_doc_proposal_logs_prop ON doc_proposal_logs(proposal_id);
CREATE INDEX IF NOT EXISTS idx_fk_role_permissions_role ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_fk_role_permissions_perm ON role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_fk_audit_logs_user ON audit_logs(user_id);

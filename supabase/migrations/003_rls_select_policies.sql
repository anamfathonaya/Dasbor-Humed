-- ==============================================================================
-- DASBOR HUMAS & MEDIA - KEBIJAKAN ROW-LEVEL SECURITY (RLS) BACA (SELECT)
-- ==============================================================================
-- File ini mengaktifkan RLS pada seluruh tabel inti dan menetapkan kebijakan
-- SELECT berdasarkan klaim peran JWT pengguna: (auth.jwt() ->> 'role')
-- ==============================================================================

-- 1. AKTIFKAN RLS PADA SELURUH TABEL
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_pillars ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE metric_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE top_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE trending_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE annual_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE doc_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE sop_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE doc_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE doc_proposal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE dam_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 2. KEBIJAKAN BACA (SELECT POLICIES)

-- A. USERS & ROLES
-- Staf dan reviewer dapat membaca daftar pengguna terverifikasi, tapi email sensitif dan id dibatasi di UI
CREATE POLICY "select_users_policy" ON users
  FOR SELECT
  USING (
    (auth.jwt() ->> 'role') IN ('head', 'admin') OR
    id = (auth.uid())::bigint OR
    (auth.jwt() ->> 'role') IN ('staff', 'reviewer')
  );

CREATE POLICY "select_roles_policy" ON roles
  FOR SELECT
  USING (TRUE);

-- B. KONTEN & KALENDER PUBLIKASI
CREATE POLICY "select_content_pillars" ON content_pillars FOR SELECT USING (TRUE);
CREATE POLICY "select_content_themes" ON content_themes FOR SELECT USING (TRUE);
CREATE POLICY "select_content_calendar" ON content_calendar FOR SELECT USING (TRUE);

CREATE POLICY "select_reminders" ON reminders
  FOR SELECT
  USING (
    (auth.jwt() ->> 'role') IN ('head', 'admin') OR
    task_id IN (SELECT id FROM project_tasks WHERE assignee_id = (auth.uid())::bigint) OR
    content_id IN (SELECT id FROM content_calendar WHERE assignee_id = (auth.uid())::bigint)
  );

-- C. METRIK, ANALITIK & DONASI
-- Staf hanya boleh sosmed & website; Donasi & Meta ads terbatas head & admin
CREATE POLICY "select_metric_snapshots" ON metric_snapshots
  FOR SELECT
  USING (
    (auth.jwt() ->> 'role') IN ('head', 'admin') OR
    ((auth.jwt() ->> 'role') = 'staff' AND source IN ('instagram', 'facebook', 'youtube', 'tiktok', 'website', 'x')) OR
    ((auth.jwt() ->> 'role') = 'reviewer')
  );

CREATE POLICY "select_donations" ON donations
  FOR SELECT
  USING ((auth.jwt() ->> 'role') IN ('head', 'admin'));

CREATE POLICY "select_ad_campaigns" ON ad_campaigns
  FOR SELECT
  USING ((auth.jwt() ->> 'role') IN ('head', 'admin'));

CREATE POLICY "select_top_pages" ON top_pages FOR SELECT USING (TRUE);

-- D. MANAJEMEN PROYEK & TUGAS KANBAN
CREATE POLICY "select_projects" ON projects FOR SELECT USING (TRUE);
CREATE POLICY "select_project_tasks" ON project_tasks FOR SELECT USING (TRUE);

-- E. PANTAUAN BERITA, TELEGRAM & RUJUKAN
CREATE POLICY "select_news_sources" ON news_sources FOR SELECT USING (TRUE);
CREATE POLICY "select_news_items" ON news_items FOR SELECT USING (TRUE);

CREATE POLICY "select_news_bookmarks" ON news_bookmarks
  FOR SELECT
  USING (
    (auth.jwt() ->> 'role') IN ('head', 'admin') OR
    user_id = (auth.uid())::bigint
  );

CREATE POLICY "select_news_references" ON news_references FOR SELECT USING (TRUE);

-- F. INSIGHT KONTEN & REKOMENDASI IDE
CREATE POLICY "select_trending_topics" ON trending_topics FOR SELECT USING (TRUE);
CREATE POLICY "select_content_gaps" ON content_gaps FOR SELECT USING (TRUE);
CREATE POLICY "select_idea_recommendations" ON idea_recommendations FOR SELECT USING (TRUE);

CREATE POLICY "select_saved_ideas" ON saved_ideas
  FOR SELECT
  USING (
    (auth.jwt() ->> 'role') IN ('head', 'admin') OR
    user_id = (auth.uid())::bigint
  );

-- G. LAPORAN KINERJA & ANGGARAN (RAB / LRA)
CREATE POLICY "select_performance_reports" ON performance_reports FOR SELECT USING (TRUE);
CREATE POLICY "select_performance_rows" ON performance_rows FOR SELECT USING (TRUE);
CREATE POLICY "select_performance_notes" ON performance_notes FOR SELECT USING (TRUE);

CREATE POLICY "select_budget_lines" ON budget_lines
  FOR SELECT
  USING (
    (auth.jwt() ->> 'role') IN ('head', 'admin', 'reviewer') OR
    ((auth.jwt() ->> 'role') = 'staff' AND owner_id = (auth.uid())::bigint)
  );

CREATE POLICY "select_budget_revisions" ON budget_revisions
  FOR SELECT
  USING ((auth.jwt() ->> 'role') IN ('head', 'admin', 'reviewer'));

CREATE POLICY "select_annual_reports" ON annual_reports FOR SELECT USING (TRUE);
CREATE POLICY "select_shared_reports" ON shared_reports FOR SELECT USING (TRUE);

-- H. BASIS PENGETAHUAN & SOP (BERDASARKAN access_role)
CREATE POLICY "select_knowledge_categories" ON knowledge_categories FOR SELECT USING (TRUE);

CREATE POLICY "select_knowledge_docs" ON knowledge_docs
  FOR SELECT
  USING (
    access_role = 'all' OR
    (access_role = 'staff' AND (auth.jwt() ->> 'role') IN ('staff', 'admin', 'head')) OR
    (access_role = 'admin' AND (auth.jwt() ->> 'role') IN ('admin', 'head')) OR
    (access_role = 'head' AND (auth.jwt() ->> 'role') = 'head')
  );

CREATE POLICY "select_doc_sections" ON doc_sections
  FOR SELECT
  USING (
    doc_id IN (
      SELECT id FROM knowledge_docs WHERE
        access_role = 'all' OR
        (access_role = 'staff' AND (auth.jwt() ->> 'role') IN ('staff', 'admin', 'head')) OR
        (access_role = 'admin' AND (auth.jwt() ->> 'role') IN ('admin', 'head')) OR
        (access_role = 'head' AND (auth.jwt() ->> 'role') = 'head')
    )
  );

CREATE POLICY "select_sop_steps" ON sop_steps
  FOR SELECT
  USING (
    doc_id IN (
      SELECT id FROM knowledge_docs WHERE
        access_role = 'all' OR
        (access_role = 'staff' AND (auth.jwt() ->> 'role') IN ('staff', 'admin', 'head')) OR
        (access_role = 'admin' AND (auth.jwt() ->> 'role') IN ('admin', 'head')) OR
        (access_role = 'head' AND (auth.jwt() ->> 'role') = 'head')
    )
  );

CREATE POLICY "select_doc_proposals" ON doc_proposals FOR SELECT USING (TRUE);
CREATE POLICY "select_doc_proposal_logs" ON doc_proposal_logs FOR SELECT USING (TRUE);

-- I. PENGATURAN, INTEGRASI & AUDIT
CREATE POLICY "select_permissions" ON permissions FOR SELECT USING (TRUE);
CREATE POLICY "select_role_permissions" ON role_permissions FOR SELECT USING (TRUE);

CREATE POLICY "select_system_settings" ON system_settings
  FOR SELECT
  USING ((auth.jwt() ->> 'role') IN ('head', 'admin'));

CREATE POLICY "select_system_integrations" ON system_integrations
  FOR SELECT
  USING ((auth.jwt() ->> 'role') IN ('head', 'admin'));

CREATE POLICY "select_dam_shares" ON dam_shares
  FOR SELECT
  USING (
    (auth.jwt() ->> 'role') IN ('head', 'admin') OR
    allowed_roles ? (auth.jwt() ->> 'role')
  );

CREATE POLICY "select_audit_logs" ON audit_logs
  FOR SELECT
  USING ((auth.jwt() ->> 'role') IN ('head', 'admin'));

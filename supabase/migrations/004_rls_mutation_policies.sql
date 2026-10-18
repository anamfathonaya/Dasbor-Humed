-- ==============================================================================
-- DASBOR HUMAS & MEDIA - KEBIJAKAN ROW-LEVEL SECURITY (RLS) TULIS & HAPUS
-- ==============================================================================
-- File ini menetapkan kebijakan INSERT, UPDATE, dan DELETE pada seluruh tabel
-- inti berdasarkan matriks hak akses RBAC dan peran pengguna: (auth.jwt() ->> 'role')
-- ==============================================================================

-- 1. USERS & ROLES
-- Hanya Head & Admin yang dapat menambah/menonaktifkan pengguna; Staf hanya bisa update avatar/profil mandiri
CREATE POLICY "insert_users_policy" ON users
  FOR INSERT
  WITH CHECK ((auth.jwt() ->> 'role') IN ('head', 'admin'));

CREATE POLICY "update_users_policy" ON users
  FOR UPDATE
  USING (
    (auth.jwt() ->> 'role') IN ('head', 'admin') OR
    id = (auth.uid())::bigint
  )
  WITH CHECK (
    (auth.jwt() ->> 'role') IN ('head', 'admin') OR
    id = (auth.uid())::bigint
  );

CREATE POLICY "delete_users_policy" ON users
  FOR DELETE
  USING ((auth.jwt() ->> 'role') = 'head');

-- Roles hanya boleh diubah oleh Head
CREATE POLICY "modify_roles_policy" ON roles
  FOR ALL
  USING ((auth.jwt() ->> 'role') = 'head')
  WITH CHECK ((auth.jwt() ->> 'role') = 'head');

-- 2. KONTEN & KALENDER PUBLIKASI
-- Pilar & Tema dikelola Head & Admin
CREATE POLICY "modify_content_pillars" ON content_pillars
  FOR ALL
  USING ((auth.jwt() ->> 'role') IN ('head', 'admin'))
  WITH CHECK ((auth.jwt() ->> 'role') IN ('head', 'admin'));

CREATE POLICY "modify_content_themes" ON content_themes
  FOR ALL
  USING ((auth.jwt() ->> 'role') IN ('head', 'admin'))
  WITH CHECK ((auth.jwt() ->> 'role') IN ('head', 'admin'));

-- Kalender Konten: Staf boleh buat draf & sunting milik sendiri; Reviewer boleh approve; Head/Admin kelola penuh
CREATE POLICY "insert_content_calendar" ON content_calendar
  FOR INSERT
  WITH CHECK ((auth.jwt() ->> 'role') IN ('head', 'admin', 'staff'));

CREATE POLICY "update_content_calendar" ON content_calendar
  FOR UPDATE
  USING (
    (auth.jwt() ->> 'role') IN ('head', 'admin') OR
    ((auth.jwt() ->> 'role') = 'staff' AND assignee_id = (auth.uid())::bigint) OR
    ((auth.jwt() ->> 'role') = 'reviewer')
  )
  WITH CHECK (
    (auth.jwt() ->> 'role') IN ('head', 'admin') OR
    ((auth.jwt() ->> 'role') = 'staff' AND assignee_id = (auth.uid())::bigint) OR
    ((auth.jwt() ->> 'role') = 'reviewer')
  );

CREATE POLICY "delete_content_calendar" ON content_calendar
  FOR DELETE
  USING ((auth.jwt() ->> 'role') IN ('head', 'admin'));

-- Reminders
CREATE POLICY "insert_reminders" ON reminders
  FOR INSERT
  WITH CHECK ((auth.jwt() ->> 'role') IN ('head', 'admin', 'staff'));

CREATE POLICY "update_reminders" ON reminders
  FOR UPDATE
  USING ((auth.jwt() ->> 'role') IN ('head', 'admin', 'staff'))
  WITH CHECK ((auth.jwt() ->> 'role') IN ('head', 'admin', 'staff'));

CREATE POLICY "delete_reminders" ON reminders
  FOR DELETE
  USING ((auth.jwt() ->> 'role') IN ('head', 'admin'));

-- 3. METRIK, IKLAN & DONASI
-- Hanya Head & Admin yang boleh menginput snapshot metrik, donasi, dan belanja iklan
CREATE POLICY "modify_metric_snapshots" ON metric_snapshots
  FOR ALL
  USING ((auth.jwt() ->> 'role') IN ('head', 'admin'))
  WITH CHECK ((auth.jwt() ->> 'role') IN ('head', 'admin'));

CREATE POLICY "modify_donations" ON donations
  FOR ALL
  USING ((auth.jwt() ->> 'role') IN ('head', 'admin'))
  WITH CHECK ((auth.jwt() ->> 'role') IN ('head', 'admin'));

CREATE POLICY "modify_ad_campaigns" ON ad_campaigns
  FOR ALL
  USING ((auth.jwt() ->> 'role') IN ('head', 'admin'))
  WITH CHECK ((auth.jwt() ->> 'role') IN ('head', 'admin'));

CREATE POLICY "modify_top_pages" ON top_pages
  FOR ALL
  USING ((auth.jwt() ->> 'role') IN ('head', 'admin'))
  WITH CHECK ((auth.jwt() ->> 'role') IN ('head', 'admin'));

-- 4. MANAJEMEN PROYEK & TUGAS KANBAN
CREATE POLICY "modify_projects" ON projects
  FOR ALL
  USING ((auth.jwt() ->> 'role') IN ('head', 'admin'))
  WITH CHECK ((auth.jwt() ->> 'role') IN ('head', 'admin'));

CREATE POLICY "insert_project_tasks" ON project_tasks
  FOR INSERT
  WITH CHECK ((auth.jwt() ->> 'role') IN ('head', 'admin', 'staff'));

CREATE POLICY "update_project_tasks" ON project_tasks
  FOR UPDATE
  USING (
    (auth.jwt() ->> 'role') IN ('head', 'admin') OR
    ((auth.jwt() ->> 'role') = 'staff' AND assignee_id = (auth.uid())::bigint)
  )
  WITH CHECK (
    (auth.jwt() ->> 'role') IN ('head', 'admin') OR
    ((auth.jwt() ->> 'role') = 'staff' AND assignee_id = (auth.uid())::bigint)
  );

CREATE POLICY "delete_project_tasks" ON project_tasks
  FOR DELETE
  USING ((auth.jwt() ->> 'role') IN ('head', 'admin'));

-- 5. PANTAUAN BERITA, TELEGRAM & RUJUKAN
CREATE POLICY "modify_news_sources" ON news_sources
  FOR ALL
  USING ((auth.jwt() ->> 'role') IN ('head', 'admin'))
  WITH CHECK ((auth.jwt() ->> 'role') IN ('head', 'admin'));

CREATE POLICY "insert_news_items" ON news_items
  FOR INSERT
  WITH CHECK ((auth.jwt() ->> 'role') IN ('head', 'admin'));

CREATE POLICY "update_news_items" ON news_items
  FOR UPDATE
  USING ((auth.jwt() ->> 'role') IN ('head', 'admin'))
  WITH CHECK ((auth.jwt() ->> 'role') IN ('head', 'admin'));

CREATE POLICY "delete_news_items" ON news_items
  FOR DELETE
  USING ((auth.jwt() ->> 'role') IN ('head', 'admin'));

CREATE POLICY "modify_news_bookmarks" ON news_bookmarks
  FOR ALL
  USING (
    (auth.jwt() ->> 'role') IN ('head', 'admin') OR
    user_id = (auth.uid())::bigint
  )
  WITH CHECK (
    (auth.jwt() ->> 'role') IN ('head', 'admin') OR
    user_id = (auth.uid())::bigint
  );

CREATE POLICY "modify_news_references" ON news_references
  FOR ALL
  USING ((auth.jwt() ->> 'role') IN ('head', 'admin', 'staff'))
  WITH CHECK ((auth.jwt() ->> 'role') IN ('head', 'admin', 'staff'));

-- 6. INSIGHT KONTEN & REKOMENDASI IDE
CREATE POLICY "modify_trending_topics" ON trending_topics
  FOR ALL
  USING ((auth.jwt() ->> 'role') IN ('head', 'admin'))
  WITH CHECK ((auth.jwt() ->> 'role') IN ('head', 'admin'));

CREATE POLICY "modify_content_gaps" ON content_gaps
  FOR ALL
  USING ((auth.jwt() ->> 'role') IN ('head', 'admin'))
  WITH CHECK ((auth.jwt() ->> 'role') IN ('head', 'admin'));

CREATE POLICY "modify_idea_recommendations" ON idea_recommendations
  FOR ALL
  USING ((auth.jwt() ->> 'role') IN ('head', 'admin'))
  WITH CHECK ((auth.jwt() ->> 'role') IN ('head', 'admin'));

CREATE POLICY "insert_saved_ideas" ON saved_ideas
  FOR INSERT
  WITH CHECK ((auth.jwt() ->> 'role') IN ('head', 'admin', 'staff'));

CREATE POLICY "update_saved_ideas" ON saved_ideas
  FOR UPDATE
  USING (
    (auth.jwt() ->> 'role') IN ('head', 'admin') OR
    user_id = (auth.uid())::bigint
  )
  WITH CHECK (
    (auth.jwt() ->> 'role') IN ('head', 'admin') OR
    user_id = (auth.uid())::bigint
  );

CREATE POLICY "delete_saved_ideas" ON saved_ideas
  FOR DELETE
  USING (
    (auth.jwt() ->> 'role') IN ('head', 'admin') OR
    user_id = (auth.uid())::bigint
  );

-- 7. LAPORAN KINERJA & ANGGARAN (RAB / LRA)
CREATE POLICY "modify_performance_reports" ON performance_reports
  FOR ALL
  USING ((auth.jwt() ->> 'role') IN ('head', 'admin'))
  WITH CHECK ((auth.jwt() ->> 'role') IN ('head', 'admin'));

CREATE POLICY "modify_performance_rows" ON performance_rows
  FOR ALL
  USING ((auth.jwt() ->> 'role') IN ('head', 'admin'))
  WITH CHECK ((auth.jwt() ->> 'role') IN ('head', 'admin'));

CREATE POLICY "modify_performance_notes" ON performance_notes
  FOR ALL
  USING ((auth.jwt() ->> 'role') IN ('head', 'admin'))
  WITH CHECK ((auth.jwt() ->> 'role') IN ('head', 'admin'));

CREATE POLICY "modify_budget_lines" ON budget_lines
  FOR ALL
  USING ((auth.jwt() ->> 'role') IN ('head', 'admin'))
  WITH CHECK ((auth.jwt() ->> 'role') IN ('head', 'admin'));

CREATE POLICY "modify_budget_revisions" ON budget_revisions
  FOR ALL
  USING ((auth.jwt() ->> 'role') IN ('head', 'admin'))
  WITH CHECK ((auth.jwt() ->> 'role') IN ('head', 'admin'));

CREATE POLICY "modify_annual_reports" ON annual_reports
  FOR ALL
  USING ((auth.jwt() ->> 'role') = 'head')
  WITH CHECK ((auth.jwt() ->> 'role') = 'head');

CREATE POLICY "modify_shared_reports" ON shared_reports
  FOR ALL
  USING ((auth.jwt() ->> 'role') IN ('head', 'admin'))
  WITH CHECK ((auth.jwt() ->> 'role') IN ('head', 'admin'));

-- 8. BASIS PENGETAHUAN & SOP (KNOWLEDGE BASE)
CREATE POLICY "modify_knowledge_categories" ON knowledge_categories
  FOR ALL
  USING ((auth.jwt() ->> 'role') IN ('head', 'admin'))
  WITH CHECK ((auth.jwt() ->> 'role') IN ('head', 'admin'));

CREATE POLICY "insert_knowledge_docs" ON knowledge_docs
  FOR INSERT
  WITH CHECK ((auth.jwt() ->> 'role') IN ('head', 'admin'));

CREATE POLICY "update_knowledge_docs" ON knowledge_docs
  FOR UPDATE
  USING ((auth.jwt() ->> 'role') IN ('head', 'admin'))
  WITH CHECK ((auth.jwt() ->> 'role') IN ('head', 'admin'));

-- Hapus dokumen SOP hanya boleh oleh Kepala Humas
CREATE POLICY "delete_knowledge_docs" ON knowledge_docs
  FOR DELETE
  USING ((auth.jwt() ->> 'role') = 'head');

CREATE POLICY "modify_doc_sections" ON doc_sections
  FOR ALL
  USING ((auth.jwt() ->> 'role') IN ('head', 'admin'))
  WITH CHECK ((auth.jwt() ->> 'role') IN ('head', 'admin'));

CREATE POLICY "modify_sop_steps" ON sop_steps
  FOR ALL
  USING ((auth.jwt() ->> 'role') IN ('head', 'admin'))
  WITH CHECK ((auth.jwt() ->> 'role') IN ('head', 'admin'));

CREATE POLICY "insert_doc_proposals" ON doc_proposals
  FOR INSERT
  WITH CHECK ((auth.jwt() ->> 'role') IN ('head', 'admin', 'staff', 'reviewer'));

CREATE POLICY "update_doc_proposals" ON doc_proposals
  FOR UPDATE
  USING ((auth.jwt() ->> 'role') IN ('head', 'reviewer', 'admin'))
  WITH CHECK ((auth.jwt() ->> 'role') IN ('head', 'reviewer', 'admin'));

CREATE POLICY "delete_doc_proposals" ON doc_proposals
  FOR DELETE
  USING ((auth.jwt() ->> 'role') = 'head');

CREATE POLICY "insert_doc_proposal_logs" ON doc_proposal_logs
  FOR INSERT
  WITH CHECK (TRUE);

-- 9. PENGATURAN, INTEGRASI & AUDIT
CREATE POLICY "modify_permissions" ON permissions
  FOR ALL
  USING ((auth.jwt() ->> 'role') = 'head')
  WITH CHECK ((auth.jwt() ->> 'role') = 'head');

CREATE POLICY "modify_role_permissions" ON role_permissions
  FOR ALL
  USING ((auth.jwt() ->> 'role') = 'head')
  WITH CHECK ((auth.jwt() ->> 'role') = 'head');

CREATE POLICY "modify_system_settings" ON system_settings
  FOR ALL
  USING ((auth.jwt() ->> 'role') IN ('head', 'admin'))
  WITH CHECK ((auth.jwt() ->> 'role') IN ('head', 'admin'));

CREATE POLICY "modify_system_integrations" ON system_integrations
  FOR ALL
  USING ((auth.jwt() ->> 'role') IN ('head', 'admin'))
  WITH CHECK ((auth.jwt() ->> 'role') IN ('head', 'admin'));

CREATE POLICY "modify_dam_shares" ON dam_shares
  FOR ALL
  USING ((auth.jwt() ->> 'role') IN ('head', 'admin'))
  WITH CHECK ((auth.jwt() ->> 'role') IN ('head', 'admin'));

-- Audit log: Boleh diinsert oleh sistem/staf terautentikasi, TIDAK boleh diubah atau dihapus oleh siapapun (append-only)
CREATE POLICY "insert_audit_logs" ON audit_logs
  FOR INSERT
  WITH CHECK (TRUE);

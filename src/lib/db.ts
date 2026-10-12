import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';

const dbPath = path.resolve(process.cwd(), 'dasbor.db');
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  // 1. Roles & Users
  db.exec(`
    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      permissions TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role_id INTEGER,
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS content_pillars (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      color TEXT NOT NULL DEFAULT '#2563eb'
    );

    CREATE TABLE IF NOT EXISTS content_themes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pillar_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      FOREIGN KEY (pillar_id) REFERENCES content_pillars(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS content_calendar (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      scheduled_at DATETIME NOT NULL,
      channel TEXT NOT NULL,
      content_type TEXT,
      sub_type TEXT,
      request_bidang TEXT,
      pillar_id INTEGER,
      assignee_id INTEGER,
      status TEXT NOT NULL DEFAULT 'draft',
      remind_before INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (pillar_id) REFERENCES content_pillars(id) ON DELETE SET NULL,
      FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content_id INTEGER,
      task_id INTEGER,
      title TEXT NOT NULL DEFAULT '',
      message TEXT,
      remind_at DATETIME NOT NULL,
      channel TEXT DEFAULT 'in_app',
      is_sent BOOLEAN DEFAULT 0,
      sent_at DATETIME,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (content_id) REFERENCES content_calendar(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS metric_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source TEXT NOT NULL,
      channel TEXT,
      period TEXT NOT NULL DEFAULT '30d',
      metric_name TEXT NOT NULL,
      metric_value REAL NOT NULL,
      delta REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS donations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_name TEXT NOT NULL,
      platform TEXT NOT NULL,
      amount REAL NOT NULL,
      donors_count INTEGER NOT NULL,
      target_amount REAL NOT NULL,
      period TEXT DEFAULT '30d',
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ad_campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      platform TEXT NOT NULL DEFAULT 'Meta',
      objective TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Aktif',
      spend REAL NOT NULL,
      reach INTEGER NOT NULL,
      conversions INTEGER NOT NULL,
      period TEXT DEFAULT '30d',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS top_pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      path TEXT NOT NULL,
      views INTEGER NOT NULL,
      avg_time TEXT NOT NULL,
      period TEXT DEFAULT '30d'
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      owner TEXT NOT NULL,
      owner_id INTEGER,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      progress INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS project_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      stage TEXT NOT NULL DEFAULT 'todo',
      assignee TEXT NOT NULL,
      assignee_id INTEGER,
      due_date DATE NOT NULL,
      priority TEXT NOT NULL DEFAULT 'Sedang',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL
    );

    -- 5. Pusat Pantauan Berita & Telegram
    CREATE TABLE IF NOT EXISTS news_sources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL, -- 'rss' | 'google_news' | 'telegram'
      url_or_handle TEXT NOT NULL,
      category TEXT NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT 1,
      last_synced DATETIME,
      unread_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS news_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_id INTEGER,
      title TEXT NOT NULL,
      source_type TEXT NOT NULL, -- 'rss' | 'google_news' | 'telegram'
      source_name TEXT NOT NULL,
      url TEXT NOT NULL UNIQUE,
      published_at DATETIME NOT NULL,
      summary TEXT NOT NULL,
      category TEXT NOT NULL,
      is_curated BOOLEAN DEFAULT 1,
      is_important BOOLEAN DEFAULT 0,
      channel_handle TEXT,
      is_read BOOLEAN DEFAULT 0,
      read_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (source_id) REFERENCES news_sources(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS news_bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      news_id INTEGER NOT NULL,
      user_id INTEGER,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (news_id) REFERENCES news_items(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
      UNIQUE(news_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS news_references (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      news_id INTEGER NOT NULL,
      marked_by_id INTEGER,
      content_calendar_id INTEGER,
      reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (news_id) REFERENCES news_items(id) ON DELETE CASCADE,
      FOREIGN KEY (marked_by_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (content_calendar_id) REFERENCES content_calendar(id) ON DELETE SET NULL
    );

    -- 6. Insight Konten: Tren Topik, Celah Konten, Rekomendasi Ide & Ide Tersimpan
    CREATE TABLE IF NOT EXISTS trending_topics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rank INTEGER NOT NULL,
      topic TEXT NOT NULL,
      category TEXT NOT NULL,
      growth_percentage REAL NOT NULL,
      mention_count INTEGER NOT NULL,
      recommended_angle TEXT NOT NULL,
      momentum TEXT NOT NULL DEFAULT 'Meningkat', -- 'Meroket' | 'Meningkat' | 'Stabil'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS content_gaps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      gap_topic TEXT NOT NULL,
      target_pillar TEXT NOT NULL,
      suggested_format TEXT NOT NULL,
      potential_audience TEXT NOT NULL,
      reason TEXT NOT NULL,
      urgency TEXT NOT NULL DEFAULT 'Sedang', -- 'Tinggi' | 'Sedang' | 'Rendah'
      is_adopted BOOLEAN DEFAULT 0,
      adopted_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS idea_recommendations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hook_title TEXT NOT NULL,
      source_context TEXT NOT NULL, -- 'Tren Topik' | 'Celah Konten' | 'Pola Performa Lampau' | 'Hari Besar Kemanusiaan'
      pillar TEXT NOT NULL,
      suggested_channel TEXT NOT NULL,
      expected_impact TEXT NOT NULL,
      rationale TEXT NOT NULL,
      key_points TEXT, -- Disimpan sebagai JSON array string
      is_skipped BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS saved_ideas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recommendation_id INTEGER,
      hook_title TEXT NOT NULL,
      suggested_channel TEXT NOT NULL,
      pillar TEXT NOT NULL,
      rationale TEXT,
      key_points TEXT,
      status TEXT NOT NULL DEFAULT 'tersimpan', -- 'tersimpan' | 'terjadwal' | 'draf'
      calendar_id INTEGER,
      user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (recommendation_id) REFERENCES idea_recommendations(id) ON DELETE SET NULL,
      FOREIGN KEY (calendar_id) REFERENCES content_calendar(id) ON DELETE SET NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    -- 7. Laporan Kinerja & Catatan Laporan
    CREATE TABLE IF NOT EXISTS performance_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      period TEXT NOT NULL DEFAULT '30d', -- '7d' | '30d' | '90d' | 'custom'
      start_date DATE,
      end_date DATE,
      generated_by INTEGER,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS performance_rows (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_id INTEGER,
      channel TEXT NOT NULL,
      period TEXT NOT NULL DEFAULT '30d',
      reach INTEGER NOT NULL DEFAULT 0,
      engagement INTEGER NOT NULL DEFAULT 0,
      conversions INTEGER NOT NULL DEFAULT 0,
      delta REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (report_id) REFERENCES performance_reports(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS performance_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_id INTEGER,
      title TEXT NOT NULL,
      body TEXT,
      channel TEXT,
      period TEXT,
      meta TEXT,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (report_id) REFERENCES performance_reports(id) ON DELETE SET NULL,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    );

    -- 8. Kumpulan Program RAB dan Realisasi LRA
    CREATE TABLE IF NOT EXISTS budget_lines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      program TEXT NOT NULL,
      category TEXT NOT NULL, -- 'Media Sosial' | 'Produksi Konten' | 'Iklan Berbayar' | 'Infrastruktur' | 'Hubungan Media' | 'Pelaporan'
      rab REAL NOT NULL,      -- Rencana Anggaran Biaya
      lra REAL NOT NULL,      -- Laporan Realisasi Anggaran
      owner TEXT NOT NULL,    -- 'Tim Media' | 'Tim Humas' | 'Ketua Bidang'
      owner_id INTEGER,
      year INTEGER NOT NULL,  -- e.g. 2026, 2025
      quarter TEXT NOT NULL,  -- 'Q1' | 'Q2' | 'Q3' | 'Q4'
      status TEXT NOT NULL DEFAULT 'sesuai', -- 'sesuai' | 'melebihi' | 'hemat'
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS budget_revisions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      budget_line_id INTEGER NOT NULL,
      previous_rab REAL NOT NULL,
      new_rab REAL NOT NULL,
      previous_lra REAL NOT NULL,
      new_lra REAL NOT NULL,
      change_reason TEXT NOT NULL,
      changed_by INTEGER,
      changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (budget_line_id) REFERENCES budget_lines(id) ON DELETE CASCADE,
      FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
    );

    -- 9. Laporan Tahunan Gabungan Kinerja & Anggaran
    CREATE TABLE IF NOT EXISTS annual_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      year INTEGER NOT NULL UNIQUE,
      theme TEXT NOT NULL,
      executive_summary TEXT NOT NULL,
      total_donors INTEGER NOT NULL DEFAULT 0,
      total_beneficiaries INTEGER NOT NULL DEFAULT 0,
      total_funds_raised REAL NOT NULL DEFAULT 0,
      total_funds_distributed REAL NOT NULL DEFAULT 0,
      milestones TEXT, -- JSON array of { title, date, impact }
      quarterly_progress TEXT, -- JSON array of { quarter, target, progress, status }
      status TEXT NOT NULL DEFAULT 'published', -- 'draft' | 'published'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 10. Tautan Bagikan & Berkas Laporan Terkirim (Share & Delivery Log)
    CREATE TABLE IF NOT EXISTS shared_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      share_token TEXT NOT NULL UNIQUE,
      report_type TEXT NOT NULL, -- 'budget' | 'performance' | 'annual'
      title TEXT NOT NULL,
      target_recipient TEXT,     -- e.g. 'dewan_pengawas@ngo.or.id' atau 'mitra_donor'
      recipient_channel TEXT NOT NULL DEFAULT 'link', -- 'link' | 'email' | 'telegram'
      download_url TEXT NOT NULL,
      year INTEGER,
      period TEXT,
      expires_at DATETIME,
      access_count INTEGER DEFAULT 0,
      last_accessed_at DATETIME,
      created_by INTEGER,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    );

    -- 11. Basis Pengetahuan & Prosedur Operasional Standar (Knowledge Base & SOP)
    CREATE TABLE IF NOT EXISTS knowledge_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE, -- 'SOP' | 'Panduan Teknis' | 'Pedoman Brand' | 'Alur Kerja' | 'Template'
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      icon TEXT,
      color TEXT DEFAULT '#2563eb'
    );

    CREATE TABLE IF NOT EXISTS knowledge_docs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE, -- e.g. 'SOP-HUM-01', 'TPL-LRA-01'
      category_id INTEGER,
      title TEXT NOT NULL,
      category TEXT NOT NULL,    -- 'SOP' | 'Panduan Teknis' | 'Pedoman Brand' | 'Alur Kerja' | 'Template'
      description TEXT NOT NULL,
      version TEXT NOT NULL DEFAULT 'v1.0',
      author TEXT NOT NULL,
      access_role TEXT NOT NULL DEFAULT 'all', -- 'all' | 'admin' | 'head'
      read_time TEXT DEFAULT '5 menit',
      download_url TEXT,
      related_codes TEXT, -- JSON array of codes
      is_archived BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES knowledge_categories(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS doc_sections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      doc_id INTEGER NOT NULL,
      position INTEGER NOT NULL DEFAULT 1,
      heading TEXT NOT NULL,
      content TEXT NOT NULL,
      checklist TEXT, -- JSON array of string checklist items
      notes TEXT,
      FOREIGN KEY (doc_id) REFERENCES knowledge_docs(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sop_steps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      doc_id INTEGER NOT NULL,
      step_number INTEGER NOT NULL,
      phase TEXT NOT NULL,
      title TEXT NOT NULL,
      actor TEXT NOT NULL,
      action TEXT NOT NULL,
      output TEXT NOT NULL,
      sla_time TEXT,
      FOREIGN KEY (doc_id) REFERENCES knowledge_docs(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS doc_proposals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      proposal_code TEXT NOT NULL UNIQUE, -- e.g. 'USUL-2026-001'
      type TEXT NOT NULL, -- 'new' | 'revision'
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      target_doc_code TEXT,
      target_doc_title TEXT,
      submitter_name TEXT NOT NULL,
      submitter_role TEXT NOT NULL DEFAULT 'staff',
      urgency TEXT NOT NULL DEFAULT 'normal', -- 'normal' | 'penting' | 'mendesak'
      reason TEXT NOT NULL,
      suggested_content TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'menunggu_tinjauan', -- 'menunggu_tinjauan' | 'disetujui' | 'ditolak' | 'perlu_revisi'
      reviewed_by TEXT,
      reviewed_at DATETIME,
      review_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS doc_proposal_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      proposal_id INTEGER NOT NULL,
      action TEXT NOT NULL, -- 'created' | 'status_changed' | 'notes_added'
      previous_status TEXT,
      new_status TEXT NOT NULL,
      actor_name TEXT NOT NULL,
      actor_role TEXT NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (proposal_id) REFERENCES doc_proposals(id) ON DELETE CASCADE
    );

    -- 8. Pengaturan, Peran, Hak Akses & Integrasi
    CREATE TABLE IF NOT EXISTS permissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL UNIQUE,
      label TEXT NOT NULL,
      description TEXT,
      module TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS role_permissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role_id INTEGER NOT NULL,
      permission_id INTEGER NOT NULL,
      granted BOOLEAN NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
      FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
      UNIQUE(role_id, permission_id)
    );

    CREATE TABLE IF NOT EXISTS system_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL UNIQUE,
      value TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'general',
      description TEXT,
      updated_by INTEGER,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS system_integrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_key TEXT NOT NULL UNIQUE, -- 'dam_nas' | 'google_workspace' | 'meta_ads' | 'telegram_bot'
      name TEXT NOT NULL,
      category TEXT NOT NULL,           -- 'storage' | 'cloud' | 'social' | 'messaging'
      status TEXT NOT NULL DEFAULT 'disconnected', -- 'connected' | 'disconnected' | 'warning'
      endpoint TEXT,
      config_json TEXT,
      last_sync_at DATETIME,
      last_status_message TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS dam_shares (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      smb_path TEXT NOT NULL UNIQUE,
      description TEXT,
      total_assets INTEGER DEFAULT 0,
      total_size TEXT DEFAULT '0 MB',
      allowed_roles TEXT DEFAULT '["head","admin","staff"]',
      last_indexed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS integration_sync_jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_key TEXT NOT NULL,
      target_object TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'running' | 'success' | 'failed'
      items_processed INTEGER DEFAULT 0,
      details TEXT,
      triggered_by TEXT DEFAULT 'system',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      finished_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      user_name TEXT NOT NULL,
      user_role TEXT NOT NULL,
      action TEXT NOT NULL,
      target TEXT NOT NULL,
      ip_address TEXT,
      status TEXT NOT NULL DEFAULT 'success', -- 'success' | 'warning' | 'failed'
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  // Safe migrations for content_calendar columns
  try { db.exec("ALTER TABLE content_calendar ADD COLUMN content_type TEXT"); } catch {}
  try { db.exec("ALTER TABLE content_calendar ADD COLUMN sub_type TEXT"); } catch {}
  try { db.exec("ALTER TABLE content_calendar ADD COLUMN request_bidang TEXT"); } catch {}

  // Safe migrations for reminders columns
  try { db.exec("ALTER TABLE reminders ADD COLUMN title TEXT DEFAULT ''"); } catch {}
  try { db.exec("ALTER TABLE reminders ADD COLUMN message TEXT"); } catch {}
  try { db.exec("ALTER TABLE reminders ADD COLUMN channel TEXT DEFAULT 'in_app'"); } catch {}
  try { db.exec("ALTER TABLE reminders ADD COLUMN sent_at DATETIME"); } catch {}
  try { db.exec("ALTER TABLE reminders ADD COLUMN status TEXT DEFAULT 'pending'"); } catch {}
  try { db.exec("ALTER TABLE reminders ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP"); } catch {}
  try { db.exec("ALTER TABLE project_tasks ADD COLUMN position INTEGER DEFAULT 0"); } catch {}
  try { db.exec("ALTER TABLE knowledge_docs ADD COLUMN category_id INTEGER"); } catch {}
  try { db.exec("ALTER TABLE users ADD COLUMN avatar_url TEXT"); } catch {}
  try {
    db.exec(`
      UPDATE knowledge_docs
      SET category_id = (SELECT id FROM knowledge_categories WHERE knowledge_categories.name = knowledge_docs.category)
      WHERE category_id IS NULL;
    `);
  } catch {}

  // Seeding default roles jika kosong
  const roleCount = (db.prepare('SELECT COUNT(*) as count FROM roles').get() as { count: number }).count;
  if (roleCount === 0) {
    const insertRole = db.prepare('INSERT INTO roles (name, permissions) VALUES (?, ?)');
    insertRole.run('head', JSON.stringify(['all']));
    insertRole.run('admin', JSON.stringify(['metrics', 'projects', 'content', 'reports']));
    insertRole.run('staff', JSON.stringify(['content_read', 'content_write', 'public_metrics']));
  }

  // Seeding default users jika kosong
  const userCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }).count;
  if (userCount === 0) {
    const insertUser = db.prepare('INSERT INTO users (name, email, password_hash, role_id) VALUES (?, ?, ?, ?)');
    insertUser.run('Rani', 'rani@ngo.or.id', 'dummyhash', 1);
    insertUser.run('Budi', 'budi@ngo.or.id', 'dummyhash', 2);
    insertUser.run('Dewi', 'dewi@ngo.or.id', 'dummyhash', 3);
    insertUser.run('Sari', 'sari@ngo.or.id', 'dummyhash', 3);
  }

  // Seeding default content_pillars jika kosong
  const pillarCount = (db.prepare('SELECT COUNT(*) as count FROM content_pillars').get() as { count: number }).count;
  if (pillarCount === 0) {
    const insertPillar = db.prepare('INSERT INTO content_pillars (name, description, color) VALUES (?, ?, ?)');
    insertPillar.run('Aksi Kemanusiaan', 'Distribusi bantuan dan respon bencana', '#e11d48');
    insertPillar.run('Edukasi', 'Tips, wawasan kemanusiaan, dan SOP kerelawanan', '#2563eb');
    insertPillar.run('Donasi & Galang Dana', 'Kampanye donasi dan transparansi penghimpunan', '#16a34a');
    insertPillar.run('Laporan & Transparansi', 'Laporan penyaluran dan audit program berkala', '#d97706');
  }

  // Seeding default content_themes jika kosong
  const themeCount = (db.prepare('SELECT COUNT(*) as count FROM content_themes').get() as { count: number }).count;
  if (themeCount === 0) {
    const insertTheme = db.prepare('INSERT INTO content_themes (pillar_id, name, description) VALUES (?, ?, ?)');
    insertTheme.run(1, 'Tanggap Bencana', 'Respon cepat logistik dan evakuasi');
    insertTheme.run(1, 'Distribusi Wilayah Terpencil', 'Penyaluran logistik daerah 3T');
    insertTheme.run(2, 'Literasi Kebencanaan', 'Mitigasi dan kesiapsiagaan masyarakat');
    insertTheme.run(2, 'SOP Relawan', 'Protokol perlindungan anak dan keselamatan tim');
    insertTheme.run(3, 'Galang Dana Darurat', 'Campaign cepat respon krisis');
    insertTheme.run(3, 'Sedekah Program Rutin', 'Program bulanan beasiswa dan pangan');
    insertTheme.run(4, 'Laporan Penyaluran', 'Akuntabilitas penggunaan dana donasi');
    insertTheme.run(4, 'Audit Publik & Dampak', 'Cerita dampak dan transparansi keuangan');
  }

  // Seeding default content_calendar jika kosong
  const contentCount = (db.prepare('SELECT COUNT(*) as count FROM content_calendar').get() as { count: number }).count;
  if (contentCount === 0) {
    const insertContent = db.prepare(`
      INSERT INTO content_calendar (title, scheduled_at, channel, content_type, sub_type, request_bidang, pillar_id, assignee_id, status, remind_before)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertContent.run('Penyaluran paket sembako Cianjur', '2026-10-02 09:00:00', 'Instagram', 'carousel (image)', null, null, 1, 4, 'terbit', 0);
    insertContent.run('Infografis: cara donasi aman', '2026-10-05 12:00:00', 'Instagram', 'single image post', null, null, 2, 2, 'terbit', 0);
    insertContent.run('Dokumenter: Perjuangan Relawan Air Bersih', '2026-10-08 18:00:00', 'YouTube', 'Video panjang', 'dokumenter', null, 1, 3, 'terbit', 0);
    insertContent.run('Broadcast update penyaluran darurat', '2026-10-10 10:00:00', 'WhatsApp', 'channel post', null, null, 3, 4, 'terjadwal', 60);
    insertContent.run('Reels relawan di lapangan', '2026-10-12 19:00:00', 'Instagram', 'reels', null, null, 1, 3, 'terjadwal', 0);
    insertContent.run('Update donasi pekan ke-2', '2026-10-14 08:00:00', 'Facebook', 'single image post', null, null, 3, 2, 'draft', 1440);
    insertContent.run('Tips tanggap bencana banjir', '2026-10-16 11:00:00', 'Threads & X', 'artikel panjang', null, null, 2, 1, 'draft', 60);
    insertContent.run('Desain Laporan Penyaluran Q3', '2026-10-20 09:00:00', 'Kebutuhan Internal', 'desain request bidang', null, 'penyaluran-edukasi', 4, 1, 'draft', 0);
    insertContent.run('Shorts: Rekap aksi cepat 60 detik', '2026-10-20 15:00:00', 'YouTube', 'youtube shorts', null, null, 4, null, 'ide', 0);
    insertContent.run('Podcast Kemanusiaan: Dialog Ketahanan Pangan', '2026-10-24 20:00:00', 'YouTube', 'Video panjang', 'podcast', null, 2, 3, 'ide', 0);
    insertContent.run('Set Desain Program Safari Dakwah & Bantuan', '2026-10-28 17:00:00', 'Kebutuhan Internal', 'set desain program', null, 'fundraising', 1, 4, 'ide', 0);
  }

  // Seeding default reminders jika kosong
  const reminderCount = (db.prepare('SELECT COUNT(*) as count FROM reminders').get() as { count: number }).count;
  if (reminderCount === 0) {
    const insertReminder = db.prepare(`
      INSERT INTO reminders (content_id, title, message, remind_at, channel, is_sent, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertReminder.run(4, 'Siapkan aset visual Kampanye Bantu Pendidikan Anak', 'Jadwal tayang jam 10:00 di Website. Pastikan link donasi aktif.', '2026-10-10 09:00:00', 'in_app', 0, 'pending');
    insertReminder.run(6, 'Review draft copy: Update donasi pekan ke-2', 'Tayang besok jam 08:00 di Facebook. Cek nominal penghimpunan terbaru.', '2026-10-13 08:00:00', 'in_app', 0, 'pending');
    insertReminder.run(7, 'Verifikasi narasi Tips tanggap bencana banjir', 'Tayang 16 Oktober jam 11:00 di Instagram. Koordinasi dengan tim lapangan.', '2026-10-16 10:00:00', 'in_app', 0, 'pending');
  }

  // Seeding default metric_snapshots jika kosong
  const metricCount = (db.prepare('SELECT COUNT(*) as count FROM metric_snapshots').get() as { count: number }).count;
  if (metricCount === 0) {
    const insertMetric = db.prepare(`
      INSERT INTO metric_snapshots (source, channel, period, metric_name, metric_value, delta)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    // Sosmed summary & channels
    insertMetric.run('sosmed', 'all', '30d', 'followers_total', 48320, 3.4);
    insertMetric.run('sosmed', 'all', '30d', 'reach', 312500, 8.1);
    insertMetric.run('sosmed', 'all', '30d', 'engagement_rate', 4.6, -0.6);
    insertMetric.run('sosmed', 'all', '30d', 'posts_published', 38, 5.0);

    insertMetric.run('sosmed', 'Instagram', '30d', 'followers', 21400, 4.2);
    insertMetric.run('sosmed', 'Instagram', '30d', 'reach', 148200, 9.8);
    insertMetric.run('sosmed', 'Instagram', '30d', 'engagement', 5.2, 0.4);
    insertMetric.run('sosmed', 'Instagram', '30d', 'posts', 14, 2.0);

    insertMetric.run('sosmed', 'Facebook', '30d', 'followers', 14900, 1.8);
    insertMetric.run('sosmed', 'Facebook', '30d', 'reach', 76400, 2.4);
    insertMetric.run('sosmed', 'Facebook', '30d', 'engagement', 3.1, -0.2);
    insertMetric.run('sosmed', 'Facebook', '30d', 'posts', 10, 0);

    insertMetric.run('sosmed', 'TikTok', '30d', 'followers', 8300, 12.1);
    insertMetric.run('sosmed', 'TikTok', '30d', 'reach', 61900, 21.5);
    insertMetric.run('sosmed', 'TikTok', '30d', 'engagement', 6.7, 1.5);
    insertMetric.run('sosmed', 'TikTok', '30d', 'posts', 8, 4.0);

    insertMetric.run('sosmed', 'YouTube', '30d', 'followers', 3720, 0.8);
    insertMetric.run('sosmed', 'YouTube', '30d', 'reach', 26000, -1.7);
    insertMetric.run('sosmed', 'YouTube', '30d', 'engagement', 4.0, -0.1);
    insertMetric.run('sosmed', 'YouTube', '30d', 'posts', 6, 1.0);

    // Website summary
    insertMetric.run('website', 'Website', '30d', 'visitors', 21480, 6.2);
    insertMetric.run('website', 'Website', '30d', 'pageviews', 63910, 4.8);
    insertMetric.run('website', 'Website', '30d', 'avg_session_seconds', 161, 1.9);
    insertMetric.run('website', 'Website', '30d', 'bounce_rate', 48, -2.3);

    // Donasi summary
    insertMetric.run('donasi', 'all', '30d', 'total_donations', 184600000, 12.7);
    insertMetric.run('donasi', 'all', '30d', 'donors_count', 1268, 9.4);
    insertMetric.run('donasi', 'all', '30d', 'avg_donation', 145000, 3.0);
    insertMetric.run('donasi', 'all', '30d', 'active_campaigns', 7, 0);

    // Meta Ads summary
    insertMetric.run('meta', 'Meta', '30d', 'spend', 22400000, 4.5);
    insertMetric.run('meta', 'Meta', '30d', 'ad_reach', 540200, 10.3);
    insertMetric.run('meta', 'Meta', '30d', 'conversions', 864, 14.1);
    insertMetric.run('meta', 'Meta', '30d', 'cost_per_conversion', 25900, -8.2);
  }

  // Seeding donations jika kosong
  const donationCount = (db.prepare('SELECT COUNT(*) as count FROM donations').get() as { count: number }).count;
  if (donationCount === 0) {
    const insertDonation = db.prepare(`
      INSERT INTO donations (campaign_name, platform, amount, donors_count, target_amount, period, status)
      VALUES (?, ?, ?, ?, ?, '30d', 'active')
    `);
    insertDonation.run('Bantu Pendidikan Anak', 'Kitabisa', 72400000, 512, 100000000);
    insertDonation.run('Sembako untuk Korban Banjir', 'Website Lembaga', 58200000, 396, 75000000);
    insertDonation.run('Air Bersih Desa', 'Kitabisa', 31800000, 241, 60000000);
    insertDonation.run('Layanan Kesehatan Keliling', 'Website Lembaga', 22200000, 119, 50000000);
  }

  // Seeding ad_campaigns jika kosong
  const adCount = (db.prepare('SELECT COUNT(*) as count FROM ad_campaigns').get() as { count: number }).count;
  if (adCount === 0) {
    const insertAd = db.prepare(`
      INSERT INTO ad_campaigns (name, platform, objective, status, spend, reach, conversions, period)
      VALUES (?, 'Meta', ?, ?, ?, ?, ?, '30d')
    `);
    insertAd.run('Donasi Pendidikan Anak', 'Konversi', 'Aktif', 7800000, 198400, 342);
    insertAd.run('Sembako Korban Banjir', 'Konversi', 'Aktif', 6200000, 151200, 281);
    insertAd.run('Awareness Program Air Bersih', 'Jangkauan', 'Aktif', 4600000, 132900, 96);
    insertAd.run('Rekrut Relawan Oktober', 'Prospek', 'Selesai', 3800000, 57700, 145);
  }

  // Seeding top_pages jika kosong
  const pageCount = (db.prepare('SELECT COUNT(*) as count FROM top_pages').get() as { count: number }).count;
  if (pageCount === 0) {
    const insertPage = db.prepare('INSERT INTO top_pages (path, views, avg_time, period) VALUES (?, ?, ?, ?)');
    insertPage.run('/program/pendidikan-anak', 9120, '3m 05d', '30d');
    insertPage.run('/berita/penyaluran-cianjur', 7480, '2m 12d', '30d');
    insertPage.run('/tentang-kami', 5260, '1m 48d', '30d');
    insertPage.run('/laporan-tahunan', 3940, '4m 20d', '30d');
  }

  // Seeding projects & project_tasks jika kosong
  const projectCount = (db.prepare('SELECT COUNT(*) as count FROM projects').get() as { count: number }).count;
  if (projectCount === 0) {
    const insertProj = db.prepare(`
      INSERT INTO projects (name, owner, owner_id, start_date, end_date, progress, status)
      VALUES (?, ?, ?, ?, ?, ?, 'active')
    `);

    const p1 = insertProj.run('Kampanye Respons Bencana Cianjur', 'Dewi (Ketua Tim Lapangan)', 3, '2026-10-01', '2026-10-25', 65);
    const p2 = insertProj.run('Revitalisasi Portal Donasi Digital', 'Budi (Admin IT & Humas)', 2, '2026-10-05', '2026-11-10', 35);
    const p3 = insertProj.run('Penyusunan Laporan Tahunan Kemanusiaan 2026', 'Rani (Ketua Bidang Humas)', 1, '2026-10-10', '2026-12-15', 15);

    const insertTask = db.prepare(`
      INSERT INTO project_tasks (project_id, title, stage, assignee, assignee_id, due_date, priority)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    // Proyek 1
    insertTask.run(p1.lastInsertRowid, 'Liputan dokumentasi distribusi logistik', 'done', 'Dewi', 3, '2026-10-05', 'Tinggi');
    insertTask.run(p1.lastInsertRowid, 'Rilis siaran pers ke media nasional', 'done', 'Budi', 2, '2026-10-08', 'Sedang');
    insertTask.run(p1.lastInsertRowid, 'Produksi video rangkuman pekan ke-2', 'in_progress', 'Sari', 4, '2026-10-14', 'Tinggi');
    insertTask.run(p1.lastInsertRowid, 'Laporan dampak & infografis penerima manfaat', 'todo', 'Rani', 1, '2026-10-22', 'Sedang');

    // Proyek 2
    insertTask.run(p2.lastInsertRowid, 'Audit UX alur checkout donasi instan', 'done', 'Budi', 2, '2026-10-09', 'Sedang');
    insertTask.run(p2.lastInsertRowid, 'Integrasi payment gateway QRIS', 'in_progress', 'Budi', 2, '2026-10-18', 'Tinggi');
    insertTask.run(p2.lastInsertRowid, 'A/B testing landing page kampanye pendidikan', 'review', 'Sari', 4, '2026-10-24', 'Sedang');
    insertTask.run(p2.lastInsertRowid, 'Penyusunan panduan donasi bagi publik', 'todo', 'Rani', 1, '2026-11-05', 'Rendah');

    // Proyek 3
    insertTask.run(p3.lastInsertRowid, 'Pengumpulan data audit RAB & realisasi LRA', 'in_progress', 'Rani', 1, '2026-10-25', 'Tinggi');
    insertTask.run(p3.lastInsertRowid, 'Wawancara studi kasus mitra lapangan', 'todo', 'Dewi', 3, '2026-11-10', 'Sedang');
    insertTask.run(p3.lastInsertRowid, 'Desain layout & infografis booklet PDF', 'todo', 'Sari', 4, '2026-11-30', 'Sedang');
  }

  // Seeding default news_sources jika kosong
  const sourceCount = (db.prepare('SELECT COUNT(*) as count FROM news_sources').get() as { count: number }).count;
  if (sourceCount === 0) {
    const insertSrc = db.prepare(`
      INSERT INTO news_sources (name, type, url_or_handle, category, is_active, last_synced, unread_count)
      VALUES (?, ?, ?, ?, ?, datetime('now', '-10 minutes'), ?)
    `);

    insertSrc.run('BNPB Info Bencana', 'rss', 'https://bnpb.go.id/feed', 'Bencana', 1, 4);
    insertSrc.run('BMKG Cuaca & Gempa', 'rss', 'https://bmkg.go.id/rss', 'Bencana', 1, 2);
    insertSrc.run('Antara Humaniora', 'rss', 'https://antaranews.com/rss/humaniora', 'Bantuan Kemanusiaan', 1, 6);
    insertSrc.run('Google News: Penyaluran Bantuan', 'google_news', 'q=bantuan+kemanusiaan+indonesia', 'Bantuan Kemanusiaan', 1, 8);
    insertSrc.run('Google News: Banjir & Longsor', 'google_news', 'q=bencana+banjir+longsor', 'Bencana', 1, 5);
    insertSrc.run('Telegram Siaga Bencana Relawan', 'telegram', '@siagabencana_id', 'Bencana', 1, 11);
    insertSrc.run('Telegram Info Logistik Kemanusiaan', 'telegram', '@infologistik_ngo', 'Bantuan Kemanusiaan', 1, 3);
    insertSrc.run('Telegram Forum Relawan Nusantara', 'telegram', '@forumrelawan_nusantara', 'Sosial', 1, 7);
  }

  // Seeding default news_items jika kosong
  const newsItemCount = (db.prepare('SELECT COUNT(*) as count FROM news_items').get() as { count: number }).count;
  if (newsItemCount === 0) {
    const insertItem = db.prepare(`
      INSERT INTO news_items (
        source_id, title, source_type, source_name, url, published_at, summary, category, is_curated, is_important, channel_handle, is_read
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertItem.run(
      2,
      'BMKG Rilis Peringatan Dini Cuaca Ekstrem Jawa Barat 3 Hari ke Depan',
      'rss',
      'BMKG Cuaca & Gempa',
      'https://bmkg.go.id/peringatan-dini-jabar',
      '2026-10-10 09:15:00',
      'Potensi hujan lebat disertai kilat dan angin kencang berpeluang melanda wilayah Bogor, Cianjur, dan Sukabumi. Tim siaga bencana diimbau meningkatkan kesiapsiagaan logistik.',
      'Bencana',
      1,
      1,
      null,
      0
    );

    insertItem.run(
      6,
      'Update Jalur Logistik: Jembatan Darurat Cianjur Selatan Selesai Dibangun',
      'telegram',
      'Telegram Siaga Bencana Relawan',
      'https://t.me/siagabencana_id/4129',
      '2026-10-10 08:40:00',
      'Truk logistik sembako kapasitas hingga 5 ton kini sudah dapat melintas menuju 4 desa terisolir. Distribusi paket pangan lanjutan dijadwalkan mulai pukul 11:00 WIB.',
      'Bantuan Kemanusiaan',
      1,
      1,
      '@siagabencana_id',
      0
    );

    insertItem.run(
      4,
      'Kemenkes Percepat Distribusi Paket Gizi Balita Wilayah 3T',
      'google_news',
      'Google News: Penyaluran Bantuan',
      'https://news.google.com/articles/kemenkes-gizi-3t',
      '2026-10-10 07:30:00',
      'Pemerintah menggandeng koalisi NGO penyalur bantuan untuk menjangkau 25 ribu anak di daerah terluar guna menekan angka risiko stunting pascabencana.',
      'Kesehatan',
      1,
      0,
      null,
      0
    );

    insertItem.run(
      1,
      'BNPB Catat Tren Peningkatan Kejadian Bencana Hidrometeorologi Basah',
      'rss',
      'BNPB Info Bencana',
      'https://bnpb.go.id/berita/tren-hidrometeorologi-oktober',
      '2026-10-09 19:20:00',
      'Sebanyak 64 kejadian banjir dan tanah longsor tercatat dalam sepekan terakhir. Wilayah penyangga sungai diminta memperkuat koordinasi tanggap darurat.',
      'Bencana',
      1,
      0,
      null,
      1
    );

    insertItem.run(
      7,
      'Kebutuhan Mendesak Air Bersih di Pengungsian Desa Sukamaju',
      'telegram',
      'Telegram Info Logistik Kemanusiaan',
      'https://t.me/infologistik_ngo/1042',
      '2026-10-09 16:55:00',
      'Diperlukan tambahan 2 tangki air bersih harian dan 300 jeriken keluarga untuk pengungsi mandiri di posko 3. Relawan terdekat diharapkan merapat.',
      'Bantuan Kemanusiaan',
      1,
      1,
      '@infologistik_ngo',
      0
    );

    insertItem.run(
      3,
      'Transparansi Lembaga Donasi Digital Jadi Sorotan Publik di Era Pasca Bencana',
      'rss',
      'Antara Humaniora',
      'https://antaranews.com/humaniora/transparansi-donasi-digital',
      '2026-10-09 14:10:00',
      'Laporan audit terbuka dan pembaruan berkala via dasbor digital dinilai kunci meningkatkan kepercayaan muzaki serta donatur perseorangan.',
      'Regulasi',
      1,
      0,
      null,
      1
    );

    insertItem.run(
      8,
      'Inisiatif Dapur Umum Mandiri Ibu-Ibu Relawan di Posko Pengungsian',
      'telegram',
      'Telegram Forum Relawan Nusantara',
      'https://t.me/forumrelawan_nusantara/884',
      '2026-10-09 11:30:00',
      'Penyajian 1.200 porsi makanan hangat per hari berhasil dijalankan berkat kolaborasi bahan pangan lokal dan donasi sembako lembaga.',
      'Sosial',
      1,
      0,
      '@forumrelawan_nusantara',
      0
    );
  }

  // Seeding default trending_topics jika kosong
  const trendCount = (db.prepare('SELECT COUNT(*) as count FROM trending_topics').get() as { count: number }).count;
  if (trendCount === 0) {
    const insertTrend = db.prepare(`
      INSERT INTO trending_topics (rank, topic, category, growth_percentage, mention_count, recommended_angle, momentum)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insertTrend.run(1, 'Krisis Air Bersih Pasca Bencana', 'Bencana', 182, 14200, 'Publikasikan dokumentasi water treatment mobile dan distribusi jeriken darurat tim lapangan.', 'Meroket');
    insertTrend.run(2, 'Jalur Logistik Terisolir Cianjur', 'Bantuan Kemanusiaan', 124, 9850, 'Update video drone jembatan darurat dan call-to-action konvoi armada kemanusiaan.', 'Meroket');
    insertTrend.run(3, 'Transparansi Audit Donasi Digital', 'Regulasi', 78, 6400, 'Rilis infografis laporan penyaluran dana publik secara berkala via stories & dasbor terbuka.', 'Meningkat');
    insertTrend.run(4, 'Dapur Umum Mandiri Komunitas', 'Sosial', 62, 5120, 'Sorot kisah ketangguhan ibu-ibu relawan lokal dan kebutuhan bahan pokok harian.', 'Meningkat');
    insertTrend.run(5, 'Mitigasi Cuaca Ekstrem Musim Hujan', 'Bencana', 45, 4300, 'Panduan carousel kesiapsiagaan tas siaga bencana (TSB) keluarga.', 'Meningkat');
    insertTrend.run(6, 'Paket Gizi Darurat Balita 3T', 'Kesehatan', 28, 3100, 'Kolaborasi kampanye donasi spesifik makanan pendamping ASI (MPASI) sehat.', 'Stabil');
  }

  // Seeding default content_gaps jika kosong
  const gapCount = (db.prepare('SELECT COUNT(*) as count FROM content_gaps').get() as { count: number }).count;
  if (gapCount === 0) {
    const insertGap = db.prepare(`
      INSERT INTO content_gaps (gap_topic, target_pillar, suggested_format, potential_audience, reason, urgency)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    insertGap.run(
      'Prosedur & Keamanan Distribusi Logistik di Zona Rawan Gempa Susulan',
      'Edukasi Bencana & Humaniora',
      'Carousel Edukasi',
      'Relawan muda & komunitas donor daerah',
      'Audiens sering bertanya bagaimana relawan tetap aman saat bertugas, namun belum pernah ada konten panduan SOP keselamatan lapangan yang dipublikasikan.',
      'Tinggi'
    );
    insertGap.run(
      'Lika-Liku Pengelolaan Gudang Donasi Barang Bekas Layak Pakai vs Pangan Darurat',
      'Transparansi & Akuntabilitas',
      'Reels / Video Singkat',
      'Masyarakat umum & calon donatur perseorangan',
      'Sering terjadi penumpukan pakaian yang tidak sesuai kebutuhan darurat. Konten ini penting untuk mengedukasi donatur agar memprioritaskan bantuan higienis dan dana tunai.',
      'Tinggi'
    );
    insertGap.run(
      'Dukungan Psikososial Anak Pascabencana (Trauma Healing Sederhana)',
      'Sosial & Relawan',
      'Carousel Edukasi',
      'Guru, orang tua, & relawan pendamping tenda ramah anak',
      'Konten lembaga saat ini 85% terfokus pada logistik fisik; aspek pemulihan mental dan keceriaan anak belum terdokumentasikan secara terstruktur.',
      'Sedang'
    );
    insertGap.run(
      'Akuntabilitas Donasi Non-Tunai: Alur Pemanfaatan QRIS dan Pembayaran Otomatis',
      'Transparansi & Akuntabilitas',
      'Artikel Website & Press',
      'Donatur milenial & mitra teknologi perbankan',
      'Laporan audit digital perbankan dan settlement fee gateway belum pernah dirinci secara infografis padahal 60% donasi masuk via channel ini.',
      'Sedang'
    );
  }

  // Seeding default idea_recommendations & saved_ideas jika kosong
  const ideaCount = (db.prepare('SELECT COUNT(*) as count FROM idea_recommendations').get() as { count: number }).count;
  if (ideaCount === 0) {
    const insertIdea = db.prepare(`
      INSERT INTO idea_recommendations (hook_title, source_context, pillar, suggested_channel, expected_impact, rationale, key_points, is_skipped)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0)
    `);

    const i1 = insertIdea.run(
      'Kenapa 1 Jeriken Air Bersih Berarti Hidup dan Harapan Bagi 50 Jiwa?',
      'Tren Topik',
      'Edukasi Bencana & Humaniora',
      'Instagram',
      'Tinggi (Konversi Donasi)',
      'Topik air bersih sedang memuncak (+182%). Mengaitkannya dengan narasi mikro 1 jeriken mengubah empati publik menjadi tindakan transfer donasi langsung.',
      JSON.stringify([
        'Visual kontras: sumber air keruh vs instalasi filter air bergerak',
        'Data infografis kebutuhan harian satu keluarga di tenda darurat',
        'Call to action paket donasi sedekah air bersih Rp 50.000/keluarga'
      ])
    );

    const i2 = insertIdea.run(
      'POV Relawan: 12 Jam di Bak Truk Logistik Menembus Jalur Berlumpur',
      'Pola Performa Lampau',
      'Transparansi & Akuntabilitas',
      'TikTok',
      'Tinggi (Viral / Emosional)',
      'Reels logistik sebelumnya meraup engagement 9.2%. Format storytelling orang pertama (POV) memiliki retention rate 3.1x lipat di platform video pendek.',
      JSON.stringify([
        'Hook 3 detik pertama: ban truk amblas dan kerja bakti warga menarik tali tambang',
        'Suara natural lapangan tanpa musik berlebih untuk kesan otentik',
        'Penutup: apresiasi kepada semua donatur yang mendanai bahan bakar armada'
      ])
    );

    insertIdea.run(
      '3 Mitos Bantuan Barang Bekas: Mengapa Sumbangan Pakaian Sering Terbengkalai?',
      'Celah Konten',
      'Edukasi Bencana & Humaniora',
      'Instagram',
      'Stabil (Edukasi)',
      'Mengisi celah konten prioritas tinggi mengenai edukasi jenis bantuan yang paling tepat sasaran dan mengurangi beban pilah logistik di posko.',
      JSON.stringify([
        'Foto realita tumpukan baju basah yang tidak terpakai di posko',
        'Penjelasan biaya sortir & angkut vs bantuan pangan instan',
        'Solusi cerdas: alihkan ke infaq tunai terukur'
      ])
    );

    insertIdea.run(
      'Mini Dokumenter: Senyum Pertama di Tenda Sekolah Darurat',
      'Hari Besar Kemanusiaan',
      'Sosial & Relawan',
      'YouTube',
      'Tinggi (Viral / Emosional)',
      'Menjelang Hari Anak Sedunia, peliputan pemulihan psikososial anak akan menyentuh donatur institusi dan CSR perusahaan.',
      JSON.stringify([
        'Wawancara singkat relawan psikolog anak',
        'Aktivitas menggambar dan permainan interaktif anak-anak posko',
        'Pesan harapan masa depan pendidikan pascabencana'
      ])
    );

    // Seeding ide awal yang disimpan
    const insertSaved = db.prepare(`
      INSERT INTO saved_ideas (recommendation_id, hook_title, suggested_channel, pillar, rationale, status)
      VALUES (?, ?, ?, ?, ?, 'tersimpan')
    `);
    insertSaved.run(
      i1.lastInsertRowid,
      'Kenapa 1 Jeriken Air Bersih Berarti Hidup dan Harapan Bagi 50 Jiwa?',
      'Instagram',
      'Edukasi Bencana & Humaniora',
      'Topik air bersih sedang memuncak (+182%). Mengaitkannya dengan narasi mikro 1 jeriken mengubah empati publik menjadi tindakan transfer donasi langsung.'
    );
  }

  // Seeding default performance_reports & performance_rows jika kosong
  const perfReportCount = (db.prepare('SELECT COUNT(*) as count FROM performance_reports').get() as { count: number }).count;
  if (perfReportCount === 0) {
    const insertReport = db.prepare(`
      INSERT INTO performance_reports (title, period, start_date, end_date, notes)
      VALUES (?, ?, ?, ?, ?)
    `);

    const r30d = insertReport.run(
      'Laporan Performa Multi-Kanal Q3 (30 Hari Terakhir)',
      '30d',
      '2026-09-01',
      '2026-09-30',
      'Kompilasi capaian jangkauan, interaksi, dan konversi program kemanusiaan seluruh kanal resmi.'
    );

    const r90d = insertReport.run(
      'Laporan Kinerja Triwulan Lembaga (90 Hari Terakhir)',
      '90d',
      '2026-07-01',
      '2026-09-30',
      'Laporan perbandingan kinerja jangka panjang menjelang audit program semesteran.'
    );

    const r7d = insertReport.run(
      'Laporan Tanggap Cepat Mingguan (7 Hari Terakhir)',
      '7d',
      '2026-10-04',
      '2026-10-10',
      'Evaluasi kampanye respon tanggap darurat bencana sepekan.'
    );

    const insertRow = db.prepare(`
      INSERT INTO performance_rows (report_id, channel, period, reach, engagement, conversions, delta)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    // Data 7d
    insertRow.run(r7d.lastInsertRowid, 'Instagram', '7d', 48200, 3100, 85, 6.2);
    insertRow.run(r7d.lastInsertRowid, 'TikTok', '7d', 91000, 7400, 40, 18.5);
    insertRow.run(r7d.lastInsertRowid, 'YouTube', '7d', 15400, 1200, 22, -2.1);
    insertRow.run(r7d.lastInsertRowid, 'Website', '7d', 12100, 4300, 130, 4.0);
    insertRow.run(r7d.lastInsertRowid, 'Donasi', '7d', 8300, 2100, 210, 12.0);
    insertRow.run(r7d.lastInsertRowid, 'Iklan Meta', '7d', 120000, 5200, 150, -4.8);

    // Data 30d
    insertRow.run(r30d.lastInsertRowid, 'Instagram', '30d', 192000, 12800, 340, 9.8);
    insertRow.run(r30d.lastInsertRowid, 'TikTok', '30d', 365000, 29800, 160, 22.3);
    insertRow.run(r30d.lastInsertRowid, 'YouTube', '30d', 66000, 5100, 95, 3.4);
    insertRow.run(r30d.lastInsertRowid, 'Website', '30d', 51000, 18200, 520, 7.7);
    insertRow.run(r30d.lastInsertRowid, 'Donasi', '30d', 34000, 8700, 860, 15.4);
    insertRow.run(r30d.lastInsertRowid, 'Iklan Meta', '30d', 470000, 21000, 640, 1.9);

    // Data 90d
    insertRow.run(r90d.lastInsertRowid, 'Instagram', '90d', 540000, 35400, 910, 14.1);
    insertRow.run(r90d.lastInsertRowid, 'TikTok', '90d', 980000, 81000, 420, 31.0);
    insertRow.run(r90d.lastInsertRowid, 'YouTube', '90d', 188000, 14600, 270, 5.9);
    insertRow.run(r90d.lastInsertRowid, 'Website', '90d', 149000, 52000, 1480, 11.2);
    insertRow.run(r90d.lastInsertRowid, 'Donasi', '90d', 97000, 24000, 2350, 19.8);
    insertRow.run(r90d.lastInsertRowid, 'Iklan Meta', '90d', 1300000, 59000, 1720, 6.3);

    // Seeding catatan awal
    const insertNote = db.prepare(`
      INSERT INTO performance_notes (report_id, title, body, channel, period, meta)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    insertNote.run(
      r30d.lastInsertRowid,
      'Evaluasi Lonjakan Jangkauan TikTok Q3',
      'Penyampaian cerita di balik layar distribusi bantuan air bersih terbukti meningkatkan konversi donatur baru hingga 22.3%. Perlu dipertahankan untuk kuartal berikutnya.',
      'TikTok',
      '30d',
      'TikTok / 30d'
    );
  }

  // Seeding default budget_lines jika kosong
  const budgetCount = (db.prepare('SELECT COUNT(*) as count FROM budget_lines').get() as { count: number }).count;
  if (budgetCount === 0) {
    const insertBudget = db.prepare(`
      INSERT INTO budget_lines (program, category, rab, lra, owner, year, quarter, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertBudget.run('Kampanye Donasi Digital Ramadan', 'Media Sosial', 120000000, 98500000, 'Tim Media', 2026, 'Q1', 'hemat');
    insertBudget.run('Produksi Video Dokumenter Gempa Darurat', 'Produksi Konten', 85000000, 91200000, 'Tim Media', 2026, 'Q2', 'melebihi');
    insertBudget.run('Iklan Meta (Facebook & Instagram) Q1-Q2', 'Iklan Berbayar', 150000000, 112000000, 'Tim Humas', 2026, 'Q2', 'hemat');
    insertBudget.run('Pemeliharaan Website & Cloud Hosting', 'Infrastruktur', 36000000, 30000000, 'Tim Humas', 2026, 'Q1', 'sesuai');
    insertBudget.run('Liputan Media Massa & Press Release', 'Hubungan Media', 60000000, 41000000, 'Tim Humas', 2026, 'Q2', 'hemat');
    insertBudget.run('Penyusunan & Pencetakan Laporan Tahunan', 'Pelaporan', 45000000, 12500000, 'Ketua Bidang', 2026, 'Q3', 'hemat');
    insertBudget.run('Pengadaan Alat Liputan & Drone Lapangan', 'Produksi Konten', 65000000, 64800000, 'Tim Media', 2026, 'Q1', 'sesuai');
    insertBudget.run('Media Gathering & Buka Bersama Jurnalis', 'Hubungan Media', 30000000, 34500000, 'Tim Humas', 2026, 'Q1', 'melebihi');
    insertBudget.run('Audit Keuangan Lembaga & Publikasi Transparansi', 'Pelaporan', 50000000, 49000000, 'Ketua Bidang', 2025, 'Q4', 'sesuai');
    insertBudget.run('Kampanye Akhir Tahun Bersama Dhuafa', 'Media Sosial', 95000000, 94000000, 'Tim Media', 2025, 'Q4', 'sesuai');
  }

  // Seeding default annual_reports jika kosong
  const annualCount = (db.prepare('SELECT COUNT(*) as count FROM annual_reports').get() as { count: number }).count;
  if (annualCount === 0) {
    const insertAnnual = db.prepare(`
      INSERT INTO annual_reports (year, theme, executive_summary, total_donors, total_beneficiaries, total_funds_raised, total_funds_distributed, milestones, quarterly_progress, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'published')
    `);

    // 2026
    insertAnnual.run(
      2026,
      'Menjangkau yang Terjauh: Inovasi Penyaluran Bantuan Darurat & Berkelanjutan',
      'Pada tahun berjalan 2026, Humas dan Media NGO memprioritaskan akselerasi digital kampanye kemanusiaan terintegrasi, respons tanggap darurat bencana hidrometeorologi, dan transparansi penyaluran donasi publik.',
      48500,
      124000,
      14500000000,
      11800000000,
      JSON.stringify([
        { title: 'Respons Darurat Gempa & Banjir Bandang', date: 'Maret 2026', impact: 'Distribusi 8.500 paket pangan & shelter sementara di 4 kabupaten terdampak.' },
        { title: 'Kampanye Terpadu Ramadan 1447H', date: 'April 2026', impact: 'Penggalangan dana donasi mencapai 118% dari target kuartal pertama.' },
        { title: 'Peluncuran Mobile Water Treatment', date: 'Juni 2026', impact: 'Akses 50.000 liter air minum bersih harian untuk pengungsi.' },
        { title: 'Audit Publik & Dasbor Terbuka', date: 'September 2026', impact: 'Penyajian laporan keuangan wajar tanpa pengecualian (WTP).' }
      ]),
      JSON.stringify([
        { quarter: 'Q1', target: 'Kampanye Ramadan, respons bencana awal tahun, & audit donasi Q1', progress: 100, status: 'Tuntas' },
        { quarter: 'Q2', target: 'Penyaluran qurban pelosok nusantara & laporan semester', progress: 85, status: 'Berjalan' },
        { quarter: 'Q3', target: 'Program pemulihan pascabencana & beasiswa yatim dhuafa', progress: 55, status: 'Berjalan' },
        { quarter: 'Q4', target: 'Penyusunan laporan tahunan, evaluasi dampak, & audit eksternal', progress: 15, status: 'Direncanakan' }
      ])
    );

    // 2025
    insertAnnual.run(
      2025,
      'Ketangguhan Bersama: Kolaborasi Lintas Lembaga untuk Kemanusiaan',
      'Tahun 2025 berhasil ditutup dengan peningkatan serapan anggaran kemanusiaan sebesar 94.2% dan pembukaan 12 posko wilayah respon cepat di Indonesia timur.',
      62400,
      185000,
      19800000000,
      18650000000,
      JSON.stringify([
        { title: 'Ekspedisi Kemanusiaan Pulau Terluar', date: 'Mei 2025', impact: 'Penyaluran fasilitas kesehatan & genset surya untuk 15 pulau terluar.' },
        { title: 'Dapur Gizi Balita & Ibu Hamil', date: 'Agustus 2025', impact: 'Penurunan angka risiko stunting pada 3.200 balita binaan.' },
        { title: 'Penghargaan Transparansi Lembaga Filantropi', date: 'November 2025', impact: 'Meraih predikat Akuntabilitas Terbaik Nasional.' }
      ]),
      JSON.stringify([
        { quarter: 'Q1', target: 'Eksplorasi wilayah sasaran 3T & kampanye donasi awal tahun', progress: 100, status: 'Tuntas' },
        { quarter: 'Q2', target: 'Distribusi bantuan pangan darurat & logistik pertengahan tahun', progress: 100, status: 'Tuntas' },
        { quarter: 'Q3', target: 'Pembangunan infrastruktur air bersih & sanitasi', progress: 100, status: 'Tuntas' },
        { quarter: 'Q4', target: 'Konsolidasi laporan tahunan & audit tahunan final', progress: 100, status: 'Tuntas' }
      ])
    );

    // 2024
    insertAnnual.run(
      2024,
      'Fondasi Kepedulian: Memperkuat Kapasitas Relawan & Jejaring Donatur',
      'Transformasi digital sistem informasi donasi dan integrasi pelaporan keuangan berbasis dasbor terpusat pertama kali diresmikan di tahun 2024.',
      51200,
      142000,
      16200000000,
      15100000000,
      JSON.stringify([
        { title: 'Digitalisasi CRM Donatur Lembaga', date: 'April 2024', impact: 'Peningkatan retensi donatur rutin bulanan hingga 35%.' },
        { title: 'Respons Tanggap Darurat Lahar Dingin', date: 'Juli 2024', impact: 'Evakuasi & suplai logistik bagi 6.000 jiwa warga terdampak.' }
      ]),
      JSON.stringify([
        { quarter: 'Q1', target: 'Inisiasi integrasi dasbor sistem IT lembaga', progress: 100, status: 'Tuntas' },
        { quarter: 'Q2', target: 'Operasionalisasi pos siaga bencana wilayah barat', progress: 100, status: 'Tuntas' },
        { quarter: 'Q3', target: 'Pengadaan armada ambulans dan mobil logistik', progress: 100, status: 'Tuntas' },
        { quarter: 'Q4', target: 'Laporan tahunan konsolidasi 2024', progress: 100, status: 'Tuntas' }
      ])
    );
  }

  // Seeding default knowledge_categories jika kosong
  const catCount = (db.prepare('SELECT COUNT(*) as count FROM knowledge_categories').get() as { count: number }).count;
  if (catCount === 0) {
    const insertCat = db.prepare(`
      INSERT INTO knowledge_categories (name, slug, description, icon, color)
      VALUES (?, ?, ?, ?, ?)
    `);
    insertCat.run('SOP', 'sop', 'Standar operasional baku prosedur kerja lapangan dan tata kelola internal', '📋', '#dc2626');
    insertCat.run('Panduan Teknis', 'panduan-teknis', 'Petunjuk operasional teknis sistem, IT, dan perlengkapan', '🛠️', '#2563eb');
    insertCat.run('Pedoman Brand', 'pedoman-brand', 'Identitas visual, tata letak logo, dan standarisasi publikasi', '🎨', '#7c3aed');
    insertCat.run('Alur Kerja', 'alur-kerja', 'Diagram alir proses bertahap dari pra hingga pasca kegiatan', '🔄', '#059669');
    insertCat.run('Template', 'template', 'Berkas acuan baku dokumen kerja dan pelaporan', '📑', '#d97706');
  }

  // Seeding default knowledge_docs jika kosong
  const docCount = (db.prepare('SELECT COUNT(*) as count FROM knowledge_docs').get() as { count: number }).count;
  if (docCount === 0) {
    const getCatId = (name: string) => {
      const row = db.prepare('SELECT id FROM knowledge_categories WHERE name = ?').get(name) as any;
      return row ? row.id : null;
    };

    const insertDoc = db.prepare(`
      INSERT INTO knowledge_docs (code, title, category, category_id, description, version, author, access_role, read_time, related_codes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertSection = db.prepare(`
      INSERT INTO doc_sections (doc_id, position, heading, content, checklist, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertStep = db.prepare(`
      INSERT INTO sop_steps (doc_id, step_number, phase, title, actor, action, output, sla_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Dokumen 1: SOP Peliputan Lapangan
    const d1 = insertDoc.run(
      'SOP-HUM-01',
      'SOP Peliputan dan Dokumentasi Bencana di Lapangan',
      'SOP',
      getCatId('SOP'),
      'Prosedur keselamatan tim media, etika wawancara penyintas, batas zona merah, dan perlindungan privasi anak penyintas bencana.',
      'v2.3',
      'Koordinator Peliputan Lapangan',
      'all',
      '6 menit',
      JSON.stringify(['SOP-DON-02', 'SOP-IT-03', 'WRK-PUB-01'])
    );
    const d1Id = d1.lastInsertRowid;

    insertSection.run(
      d1Id,
      1,
      '1. Tujuan dan Ruang Lingkup',
      'Dokumen ini mengatur tata laksana standar bagi seluruh personil Humas, fotografer, videografer, dan relawan dokumentasi saat bertugas di lokasi bencana alam maupun tanggap darurat krisis kemanusiaan.',
      null,
      'Berlaku wajib sejak hari pertama fase tanggap darurat dideklarasikan oleh komandan posko operasi.'
    );

    insertSection.run(
      d1Id,
      2,
      '2. Protokol Keselamatan dan Alat Pelindung Diri (APD)',
      'Keselamatan jiwa personil selalu menjadi prioritas di atas materi liputan. Tim dilarang memasuki radius zona merah aktif tanpa izin resmi Basarnas atau TNI/Polri.',
      JSON.stringify([
        'Rompi identitas kemanusiaan lembaga dan helm keselamatan wajib dipakai setiap saat di lapangan.',
        'Sepatu bot keselamatan dan kartu identitas darurat (tertera golongan darah dan kontak darurat keluarga).',
        'Perangkat komunikasi radio dua arah (HT) cadangan baterai penuh serta powerbank.',
        'Pouch kedap air untuk kartu memori cadangan dan paspor/dokumen resmi relawan.'
      ]),
      null
    );

    insertStep.run(
      d1Id,
      1,
      'Fase Pra-Keberangkatan',
      'Briefing Keamanan & Pembagian Zona',
      'Koordinator Liputan & Tim Dokumentasi',
      'Menghadiri briefing komando di posko induk, mencatat titik kumpul aman (assembly point), serta mengecek fungsi APD dan alat komunikasi satelit.',
      'Surat tugas peliputan terverifikasi & peta zona bahaya.',
      '30 menit sebelum berangkat'
    );

    insertStep.run(
      d1Id,
      2,
      'Fase Tiba di Lapangan',
      'Izin Tokoh Lokal & Asesmen Etis',
      'Fotografer / Reporter',
      'Menghubungi ketua posko setempat, memperkenalkan diri sebagai tim kemanusiaan resmi, dan meminta persetujuan lisan sebelum merekam aktivitas warga.',
      'Izin akses liputan & catatan etika budaya setempat.',
      'Maksimal 15 menit pasca tiba'
    );

    // Dokumen 2: SOP Krisis Komunikasi
    insertDoc.run(
      'SOP-HUM-02',
      'SOP Komunikasi Krisis dan Manajemen Isu Negatif Lembaga',
      'SOP',
      getCatId('SOP'),
      'Panduan eskalasi juru bicara, penanganan hoaks, pernyataan sikap resmi satu pintu (single voice policy), dan waktu tanggap klarifikasi.',
      'v3.0',
      'Ketua Bidang Humas & Media',
      'head',
      '8 menit',
      JSON.stringify(['SOP-HUM-01', 'BRD-GUI-01'])
    );

    // Dokumen 3: Pedoman Brand
    insertDoc.run(
      'BRD-GUI-01',
      'Pedoman Visual Identitas Brand, Palet Warna, dan Tipografi Lembaga',
      'Pedoman Brand',
      getCatId('Pedoman Brand'),
      'Ketentuan penggunaan logo pada rompi relawan, kartu nama, backdrop konferensi pers, filter foto media sosial, dan materi cetak resmi.',
      'v2.0',
      'Creative Lead Designer',
      'all',
      '5 menit',
      JSON.stringify(['WRK-PUB-01'])
    );

    // Dokumen 4: Alur Kerja Publikasi
    insertDoc.run(
      'WRK-PUB-01',
      'Alur Kerja Produksi Konten Kampanye Digital Terintegrasi',
      'Alur Kerja',
      getCatId('Alur Kerja'),
      'Diagram tahapan mulai dari riset topik, penulisan naskah, persetujuan redaksi, penjadwalan kalender, hingga evaluasi engagement.',
      'v1.4',
      'Editor Pelaksana Media',
      'all',
      '5 menit',
      null
    );

    // Dokumen 5: Template RAB
    insertDoc.run(
      'TPL-LRA-01',
      'Panduan dan Template Penyusunan RAB Program Humas',
      'Template',
      getCatId('Template'),
      'Format baku estimasi biaya iklan meta, pengadaan materi liputan, honorarium kontributor daerah, dan realisasi LRA.',
      'v2.1',
      'Divisi Administrasi Keuangan Humas',
      'admin',
      '7 menit',
      null
    );

    // Dokumen 6: Prosedur DAM NAS
    insertDoc.run(
      'SOP-IT-03',
      'Prosedur Akses Digital Asset Management (DAM Local NAS)',
      'Panduan Teknis',
      getCatId('Panduan Teknis'),
      'Tata cara koneksi ke server NAS lokal kantor, struktur folder liputan per tahun, penamaan file RAW, dan hak akses folder sensitif.',
      'v1.2',
      'Admin Infrastruktur IT',
      'all',
      '4 menit',
      null
    );

    // Dokumen 7: Etika Donatur
    insertDoc.run(
      'SOP-DON-02',
      'Etika Publikasi Donatur dan Penerima Manfaat',
      'SOP',
      getCatId('SOP'),
      'Aturan kepatuhan perlindungan data pribadi donatur dan martabat keluarga dhuafa dalam publikasi materi visual.',
      'v1.8',
      'Divisi Advokasi & Legal Lembaga',
      'all',
      '9 menit',
      null
    );

    // Dokumen 8: Template Laporan
    insertDoc.run(
      'TPL-RPT-02',
      'Template Standar Laporan Akuntabilitas Semesteran',
      'Template',
      getCatId('Template'),
      'Dokumen acuan format ringkasan eksekutif, tabel infografis capaian, dan matriks pertanggungjawaban dana publik.',
      'v2.0',
      'Sekretariat Bidang',
      'head',
      '10 menit',
      null
    );
  }

  // Seeding default doc_proposals jika kosong
  const proposalCount = (db.prepare('SELECT COUNT(*) as count FROM doc_proposals').get() as { count: number }).count;
  if (proposalCount === 0) {
    const insertProposal = db.prepare(`
      INSERT INTO doc_proposals (
        proposal_code, type, title, category, target_doc_code, target_doc_title,
        submitter_name, submitter_role, urgency, reason, suggested_content,
        status, reviewed_by, reviewed_at, review_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertProposal.run(
      'USUL-2026-001',
      'revision',
      'Pembaruan Batas Waktu Unggah Dokumentasi Tanggap Darurat Bencana',
      'SOP',
      'SOP-HUM-01',
      'SOP Peliputan dan Dokumentasi Bencana di Lapangan',
      'Rian Pratama',
      'staff',
      'penting',
      'Koneksi internet di posko bencana sering mengalami kendala bandwidth saat jam malam sehingga batas unggah jam 21.00 WIB sulit dipenuhi.',
      'Menambahkan opsi kelonggaran pengunggahan bertahap (priority batching: foto resolusi sedang untuk siaran pers dahulu, file RAW pagi hari).',
      'menunggu_tinjauan',
      null,
      null,
      null
    );

    insertProposal.run(
      'USUL-2026-002',
      'new',
      'Panduan Penanganan Hak Jawab dan Klarifikasi Berita Viral Medsos',
      'Panduan Teknis',
      null,
      null,
      'Dewi Lestari',
      'staff',
      'mendesak',
      'Belum ada panduan resmi tata cara merespons misinformasi penyaluran bantuan di platform X dan TikTok saat isu sedang bergulir cepat.',
      'Membuat matriks respon krisis medsos, format template pernyataan klarifikasi resmi, dan pembatasan wewenang admin akun.',
      'menunggu_tinjauan',
      null,
      null,
      null
    );

    insertProposal.run(
      'USUL-2026-003',
      'revision',
      'Penyesuaian Aturan Perlindungan Wajah Penerima Manfaat Dhuafa Lansia',
      'SOP',
      'SOP-DON-02',
      'Etika Publikasi Donatur dan Penerima Manfaat',
      'Ahmad Fauzi',
      'admin',
      'normal',
      'Menegaskan batas persetujuan dokumentasi untuk lansia yang hidup sebatang kara dan menjaga harkat martabat keluarga.',
      'Penambahan klausul persetujuan berbasis saksi aparat desa setempat bila penerima manfaat berhalangan tanda tangan.',
      'disetujui',
      'Dr. Hendra Gunawan (Ketua Bidang Humas)',
      '06 Oktober 2026, 16:45 WIB',
      'Disetujui untuk diintegrasikan pada revisi SOP v1.9 bulan depan.'
    );

    const insertLog = db.prepare(`
      INSERT INTO doc_proposal_logs (proposal_id, action, previous_status, new_status, actor_name, actor_role, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertLog.run(
      1,
      'created',
      null,
      'menunggu_tinjauan',
      'Rian Pratama',
      'staff',
      'Pengajuan awal usulan revisi batas waktu unggah SOP-HUM-01.'
    );

    insertLog.run(
      3,
      'status_changed',
      'menunggu_tinjauan',
      'disetujui',
      'Dr. Hendra Gunawan',
      'head',
      'Disetujui untuk diintegrasikan pada revisi SOP v1.9 bulan depan.'
    );
  }

  // Seeding default permissions & role_permissions jika kosong
  const permCount = (db.prepare('SELECT COUNT(*) as count FROM permissions').get() as { count: number }).count;
  if (permCount === 0) {
    const insertPerm = db.prepare(`
      INSERT INTO permissions (key, label, description, module)
      VALUES (?, ?, ?, ?)
    `);

    insertPerm.run('content_create_edit', 'Buat & Sunting Draft Konten', 'Menyusun naskah, aset visual, dan draf jadwal publikasi', 'content');
    insertPerm.run('content_approve_publish', 'Persetujuan & Publikasi Resmi', 'Mengesahkan draf materi dan menerbitkan ke kanal resmi media sosial', 'content');
    insertPerm.run('budget_manage', 'Kelola Rencana & Realisasi Anggaran', 'Mengubah alokasi pagu, mengunggah SPJ, dan merevisi baris anggaran', 'budget');
    insertPerm.run('knowledge_publish', 'Pengesahan Dokumen SOP & Pedoman', 'Menyetujui usulan revisi dokumen dan mengarsipkan versi lama', 'knowledge');
    insertPerm.run('system_settings_manage', 'Konfigurasi Sistem & Integrasi NAS/Cloud', 'Mengatur token API, kredensial penyimpanan DAM, dan manajemen akun', 'system');
    insertPerm.run('audit_logs_read', 'Akses Jejak Audit & Keamanan', 'Membaca log aktivitas menyeluruh pengguna dan kegagalan autentikasi', 'audit');

    // Mapping default permissions per role (1: head, 2: admin, 3: staff)
    const insertRolePerm = db.prepare(`
      INSERT INTO role_permissions (role_id, permission_id, granted)
      VALUES (?, ?, ?)
    `);

    // Head: all granted
    for (let pId = 1; pId <= 6; pId++) {
      insertRolePerm.run(1, pId, 1);
    }

    // Admin: content_create, content_approve, budget_manage, system_manage, audit_read
    insertRolePerm.run(2, 1, 1); // content_create
    insertRolePerm.run(2, 2, 1); // content_approve
    insertRolePerm.run(2, 3, 1); // budget_manage
    insertRolePerm.run(2, 4, 0); // knowledge_publish
    insertRolePerm.run(2, 5, 1); // system_settings
    insertRolePerm.run(2, 6, 1); // audit_logs

    // Staff: content_create only
    insertRolePerm.run(3, 1, 1); // content_create
    insertRolePerm.run(3, 2, 0);
    insertRolePerm.run(3, 3, 0);
    insertRolePerm.run(3, 4, 0);
    insertRolePerm.run(3, 5, 0);
    insertRolePerm.run(3, 6, 0);
  }

  // Seeding default system_settings jika kosong
  const settingCount = (db.prepare('SELECT COUNT(*) as count FROM system_settings').get() as { count: number }).count;
  if (settingCount === 0) {
    const insertSetting = db.prepare(`
      INSERT INTO system_settings (key, value, category, description)
      VALUES (?, ?, ?, ?)
    `);

    insertSetting.run('org_name', 'Yayasan Kemanusiaan Peduli Negeri', 'organization', 'Nama resmi organisasi kemanusiaan');
    insertSetting.run('org_short_name', 'Peduli Negeri', 'organization', 'Nama singkat tampilan header');
    insertSetting.run('org_tagline', 'Menebar Manfaat, Membangun Martabat Negeri Bersama', 'organization', 'Slogan resmi');
    insertSetting.run('org_contact_email', 'humas@pedulinegeri.org', 'contact', 'Email resmi kontak media');
    insertSetting.run('org_contact_phone', '+62 21 4288 9910', 'contact', 'Hotline narahubung media');
    insertSetting.run('fiscal_year', '2026', 'finance', 'Tahun pembukuan anggaran aktif');
    insertSetting.run('timezone', 'Asia/Jakarta', 'localization', 'Zona waktu operasional sistem');
  }

  // Seeding default system_integrations jika kosong
  const integrationCount = (db.prepare('SELECT COUNT(*) as count FROM system_integrations').get() as { count: number }).count;
  if (integrationCount === 0) {
    const insertIntegration = db.prepare(`
      INSERT INTO system_integrations (service_key, name, category, status, endpoint, config_json, last_sync_at, last_status_message)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertIntegration.run(
      'dam_nas',
      'DAM Server Lokal (Synology NAS)',
      'storage',
      'connected',
      'smb://192.168.1.200/dam-humas/arsip-media',
      JSON.stringify({ protocol: 'smb3', host: '192.168.1.200', serviceUser: 'dam-agent-srv' }),
      '2026-10-11 20:30:00',
      'Sinkronisasi normal (1,420 aset terindeks)'
    );

    insertIntegration.run(
      'google_workspace',
      'Akun Google (SSO, AI Pro, Drive & Calendar)',
      'cloud',
      'connected',
      'https://www.googleapis.com/drive/v3/files',
      JSON.stringify({ accountEmail: 'humas.pedulinegeri@gmail.com', plan: 'Google AI Pro (Gemini Advanced & 2TB Drive)', authMethod: 'Google SSO OAuth2' }),
      '2026-10-11 20:44:00',
      'Terhubung via Google SSO (Paket Google AI Pro Aktif)'
    );

    insertIntegration.run(
      'meta_ads',
      'Meta Graph API (Instagram & Facebook)',
      'social',
      'connected',
      'https://graph.facebook.com/v19.0',
      JSON.stringify({ accountId: 'act_99812401', pageName: 'Peduli Negeri ID' }),
      '2026-10-11 20:00:00',
      'Metrik jangkauan dan performa diperbarui'
    );

    insertIntegration.run(
      'telegram_bot',
      'Telegram Bot Siaga Humas',
      'messaging',
      'warning',
      'https://api.telegram.org/bot[TOKEN]',
      JSON.stringify({ botUsername: '@PeduliHumasAlertBot', chatId: '-10018829910' }),
      '2026-10-10 21:05:00',
      'Peringatan: Webhook memerlukan validasi ulang SSL'
    );
  }

  // Seeding default audit_logs jika kosong
  const auditCount = (db.prepare('SELECT COUNT(*) as count FROM audit_logs').get() as { count: number }).count;
  if (auditCount === 0) {
    const insertAudit = db.prepare(`
      INSERT INTO audit_logs (user_id, user_name, user_role, action, target, ip_address, status, details)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertAudit.run(2, 'Budi Santoso', 'admin', 'Perbaruan Konfigurasi Integrasi', 'Akun Google SSO Token (Google AI Pro)', '192.168.1.45', 'success', 'Token SSO diperbarui otomatis via login akun Google');
    insertAudit.run(1, 'Rani Maulida', 'head', 'Pengesahan Revisi SOP Humas', 'SOP-HUM-01 (Kanal Krisis Bencana)', '180.252.16.89', 'success', 'Revisi disahkan per rapat pimpinan');
    insertAudit.run(null, 'Sistem Otomatis DAM', 'service_agent', 'Sinkronisasi Folder SMB', '48 Berkas Foto Dokumentasi Baru Dipindai', '192.168.1.200', 'success', 'Penambahan metadata EXIF');
    insertAudit.run(null, 'Percobaan Masuk Tamu', 'anonymous', 'Gagal Autentikasi Pengguna', 'admin.backup@pedulinegeri.org (Salah Sandi)', '114.124.201.33', 'failed', '3x percobaan salah sandi berurutan');
  }
}

/* ==========================================================================
   HELPER QUERY SQLITE PER ENTITAS
   ========================================================================== */

export const dbQueries = {
  // 1. Roles & Users
  users: {
    getAll: () => db.prepare('SELECT id, name, email, role_id, created_at FROM users ORDER BY id ASC').all(),
    getById: (id: number) => db.prepare('SELECT id, name, email, role_id, created_at FROM users WHERE id = ?').get(id),
    getByEmail: (email: string) => db.prepare('SELECT * FROM users WHERE email = ?').get(email),
  },

  // 2. Content Calendar & Pillars
  content: {
    getAll: (params?: { channel?: string; pillarId?: number; assigneeId?: number }) => {
      let query = `
        SELECT c.*, p.name as pillar_name, p.color as pillar_color, u.name as assignee_name
        FROM content_calendar c
        LEFT JOIN content_pillars p ON c.pillar_id = p.id
        LEFT JOIN users u ON c.assignee_id = u.id
        WHERE 1=1
      `;
      const queryParams: any[] = [];
      if (params?.channel) {
        query += ` AND c.channel = ?`;
        queryParams.push(params.channel);
      }
      if (params?.pillarId) {
        query += ` AND c.pillar_id = ?`;
        queryParams.push(params.pillarId);
      }
      if (params?.assigneeId) {
        query += ` AND c.assignee_id = ?`;
        queryParams.push(params.assigneeId);
      }
      query += ` ORDER BY c.scheduled_at ASC`;
      return db.prepare(query).all(...queryParams);
    },
    getPillars: () => db.prepare('SELECT * FROM content_pillars ORDER BY id ASC').all(),
    getThemes: (pillarId?: number) => {
      return pillarId
        ? db.prepare('SELECT * FROM content_themes WHERE pillar_id = ? ORDER BY id ASC').all(pillarId)
        : db.prepare('SELECT * FROM content_themes ORDER BY id ASC').all();
    },
  },

  // 3. Metrics, Donations, Ad Campaigns, Top Pages
  metrics: {
    getSnapshots: (source?: string, period = '30d') => {
      return source
        ? db.prepare('SELECT * FROM metric_snapshots WHERE source = ? AND period = ?').all(source, period)
        : db.prepare('SELECT * FROM metric_snapshots WHERE period = ?').all(period);
    },
    getDonations: () => db.prepare('SELECT * FROM donations ORDER BY amount DESC').all(),
    getAdCampaigns: () => db.prepare('SELECT * FROM ad_campaigns ORDER BY spend DESC').all(),
    getTopPages: () => db.prepare('SELECT * FROM top_pages ORDER BY views DESC').all(),
  },

  // 4. Projects & Tasks
  projects: {
    getAll: () => {
      const projs = db.prepare('SELECT * FROM projects ORDER BY id ASC').all() as any[];
      return projs.map((p) => ({
        ...p,
        tasks: db.prepare('SELECT * FROM project_tasks WHERE project_id = ? ORDER BY id ASC').all(p.id),
      }));
    },
    getTasks: (projectId?: number) => {
      return projectId
        ? db.prepare('SELECT * FROM project_tasks WHERE project_id = ? ORDER BY id ASC').all(projectId)
        : db.prepare('SELECT * FROM project_tasks ORDER BY id ASC').all();
    },
  },

  // 5. News Sources & News Items
  news: {
    getSources: (activeOnly = false) => {
      return activeOnly
        ? db.prepare('SELECT * FROM news_sources WHERE is_active = 1 ORDER BY id ASC').all()
        : db.prepare('SELECT * FROM news_sources ORDER BY id ASC').all();
    },
    getStream: (limit = 50) => {
      return db.prepare('SELECT * FROM news_items ORDER BY published_at DESC LIMIT ?').all(limit);
    },
  },

  // 6. Insights
  insights: {
    getTrending: () => db.prepare('SELECT * FROM trending_topics ORDER BY rank ASC').all(),
    getGaps: () => db.prepare('SELECT * FROM content_gaps ORDER BY id ASC').all(),
    getRecommendations: () => db.prepare('SELECT * FROM idea_recommendations WHERE is_skipped = 0 ORDER BY id ASC').all(),
    getSaved: () => db.prepare('SELECT * FROM saved_ideas ORDER BY id DESC').all(),
  },

  // 7. Knowledge & SOP
  knowledge: {
    getCategories: () => db.prepare('SELECT * FROM knowledge_categories ORDER BY id ASC').all(),
    getDocs: (search?: string) => {
      return search
        ? db.prepare('SELECT * FROM knowledge_docs WHERE title LIKE ? OR description LIKE ?').all(`%${search}%`, `%${search}%`)
        : db.prepare('SELECT * FROM knowledge_docs ORDER BY id ASC').all();
    },
    getProposals: () => db.prepare('SELECT * FROM doc_proposals ORDER BY id DESC').all(),
  },

  // 8. Budget & Annual Reports
  budget: {
    getLines: (year = 2026) => db.prepare('SELECT * FROM budget_lines WHERE year = ? ORDER BY id ASC').all(year),
    getAnnualReports: () => db.prepare('SELECT * FROM annual_reports ORDER BY year DESC').all(),
  },

  // 9. Audit Logs
  audit: {
    getRecent: (limit = 100) => db.prepare('SELECT * FROM audit_logs ORDER BY id DESC LIMIT ?').all(limit),
  },
};


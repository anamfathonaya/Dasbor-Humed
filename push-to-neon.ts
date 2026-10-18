import Database from 'better-sqlite3';
import { neon } from '@neondatabase/serverless';
import path from 'node:path';

// Connection string from CLI argument or environment variable
const neonUrl = process.argv[2] || process.env.NEON_DATABASE_URL;

if (!neonUrl) {
  console.error('\n[ERROR] Silakan masukkan connection string Neon!\n');
  console.log('Contoh penggunaan:');
  console.log('  npx tsx push-to-neon.ts "postgresql://neondb_owner:password@ep-still-sea-b3d1ijpg.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"\n');
  process.exit(1);
}

const sqliteDbPath = path.resolve(process.cwd(), 'dasbor.db');
console.log(`Membaca database SQLite dari: ${sqliteDbPath}`);
const sqlite = new Database(sqliteDbPath, { readonly: true });
const sql = neon(neonUrl);

const tablesInOrder = [
  'roles',
  'users',
  'content_pillars',
  'content_themes',
  'content_calendar',
  'reminders',
  'metric_snapshots',
  'donations',
  'ad_campaigns',
  'top_pages',
  'projects',
  'project_tasks',
  'news_sources',
  'news_items',
  'news_bookmarks',
  'news_references',
  'trending_topics',
  'content_gaps',
  'idea_recommendations',
  'saved_ideas',
  'performance_reports',
  'performance_rows',
  'performance_notes',
  'budget_lines',
  'budget_revisions',
  'annual_reports',
  'shared_reports',
  'knowledge_categories',
  'knowledge_docs',
  'doc_sections',
  'sop_steps',
  'doc_proposals',
  'doc_proposal_logs',
  'permissions',
  'role_permissions',
  'system_settings',
  'system_integrations',
  'dam_shares',
  'integration_sync_jobs',
  'audit_logs'
];

const booleanColumns: Record<string, string[]> = {
  reminders: ['is_sent'],
  news_sources: ['is_active'],
  news_items: ['is_curated', 'is_important', 'is_read'],
  content_gaps: ['is_adopted'],
  idea_recommendations: ['is_skipped'],
  knowledge_docs: ['is_archived'],
  role_permissions: ['granted']
};

const ddlStatements = `
  CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    permissions TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role_id INTEGER,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS content_pillars (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT NOT NULL DEFAULT '#2563eb'
  );

  CREATE TABLE IF NOT EXISTS content_themes (
    id SERIAL PRIMARY KEY,
    pillar_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS content_calendar (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    scheduled_at TIMESTAMP NOT NULL,
    channel TEXT NOT NULL,
    content_type TEXT,
    sub_type TEXT,
    request_bidang TEXT,
    pillar_id INTEGER,
    assignee_id INTEGER,
    status TEXT NOT NULL DEFAULT 'draft',
    remind_before INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS reminders (
    id SERIAL PRIMARY KEY,
    content_id INTEGER,
    task_id INTEGER,
    title TEXT NOT NULL DEFAULT '',
    message TEXT,
    remind_at TIMESTAMP NOT NULL,
    channel TEXT DEFAULT 'in_app',
    is_sent BOOLEAN DEFAULT false,
    sent_at TIMESTAMP,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS metric_snapshots (
    id SERIAL PRIMARY KEY,
    source TEXT NOT NULL,
    channel TEXT,
    period TEXT NOT NULL DEFAULT '30d',
    metric_name TEXT NOT NULL,
    metric_value DOUBLE PRECISION NOT NULL,
    delta DOUBLE PRECISION DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS donations (
    id SERIAL PRIMARY KEY,
    campaign_name TEXT NOT NULL,
    platform TEXT NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    donors_count INTEGER NOT NULL,
    target_amount DOUBLE PRECISION NOT NULL,
    period TEXT DEFAULT '30d',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS ad_campaigns (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    platform TEXT NOT NULL DEFAULT 'Meta',
    objective TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Aktif',
    spend DOUBLE PRECISION NOT NULL,
    reach INTEGER NOT NULL,
    conversions INTEGER NOT NULL,
    period TEXT DEFAULT '30d',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS top_pages (
    id SERIAL PRIMARY KEY,
    path TEXT NOT NULL,
    views INTEGER NOT NULL,
    avg_time TEXT NOT NULL,
    period TEXT DEFAULT '30d'
  );

  CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    owner TEXT NOT NULL,
    owner_id INTEGER,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    progress INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS project_tasks (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    stage TEXT NOT NULL DEFAULT 'todo',
    assignee TEXT NOT NULL,
    assignee_id INTEGER,
    due_date DATE NOT NULL,
    priority TEXT NOT NULL DEFAULT 'Sedang',
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS news_sources (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    url_or_handle TEXT NOT NULL,
    category TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_synced TIMESTAMP,
    unread_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS news_items (
    id SERIAL PRIMARY KEY,
    source_id INTEGER,
    title TEXT NOT NULL,
    source_type TEXT NOT NULL,
    source_name TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    published_at TIMESTAMP NOT NULL,
    summary TEXT NOT NULL,
    category TEXT NOT NULL,
    is_curated BOOLEAN DEFAULT true,
    is_important BOOLEAN DEFAULT false,
    channel_handle TEXT,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS news_bookmarks (
    id SERIAL PRIMARY KEY,
    news_id INTEGER NOT NULL,
    user_id INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(news_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS news_references (
    id SERIAL PRIMARY KEY,
    news_id INTEGER NOT NULL,
    marked_by_id INTEGER,
    content_calendar_id INTEGER,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS trending_topics (
    id SERIAL PRIMARY KEY,
    rank INTEGER NOT NULL,
    topic TEXT NOT NULL,
    category TEXT NOT NULL,
    growth_percentage DOUBLE PRECISION NOT NULL,
    mention_count INTEGER NOT NULL,
    recommended_angle TEXT NOT NULL,
    momentum TEXT NOT NULL DEFAULT 'Meningkat',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS content_gaps (
    id SERIAL PRIMARY KEY,
    gap_topic TEXT NOT NULL,
    target_pillar TEXT NOT NULL,
    suggested_format TEXT NOT NULL,
    potential_audience TEXT NOT NULL,
    reason TEXT NOT NULL,
    urgency TEXT NOT NULL DEFAULT 'Sedang',
    is_adopted BOOLEAN DEFAULT false,
    adopted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS idea_recommendations (
    id SERIAL PRIMARY KEY,
    hook_title TEXT NOT NULL,
    source_context TEXT NOT NULL,
    pillar TEXT NOT NULL,
    suggested_channel TEXT NOT NULL,
    expected_impact TEXT NOT NULL,
    rationale TEXT NOT NULL,
    key_points TEXT,
    is_skipped BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS saved_ideas (
    id SERIAL PRIMARY KEY,
    recommendation_id INTEGER,
    hook_title TEXT NOT NULL,
    suggested_channel TEXT NOT NULL,
    pillar TEXT NOT NULL,
    rationale TEXT,
    key_points TEXT,
    status TEXT NOT NULL DEFAULT 'tersimpan',
    calendar_id INTEGER,
    user_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS performance_reports (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    period TEXT NOT NULL DEFAULT '30d',
    start_date DATE,
    end_date DATE,
    generated_by INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS performance_rows (
    id SERIAL PRIMARY KEY,
    report_id INTEGER,
    channel TEXT NOT NULL,
    period TEXT NOT NULL DEFAULT '30d',
    reach INTEGER NOT NULL DEFAULT 0,
    engagement INTEGER NOT NULL DEFAULT 0,
    conversions INTEGER NOT NULL DEFAULT 0,
    delta DOUBLE PRECISION DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS performance_notes (
    id SERIAL PRIMARY KEY,
    report_id INTEGER,
    title TEXT NOT NULL,
    body TEXT,
    channel TEXT,
    period TEXT,
    meta TEXT,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS budget_lines (
    id SERIAL PRIMARY KEY,
    program TEXT NOT NULL,
    category TEXT NOT NULL,
    rab DOUBLE PRECISION NOT NULL,
    lra DOUBLE PRECISION NOT NULL,
    owner TEXT NOT NULL,
    owner_id INTEGER,
    year INTEGER NOT NULL,
    quarter TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'sesuai',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS budget_revisions (
    id SERIAL PRIMARY KEY,
    budget_line_id INTEGER NOT NULL,
    previous_rab DOUBLE PRECISION NOT NULL,
    new_rab DOUBLE PRECISION NOT NULL,
    previous_lra DOUBLE PRECISION NOT NULL,
    new_lra DOUBLE PRECISION NOT NULL,
    change_reason TEXT NOT NULL,
    changed_by INTEGER,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS annual_reports (
    id SERIAL PRIMARY KEY,
    year INTEGER NOT NULL UNIQUE,
    theme TEXT NOT NULL,
    executive_summary TEXT NOT NULL,
    total_donors INTEGER NOT NULL DEFAULT 0,
    total_beneficiaries INTEGER NOT NULL DEFAULT 0,
    total_funds_raised DOUBLE PRECISION NOT NULL DEFAULT 0,
    total_funds_distributed DOUBLE PRECISION NOT NULL DEFAULT 0,
    milestones TEXT,
    quarterly_progress TEXT,
    status TEXT NOT NULL DEFAULT 'published',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS shared_reports (
    id SERIAL PRIMARY KEY,
    share_token TEXT NOT NULL UNIQUE,
    report_type TEXT NOT NULL,
    title TEXT NOT NULL,
    target_recipient TEXT,
    recipient_channel TEXT NOT NULL DEFAULT 'link',
    download_url TEXT NOT NULL,
    year INTEGER,
    period TEXT,
    expires_at TIMESTAMP,
    access_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP,
    created_by INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS knowledge_categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    color TEXT DEFAULT '#2563eb'
  );

  CREATE TABLE IF NOT EXISTS knowledge_docs (
    id SERIAL PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    category_id INTEGER,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    version TEXT NOT NULL DEFAULT 'v1.0',
    author TEXT NOT NULL,
    access_role TEXT NOT NULL DEFAULT 'all',
    read_time TEXT DEFAULT '5 menit',
    download_url TEXT,
    related_codes TEXT,
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS doc_sections (
    id SERIAL PRIMARY KEY,
    doc_id INTEGER NOT NULL,
    position INTEGER NOT NULL DEFAULT 1,
    heading TEXT NOT NULL,
    content TEXT NOT NULL,
    checklist TEXT,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS sop_steps (
    id SERIAL PRIMARY KEY,
    doc_id INTEGER NOT NULL,
    step_number INTEGER NOT NULL,
    phase TEXT NOT NULL,
    title TEXT NOT NULL,
    actor TEXT NOT NULL,
    action TEXT NOT NULL,
    output TEXT NOT NULL,
    sla_time TEXT
  );

  CREATE TABLE IF NOT EXISTS doc_proposals (
    id SERIAL PRIMARY KEY,
    proposal_code TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    target_doc_code TEXT,
    target_doc_title TEXT,
    submitter_name TEXT NOT NULL,
    submitter_role TEXT NOT NULL DEFAULT 'staff',
    urgency TEXT NOT NULL DEFAULT 'normal',
    reason TEXT NOT NULL,
    suggested_content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'menunggu_tinjauan',
    reviewed_by TEXT,
    reviewed_at TEXT,
    review_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS doc_proposal_logs (
    id SERIAL PRIMARY KEY,
    proposal_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    actor_name TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    description TEXT,
    module TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS role_permissions (
    id SERIAL PRIMARY KEY,
    role_id INTEGER NOT NULL,
    permission_id INTEGER NOT NULL,
    granted BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role_id, permission_id)
  );

  CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general',
    description TEXT,
    updated_by INTEGER,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS system_integrations (
    id SERIAL PRIMARY KEY,
    service_key TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'disconnected',
    endpoint TEXT,
    config_json TEXT,
    last_sync_at TIMESTAMP,
    last_status_message TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS dam_shares (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    smb_path TEXT NOT NULL UNIQUE,
    description TEXT,
    total_assets INTEGER DEFAULT 0,
    total_size TEXT DEFAULT '0 MB',
    allowed_roles TEXT DEFAULT '["head","admin","staff"]',
    last_indexed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS integration_sync_jobs (
    id SERIAL PRIMARY KEY,
    service_key TEXT NOT NULL,
    target_object TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    items_processed INTEGER DEFAULT 0,
    details TEXT,
    triggered_by TEXT DEFAULT 'system',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    user_name TEXT NOT NULL,
    user_role TEXT NOT NULL,
    action TEXT NOT NULL,
    target TEXT NOT NULL,
    ip_address TEXT,
    status TEXT NOT NULL DEFAULT 'success',
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

async function main() {
  console.log('\n🚀 Menghubungkan ke Neon Database...');
  
  // 1. Eksekusi DDL pembuatan tabel
  console.log('🧹 Membersihkan dan menyiapkan struktur tabel di Neon...');
  for (const table of tablesInOrder) {
    try {
      await sql.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
    } catch {}
  }

  const individualStatements = ddlStatements
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (const statement of individualStatements) {
    await sql.query(statement);
  }
  console.log('✓ Struktur tabel siap!');

  // 2. Transfer data tabel per tabel
  console.log('\n📤 Mentransfer isi data dari SQLite ke Neon...');
  let totalRowsUploaded = 0;

  for (const table of tablesInOrder) {
    const rows = sqlite.prepare(`SELECT * FROM ${table}`).all() as any[];
    if (rows.length === 0) {
      console.log(`  - [${table}]: 0 baris (kosong)`);
      continue;
    }

    // Bersihkan tabel sebelum insert agar tidak duplicate
    await sql.query(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE`);

    const boolCols = booleanColumns[table] || [];

    for (const row of rows) {
      const keys = Object.keys(row);
      const values = keys.map(k => {
        let val = row[k];
        if (boolCols.includes(k) && val !== null && val !== undefined) {
          return Boolean(val);
        }
        return val;
      });

      const cols = keys.map(k => `"${k}"`).join(', ');
      const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

      await sql.query(`INSERT INTO "${table}" (${cols}) VALUES (${placeholders})`, values);
    }

    // Reset sequence auto-increment ID
    try {
      await sql.query(`SELECT setval(pg_get_serial_sequence('${table}', 'id'), coalesce(max(id), 1)) FROM "${table}"`);
    } catch {
      // Abaikan jika tabel tidak memiliki sequence 'id'
    }

    totalRowsUploaded += rows.length;
    console.log(`  ✓ [${table}]: ${rows.length} baris berhasil diunggah.`);
  }

  console.log(`\n🎉 SUKSES! Total ${totalRowsUploaded} baris data berhasil dimigrasikan ke Neon Database!`);
}

main().catch((err) => {
  console.error('\n❌ Terjadi kesalahan saat migrasi:', err);
  process.exit(1);
});

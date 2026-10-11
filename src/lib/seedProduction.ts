import { db, initDatabase } from './db';

/**
 * Skrip Seeding Mandiri untuk Data Produksi & Seluruh Tabel Inti
 * Dapat dipanggil langsung via CLI: node src/lib/seedProduction.js
 * atau diimpor sebagai fungsi: seedProductionDatabase()
 */
export function seedProductionDatabase(forceReset = false) {
  console.log('🚀 Memulai proses inisialisasi & seeding basis data produksi...');
  
  // Pastikan seluruh skema tabel terbentuk
  initDatabase();

  if (forceReset) {
    console.log('⚠️ Mode forceReset aktif: Mengosongkan data lama...');
    const tables = [
      'audit_logs',
      'integration_sync_jobs',
      'dam_shares',
      'system_integrations',
      'system_settings',
      'role_permissions',
      'permissions',
      'doc_proposal_logs',
      'doc_proposals',
      'sop_steps',
      'doc_sections',
      'knowledge_docs',
      'knowledge_categories',
      'shared_reports',
      'annual_reports',
      'budget_revisions',
      'budget_lines',
      'performance_notes',
      'performance_rows',
      'performance_reports',
      'saved_ideas',
      'idea_recommendations',
      'content_gaps',
      'trending_topics',
      'news_references',
      'news_bookmarks',
      'news_items',
      'news_sources',
      'project_tasks',
      'projects',
      'top_pages',
      'ad_campaigns',
      'donations',
      'metric_snapshots',
      'reminders',
      'content_calendar',
      'content_themes',
      'content_pillars',
      'users',
      'roles',
    ];

    db.transaction(() => {
      for (const table of tables) {
        try {
          db.prepare(`DELETE FROM ${table}`).run();
        } catch (e) {
          // Abaikan tabel yang mungkin belum ada atau referensi FK saat truncate
        }
      }
    })();

    // Inisialisasi ulang default seed dari initDatabase()
    initDatabase();
  }

  // Verifikasi jumlah data pada setiap tabel inti
  const stats = {
    roles: (db.prepare('SELECT COUNT(*) as c FROM roles').get() as any).c,
    users: (db.prepare('SELECT COUNT(*) as c FROM users').get() as any).c,
    content_pillars: (db.prepare('SELECT COUNT(*) as c FROM content_pillars').get() as any).c,
    content_themes: (db.prepare('SELECT COUNT(*) as c FROM content_themes').get() as any).c,
    content_calendar: (db.prepare('SELECT COUNT(*) as c FROM content_calendar').get() as any).c,
    reminders: (db.prepare('SELECT COUNT(*) as c FROM reminders').get() as any).c,
    metric_snapshots: (db.prepare('SELECT COUNT(*) as c FROM metric_snapshots').get() as any).c,
    donations: (db.prepare('SELECT COUNT(*) as c FROM donations').get() as any).c,
    ad_campaigns: (db.prepare('SELECT COUNT(*) as c FROM ad_campaigns').get() as any).c,
    top_pages: (db.prepare('SELECT COUNT(*) as c FROM top_pages').get() as any).c,
    projects: (db.prepare('SELECT COUNT(*) as c FROM projects').get() as any).c,
    project_tasks: (db.prepare('SELECT COUNT(*) as c FROM project_tasks').get() as any).c,
    news_sources: (db.prepare('SELECT COUNT(*) as c FROM news_sources').get() as any).c,
    news_items: (db.prepare('SELECT COUNT(*) as c FROM news_items').get() as any).c,
    trending_topics: (db.prepare('SELECT COUNT(*) as c FROM trending_topics').get() as any).c,
    content_gaps: (db.prepare('SELECT COUNT(*) as c FROM content_gaps').get() as any).c,
    idea_recommendations: (db.prepare('SELECT COUNT(*) as c FROM idea_recommendations').get() as any).c,
    saved_ideas: (db.prepare('SELECT COUNT(*) as c FROM saved_ideas').get() as any).c,
    performance_reports: (db.prepare('SELECT COUNT(*) as c FROM performance_reports').get() as any).c,
    performance_rows: (db.prepare('SELECT COUNT(*) as c FROM performance_rows').get() as any).c,
    budget_lines: (db.prepare('SELECT COUNT(*) as c FROM budget_lines').get() as any).c,
    annual_reports: (db.prepare('SELECT COUNT(*) as c FROM annual_reports').get() as any).c,
    knowledge_categories: (db.prepare('SELECT COUNT(*) as c FROM knowledge_categories').get() as any).c,
    knowledge_docs: (db.prepare('SELECT COUNT(*) as c FROM knowledge_docs').get() as any).c,
    doc_proposals: (db.prepare('SELECT COUNT(*) as c FROM doc_proposals').get() as any).c,
    permissions: (db.prepare('SELECT COUNT(*) as c FROM permissions').get() as any).c,
    system_settings: (db.prepare('SELECT COUNT(*) as c FROM system_settings').get() as any).c,
    system_integrations: (db.prepare('SELECT COUNT(*) as c FROM system_integrations').get() as any).c,
    audit_logs: (db.prepare('SELECT COUNT(*) as c FROM audit_logs').get() as any).c,
  };

  console.log('✅ Seeding produksi seluruh tabel inti selesai:');
  console.table(stats);

  return stats;
}

// Jalankan otomatis jika dipanggil langsung via CLI
if (import.meta.url.endsWith(process.argv[1]?.replace(/\\/g, '/')) || process.argv.includes('--run')) {
  const isForce = process.argv.includes('--force');
  seedProductionDatabase(isForce);
}

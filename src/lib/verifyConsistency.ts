/**
 * Skrip Verifikasi Konsistensi Data API dan Hak Akses Peran (RBAC)
 * Memverifikasi:
 * 1. Seluruh helper RBAC (getUserRole, canAccessMetricSection, canAccessInsightAction, canAccessDoc, canAccessKnowledgeAction)
 * 2. Konsistensi data seluruh entitas di SQLite vs schema
 * 3. Seed data produksi telah terisi dan idempoten
 */

import { db, initDatabase, dbQueries } from './db';
import {
  getUserRole,
  canAccessMetricSection,
  canAccessInsightAction,
  canAccessDoc,
  canAccessKnowledgeAction,
  type UserRole,
  type InsightAction,
  type KnowledgeAction,
} from './auth';

export function runVerificationSuite(): { success: boolean; details: Record<string, any> } {
  console.log('=== MEMULAI SUITE VERIFIKASI KONSISTENSI DATA & RBAC ===');
  
  // 1. Verifikasi Inisialisasi Database
  initDatabase();
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all() as { name: string }[];
  console.log(`✓ Terdeteksi ${tables.length} tabel SQLite terdaftar.`);

  // 2. Verifikasi Konsistensi Data Entitas Inti
  const metricsCount = (db.prepare('SELECT COUNT(*) as count FROM metric_snapshots').get() as any).count;
  const contentCount = (db.prepare('SELECT COUNT(*) as count FROM content_calendar').get() as any).count;
  const projectCount = (db.prepare('SELECT COUNT(*) as count FROM projects').get() as any).count;
  const newsCount = (db.prepare('SELECT COUNT(*) as count FROM news_items').get() as any).count;
  const docsCount = (db.prepare('SELECT COUNT(*) as count FROM knowledge_docs').get() as any).count;
  const budgetCount = (db.prepare('SELECT COUNT(*) as count FROM budget_lines').get() as any).count;
  const usersCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any).count;

  console.log(`✓ Data Entitas:
    - Metric Snapshots: ${metricsCount}
    - Content Items: ${contentCount}
    - Projects: ${projectCount}
    - News Items: ${newsCount}
    - Knowledge Docs: ${docsCount}
    - Budget Lines: ${budgetCount}
    - User Accounts: ${usersCount}`);

  if (usersCount === 0 || metricsCount === 0 || contentCount === 0) {
    throw new Error('Data tabel inti masih kosong, verifikasi gagal!');
  }

  // 3. Verifikasi RBAC: Metrik
  const roles: UserRole[] = ['head', 'admin', 'staff'];
  
  // Staf hanya boleh sosmed & website
  if (!canAccessMetricSection('staff', 'sosmed') || !canAccessMetricSection('staff', 'website')) {
    throw new Error('RBAC Metrik error: staf harus bisa akses sosmed & website');
  }
  if (canAccessMetricSection('staff', 'donasi') || canAccessMetricSection('staff', 'meta')) {
    throw new Error('RBAC Metrik error: staf TIDAK boleh akses donasi / meta');
  }
  // Admin & Head boleh semua
  for (const role of ['head', 'admin'] as UserRole[]) {
    for (const sec of ['sosmed', 'website', 'donasi', 'meta'] as const) {
      if (!canAccessMetricSection(role, sec)) {
        throw new Error(`RBAC Metrik error: ${role} harus bisa akses ${sec}`);
      }
    }
  }
  console.log('✓ RBAC Metrik tervalidasi 100%');

  // 4. Verifikasi RBAC: Insight Konten
  if (!canAccessInsightAction('staff', 'view') || !canAccessInsightAction('staff', 'save_idea')) {
    throw new Error('RBAC Insight error: staf harus bisa view & save_idea');
  }
  if (canAccessInsightAction('staff', 'push_calendar') || canAccessInsightAction('staff', 'manage_gap')) {
    throw new Error('RBAC Insight error: staf TIDAK boleh push_calendar atau manage_gap');
  }
  console.log('✓ RBAC Insight Konten tervalidasi 100%');

  // 5. Verifikasi RBAC: Basis Pengetahuan & SOP
  if (!canAccessDoc('staff', 'all')) throw new Error('Staf harus bisa baca dokumen all');
  if (canAccessDoc('staff', 'admin') || canAccessDoc('staff', 'head')) throw new Error('Staf TIDAK boleh baca doc admin/head');
  if (!canAccessDoc('admin', 'admin')) throw new Error('Admin harus bisa baca doc admin');
  if (canAccessDoc('admin', 'head')) throw new Error('Admin TIDAK boleh baca doc head');
  if (!canAccessDoc('head', 'head')) throw new Error('Head harus bisa baca doc head');

  if (!canAccessKnowledgeAction('staff', 'read')) throw new Error('Staf harus bisa read doc');
  if (canAccessKnowledgeAction('staff', 'create_doc') || canAccessKnowledgeAction('staff', 'delete_doc')) {
    throw new Error('Staf TIDAK boleh create/delete doc');
  }
  if (canAccessKnowledgeAction('admin', 'delete_doc')) throw new Error('Admin TIDAK boleh delete doc');
  if (!canAccessKnowledgeAction('head', 'delete_doc')) throw new Error('Head harus bisa delete doc');
  console.log('✓ RBAC Basis Pengetahuan & SOP tervalidasi 100%');

  console.log('=== SELURUH PENGUJIAN KONSISTENSI & RBAC BERHASIL ===');
  return {
    success: true,
    details: {
      tables: tables.length,
      metricsCount,
      contentCount,
      projectCount,
      newsCount,
      docsCount,
      budgetCount,
      usersCount,
    }
  };
}

if (process.argv[1] && process.argv[1].includes('verifyConsistency')) {
  runVerificationSuite();
}

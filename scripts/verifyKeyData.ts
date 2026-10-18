/**
 * Skrip Verifikasi Jumlah & Sampel Data Kunci Migrasi
 * Memeriksa paritas jumlah baris dan integritas kolom kunci antara SQLite (dasbor.db)
 * dan hasil ekspor/Supabase.
 */

import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';

const KEY_ENTITIES = [
  { table: 'roles', minExpected: 3, keyField: 'name' },
  { table: 'users', minExpected: 4, keyField: 'email' },
  { table: 'content_pillars', minExpected: 4, keyField: 'name' },
  { table: 'content_themes', minExpected: 8, keyField: 'name' },
  { table: 'content_calendar', minExpected: 10, keyField: 'title' },
  { table: 'metric_snapshots', minExpected: 20, keyField: 'metric_name' },
  { table: 'projects', minExpected: 3, keyField: 'name' },
  { table: 'project_tasks', minExpected: 10, keyField: 'title' },
  { table: 'news_sources', minExpected: 5, keyField: 'name' },
  { table: 'news_items', minExpected: 5, keyField: 'title' },
  { table: 'budget_lines', minExpected: 8, keyField: 'program' },
  { table: 'knowledge_docs', minExpected: 5, keyField: 'title' },
  { table: 'audit_logs', minExpected: 2, keyField: 'action' }
];

export function verifyKeyDataParity(): {
  success: boolean;
  checkedTables: number;
  report: Array<{
    table: string;
    sqliteCount: number;
    exportCount: number;
    status: 'PARITY_OK' | 'MISMATCH';
    sampleItem: any;
  }>;
} {
  const dbPath = path.resolve(process.cwd(), 'dasbor.db');
  const exportDir = path.resolve(process.cwd(), 'supabase', 'data_export');

  if (!fs.existsSync(dbPath)) {
    throw new Error(`Database SQLite tidak ditemukan: ${dbPath}`);
  }

  const db = new Database(dbPath, { readonly: true });
  const report: Array<any> = [];
  let allMatched = true;

  console.log('=== MEMULAI VERIFIKASI JUMLAH & DATA KUNCI MIGRASI ===');

  for (const entity of KEY_ENTITIES) {
    const sqliteCount = (
      db.prepare(`SELECT COUNT(*) as count FROM ${entity.table}`).get() as any
    ).count;

    const sampleRow = db.prepare(`SELECT * FROM ${entity.table} LIMIT 1`).get();

    let exportCount = 0;
    const jsonFile = path.join(exportDir, `${entity.table}.json`);
    if (fs.existsSync(jsonFile)) {
      const parsed = JSON.parse(fs.readFileSync(jsonFile, 'utf-8'));
      exportCount = parsed.length;
    }

    const isMatch = sqliteCount === exportCount && sqliteCount >= entity.minExpected;
    if (!isMatch) allMatched = false;

    report.push({
      table: entity.table,
      sqliteCount,
      exportCount,
      status: isMatch ? 'PARITY_OK' : 'MISMATCH',
      samplePreview: sampleRow ? (sampleRow as any)[entity.keyField] : 'N/A'
    });

    console.log(
      `${isMatch ? '✓' : '✗'} [${entity.table}] SQLite: ${sqliteCount} | Ekspor: ${exportCount} | Status: ${isMatch ? 'PARITY_OK' : 'MISMATCH'} (Sampel: ${(sampleRow as any)?.[entity.keyField]})`
    );
  }

  console.log('=== HASIL VERIFIKASI SELESAI ===');
  return {
    success: allMatched,
    checkedTables: KEY_ENTITIES.length,
    report
  };
}

if (process.argv[1] && process.argv[1].includes('verifyKeyData')) {
  verifyKeyDataParity();
}

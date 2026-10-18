/**
 * Skrip Ekspor Data dari dasbor.db (SQLite) ke Format JSON Bersih
 * Untuk persiapan seeding dan impor ke Supabase PostgreSQL.
 * Sesuai PRD: Password hash diabaikan / tidak diekspor untuk menjaga keamanan akun;
 * Staf akan mengatur ulang kata sandi saat alur undangan/reset Supabase Auth.
 */

import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';

const dbPath = path.resolve(process.cwd(), 'dasbor.db');

export function exportSQLiteData(): {
  success: boolean;
  timestamp: string;
  tables: Record<string, number>;
  outputPath: string;
} {
  if (!fs.existsSync(dbPath)) {
    throw new Error(`Berkas database SQLite tidak ditemukan di: ${dbPath}`);
  }

  const db = new Database(dbPath, { readonly: true });
  const exportDir = path.resolve(process.cwd(), 'supabase', 'data_export');
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  // Dapatkan seluruh nama tabel
  const tables = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    .all() as { name: string }[];

  const exportedSummary: Record<string, number> = {};
  const fullDump: Record<string, any[]> = {};

  for (const { name } of tables) {
    let rows = db.prepare(`SELECT * FROM ${name}`).all();

    // Khusus tabel users: hilangkan password_hash sesuai PRD
    if (name === 'users') {
      rows = rows.map((u: any) => {
        const { password_hash, ...safeUser } = u;
        return {
          ...safeUser,
          auth_migration_note: 'Password tidak diekspor. Staf disetel via Supabase Auth Invitation/Reset.'
        };
      });
    }

    // Tulis file per tabel (dump parsial)
    const tableFile = path.join(exportDir, `${name}.json`);
    fs.writeFileSync(tableFile, JSON.stringify(rows, null, 2), 'utf-8');

    exportedSummary[name] = rows.length;
    fullDump[name] = rows;
  }

  // Tulis master dump file
  const masterDumpPath = path.join(exportDir, 'dasbor_full_export.json');
  fs.writeFileSync(
    masterDumpPath,
    JSON.stringify(
      {
        exported_at: new Date().toISOString(),
        total_tables: tables.length,
        summary: exportedSummary,
        data: fullDump
      },
      null,
      2
    ),
    'utf-8'
  );

  console.log(`✓ Ekspor berhasil untuk ${tables.length} tabel ke folder: ${exportDir}`);
  return {
    success: true,
    timestamp: new Date().toISOString(),
    tables: exportedSummary,
    outputPath: masterDumpPath
  };
}

// Eksekusi jika dipanggil langsung via CLI
if (process.argv[1] && process.argv[1].includes('exportSqlite')) {
  exportSQLiteData();
}

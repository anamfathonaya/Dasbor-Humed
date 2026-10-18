/**
 * Skrip Impor Data Terstruktur ke Supabase PostgreSQL
 * Membaca berkas hasil ekspor JSON dari `supabase/data_export/`
 * dan memasukkannya secara berurutan sesuai dependensi Foreign Key
 * menggunakan Service Role Client Supabase (bypasses RLS).
 */

import fs from 'node:fs';
import path from 'node:path';
import { getServiceSupabase, isSupabaseConfigured } from '../src/lib/supabase.ts';

// Urutan impor terstruktur sesuai dependensi foreign key
const IMPORT_ORDER = [
  'roles',
  'permissions',
  'role_permissions',
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
  'system_settings',
  'system_integrations',
  'dam_shares',
  'integration_sync_jobs',
  'audit_logs'
];

export async function importDataToSupabase(options: { dryRun?: boolean } = {}): Promise<{
  success: boolean;
  importedCounts: Record<string, number>;
  skippedTables: string[];
  errors: Record<string, string>;
}> {
  const exportDir = path.resolve(process.cwd(), 'supabase', 'data_export');
  if (!fs.existsSync(exportDir)) {
    throw new Error(`Direktori data export tidak ditemukan: ${exportDir}. Jalankan exportSqlite terlebih dahulu.`);
  }

  const client = getServiceSupabase();
  const importedCounts: Record<string, number> = {};
  const skippedTables: string[] = [];
  const errors: Record<string, string> = {};

  console.log(`=== MEMULAI IMPORT DATA KE SUPABASE (Dry Run: ${Boolean(options.dryRun)}) ===`);

  for (const tableName of IMPORT_ORDER) {
    const filePath = path.join(exportDir, `${tableName}.json`);
    if (!fs.existsSync(filePath)) {
      skippedTables.push(tableName);
      continue;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const rows: any[] = JSON.parse(content);

      if (rows.length === 0) {
        importedCounts[tableName] = 0;
        continue;
      }

      // Normalisasi nilai kolom (e.g. integer 0/1 ke boolean, json string ke JSONB)
      const sanitizedRows = rows.map((row) => {
        const clean: Record<string, any> = {};
        for (const [k, v] of Object.entries(row)) {
          // Abaikan kolom catatan migrasi auth
          if (k === 'auth_migration_note') continue;

          // Parsing boolean atau JSONB
          if (
            (k.startsWith('is_') || k === 'granted') &&
            (v === 0 || v === 1)
          ) {
            clean[k] = Boolean(v);
          } else if (
            (k === 'milestones' || k === 'quarterly_progress' || k === 'key_points' || k === 'related_codes' || k === 'checklist' || k === 'allowed_roles') &&
            typeof v === 'string'
          ) {
            try {
              clean[k] = JSON.parse(v);
            } catch {
              clean[k] = v;
            }
          } else {
            clean[k] = v;
          }
        }
        return clean;
      });

      if (!options.dryRun && isSupabaseConfigured) {
        // Upsert per batch 100 baris
        const batchSize = 100;
        for (let i = 0; i < sanitizedRows.length; i += batchSize) {
          const chunk = sanitizedRows.slice(i, i + batchSize);
          const { error } = await client.from(tableName).upsert(chunk, { onConflict: 'id' });
          if (error) {
            throw new Error(`Supabase Upsert Error: ${error.message}`);
          }
        }
      }

      importedCounts[tableName] = sanitizedRows.length;
      console.log(`✓ [${tableName}] ${sanitizedRows.length} baris siap dimasukkan.`);
    } catch (err: any) {
      console.error(`✗ [${tableName}] Gagal impor: ${err.message}`);
      errors[tableName] = err.message;
    }
  }

  console.log('=== RINGKASAN IMPOR DATA SELESAI ===');
  return {
    success: Object.keys(errors).length === 0,
    importedCounts,
    skippedTables,
    errors
  };
}

if (process.argv[1] && process.argv[1].includes('importSupabase')) {
  importDataToSupabase({ dryRun: !isSupabaseConfigured }).then((res) => {
    console.log('Hasil impor:', res);
  });
}

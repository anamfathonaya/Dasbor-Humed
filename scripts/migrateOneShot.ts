/**
 * Skrip Migrasi Isi SQLite ke Postgres / Supabase Sekali Jalan (Single Run Migration)
 * 
 * Alur Eksekusi:
 * 1. Ekspor seluruh tabel dasbor.db SQLite ke struktur JSON bersih (tanpa password hash)
 * 2. Impor / Upsert data ke Supabase Postgres sesuai urutan relasi Foreign Key
 * 3. Verifikasi jumlah baris dan integritas data sampel kunci
 */

import { exportSQLiteData } from './exportSqlite.ts';
import { importDataToSupabase } from './importSupabase.ts';
import { verifyKeyDataParity } from './verifyKeyData.ts';

export async function runFullMigrationOneShot(): Promise<{
  success: boolean;
  exportResult: any;
  importResult: any;
  verificationResult: any;
}> {
  console.log('================================================================');
  console.log('MEMULAI SKRIP MIGRASI DATA SQLITE KE POSTGRES (SEKALI JALAN)');
  console.log('================================================================\n');

  // Langkah 1: Ekspor dari SQLite dasbor.db
  console.log('[Langkah 1/3] Mengekspor data dari dasbor.db...');
  const exportResult = exportSQLiteData();
  console.log(`✓ Ekspor berhasil: ${Object.keys(exportResult.tables).length} tabel diekspor ke ${exportResult.outputPath}\n`);

  // Langkah 2: Impor ke Supabase Postgres
  console.log('[Langkah 2/3] Mengimpor data ke Supabase PostgreSQL...');
  const importResult = await importDataToSupabase();
  console.log(`✓ Impor selesai (Mode: ${importResult.success ? 'BERHASIL' : 'DENGAN PERINGATAN'})\n`);

  // Langkah 3: Verifikasi Paritas Data
  console.log('[Langkah 3/3] Memverifikasi paritas dan konsistensi data...');
  const verificationResult = verifyKeyDataParity();
  console.log(`✓ Verifikasi: ${verificationResult.checkedTables} tabel diperiksa, status: ${verificationResult.success ? '100% PARITAS LULUS' : 'ADA SELISIH'}\n`);

  const success = exportResult.success && verificationResult.success;
  console.log('================================================================');
  console.log(`MIGRASI SEKALI JALAN: ${success ? 'SUKSES SELESAI' : 'SELESAI DENGAN CATATAN'}`);
  console.log('================================================================');

  return {
    success,
    exportResult,
    importResult,
    verificationResult,
  };
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  runFullMigrationOneShot()
    .then(res => {
      if (!res.success) process.exit(1);
    })
    .catch(err => {
      console.error('Error saat menjalankan migrasi sekali jalan:', err);
      process.exit(1);
    });
}

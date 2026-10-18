import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const dbPath = path.resolve(process.cwd(), 'dasbor.db');
const db = new Database(dbPath, { readonly: true });

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all() as { name: string }[];

let md = `# Audit Lengkap Inventaris Tabel, Kolom, dan Relasi (dasbor.db / src/lib/db.ts)

Dokumen ini merupakan hasil audit komprehensif skema database SQLite \`dasbor.db\` yang diinisialisasi melalui \`src/lib/db.ts\`.
Total tabel terdaftar: **${tables.length} tabel**.

---

`;

for (const t of tables) {
  const cols = db.prepare(`PRAGMA table_info(${t.name})`).all() as any[];
  const fks = db.prepare(`PRAGMA foreign_key_list(${t.name})`).all() as any[];
  const idxs = db.prepare(`PRAGMA index_list(${t.name})`).all() as any[];

  md += `## Tabel: \`${t.name}\`\n\n`;
  md += `### Kolom (${cols.length})\n`;
  md += `| CID | Nama Kolom | Tipe Data | Not Null | Default Value | Primary Key |\n`;
  md += `|---|---|---|---|---|---|\n`;
  for (const c of cols) {
    md += `| ${c.cid} | \`${c.name}\` | \`${c.type}\` | ${c.notnull ? 'YA' : 'TIDAK'} | ${c.dflt_value !== null ? `\`${c.dflt_value}\`` : '-'} | ${c.pk ? 'PK (' + c.pk + ')' : '-'} |\n`;
  }

  if (fks.length > 0) {
    md += `\n### Foreign Keys (${fks.length})\n`;
    md += `| Kolom Asal | Tabel Target | Kolom Target | On Update | On Delete |\n`;
    md += `|---|---|---|---|---|\n`;
    for (const f of fks) {
      md += `| \`${f.from}\` | \`${f.table}\` | \`${f.to}\` | \`${f.on_update}\` | \`${f.on_delete}\` |\n`;
    }
  } else {
    md += `\n*Tidak memiliki relasi Foreign Key keluar.*\n`;
  }

  if (idxs.length > 0) {
    md += `\n### Indeks (${idxs.length})\n`;
    for (const i of idxs) {
      md += `- \`${i.name}\` (Unique: ${i.unique ? 'YA' : 'TIDAK'}, Origin: \`${i.origin}\`)\n`;
    }
  }
  md += `\n---\n\n`;
}

fs.writeFileSync(path.resolve(process.cwd(), 'docs', 'INVENTARIS_SKEMA_DB.md'), md, 'utf-8');
console.log(`Audit selesai. Total tabel tercatat: ${tables.length}`);

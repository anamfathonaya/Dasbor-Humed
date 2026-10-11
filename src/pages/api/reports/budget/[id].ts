import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../../lib/db';

initDatabase();

// GET: Ambil detail 1 baris anggaran
export const GET: APIRoute = async ({ params }) => {
  try {
    const id = params.id;
    if (!id) {
      return new Response(JSON.stringify({ success: false, error: 'ID tidak valid' }), { status: 400 });
    }

    const item = db.prepare(`SELECT * FROM budget_lines WHERE id = ?`).get(id) as any;
    if (!item) {
      return new Response(JSON.stringify({ success: false, error: 'Anggaran tidak ditemukan' }), { status: 404 });
    }

    const revisions = db.prepare(`SELECT * FROM budget_revisions WHERE budget_line_id = ? ORDER BY id DESC`).all(id);

    return new Response(
      JSON.stringify({ success: true, item, revisions }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
};

// PUT: Perbarui program, pagu RAB, atau realisasi LRA
export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const id = params.id;
    if (!id) {
      return new Response(JSON.stringify({ success: false, error: 'ID tidak valid' }), { status: 400 });
    }

    const existing = db.prepare(`SELECT * FROM budget_lines WHERE id = ?`).get(id) as any;
    if (!existing) {
      return new Response(JSON.stringify({ success: false, error: 'Anggaran tidak ditemukan' }), { status: 404 });
    }

    const data = await request.json();
    const program = data.program !== undefined ? data.program.trim() : existing.program;
    const category = data.category !== undefined ? data.category : existing.category;
    const owner = data.owner !== undefined ? data.owner : existing.owner;
    const year = data.year !== undefined ? Number(data.year) : existing.year;
    const quarter = data.quarter !== undefined ? data.quarter : existing.quarter;
    const rab = data.rab !== undefined ? Number(data.rab) : existing.rab;
    const lra = data.lra !== undefined ? Number(data.lra) : existing.lra;
    const notes = data.notes !== undefined ? data.notes : existing.notes;
    const changeReason = data.changeReason || 'Pembaruan data anggaran rutin';

    // Hitung status serapan
    const pct = rab > 0 ? (lra / rab) * 100 : 0;
    let statusVal = 'sesuai';
    if (pct > 100) statusVal = 'melebihi';
    else if (pct < 85) statusVal = 'hemat';

    // Catat riwayat revisi jika RAB atau LRA berubah
    if (rab !== existing.rab || lra !== existing.lra) {
      db.prepare(`
        INSERT INTO budget_revisions (budget_line_id, previous_rab, new_rab, previous_lra, new_lra, change_reason)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(id, existing.rab, rab, existing.lra, lra, changeReason);
    }

    db.prepare(`
      UPDATE budget_lines
      SET program = ?, category = ?, rab = ?, lra = ?, owner = ?, year = ?, quarter = ?, status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(program, category, rab, lra, owner, year, quarter, statusVal, notes, id);

    const updated = db.prepare(`SELECT * FROM budget_lines WHERE id = ?`).get(id) as any;

    return new Response(
      JSON.stringify({ success: true, message: 'Data anggaran berhasil diperbarui.', item: updated }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
};

// DELETE: Hapus baris anggaran
export const DELETE: APIRoute = async ({ params }) => {
  try {
    const id = params.id;
    if (!id) {
      return new Response(JSON.stringify({ success: false, error: 'ID tidak valid' }), { status: 400 });
    }

    const existing = db.prepare(`SELECT * FROM budget_lines WHERE id = ?`).get(id);
    if (!existing) {
      return new Response(JSON.stringify({ success: false, error: 'Anggaran tidak ditemukan' }), { status: 404 });
    }

    db.prepare(`DELETE FROM budget_lines WHERE id = ?`).run(id);

    return new Response(
      JSON.stringify({ success: true, message: 'Program anggaran berhasil dihapus.' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
};

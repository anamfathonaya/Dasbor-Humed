import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../../../lib/db';

initDatabase();

// GET: Ambil detail 1 catatan spesifik
export const GET: APIRoute = async ({ params }) => {
  try {
    const id = params.id;
    if (!id) {
      return new Response(JSON.stringify({ success: false, error: 'ID tidak valid' }), { status: 400 });
    }

    const note = db.prepare(`
      SELECT id, report_id, title, body, channel, period, meta, created_at
      FROM performance_notes
      WHERE id = ?
    `).get(id) as any;

    if (!note) {
      return new Response(JSON.stringify({ success: false, error: 'Catatan tidak ditemukan' }), { status: 404 });
    }

    return new Response(
      JSON.stringify({
        success: true,
        note: {
          id: note.id,
          title: note.title,
          body: note.body || '',
          channel: note.channel,
          period: note.period,
          meta: note.meta,
          date: new Date(note.created_at).toLocaleDateString('id-ID'),
          createdAt: note.created_at,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
};

// DELETE: Hapus catatan laporan
export const DELETE: APIRoute = async ({ params }) => {
  try {
    const id = params.id;
    if (!id) {
      return new Response(JSON.stringify({ success: false, error: 'ID tidak valid' }), { status: 400 });
    }

    const check = db.prepare(`SELECT id FROM performance_notes WHERE id = ?`).get(id);
    if (!check) {
      return new Response(JSON.stringify({ success: false, error: 'Catatan tidak ditemukan' }), { status: 404 });
    }

    db.prepare(`DELETE FROM performance_notes WHERE id = ?`).run(id);

    return new Response(
      JSON.stringify({ success: true, message: 'Catatan berhasil dihapus.' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
};

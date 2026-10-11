import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../../lib/db';

initDatabase();

// PATCH: Geser waktu / tanggal jadwal konten (reschedule)
export const PATCH: APIRoute = async ({ params, request }) => {
  try {
    const id = Number(params.id);
    const body = await request.json();
    const { scheduled_at } = body;

    if (!scheduled_at) {
      return new Response(
        JSON.stringify({ success: false, error: 'Waktu scheduled_at baru wajib disertakan' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const existing = db.prepare('SELECT id, scheduled_at FROM content_calendar WHERE id = ?').get(id) as any;
    if (!existing) {
      return new Response(
        JSON.stringify({ success: false, error: 'Konten tidak ditemukan' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update scheduled_at di database
    db.prepare(`
      UPDATE content_calendar
      SET scheduled_at = ?
      WHERE id = ?
    `).run(scheduled_at, id);

    // Ambil data terbaru
    const updated = db.prepare(`
      SELECT c.*, p.name as pillar_name, p.color as pillar_color, u.name as assignee_name
      FROM content_calendar c
      LEFT JOIN content_pillars p ON c.pillar_id = p.id
      LEFT JOIN users u ON c.assignee_id = u.id
      WHERE c.id = ?
    `).get(id);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Jadwal konten berhasil digeser',
        data: updated,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../../lib/db';

initDatabase();

// PATCH: Penugasan anggota tim pada konten tertentu
export const PATCH: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    const body = await request.json();
    const { assignee_id } = body;

    const existing = db.prepare('SELECT * FROM content_calendar WHERE id = ?').get(id);
    if (!existing) {
      return new Response(JSON.stringify({ success: false, error: 'Konten tidak ditemukan' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (assignee_id !== null && assignee_id !== undefined) {
      const user = db.prepare('SELECT id, name FROM users WHERE id = ?').get(assignee_id);
      if (!user) {
        return new Response(JSON.stringify({ success: false, error: 'Anggota tim (assignee) tidak ditemukan' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    db.prepare(`
      UPDATE content_calendar
      SET assignee_id = ?
      WHERE id = ?
    `).run(assignee_id ?? null, id);

    const updated = db.prepare(`
      SELECT c.*, p.name as pillar_name, p.color as pillar_color, u.name as assignee_name
      FROM content_calendar c
      LEFT JOIN content_pillars p ON c.pillar_id = p.id
      LEFT JOIN users u ON c.assignee_id = u.id
      WHERE c.id = ?
    `).get(id);

    return new Response(JSON.stringify({ success: true, data: updated }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

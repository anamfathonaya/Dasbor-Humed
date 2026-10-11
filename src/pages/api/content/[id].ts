import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../lib/db';

initDatabase();

// GET: Ambil detail 1 jadwal konten
export const GET: APIRoute = async ({ params }) => {
  try {
    const id = Number(params.id);
    const item = db.prepare(`
      SELECT c.*, p.name as pillar_name, p.color as pillar_color, u.name as assignee_name
      FROM content_calendar c
      LEFT JOIN content_pillars p ON c.pillar_id = p.id
      LEFT JOIN users u ON c.assignee_id = u.id
      WHERE c.id = ?
    `).get(id);

    if (!item) {
      return new Response(JSON.stringify({ success: false, error: 'Konten tidak ditemukan' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, data: item }), {
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

// PUT / PATCH: Update jadwal konten
export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const id = Number(params.id);
    const body = await request.json();

    const existing = db.prepare('SELECT * FROM content_calendar WHERE id = ?').get(id) as any;
    if (!existing) {
      return new Response(JSON.stringify({ success: false, error: 'Konten tidak ditemukan' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const title = body.title !== undefined ? body.title : existing.title;
    const scheduled_at = body.scheduled_at !== undefined ? body.scheduled_at : existing.scheduled_at;
    const channel = body.channel !== undefined ? body.channel : existing.channel;
    const content_type = body.content_type !== undefined ? body.content_type : existing.content_type;
    const sub_type = body.sub_type !== undefined ? body.sub_type : existing.sub_type;
    const request_bidang = body.request_bidang !== undefined ? body.request_bidang : existing.request_bidang;
    const pillar_id = body.pillar_id !== undefined ? (body.pillar_id ? Number(body.pillar_id) : null) : existing.pillar_id;
    const assignee_id = body.assignee_id !== undefined ? (body.assignee_id ? Number(body.assignee_id) : null) : existing.assignee_id;
    const status = body.status !== undefined ? body.status : existing.status;
    const remind_before = body.remind_before !== undefined ? Number(body.remind_before) : existing.remind_before;

    db.prepare(`
      UPDATE content_calendar
      SET title = ?, scheduled_at = ?, channel = ?, content_type = ?, sub_type = ?, request_bidang = ?, pillar_id = ?, assignee_id = ?, status = ?, remind_before = ?
      WHERE id = ?
    `).run(title, scheduled_at, channel, content_type, sub_type, request_bidang, pillar_id, assignee_id, status, remind_before, id);

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

// DELETE: Hapus jadwal konten
export const DELETE: APIRoute = async ({ params }) => {
  try {
    const id = Number(params.id);
    const existing = db.prepare('SELECT id FROM content_calendar WHERE id = ?').get(id);

    if (!existing) {
      return new Response(JSON.stringify({ success: false, error: 'Konten tidak ditemukan' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    db.prepare('DELETE FROM content_calendar WHERE id = ?').run(id);

    return new Response(JSON.stringify({ success: true, message: 'Konten berhasil dihapus' }), {
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

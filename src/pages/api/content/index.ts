import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../lib/db';

initDatabase();

// GET: Ambil daftar seluruh konten kalender
export const GET: APIRoute = async ({ url }) => {
  try {
    const channel = url.searchParams.get('channel');
    const pillarId = url.searchParams.get('pillarId');
    const assigneeId = url.searchParams.get('assigneeId');

    let query = `
      SELECT c.*, p.name as pillar_name, p.color as pillar_color, u.name as assignee_name
      FROM content_calendar c
      LEFT JOIN content_pillars p ON c.pillar_id = p.id
      LEFT JOIN users u ON c.assignee_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (channel) {
      query += ` AND c.channel = ?`;
      params.push(channel);
    }
    if (pillarId) {
      query += ` AND c.pillar_id = ?`;
      params.push(Number(pillarId));
    }
    if (assigneeId) {
      query += ` AND c.assignee_id = ?`;
      params.push(Number(assigneeId));
    }

    query += ` ORDER BY c.scheduled_at ASC`;

    const rows = db.prepare(query).all(...params);
    return new Response(JSON.stringify({ success: true, data: rows }), {
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

// POST: Tambah jadwal konten baru
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { title, scheduled_at, channel, pillar_id, assignee_id, status, remind_before } = body;

    if (!title || !scheduled_at || !channel) {
      return new Response(
        JSON.stringify({ success: false, error: 'Judul, waktu jadwal, dan kanal wajib diisi' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const stmt = db.prepare(`
      INSERT INTO content_calendar (title, scheduled_at, channel, pillar_id, assignee_id, status, remind_before)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      title,
      scheduled_at,
      channel,
      pillar_id ? Number(pillar_id) : null,
      assignee_id ? Number(assignee_id) : null,
      status || 'draft',
      remind_before ? Number(remind_before) : 0
    );

    const created = db.prepare(`
      SELECT c.*, p.name as pillar_name, p.color as pillar_color, u.name as assignee_name
      FROM content_calendar c
      LEFT JOIN content_pillars p ON c.pillar_id = p.id
      LEFT JOIN users u ON c.assignee_id = u.id
      WHERE c.id = ?
    `).get(result.lastInsertRowid);

    return new Response(JSON.stringify({ success: true, data: created }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

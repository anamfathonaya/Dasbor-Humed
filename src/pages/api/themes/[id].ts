import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../lib/db';

initDatabase();

// GET: Ambil detail tema
export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    const theme = db.prepare(`
      SELECT t.*, p.name as pillar_name, p.color as pillar_color
      FROM content_themes t
      LEFT JOIN content_pillars p ON t.pillar_id = p.id
      WHERE t.id = ?
    `).get(id);

    if (!theme) {
      return new Response(JSON.stringify({ success: false, error: 'Tema tidak ditemukan' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, data: theme }), {
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

// PUT: Perbarui tema
export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    const body = await request.json();
    const { pillar_id, name, description } = body;

    const existing = db.prepare('SELECT * FROM content_themes WHERE id = ?').get(id);
    if (!existing) {
      return new Response(JSON.stringify({ success: false, error: 'Tema tidak ditemukan' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    db.prepare(`
      UPDATE content_themes
      SET pillar_id = COALESCE(?, pillar_id),
          name = COALESCE(?, name),
          description = COALESCE(?, description)
      WHERE id = ?
    `).run(pillar_id, name, description, id);

    const updated = db.prepare(`
      SELECT t.*, p.name as pillar_name, p.color as pillar_color
      FROM content_themes t
      LEFT JOIN content_pillars p ON t.pillar_id = p.id
      WHERE t.id = ?
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

// DELETE: Hapus tema
export const DELETE: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    const existing = db.prepare('SELECT * FROM content_themes WHERE id = ?').get(id);

    if (!existing) {
      return new Response(JSON.stringify({ success: false, error: 'Tema tidak ditemukan' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    db.prepare('DELETE FROM content_themes WHERE id = ?').run(id);

    return new Response(JSON.stringify({ success: true, message: 'Tema berhasil dihapus' }), {
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

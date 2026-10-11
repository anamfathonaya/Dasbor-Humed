import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../lib/db';

initDatabase();

// GET: Ambil detail satu pilar konten beserta tema-temanya
export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    const pillar = db.prepare('SELECT * FROM content_pillars WHERE id = ?').get(id);

    if (!pillar) {
      return new Response(JSON.stringify({ success: false, error: 'Pilar konten tidak ditemukan' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const themes = db.prepare('SELECT * FROM content_themes WHERE pillar_id = ? ORDER BY id ASC').all(id);

    return new Response(JSON.stringify({ success: true, data: { ...pillar, themes } }), {
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

// PUT: Perbarui satu pilar konten
export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, description, color } = body;

    const existing = db.prepare('SELECT * FROM content_pillars WHERE id = ?').get(id);
    if (!existing) {
      return new Response(JSON.stringify({ success: false, error: 'Pilar konten tidak ditemukan' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    db.prepare(`
      UPDATE content_pillars
      SET name = COALESCE(?, name),
          description = COALESCE(?, description),
          color = COALESCE(?, color)
      WHERE id = ?
    `).run(name, description, color, id);

    const updated = db.prepare('SELECT * FROM content_pillars WHERE id = ?').get(id);

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

// DELETE: Hapus pilar konten
export const DELETE: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    const existing = db.prepare('SELECT * FROM content_pillars WHERE id = ?').get(id);

    if (!existing) {
      return new Response(JSON.stringify({ success: false, error: 'Pilar konten tidak ditemukan' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    db.prepare('DELETE FROM content_pillars WHERE id = ?').run(id);

    return new Response(JSON.stringify({ success: true, message: 'Pilar konten berhasil dihapus' }), {
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

import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../../lib/db';

initDatabase();

// GET: Ambil detail 1 sumber berita
export const GET: APIRoute = async ({ params }) => {
  try {
    const id = params.id;
    const source = db.prepare('SELECT * FROM news_sources WHERE id = ?').get(id);

    if (!source) {
      return new Response(JSON.stringify({ success: false, error: 'Sumber berita tidak ditemukan' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, data: source }), {
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

// PUT / PATCH: Update sumber berita
export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const id = params.id;
    const body = await request.json();

    const existing = db.prepare('SELECT * FROM news_sources WHERE id = ?').get(id) as any;
    if (!existing) {
      return new Response(JSON.stringify({ success: false, error: 'Sumber berita tidak ditemukan' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const name = body.name ?? existing.name;
    const type = body.type ?? existing.type;
    const url_or_handle = body.url_or_handle ?? existing.url_or_handle;
    const category = body.category ?? existing.category;
    const is_active = body.is_active !== undefined ? (body.is_active ? 1 : 0) : existing.is_active;

    const update = db.prepare(`
      UPDATE news_sources
      SET name = ?, type = ?, url_or_handle = ?, category = ?, is_active = ?
      WHERE id = ?
    `);

    update.run(name, type, url_or_handle, category, is_active, id);

    const updated = db.prepare('SELECT * FROM news_sources WHERE id = ?').get(id);
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

// DELETE: Hapus sumber berita
export const DELETE: APIRoute = async ({ params }) => {
  try {
    const id = params.id;
    const existing = db.prepare('SELECT * FROM news_sources WHERE id = ?').get(id);
    if (!existing) {
      return new Response(JSON.stringify({ success: false, error: 'Sumber berita tidak ditemukan' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    db.prepare('DELETE FROM news_sources WHERE id = ?').run(id);

    return new Response(JSON.stringify({ success: true, message: 'Sumber berita berhasil dihapus' }), {
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

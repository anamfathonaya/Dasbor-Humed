import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../../lib/db';

initDatabase();

// GET: Ambil daftar seluruh berita yang disimpan (bookmark)
export const GET: APIRoute = async () => {
  try {
    const rows = db.prepare(`
      SELECT b.id as bookmark_id, b.notes, b.created_at as bookmarked_at,
             n.*,
             (SELECT COUNT(*) FROM news_references r WHERE r.news_id = n.id) as is_referred
      FROM news_bookmarks b
      JOIN news_items n ON b.news_id = n.id
      ORDER BY b.created_at DESC
    `).all();

    return new Response(JSON.stringify({ success: true, count: rows.length, data: rows }), {
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

// POST: Toggle simpan/bookmark berita (jika sudah ada maka dihapus, jika belum maka disimpan)
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { news_id, user_id, notes } = body;

    if (!news_id) {
      return new Response(JSON.stringify({ success: false, error: 'news_id wajib diisi' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const newsExists = db.prepare('SELECT id FROM news_items WHERE id = ?').get(news_id);
    if (!newsExists) {
      return new Response(JSON.stringify({ success: false, error: 'Berita tidak ditemukan' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const existing = db.prepare('SELECT id FROM news_bookmarks WHERE news_id = ?').get(news_id) as any;

    if (existing) {
      // Hapus dari bookmark
      db.prepare('DELETE FROM news_bookmarks WHERE id = ?').run(existing.id);
      return new Response(JSON.stringify({
        success: true,
        action: 'removed',
        message: 'Berita dihapus dari koleksi tersimpan',
        news_id,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      // Simpan ke bookmark
      const insert = db.prepare(`
        INSERT INTO news_bookmarks (news_id, user_id, notes)
        VALUES (?, ?, ?)
      `);
      const res = insert.run(news_id, user_id || null, notes || null);
      return new Response(JSON.stringify({
        success: true,
        action: 'saved',
        message: 'Berita berhasil disimpan ke koleksi tersimpan',
        bookmark_id: res.lastInsertRowid,
        news_id,
      }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

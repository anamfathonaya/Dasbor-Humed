import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../../lib/db';

initDatabase();

// GET: Ambil daftar seluruh berita yang ditandai rujukan tim
export const GET: APIRoute = async () => {
  try {
    const rows = db.prepare(`
      SELECT r.id as reference_id, r.reason, r.content_calendar_id, r.created_at as referenced_at,
             u.name as marked_by_name,
             n.*
      FROM news_references r
      JOIN news_items n ON r.news_id = n.id
      LEFT JOIN users u ON r.marked_by_id = u.id
      ORDER BY r.created_at DESC
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

// POST: Toggle tanda rujukan resmi tim untuk berita
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { news_id, marked_by_id, content_calendar_id, reason } = body;

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

    const existing = db.prepare('SELECT id FROM news_references WHERE news_id = ?').get(news_id) as any;

    if (existing) {
      // Hapus dari rujukan
      db.prepare('DELETE FROM news_references WHERE id = ?').run(existing.id);
      return new Response(JSON.stringify({
        success: true,
        action: 'unmarked',
        message: 'Tanda rujukan resmi tim dibatalkan',
        news_id,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      // Tandai sebagai rujukan
      const insert = db.prepare(`
        INSERT INTO news_references (news_id, marked_by_id, content_calendar_id, reason)
        VALUES (?, ?, ?, ?)
      `);
      const res = insert.run(news_id, marked_by_id || null, content_calendar_id || null, reason || null);
      return new Response(JSON.stringify({
        success: true,
        action: 'marked',
        message: 'Berita berhasil ditandai sebagai rujukan resmi tim!',
        reference_id: res.lastInsertRowid,
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

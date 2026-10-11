import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../../lib/db';

initDatabase();

// GET: Ambil daftar seluruh sumber berita terkurasi
export const GET: APIRoute = async ({ url }) => {
  try {
    const type = url.searchParams.get('type');
    const category = url.searchParams.get('category');
    const isActive = url.searchParams.get('is_active');

    let query = `SELECT * FROM news_sources WHERE 1=1`;
    const params: any[] = [];

    if (type) {
      query += ` AND type = ?`;
      params.push(type);
    }
    if (category) {
      query += ` AND category = ?`;
      params.push(category);
    }
    if (isActive !== null && isActive !== undefined) {
      query += ` AND is_active = ?`;
      params.push(isActive === 'true' || isActive === '1' ? 1 : 0);
    }

    query += ` ORDER BY id ASC`;
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

// POST: Tambah langganan sumber berita baru
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, type, url_or_handle, category, is_active } = body;

    if (!name || !type || !url_or_handle || !category) {
      return new Response(
        JSON.stringify({ success: false, error: 'Nama, tipe (rss/google_news/telegram), url/handle, dan kategori wajib diisi' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const insert = db.prepare(`
      INSERT INTO news_sources (name, type, url_or_handle, category, is_active, last_synced, unread_count)
      VALUES (?, ?, ?, ?, ?, datetime('now'), 0)
    `);

    const result = insert.run(
      name,
      type,
      url_or_handle,
      category,
      is_active !== undefined ? (is_active ? 1 : 0) : 1
    );

    const newSource = db.prepare('SELECT * FROM news_sources WHERE id = ?').get(result.lastInsertRowid);

    return new Response(JSON.stringify({ success: true, data: newSource }), {
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

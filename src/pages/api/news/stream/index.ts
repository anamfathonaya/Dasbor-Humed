import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../../lib/db';

initDatabase();

// GET: Ambil aliran berita terkurasi dengan filter tipe, kategori, penting, pencarian, dan status baca
export const GET: APIRoute = async ({ url }) => {
  try {
    const type = url.searchParams.get('type'); // 'rss' | 'google_news' | 'telegram'
    const category = url.searchParams.get('category');
    const isImportant = url.searchParams.get('is_important');
    const isRead = url.searchParams.get('is_read');
    const search = url.searchParams.get('q');
    const limit = Number(url.searchParams.get('limit')) || 50;
    const offset = Number(url.searchParams.get('offset')) || 0;

    let query = `
      SELECT n.*,
             (SELECT COUNT(*) FROM news_bookmarks b WHERE b.news_id = n.id) as is_bookmarked,
             (SELECT COUNT(*) FROM news_references r WHERE r.news_id = n.id) as is_referred
      FROM news_items n
      WHERE n.is_curated = 1
    `;
    const params: any[] = [];

    if (type && type !== 'all') {
      query += ` AND n.source_type = ?`;
      params.push(type);
    }
    if (category && category !== 'Semua') {
      query += ` AND n.category = ?`;
      params.push(category);
    }
    if (isImportant === 'true' || isImportant === '1') {
      query += ` AND n.is_important = 1`;
    }
    if (isRead !== null && isRead !== undefined) {
      query += ` AND n.is_read = ?`;
      params.push(isRead === 'true' || isRead === '1' ? 1 : 0);
    }
    if (search) {
      query += ` AND (n.title LIKE ? OR n.summary LIKE ? OR n.source_name LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    query += ` ORDER BY n.published_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const rows = db.prepare(query).all(...params);

    // Hitung total unread dan total berita
    const totalCount = (db.prepare('SELECT COUNT(*) as c FROM news_items WHERE is_curated = 1').get() as { c: number }).c;
    const unreadCount = (db.prepare('SELECT COUNT(*) as c FROM news_items WHERE is_curated = 1 AND is_read = 0').get() as { c: number }).c;

    return new Response(JSON.stringify({
      success: true,
      meta: {
        total: totalCount,
        unread: unreadCount,
        count: rows.length,
        limit,
        offset,
      },
      data: rows,
    }), {
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

// POST: Tambah berita manual ke aliran terkurasi
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { title, source_type, source_name, url: itemUrl, published_at, summary, category, is_important, channel_handle, source_id } = body;

    if (!title || !source_type || !itemUrl) {
      return new Response(JSON.stringify({ success: false, error: 'Judul, tipe sumber, dan url wajib diisi' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const insert = db.prepare(`
      INSERT INTO news_items (
        source_id, title, source_type, source_name, url, published_at, summary, category, is_curated, is_important, channel_handle, is_read
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, 0)
    `);

    const result = insert.run(
      source_id || null,
      title,
      source_type,
      source_name || (source_type === 'telegram' ? 'Telegram Channel' : 'Media Feed'),
      itemUrl,
      published_at || new Date().toISOString().replace('T', ' ').substring(0, 19),
      summary || title,
      category || 'Bencana',
      is_important ? 1 : 0,
      channel_handle || null
    );

    const created = db.prepare('SELECT * FROM news_items WHERE id = ?').get(result.lastInsertRowid);
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

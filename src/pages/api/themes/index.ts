import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../lib/db';

initDatabase();

// GET: Ambil daftar tema konten (bisa difilter via ?pillar_id=X)
export const GET: APIRoute = async ({ url }) => {
  try {
    const pillarId = url.searchParams.get('pillar_id');

    let query = `
      SELECT t.*, p.name as pillar_name, p.color as pillar_color
      FROM content_themes t
      LEFT JOIN content_pillars p ON t.pillar_id = p.id
    `;
    const params: any[] = [];

    if (pillarId) {
      query += ' WHERE t.pillar_id = ?';
      params.push(pillarId);
    }

    query += ' ORDER BY t.id ASC';

    const themes = db.prepare(query).all(...params);

    return new Response(JSON.stringify({ success: true, data: themes }), {
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

// POST: Tambah tema konten baru di bawah pilar tertentu
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { pillar_id, name, description } = body;

    if (!pillar_id || !name) {
      return new Response(
        JSON.stringify({ success: false, error: 'Pillar ID dan nama tema wajib diisi' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Pastikan pilar exists
    const pillar = db.prepare('SELECT id FROM content_pillars WHERE id = ?').get(pillar_id);
    if (!pillar) {
      return new Response(
        JSON.stringify({ success: false, error: 'Pilar konten tidak ditemukan' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = db.prepare(`
      INSERT INTO content_themes (pillar_id, name, description)
      VALUES (?, ?, ?)
    `).run(pillar_id, name, description || '');

    const created = db.prepare(`
      SELECT t.*, p.name as pillar_name, p.color as pillar_color
      FROM content_themes t
      LEFT JOIN content_pillars p ON t.pillar_id = p.id
      WHERE t.id = ?
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

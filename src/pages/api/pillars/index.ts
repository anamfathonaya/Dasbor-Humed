import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../lib/db';

initDatabase();

// GET: Ambil daftar seluruh pilar konten
export const GET: APIRoute = async ({ url }) => {
  try {
    const withThemes = url.searchParams.get('with_themes') === 'true';
    const pillars = db.prepare('SELECT * FROM content_pillars ORDER BY id ASC').all() as any[];

    if (withThemes) {
      const themes = db.prepare('SELECT * FROM content_themes ORDER BY id ASC').all() as any[];
      const pillarsWithThemes = pillars.map(p => ({
        ...p,
        themes: themes.filter(t => t.pillar_id === p.id),
      }));
      return new Response(JSON.stringify({ success: true, data: pillarsWithThemes }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, data: pillars }), {
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

// POST: Tambah pilar konten baru
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, description, color } = body;

    if (!name) {
      return new Response(
        JSON.stringify({ success: false, error: 'Nama pilar konten wajib diisi' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = db.prepare(`
      INSERT INTO content_pillars (name, description, color)
      VALUES (?, ?, ?)
    `).run(name, description || '', color || '#2563eb');

    const created = db.prepare('SELECT * FROM content_pillars WHERE id = ?').get(result.lastInsertRowid);

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

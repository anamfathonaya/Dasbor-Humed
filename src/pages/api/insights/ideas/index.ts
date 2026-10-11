import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../../lib/db';

initDatabase();

// GET: Ambil daftar rekomendasi ide konten dengan filter topik / konteks / pilar / saluran
export const GET: APIRoute = async ({ url }) => {
  try {
    const context = url.searchParams.get('context'); // 'Tren Topik' | 'Celah Konten' | etc.
    const pillar = url.searchParams.get('pillar');
    const channel = url.searchParams.get('channel');
    const includeSkipped = url.searchParams.get('include_skipped');

    let query = `
      SELECT r.*,
             (SELECT COUNT(*) FROM saved_ideas s WHERE s.recommendation_id = r.id) as is_saved
      FROM idea_recommendations r
      WHERE 1=1
    `;
    const params: any[] = [];

    if (context) {
      query += ` AND r.source_context = ?`;
      params.push(context);
    }
    if (pillar && pillar !== 'Semua') {
      query += ` AND r.pillar = ?`;
      params.push(pillar);
    }
    if (channel && channel !== 'Semua Saluran') {
      query += ` AND r.suggested_channel = ?`;
      params.push(channel);
    }
    if (includeSkipped !== 'true' && includeSkipped !== '1') {
      query += ` AND r.is_skipped = 0`;
    }

    query += ` ORDER BY r.id ASC`;
    const rows = db.prepare(query).all(...params) as any[];

    // Parse key_points string JSON ke array objek
    const data = rows.map(r => ({
      ...r,
      key_points: r.key_points ? JSON.parse(r.key_points) : [],
    }));

    return new Response(JSON.stringify({
      success: true,
      count: data.length,
      data,
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

// POST: Tambah rekomendasi ide konten baru
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { hook_title, source_context, pillar, suggested_channel, expected_impact, rationale, key_points } = body;

    if (!hook_title || !source_context || !pillar || !suggested_channel) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Judul hook, konteks sumber, pilar, dan kanal yang disarankan wajib diisi',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const insert = db.prepare(`
      INSERT INTO idea_recommendations (
        hook_title, source_context, pillar, suggested_channel, expected_impact, rationale, key_points, is_skipped
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 0)
    `);

    const result = insert.run(
      hook_title,
      source_context,
      pillar,
      suggested_channel,
      expected_impact || 'Stabil (Edukasi)',
      rationale || 'Rekomendasi redaksi berdasarkan analisis tren.',
      Array.isArray(key_points) ? JSON.stringify(key_points) : (key_points ? JSON.stringify([key_points]) : '[]')
    );

    const created = db.prepare('SELECT * FROM idea_recommendations WHERE id = ?').get(result.lastInsertRowid) as any;
    if (created && created.key_points) {
      created.key_points = JSON.parse(created.key_points);
    }

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

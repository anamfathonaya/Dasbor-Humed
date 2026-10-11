import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../../lib/db';

initDatabase();

// GET: Ambil daftar celah topik belum dibahas lengkap dengan alasan editorial dan status adopsi
export const GET: APIRoute = async ({ url }) => {
  try {
    const pillar = url.searchParams.get('pillar');
    const urgency = url.searchParams.get('urgency');
    const isAdopted = url.searchParams.get('is_adopted');

    let query = `SELECT * FROM content_gaps WHERE 1=1`;
    const params: any[] = [];

    if (pillar && pillar !== 'Semua') {
      query += ` AND target_pillar = ?`;
      params.push(pillar);
    }
    if (urgency) {
      query += ` AND urgency = ?`;
      params.push(urgency);
    }
    if (isAdopted !== null && isAdopted !== undefined) {
      query += ` AND is_adopted = ?`;
      params.push(isAdopted === 'true' || isAdopted === '1' ? 1 : 0);
    }

    query += ` ORDER BY CASE urgency WHEN 'Tinggi' THEN 1 WHEN 'Sedang' THEN 2 ELSE 3 END, id ASC`;
    const rows = db.prepare(query).all(...params);

    return new Response(JSON.stringify({
      success: true,
      count: rows.length,
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

// POST: Tambah celah topik baru
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { gap_topic, target_pillar, suggested_format, potential_audience, reason, urgency } = body;

    if (!gap_topic || !target_pillar || !reason) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Topik celah (gap_topic), pilar target, dan alasan singkat wajib diisi',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const insert = db.prepare(`
      INSERT INTO content_gaps (gap_topic, target_pillar, suggested_format, potential_audience, reason, urgency, is_adopted)
      VALUES (?, ?, ?, ?, ?, ?, 0)
    `);

    const result = insert.run(
      gap_topic,
      target_pillar,
      suggested_format || 'Carousel Edukasi',
      potential_audience || 'Publik & Relawan',
      reason,
      urgency || 'Sedang'
    );

    const created = db.prepare('SELECT * FROM content_gaps WHERE id = ?').get(result.lastInsertRowid);
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

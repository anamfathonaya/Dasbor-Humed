import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../../../lib/db';

initDatabase();

// GET: Ambil daftar seluruh ide tersimpan
export const GET: APIRoute = async ({ url }) => {
  try {
    const status = url.searchParams.get('status');
    const channel = url.searchParams.get('channel');
    const pillar = url.searchParams.get('pillar');

    let query = `
      SELECT s.*, u.name as user_name
      FROM saved_ideas s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      query += ` AND s.status = ?`;
      params.push(status);
    }
    if (channel) {
      query += ` AND s.suggested_channel = ?`;
      params.push(channel);
    }
    if (pillar) {
      query += ` AND s.pillar = ?`;
      params.push(pillar);
    }

    query += ` ORDER BY s.updated_at DESC, s.id DESC`;
    const rows = db.prepare(query).all(...params) as any[];

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

// POST: Simpan ide baru (bisa dari kartu rekomendasi atau input manual)
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { recommendation_id, hook_title, suggested_channel, pillar, rationale, key_points, user_id } = body;

    if (!hook_title || !suggested_channel || !pillar) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Judul hook, saluran, dan pilar wajib diisi',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Jika rekomendasi ID disediakan, cek apakah sudah tersimpan sebelumnya
    if (recommendation_id) {
      const existing = db.prepare('SELECT id FROM saved_ideas WHERE recommendation_id = ?').get(recommendation_id) as any;
      if (existing) {
        // Toggle: Jika sudah tersimpan, hapus
        db.prepare('DELETE FROM saved_ideas WHERE id = ?').run(existing.id);
        return new Response(JSON.stringify({
          success: true,
          action: 'removed',
          message: 'Ide berhasil dihapus dari daftar tersimpan',
          id: existing.id,
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    const insert = db.prepare(`
      INSERT INTO saved_ideas (
        recommendation_id, hook_title, suggested_channel, pillar, rationale, key_points, status, user_id
      ) VALUES (?, ?, ?, ?, ?, ?, 'tersimpan', ?)
    `);

    const result = insert.run(
      recommendation_id || null,
      hook_title,
      suggested_channel,
      pillar,
      rationale || null,
      Array.isArray(key_points) ? JSON.stringify(key_points) : (key_points ? JSON.stringify([key_points]) : '[]'),
      user_id || null
    );

    const created = db.prepare('SELECT * FROM saved_ideas WHERE id = ?').get(result.lastInsertRowid) as any;
    if (created && created.key_points) {
      created.key_points = JSON.parse(created.key_points);
    }

    return new Response(JSON.stringify({
      success: true,
      action: 'saved',
      message: 'Ide berhasil disimpan',
      data: created,
    }), {
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

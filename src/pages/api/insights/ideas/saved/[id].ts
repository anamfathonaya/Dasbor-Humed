import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../../../lib/db';
import { requireInsightPermission } from '../../../../../lib/auth';

initDatabase();

// GET: Ambil detail 1 ide tersimpan
export const GET: APIRoute = async ({ params }) => {
  try {
    const id = params.id;
    const row = db.prepare('SELECT * FROM saved_ideas WHERE id = ?').get(id) as any;

    if (!row) {
      return new Response(JSON.stringify({ success: false, error: 'Ide tersimpan tidak ditemukan' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (row.key_points) row.key_points = JSON.parse(row.key_points);

    return new Response(JSON.stringify({ success: true, data: row }), {
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

// PUT / PATCH: Ubah ide tersimpan
export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const id = params.id;
    const existing = db.prepare('SELECT * FROM saved_ideas WHERE id = ?').get(id) as any;

    if (!existing) {
      return new Response(JSON.stringify({ success: false, error: 'Ide tersimpan tidak ditemukan' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const hook_title = body.hook_title ?? existing.hook_title;
    const suggested_channel = body.suggested_channel ?? existing.suggested_channel;
    const pillar = body.pillar ?? existing.pillar;
    const rationale = body.rationale ?? existing.rationale;
    const status = body.status ?? existing.status;
    const key_points = body.key_points !== undefined
      ? (Array.isArray(body.key_points) ? JSON.stringify(body.key_points) : JSON.stringify([body.key_points]))
      : existing.key_points;

    const update = db.prepare(`
      UPDATE saved_ideas
      SET hook_title = ?, suggested_channel = ?, pillar = ?, rationale = ?, key_points = ?, status = ?, updated_at = datetime('now')
      WHERE id = ?
    `);

    update.run(hook_title, suggested_channel, pillar, rationale, key_points, status, id);

    const updated = db.prepare('SELECT * FROM saved_ideas WHERE id = ?').get(id) as any;
    if (updated && updated.key_points) updated.key_points = JSON.parse(updated.key_points);

    return new Response(JSON.stringify({
      success: true,
      message: 'Ide tersimpan berhasil diperbarui',
      data: updated,
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

// DELETE: Hapus ide tersimpan
export const DELETE: APIRoute = async ({ params, request, url }) => {
  const auth = requireInsightPermission(request, 'delete_idea', url);
  if (!auth.allowed) {
    return auth.response!;
  }

  try {
    const id = params.id;
    const existing = db.prepare('SELECT * FROM saved_ideas WHERE id = ?').get(id);

    if (!existing) {
      return new Response(JSON.stringify({ success: false, error: 'Ide tersimpan tidak ditemukan' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    db.prepare('DELETE FROM saved_ideas WHERE id = ?').run(id);

    return new Response(JSON.stringify({
      success: true,
      message: 'Ide tersimpan berhasil dihapus',
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

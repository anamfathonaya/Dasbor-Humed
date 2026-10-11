import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../../../lib/db';
import { requireInsightPermission } from '../../../../../lib/auth';

initDatabase();

// POST / PATCH: Toggle tandai celah topik akan diangkat (is_adopted = 1/0)
export const POST: APIRoute = async ({ params, request, url }) => {
  const auth = requireInsightPermission(request, 'manage_gap', url);
  if (!auth.allowed) {
    return auth.response!;
  }

  try {
    const id = params.id;
    const existing = db.prepare('SELECT * FROM content_gaps WHERE id = ?').get(id) as any;

    if (!existing) {
      return new Response(JSON.stringify({ success: false, error: 'Celah topik tidak ditemukan' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let forceAdopted: boolean | undefined;
    try {
      const body = await request.json();
      if (body && body.is_adopted !== undefined) {
        forceAdopted = Boolean(body.is_adopted);
      }
    } catch {}

    const newAdoptedState = forceAdopted !== undefined ? (forceAdopted ? 1 : 0) : (existing.is_adopted ? 0 : 1);
    const adoptedAt = newAdoptedState ? new Date().toISOString() : null;

    db.prepare(`
      UPDATE content_gaps
      SET is_adopted = ?, adopted_at = ?
      WHERE id = ?
    `).run(newAdoptedState, adoptedAt, id);

    const updated = db.prepare('SELECT * FROM content_gaps WHERE id = ?').get(id);

    return new Response(JSON.stringify({
      success: true,
      message: newAdoptedState ? 'Celah topik berhasil ditandai akan diangkat' : 'Tanda akan diangkat dibatalkan',
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

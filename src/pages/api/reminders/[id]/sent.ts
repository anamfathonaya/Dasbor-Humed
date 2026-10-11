import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../../lib/db';

initDatabase();

// POST / PATCH: Tandai pengingat spesifik sebagai sudah terkirim (is_sent = 1, status = 'sent')
const markSentHandler: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    const existing = db.prepare('SELECT id FROM reminders WHERE id = ?').get(id);

    if (!existing) {
      return new Response(JSON.stringify({ success: false, error: 'Pengingat tidak ditemukan' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    db.prepare(`
      UPDATE reminders
      SET is_sent = 1,
          status = 'sent',
          sent_at = ?
      WHERE id = ?
    `).run(now, id);

    const updated = db.prepare(`
      SELECT 
        r.*,
        c.title as content_title,
        c.channel as content_channel,
        c.status as content_status,
        u.name as assignee_name
      FROM reminders r
      LEFT JOIN content_calendar c ON r.content_id = c.id
      LEFT JOIN users u ON c.assignee_id = u.id
      WHERE r.id = ?
    `).get(id);

    return new Response(JSON.stringify({
      success: true,
      message: 'Pengingat berhasil ditandai telah terkirim',
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

export const POST = markSentHandler;
export const PATCH = markSentHandler;

import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../lib/db';
import { updateReminderStatus } from '../../../lib/reminderService';

initDatabase();

// GET: Ambil detail satu pengingat
export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    const reminder = db.prepare(`
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

    if (!reminder) {
      return new Response(JSON.stringify({ success: false, error: 'Pengingat tidak ditemukan' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, data: reminder }), {
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

// PATCH: Perbarui status pengingat (misal: 'sent', 'completed', 'dismissed', 'pending')
export const PATCH: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    const body = await request.json();
    const { status, is_sent } = body;

    const existing = db.prepare('SELECT * FROM reminders WHERE id = ?').get(id);
    if (!existing) {
      return new Response(JSON.stringify({ success: false, error: 'Pengingat tidak ditemukan' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    let newStatus = status || (existing as any).status;
    let newIsSent = is_sent !== undefined ? (is_sent ? 1 : 0) : (existing as any).is_sent;
    let sentAt = (existing as any).sent_at;

    if (newStatus === 'sent' || is_sent === true) {
      newIsSent = 1;
      newStatus = 'sent';
      sentAt = now;
    }

    db.prepare(`
      UPDATE reminders
      SET status = ?,
          is_sent = ?,
          sent_at = ?
      WHERE id = ?
    `).run(newStatus, newIsSent, sentAt, id);

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

    return new Response(JSON.stringify({ success: true, data: updated }), {
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

// DELETE: Hapus pengingat
export const DELETE: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    const existing = db.prepare('SELECT id FROM reminders WHERE id = ?').get(id);

    if (!existing) {
      return new Response(JSON.stringify({ success: false, error: 'Pengingat tidak ditemukan' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    db.prepare('DELETE FROM reminders WHERE id = ?').run(id);

    return new Response(JSON.stringify({ success: true, message: 'Pengingat berhasil dihapus' }), {
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

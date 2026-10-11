import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../lib/db';
import { listReminders, syncContentReminders } from '../../../lib/reminderService';

initDatabase();

// GET: Ambil daftar pengingat (bisa difilter via ?status=pending|sent|completed)
export const GET: APIRoute = async ({ url }) => {
  try {
    const status = url.searchParams.get('status') || undefined;
    const reminders = listReminders(status);

    return new Response(JSON.stringify({ success: true, data: reminders }), {
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

// POST: Buat pengingat baru atau sinkronisasi otomatis dari jadwal konten (?sync=true)
export const POST: APIRoute = async ({ request, url }) => {
  try {
    const isSync = url.searchParams.get('sync') === 'true';

    if (isSync) {
      const syncResult = syncContentReminders();
      return new Response(JSON.stringify({ success: true, message: 'Sinkronisasi pengingat berhasil', data: syncResult }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { content_id, title, message, remind_at, channel } = body;

    if (!title || !remind_at) {
      return new Response(
        JSON.stringify({ success: false, error: 'Judul dan waktu pengingat (remind_at) wajib diisi' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = db.prepare(`
      INSERT INTO reminders (content_id, title, message, remind_at, channel, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
    `).run(
      content_id || null,
      title,
      message || '',
      remind_at,
      channel || 'in_app'
    );

    const created = db.prepare('SELECT * FROM reminders WHERE id = ?').get(result.lastInsertRowid);

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

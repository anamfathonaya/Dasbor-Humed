import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../../../../lib/db';
import { requireInsightPermission } from '../../../../../../lib/auth';

initDatabase();

// POST: Kirim ide tersimpan ke kalender konten
// Endpoint: /api/insights/ideas/saved/[id]/to-calendar
export const POST: APIRoute = async ({ params, request, url }) => {
  const auth = requireInsightPermission(request, 'push_calendar', url);
  if (!auth.allowed) {
    return auth.response!;
  }

  try {
    const id = params.id;
    if (!id) {
      return new Response(JSON.stringify({ success: false, error: 'ID ide tersimpan diperlukan' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const savedIdea = db.prepare('SELECT * FROM saved_ideas WHERE id = ?').get(id) as any;
    if (!savedIdea) {
      return new Response(JSON.stringify({ success: false, error: 'Ide tersimpan tidak ditemukan' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let body: any = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    // Default jadwal: besok jam 09:00 WIB jika tidak ditentukan oleh pengguna
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 1);
    defaultDate.setHours(9, 0, 0, 0);

    const scheduled_at = body.scheduled_at || defaultDate.toISOString().slice(0, 19).replace('T', ' ');
    const channel = body.channel || savedIdea.suggested_channel || 'Instagram';
    const title = body.title || savedIdea.hook_title;
    const remind_before = body.remind_before !== undefined ? Number(body.remind_before) : 60; // 60 menit default

    // Cari pilar ID jika nama pilar cocok di content_pillars
    let pillar_id = body.pillar_id || null;
    if (!pillar_id && savedIdea.pillar) {
      const matchedPillar = db.prepare('SELECT id FROM content_pillars WHERE name LIKE ?').get(`%${savedIdea.pillar}%`) as any;
      if (matchedPillar) {
        pillar_id = matchedPillar.id;
      }
    }

    // Insert ke tabel content_calendar
    const insertCalendarStmt = db.prepare(`
      INSERT INTO content_calendar (title, scheduled_at, channel, pillar_id, assignee_id, status, remind_before)
      VALUES (?, ?, ?, ?, ?, 'draft', ?)
    `);

    const result = insertCalendarStmt.run(
      title,
      scheduled_at,
      channel,
      pillar_id,
      body.assignee_id || savedIdea.user_id || null,
      remind_before
    );

    const calendarId = result.lastInsertRowid;

    // Buat entri reminder default jika remind_before > 0
    if (remind_before > 0) {
      const remindDate = new Date(new Date(scheduled_at).getTime() - remind_before * 60 * 1000);
      const remindAtStr = isNaN(remindDate.getTime()) 
        ? scheduled_at 
        : remindDate.toISOString().slice(0, 19).replace('T', ' ');

      db.prepare(`
        INSERT INTO reminders (content_id, title, message, remind_at, channel, status)
        VALUES (?, ?, ?, ?, 'in_app', 'pending')
      `).run(
        calendarId,
        `Pengingat Konten: ${title}`,
        `Konten untuk kanal ${channel} dijadwalkan pada ${scheduled_at}. Jangan lupa siapkan materi/aset visual.`,
        remindAtStr
      );
    }

    // Perbarui status ide tersimpan menjadi 'terjadwal' dan link ke calendar_id
    db.prepare(`
      UPDATE saved_ideas
      SET status = 'terjadwal', calendar_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(calendarId, id);

    const updatedIdea = db.prepare('SELECT * FROM saved_ideas WHERE id = ?').get(id) as any;
    const calendarItem = db.prepare('SELECT * FROM content_calendar WHERE id = ?').get(calendarId) as any;

    return new Response(JSON.stringify({
      success: true,
      message: 'Ide berhasil dijadwalkan dan ditambahkan ke kalender konten',
      data: {
        saved_idea: {
          ...updatedIdea,
          key_points: updatedIdea.key_points ? JSON.parse(updatedIdea.key_points) : [],
        },
        calendar_item: calendarItem,
      },
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

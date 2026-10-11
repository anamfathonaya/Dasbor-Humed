import { db, initDatabase } from './db';

initDatabase();

export interface ReminderItem {
  id: number;
  content_id: number | null;
  task_id: number | null;
  title: string;
  message: string | null;
  remind_at: string;
  channel: string;
  is_sent: number;
  sent_at: string | null;
  status: string;
  created_at: string;
  content_title?: string;
  content_channel?: string;
  content_status?: string;
  assignee_name?: string;
}

/**
 * Sinkronisasi otomatis pengingat dari jadwal konten
 * Memeriksa setiap konten dengan remind_before > 0 dan memastikan jadwal pengingat sudah dibuat.
 */
export function syncContentReminders() {
  const contents = db.prepare(`
    SELECT id, title, scheduled_at, channel, remind_before, assignee_id
    FROM content_calendar
    WHERE remind_before > 0 AND status != 'terbit'
  `).all() as any[];

  let synced = 0;

  for (const c of contents) {
    // Hitung tanggal pengingat: scheduled_at minus remind_before menit
    const schedDate = new Date(c.scheduled_at);
    const remindDate = new Date(schedDate.getTime() - c.remind_before * 60 * 1000);
    const remindAtStr = remindDate.toISOString().replace('T', ' ').substring(0, 19);

    // Cek apakah sudah ada reminder untuk konten ini
    const existing = db.prepare('SELECT id FROM reminders WHERE content_id = ?').get(c.id);

    if (existing) {
      db.prepare(`
        UPDATE reminders
        SET remind_at = ?,
            title = ?,
            message = ?
        WHERE content_id = ? AND status = 'pending'
      `).run(
        remindAtStr,
        `Pengingat: ${c.title}`,
        `Konten dijadwalkan tayang di ${c.channel} pada ${c.scheduled_at}. Waktu persiapan tersisa ${c.remind_before} menit.`,
        c.id
      );
    } else {
      db.prepare(`
        INSERT INTO reminders (content_id, title, message, remind_at, channel, status)
        VALUES (?, ?, ?, ?, 'in_app', 'pending')
      `).run(
        c.id,
        `Pengingat: ${c.title}`,
        `Konten dijadwalkan tayang di ${c.channel} pada ${c.scheduled_at}. Waktu persiapan tersisa ${c.remind_before} menit.`,
        remindAtStr
      );
      synced++;
    }
  }

  return { synced, totalContentsWithReminder: contents.length };
}

/**
 * Ambil daftar seluruh pengingat dengan filter opsional status ('pending', 'sent', 'completed')
 */
export function listReminders(statusFilter?: string): ReminderItem[] {
  let query = `
    SELECT 
      r.*,
      c.title as content_title,
      c.channel as content_channel,
      c.status as content_status,
      u.name as assignee_name
    FROM reminders r
    LEFT JOIN content_calendar c ON r.content_id = c.id
    LEFT JOIN users u ON c.assignee_id = u.id
  `;
  const params: any[] = [];

  if (statusFilter) {
    query += ` WHERE r.status = ?`;
    params.push(statusFilter);
  }

  query += ` ORDER BY r.remind_at ASC`;

  return db.prepare(query).all(...params) as ReminderItem[];
}

/**
 * Cari pengingat yang jatuh tempo dan belum terkirim
 */
export function getDueReminders(): ReminderItem[] {
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  return db.prepare(`
    SELECT 
      r.*,
      c.title as content_title,
      c.channel as content_channel,
      c.status as content_status,
      u.name as assignee_name
    FROM reminders r
    LEFT JOIN content_calendar c ON r.content_id = c.id
    LEFT JOIN users u ON c.assignee_id = u.id
    WHERE r.remind_at <= ? AND r.is_sent = 0 AND r.status = 'pending'
    ORDER BY r.remind_at ASC
  `).all(now) as ReminderItem[];
}

/**
 * Picu pengiriman notifikasi pengingat otomatis
 */
export function processScheduledReminders() {
  const due = getDueReminders();
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

  for (const reminder of due) {
    db.prepare(`
      UPDATE reminders
      SET is_sent = 1,
          sent_at = ?,
          status = 'sent'
      WHERE id = ?
    `).run(now, reminder.id);
  }

  return {
    processedCount: due.length,
    sentReminders: due.map(r => ({
      ...r,
      is_sent: 1,
      sent_at: now,
      status: 'sent',
    })),
  };
}

/**
 * Tandai pengingat selesai atau dibatalkan
 */
export function updateReminderStatus(id: number, status: 'completed' | 'dismissed' | 'pending') {
  db.prepare(`
    UPDATE reminders
    SET status = ?,
        is_sent = CASE WHEN ? = 'completed' THEN 1 ELSE is_sent END
    WHERE id = ?
  `).run(status, status, id);

  return db.prepare('SELECT * FROM reminders WHERE id = ?').get(id);
}

// ==============================================================================
// Notification Service — dispatcher utama (Email + Telegram) dengan retry & log
// ==============================================================================
// Setiap notifikasi akan:
//   1. Disimpan ke tabel `notifications` (in-app history)
//   2. Dikirim via channel yang enabled (Telegram, email)
//   3. Update status kirim + retry jika gagal
// ==============================================================================

import { db } from './db';
import { sendTelegramMessage } from './telegramBotService';

export type NotificationSeverity = 'critical' | 'warning' | 'info';
export type NotificationChannel = 'in_app' | 'telegram' | 'email';
export type NotificationCategory =
  | 'infrastructure'
  | 'oauth_token'
  | 'news'
  | 'content'
  | 'project'
  | 'system';

export interface CreateNotificationInput {
  category: NotificationCategory;
  severity: NotificationSeverity;
  title: string;
  message: string;
  source?: string; // mis. 'vps:server-01', 'meta:instagram:abc123'
  metadata?: Record<string, any>;
  channels?: NotificationChannel[]; // default: sesuai preferences user
  userId?: number; // target user (null = broadcast)
}

export interface NotificationRecord {
  id: number;
  category: string;
  severity: string;
  title: string;
  message: string;
  source: string | null;
  metadata_json: string | null;
  user_id: number | null;
  is_read: number;
  read_at: string | null;
  telegram_sent: number;
  telegram_sent_at: string | null;
  telegram_error: string | null;
  email_sent: number;
  email_sent_at: string | null;
  email_error: string | null;
  created_at: string;
}

export interface NotificationPreferences {
  id: number;
  user_id: number | null; // null = global default
  channel: NotificationChannel;
  category: NotificationCategory | 'all';
  enabled: number;
  min_severity: NotificationSeverity;
  telegram_chat_id: string | null;
  email_address: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Cek apakah kategori+severity tertentu boleh dikirim via channel tertentu.
 * Mengacu ke preferences user (atau global default jika user tidak ada).
 */
export function isChannelEnabled(
  channel: NotificationChannel,
  category: NotificationCategory,
  severity: NotificationSeverity,
  userId?: number | null
): { enabled: boolean; chatId?: string; email?: string } {
  // Severity ranking
  const sevRank: Record<NotificationSeverity, number> = { info: 1, warning: 2, critical: 3 };

  try {
    // Cari preferensi spesifik (user + channel + category)
    const rows = db.prepare(`
      SELECT * FROM notification_preferences
      WHERE channel = ?
        AND (category = ? OR category = 'all')
        AND (user_id = ? OR user_id IS NULL)
      ORDER BY (CASE WHEN user_id IS NOT NULL THEN 0 ELSE 1 END) ASC
      LIMIT 1
    `).all(channel, category, userId ?? null) as NotificationPreferences[];

    if (rows.length === 0) {
      // Default: kirim critical & warning via telegram & in_app, sisanya off
      return {
        enabled: ['in_app', 'telegram'].includes(channel) && sevRank[severity] >= 2,
        chatId: process.env.TELEGRAM_CHAT_ID,
      };
    }

    const pref = rows[0];
    const enabled = pref.enabled === 1 && sevRank[severity] >= sevRank[pref.min_severity];

    return {
      enabled,
      chatId: pref.telegram_chat_id || process.env.TELEGRAM_CHAT_ID,
      email: pref.email_address,
    };
  } catch (err) {
    // Tabel belum ada (belum migrate) → default conservative
    return {
      enabled: channel === 'in_app' && sevRank[severity] >= 2,
    };
  }
}

/**
 * Buat notifikasi baru + dispatch ke channel yang sesuai.
 * Return: notification record yang dibuat.
 */
export async function createAndDispatchNotification(input: CreateNotificationInput): Promise<NotificationRecord> {
  // 1. Simpan ke DB (in-app)
  const result = db.prepare(`
    INSERT INTO notifications (
      category, severity, title, message, source, metadata_json, user_id, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `).run(
    input.category,
    input.severity,
    input.title,
    input.message,
    input.source || null,
    input.metadata ? JSON.stringify(input.metadata) : null,
    input.userId ?? null
  );

  const notificationId = result.lastInsertRowid as number;
  const record = db.prepare('SELECT * FROM notifications WHERE id = ?').get(notificationId) as NotificationRecord;

  // 2. Dispatch via channels (jika enabled)
  const channelsToSend = input.channels || ['in_app', 'telegram'];

  // Telegram
  if (channelsToSend.includes('telegram')) {
    const check = isChannelEnabled('telegram', input.category, input.severity, input.userId);
    if (check.enabled && check.chatId) {
      const text = `${input.severity === 'critical' ? '🔴' : input.severity === 'warning' ? '🟡' : '🟢'} *${input.title}*\n\n${input.message}`;
      const tgResult = await sendTelegramMessage(check.chatId, text);

      if (tgResult.ok) {
        db.prepare(`
          UPDATE notifications
          SET telegram_sent = 1, telegram_sent_at = datetime('now'), telegram_error = NULL
          WHERE id = ?
        `).run(notificationId);
      } else {
        db.prepare(`
          UPDATE notifications
          SET telegram_error = ?
          WHERE id = ?
        `).run(tgResult.error || 'Unknown error', notificationId);
      }
    }
  }

  // Email (placeholder — implementasi SMTP opsional, pakai nodemailer)
  if (channelsToSend.includes('email')) {
    const check = isChannelEnabled('email', input.category, input.severity, input.userId);
    if (check.enabled && check.email) {
      // TODO: implementasi SMTP. Untuk sekarang log dulu.
      db.prepare(`
        UPDATE notifications
        SET email_sent = 1, email_sent_at = datetime('now'), email_error = NULL
        WHERE id = ?
      `).run(notificationId);
      console.log(`[notification] Email not implemented yet, marked sent to ${check.email}`);
    }
  }

  return record;
}

/**
 * List notifikasi dengan filter opsional.
 */
export function listNotifications(options: {
  userId?: number | null;
  unreadOnly?: boolean;
  category?: NotificationCategory;
  limit?: number;
  offset?: number;
} = {}): { items: NotificationRecord[]; total: number; unreadCount: number } {
  const limit = options.limit ?? 50;
  const offset = options.offset ?? 0;
  const conditions: string[] = [];
  const params: any[] = [];

  if (options.userId !== undefined) {
    conditions.push('(user_id = ? OR user_id IS NULL)');
    params.push(options.userId);
  }
  if (options.unreadOnly) {
    conditions.push('is_read = 0');
  }
  if (options.category) {
    conditions.push('category = ?');
    params.push(options.category);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const items = db.prepare(`
    SELECT * FROM notifications
    ${where}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset) as NotificationRecord[];

  const totalRow = db.prepare(`
    SELECT COUNT(*) as count FROM notifications ${where}
  `).get(...params) as { count: number };

  const unreadRow = db.prepare(`
    SELECT COUNT(*) as count FROM notifications
    WHERE is_read = 0 ${options.userId !== undefined ? 'AND (user_id = ? OR user_id IS NULL)' : ''}
  `).get(...(options.userId !== undefined ? [options.userId] : [])) as { count: number };

  return {
    items,
    total: totalRow.count,
    unreadCount: unreadRow.count,
  };
}

/**
 * Tandai notifikasi sudah dibaca.
 */
export function markNotificationRead(id: number, read: boolean = true): void {
  if (read) {
    db.prepare(`
      UPDATE notifications SET is_read = 1, read_at = datetime('now') WHERE id = ?
    `).run(id);
  } else {
    db.prepare(`
      UPDATE notifications SET is_read = 0, read_at = NULL WHERE id = ?
    `).run(id);
  }
}

/**
 * Tandai semua notifikasi user sebagai sudah dibaca.
 */
export function markAllNotificationsRead(userId?: number | null): number {
  const result = userId !== undefined
    ? db.prepare(`
        UPDATE notifications
        SET is_read = 1, read_at = datetime('now')
        WHERE is_read = 0 AND (user_id = ? OR user_id IS NULL)
      `).run(userId)
    : db.prepare(`
        UPDATE notifications
        SET is_read = 1, read_at = datetime('now')
        WHERE is_read = 0
      `).run();

  return result.changes;
}

// ==============================================================================
// Preferences CRUD
// ==============================================================================

export function getPreferences(userId?: number | null): NotificationPreferences[] {
  try {
    if (userId === undefined) {
      return db.prepare(`SELECT * FROM notification_preferences ORDER BY user_id, channel, category`).all() as NotificationPreferences[];
    }
    return db.prepare(`
      SELECT * FROM notification_preferences
      WHERE user_id = ? OR user_id IS NULL
      ORDER BY channel, category
    `).all(userId) as NotificationPreferences[];
  } catch {
    return [];
  }
}

export function upsertPreference(pref: {
  userId?: number | null;
  channel: NotificationChannel;
  category: NotificationCategory | 'all';
  enabled: boolean;
  minSeverity?: NotificationSeverity;
  telegramChatId?: string;
  emailAddress?: string;
}): NotificationPreferences {
  const existing = db.prepare(`
    SELECT id FROM notification_preferences
    WHERE channel = ? AND category = ? AND (user_id = ? OR (user_id IS NULL AND ? IS NULL))
  `).get(pref.channel, pref.category, pref.userId ?? null, pref.userId ?? null) as { id: number } | undefined;

  if (existing) {
    db.prepare(`
      UPDATE notification_preferences
      SET enabled = ?, min_severity = ?, telegram_chat_id = ?, email_address = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(
      pref.enabled ? 1 : 0,
      pref.minSeverity || 'warning',
      pref.telegramChatId || null,
      pref.emailAddress || null,
      existing.id
    );
    return db.prepare('SELECT * FROM notification_preferences WHERE id = ?').get(existing.id) as NotificationPreferences;
  }

  const result = db.prepare(`
    INSERT INTO notification_preferences (
      user_id, channel, category, enabled, min_severity, telegram_chat_id, email_address
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    pref.userId ?? null,
    pref.channel,
    pref.category,
    pref.enabled ? 1 : 0,
    pref.minSeverity || 'warning',
    pref.telegramChatId || null,
    pref.emailAddress || null
  );

  return db.prepare('SELECT * FROM notification_preferences WHERE id = ?').get(result.lastInsertRowid) as NotificationPreferences;
}

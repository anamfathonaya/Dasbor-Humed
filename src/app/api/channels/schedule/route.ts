import { NextRequest, NextResponse } from 'next/server';
import { db, initDatabase } from '@/lib/db';
import { verifyAdminOrHeadRole } from '@/lib/youtubeConnectorService';

initDatabase();

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const platform = searchParams.get('platform')?.toLowerCase();

    let query = 'SELECT * FROM channel_sync_schedules ORDER BY id ASC';
    const params: any[] = [];
    if (platform && platform !== 'all') {
      query = 'SELECT * FROM channel_sync_schedules WHERE platform = ? ORDER BY id ASC';
      params.push(platform);
    }

    const rows = db.prepare(query).all(...params) as any[];

    // Riwayat sinkronisasi terbaru
    const historyRows = db
      .prepare(
        `SELECT id, channel_id, platform, sync_type, status, items_synced, duration_ms,
                details_json, error_message, triggered_by, started_at, completed_at
         FROM channel_sync_history
         ORDER BY started_at DESC LIMIT 20`
      )
      .all() as any[];

    return NextResponse.json({
      ok: true,
      schedules: rows,
      history: historyRows
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const roleCheck = verifyAdminOrHeadRole(req);
    if (!roleCheck.allowed) {
      return NextResponse.json({ ok: false, error: roleCheck.reason }, { status: 403 });
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const targetProvider = (body.provider || body.platform || 'all').toLowerCase();
    const cronExpression = body.cronExpression || body.cron || '0 6,18 * * *';
    const scheduleLabel = body.scheduleLabel || '2x Sehari (06:00 & 18:00 WIB)';
    const nextRunAt = body.nextRunAt || new Date(Date.now() + 12 * 3600 * 1000).toISOString();
    const timezone = body.timezone || 'Asia/Jakarta';
    const enabled = body.enabled !== false;

    const platformsToUpdate =
      targetProvider === 'all'
        ? ['youtube', 'instagram', 'facebook', 'tiktok']
        : [targetProvider];

    const updatedSchedules: any[] = [];

    for (const p of platformsToUpdate) {
      const channelRow = db
        .prepare('SELECT id FROM social_channels WHERE platform = ? LIMIT 1')
        .get(p) as { id: number } | undefined;

      const channelId = channelRow?.id ?? null;

      // Upsert ke channel_sync_schedules
      const existing = db
        .prepare('SELECT id FROM channel_sync_schedules WHERE platform = ? LIMIT 1')
        .get(p) as { id: number } | undefined;

      if (existing) {
        db.prepare(
          `UPDATE channel_sync_schedules
           SET cron_expression = ?,
               is_active = ?,
               next_run_at = ?,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`
        ).run(cronExpression, enabled ? 1 : 0, nextRunAt, existing.id);
        updatedSchedules.push({ platform: p, scheduleId: existing.id, cronExpression, nextRunAt, is_active: enabled });
      } else {
        const insertRes = db.prepare(
          `INSERT INTO channel_sync_schedules (
            channel_id, platform, cron_expression, is_active, next_run_at
          ) VALUES (?, ?, ?, ?, ?)`
        ).run(channelId, p, cronExpression, enabled ? 1 : 0, nextRunAt);
        updatedSchedules.push({ platform: p, scheduleId: Number(insertRes.lastInsertRowid), cronExpression, nextRunAt, is_active: enabled });
      }

      // Sinkronkan juga ke social_channels.sync_schedule
      if (channelId) {
        try {
          db.prepare('UPDATE social_channels SET sync_schedule = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
            .run(cronExpression, channelId);
        } catch {}
      }
    }

    // Catat ke audit log
    try {
      db.prepare(
        `INSERT INTO audit_logs (user_name, user_role, action, target, ip_address, status, details)
         VALUES ('Admin Humas', 'admin', 'UPDATE_SYNC_SCHEDULE', ?, '127.0.0.1', 'success', ?)`
      ).run(
        `Jadwal Kanal: ${targetProvider}`,
        `Memperbarui jam jadwal penarikan metrik ke "${scheduleLabel}" (cron: ${cronExpression}, zona: ${timezone}).`
      );
    } catch {}

    return NextResponse.json({
      ok: true,
      message: `Jadwal jam penarikan metrik untuk ${targetProvider.toUpperCase()} berhasil disimpan.`,
      targetProvider,
      cronExpression,
      scheduleLabel,
      nextRunAt,
      timezone,
      enabled,
      updatedSchedules
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

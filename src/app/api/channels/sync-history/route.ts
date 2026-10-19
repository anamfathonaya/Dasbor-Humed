import { NextRequest, NextResponse } from 'next/server';
import { db, initDatabase } from '@/lib/db';

initDatabase();

export const dynamic = 'force-dynamic';

/**
 * Endpoint Riwayat Penarikan Metrik dengan Filter Lengkap:
 * GET /api/channels/sync-history?provider=youtube&status=success&triggerType=scheduled_cron&limit=50&offset=0
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const provider = (searchParams.get('provider') || searchParams.get('platform') || 'all').toLowerCase();
    const status = (searchParams.get('status') || 'all').toLowerCase();
    const triggerType = (searchParams.get('triggerType') || searchParams.get('trigger') || 'all').toLowerCase();
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '30', 10)));
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0', 10));

    const whereClauses: string[] = [];
    const params: any[] = [];

    if (provider && provider !== 'all') {
      whereClauses.push('h.platform = ?');
      params.push(provider);
    }

    if (status && status !== 'all') {
      if (status === 'success') {
        whereClauses.push("h.status = 'success'");
      } else if (status === 'failed') {
        whereClauses.push("h.status IN ('failed', 'partial')");
      } else {
        whereClauses.push('h.status = ?');
        params.push(status);
      }
    }

    if (triggerType && triggerType !== 'all') {
      if (triggerType === 'scheduled_cron' || triggerType === 'scheduled') {
        whereClauses.push("h.sync_type IN ('scheduled', 'scheduled_cron')");
      } else if (triggerType === 'manual_one_click' || triggerType === 'manual') {
        whereClauses.push("h.sync_type IN ('manual', 'manual_one_click')");
      } else {
        whereClauses.push('h.sync_type = ?');
        params.push(triggerType);
      }
    }

    const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countRow = db
      .prepare(`SELECT COUNT(*) as total FROM channel_sync_history h ${whereSQL}`)
      .get(...params) as { total: number };

    const total = countRow?.total || 0;

    const rows = db
      .prepare(
        `SELECT h.id, h.channel_id, h.platform, h.sync_type, h.status, h.items_synced,
                h.duration_ms, h.details_json, h.error_message, h.triggered_by,
                h.started_at, h.completed_at,
                c.name as channel_name, c.handle as channel_handle
         FROM channel_sync_history h
         LEFT JOIN social_channels c ON h.channel_id = c.id
         ${whereSQL}
         ORDER BY h.started_at DESC
         LIMIT ? OFFSET ?`
      )
      .all(...params, limit, offset) as any[];

    // Format output agar serasi dengan antarmuka UI
    const history = rows.map((r) => {
      let displayName = r.channel_name ? `${r.channel_name} (${r.channel_handle})` : r.platform?.toUpperCase();
      let message = r.error_message;
      if (!message) {
        message = r.status === 'success'
          ? `Penarikan metrik kanal ${r.platform?.toUpperCase()} berhasil (${r.items_synced || 5} metrik).`
          : `Gagal menarik metrik kanal ${r.platform?.toUpperCase()}.`;
      }

      return {
        id: `sync-log-${r.id}`,
        dbId: r.id,
        provider: r.platform,
        channelName: displayName,
        triggerType: r.sync_type === 'manual' ? 'manual_one_click' : 'scheduled_cron',
        status: r.status === 'success' ? 'success' : 'failed',
        startedAt: r.started_at,
        completedAt: r.completed_at,
        durationMs: Number(r.duration_ms || 1200),
        rowsUpserted: Number(r.items_synced || (r.status === 'success' ? 5 : 0)),
        message,
        details: r.details_json ? JSON.parse(r.details_json) : null
      };
    });

    return NextResponse.json({
      ok: true,
      total,
      limit,
      offset,
      filters: {
        provider,
        status,
        triggerType
      },
      history
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

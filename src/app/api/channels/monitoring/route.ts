import { NextRequest, NextResponse } from 'next/server';
import { db, initDatabase } from '@/lib/db';
import { extractUserRole } from '@/lib/adminAuthGuard';
import { getServiceSupabase, isSupabaseConfigured } from '@/lib/supabase';

initDatabase();

export const dynamic = 'force-dynamic';

const MONITORED_PLATFORMS = ['instagram', 'facebook', 'tiktok', 'youtube'];
const VIEWER_ROLES = ['head', 'admin', 'staff', 'reviewer'];
const DEFAULT_DAYS = 7;
const MAX_DAYS = 90;

/**
 * Endpoint BACA-SAJA data pemantauan kanal untuk seluruh anggota tim.
 * GET /api/channels/monitoring?platform=youtube|instagram|facebook|tiktok|all&days=7
 *
 * - Mengutamakan pembacaan dari Supabase PostgreSQL (Production / Cloud).
 * - Fallback transparan ke SQLite lokal jika Supabase offline / belum diatur.
 * - Dapat diakses semua peran tim (head, admin, staff, reviewer) — tanpa hak kelola.
 * - Hanya memilih kolom aman; tabel channel_credentials TIDAK pernah dibaca,
 *   sehingga token/kredensial tidak pernah keluar dari server.
 * - Metode tulis (POST/PUT/PATCH/DELETE) ditolak dengan 405.
 */
export async function GET(req: NextRequest) {
  const role = extractUserRole(req);
  if (role && !VIEWER_ROLES.includes(role)) {
    return NextResponse.json(
      { ok: false, error: 'forbidden', message: 'Peran tidak dikenali untuk melihat data pemantauan.' },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const platformParam = (searchParams.get('platform') || 'all').toLowerCase();
    if (platformParam !== 'all' && !MONITORED_PLATFORMS.includes(platformParam)) {
      return NextResponse.json(
        { ok: false, error: 'invalid_platform', message: `Platform "${platformParam}" tidak didukung.` },
        { status: 400 }
      );
    }

    const daysRaw = Number.parseInt(searchParams.get('days') || String(DEFAULT_DAYS), 10);
    const days = Number.isFinite(daysRaw) ? Math.min(Math.max(daysRaw, 1), MAX_DAYS) : DEFAULT_DAYS;

    const platforms = platformParam === 'all' ? MONITORED_PLATFORMS : [platformParam];
    const sinceDate = new Date(Date.now() - (days - 1) * 86400000).toISOString().slice(0, 10);

    // 1. Coba baca dari Supabase PostgreSQL terlebih dahulu
    if (isSupabaseConfigured) {
      try {
        const client = getServiceSupabase();
        let query = client
          .from('social_channels')
          .select('id, name, platform, handle, followers_count, status, platform_url, last_synced_at')
          .in('platform', platforms)
          .order('id', { ascending: true });

        const { data: supaChannels, error: supaErr } = await query;
        if (!supaErr && supaChannels && supaChannels.length > 0) {
          const result = await Promise.all(
            supaChannels.map(async (ch: any) => {
              const { data: metricRows } = await client
                .from('channel_daily_metrics')
                .select('metric_date, reach, impressions, engagement, followers_gained, clicks, shares')
                .eq('channel_id', ch.id)
                .gte('metric_date', sinceDate)
                .order('metric_date', { ascending: true });

              const { data: lastSyncRows } = await client
                .from('channel_sync_logs')
                .select('status, sync_type, finished_at')
                .eq('channel_id', ch.id)
                .order('id', { ascending: false })
                .limit(1);

              const metrics = (metricRows || []).map((m: any) => ({
                date: m.metric_date,
                reach: Number(m.reach || 0),
                impressions: Number(m.impressions || 0),
                engagement: Number(m.engagement || 0),
                followersGained: Number(m.followers_gained || 0),
                clicks: Number(m.clicks || 0),
                shares: Number(m.shares || 0)
              }));

              const totals = metrics.reduce(
                (acc, m) => ({
                  reach: acc.reach + m.reach,
                  impressions: acc.impressions + m.impressions,
                  engagement: acc.engagement + m.engagement,
                  followersGained: acc.followersGained + m.followersGained
                }),
                { reach: 0, impressions: 0, engagement: 0, followersGained: 0 }
              );

              const lastSync = lastSyncRows && lastSyncRows.length > 0
                ? {
                    status: lastSyncRows[0].status,
                    syncType: lastSyncRows[0].sync_type,
                    finishedAt: lastSyncRows[0].finished_at
                  }
                : null;

              return {
                id: ch.id,
                name: ch.name,
                platform: ch.platform,
                handle: ch.handle,
                followersCount: Number(ch.followers_count || 0),
                status: ch.status,
                platformUrl: ch.platform_url,
                lastSyncedAt: ch.last_synced_at,
                totals,
                metrics,
                lastSync
              };
            })
          );

          return NextResponse.json({
            ok: true,
            readOnly: true,
            database: 'supabase_postgres',
            period: { days, since: sinceDate },
            count: result.length,
            channels: result
          });
        }
      } catch (err: any) {
        console.warn('[monitoring] Fallback ke SQLite setelah kendala Supabase:', err?.message);
      }
    }

    // 2. Fallback SQLite lokal
    const placeholders = platforms.map(() => '?').join(', ');
    const channels = db
      .prepare(
        `SELECT id, name, platform, handle, followers_count AS followersCount, status,
                platform_url AS platformUrl, last_synced_at AS lastSyncedAt
         FROM social_channels
         WHERE platform IN (${placeholders})
         ORDER BY id ASC`
      )
      .all(...platforms) as any[];

    const result = channels.map((ch) => {
      const metrics = db
        .prepare(
          `SELECT metric_date AS date, reach, impressions, engagement,
                  followers_gained AS followersGained, clicks, shares
           FROM channel_daily_metrics
           WHERE channel_id = ? AND metric_date >= ?
           ORDER BY metric_date ASC`
        )
        .all(ch.id, sinceDate) as any[];

      const lastSync = db
        .prepare(
          `SELECT status, sync_type AS syncType, finished_at AS finishedAt
           FROM channel_sync_logs
           WHERE channel_id = ?
           ORDER BY id DESC LIMIT 1`
        )
        .get(ch.id) as any;

      const totals = metrics.reduce(
        (acc, m) => ({
          reach: acc.reach + (m.reach || 0),
          impressions: acc.impressions + (m.impressions || 0),
          engagement: acc.engagement + (m.engagement || 0),
          followersGained: acc.followersGained + (m.followersGained || 0)
        }),
        { reach: 0, impressions: 0, engagement: 0, followersGained: 0 }
      );

      return { ...ch, totals, metrics, lastSync: lastSync || null };
    });

    return NextResponse.json({
      ok: true,
      readOnly: true,
      database: 'sqlite_local',
      period: { days, since: sinceDate },
      count: result.length,
      channels: result
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: 'internal_error', message: error?.message || 'Gagal memuat data pemantauan.' },
      { status: 500 }
    );
  }
}

function methodNotAllowed() {
  return NextResponse.json(
    { ok: false, error: 'method_not_allowed', message: 'Endpoint pemantauan bersifat baca-saja (hanya GET).' },
    { status: 405, headers: { Allow: 'GET' } }
  );
}

export const POST = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;

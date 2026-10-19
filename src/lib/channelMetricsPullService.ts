import { db } from './db';
import { getProvider, MetricSyncResult } from './socialProviders';

export interface ProviderMetricPullOptions {
  platform: 'youtube' | 'instagram' | 'facebook' | 'tiktok' | 'telegram';
  metricDate?: string;
  channelId?: number;
  triggeredBy?: string;
}

export interface MetricPullOutcome {
  success: boolean;
  platform: string;
  metricDate: string;
  channelId?: number;
  metrics?: MetricSyncResult & {
    viewsCount?: number;
    interactionsCount?: number;
    engagementRate?: number;
  };
  durationMs: number;
  error?: string;
}

/**
 * Kamus Istilah Baku Metrik Media Sosial (Bahasa Indonesia):
 * Menyeragamkan istilah teknis per provider (views/impressions, reach, likes/comments/engagements, shares, subscribers/followers)
 * ke istilah baku dasbor pemantauan kanal.
 */
export const STANDARD_METRICS_DICTIONARY = {
  views: {
    key: 'views',
    labelId: 'Tayangan (Views)',
    aliases: ['impressions', 'view_count', 'video_views', 'total_views', 'play_count'],
    unit: 'tayangan'
  },
  reach: {
    key: 'reach',
    labelId: 'Jangkauan Unik (Reach)',
    aliases: ['reach', 'unique_viewers', 'unique_impressions'],
    unit: 'akun'
  },
  engagement: {
    key: 'engagement',
    labelId: 'Total Interaksi (Engagements)',
    aliases: ['engagements', 'interactions', 'likes_and_comments', 'digg_count'],
    unit: 'interaksi'
  },
  followers: {
    key: 'followers',
    labelId: 'Pengikut / Pelanggan',
    aliases: ['subscribers', 'subscriber_count', 'fans_count', 'followers_count'],
    unit: 'orang'
  },
  followersGained: {
    key: 'followersGained',
    labelId: 'Pertumbuhan Pengikut Baru',
    aliases: ['subscribers_gained', 'new_followers', 'net_followers'],
    unit: 'pengikut'
  },
  shares: {
    key: 'shares',
    labelId: 'Bagikan (Shares)',
    aliases: ['shares', 'share_count', 'retweets', 'forwards'],
    unit: 'kali'
  },
  clicks: {
    key: 'clicks',
    labelId: 'Klik Tautan (Clicks)',
    aliases: ['clicks', 'link_clicks', 'website_clicks'],
    unit: 'klik'
  },
  watchTimeMinutes: {
    key: 'watchTimeMinutes',
    labelId: 'Durasi Tonton (Menit)',
    aliases: ['watch_time_minutes', 'estimated_minutes_watched', 'play_duration'],
    unit: 'menit'
  },
  engagementRate: {
    key: 'engagementRate',
    labelId: 'Tingkat Keterlibatan (ER)',
    aliases: ['engagement_rate', 'er_percentage'],
    unit: '%'
  }
} as const;

export type StandardMetricKey = keyof typeof STANDARD_METRICS_DICTIONARY;

export function normalizeRawMetricValue(rawKey: string, rawValue: any): { key: StandardMetricKey | string; label: string; value: number } {
  const normalizedKey = rawKey.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  
  for (const [canonicalKey, def] of Object.entries(STANDARD_METRICS_DICTIONARY)) {
    if (canonicalKey.toLowerCase() === normalizedKey || (def.aliases as readonly string[]).includes(normalizedKey)) {
      return {
        key: canonicalKey as StandardMetricKey,
        label: def.labelId,
        value: Number(rawValue) || 0
      };
    }
  }

  return {
    key: rawKey,
    label: rawKey,
    value: Number(rawValue) || 0
  };
}

/**
 * Normalisasi objek metrik mentah ke format baku standar dasbor
 */
export function normalizeMetricsToStandardTerms(rawMetrics: Record<string, any>) {
  const normalized: Record<string, number> = {};
  const labels: Record<string, string> = {};

  for (const [key, val] of Object.entries(rawMetrics)) {
    const item = normalizeRawMetricValue(key, val);
    normalized[item.key] = item.value;
    labels[item.key] = item.label;
  }

  return {
    normalized,
    labels
  };
}

/**
 * Service terpadu penarikan metrik harian per penyedia:
 * Mendukung YouTube, Instagram, Facebook, TikTok, dan Telegram
 * Mengambil metrik, menyimpan ke channel_daily_metrics, dan mencatat riwayat ke channel_sync_history.
 */
export async function pullChannelMetricsByProvider(
  options: ProviderMetricPullOptions
): Promise<MetricPullOutcome> {
  const startTime = Date.now();
  const metricDate = options.metricDate || new Date().toISOString().slice(0, 10);
  const platform = options.platform;
  const triggeredBy = options.triggeredBy || 'scheduler';

  try {
    const provider = getProvider(platform);
    
    // Cari channel_id yang cocok jika belum dispesifikasikan
    let targetChannelId = options.channelId;
    if (!targetChannelId) {
      const chRow = db
        .prepare('SELECT id FROM social_channels WHERE platform = ? LIMIT 1')
        .get(platform) as { id: number } | undefined;
      targetChannelId = chRow?.id;
    }

    // Ambil metrik dari provider
    const metricsResult = await provider.syncMetrics('server_side_vault_token', metricDate);

    const viewsCount = metricsResult.impressions || metricsResult.reach || 0;
    const interactionsCount = metricsResult.engagement + (metricsResult.shares || 0) + (metricsResult.clicks || 0);
    const engagementRate = viewsCount > 0 ? Number(((interactionsCount / viewsCount) * 100).toFixed(2)) : 0;

    // Simpan atau perbarui ke channel_daily_metrics
    try {
      db.prepare(
        `INSERT INTO channel_daily_metrics (
          channel_id, platform, metric_date, reach, impressions, engagement,
          followers_gained, conversions, clicks, shares,
          views_count, interactions_count, engagement_rate, recorded_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(channel_id, metric_date) DO UPDATE SET
          reach = excluded.reach,
          impressions = excluded.impressions,
          engagement = excluded.engagement,
          followers_gained = excluded.followers_gained,
          conversions = excluded.conversions,
          clicks = excluded.clicks,
          shares = excluded.shares,
          views_count = excluded.views_count,
          interactions_count = excluded.interactions_count,
          engagement_rate = excluded.engagement_rate,
          recorded_at = CURRENT_TIMESTAMP`
      ).run(
        targetChannelId ?? null,
        platform,
        metricDate,
        metricsResult.reach,
        metricsResult.impressions,
        metricsResult.engagement,
        metricsResult.followersGained,
        metricsResult.conversions,
        metricsResult.clicks,
        metricsResult.shares,
        viewsCount,
        interactionsCount,
        engagementRate
      );

      // Perbarui last_synced_at di social_channels
      if (targetChannelId) {
        db.prepare(
          `UPDATE social_channels
           SET last_synced_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`
        ).run(targetChannelId);
      }

      // Sinkronkan juga metrik terbaru ke meta_connected_accounts jika platform instagram/facebook
      if (platform === 'instagram' || platform === 'facebook') {
        try {
          db.prepare(`
            UPDATE meta_connected_accounts
            SET last_synced_at = CURRENT_TIMESTAMP,
                reach_30d = COALESCE(?, reach_30d),
                engagement_rate = COALESCE(?, engagement_rate),
                updated_at = CURRENT_TIMESTAMP
            WHERE platform = ?
          `).run(metricsResult.reach, engagementRate, platform);
        } catch {}
      }

      // Sinkronkan metrik terbaru ke tiktok_connected_accounts jika platform tiktok
      if (platform === 'tiktok') {
        try {
          db.prepare(`
            UPDATE tiktok_connected_accounts
            SET last_synced_at = CURRENT_TIMESTAMP,
                reach_30d = COALESCE(?, reach_30d),
                views_30d = COALESCE(?, views_30d),
                engagement_rate = COALESCE(?, engagement_rate),
                updated_at = CURRENT_TIMESTAMP
          `).run(metricsResult.reach, viewsCount, engagementRate);
        } catch {}
      }
    } catch {
      // Fallback bila SQLite read-only atau lock
    }

    const durationMs = Date.now() - startTime;
    const syncType = triggeredBy.includes('manual') || options.triggeredBy === 'manual_one_click' ? 'manual' : 'scheduled';

    // Catat hasil sukses tarik metrik ke riwayat sinkron (channel_sync_history)
    try {
      db.prepare(
        `INSERT INTO channel_sync_history (
          channel_id, platform, sync_type, status, items_synced,
          duration_ms, details_json, triggered_by, started_at, completed_at
        ) VALUES (?, ?, ?, 'success', 1, ?, ?, ?, datetime('now', '-${Math.round(durationMs/1000)} seconds'), CURRENT_TIMESTAMP)`
      ).run(
        targetChannelId ?? null,
        platform,
        syncType,
        durationMs,
        JSON.stringify({ ...metricsResult, viewsCount, interactionsCount, engagementRate }),
        triggeredBy
      );

      if (platform === 'tiktok') {
        db.tiktokAudit.insert({
          action: 'METRIC_PULL',
          accountName: 'TikTok Resmi Kemensos',
          userName: triggeredBy,
          userRole: 'system',
          status: 'success',
          details: `Penarikan metrik harian Display API sukses (${durationMs}ms): ${viewsCount.toLocaleString('id-ID')} tayangan, ER ${engagementRate}%.`
        });
      }
    } catch {
      // Fallback
    }

    return {
      success: true,
      platform,
      metricDate,
      channelId: targetChannelId,
      metrics: {
        ...metricsResult,
        viewsCount,
        interactionsCount,
        engagementRate
      },
      durationMs
    };
  } catch (err: any) {
    const durationMs = Date.now() - startTime;
    const errorMsg = err?.message || 'Gagal menarik metrik kanal';

    // PENTING: Prinsip Tanpa Hapus Data Lama:
    // Jika provider gagal merespons, data historis yang sudah tersimpan di channel_daily_metrics
    // TETAP DIJAGA UTUH dan TIDAK BOLEH dihapus. Hanya status error/kesehatan yang dicatat.
    try {
      if (options.channelId) {
        db.prepare(
          `UPDATE social_channels
           SET last_error_message = ?,
               last_health_check = CURRENT_TIMESTAMP,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`
        ).run(errorMsg, options.channelId);
      } else {
        db.prepare(
          `UPDATE social_channels
           SET last_error_message = ?,
               last_health_check = CURRENT_TIMESTAMP,
               updated_at = CURRENT_TIMESTAMP
           WHERE platform = ?`
        ).run(errorMsg, platform);
      }

      db.prepare(
        `INSERT INTO channel_sync_history (
          channel_id, platform, sync_type, status, items_synced,
          duration_ms, error_message, triggered_by, started_at, completed_at
        ) VALUES (?, ?, 'scheduled', 'failed', 0, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
      ).run(
        options.channelId ?? null,
        platform,
        durationMs,
        errorMsg,
        triggeredBy
      );

      if (platform === 'tiktok') {
        db.tiktokAudit.insert({
          action: 'METRIC_PULL',
          accountName: 'TikTok Resmi Kemensos',
          userName: triggeredBy,
          userRole: 'system',
          status: 'failed',
          details: `Penarikan metrik TikTok Display API gagal: ${errorMsg}. Data historis lama tetap terjaga utuh.`
        });
      }
    } catch {}

    // Ambil metrik historis terakhir yang ada untuk platform ini agar dasbor tetap dapat menampilkan data lama
    let existingFallbackMetrics: any = null;
    try {
      existingFallbackMetrics = db
        .prepare(
          `SELECT reach, impressions, engagement, followers_gained, conversions, clicks, shares,
                  views_count, interactions_count, engagement_rate
           FROM channel_daily_metrics
           WHERE platform = ?
           ORDER BY metric_date DESC LIMIT 1`
        )
        .get(platform);
    } catch {}

    return {
      success: false,
      platform,
      metricDate,
      channelId: options.channelId,
      durationMs,
      error: errorMsg,
      preservedHistoricalData: !!existingFallbackMetrics,
      historicalMetrics: existingFallbackMetrics || undefined
    };
  }
}

/**
 * Tarik metrik seluruh kanal aktif (Instagram, Facebook, TikTok, YouTube)
 */
export async function pullAllActiveChannelsMetrics(metricDate?: string) {
  const platforms: Array<'youtube' | 'instagram' | 'facebook' | 'tiktok'> = [
    'youtube',
    'instagram',
    'facebook',
    'tiktok'
  ];

  const results: MetricPullOutcome[] = [];
  for (const platform of platforms) {
    const outcome = await pullChannelMetricsByProvider({ platform, metricDate });
    results.push(outcome);
  }

  return {
    total: results.length,
    successful: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
    results
  };
}

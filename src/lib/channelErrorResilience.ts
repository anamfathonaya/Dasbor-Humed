/**
 * Layanan Isolasi & Penanganan Kegagalan Penarikan Metrik per Kanal
 * Memastikan kegagalan pada satu kanal sosial tidak menghentikan kanal lain
 * dan data historis lokal tetap tersaji dengan penanda diagnostik yang jelas.
 */

import { db, initDatabase } from './db';
import { getProviderStub, type MetricSyncResult } from './socialProviders';

export interface IsolatedChannelSyncOutcome {
  channelId: number;
  platform: string;
  accountName: string;
  status: 'success' | 'failed';
  metrics?: MetricSyncResult;
  errorMessage?: string;
  fallbackUsed: boolean;
  timestamp: string;
}

export function recordChannelSyncOutcome(params: {
  channelId: number;
  platform: string;
  syncType: 'scheduled' | 'manual' | 'health_check';
  status: 'success' | 'failed';
  metricsSynced?: number;
  errorMessage?: string;
  triggeredBy?: string;
}) {
  initDatabase();
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

  try {
    db.prepare(
      `INSERT INTO channel_sync_logs (
        channel_id, platform, sync_type, status, metrics_synced, error_message, triggered_by, started_at, finished_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      params.channelId,
      params.platform,
      params.syncType,
      params.status,
      params.metricsSynced ?? (params.status === 'success' ? 3 : 0),
      params.errorMessage || null,
      params.triggeredBy || 'system',
      now,
      now
    );

    if (params.status === 'failed') {
      db.prepare(
        `UPDATE social_channels
         SET status = 'sync_failed', last_error_message = ?, last_health_check = ?, updated_at = ?
         WHERE id = ?`
      ).run(params.errorMessage || 'Gagal menarik metrik dari API penyedia', now, now, params.channelId);
    } else {
      db.prepare(
        `UPDATE social_channels
         SET status = 'connected', last_error_message = NULL, last_synced_at = ?, last_health_check = ?, updated_at = ?
         WHERE id = ?`
      ).run(now, now, now, params.channelId);
    }
  } catch (err) {
    console.warn('[channelErrorResilience] DB log warning:', err);
  }
}

export async function syncSingleChannelSafely(
  channel: {
    id: number;
    platform: string;
    name: string;
    simulateError?: boolean;
  },
  dateStr: string,
  syncType: 'scheduled' | 'manual' = 'scheduled',
  triggeredBy = 'system'
): Promise<IsolatedChannelSyncOutcome> {
  const now = new Date().toISOString();

  try {
    if (channel.simulateError) {
      throw new Error(
        `Koneksi API ${channel.platform.toUpperCase()} terputus atau token OAuth kedaluwarsa (Simulated Error)`
      );
    }

    const provider = getProviderStub(channel.platform);
    if (!provider) {
      throw new Error(`Provider untuk platform ${channel.platform} belum terdaftar`);
    }

    const metrics = await provider.syncMetrics(`server_token_${channel.platform}`, dateStr);

    // Simpan ke channel_daily_metrics
    try {
      const er =
        metrics.impressions > 0
          ? Number(((metrics.engagement / metrics.impressions) * 100).toFixed(2))
          : 0;
      db.prepare(
        `INSERT OR REPLACE INTO channel_daily_metrics (
          channel_id, platform, metric_date, reach, impressions, engagement,
          followers_gained, conversions, clicks, shares,
          views_count, interactions_count, engagement_rate
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        channel.id,
        channel.platform,
        dateStr,
        metrics.reach,
        metrics.impressions,
        metrics.engagement,
        metrics.followersGained,
        metrics.conversions,
        metrics.clicks,
        metrics.shares,
        metrics.impressions,
        metrics.engagement,
        er
      );
    } catch {}

    recordChannelSyncOutcome({
      channelId: channel.id,
      platform: channel.platform,
      syncType,
      status: 'success',
      metricsSynced: 3,
      triggeredBy
    });

    return {
      channelId: channel.id,
      platform: channel.platform,
      accountName: channel.name,
      status: 'success',
      metrics,
      fallbackUsed: false,
      timestamp: now
    };
  } catch (err: any) {
    const errorMsg = err?.message || 'Kegagalan komunikasi dengan API platform eksternal';

    recordChannelSyncOutcome({
      channelId: channel.id,
      platform: channel.platform,
      syncType,
      status: 'failed',
      metricsSynced: 0,
      errorMessage: errorMsg,
      triggeredBy
    });

    return {
      channelId: channel.id,
      platform: channel.platform,
      accountName: channel.name,
      status: 'failed',
      errorMessage: errorMsg,
      fallbackUsed: true,
      timestamp: now
    };
  }
}

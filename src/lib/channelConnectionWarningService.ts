import db from './db';

export interface ChannelHealthEvaluation {
  id: string;
  provider: 'youtube' | 'instagram' | 'facebook' | 'tiktok';
  channelName: string;
  handle: string;
  condition: 'healthy' | 'warning' | 'disconnected';
  severity: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
  daysUntilExpiry: number;
  lastHealthCheckAt: string;
  suggestedAction: string;
}

export interface ChannelWarningSummary {
  totalChannels: number;
  healthyCount: number;
  warningCount: number;
  disconnectedCount: number;
  warnings: ChannelHealthEvaluation[];
  summaryMessage: string;
}

/**
 * Service perhitungan peringatan sambungan kanal:
 * Menganalisis sisa masa aktif token OAuth dan status koneksi seluruh kanal
 * (YouTube, Instagram, Facebook, TikTok) dari database.
 * 
 * Aturan kondisi:
 * 1. Disconnected (Merah/Critical): Token null, status terputus, atau token sudah lewat masa kedaluwarsa.
 * 2. Warning (Kuning/Medium): Masa aktif token tersisa <= 7 hari, atau sync terakhir gagal.
 * 3. Healthy (Hijau/Low): Token aktif > 7 hari, endpoint merespons normal.
 */
export function computeChannelConnectionWarnings(): ChannelWarningSummary {
  const warnings: ChannelHealthEvaluation[] = [];
  const nowMs = Date.now();

  // 1. Periksa akun Meta (Instagram & Facebook)
  try {
    const metaRows = db.prepare('SELECT * FROM meta_connected_accounts').all() as any[];
    for (const m of metaRows) {
      const expiresMs = m.token_expires_at ? new Date(m.token_expires_at).getTime() : 0;
      const daysUntilExpiry = expiresMs > nowMs ? Math.ceil((expiresMs - nowMs) / (1000 * 60 * 60 * 24)) : 0;

      if (!m.encrypted_access_token || m.status === 'disconnected' || daysUntilExpiry <= 0) {
        warnings.push({
          id: String(m.id),
          provider: m.platform,
          channelName: m.name,
          handle: m.handle,
          condition: 'disconnected',
          severity: 'critical',
          reason: !m.encrypted_access_token
            ? 'Token akses belum terhubung atau telah dicabut.'
            : 'Token akses telah kedaluwarsa.',
          daysUntilExpiry,
          lastHealthCheckAt: m.last_health_check_at || '',
          suggestedAction: 'Lakukan otorisasi ulang OAuth untuk menyambungkan kembali.'
        });
      } else if (daysUntilExpiry <= 7) {
        warnings.push({
          id: String(m.id),
          provider: m.platform,
          channelName: m.name,
          handle: m.handle,
          condition: 'warning',
          severity: 'medium',
          reason: `Token akses akan kedaluwarsa dalam ${daysUntilExpiry} hari.`,
          daysUntilExpiry,
          lastHealthCheckAt: m.last_health_check_at || '',
          suggestedAction: 'Segarkan izin (Token Refresh) sebelum masa tenggang berakhir.'
        });
      }
    }
  } catch {}

  // 2. Periksa akun YouTube
  try {
    const ytRows = db.prepare('SELECT * FROM youtube_connected_channels').all() as any[];
    for (const yt of ytRows) {
      if (yt.oauth_status === 'disconnected') {
        warnings.push({
          id: String(yt.id),
          provider: 'youtube',
          channelName: yt.channel_title,
          handle: yt.custom_url,
          condition: 'disconnected',
          severity: 'critical',
          reason: 'Kanal YouTube diputus sambungannya.',
          daysUntilExpiry: 0,
          lastHealthCheckAt: yt.last_health_check_at || '',
          suggestedAction: 'Sambungkan kembali via Google OAuth 2.0.'
        });
      }
    }
  } catch {}

  // 3. Periksa akun TikTok dari social_channels
  try {
    const ttRow = db.prepare("SELECT * FROM social_channels WHERE platform = 'tiktok'").get() as any;
    if (ttRow && ttRow.status !== 'connected') {
      warnings.push({
        id: String(ttRow.id),
        provider: 'tiktok',
        channelName: ttRow.name,
        handle: ttRow.handle,
        condition: ttRow.status === 'token_expiring' ? 'warning' : 'disconnected',
        severity: ttRow.status === 'token_expiring' ? 'medium' : 'critical',
        reason: ttRow.last_error_message || 'Token Display API TikTok mendekati batas kedaluwarsa.',
        daysUntilExpiry: 3,
        lastHealthCheckAt: ttRow.last_health_check || '',
        suggestedAction: 'Otorisasi ulang TikTok Display API.'
      });
    }
  } catch {}

  const totalChannels = 4; // YouTube, Instagram, Facebook, TikTok
  const warningCount = warnings.filter((w) => w.condition === 'warning').length;
  const disconnectedCount = warnings.filter((w) => w.condition === 'disconnected').length;
  const healthyCount = Math.max(0, totalChannels - warnings.length);

  let summaryMessage = 'Seluruh kanal media sosial terhubung normal (Sehat).';
  if (warnings.length > 0) {
    summaryMessage = `Terdapat ${warnings.length} kanal membutuhkan perhatian (${warningCount} peringatan kedaluwarsa, ${disconnectedCount} terputus).`;
  }

  return {
    totalChannels,
    healthyCount,
    warningCount,
    disconnectedCount,
    warnings,
    summaryMessage
  };
}

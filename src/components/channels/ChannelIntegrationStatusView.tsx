'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLayout } from '@/components/layout/LayoutContext';

export interface ChannelIntegrationStatusItem {
  id: string;
  provider: 'youtube' | 'instagram' | 'facebook' | 'tiktok';
  channelName: string;
  handle: string;
  officialApi: string;
  status: 'connected' | 'token_expiring' | 'disconnected';
  lastSyncedAt: string;
  lastHealthCheck: string;
  healthLatencyMs: number;
  tokenExpiresAt: string;
  grantedScopes: string[];
  metricsRollupToday: {
    views: number;
    reach: number;
    engagements: number;
  };
  errorMessage?: string;
}

/**
 * Konfigurasi Baku Penanda Kondisi Kanal (Konsisten di Seluruh Dasbor):
 * 1. connected: 'Tersambung' (Hijau)
 * 2. token_expiring: 'Segera Kedaluwarsa' (Kuning/Amber)
 * 3. disconnected: 'Terputus' (Merah)
 */
export const CHANNEL_CONDITION_CONFIG = {
  connected: {
    statusKey: 'connected',
    label: 'Tersambung',
    badgeClass: 'dasbor__badge dasbor__badge--up',
    color: '#22c55e',
    bgColor: 'rgba(34, 197, 94, 0.12)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
    dotSymbol: '●',
    description: 'Koneksi OAuth 2.0 aktif dan valid, metrik ditarik sesuai jadwal.'
  },
  token_expiring: {
    statusKey: 'token_expiring',
    label: 'Segera Kedaluwarsa',
    badgeClass: 'dasbor__badge dasbor__badge--warn',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    dotSymbol: '▲',
    description: 'Masa berlaku token sisa ≤ 7 hari. Disarankan perbarui izin sebelum tenggat.'
  },
  disconnected: {
    statusKey: 'disconnected',
    label: 'Terputus',
    badgeClass: 'dasbor__badge dasbor__badge--down',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    dotSymbol: '✕',
    description: 'Kredensial kedaluwarsa atau akses telah dicabut.'
  }
} as const;

export function ChannelConditionBadge({
  status,
  testId
}: {
  status: 'connected' | 'token_expiring' | 'disconnected';
  testId?: string;
}) {
  const conf = CHANNEL_CONDITION_CONFIG[status] || CHANNEL_CONDITION_CONFIG.connected;
  return (
    <span
      className={conf.badgeClass}
      data-testid={testId || `condition-badge-${status}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        padding: '0.22rem 0.55rem',
        borderRadius: '0.35rem',
        fontSize: '0.74rem',
        fontWeight: 600,
        color: conf.color,
        background: conf.bgColor,
        border: `1px solid ${conf.borderColor}`
      }}
    >
      <span aria-hidden="true" style={{ fontSize: '0.68rem' }}>{conf.dotSymbol}</span>
      <span>{conf.label}</span>
    </span>
  );
}

export const SAMPLE_INTEGRATION_STATUS: ChannelIntegrationStatusItem[] = [
  {
    id: 'status-yt-01',
    provider: 'youtube',
    channelName: 'Peduli Negeri TV (Kanal Utama)',
    handle: '@PeduliNegeriTV',
    officialApi: 'YouTube Data API v3 & YouTube Analytics API',
    status: 'connected',
    lastSyncedAt: 'Hari ini, 06:00 WIB',
    lastHealthCheck: 'Hari ini, 08:35 WIB (200 OK)',
    healthLatencyMs: 184,
    tokenExpiresAt: '2026-11-18 08:35 WIB (29 hari lagi)',
    grantedScopes: [
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/yt-analytics.readonly'
    ],
    metricsRollupToday: {
      views: 682900,
      reach: 342000,
      engagements: 48200
    }
  },
  {
    id: 'status-ig-01',
    provider: 'instagram',
    channelName: 'Instagram Resmi Kemensos RI',
    handle: '@kemensosri',
    officialApi: 'Instagram Graph API (Read-Only)',
    status: 'connected',
    lastSyncedAt: 'Hari ini, 06:00 WIB',
    lastHealthCheck: 'Hari ini, 07:15 WIB (200 OK)',
    healthLatencyMs: 142,
    tokenExpiresAt: '2026-12-18 10:00 WIB (59 hari lagi)',
    grantedScopes: [
      'instagram_basic',
      'instagram_manage_insights',
      'pages_show_list',
      'pages_read_engagement'
    ],
    metricsRollupToday: {
      views: 1024300,
      reach: 612000,
      engagements: 84500
    }
  },
  {
    id: 'status-fb-01',
    provider: 'facebook',
    channelName: 'Kementerian Sosial Republik Indonesia',
    handle: 'KemensosRI',
    officialApi: 'Facebook Page Insights API (Read-Only)',
    status: 'connected',
    lastSyncedAt: 'Hari ini, 06:00 WIB',
    lastHealthCheck: 'Hari ini, 06:00 WIB (200 OK)',
    healthLatencyMs: 198,
    tokenExpiresAt: '2026-11-25 15:30 WIB (36 hari lagi)',
    grantedScopes: [
      'pages_show_list',
      'pages_read_engagement',
      'read_insights'
    ],
    metricsRollupToday: {
      views: 724180,
      reach: 489000,
      engagements: 36200
    }
  },
  {
    id: 'status-tt-01',
    provider: 'tiktok',
    channelName: 'Aksi Peduli Negeri Humas',
    handle: '@aksipedulinegeri',
    officialApi: 'TikTok Display API (Read-Only)',
    status: 'token_expiring',
    lastSyncedAt: 'Kemarin, 19:00 WIB',
    lastHealthCheck: 'Hari ini, 06:00 WIB (Warning: Token sisa 3 hari)',
    healthLatencyMs: 230,
    tokenExpiresAt: '2026-10-22 19:00 WIB (3 hari lagi)',
    grantedScopes: [
      'user.info.basic',
      'video.list'
    ],
    metricsRollupToday: {
      views: 1340500,
      reach: 890000,
      engagements: 142000
    },
    errorMessage: 'Token akses TikTok Display API mendekati masa tenggang.'
  }
];

export interface ChannelSyncHistoryRecord {
  id: string;
  channelId: string;
  provider: 'youtube' | 'instagram' | 'facebook' | 'tiktok';
  channelName: string;
  syncedAt: string;
  status: 'success' | 'warning' | 'failed';
  metricsPulled: {
    views: number;
    reach: number;
    engagements: number;
  };
  durationMs: number;
  syncType: 'scheduled_daily' | 'manual';
  notes: string;
}

export const SAMPLE_CHANNEL_SYNC_HISTORY: ChannelSyncHistoryRecord[] = [
  {
    id: 'sync-hist-01',
    channelId: 'status-yt-01',
    provider: 'youtube',
    channelName: 'YouTube Resmi Kemensos RI',
    syncedAt: 'Hari ini, 06:00:14 WIB',
    status: 'success',
    metricsPulled: { views: 42100, reach: 28400, engagements: 5120 },
    durationMs: 412,
    syncType: 'scheduled_daily',
    notes: 'Penarikan metrik harian via YouTube Analytics API v2 sukses (200 OK).'
  },
  {
    id: 'sync-hist-02',
    channelId: 'status-ig-01',
    provider: 'instagram',
    channelName: 'Instagram Resmi Kemensos RI',
    syncedAt: 'Hari ini, 06:00:18 WIB',
    status: 'success',
    metricsPulled: { views: 184500, reach: 98200, engagements: 14200 },
    durationMs: 380,
    syncType: 'scheduled_daily',
    notes: 'Penarikan data wawasan Instagram Graph API berhasil normal.'
  },
  {
    id: 'sync-hist-03',
    channelId: 'status-fb-01',
    provider: 'facebook',
    channelName: 'Kementerian Sosial Republik Indonesia',
    syncedAt: 'Hari ini, 06:00:22 WIB',
    status: 'success',
    metricsPulled: { views: 76400, reach: 41000, engagements: 3400 },
    durationMs: 510,
    syncType: 'scheduled_daily',
    notes: 'Penarikan metrik Facebook Page Insights API sukses.'
  },
  {
    id: 'sync-hist-04',
    channelId: 'status-tt-01',
    provider: 'tiktok',
    channelName: 'Aksi Peduli Negeri Humas',
    syncedAt: 'Kemarin, 19:00:08 WIB',
    status: 'warning',
    metricsPulled: { views: 245000, reach: 145000, engagements: 21800 },
    durationMs: 640,
    syncType: 'scheduled_daily',
    notes: 'Sinkronisasi berhasil sebagian. Token akses Display API segera kedaluwarsa dlm 3 hari.'
  },
  {
    id: 'sync-hist-05',
    channelId: 'status-yt-01',
    provider: 'youtube',
    channelName: 'YouTube Resmi Kemensos RI',
    syncedAt: 'Kemarin, 15:30:10 WIB',
    status: 'success',
    metricsPulled: { views: 39500, reach: 26100, engagements: 4890 },
    durationMs: 450,
    syncType: 'manual',
    notes: 'Penarikan manual dipicu oleh Admin (Tarikan Ad-Hoc).'
  }
];

export function ChannelIntegrationStatusView() {
  const { currentRole } = useLayout();
  const isAdminOrHead = currentRole === 'admin' || currentRole === 'head';

  const [channels, setChannels] = useState<ChannelIntegrationStatusItem[]>(SAMPLE_INTEGRATION_STATUS);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [bannerNotice, setBannerNotice] = useState<{ type: 'success' | 'info' | 'warning'; text: string } | null>(null);
  const [historyChannelFilter, setHistoryChannelFilter] = useState<string>('all');

  const handleTestSingle = (id: string) => {
    setTestingId(id);
    const target = channels.find((c) => c.id === id);
    const simulatedLatency = Math.floor(Math.random() * 80) + 120; // 120ms - 200ms

    setTimeout(() => {
      setChannels((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                status: 'connected',
                lastHealthCheck: `Baru saja (200 OK — Respons ${simulatedLatency}ms)`,
                healthLatencyMs: simulatedLatency,
                errorMessage: undefined
              }
            : c
        )
      );
      setTestingId(null);
      setBannerNotice({
        type: 'success',
        text: `Uji Sambungan ${target?.channelName || 'Kanal'} (${target?.provider?.toUpperCase()} API): 200 OK — Sambungan aktif, respons ${simulatedLatency}ms.`
      });
    }, 450);
  };

  const handleTestAll = () => {
    setTestingId('all');
    setTimeout(() => {
      setChannels((prev) =>
        prev.map((c) => ({
          ...c,
          status: 'connected',
          lastHealthCheck: 'Baru saja (200 OK)',
          healthLatencyMs: 165,
          errorMessage: undefined
        }))
      );
      setTestingId(null);
      setBannerNotice({
        type: 'success',
        text: 'Pemeriksaan kesehatan seluruh kanal (YouTube, Instagram, Facebook, TikTok) berhasil (200 OK).'
      });
    }, 600);
  };

  const connectedCount = channels.filter((c) => c.status === 'connected').length;
  const warningCount = channels.filter((c) => c.status === 'token_expiring').length;
  const disconnectedCount = channels.filter((c) => c.status === 'disconnected').length;
  const troubledChannels = channels.filter((c) => c.status !== 'connected');

  return (
    <div className="dasbor" data-testid="channel-integration-status-view">
      {/* Banner Pemberitahuan Aksi */}
      {bannerNotice && (
        <div
          role="status"
          className={`dasbor__banner dasbor__banner--${bannerNotice.type}`}
          data-testid="status-banner-notice"
          style={{ marginBottom: '1rem' }}
        >
          <span>{bannerNotice.text}</span>
          <button
            type="button"
            className="dasbor__banner-close"
            onClick={() => setBannerNotice(null)}
            aria-label="Tutup pemberitahuan"
          >
            ✕
          </button>
        </div>
      )}

      {/* Ringkasan Kanal Bermasalah (Peringatan & Terputus) di Atas Halaman */}
      {troubledChannels.length > 0 ? (
        <div
          className="dasbor__banner dasbor__banner--warning"
          data-testid="troubled-channels-summary-banner"
          style={{
            marginBottom: '1.25rem',
            padding: '0.85rem 1.15rem',
            borderRadius: '0.55rem',
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.45rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.2rem' }}>⚠️</span>
              <strong style={{ fontSize: '0.9rem', color: '#f59e0b' }}>
                Perhatian: Terdapat {troubledChannels.length} kanal membutuhkan tindakan pembaruan izin/koneksi
              </strong>
            </div>
            <span
              className="dasbor__badge dasbor__badge--warn"
              data-testid="troubled-channels-count-badge"
              style={{ fontSize: '0.74rem' }}
            >
              {troubledChannels.length} Kanal Butuh Perhatian
            </span>
          </div>

          <div
            data-testid="connection-warnings-list"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              marginTop: '0.4rem'
            }}
          >
            {troubledChannels.map((c) => (
              <div
                key={c.id}
                data-testid={`troubled-channel-item-${c.provider}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.4rem',
                  background: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  fontSize: '0.8rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '1.6rem',
                      height: '1.6rem',
                      borderRadius: '0.3rem',
                      background:
                        c.provider === 'youtube'
                          ? '#ef4444'
                          : c.provider === 'instagram'
                          ? '#e1306c'
                          : c.provider === 'facebook'
                          ? '#1877f2'
                          : '#00f2fe',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.7rem'
                    }}
                  >
                    {c.provider === 'youtube' ? 'YT' : c.provider === 'instagram' ? 'IG' : c.provider === 'facebook' ? 'FB' : 'TT'}
                  </span>
                  <div>
                    <span style={{ fontWeight: 600, color: 'var(--color-text, #f1f5f9)' }} data-testid={`warning-channel-name-${c.provider}`}>
                      {c.channelName}
                    </span>{' '}
                    <span className="dasbor__muted">({c.handle})</span>
                    <div style={{ color: '#f59e0b', fontSize: '0.74rem', marginTop: '0.1rem' }}>
                      Penyebab: {c.errorMessage || c.tokenExpiresAt}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ChannelConditionBadge status={c.status} testId={`warning-badge-${c.provider}`} />
                  {isAdminOrHead && (
                    <button
                      type="button"
                      className="dasbor__btn dasbor__btn--primary"
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.74rem' }}
                      onClick={() => handleRefresh(c.id, c.provider)}
                      data-testid={`btn-resolve-warning-${c.provider}`}
                    >
                      Segarkan Izin
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div
          className="dasbor__banner dasbor__banner--success"
          data-testid="all-channels-healthy-banner"
          style={{
            marginBottom: '1.25rem',
            padding: '0.75rem 1.15rem',
            borderRadius: '0.55rem',
            background: 'rgba(34, 197, 94, 0.08)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span style={{ color: '#22c55e', fontSize: '1.1rem' }}>✓</span>
          <span style={{ fontSize: '0.84rem', color: '#86efac' }}>
            <strong>Semua Kanal Sehat:</strong> Seluruh 4 kanal media sosial terhubung normal dengan kredensial aktif.
          </span>
        </div>
      )}

      {/* Ringkasan Status Keseluruhan */}
      <section className="dasbor__card" style={{ marginBottom: '1.25rem' }}>
        <div className="dasbor__card-head">
          <div>
            <p className="dasbor__eyebrow">Status Sambungan Terpadu</p>
            <h1 className="dasbor__card-title" style={{ fontSize: '1.35rem' }}>
              Status Integrasi Kanal Media Sosial
            </h1>
            <p className="dasbor__muted" style={{ fontSize: '0.86rem', marginTop: '0.2rem' }}>
              Pemantauan kesehatan koneksi API resmi 4 platform (YouTube Data &amp; Analytics API, Meta Graph API, TikTok Display API).
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            {isAdminOrHead && (
              <button
                type="button"
                className="dasbor__btn dasbor__btn--primary"
                disabled={testingId !== null}
                onClick={handleTestAll}
                data-testid="btn-test-all-channels"
              >
                {testingId === 'all' ? 'Menguji Semua...' : 'Uji Semua Koneksi'}
              </button>
            )}
            <Link
              href="/penarikan-metrik-terjadwal"
              className="dasbor__btn"
              data-testid="link-to-schedule-from-status"
            >
              Jadwal Tarik Harian
            </Link>
          </div>
        </div>

        {/* Kartu Ringkasan Kebugaran Koneksi */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginTop: '1rem'
          }}
        >
          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: '0.5rem',
              background: 'var(--color-surface-muted, #1e293b)',
              border: '1px solid var(--color-border, #334155)'
            }}
          >
            <span className="dasbor__muted" style={{ fontSize: '0.78rem' }}>Total Kanal Terintegrasi</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '0.25rem' }}>
              {channels.length} Kanal
            </div>
            <span style={{ fontSize: '0.74rem', color: '#38bdf8' }}>4 Platform Resmi</span>
          </div>

          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: '0.5rem',
              background: 'rgba(34, 197, 94, 0.08)',
              border: '1px solid rgba(34, 197, 94, 0.25)'
            }}
          >
            <span style={{ fontSize: '0.78rem', color: '#22c55e', fontWeight: 600 }}>Tersambung Normal</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '0.25rem', color: '#22c55e' }}>
              {connectedCount} Kanal
            </div>
            <span style={{ fontSize: '0.74rem', color: '#86efac' }}>Kredensial Aktif</span>
          </div>

          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: '0.5rem',
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)'
            }}
          >
            <span style={{ fontSize: '0.78rem', color: '#f59e0b', fontWeight: 600 }}>Perlu Perhatian</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '0.25rem', color: '#f59e0b' }}>
              {warningCount} Kanal
            </div>
            <span style={{ fontSize: '0.74rem', color: '#fde68a' }}>Token Segera Kedaluwarsa</span>
          </div>

          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: '0.5rem',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)'
            }}
          >
            <span style={{ fontSize: '0.78rem', color: '#ef4444', fontWeight: 600 }}>Terputus</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '0.25rem', color: '#ef4444' }}>
              {disconnectedCount} Kanal
            </div>
            <span style={{ fontSize: '0.74rem', color: '#fca5a5' }}>0 Gangguan Kritis</span>
          </div>
        </div>
      </section>

      {/* Grid Kartu Status Kanal Terpadu */}
      <section className="dasbor__card" data-testid="channel-status-grid-card">
        <div className="dasbor__card-head">
          <div>
            <p className="dasbor__eyebrow">Daftar Detail Konektor</p>
            <h2 className="dasbor__card-title">Kesehatan &amp; Metrik Tarikan Harian</h2>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1rem',
            marginTop: '0.75rem'
          }}
          data-testid="status-cards-container"
        >
          {channels.map((ch) => (
            <article
              key={ch.id}
              className="dasbor__card"
              style={{
                background: 'var(--color-surface-muted, #1e293b)',
                border: '1px solid var(--color-border, #334155)',
                margin: 0
              }}
              data-testid={`channel-status-card-${ch.provider}`}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '2.4rem',
                      height: '2.4rem',
                      borderRadius: '0.5rem',
                      background:
                        ch.provider === 'youtube'
                          ? '#ef444422'
                          : ch.provider === 'instagram'
                          ? '#e1306c22'
                          : ch.provider === 'facebook'
                          ? '#1877f222'
                          : '#00f2fe22',
                      color:
                        ch.provider === 'youtube'
                          ? '#ef4444'
                          : ch.provider === 'instagram'
                          ? '#e1306c'
                          : ch.provider === 'facebook'
                          ? '#1877f2'
                          : '#00f2fe',
                      fontWeight: 700,
                      fontSize: '0.82rem'
                    }}
                  >
                    {ch.provider === 'youtube' ? 'YT' : ch.provider === 'instagram' ? 'IG' : ch.provider === 'facebook' ? 'FB' : 'TT'}
                  </span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 600 }}>{ch.channelName}</h3>
                    <div className="dasbor__muted" style={{ fontSize: '0.78rem' }}>
                      {ch.handle}
                    </div>
                  </div>
                </div>

                <ChannelConditionBadge
                  status={ch.status}
                  testId={`badge-status-${ch.provider}`}
                />
              </div>

              <div style={{ marginTop: '0.85rem', fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div>
                  <span className="dasbor__muted">API Resmi:</span> <strong>{ch.officialApi}</strong>
                </div>
                <div>
                  <span className="dasbor__muted">Masa Berlaku Token:</span> {ch.tokenExpiresAt}
                </div>
                <div>
                  <span className="dasbor__muted">Pemeriksaan Terakhir:</span> {ch.lastHealthCheck}
                </div>
              </div>

              {/* Angka Tarikan Metrik Harian */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.5rem',
                  marginTop: '0.85rem',
                  padding: '0.6rem',
                  borderRadius: '0.45rem',
                  background: 'var(--color-surface, #0f172a)',
                  border: '1px solid var(--color-border, #334155)',
                  textAlign: 'center'
                }}
              >
                <div>
                  <span className="dasbor__muted" style={{ fontSize: '0.72rem' }}>Tayangan</span>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                    {ch.metricsRollupToday.views.toLocaleString('id-ID')}
                  </div>
                </div>
                <div>
                  <span className="dasbor__muted" style={{ fontSize: '0.72rem' }}>Jangkauan</span>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                    {ch.metricsRollupToday.reach.toLocaleString('id-ID')}
                  </div>
                </div>
                <div>
                  <span className="dasbor__muted" style={{ fontSize: '0.72rem' }}>Interaksi</span>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                    {ch.metricsRollupToday.engagements.toLocaleString('id-ID')}
                  </div>
                </div>
              </div>

              {ch.errorMessage && (
                <div
                  style={{
                    marginTop: '0.65rem',
                    padding: '0.45rem 0.65rem',
                    borderRadius: '0.4rem',
                    background: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    fontSize: '0.74rem',
                    color: '#f59e0b'
                  }}
                >
                  ⚠️ {ch.errorMessage}
                </div>
              )}

              {/* Tombol Aksi */}
              <div style={{ marginTop: '0.85rem', display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                {isAdminOrHead ? (
                  <>
                    <button
                      type="button"
                      className="dasbor__btn"
                      style={{ padding: '0.28rem 0.6rem', fontSize: '0.75rem' }}
                      disabled={testingId === ch.id || testingId === 'all'}
                      onClick={() => handleTestSingle(ch.id)}
                      data-testid={`btn-test-channel-${ch.provider}`}
                    >
                      {testingId === ch.id ? 'Menguji...' : 'Uji Koneksi'}
                    </button>
                    {ch.provider === 'youtube' && (
                      <Link
                        href="/integrasi-youtube"
                        className="dasbor__btn"
                        style={{ padding: '0.28rem 0.6rem', fontSize: '0.75rem' }}
                      >
                        Kelola YouTube
                      </Link>
                    )}
                    {(ch.provider === 'instagram' || ch.provider === 'facebook') && (
                      <Link
                        href="/integrasi-meta"
                        className="dasbor__btn"
                        style={{ padding: '0.28rem 0.6rem', fontSize: '0.75rem' }}
                      >
                        Kelola Meta
                      </Link>
                    )}
                    {ch.provider === 'tiktok' && (
                      <Link
                        href="/integrasi-tiktok"
                        className="dasbor__btn"
                        style={{ padding: '0.28rem 0.6rem', fontSize: '0.75rem' }}
                      >
                        Kelola TikTok
                      </Link>
                    )}
                  </>
                ) : (
                  <span className="dasbor__muted" style={{ fontSize: '0.74rem', fontStyle: 'italic' }}>
                    Mode Hanya-baca (Kontrol Dikelola Admin)
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Panel Riwayat Sinkron Per Kanal di Halaman Status */}
      <section className="dasbor__card" data-testid="channel-sync-history-panel" style={{ marginTop: '1.25rem' }}>
        <div className="dasbor__card-head" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <p className="dasbor__eyebrow">Log Eksekusi Penarikan Metrik</p>
            <h2 className="dasbor__card-title" style={{ fontSize: '1.15rem' }}>
              Riwayat Sinkronisasi Metrik Per Kanal
            </h2>
            <p className="dasbor__muted" style={{ fontSize: '0.8rem', marginTop: '0.15rem' }}>
              Jejak riwayat penarikan otomatis harian dan manual tiap kanal, durasi eksekusi, serta metrik yang berhasil ditarik.
            </p>
          </div>

          {/* Filter Kanal */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-muted, #94a3b8)', marginRight: '0.2rem' }}>
              Filter Kanal:
            </span>
            <button
              type="button"
              className={`dasbor__btn ${historyChannelFilter === 'all' ? 'dasbor__btn--primary' : ''}`}
              style={{ padding: '0.25rem 0.65rem', fontSize: '0.76rem' }}
              onClick={() => setHistoryChannelFilter('all')}
              data-testid="filter-sync-all"
            >
              Semua ({SAMPLE_CHANNEL_SYNC_HISTORY.length})
            </button>
            {channels.map((ch) => (
              <button
                key={ch.provider}
                type="button"
                className={`dasbor__btn ${historyChannelFilter === ch.provider ? 'dasbor__btn--primary' : ''}`}
                style={{ padding: '0.25rem 0.65rem', fontSize: '0.76rem' }}
                onClick={() => setHistoryChannelFilter(ch.provider)}
                data-testid={`filter-sync-${ch.provider}`}
              >
                {ch.provider === 'youtube'
                  ? 'YouTube'
                  : ch.provider === 'instagram'
                  ? 'Instagram'
                  : ch.provider === 'facebook'
                  ? 'Facebook'
                  : 'TikTok'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: 'auto', marginTop: '0.75rem' }}>
          <table className="dasbor__table" data-testid="channel-sync-history-table">
            <thead>
              <tr>
                <th>Waktu Sinkron</th>
                <th>Kanal &amp; Platform</th>
                <th>Tipe Tarikan</th>
                <th>Status</th>
                <th>Metrik Ditarik</th>
                <th>Latensi</th>
                <th>Catatan / Detail</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_CHANNEL_SYNC_HISTORY.filter(
                (h) => historyChannelFilter === 'all' || h.provider === historyChannelFilter
              ).map((record) => (
                <tr key={record.id} data-testid={`sync-history-row-${record.id}`}>
                  <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                    <div style={{ fontWeight: 600 }}>{record.syncedAt}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '1.6rem',
                          height: '1.6rem',
                          borderRadius: '0.3rem',
                          background:
                            record.provider === 'youtube'
                              ? '#ef4444'
                              : record.provider === 'instagram'
                              ? '#e1306c'
                              : record.provider === 'facebook'
                              ? '#1877f2'
                              : '#00f2fe',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '0.7rem'
                        }}
                      >
                        {record.provider === 'youtube'
                          ? 'YT'
                          : record.provider === 'instagram'
                          ? 'IG'
                          : record.provider === 'facebook'
                          ? 'FB'
                          : 'TT'}
                      </span>
                      <strong style={{ fontSize: '0.84rem' }}>{record.channelName}</strong>
                    </div>
                  </td>
                  <td>
                    <span
                      className="dasbor__badge"
                      style={{
                        fontSize: '0.72rem',
                        background: record.syncType === 'manual' ? 'rgba(56, 189, 248, 0.15)' : undefined,
                        color: record.syncType === 'manual' ? '#38bdf8' : undefined
                      }}
                      data-testid={`sync-type-${record.id}`}
                    >
                      {record.syncType === 'manual' ? 'Manual (Ad-Hoc)' : 'Terjadwal Harian'}
                    </span>
                  </td>
                  <td>
                    {record.status === 'success' ? (
                      <span className="dasbor__badge dasbor__badge--up" data-testid={`sync-status-badge-${record.id}`}>
                        ● Sukses
                      </span>
                    ) : record.status === 'warning' ? (
                      <span className="dasbor__badge dasbor__badge--warn" data-testid={`sync-status-badge-${record.id}`}>
                        ▲ Peringatan
                      </span>
                    ) : (
                      <span className="dasbor__badge dasbor__badge--down" data-testid={`sync-status-badge-${record.id}`}>
                        ✕ Gagal
                      </span>
                    )}
                  </td>
                  <td style={{ fontSize: '0.78rem' }}>
                    <div>👁️ {record.metricsPulled.views.toLocaleString('id-ID')} tayangan</div>
                    <div className="dasbor__muted">👥 {record.metricsPulled.reach.toLocaleString('id-ID')} jangkauan</div>
                  </td>
                  <td style={{ fontSize: '0.78rem', color: '#38bdf8' }}>
                    {record.durationMs}ms
                  </td>
                  <td style={{ fontSize: '0.78rem', maxWidth: '300px' }} className="dasbor__muted">
                    {record.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

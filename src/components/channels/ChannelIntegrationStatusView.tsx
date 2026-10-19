'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLayout } from '@/components/layout/LayoutContext';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  ExternalLink,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Clock,
  Radio,
  Zap,
} from 'lucide-react';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';

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
    lastSyncedAt: 'Hari ini, 08:35 WIB',
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
    syncedAt: 'Hari ini, 06:00:08 WIB',
    status: 'success',
    metricsPulled: { views: 88400, reach: 54100, engagements: 9320 },
    durationMs: 380,
    syncType: 'scheduled_daily',
    notes: 'Penarikan metrik Instagram Insights API sukses (200 OK).'
  },
  {
    id: 'sync-hist-03',
    channelId: 'status-fb-01',
    provider: 'facebook',
    channelName: 'Kementerian Sosial Republik Indonesia',
    syncedAt: 'Hari ini, 06:00:05 WIB',
    status: 'success',
    metricsPulled: { views: 56200, reach: 39100, engagements: 4150 },
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

  const handleRefresh = (id: string, provider: string) => {
    handleTestSingle(id);
  };

  const connectedCount = channels.filter((c) => c.status === 'connected').length;
  const warningCount = channels.filter((c) => c.status === 'token_expiring').length;
  const disconnectedCount = channels.filter((c) => c.status === 'disconnected').length;
  const troubledChannels = channels.filter((c) => c.status !== 'connected');

  return (
    <div className="flex flex-col gap-6 w-full" data-testid="channel-integration-status-view">
      {/* Banner Pemberitahuan Aksi */}
      {bannerNotice && (
        <Alert
          data-testid="status-banner-notice"
          className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-400" />
            <span className="text-xs font-medium">{bannerNotice.text}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setBannerNotice(null)}
            className="h-6 w-6 p-0 text-emerald-400 hover:text-emerald-300"
            aria-label="Tutup pemberitahuan"
          >
            ✕
          </Button>
        </Alert>
      )}

      {/* Ringkasan Kanal Bermasalah (Peringatan & Terputus) */}
      {troubledChannels.length > 0 ? (
        <Alert
          data-testid="troubled-channels-summary-banner"
          className="border-amber-500/40 bg-amber-500/10 text-amber-500"
        >
          <div className="flex flex-col gap-3 w-full">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-4 text-amber-500" />
                <AlertTitle className="text-sm font-semibold">
                  Perhatian: Terdapat {troubledChannels.length} kanal membutuhkan tindakan pembaruan izin/koneksi
                </AlertTitle>
              </div>
              <Badge
                variant="outline"
                className="border-amber-500/40 bg-amber-500/20 text-amber-500 text-xs"
                data-testid="troubled-channels-count-badge"
              >
                {troubledChannels.length} Kanal Butuh Perhatian
              </Badge>
            </div>

            <div data-testid="connection-warnings-list" className="flex flex-col gap-2 mt-1">
              {troubledChannels.map((c) => (
                <div
                  key={c.id}
                  data-testid={`troubled-channel-item-${c.provider}`}
                  className="flex items-center justify-between flex-wrap gap-3 p-2.5 rounded-md border border-amber-500/25 bg-amber-500/5 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex items-center justify-center size-7 rounded font-bold text-white text-[11px] bg-cyan-500">
                      TT
                    </span>
                    <div>
                      <span className="font-semibold text-foreground" data-testid={`warning-channel-name-${c.provider}`}>
                        {c.channelName}
                      </span>{' '}
                      <span className="text-muted-foreground">({c.handle})</span>
                      <div className="text-amber-500 text-[11px] mt-0.5">
                        Penyebab: {c.errorMessage || c.tokenExpiresAt}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <ChannelConditionBadge status={c.status} testId={`warning-badge-${c.provider}`} />
                    {isAdminOrHead && (
                      <Button
                        size="sm"
                        variant="default"
                        className="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={() => handleRefresh(c.id, c.provider)}
                        data-testid={`btn-resolve-warning-${c.provider}`}
                      >
                        Segarkan Izin
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Alert>
      ) : (
        <Alert
          data-testid="all-channels-healthy-banner"
          className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
        >
          <div className="flex items-center gap-2 text-xs">
            <CheckCircle2 className="size-4 text-emerald-400" />
            <span>
              <strong>Semua Kanal Sehat:</strong> Seluruh 4 kanal media sosial terhubung normal dengan kredensial aktif.
            </span>
          </div>
        </Alert>
      )}

      {/* Header Halaman & Aksi Cepat */}
      <Card className="border-border/80 bg-card shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  Arsitektur Multi-Kanal Terpadu
                </span>
                <Badge variant="outline" className="border-amber-500/30 text-amber-500 text-[10px]">
                  DEMO
                </Badge>
              </div>
              <CardTitle className="text-lg font-bold">
                Status Integrasi Kanal Media Sosial
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Pemantauan kesehatan koneksi API resmi 4 platform (YouTube Data & Analytics, Meta Graph API, TikTok Display API).
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              {isAdminOrHead && (
                <Button
                  size="sm"
                  variant="default"
                  disabled={testingId !== null}
                  onClick={handleTestAll}
                  data-testid="btn-test-all-channels"
                  className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <RefreshCw className={`size-3.5 ${testingId === 'all' ? 'animate-spin' : ''}`} />
                  <span>{testingId === 'all' ? 'Menguji Semua...' : 'Uji Semua Koneksi'}</span>
                </Button>
              )}
              <Link href="/penarikan-metrik-terjadwal">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs gap-1.5"
                  data-testid="link-to-schedule-from-status"
                >
                  <Calendar className="size-3.5" />
                  <span>Jadwal Tarik Harian</span>
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>

        {/* PRINSIP 6 & 1: Kartu Ringkasan Kebugaran Koneksi (Angka Besar, Hierarki Tegas) */}
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg border border-border bg-muted/20">
              <span className="text-xs text-muted-foreground">Total Kanal Terintegrasi</span>
              <div className="text-2xl font-bold font-mono tracking-tight text-foreground mt-1">
                {channels.length} Kanal
              </div>
              <span className="text-[11px] text-cyan-400 font-medium">4 Platform Resmi</span>
            </div>

            <div className="p-3.5 rounded-lg border border-emerald-500/30 bg-emerald-500/5">
              <span className="text-xs text-emerald-400 font-semibold">Tersambung Normal</span>
              <div className="text-2xl font-bold font-mono tracking-tight text-emerald-400 mt-1">
                {connectedCount} Kanal
              </div>
              <span className="text-[11px] text-emerald-400/80">Kredensial Aktif</span>
            </div>

            <div className="p-3.5 rounded-lg border border-amber-500/30 bg-amber-500/5">
              <span className="text-xs text-amber-500 font-semibold">Perlu Perhatian</span>
              <div className="text-2xl font-bold font-mono tracking-tight text-amber-500 mt-1">
                {warningCount} Kanal
              </div>
              <span className="text-[11px] text-amber-500/80">Token Segera Kedaluwarsa</span>
            </div>

            <div className="p-3.5 rounded-lg border border-red-500/30 bg-red-500/5">
              <span className="text-xs text-red-400 font-semibold">Terputus</span>
              <div className="text-2xl font-bold font-mono tracking-tight text-red-400 mt-1">
                {disconnectedCount} Kanal
              </div>
              <span className="text-[11px] text-red-400/80">0 Gangguan Kritis</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PRINSIP 5: Status integrasi: badge status dengan waktu sinkron terakhir, TANPA GRAFIK */}
      <Card className="border-border/80 bg-card shadow-xs" data-testid="channel-status-grid-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Kesehatan & Metrik Tarikan Harian
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Daftar detail status konektor per kanal resmi dilengkapi waktu sinkronisasi terakhir
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            data-testid="status-cards-container"
          >
            {channels.map((ch) => {
              const providerColor =
                ch.provider === 'youtube'
                  ? 'text-red-500 bg-red-500/10'
                  : ch.provider === 'instagram'
                  ? 'text-pink-500 bg-pink-500/10'
                  : ch.provider === 'facebook'
                  ? 'text-blue-500 bg-blue-500/10'
                  : 'text-cyan-400 bg-cyan-400/10';

              const providerLabel =
                ch.provider === 'youtube'
                  ? 'YT'
                  : ch.provider === 'instagram'
                  ? 'IG'
                  : ch.provider === 'facebook'
                  ? 'FB'
                  : 'TT';

              return (
                <Card
                  key={ch.id}
                  className="border-border/80 bg-muted/20 shadow-none flex flex-col justify-between"
                  data-testid={`channel-status-card-${ch.provider}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className={`flex items-center justify-center size-9 rounded-lg font-bold text-xs ${providerColor}`}>
                          {providerLabel}
                        </span>
                        <div>
                          <CardTitle className="text-sm font-semibold">{ch.channelName}</CardTitle>
                          <CardDescription className="text-xs text-muted-foreground">{ch.handle}</CardDescription>
                        </div>
                      </div>

                      <ChannelConditionBadge
                        status={ch.status}
                        testId={`badge-status-${ch.provider}`}
                      />
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-0">
                    <div className="text-xs space-y-1.5 text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span>API Resmi:</span>
                        <strong className="text-foreground text-[11px] truncate max-w-[200px]">{ch.officialApi}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Masa Berlaku Token:</span>
                        <span className="text-foreground text-[11px]">{ch.tokenExpiresAt}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Pemeriksaan Terakhir:</span>
                        <span className="text-emerald-400 font-medium text-[11px]">{ch.lastHealthCheck}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Sinkronisasi Terakhir:</span>
                        <span className="text-foreground font-semibold text-[11px]">{ch.lastSyncedAt}</span>
                      </div>
                    </div>

                    {/* PRINSIP 1: Metrik ringkas per kanal */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg border border-border/80 bg-card text-center">
                      <div>
                        <div className="text-[10px] text-muted-foreground">Tayangan Hari Ini</div>
                        <div className="text-xs font-bold font-mono text-foreground mt-0.5">
                          {ch.metricsRollupToday.views.toLocaleString('id-ID')}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground">Jangkauan</div>
                        <div className="text-xs font-bold font-mono text-foreground mt-0.5">
                          {ch.metricsRollupToday.reach.toLocaleString('id-ID')}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground">Interaksi</div>
                        <div className="text-xs font-bold font-mono text-foreground mt-0.5">
                          {ch.metricsRollupToday.engagements.toLocaleString('id-ID')}
                        </div>
                      </div>
                    </div>

                    {ch.errorMessage && (
                      <div className="p-2 rounded border border-amber-500/30 bg-amber-500/10 text-amber-500 text-xs flex items-center gap-1.5">
                        <AlertTriangle className="size-3.5 shrink-0" />
                        <span>{ch.errorMessage}</span>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="pt-2 border-t border-border/60 flex items-center justify-end gap-2">
                    {isAdminOrHead ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={testingId === ch.id || testingId === 'all'}
                          onClick={() => handleTestSingle(ch.id)}
                          data-testid={`btn-test-channel-${ch.provider}`}
                          className="h-7 text-xs"
                        >
                          {testingId === ch.id ? 'Menguji...' : 'Uji Koneksi'}
                        </Button>
                        {ch.provider === 'youtube' && (
                          <Link href="/integrasi-youtube">
                            <Button size="sm" variant="default" className="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90">
                              Kelola YouTube
                            </Button>
                          </Link>
                        )}
                        {(ch.provider === 'instagram' || ch.provider === 'facebook') && (
                          <Link href="/integrasi-meta">
                            <Button size="sm" variant="default" className="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90">
                              Kelola Meta
                            </Button>
                          </Link>
                        )}
                        {ch.provider === 'tiktok' && (
                          <Link href="/integrasi-tiktok">
                            <Button size="sm" variant="default" className="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90">
                              Kelola TikTok
                            </Button>
                          </Link>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">
                        Mode Hanya-baca (Kontrol Dikelola Admin)
                      </span>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* PRINSIP 4: Detail per item: Gunakan tabel yang rapi dan terstruktur */}
      <Card className="border-border/80 bg-card shadow-xs" data-testid="channel-sync-history-panel">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold">
                Riwayat Sinkronisasi Metrik Per Kanal
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Jejak riwayat penarikan otomatis harian dan manual tiap kanal, durasi eksekusi, serta metrik yang ditarik
              </CardDescription>
            </div>

            {/* Filter Kanal */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-muted-foreground mr-1">Filter:</span>
              <Button
                size="sm"
                variant={historyChannelFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setHistoryChannelFilter('all')}
                data-testid="filter-sync-all"
                className={`h-7 text-xs ${historyChannelFilter === 'all' ? 'bg-primary text-primary-foreground' : ''}`}
              >
                Semua ({SAMPLE_CHANNEL_SYNC_HISTORY.length})
              </Button>
              {channels.map((ch) => (
                <Button
                  key={ch.provider}
                  size="sm"
                  variant={historyChannelFilter === ch.provider ? 'default' : 'outline'}
                  onClick={() => setHistoryChannelFilter(ch.provider)}
                  data-testid={`filter-sync-${ch.provider}`}
                  className={`h-7 text-xs ${historyChannelFilter === ch.provider ? 'bg-primary text-primary-foreground' : ''}`}
                >
                  {ch.provider === 'youtube'
                    ? 'YouTube'
                    : ch.provider === 'instagram'
                    ? 'Instagram'
                    : ch.provider === 'facebook'
                    ? 'Facebook'
                    : 'TikTok'}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table data-testid="channel-sync-history-table">
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-muted-foreground">Waktu Sinkron</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Kanal &amp; Platform</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Tipe Tarikan</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground text-center">Status</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Metrik Ditarik</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground text-right">Latensi</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Catatan / Detail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SAMPLE_CHANNEL_SYNC_HISTORY.filter(
                (h) => historyChannelFilter === 'all' || h.provider === historyChannelFilter
              ).map((record) => (
                <TableRow key={record.id} data-testid={`sync-history-row-${record.id}`} className="border-border/60 hover:bg-muted/40">
                  <TableCell className="text-xs font-medium text-foreground py-2.5 whitespace-nowrap">
                    {record.syncedAt}
                  </TableCell>
                  <TableCell className="text-xs py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center size-5 rounded text-[10px] font-bold text-white bg-primary">
                        {record.provider === 'youtube'
                          ? 'YT'
                          : record.provider === 'instagram'
                          ? 'IG'
                          : record.provider === 'facebook'
                          ? 'FB'
                          : 'TT'}
                      </span>
                      <span className="font-semibold text-foreground">{record.channelName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs py-2.5">
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0"
                      data-testid={`sync-type-${record.id}`}
                    >
                      {record.syncType === 'manual' ? 'Manual (Ad-Hoc)' : 'Terjadwal Harian'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center py-2.5">
                    {record.status === 'success' ? (
                      <Badge
                        variant="outline"
                        className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-[10px] px-1.5 py-0"
                        data-testid={`sync-status-badge-${record.id}`}
                      >
                        ● Sukses
                      </Badge>
                    ) : record.status === 'warning' ? (
                      <Badge
                        variant="outline"
                        className="border-amber-500/40 bg-amber-500/10 text-amber-500 text-[10px] px-1.5 py-0"
                        data-testid={`sync-status-badge-${record.id}`}
                      >
                        ▲ Peringatan
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-red-500/40 bg-red-500/10 text-red-400 text-[10px] px-1.5 py-0"
                        data-testid={`sync-status-badge-${record.id}`}
                      >
                        ✕ Gagal
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs py-2.5">
                    <div className="font-mono text-foreground text-[11px]">
                      {record.metricsPulled.views.toLocaleString('id-ID')} views
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {record.metricsPulled.reach.toLocaleString('id-ID')} reach
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-mono text-cyan-400 text-right py-2.5">
                    {record.durationMs}ms
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground py-2.5 max-w-[280px] truncate">
                    {record.notes}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

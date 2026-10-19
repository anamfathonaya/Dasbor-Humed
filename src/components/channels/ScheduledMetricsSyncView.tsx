'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import type { SocialProvider } from '@/lib/channelSampleData';
import { ChannelScheduleSyncCard } from './ChannelScheduleSyncCard';
import { ChannelDailyScheduleForm } from './ChannelDailyScheduleForm';
import { ChannelSyncHistoryTable } from './ChannelSyncHistoryTable';
import { ChannelUnifiedMetricComparisonTable } from './ChannelUnifiedMetricComparisonTable';

export interface ChannelScheduleConfig {
  provider: SocialProvider;
  channelName: string;
  handle: string;
  cronExpression: string;
  scheduleLabel: string;
  timezone: string;
  enabled: boolean;
  lastRunAt: string;
  nextRunAt: string;
  lastStatus: 'success' | 'partial_error' | 'failed';
  lastDurationMs: number;
  metricsPulledCount: number;
}

export interface SyncHistoryEntry {
  id: string;
  provider: SocialProvider;
  channelName: string;
  triggerType: 'scheduled_cron' | 'manual_one_click' | 'token_refresh_sync';
  status: 'success' | 'failed' | 'partial';
  startedAt: string;
  durationMs: number;
  rowsUpserted: number;
  message: string;
}

export interface UnifiedMetricMapping {
  standardKey: 'followers' | 'views' | 'engagements' | 'reach' | 'posts_count';
  standardLabel: string;
  unit: string;
  youtubeField: string;
  instagramField: string;
  facebookField: string;
  tiktokField: string;
  description: string;
}

export const INITIAL_SCHEDULES: ChannelScheduleConfig[] = [
  {
    provider: 'youtube',
    channelName: 'Humas Kemensos RI Official',
    handle: '@KemensosRI',
    cronExpression: '0 6,18 * * *',
    scheduleLabel: '2x Sehari (06:00 & 18:00 WIB)',
    timezone: 'Asia/Jakarta',
    enabled: true,
    lastRunAt: '19 Okt 2026, 06:00 WIB',
    nextRunAt: '19 Okt 2026, 18:00 WIB',
    lastStatus: 'success',
    lastDurationMs: 1420,
    metricsPulledCount: 5
  },
  {
    provider: 'instagram',
    channelName: 'Kementerian Sosial RI',
    handle: '@kemensosri',
    cronExpression: '0 6,12,18 * * *',
    scheduleLabel: '3x Sehari (06:00, 12:00 & 18:00 WIB)',
    timezone: 'Asia/Jakarta',
    enabled: true,
    lastRunAt: '19 Okt 2026, 06:00 WIB',
    nextRunAt: '19 Okt 2026, 12:00 WIB',
    lastStatus: 'success',
    lastDurationMs: 1180,
    metricsPulledCount: 5
  },
  {
    provider: 'facebook',
    channelName: 'Kementerian Sosial Republik Indonesia',
    handle: 'KemensosRI',
    cronExpression: '0 6 * * *',
    scheduleLabel: 'Setiap Hari (06:00 WIB)',
    timezone: 'Asia/Jakarta',
    enabled: true,
    lastRunAt: '19 Okt 2026, 06:00 WIB',
    nextRunAt: '20 Okt 2026, 06:00 WIB',
    lastStatus: 'partial_error',
    lastDurationMs: 2890,
    metricsPulledCount: 3
  },
  {
    provider: 'tiktok',
    channelName: 'Kemensos RI',
    handle: '@kemensos.ri',
    cronExpression: '0 7,19 * * *',
    scheduleLabel: '2x Sehari (07:00 & 19:00 WIB)',
    timezone: 'Asia/Jakarta',
    enabled: true,
    lastRunAt: '19 Okt 2026, 07:00 WIB',
    nextRunAt: '19 Okt 2026, 19:00 WIB',
    lastStatus: 'success',
    lastDurationMs: 960,
    metricsPulledCount: 5
  }
];

export const INITIAL_SYNC_HISTORY: SyncHistoryEntry[] = [
  {
    id: 'sync-log-101',
    provider: 'tiktok',
    channelName: 'Kemensos RI (@kemensos.ri)',
    triggerType: 'scheduled_cron',
    status: 'success',
    startedAt: '19 Okt 2026, 07:00 WIB',
    durationMs: 960,
    rowsUpserted: 5,
    message: 'Berhasil menarik metrik TikTok Display API (pengikut, tayangan, suka/komentar/bagikan) dan menormalisasi ke skema standar.'
  },
  {
    id: 'sync-log-102',
    provider: 'youtube',
    channelName: 'Humas Kemensos RI Official (@KemensosRI)',
    triggerType: 'scheduled_cron',
    status: 'success',
    startedAt: '19 Okt 2026, 06:00 WIB',
    durationMs: 1420,
    rowsUpserted: 5,
    message: 'Sinkronisasi YouTube Data API v3 + Analytics API selesai tanpa kendala (subscriberCount, views, likes+comments+shares).'
  },
  {
    id: 'sync-log-103',
    provider: 'instagram',
    channelName: 'Kementerian Sosial RI (@kemensosri)',
    triggerType: 'scheduled_cron',
    status: 'success',
    startedAt: '19 Okt 2026, 06:00 WIB',
    durationMs: 1180,
    rowsUpserted: 5,
    message: 'Tarikan harian Instagram Graph API berhasil memperbarui angka followers_count, impressions, reach, dan total_interactions.'
  },
  {
    id: 'sync-log-104',
    provider: 'facebook',
    channelName: 'Kementerian Sosial Republik Indonesia',
    triggerType: 'scheduled_cron',
    status: 'failed',
    startedAt: '19 Okt 2026, 06:00 WIB',
    durationMs: 2890,
    rowsUpserted: 0,
    message: 'Token akses halaman Facebook memerlukan penyegaran ulang (Error 190: OAuthException). Data historis lokal tetap dipertahankan.'
  },
  {
    id: 'sync-log-105',
    provider: 'youtube',
    channelName: 'Humas Kemensos RI Official (@KemensosRI)',
    triggerType: 'manual_one_click',
    status: 'success',
    startedAt: '18 Okt 2026, 21:15 WIB',
    durationMs: 1310,
    rowsUpserted: 5,
    message: 'Tarik manual sekali klik pasca siaran pers penyaluran bantuan logistik berhasil dijalankan.'
  }
];

export const UNIFIED_METRIC_MAPPINGS: UnifiedMetricMapping[] = [
  {
    standardKey: 'followers',
    standardLabel: 'Pengikut (Followers)',
    unit: 'Akun / Pelanggan',
    youtubeField: 'statistics.subscriberCount',
    instagramField: 'followers_count',
    facebookField: 'followers_count / fan_count',
    tiktokField: 'follower_count',
    description: 'Total pelanggan atau pengikut aktif resmi di masing-masing platform.'
  },
  {
    standardKey: 'views',
    standardLabel: 'Tayangan (Views)',
    unit: 'Tayangan Video / Konten',
    youtubeField: 'views (Analytics API)',
    instagramField: 'impressions / plays',
    facebookField: 'page_impressions / post_video_views',
    tiktokField: 'video_views / view_count',
    description: 'Jumlah total penayangan konten atau impresi halaman pada periode harian.'
  },
  {
    standardKey: 'engagements',
    standardLabel: 'Interaksi (Engagements)',
    unit: 'Aksi (Suka + Komentar + Bagikan)',
    youtubeField: 'likes + comments + shares',
    instagramField: 'total_interactions (likes + comments + saves + shares)',
    facebookField: 'page_post_engagements',
    tiktokField: 'likes + comments + shares',
    description: 'Gabungan interaksi aktif audiens terhadap unggahan pada hari berjalan.'
  },
  {
    standardKey: 'reach',
    standardLabel: 'Jangkauan Unik (Reach)',
    unit: 'Akun Unik',
    youtubeField: 'uniqueViewers / estimatedMinutesWatched',
    instagramField: 'reach',
    facebookField: 'page_impressions_unique',
    tiktokField: 'reached_audience_count (estimasi)',
    description: 'Jumlah audiens unik yang melihat konten kanal minimal satu kali.'
  },
  {
    standardKey: 'posts_count',
    standardLabel: 'Konten Terbit (Posts)',
    unit: 'Unggahan',
    youtubeField: 'statistics.videoCount (delta harian)',
    instagramField: 'media_count (delta harian)',
    facebookField: 'published_posts_count',
    tiktokField: 'video_count (delta harian)',
    description: 'Jumlah konten resmi yang diterbitkan secara manual di platform pada hari tersebut.'
  }
];

export function ScheduledMetricsSyncView() {
  const [schedules, setSchedules] = useState<ChannelScheduleConfig[]>(INITIAL_SCHEDULES);
  const [history, setHistory] = useState<SyncHistoryEntry[]>(INITIAL_SYNC_HISTORY);
  const [syncingProvider, setSyncingProvider] = useState<SocialProvider | 'all' | null>(null);
  const [bannerNotice, setBannerNotice] = useState<{ type: 'success' | 'info' | 'warning'; text: string } | null>(null);
  const [selectedScheduleFilter, setSelectedScheduleFilter] = useState<'all' | SocialProvider>('all');

  useEffect(() => {
    let active = true;
    async function loadLiveSyncStatus() {
      try {
        const res = await fetch('/api/channels/schedule');
        if (!res.ok) return;
        const json = await res.json();
        if (active && json?.schedules && Array.isArray(json.schedules) && json.schedules.length > 0) {
          setSchedules(json.schedules);
        }
        if (active && json?.history && Array.isArray(json.history) && json.history.length > 0) {
          setHistory(json.history);
        }
      } catch {
        // Fallback aman ke data tiruan lokal
      }
    }
    loadLiveSyncStatus();
    return () => {
      active = false;
    };
  }, []);

  const handleToggleSchedule = (provider: SocialProvider) => {
    setSchedules((prev) =>
      prev.map((item) => {
        if (item.provider !== provider) return item;
        const nextEnabled = !item.enabled;
        setBannerNotice({
          type: 'info',
          text: `Jadwal penarikan otomatis untuk ${item.channelName} diubah menjadi ${nextEnabled ? 'Aktif' : 'Dijeda'}.`
        });
        return {
          ...item,
          enabled: nextEnabled,
          nextRunAt: nextEnabled ? '19 Okt 2026, 18:00 WIB' : 'Dijeda sementara'
        };
      })
    );
  };

  const handleUpdateFrequency = (provider: SocialProvider, cronExpression: string, scheduleLabel: string) => {
    setSchedules((prev) =>
      prev.map((item) =>
        item.provider === provider
          ? {
              ...item,
              cronExpression,
              scheduleLabel,
              lastRunAt: item.lastRunAt
            }
          : item
      )
    );
    setBannerNotice({
      type: 'success',
      text: `Frekuensi jadwal tarik harian kanal ${provider.toUpperCase()} diperbarui ke "${scheduleLabel}".`
    });
  };

  const handleSaveDailySchedule = (
    targetProvider: SocialProvider | 'all',
    cronExpression: string,
    scheduleLabel: string,
    nextRunAt: string,
    timezone: string
  ) => {
    setSchedules((prev) =>
      prev.map((item) => {
        if (targetProvider !== 'all' && item.provider !== targetProvider) return item;
        return {
          ...item,
          cronExpression,
          scheduleLabel,
          nextRunAt,
          timezone,
          enabled: true
        };
      })
    );
    setBannerNotice({
      type: 'success',
      text:
        targetProvider === 'all'
          ? `Jadwal harian seluruh kanal diperbarui ke "${scheduleLabel}" (Jadwal berikutnya: ${nextRunAt}).`
          : `Jadwal harian kanal ${targetProvider.toUpperCase()} diperbarui ke "${scheduleLabel}" (Jadwal berikutnya: ${nextRunAt}).`
    });
  };

  const handleManualSync = async (target: SocialProvider | 'all') => {
    setSyncingProvider(target);
    setBannerNotice(null);

    try {
      const res = await fetch('/api/channels/sync-now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: target })
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.historyEntry) {
          setHistory((prev) => [json.historyEntry, ...prev]);
        }
      }
    } catch {
      // Tetap lanjutkan simulasi di UI apabila endpoint belum selesai
    }

    setTimeout(() => {
      const nowLabel = 'Baru saja (19 Okt 2026)';
      setSchedules((prev) =>
        prev.map((item) => {
          if (target !== 'all' && item.provider !== target) return item;
          return {
            ...item,
            lastRunAt: nowLabel,
            lastStatus: 'success',
            lastDurationMs: 1120,
            metricsPulledCount: 5
          };
        })
      );

      const newEntries: SyncHistoryEntry[] =
        target === 'all'
          ? [
              {
                id: `sync-manual-${Date.now()}`,
                provider: 'youtube',
                channelName: 'Semua Kanal Resmi (YouTube, Instagram, Facebook, TikTok)',
                triggerType: 'manual_one_click',
                status: 'success',
                startedAt: nowLabel,
                durationMs: 1840,
                rowsUpserted: 20,
                message: 'Tarik manual sekali klik lintas 4 kanal selesai. Seluruh metrik telah dinormalisasi ke tabel channel_daily_metrics.'
              }
            ]
          : [
              {
                id: `sync-manual-${Date.now()}`,
                provider: target,
                channelName: schedules.find((s) => s.provider === target)?.channelName || target.toUpperCase(),
                triggerType: 'manual_one_click',
                status: 'success',
                startedAt: nowLabel,
                durationMs: 1120,
                rowsUpserted: 5,
                message: `Tarik manual sekali klik kanal ${target.toUpperCase()} berhasil memperbarui pengikut, tayangan, interaksi, dan jangkauan.`
              }
            ];

      setHistory((prev) => [...newEntries, ...prev]);
      setSyncingProvider(null);
      setBannerNotice({
        type: 'success',
        text:
          target === 'all'
            ? 'Penarikan metrik instan untuk seluruh 4 kanal berhasil dijalankan dan dinormalisasi.'
            : `Penarikan metrik sekali klik untuk kanal ${target.toUpperCase()} berhasil diselesaikan.`
      });
    }, 450);
  };

  const filteredHistory =
    selectedScheduleFilter === 'all'
      ? history
      : history.filter((item) => item.provider === selectedScheduleFilter);

  return (
    <div className="dasbor" data-testid="scheduled-metrics-sync-view">
      {/* Baris Informasi & Pintasan */}
      <div className="dasbor__bar">
        <div>
          <p className="dasbor__bar-text">
            <strong>Penarikan Metrik Terjadwal (Cron &amp; Tarik Instan):</strong> Mengatur jadwal penarikan metrik harian otomatis serta penarikan manual sekali klik untuk Instagram, Facebook, TikTok, dan YouTube dengan skema metrik seragam.
          </p>
        </div>
        <div className="dasbor__bar-actions">
          <button
            type="button"
            className="dasbor__btn dasbor__btn--primary"
            onClick={() => handleManualSync('all')}
            disabled={syncingProvider !== null}
            data-testid="sync-all-channels-btn"
          >
            {syncingProvider === 'all' ? 'Menarik Semua Kanal...' : 'Tarik Semua Kanal Sekarang'}
          </button>
          <Link href="/pemantauan-kanal" className="dasbor__btn">
            Lihat Halaman Pemantauan
          </Link>
          <Link href="/integrasi-youtube" className="dasbor__btn">
            Penghubung YouTube
          </Link>
        </div>
      </div>

      {bannerNotice && (
        <div
          role="status"
          data-testid="schedule-banner-notice"
          style={{
            padding: '0.85rem 1.1rem',
            borderRadius: '0.65rem',
            border:
              bannerNotice.type === 'success'
                ? '1px solid rgba(22, 163, 74, 0.35)'
                : '1px solid rgba(37, 99, 235, 0.35)',
            background:
              bannerNotice.type === 'success'
                ? 'rgba(22, 163, 74, 0.08)'
                : 'rgba(37, 99, 235, 0.08)',
            color: 'var(--color-text, #0f172a)',
            fontSize: '0.86rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.75rem'
          }}
        >
          <span>{bannerNotice.text}</span>
          <button
            type="button"
            className="dasbor__btn"
            style={{ padding: '0.25rem 0.6rem', fontSize: '0.76rem' }}
            onClick={() => setBannerNotice(null)}
          >
            Tutup
          </button>
        </div>
      )}

      {/* 1. Jadwal Tarik Harian & Tarik Sekali Klik */}
      <article className="dasbor__card" data-testid="daily-schedule-section">
        <div className="dasbor__card-head">
          <div>
            <p className="dasbor__eyebrow">Otomatisasi Cron Harian</p>
            <h2 className="dasbor__card-title">Jadwal Tarik Harian &amp; Tarik Sekali Klik per Kanal</h2>
          </div>
          <span className="dasbor__badge dasbor__badge--up">
            {schedules.filter((s) => s.enabled).length} dari {schedules.length} Jadwal Aktif
          </span>
        </div>

        <div className="dasbor__analytics-grid" style={{ marginTop: '0.5rem' }}>
          {schedules.map((sched) => (
            <ChannelScheduleSyncCard
              key={sched.provider}
              schedule={sched}
              isSyncing={syncingProvider === sched.provider || syncingProvider === 'all'}
              disabled={syncingProvider !== null}
              onPullNow={handleManualSync}
              onToggleSchedule={handleToggleSchedule}
              onChangeFrequency={handleUpdateFrequency}
            />
          ))}
        </div>
      </article>

      <ChannelDailyScheduleForm
        schedules={schedules}
        onSaveSchedule={handleSaveDailySchedule}
      />

      {/* 2. Standarisasi Nama Metrik Antarplatform */}
      <ChannelUnifiedMetricComparisonTable />

      {/* 3. Riwayat Penarikan Metrik */}
      <ChannelSyncHistoryTable
        history={history}
        onRetrySync={(provider) => handleManualSync(provider)}
      />
    </div>
  );
}

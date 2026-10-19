'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChannelSummaryCard } from './ChannelSummaryCard';
import { ChannelFilterBar } from './ChannelFilterBar';
import { ChannelDailyTrendChart } from './ChannelDailyTrendChart';
import { ChannelFreshnessSummaryPanel } from './ChannelFreshnessBadge';
import {
  ChannelConnectionStateNotice,
  type ConnectionSimulationState
} from './ChannelConnectionStateNotice';
import { ChannelUnifiedMetricComparisonTable } from './ChannelUnifiedMetricComparisonTable';

export type SocialPlatform = 'instagram' | 'facebook' | 'tiktok' | 'youtube';

export interface DailyMetricPoint {
  date: string;
  label: string;
  followers: number;
  views: number;
  interactions: number;
}

export interface ChannelSummaryData {
  id: string;
  platform: SocialPlatform;
  platformLabel: string;
  accountName: string;
  handle: string;
  platformUrl: string;
  status: 'connected' | 'reauth_required' | 'sample_data' | 'not_connected' | 'sync_failed';
  errorMessage?: string;
  followers: number;
  followersGrowth: string;
  followersGrowthType: 'up' | 'down' | 'flat';
  views: number;
  viewsGrowth: string;
  viewsGrowthType: 'up' | 'down' | 'flat';
  interactions: number;
  interactionsGrowth: string;
  interactionsGrowthType: 'up' | 'down' | 'flat';
  engagementRate: string;
  lastUpdatedLabel: string;
  lastUpdatedIso: string;
  freshnessState: 'segar' | 'perlu_sinkron';
  dailyTrend: DailyMetricPoint[];
}

export const SAMPLE_CHANNELS_DATA: ChannelSummaryData[] = [
  {
    id: 'chan-ig-01',
    platform: 'instagram',
    platformLabel: 'Instagram',
    accountName: 'Instagram Resmi Humas',
    handle: '@pedulinegeri_id',
    platformUrl: 'https://instagram.com/pedulinegeri_id',
    status: 'sample_data',
    followers: 45200,
    followersGrowth: '+3,4%',
    followersGrowthType: 'up',
    views: 1024300,
    viewsGrowth: '+12,4%',
    viewsGrowthType: 'up',
    interactions: 58420,
    interactionsGrowth: '+8,9%',
    interactionsGrowthType: 'up',
    engagementRate: '5,70%',
    lastUpdatedLabel: '15 menit lalu (Hari ini, 08:30 WIB)',
    lastUpdatedIso: '2026-10-19T08:30:00+07:00',
    freshnessState: 'segar',
    dailyTrend: [
      { date: '2026-10-13', label: '13 Okt', followers: 44810, views: 138400, interactions: 7920 },
      { date: '2026-10-14', label: '14 Okt', followers: 44890, views: 145200, interactions: 8240 },
      { date: '2026-10-15', label: '15 Okt', followers: 44960, views: 141800, interactions: 8010 },
      { date: '2026-10-16', label: '16 Okt', followers: 45020, views: 151000, interactions: 8650 },
      { date: '2026-10-17', label: '17 Okt', followers: 45090, views: 148600, interactions: 8410 },
      { date: '2026-10-18', label: '18 Okt', followers: 45150, views: 146900, interactions: 8390 },
      { date: '2026-10-19', label: '19 Okt', followers: 45200, views: 152400, interactions: 8800 }
    ]
  },
  {
    id: 'chan-fb-01',
    platform: 'facebook',
    platformLabel: 'Facebook',
    accountName: 'Halaman Resmi Yayasan Peduli Negeri',
    handle: 'Yayasan Peduli Negeri',
    platformUrl: 'https://facebook.com/pedulinegeri.id',
    status: 'sample_data',
    followers: 62800,
    followersGrowth: '+1,8%',
    followersGrowthType: 'up',
    views: 724180,
    viewsGrowth: '+6,1%',
    viewsGrowthType: 'up',
    interactions: 31960,
    interactionsGrowth: '+4,2%',
    interactionsGrowthType: 'up',
    engagementRate: '4,41%',
    lastUpdatedLabel: '25 menit lalu (Hari ini, 08:20 WIB)',
    lastUpdatedIso: '2026-10-19T08:20:00+07:00',
    freshnessState: 'segar',
    dailyTrend: [
      { date: '2026-10-13', label: '13 Okt', followers: 62490, views: 98500, interactions: 4320 },
      { date: '2026-10-14', label: '14 Okt', followers: 62540, views: 101200, interactions: 4490 },
      { date: '2026-10-15', label: '15 Okt', followers: 62600, views: 103400, interactions: 4580 },
      { date: '2026-10-16', label: '16 Okt', followers: 62650, views: 104800, interactions: 4610 },
      { date: '2026-10-17', label: '17 Okt', followers: 62710, views: 102900, interactions: 4520 },
      { date: '2026-10-18', label: '18 Okt', followers: 62760, views: 105600, interactions: 4690 },
      { date: '2026-10-19', label: '19 Okt', followers: 62800, views: 107780, interactions: 4750 }
    ]
  },
  {
    id: 'chan-tt-01',
    platform: 'tiktok',
    platformLabel: 'TikTok',
    accountName: 'Aksi Peduli Negeri',
    handle: '@aksipedulinegeri',
    platformUrl: 'https://tiktok.com/@aksipedulinegeri',
    status: 'sample_data',
    followers: 89000,
    followersGrowth: '+9,6%',
    followersGrowthType: 'up',
    views: 1340500,
    viewsGrowth: '+18,5%',
    viewsGrowthType: 'up',
    interactions: 94210,
    interactionsGrowth: '+15,1%',
    interactionsGrowthType: 'up',
    engagementRate: '7,03%',
    lastUpdatedLabel: '30 menit lalu (Hari ini, 08:15 WIB)',
    lastUpdatedIso: '2026-10-19T08:15:00+07:00',
    freshnessState: 'segar',
    dailyTrend: [
      { date: '2026-10-13', label: '13 Okt', followers: 87400, views: 175000, interactions: 12100 },
      { date: '2026-10-14', label: '14 Okt', followers: 87680, views: 184200, interactions: 12890 },
      { date: '2026-10-15', label: '15 Okt', followers: 87950, views: 191000, interactions: 13420 },
      { date: '2026-10-16', label: '16 Okt', followers: 88210, views: 189400, interactions: 13250 },
      { date: '2026-10-17', label: '17 Okt', followers: 88500, views: 196800, interactions: 13910 },
      { date: '2026-10-18', label: '18 Okt', followers: 88790, views: 201100, interactions: 14180 },
      { date: '2026-10-19', label: '19 Okt', followers: 89000, views: 203000, interactions: 14460 }
    ]
  },
  {
    id: 'chan-yt-01',
    platform: 'youtube',
    platformLabel: 'YouTube',
    accountName: 'Peduli Negeri TV',
    handle: '@PeduliNegeriTV',
    platformUrl: 'https://youtube.com/@PeduliNegeriTV',
    status: 'sample_data',
    followers: 185000,
    followersGrowth: '+4,1%',
    followersGrowthType: 'up',
    views: 682900,
    viewsGrowth: '+9,3%',
    viewsGrowthType: 'up',
    interactions: 41350,
    interactionsGrowth: '+7,4%',
    interactionsGrowthType: 'up',
    engagementRate: '6,05%',
    lastUpdatedLabel: '10 menit lalu (Hari ini, 08:35 WIB)',
    lastUpdatedIso: '2026-10-19T08:35:00+07:00',
    freshnessState: 'segar',
    dailyTrend: [
      { date: '2026-10-13', label: '13 Okt', followers: 183900, views: 91200, interactions: 5490 },
      { date: '2026-10-14', label: '14 Okt', followers: 184120, views: 94600, interactions: 5710 },
      { date: '2026-10-15', label: '15 Okt', followers: 184300, views: 96800, interactions: 5840 },
      { date: '2026-10-16', label: '16 Okt', followers: 184490, views: 98100, interactions: 5930 },
      { date: '2026-10-17', label: '17 Okt', followers: 184680, views: 99400, interactions: 6020 },
      { date: '2026-10-18', label: '18 Okt', followers: 184850, views: 100500, interactions: 6110 },
      { date: '2026-10-19', label: '19 Okt', followers: 185000, views: 102300, interactions: 6250 }
    ]
  }
];

export type DateRangePreset = '7d' | '14d' | '30d' | 'custom';
export type MetricDimension = 'views' | 'interactions' | 'followers';

export function ChannelMonitoringView() {
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | SocialPlatform>('all');
  const [dateRangePreset, setDateRangePreset] = useState<DateRangePreset>('7d');
  const [startDate, setStartDate] = useState<string>('2026-10-13');
  const [endDate, setEndDate] = useState<string>('2026-10-19');
  const [activeMetric, setActiveMetric] = useState<MetricDimension>('views');
  const [simulationState, setSimulationState] = useState<ConnectionSimulationState>('normal');

  const handlePresetChange = (preset: DateRangePreset) => {
    setDateRangePreset(preset);
    if (preset === '7d') {
      setStartDate('2026-10-13');
      setEndDate('2026-10-19');
    } else if (preset === '14d') {
      setStartDate('2026-10-06');
      setEndDate('2026-10-19');
    } else if (preset === '30d') {
      setStartDate('2026-09-20');
      setEndDate('2026-10-19');
    }
  };

  const channelsWithSimulation = useMemo(() => {
    return SAMPLE_CHANNELS_DATA.map((ch) => {
      if (simulationState === 'unconnected' && (ch.platform === 'tiktok' || ch.platform === 'facebook')) {
        return {
          ...ch,
          status: 'not_connected' as const,
          freshnessState: 'perlu_sinkron' as const,
          lastUpdatedLabel: 'Belum pernah ditarik (Menggunakan data contoh)'
        };
      }
      if (simulationState === 'sync_failed' && ch.platform === 'instagram') {
        return {
          ...ch,
          status: 'sync_failed' as const,
          freshnessState: 'perlu_sinkron' as const,
          lastUpdatedLabel: 'Gagal tarik 2 jam lalu (Data historis terakhir)',
          errorMessage: 'Token OAuth Instagram Graph API kedaluwarsa — perlu penyegaran izin oleh Admin.'
        };
      }
      return ch;
    });
  }, [simulationState]);

  const filteredChannels = useMemo(() => {
    return channelsWithSimulation.filter((ch) =>
      selectedPlatform === 'all' ? true : ch.platform === selectedPlatform
    );
  }, [channelsWithSimulation, selectedPlatform]);

  // Multiplier simulasi sesuai rentang tanggal apabila user memilih 14d atau 30d
  const periodMultiplier = useMemo(() => {
    if (dateRangePreset === '14d') return 1.92;
    if (dateRangePreset === '30d') return 3.85;
    return 1;
  }, [dateRangePreset]);

  const aggregateStats = useMemo(() => {
    const totalFollowers = filteredChannels.reduce((acc, ch) => acc + ch.followers, 0);
    const totalViews = Math.round(
      filteredChannels.reduce((acc, ch) => acc + ch.views, 0) * periodMultiplier
    );
    const totalInteractions = Math.round(
      filteredChannels.reduce((acc, ch) => acc + ch.interactions, 0) * periodMultiplier
    );
    return { totalFollowers, totalViews, totalInteractions };
  }, [filteredChannels, periodMultiplier]);

  return (
    <div className="dasbor" data-testid="channel-monitoring-page">
      {/* Banner Mode Hanya-Baca & Penanda Kesegaran Data */}
      <section className="dasbor__bar" aria-label="Status kesegaran data pemantauan kanal">
        <div className="dasbor__bar-text" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
          <span className="dasbor__badge dasbor__badge--up" style={{ fontSize: '12px' }}>
            Mode Hanya-Baca (Read-Only)
          </span>
          <span>
            Menampilkan <b>data contoh terstandarisasi</b> lintas 4 platform resmi (Instagram, Facebook, TikTok, YouTube).
          </span>
          <span
            data-testid="freshness-indicator"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 10px',
              borderRadius: '999px',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              color: '#34d399',
              fontSize: '12px',
              fontWeight: 600
            }}
          >
            {/* @ts-ignore iconify web component */}
            <iconify-icon icon="lucide:clock" aria-hidden="true" />
            <span>Diperbarui terakhir: Hari ini, 08:35 WIB (Data masih layak pakai)</span>
          </span>
        </div>
        <div className="dasbor__bar-actions">
          <Link className="dasbor__btn" href="/penarikan-metrik-terjadwal">
            {/* @ts-ignore iconify web component */}
            <iconify-icon icon="lucide:calendar-clock" aria-hidden="true" />
            <span>Jadwal &amp; Tarik Metrik</span>
          </Link>
          <Link className="dasbor__btn" href="/integrasi-youtube">
            {/* @ts-ignore iconify web component */}
            <iconify-icon icon="lucide:plug-zap" aria-hidden="true" />
            <span>Kelola Sambungan OAuth</span>
          </Link>
          <Link className="dasbor__btn dasbor__btn--primary" href="/laporan">
            {/* @ts-ignore iconify web component */}
            <iconify-icon icon="lucide:file-bar-chart" aria-hidden="true" />
            <span>Lihat di Laporan Kinerja</span>
          </Link>
        </div>
      </section>

      {/* Panel Status Kanal Belum Tersambung & Gagal Tarik */}
      <ChannelConnectionStateNotice
        channels={filteredChannels}
        simulationState={simulationState}
        onChangeSimulationState={setSimulationState}
      />

      {/* Panel Filter Kanal & Rentang Tanggal */}
      <ChannelFilterBar
        selectedPlatform={selectedPlatform}
        onSelectPlatform={setSelectedPlatform}
        dateRangePreset={dateRangePreset}
        onSelectPreset={handlePresetChange}
        startDate={startDate}
        endDate={endDate}
        onChangeStartDate={(date) => {
          setStartDate(date);
          setDateRangePreset('custom');
        }}
        onChangeEndDate={(date) => {
          setEndDate(date);
          setDateRangePreset('custom');
        }}
        onResetFilters={() => {
          setSelectedPlatform('all');
          handlePresetChange('7d');
        }}
        totalChannelsShown={filteredChannels.length}
      />

      {/* Ringkasan Agregat Lintas Kanal Terpilih */}
      <div className="dasbor__analytics-grid">
        <article className="dasbor__card dasbor__kpi">
          <div className="dasbor__kpi-top">
            <span className="dasbor__kpi-label">Total Pengikut (Followers / Subscribers)</span>
            <span className="dasbor__badge dasbor__badge--up">+4,7%</span>
          </div>
          <div className="dasbor__kpi-row" style={{ marginTop: '6px' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 700 }}>
              {aggregateStats.totalFollowers.toLocaleString('id-ID')}
            </span>
          </div>
          <p style={{ fontSize: '0.76rem', color: 'var(--color-muted, #64748b)', margin: '4px 0 0' }}>
            Akumulasi audiens dari {filteredChannels.length} kanal yang ditampilkan
          </p>
        </article>

        <article className="dasbor__card dasbor__kpi">
          <div className="dasbor__kpi-top">
            <span className="dasbor__kpi-label">Total Tayangan (Views / Reach)</span>
            <span className="dasbor__badge dasbor__badge--up">+12,8%</span>
          </div>
          <div className="dasbor__kpi-row" style={{ marginTop: '6px' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 700 }}>
              {aggregateStats.totalViews.toLocaleString('id-ID')}
            </span>
          </div>
          <p style={{ fontSize: '0.76rem', color: 'var(--color-muted, #64748b)', margin: '4px 0 0' }}>
            Periode {startDate} s/d {endDate}
          </p>
        </article>

        <article className="dasbor__card dasbor__kpi">
          <div className="dasbor__kpi-top">
            <span className="dasbor__kpi-label">Total Interaksi (Likes, Comments, Shares)</span>
            <span className="dasbor__badge dasbor__badge--up">+9,4%</span>
          </div>
          <div className="dasbor__kpi-row" style={{ marginTop: '6px' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 700 }}>
              {aggregateStats.totalInteractions.toLocaleString('id-ID')}
            </span>
          </div>
          <p style={{ fontSize: '0.76rem', color: 'var(--color-muted, #64748b)', margin: '4px 0 0' }}>
            Metrik keterlibatan seragam lintas platform
          </p>
        </article>
      </div>

      {/* Ringkasan Semua Kanal (Kartu Ringkas Tiap Kanal) */}
      <section aria-label="Ringkasan semua kanal media sosial">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
              Ringkasan Performa per Kanal
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: 'var(--color-muted, #5a6875)' }}>
              Kartu ringkas pengikut, tayangan, interaksi, dan kesegaran data tiap platform resmi
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1rem'
          }}
        >
          {filteredChannels.map((channel) => (
            <ChannelSummaryCard
              key={channel.id}
              channel={channel}
              periodMultiplier={periodMultiplier}
              isSelected={selectedPlatform === channel.platform}
              onSelectChannel={(plat) =>
                setSelectedPlatform((prev) => (prev === plat ? 'all' : plat))
              }
            />
          ))}
        </div>
      </section>

      {/* Grafik Tren Harian Terpisah per Kanal */}
      <ChannelDailyTrendChart
        channels={filteredChannels}
        activeMetric={activeMetric}
        onChangeMetric={setActiveMetric}
        startDate={startDate}
        endDate={endDate}
      />

      {/* Panel Ringkasan Kesegaran Data Tiap Kanal */}
      <ChannelFreshnessSummaryPanel channels={filteredChannels} />

      {/* Tabel Standarisasi Nama Metrik Lintas Platform */}
      <ChannelUnifiedMetricComparisonTable />
    </div>
  );
}

export default ChannelMonitoringView;

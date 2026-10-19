'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { SAMPLE_CHANNELS_DATA, type SocialPlatform } from './ChannelMonitoringView';
import { ChannelMetricCard } from './ChannelMetricCard';
import { ChannelSideBySideComparison } from './ChannelSideBySideComparison';
import { ChannelExportButton } from './ChannelExportButton';
import { ChannelDailyTrendChart } from './ChannelDailyTrendChart';
import { formatCompactMetricValue } from './ChannelUnifiedMetricComparisonTable';

type MetricDimension = React.ComponentProps<typeof ChannelDailyTrendChart>['activeMetric'];

const START_DATE = '2026-10-13';
const END_DATE = '2026-10-19';
const ALL_PLATFORMS: SocialPlatform[] = ['instagram', 'facebook', 'tiktok', 'youtube'];

/**
 * Layout halaman dasbor metrik kanal (frontend-first, data tiruan).
 * Struktur: sub-navigasi, KPI gabungan, kartu per kanal, tren harian, dan tabel siap-laporan.
 * Data masih memakai SAMPLE_CHANNELS_DATA; sambungan ke /api/channels/monitoring menyusul.
 */
export function ChannelMetricsDashboardView() {
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | SocialPlatform>('all');
  const [activeMetric, setActiveMetric] = useState<MetricDimension>('views' as MetricDimension);

  const channels = useMemo(
    () =>
      selectedPlatform === 'all'
        ? SAMPLE_CHANNELS_DATA
        : SAMPLE_CHANNELS_DATA.filter((c) => c.platform === selectedPlatform),
    [selectedPlatform]
  );

  const visiblePlatforms = selectedPlatform === 'all' ? ALL_PLATFORMS : [selectedPlatform];

  const totals = useMemo(
    () => ({
      followers: channels.reduce((a, c) => a + c.followers, 0),
      views: channels.reduce((a, c) => a + c.views, 0),
      interactions: channels.reduce((a, c) => a + c.interactions, 0)
    }),
    [channels]
  );

  const kpis = [
    { label: 'Total Pengikut', value: totals.followers },
    { label: 'Total Tayangan', value: totals.views },
    { label: 'Total Interaksi', value: totals.interactions },
    { label: 'Kanal Dipantau', value: channels.length }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Sub-navigasi modul kanal & laporan */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <Link href="/pemantauan-kanal" className="dasbor__btn">
          Pemantauan Kanal
        </Link>
        <Link href="/dasbor-metrik-kanal" className="dasbor__btn dasbor__btn--primary">
          Dasbor Metrik Kanal
        </Link>
        <Link href="/laporan-kinerja" className="dasbor__btn">
          Laporan Kinerja Kanal
        </Link>
      </div>

      {/* Filter platform */}
      <div className="dasbor__card" style={{ padding: '1rem' }}>
        <div role="group" aria-label="Filter platform" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {(['all', 'instagram', 'facebook', 'tiktok', 'youtube'] as const).map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={selectedPlatform === p}
              className={`dasbor__btn${selectedPlatform === p ? ' dasbor__btn--primary' : ''}`}
              onClick={() => setSelectedPlatform(p)}
            >
              {p === 'all' ? 'Semua Kanal' : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* KPI gabungan */}
      <section
        aria-label="Ringkasan metrik gabungan"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}
      >
        {kpis.map((k) => (
          <div key={k.label} className="dasbor__card" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.8rem', opacity: 0.75 }}>{k.label}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{formatCompactMetricValue(k.value)}</div>
          </div>
        ))}
      </section>

      {/* Kartu per kanal */}
      <section
        aria-label="Metrik per kanal"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}
      >
        {visiblePlatforms.map((p) => (
          <ChannelMetricCard
            key={p}
            platform={p}
            channel={channels.find((c) => c.platform === p) ?? null}
            isSelected={selectedPlatform === p}
            onSelectChannel={setSelectedPlatform}
          />
        ))}
      </section>

      {/* Tren harian */}
      <ChannelDailyTrendChart
        channels={channels}
        activeMetric={activeMetric}
        onChangeMetric={setActiveMetric}
        startDate={START_DATE}
        endDate={END_DATE}
      />

      {/* Perbandingan berdampingan antar kanal */}
      <ChannelSideBySideComparison channels={channels} />

      {/* Tabel siap-laporan */}
      <section className="dasbor__card" style={{ padding: '1rem', overflowX: 'auto' }} aria-label="Tabel metrik siap laporan">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h2 style={{ fontSize: '1rem', margin: 0 }}>Metrik Kanal untuk Laporan</h2>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <ChannelExportButton channels={channels} periodLabel={`${START_DATE}_${END_DATE}`} />
            <Link href="/laporan-kinerja" className="dasbor__btn">
              Buka Laporan Kinerja
            </Link>
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ textAlign: 'left' }}>
              <th scope="col">Kanal</th>
              <th scope="col">Pengikut</th>
              <th scope="col">Tayangan</th>
              <th scope="col">Interaksi</th>
              <th scope="col">Engagement</th>
              <th scope="col">Sinkron Terakhir</th>
            </tr>
          </thead>
          <tbody>
            {channels.map((c) => (
              <tr key={c.id}>
                <td>
                  {c.platformLabel} <span style={{ opacity: 0.7 }}>{c.handle}</span>
                </td>
                <td>{formatCompactMetricValue(c.followers)}</td>
                <td>{formatCompactMetricValue(c.views)}</td>
                <td>{formatCompactMetricValue(c.interactions)}</td>
                <td>{c.engagementRate}</td>
                <td>{c.lastUpdatedLabel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default ChannelMetricsDashboardView;

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { SAMPLE_CHANNELS_DATA } from './ChannelMonitoringView';
import { formatCompactMetricValue } from './ChannelUnifiedMetricComparisonTable';

export interface ChannelReportSummaryBlockProps {
  /** Nama kanal terpilih di filter laporan ("Semua Kanal" atau nama platform) */
  selectedChannel?: string;
}

/**
 * Blok ringkasan metrik kanal media sosial untuk halaman Laporan Kinerja.
 * Terintegrasi ke /api/channels/aggregate (Supabase PostgreSQL) dengan fallback data contoh.
 */
export function ChannelReportSummaryBlock({ selectedChannel = 'Semua Kanal' }: ChannelReportSummaryBlockProps) {
  const [channelsData, setChannelsData] = useState<any[]>(SAMPLE_CHANNELS_DATA);
  const [databaseSource, setDatabaseSource] = useState<string>('sample');

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const platformQuery = selectedChannel !== 'Semua Kanal' ? `?platform=${selectedChannel.toLowerCase()}` : '';
        const res = await fetch(`/api/channels/aggregate${platformQuery}`);
        if (res.ok) {
          const json = await res.json();
          if (json.ok && Array.isArray(json.channels) && isMounted) {
            setChannelsData(json.channels);
            if (json.database) setDatabaseSource(json.database);
          }
        }
      } catch {
        // Fallback ke data lokal
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [selectedChannel]);

  const rows =
    selectedChannel === 'Semua Kanal'
      ? channelsData
      : channelsData.filter((c) => (c.platformLabel || c.platform || '').toLowerCase() === selectedChannel.toLowerCase());

  const totals = rows.reduce(
    (acc, c) => ({
      followers: acc.followers + c.followers,
      views: acc.views + c.views,
      interactions: acc.interactions + c.interactions
    }),
    { followers: 0, views: 0, interactions: 0 }
  );

  const topByViews = rows.length ? rows.reduce((a, b) => (b.views > a.views ? b : a)) : null;

  return (
    <article
      className="dasbor__card"
      data-testid="report-channel-summary"
      aria-label="Ringkasan metrik kanal media sosial"
      style={{ padding: '1rem 1.25rem' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h2 style={{ fontSize: '1rem', margin: 0 }}>Ringkasan Metrik Kanal Media Sosial</h2>
          <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: 'var(--color-muted, #64748b)' }}>
            Pengikut, tayangan, dan interaksi dari kanal resmi (hanya-baca)
          </p>
        </div>
        <Link href="/dasbor-metrik-kanal" className="dasbor__btn">
          Buka Dasbor Metrik Kanal
        </Link>
      </div>

      {rows.length === 0 ? (
        <p data-testid="report-channel-summary-empty" style={{ margin: '1rem 0 0', fontSize: '0.85rem' }}>
          Belum ada metrik untuk kanal &quot;{selectedChannel}&quot;. Hubungkan kanal atau jalankan penarikan metrik terlebih dahulu.
        </p>
      ) : (
        <>
          <div
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginTop: '1rem' }}
          >
            {[
              { label: 'Total Pengikut', value: totals.followers },
              { label: 'Total Tayangan', value: totals.views },
              { label: 'Total Interaksi', value: totals.interactions }
            ].map((k) => (
              <div key={k.label}>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-muted, #64748b)' }}>{k.label}</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>{formatCompactMetricValue(k.value)}</div>
              </div>
            ))}
          </div>
          {topByViews && rows.length > 1 && (
            <p style={{ margin: '0.75rem 0 0', fontSize: '0.82rem' }}>
              Tayangan tertinggi: <strong>{topByViews.platformLabel}</strong> ({formatCompactMetricValue(topByViews.views)})
            </p>
          )}
        </>
      )}
    </article>
  );
}

export default ChannelReportSummaryBlock;

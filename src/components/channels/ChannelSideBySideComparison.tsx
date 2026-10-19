'use client';

import React from 'react';
import type { ChannelSummaryData, SocialPlatform } from './ChannelMonitoringView';
import { formatCompactMetricValue } from './ChannelUnifiedMetricComparisonTable';

export interface ChannelSideBySideComparisonProps {
  channels: ChannelSummaryData[];
}

type NumericKey = 'followers' | 'views' | 'interactions';

const NUMERIC_ROWS: Array<{ key: NumericKey; label: string }> = [
  { key: 'followers', label: 'Pengikut' },
  { key: 'views', label: 'Tayangan' },
  { key: 'interactions', label: 'Interaksi' }
];

const ACCENT: Record<SocialPlatform, string> = {
  instagram: '#e1306c',
  facebook: '#3b82f6',
  tiktok: '#10b981',
  youtube: '#ef4444'
};

/**
 * Perbandingan berdampingan antar kanal: satu kolom per kanal, satu baris per metrik.
 * Nilai tertinggi per baris ditandai (teks + ikon, bukan hanya warna) agar mudah dibaca.
 */
export function ChannelSideBySideComparison({ channels }: ChannelSideBySideComparisonProps) {
  if (channels.length < 2) {
    return (
      <section
        className="dasbor__card"
        data-testid="channel-comparison-empty"
        style={{ padding: '1.25rem', textAlign: 'center', border: '1px dashed var(--color-border, #303236)' }}
      >
        <h2 style={{ fontSize: '1rem', margin: '0 0 0.4rem' }}>Perbandingan Antar Kanal</h2>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted, #a1a1aa)' }}>
          Pilih &quot;Semua Kanal&quot; atau hubungkan minimal dua kanal untuk membandingkan metrik secara berdampingan.
        </p>
      </section>
    );
  }

  const best = (key: NumericKey) => Math.max(...channels.map((c) => c[key]));

  return (
    <section
      className="dasbor__card"
      data-testid="channel-side-by-side"
      aria-label="Perbandingan metrik berdampingan antar kanal"
      style={{ padding: '1rem', overflowX: 'auto' }}
    >
      <h2 style={{ fontSize: '1rem', margin: '0 0 0.75rem' }}>Perbandingan Antar Kanal</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', minWidth: 480 }}>
        <thead>
          <tr>
            <th scope="col" style={{ textAlign: 'left', padding: '6px 8px' }}>
              Metrik
            </th>
            {channels.map((c) => (
              <th
                key={c.id}
                scope="col"
                style={{ textAlign: 'right', padding: '6px 8px', borderBottom: `2px solid ${ACCENT[c.platform]}` }}
              >
                {c.platformLabel}
                <div style={{ fontWeight: 400, fontSize: '0.75rem', opacity: 0.7 }}>{c.handle}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {NUMERIC_ROWS.map((row) => {
            const top = best(row.key);
            return (
              <tr key={row.key}>
                <th scope="row" style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 500 }}>
                  {row.label}
                </th>
                {channels.map((c) => {
                  const isTop = c[row.key] === top;
                  return (
                    <td
                      key={c.id}
                      data-testid={`compare-${row.key}-${c.platform}`}
                      style={{ textAlign: 'right', padding: '6px 8px', fontWeight: isTop ? 700 : 400 }}
                    >
                      {isTop && <span aria-label="Tertinggi" title="Tertinggi">▲ </span>}
                      {formatCompactMetricValue(c[row.key])}
                    </td>
                  );
                })}
              </tr>
            );
          })}
          <tr>
            <th scope="row" style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 500 }}>
              Engagement Rate
            </th>
            {channels.map((c) => (
              <td key={c.id} style={{ textAlign: 'right', padding: '6px 8px' }}>
                {c.engagementRate}
              </td>
            ))}
          </tr>
          <tr>
            <th scope="row" style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 500 }}>
              Pertumbuhan Tayangan
            </th>
            {channels.map((c) => (
              <td key={c.id} style={{ textAlign: 'right', padding: '6px 8px' }}>
                {c.viewsGrowth}
              </td>
            ))}
          </tr>
          <tr>
            <th scope="row" style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 500 }}>
              Sinkron Terakhir
            </th>
            {channels.map((c) => (
              <td key={c.id} style={{ textAlign: 'right', padding: '6px 8px', fontSize: '0.75rem' }}>
                {c.lastUpdatedLabel}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </section>
  );
}

export default ChannelSideBySideComparison;

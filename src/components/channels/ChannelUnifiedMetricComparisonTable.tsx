'use client';

import React, { useState } from 'react';
import { UNIFIED_METRIC_MAPPINGS, type UnifiedMetricMapping } from './ScheduledMetricsSyncView';

export function formatCompactMetricValue(val: number | null | undefined): string {
  if (val === null || val === undefined || Number.isNaN(val)) {
    return '— Belum tersedia';
  }
  if (val >= 1_000_000) {
    return `${(val / 1_000_000).toFixed(2).replace('.', ',')} jt`;
  }
  if (val >= 1_000) {
    return `${(val / 1_000).toFixed(1).replace('.', ',')} rb`;
  }
  return val.toLocaleString('id-ID');
}

export interface SampleNormalizedValues {
  standardKey: UnifiedMetricMapping['standardKey'];
  youtube: number | null;
  instagram: number | null;
  facebook: number | null;
  tiktok: number | null;
}

export const SAMPLE_NORMALIZED_VALUES: SampleNormalizedValues[] = [
  {
    standardKey: 'followers',
    youtube: 96300,
    instagram: 128450,
    facebook: 84210,
    tiktok: 154800
  },
  {
    standardKey: 'views',
    youtube: 521600,
    instagram: 412800,
    facebook: 196400,
    tiktok: 892300
  },
  {
    standardKey: 'engagements',
    youtube: 19870,
    instagram: 24680,
    facebook: 11340,
    tiktok: 46120
  },
  {
    standardKey: 'reach',
    youtube: 388200,
    instagram: 318900,
    facebook: 158200,
    tiktok: null // Contoh tanda kosong ketika API Display dasar belum menyediakan reach unik harian
  },
  {
    standardKey: 'posts_count',
    youtube: 11,
    instagram: 18,
    facebook: 14,
    tiktok: 22
  }
];

export function ChannelUnifiedMetricComparisonTable() {
  const [compactMode, setCompactMode] = useState(true);

  const renderCell = (value: number | null, apiField: string) => {
    const isEmpty = value === null || value === undefined;
    return (
      <div>
        <div
          style={{
            fontWeight: isEmpty ? 500 : 700,
            fontSize: '0.9rem',
            color: isEmpty ? 'var(--color-text-muted, #a1a1aa)' : 'var(--color-text, #ffffff)'
          }}
          data-testid={isEmpty ? 'empty-metric-marker' : 'formatted-metric-value'}
        >
          {isEmpty
            ? '— Belum tersedia'
            : compactMode
            ? formatCompactMetricValue(value)
            : value.toLocaleString('id-ID')}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted, #a1a1aa)', marginTop: '0.15rem' }}>
          <code>{apiField}</code>
        </div>
      </div>
    );
  };

  return (
    <article className="dasbor__card" data-testid="unified-metric-mapping-section">
      <div className="dasbor__card-head">
        <div>
          <p className="dasbor__eyebrow">Normalisasi Skema Data &amp; Format Angka</p>
          <h2 className="dasbor__card-title">Nama Metrik Seragam, Format Ringkas, &amp; Tanda Kosong</h2>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`dasbor__btn ${compactMode ? 'dasbor__btn--primary' : ''}`}
            style={{ padding: '0.3rem 0.65rem', fontSize: '0.78rem' }}
            onClick={() => setCompactMode((prev) => !prev)}
            data-testid="toggle-compact-number-btn"
          >
            {compactMode ? 'Format Ringkas Aktif (rb/jt)' : 'Format Angka Penuh'}
          </button>
          <span className="dasbor__badge dasbor__badge--up">5 Metrik Utama Terstandarisasi</span>
        </div>
      </div>

      <p style={{ margin: '0 0 0.85rem', fontSize: '0.85rem', color: 'var(--color-muted, #64748b)' }}>
        Setiap penyedia memiliki nama field API yang berbeda. Layanan penarikan otomatis menyamakan istilah metrik ke dalam skema seragam sebelum disimpan ke <code>channel_daily_metrics</code>. Jika suatu metrik belum disediakan oleh endpoint penyedia, sistem menampilkan tanda kosong (<code>— Belum tersedia</code>) tanpa merusak perhitungan kanal lain.
      </p>

      <div className="dasbor__table-wrap">
        <table className="dasbor__table">
          <thead>
            <tr>
              <th scope="col">Metrik Seragam Humas</th>
              <th scope="col">YouTube (Data &amp; Analytics API)</th>
              <th scope="col">Instagram Graph API</th>
              <th scope="col">Facebook Graph API</th>
              <th scope="col">TikTok Display API</th>
            </tr>
          </thead>
          <tbody>
            {UNIFIED_METRIC_MAPPINGS.map((mapping) => {
              const sampleRow = SAMPLE_NORMALIZED_VALUES.find(
                (r) => r.standardKey === mapping.standardKey
              );
              return (
                <tr key={mapping.standardKey} data-testid={`unified-metric-row-${mapping.standardKey}`}>
                  <td>
                    <strong>{mapping.standardLabel}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-muted, #64748b)' }}>
                      Key: <code>{mapping.standardKey}</code> ({mapping.unit})
                    </div>
                  </td>
                  <td>{renderCell(sampleRow?.youtube ?? null, mapping.youtubeField)}</td>
                  <td>{renderCell(sampleRow?.instagram ?? null, mapping.instagramField)}</td>
                  <td>{renderCell(sampleRow?.facebook ?? null, mapping.facebookField)}</td>
                  <td>{renderCell(sampleRow?.tiktok ?? null, mapping.tiktokField)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </article>
  );
}

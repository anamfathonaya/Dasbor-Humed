'use client';

import React, { useState } from 'react';
import type { ChannelSummaryData } from './ChannelMonitoringView';

export interface ChannelExportButtonProps {
  channels: ChannelSummaryData[];
  /** Dipakai pada nama berkas, mis. "2026-10-13_2026-10-19" */
  periodLabel?: string;
}

const CSV_HEADERS = [
  'Platform',
  'Akun',
  'Handle',
  'Pengikut',
  'Tayangan',
  'Interaksi',
  'Engagement Rate',
  'Status',
  'Sinkron Terakhir'
];

/** Escape sel CSV + netralkan formula spreadsheet (CSV injection). */
function csvCell(value: string | number): string {
  let str = String(value);
  if (/^[=+\-@\t\r]/.test(str)) str = `'${str}`;
  return `"${str.replace(/"/g, '""')}"`;
}

export function buildChannelMetricsCsv(channels: ChannelSummaryData[]): string {
  const lines = [CSV_HEADERS.map(csvCell).join(',')];
  for (const c of channels) {
    lines.push(
      [
        c.platformLabel,
        c.accountName,
        c.handle,
        c.followers,
        c.views,
        c.interactions,
        c.engagementRate,
        c.status,
        c.lastUpdatedLabel
      ]
        .map(csvCell)
        .join(',')
    );
  }
  // BOM agar Excel membaca UTF-8 dengan benar
  return '\uFEFF' + lines.join('\r\n');
}

/**
 * Tombol ekspor data kanal ke CSV (dibuka di Excel/Google Sheets).
 * Nonaktif beserta alasannya bila belum ada data kanal untuk diekspor.
 */
export function ChannelExportButton({ channels, periodLabel }: ChannelExportButtonProps) {
  const [message, setMessage] = useState('');
  const disabled = channels.length === 0;

  const handleExport = async () => {
    if (disabled) return;
    try {
      setMessage('Mempersiapkan berkas ekspor...');
      const res = await fetch('/api/channels/export?format=csv');
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `metrik-kanal${periodLabel ? `_${periodLabel}` : ''}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        setMessage(`Ekspor resmi berhasil (${channels.length} kanal, jejak audit tercatat).`);
        return;
      }
    } catch {
      // Fallback ke pemrosesan client-side
    }

    const blob = new Blob([buildChannelMetricsCsv(channels)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `metrik-kanal${periodLabel ? `_${periodLabel}` : ''}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setMessage(`Berkas CSV berisi ${channels.length} kanal diunduh.`);
  };

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
      <button
        type="button"
        className="dasbor__btn"
        data-testid="channel-export-button"
        onClick={handleExport}
        disabled={disabled}
        title={disabled ? 'Belum ada data kanal untuk diekspor' : 'Unduh metrik kanal sebagai CSV'}
      >
        {/* @ts-ignore iconify web component */}
        <iconify-icon icon="lucide:download" aria-hidden="true" />
        <span>Ekspor CSV</span>
      </button>
      <span role="status" aria-live="polite" style={{ fontSize: '0.75rem', opacity: 0.8 }}>
        {message}
      </span>
    </span>
  );
}

export default ChannelExportButton;

'use client';

import React from 'react';

export interface ScheduleStatusItem {
  name: string;
  schedule: string;
  status: 'active' | 'paused' | 'warning' | 'idle';
  lastRun?: string;
}

export interface ScheduleStatusSummaryProps {
  items?: ScheduleStatusItem[];
}

export function ScheduleStatusSummary({
  items = [
    { name: 'Sinkronisasi Berita', schedule: 'Tiap 15 Menit', status: 'active', lastRun: '10m lalu' },
    { name: 'Pengingat Konten', schedule: 'Tiap 1 Jam', status: 'active', lastRun: '25m lalu' },
    { name: 'Agregasi Metrik', schedule: 'Harian (00:00)', status: 'active', lastRun: 'Kemarin' },
  ]
}: ScheduleStatusSummaryProps) {
  return (
    <div className="dasbor__card" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>Status Jadwal Otomatis (Cron)</h3>
        <span className="dasbor__badge dasbor__badge--up" style={{ fontSize: '11px' }}>
          3 Aktif
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
        {items.map((it, idx) => (
          <div
            key={idx}
            style={{
              padding: '0.75rem',
              borderRadius: '6px',
              background: 'var(--color-bg-subtle, #f8fafc)',
              border: '1px solid var(--color-border, #e2e8f0)'
            }}
          >
            <strong style={{ display: 'block', fontSize: '0.85rem' }}>{it.name}</strong>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-muted, #64748b)' }}>
              {it.schedule} {it.lastRun && `· ${it.lastRun}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

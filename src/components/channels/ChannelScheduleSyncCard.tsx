'use client';

import React from 'react';
import type { SocialProvider } from '@/lib/channelSampleData';
import type { ChannelScheduleConfig } from './ScheduledMetricsSyncView';

export interface ChannelScheduleSyncCardProps {
  schedule: ChannelScheduleConfig;
  isSyncing: boolean;
  disabled?: boolean;
  onPullNow: (provider: SocialProvider) => void;
  onToggleSchedule: (provider: SocialProvider) => void;
  onChangeFrequency: (provider: SocialProvider, cronExpression: string, scheduleLabel: string) => void;
}

const CRON_PRESETS: Array<{ cron: string; label: string }> = [
  { cron: '0 6 * * *', label: 'Setiap Hari (06:00 WIB)' },
  { cron: '0 6,18 * * *', label: '2x Sehari (06:00 & 18:00 WIB)' },
  { cron: '0 7,19 * * *', label: '2x Sehari (07:00 & 19:00 WIB)' },
  { cron: '0 6,12,18 * * *', label: '3x Sehari (06:00, 12:00 & 18:00 WIB)' }
];

export function ChannelScheduleSyncCard({
  schedule,
  isSyncing,
  disabled = false,
  onPullNow,
  onToggleSchedule,
  onChangeFrequency
}: ChannelScheduleSyncCardProps) {
  return (
    <div
      className="dasbor__card"
      data-testid={`schedule-card-${schedule.provider}`}
      style={{
        padding: '1.05rem',
        border: '1px solid var(--color-border, #e2e8f0)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '0.85rem'
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
          <div>
            <span className="dasbor__eyebrow" style={{ textTransform: 'uppercase' }}>
              {schedule.provider}
            </span>
            <h3 style={{ margin: '0.15rem 0 0', fontSize: '0.96rem', fontWeight: 700 }}>
              {schedule.channelName}
            </h3>
            <p style={{ margin: '0.1rem 0 0', fontSize: '0.78rem', color: 'var(--color-muted, #64748b)' }}>
              {schedule.handle} · Cron: <code>{schedule.cronExpression}</code>
            </p>
          </div>
          <span
            className={`dasbor__badge ${
              !schedule.enabled
                ? ''
                : schedule.lastStatus === 'success'
                ? 'dasbor__badge--up'
                : 'dasbor__badge--warn'
            }`}
          >
            {!schedule.enabled
              ? 'Dijeda'
              : schedule.lastStatus === 'success'
              ? 'Jadwal Aktif'
              : 'Perlu Cek Token'}
          </span>
        </div>

        <div
          style={{
            marginTop: '0.75rem',
            padding: '0.65rem 0.75rem',
            borderRadius: '0.5rem',
            background: 'var(--color-surface-muted, #f8fafc)',
            fontSize: '0.8rem',
            display: 'grid',
            gap: '0.35rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
            <span style={{ color: 'var(--color-muted, #64748b)' }}>Jadwal Tarik:</span>
            <strong>{schedule.scheduleLabel}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
            <span style={{ color: 'var(--color-muted, #64748b)' }}>Tarikan Terakhir:</span>
            <span>{schedule.lastRunAt}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
            <span style={{ color: 'var(--color-muted, #64748b)' }}>Tarikan Berikutnya:</span>
            <span>{schedule.nextRunAt}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
            <span style={{ color: 'var(--color-muted, #64748b)' }}>Metrik Tersinkron:</span>
            <span>
              {schedule.metricsPulledCount} metrik ({schedule.lastDurationMs} ms)
            </span>
          </div>
        </div>

        <div style={{ marginTop: '0.65rem' }}>
          <label
            htmlFor={`freq-select-${schedule.provider}`}
            style={{
              display: 'block',
              fontSize: '0.75rem',
              color: 'var(--color-muted, #64748b)',
              marginBottom: '0.25rem'
            }}
          >
            Atur Frekuensi Tarik Harian:
          </label>
          <select
            id={`freq-select-${schedule.provider}`}
            value={schedule.cronExpression}
            onChange={(e) => {
              const val = e.target.value;
              const match = CRON_PRESETS.find((p) => p.cron === val);
              onChangeFrequency(schedule.provider, val, match ? match.label : val);
            }}
            style={{
              width: '100%',
              padding: '0.4rem 0.6rem',
              borderRadius: '0.45rem',
              border: '1px solid var(--color-border, #cbd5e1)',
              fontSize: '0.8rem',
              background: 'var(--color-surface, #ffffff)'
            }}
          >
            {CRON_PRESETS.map((preset) => (
              <option key={preset.cron} value={preset.cron}>
                {preset.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
        <button
          type="button"
          className="dasbor__btn dasbor__btn--primary"
          style={{ flex: 1, justifyContent: 'center' }}
          onClick={() => onPullNow(schedule.provider)}
          disabled={disabled || isSyncing}
          data-testid={`pull-now-btn-${schedule.provider}`}
        >
          {isSyncing ? 'Menarik Metrik...' : 'Tarik Sekarang'}
        </button>
        <button
          type="button"
          className="dasbor__btn"
          onClick={() => onToggleSchedule(schedule.provider)}
          disabled={disabled}
          data-testid={`toggle-schedule-btn-${schedule.provider}`}
        >
          {schedule.enabled ? 'Jeda Jadwal' : 'Aktifkan'}
        </button>
      </div>
    </div>
  );
}

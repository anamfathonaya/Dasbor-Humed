'use client';

import React, { useState } from 'react';
import type { SocialProvider } from '@/lib/channelSampleData';
import type { ChannelScheduleConfig } from './ScheduledMetricsSyncView';

export interface ChannelDailyScheduleFormProps {
  schedules: ChannelScheduleConfig[];
  onSaveSchedule: (
    provider: SocialProvider | 'all',
    cronExpression: string,
    scheduleLabel: string,
    nextRunAt: string,
    timezone: string
  ) => void;
}

const TIME_SLOTS: Array<{
  id: string;
  label: string;
  cron: string;
  nextRunPreview: string;
}> = [
  {
    id: 'daily-06',
    label: 'Setiap Hari Pukul 06:00',
    cron: '0 6 * * *',
    nextRunPreview: '20 Okt 2026, 06:00'
  },
  {
    id: 'twice-06-18',
    label: '2x Sehari (Pukul 06:00 & 18:00)',
    cron: '0 6,18 * * *',
    nextRunPreview: '19 Okt 2026, 18:00'
  },
  {
    id: 'twice-07-19',
    label: '2x Sehari (Pukul 07:00 & 19:00)',
    cron: '0 7,19 * * *',
    nextRunPreview: '19 Okt 2026, 19:00'
  },
  {
    id: 'thrice-06-12-18',
    label: '3x Sehari (Pukul 06:00, 12:00 & 18:00)',
    cron: '0 6,12,18 * * *',
    nextRunPreview: '19 Okt 2026, 12:00'
  }
];

const TIMEZONES = [
  { value: 'Asia/Jakarta', short: 'WIB (UTC+7)' },
  { value: 'Asia/Makassar', short: 'WITA (UTC+8)' },
  { value: 'Asia/Jayapura', short: 'WIT (UTC+9)' }
];

export function ChannelDailyScheduleForm({
  schedules,
  onSaveSchedule
}: ChannelDailyScheduleFormProps) {
  const [targetProvider, setTargetProvider] = useState<SocialProvider | 'all'>('all');
  const [selectedSlotId, setSelectedSlotId] = useState<string>('twice-06-18');
  const [timezone, setTimezone] = useState<string>('Asia/Jakarta');

  const activeSlot = TIME_SLOTS.find((s) => s.id === selectedSlotId) || TIME_SLOTS[1];
  const activeTz = TIMEZONES.find((t) => t.value === timezone) || TIMEZONES[0];
  const tzShortLabel = activeTz.short.split(' ')[0];
  const computedNextRun = `${activeSlot.nextRunPreview} ${tzShortLabel}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSchedule(
      targetProvider,
      activeSlot.cron,
      `${activeSlot.label} ${tzShortLabel}`,
      computedNextRun,
      timezone
    );
  };

  return (
    <article className="dasbor__card" data-testid="daily-schedule-form-card">
      <div className="dasbor__card-head">
        <div>
          <p className="dasbor__eyebrow">Pengaturan Waktu Cron</p>
          <h2 className="dasbor__card-title">Form Jadwal Harian &amp; Estimasi Jadwal Berikutnya</h2>
        </div>
        <span className="dasbor__badge dasbor__badge--up" data-testid="next-run-preview-badge">
          Jadwal Berikutnya: {computedNextRun}
        </span>
      </div>

      <form onSubmit={handleSubmit} data-testid="channel-daily-schedule-form">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0.9rem',
            marginTop: '0.5rem'
          }}
        >
          <div>
            <label
              htmlFor="schedule-target-channel"
              style={{
                display: 'block',
                fontSize: '0.78rem',
                fontWeight: 600,
                marginBottom: '0.3rem',
                color: 'var(--color-text, #0f172a)'
              }}
            >
              Pilih Kanal Target
            </label>
            <select
              id="schedule-target-channel"
              value={targetProvider}
              onChange={(e) => setTargetProvider(e.target.value as SocialProvider | 'all')}
              style={{
                width: '100%',
                padding: '0.5rem 0.65rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--color-border, #cbd5e1)',
                fontSize: '0.84rem',
                background: 'var(--color-surface, #ffffff)'
              }}
            >
              <option value="all">Semua Kanal (YouTube, Instagram, Facebook, TikTok)</option>
              {schedules.map((s) => (
                <option key={s.provider} value={s.provider}>
                  {s.provider.toUpperCase()} — {s.channelName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="schedule-slot-select"
              style={{
                display: 'block',
                fontSize: '0.78rem',
                fontWeight: 600,
                marginBottom: '0.3rem',
                color: 'var(--color-text, #0f172a)'
              }}
            >
              Waktu Tarik Harian
            </label>
            <select
              id="schedule-slot-select"
              value={selectedSlotId}
              onChange={(e) => setSelectedSlotId(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.65rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--color-border, #cbd5e1)',
                fontSize: '0.84rem',
                background: 'var(--color-surface, #ffffff)'
              }}
            >
              {TIME_SLOTS.map((slot) => (
                <option key={slot.id} value={slot.id}>
                  {slot.label} ({slot.cron})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="schedule-timezone-select"
              style={{
                display: 'block',
                fontSize: '0.78rem',
                fontWeight: 600,
                marginBottom: '0.3rem',
                color: 'var(--color-text, #0f172a)'
              }}
            >
              Zona Waktu Server
            </label>
            <select
              id="schedule-timezone-select"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.65rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--color-border, #cbd5e1)',
                fontSize: '0.84rem',
                background: 'var(--color-surface, #ffffff)'
              }}
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.short} — {tz.value}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          style={{
            marginTop: '0.9rem',
            padding: '0.75rem 0.95rem',
            borderRadius: '0.55rem',
            background: 'var(--color-surface-muted, #f8fafc)',
            border: '1px solid var(--color-border, #e2e8f0)',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.75rem'
          }}
        >
          <div style={{ fontSize: '0.82rem', color: 'var(--color-muted, #475569)' }}>
            Ekspresi Cron Aktif: <code>{activeSlot.cron}</code> · Eksekusi Terjadwal Berikutnya:{' '}
            <strong style={{ color: 'var(--color-text, #0f172a)' }}>{computedNextRun}</strong>
          </div>
          <button
            type="submit"
            className="dasbor__btn dasbor__btn--primary"
            data-testid="save-daily-schedule-btn"
          >
            Simpan Jadwal Harian
          </button>
        </div>
      </form>
    </article>
  );
}

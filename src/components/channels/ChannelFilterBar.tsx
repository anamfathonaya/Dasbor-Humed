'use client';

import React from 'react';
import type { SocialPlatform, DateRangePreset } from './ChannelMonitoringView';

export interface ChannelFilterBarProps {
  selectedPlatform: 'all' | SocialPlatform;
  onSelectPlatform: (platform: 'all' | SocialPlatform) => void;
  dateRangePreset: DateRangePreset;
  onSelectPreset: (preset: DateRangePreset) => void;
  startDate: string;
  endDate: string;
  onChangeStartDate: (date: string) => void;
  onChangeEndDate: (date: string) => void;
  onResetFilters: () => void;
  totalChannelsShown: number;
}

const PLATFORM_OPTIONS: Array<{
  id: 'all' | SocialPlatform;
  label: string;
  icon: string;
}> = [
  { id: 'all', label: 'Semua Kanal (4)', icon: 'lucide:layers' },
  { id: 'instagram', label: 'Instagram', icon: 'lucide:instagram' },
  { id: 'facebook', label: 'Facebook', icon: 'lucide:facebook' },
  { id: 'tiktok', label: 'TikTok', icon: 'lucide:music-2' },
  { id: 'youtube', label: 'YouTube', icon: 'lucide:youtube' }
];

const PRESET_OPTIONS: Array<{
  id: Exclude<DateRangePreset, 'custom'>;
  label: string;
}> = [
  { id: '7d', label: '7 Hari Terakhir' },
  { id: '14d', label: '14 Hari' },
  { id: '30d', label: '30 Hari' }
];

export function ChannelFilterBar({
  selectedPlatform,
  onSelectPlatform,
  dateRangePreset,
  onSelectPreset,
  startDate,
  endDate,
  onChangeStartDate,
  onChangeEndDate,
  onResetFilters,
  totalChannelsShown
}: ChannelFilterBarProps) {
  const isDefaultFilter =
    selectedPlatform === 'all' &&
    dateRangePreset === '7d' &&
    startDate === '2026-10-13' &&
    endDate === '2026-10-19';

  return (
    <section
      className="dasbor__card"
      aria-label="Filter kanal dan rentang tanggal"
      data-testid="channel-filter-bar"
      style={{ padding: '1rem 1.25rem' }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}
      >
        {/* Filter Pilih Kanal */}
        <div
          role="group"
          aria-label="Pilih platform kanal media sosial"
          style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}
        >
          <span
            style={{
              fontSize: '0.82rem',
              fontWeight: 600,
              color: 'var(--color-muted, #5a6875)',
              marginRight: '4px'
            }}
          >
            Pilih Kanal:
          </span>
          {PLATFORM_OPTIONS.map((item) => {
            const active = selectedPlatform === item.id;
            return (
              <button
                key={item.id}
                type="button"
                data-testid={`filter-platform-${item.id}`}
                onClick={() => onSelectPlatform(item.id)}
                className={`dasbor__btn ${active ? 'dasbor__btn--primary' : ''}`}
                style={{ minHeight: '32px', padding: '0 12px', fontSize: '12px' }}
                aria-pressed={active}
              >
                {/* @ts-ignore iconify web component */}
                <iconify-icon icon={item.icon} aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Filter Rentang Tanggal */}
        <div
          role="group"
          aria-label="Pilih rentang tanggal pemantauan"
          style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}
        >
          <span
            style={{
              fontSize: '0.82rem',
              fontWeight: 600,
              color: 'var(--color-muted, #5a6875)'
            }}
          >
            Rentang Tanggal:
          </span>
          {PRESET_OPTIONS.map((preset) => {
            const active = dateRangePreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                data-testid={`filter-preset-${preset.id}`}
                onClick={() => onSelectPreset(preset.id)}
                className={`dasbor__btn ${active ? 'dasbor__btn--primary' : ''}`}
                style={{ minHeight: '32px', padding: '0 10px', fontSize: '12px' }}
                aria-pressed={active}
              >
                {preset.label}
              </button>
            );
          })}

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              marginLeft: '4px'
            }}
          >
            <input
              type="date"
              aria-label="Tanggal mulai"
              data-testid="filter-start-date"
              value={startDate}
              max={endDate}
              onChange={(e) => onChangeStartDate(e.target.value)}
              style={{
                padding: '5px 8px',
                fontSize: '12px',
                borderRadius: '6px',
                background: 'var(--color-surface-sunken, #090a0c)',
                color: 'var(--color-text, #ffffff)',
                border: '1px solid var(--color-border, #303236)'
              }}
            />
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted, #a1a1aa)' }}>s/d</span>
            <input
              type="date"
              aria-label="Tanggal akhir"
              data-testid="filter-end-date"
              value={endDate}
              min={startDate}
              onChange={(e) => onChangeEndDate(e.target.value)}
              style={{
                padding: '5px 8px',
                fontSize: '12px',
                borderRadius: '6px',
                background: 'var(--color-surface-sunken, #090a0c)',
                color: 'var(--color-text, #ffffff)',
                border: '1px solid var(--color-border, #303236)'
              }}
            />
          </div>

          {!isDefaultFilter && (
            <button
              type="button"
              data-testid="filter-reset-btn"
              onClick={onResetFilters}
              className="dasbor__mini-btn"
              style={{ fontSize: '11px', marginLeft: '4px', cursor: 'pointer' }}
            >
              Reset Filter ({totalChannelsShown})
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

export default ChannelFilterBar;

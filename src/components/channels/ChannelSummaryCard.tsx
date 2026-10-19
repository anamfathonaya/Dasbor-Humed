'use client';

import React from 'react';
import type { ChannelSummaryData } from './ChannelMonitoringView';
import { ChannelFreshnessBadge } from './ChannelFreshnessBadge';

export interface ChannelSummaryCardProps {
  channel: ChannelSummaryData;
  periodMultiplier?: number;
  isSelected?: boolean;
  onSelectChannel?: (platform: ChannelSummaryData['platform']) => void;
}

const PLATFORM_META: Record<
  ChannelSummaryData['platform'],
  { icon: string; accentColor: string; bgBadge: string; textBadge: string }
> = {
  instagram: {
    icon: 'lucide:instagram',
    accentColor: '#e1306c',
    bgBadge: 'rgba(225, 48, 108, 0.15)',
    textBadge: '#f472b6'
  },
  facebook: {
    icon: 'lucide:facebook',
    accentColor: '#3b82f6',
    bgBadge: 'rgba(59, 130, 246, 0.15)',
    textBadge: '#60a5fa'
  },
  tiktok: {
    icon: 'lucide:music-2',
    accentColor: '#10b981',
    bgBadge: 'rgba(16, 185, 129, 0.15)',
    textBadge: '#34d399'
  },
  youtube: {
    icon: 'lucide:youtube',
    accentColor: '#ef4444',
    bgBadge: 'rgba(239, 68, 68, 0.15)',
    textBadge: '#f87171'
  }
};

export function ChannelSummaryCard({
  channel,
  periodMultiplier = 1,
  isSelected = false,
  onSelectChannel
}: ChannelSummaryCardProps) {
  const scaledViews = Math.round(channel.views * periodMultiplier);
  const scaledInteractions = Math.round(channel.interactions * periodMultiplier);
  const meta = PLATFORM_META[channel.platform];

  const getBadgeClass = (type: 'up' | 'down' | 'flat') => {
    if (type === 'up') return 'dasbor__badge--up';
    if (type === 'down') return 'dasbor__badge--down';
    return 'dasbor__badge--flat';
  };

  return (
    <article
      className="dasbor__card"
      data-testid={`channel-summary-card-${channel.platform}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '0.9rem',
        borderTop: `3px solid ${meta.accentColor}`,
        outline: isSelected ? `2px solid ${meta.accentColor}` : 'none',
        transition: 'box-shadow 0.15s ease, transform 0.15s ease'
      }}
    >
      <div>
        {/* Bagian Kepala Kartu: Identitas Platform & Status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '8px'
          }}
        >
          <div>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 9px',
                borderRadius: '6px',
                background: meta.bgBadge,
                color: meta.textBadge,
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.03em'
              }}
            >
              {/* @ts-ignore iconify web component */}
              <iconify-icon icon={meta.icon} aria-hidden="true" />
              <span>{channel.platformLabel}</span>
            </span>
            <h3 style={{ margin: '7px 0 2px', fontSize: '1rem', fontWeight: 700, color: 'var(--color-text, #ffffff)' }}>
              {channel.accountName}
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted, #a1a1aa)' }}>
              {channel.handle}
            </span>
          </div>

          <span
            data-testid={`channel-status-badge-${channel.platform}`}
            className={`dasbor__badge ${
              channel.status === 'connected'
                ? 'dasbor__badge--up'
                : channel.status === 'reauth_required' || channel.status === 'sync_failed'
                ? 'dasbor__badge--down'
                : 'dasbor__badge--flat'
            }`}
            style={{ fontSize: '12px' }}
          >
            {channel.status === 'connected'
              ? 'Tersambung'
              : channel.status === 'sync_failed'
              ? 'Gagal Tarik'
              : channel.status === 'reauth_required'
              ? 'Perlu Re-auth'
              : channel.status === 'not_connected'
              ? 'Belum Tersambung'
              : 'Data Contoh'}
          </span>
        </div>

        {(channel.status === 'not_connected' || channel.status === 'sync_failed') && (
          <div
            data-testid={`channel-status-message-${channel.platform}`}
            style={{
              marginTop: '0.65rem',
              padding: '0.5rem 0.65rem',
              borderRadius: '8px',
              fontSize: '0.75rem',
              background:
                channel.status === 'sync_failed'
                  ? 'rgba(239, 68, 68, 0.12)'
                  : 'rgba(59, 130, 246, 0.12)',
              color: channel.status === 'sync_failed' ? '#f87171' : '#93c5fd',
              border:
                channel.status === 'sync_failed'
                  ? '1px solid rgba(239, 68, 68, 0.25)'
                  : '1px solid rgba(59, 130, 246, 0.25)'
            }}
          >
            {channel.status === 'sync_failed'
              ? `⚠️ ${
                  channel.errorMessage ||
                  'Gagal menarik metrik terbaru. Menampilkan angka tarikan terakhir yang valid.'
                }`
              : '🔌 Kanal belum tersambung OAuth. Menampilkan angka contoh pratinjau.'}
          </div>
        )}

        {/* Tiga Angka Utama Seragam: Pengikut, Tayangan, Interaksi */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            marginTop: '0.9rem',
            padding: '0.75rem',
            borderRadius: '8px',
            background: 'var(--color-surface-sunken, #090a0c)',
            border: '1px solid var(--color-border, #303236)'
          }}
        >
          {/* 1. Pengikut */}
          <div data-testid={`metric-followers-${channel.platform}`}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted, #a1a1aa)', fontWeight: 500 }}>
              Pengikut
            </div>
            <div style={{ fontSize: '0.98rem', fontWeight: 700, marginTop: '3px', color: 'var(--color-text, #ffffff)' }}>
              {channel.followers.toLocaleString('id-ID')}
            </div>
            <span
              className={`dasbor__badge ${getBadgeClass(channel.followersGrowthType)}`}
              style={{ fontSize: '12px', marginTop: '4px', padding: '1px 6px' }}
            >
              {channel.followersGrowth}
            </span>
          </div>

          {/* 2. Tayangan */}
          <div data-testid={`metric-views-${channel.platform}`}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted, #a1a1aa)', fontWeight: 500 }}>
              Tayangan
            </div>
            <div style={{ fontSize: '0.98rem', fontWeight: 700, marginTop: '3px', color: 'var(--color-text, #ffffff)' }}>
              {scaledViews.toLocaleString('id-ID')}
            </div>
            <span
              className={`dasbor__badge ${getBadgeClass(channel.viewsGrowthType)}`}
              style={{ fontSize: '12px', marginTop: '4px', padding: '1px 6px' }}
            >
              {channel.viewsGrowth}
            </span>
          </div>

          {/* 3. Interaksi */}
          <div data-testid={`metric-interactions-${channel.platform}`}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted, #a1a1aa)', fontWeight: 500 }}>
              Interaksi
            </div>
            <div style={{ fontSize: '0.98rem', fontWeight: 700, marginTop: '3px', color: 'var(--color-text, #ffffff)' }}>
              {scaledInteractions.toLocaleString('id-ID')}
            </div>
            <span
              className={`dasbor__badge ${getBadgeClass(channel.interactionsGrowthType)}`}
              style={{ fontSize: '12px', marginTop: '4px', padding: '1px 6px' }}
            >
              {channel.interactionsGrowth}
            </span>
          </div>
        </div>
      </div>

      {/* Bagian Kaki Kartu: Kesegaran Data, ER, dan Tombol Fokus */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          borderTop: '1px solid var(--color-border, #303236)',
          paddingTop: '0.65rem',
          fontSize: '0.75rem',
          color: 'var(--color-text-muted, #a1a1aa)'
        }}
      >
        <ChannelFreshnessBadge
          lastUpdatedLabel={channel.lastUpdatedLabel}
          lastUpdatedIso={channel.lastUpdatedIso}
          freshnessState={channel.freshnessState}
          platform={channel.platform}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 600, color: 'var(--color-text, #ffffff)' }}>
            ER: {channel.engagementRate}
          </span>
          {onSelectChannel && (
            <button
              type="button"
              onClick={() => onSelectChannel(channel.platform)}
              className="dasbor__mini-btn"
              style={{ fontSize: '11px', cursor: 'pointer' }}
            >
              {isSelected ? 'Tampilkan Semua' : 'Fokus Kanal'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default ChannelSummaryCard;

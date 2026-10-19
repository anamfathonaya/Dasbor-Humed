'use client';

import React from 'react';
import type { ChannelSummaryData } from './ChannelMonitoringView';

export interface ChannelFreshnessBadgeProps {
  lastUpdatedLabel: string;
  lastUpdatedIso: string;
  freshnessState: 'segar' | 'perlu_sinkron';
  platform?: string;
}

export function ChannelFreshnessBadge({
  lastUpdatedLabel,
  lastUpdatedIso,
  freshnessState,
  platform
}: ChannelFreshnessBadgeProps) {
  const isFresh = freshnessState === 'segar';

  return (
    <span
      data-testid={platform ? `freshness-badge-${platform}` : 'freshness-badge'}
      title={`Waktu pembaruan ISO: ${lastUpdatedIso}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '3px 8px',
        borderRadius: '999px',
        background: isFresh ? 'rgba(16, 185, 129, 0.14)' : 'rgba(245, 158, 11, 0.14)',
        color: isFresh ? '#34d399' : '#fbbf24',
        fontSize: '0.75rem',
        fontWeight: 600
      }}
    >
      <span
        style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          background: isFresh ? '#10b981' : '#f59e0b',
          display: 'inline-block'
        }}
      />
      <span>{lastUpdatedLabel}</span>
    </span>
  );
}

export interface ChannelFreshnessSummaryPanelProps {
  channels: ChannelSummaryData[];
}

export function ChannelFreshnessSummaryPanel({
  channels
}: ChannelFreshnessSummaryPanelProps) {
  return (
    <section
      className="dasbor__card"
      aria-label="Penanda kesegaran data per kanal"
      data-testid="channel-freshness-panel"
      style={{ padding: '1rem 1.25rem' }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          marginBottom: '0.75rem'
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: 'var(--color-text, #ffffff)' }}>
            Status Kesegaran Data per Kanal
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--color-text-muted, #a1a1aa)' }}>
            Waktu terakhir metrik diperbarui agar tim tahu angka pada masing-masing kanal masih layak dipakai
          </p>
        </div>
        <span className="dasbor__badge dasbor__badge--up" style={{ fontSize: '12px' }}>
          Semua Kanal Layak Pakai ({channels.length}/{channels.length})
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '0.75rem'
        }}
      >
        {channels.map((ch) => (
          <div
            key={`fresh-${ch.id}`}
            data-testid={`freshness-item-${ch.platform}`}
            style={{
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid var(--color-border, #303236)',
              background: 'var(--color-surface-sunken, #090a0c)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <strong style={{ fontSize: '0.85rem', color: 'var(--color-text, #ffffff)' }}>{ch.platformLabel}</strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted, #a1a1aa)' }}>
                {ch.handle}
              </span>
            </div>
            <div>
              <ChannelFreshnessBadge
                lastUpdatedLabel={ch.lastUpdatedLabel}
                lastUpdatedIso={ch.lastUpdatedIso}
                freshnessState={ch.freshnessState}
                platform={ch.platform}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ChannelFreshnessBadge;

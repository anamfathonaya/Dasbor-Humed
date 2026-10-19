'use client';

import React from 'react';
import Link from 'next/link';
import type { ChannelSummaryData, SocialPlatform } from './ChannelMonitoringView';
import { ChannelSummaryCard } from './ChannelSummaryCard';

export interface ChannelMetricCardProps {
  platform: SocialPlatform;
  /** null/undefined = kanal belum tersambung atau belum ada metrik sama sekali */
  channel?: ChannelSummaryData | null;
  isSelected?: boolean;
  onSelectChannel?: (platform: SocialPlatform) => void;
}

const PLATFORM_LABEL: Record<SocialPlatform, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  youtube: 'YouTube'
};

const INTEGRATION_HREF: Record<SocialPlatform, string> = {
  instagram: '/integrasi-meta',
  facebook: '/integrasi-meta',
  tiktok: '/integrasi-tiktok',
  youtube: '/integrasi-youtube'
};

/**
 * Kartu metrik satu kanal. Bila kanal belum tersambung / belum punya metrik,
 * menampilkan empty state beserta petunjuk langkah berikutnya (bukan angka kosong atau angka contoh).
 */
export function ChannelMetricCard({ platform, channel, isSelected, onSelectChannel }: ChannelMetricCardProps) {
  const isEmpty =
    !channel ||
    channel.status === 'not_connected' ||
    (channel.followers === 0 && channel.views === 0 && channel.interactions === 0);

  if (!isEmpty && channel) {
    return <ChannelSummaryCard channel={channel} isSelected={isSelected} onSelectChannel={onSelectChannel} />;
  }

  const label = PLATFORM_LABEL[platform];
  const notConnected = !channel || channel.status === 'not_connected';

  return (
    <article
      className="dasbor__card"
      data-testid={`channel-metric-empty-${platform}`}
      aria-label={`Kartu metrik ${label} kosong`}
      style={{
        padding: '1.5rem 1rem',
        textAlign: 'center',
        border: '1px dashed var(--color-border, #303236)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.6rem'
      }}
    >
      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{label}</h3>
      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted, #a1a1aa)' }}>
        {notConnected
          ? `Kanal ${label} belum tersambung, sehingga belum ada metrik untuk ditampilkan.`
          : `Belum ada metrik ${label} pada periode ini. Data muncul setelah penarikan metrik berikutnya.`}
      </p>
      <Link
        href={notConnected ? INTEGRATION_HREF[platform] : '/penarikan-metrik-terjadwal'}
        className="dasbor__btn"
      >
        {notConnected ? `Hubungkan ${label}` : 'Lihat Jadwal Tarik Metrik'}
      </Link>
    </article>
  );
}

export default ChannelMetricCard;

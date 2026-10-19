'use client';

import React, { useState } from 'react';
import type { ChannelSummaryData, MetricDimension } from './ChannelMonitoringView';

export interface ChannelDailyTrendChartProps {
  channels: ChannelSummaryData[];
  activeMetric: MetricDimension;
  onChangeMetric: (metric: MetricDimension) => void;
  startDate: string;
  endDate: string;
}

const PLATFORM_THEME: Record<
  ChannelSummaryData['platform'],
  { color: string; gradient: string; icon: string }
> = {
  instagram: {
    color: '#e1306c',
    gradient: 'linear-gradient(180deg, #f472b6 0%, #e1306c 100%)',
    icon: 'lucide:instagram'
  },
  facebook: {
    color: '#1877f2',
    gradient: 'linear-gradient(180deg, #60a5fa 0%, #1877f2 100%)',
    icon: 'lucide:facebook'
  },
  tiktok: {
    color: '#10b981',
    gradient: 'linear-gradient(180deg, #34d399 0%, #10b981 100%)',
    icon: 'lucide:music-2'
  },
  youtube: {
    color: '#dc2626',
    gradient: 'linear-gradient(180deg, #f87171 0%, #dc2626 100%)',
    icon: 'lucide:youtube'
  }
};

const METRIC_LABELS: Record<MetricDimension, string> = {
  views: 'Tayangan (Views / Reach)',
  interactions: 'Interaksi (Likes, Comments, Shares)',
  followers: 'Pengikut (Followers / Subscribers)'
};

export function ChannelDailyTrendChart({
  channels,
  activeMetric,
  onChangeMetric,
  startDate,
  endDate
}: ChannelDailyTrendChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{
    channelId: string;
    date: string;
  } | null>(null);

  return (
    <section
      className="dasbor__card"
      aria-label="Tren harian per kanal"
      data-testid="daily-trends-section"
    >
      <div
        className="dasbor__card-head"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}
      >
        <div>
          <h2>Tren Harian Terpisah per Kanal ({startDate} s/d {endDate})</h2>
          <p>
            Grafik tren harian masing-masing kanal untuk memantau naik-turun{' '}
            <b>{METRIC_LABELS[activeMetric]}</b>
          </p>
        </div>

        <div
          role="group"
          aria-label="Pilih metrik grafik tren harian"
          style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}
        >
          {(
            [
              { id: 'views', label: 'Tayangan (Views)' },
              { id: 'interactions', label: 'Interaksi' },
              { id: 'followers', label: 'Pengikut' }
            ] as const
          ).map((dim) => {
            const active = activeMetric === dim.id;
            return (
              <button
                key={dim.id}
                type="button"
                data-testid={`trend-metric-tab-${dim.id}`}
                onClick={() => onChangeMetric(dim.id)}
                className={`dasbor__btn ${active ? 'dasbor__btn--primary' : ''}`}
                style={{ minHeight: '32px', padding: '0 12px', fontSize: '12px' }}
                aria-pressed={active}
              >
                {dim.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Grafik Terpisah per Kanal */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: '1rem',
          marginTop: '1rem'
        }}
      >
        {channels.map((channel) => {
          const values = channel.dailyTrend.map((pt) => pt[activeMetric]);
          const maxVal = Math.max(...values, 1);
          const minVal = Math.min(...values);
          const avgVal = Math.round(
            values.reduce((sum, v) => sum + v, 0) / (values.length || 1)
          );
          const peakIdx = values.indexOf(maxVal);
          const peakPoint = channel.dailyTrend[peakIdx];
          const theme = PLATFORM_THEME[channel.platform];

          const growthLabel =
            activeMetric === 'views'
              ? channel.viewsGrowth
              : activeMetric === 'interactions'
              ? channel.interactionsGrowth
              : channel.followersGrowth;

          return (
            <article
              key={`trend-${channel.id}`}
              data-testid={`channel-trend-chart-${channel.platform}`}
              style={{
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid var(--color-border, #303236)',
                background: 'var(--color-surface-sunken, #090a0c)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '0.75rem'
              }}
            >
              {/* Header Grafik Kanal */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: theme.color,
                      display: 'inline-block'
                    }}
                  />
                  <strong style={{ fontSize: '0.92rem', color: 'var(--color-text, #ffffff)' }}>{channel.platformLabel}</strong>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted, #a1a1aa)' }}>
                    ({channel.handle})
                  </span>
                </div>

                <span className="dasbor__badge dasbor__badge--up" style={{ fontSize: '12px' }}>
                  {growthLabel}
                </span>
              </div>

              {/* Ringkasan Statistik Harian Kanal (Rata-rata & Puncak) */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem',
                  color: 'var(--color-text-muted, #a1a1aa)',
                  background: 'var(--color-surface, #111315)',
                  border: '1px solid var(--color-border, #303236)',
                  padding: '6px 10px',
                  borderRadius: '6px'
                }}
              >
                <span>
                  Rata-rata/hari:{' '}
                  <b style={{ color: 'var(--color-text, #ffffff)' }}>
                    {avgVal.toLocaleString('id-ID')}
                  </b>
                </span>
                {peakPoint && (
                  <span>
                    Puncak ({peakPoint.label}):{' '}
                    <b style={{ color: 'var(--color-text, #ffffff)' }}>
                      {maxVal.toLocaleString('id-ID')}
                    </b>
                  </span>
                )}
              </div>

              {/* Area Grafik Batang Harian Interaktif */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${channel.dailyTrend.length}, 1fr)`,
                  alignItems: 'end',
                  gap: '6px',
                  height: '120px',
                  paddingTop: '18px',
                  borderBottom: '1px solid var(--color-border, #303236)'
                }}
              >
                {channel.dailyTrend.map((point) => {
                  const val = point[activeMetric];
                  const heightPct =
                    activeMetric === 'followers'
                      ? Math.max(
                          25,
                          Math.round(
                            ((val - minVal * 0.985) / (maxVal - minVal * 0.985 || 1)) * 100
                          )
                        )
                      : Math.max(20, Math.round((val / maxVal) * 100));

                  const isHovered =
                    hoveredPoint?.channelId === channel.id &&
                    hoveredPoint?.date === point.date;

                  return (
                    <div
                      key={point.date}
                      onMouseEnter={() =>
                        setHoveredPoint({ channelId: channel.id, date: point.date })
                      }
                      onMouseLeave={() => setHoveredPoint(null)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        height: '100%',
                        cursor: 'pointer'
                      }}
                      title={`${channel.platformLabel} (${point.label}): ${val.toLocaleString('id-ID')}`}
                    >
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: isHovered ? 700 : 500,
                          color: isHovered
                            ? 'var(--color-text, #ffffff)'
                            : 'var(--color-text-muted, #a1a1aa)',
                          marginBottom: '4px'
                        }}
                      >
                        {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                      </span>
                      <div
                        style={{
                          width: '100%',
                          maxWidth: '28px',
                          height: `${Math.min(100, heightPct)}%`,
                          background: theme.gradient,
                          borderRadius: '4px 4px 0 0',
                          opacity: isHovered ? 1 : 0.88,
                          transform: isHovered ? 'scaleY(1.03)' : 'none',
                          transition: 'opacity 0.15s ease, transform 0.15s ease'
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Sumbu Tanggal */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${channel.dailyTrend.length}, 1fr)`,
                  gap: '6px',
                  textAlign: 'center'
                }}
              >
                {channel.dailyTrend.map((point) => (
                  <span
                    key={`lbl-${point.date}`}
                    style={{ fontSize: '10px', color: 'var(--color-muted, #64748b)' }}
                  >
                    {point.label}
                  </span>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default ChannelDailyTrendChart;

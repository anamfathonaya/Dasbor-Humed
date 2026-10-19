'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface DashboardWidget {
  id: string;
  title: string;
  type: 'ga4' | 'youtube' | 'social' | 'news' | 'projects';
  data: any;
  isLive: boolean;
  lastUpdated?: string;
}

interface GA4Metrics {
  totalUsers: number;
  totalSessions: number;
  totalPageviews: number;
  avgBounceRate: number;
}

interface YouTubeMetrics {
  subscriberCount: number;
  totalViewsCount: number;
  analyticsViews30d: number;
  analyticsWatchTimeMinutes30d: number;
}

export function DashboardView() {
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const [ga4Metrics, setGa4Metrics] = useState<GA4Metrics | null>(null);
  const [youtubeMetrics, setYoutubeMetrics] = useState<YouTubeMetrics | null>(null);

  useEffect(() => {
    if (isLiveMode) {
      loadLiveData();
    } else {
      setLoading(false);
    }
  }, [isLiveMode]);

  const loadLiveData = async () => {
    setLoading(true);
    try {
      // Load GA4 metrics
      const ga4Response = await fetch('/api/integrations/google-analytics/properties?includeMetrics=true');
      const ga4Data = await ga4Response.json();

      if (ga4Data.ok && ga4Data.properties.length > 0) {
        const firstProperty = ga4Data.properties[0];
        if (firstProperty.metrics) {
          setGa4Metrics(firstProperty.metrics);
        }
      }

      // Load YouTube metrics
      const ytResponse = await fetch('/api/channels/youtube/route');
      const ytData = await ytResponse.json();

      if (ytData.ok && ytData.channels.length > 0) {
        setYoutubeMetrics(ytData.channels[0]);
      }
    } catch (error) {
      console.error('Failed to load live data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'jt';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'rb';
    }
    return new Intl.NumberFormat('id-ID').format(num);
  };

  const getDemoGA4Metrics = (): GA4Metrics => ({
    totalUsers: 28500,
    totalSessions: 42000,
    totalPageviews: 156000,
    avgBounceRate: 42.3,
  });

  const getDemoYouTubeMetrics = (): YouTubeMetrics => ({
    subscriberCount: 185000,
    totalViewsCount: 14820400,
    analyticsViews30d: 521600,
    analyticsWatchTimeMinutes30d: 148900,
  });

  const activeGA4 = isLiveMode ? ga4Metrics : getDemoGA4Metrics();
  const activeYT = isLiveMode ? youtubeMetrics : getDemoYouTubeMetrics();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Live/Demo Toggle */}
      <div className="dasbor__bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p className="dasbor__bar-text" style={{ margin: 0 }}>
          <b>Mode Data:</b>{' '}
          {isLiveMode ? (
            <span style={{ color: '#10b981' }}>Live dari integrasi aktif</span>
          ) : (
            <span style={{ color: '#f59e0b' }}>Demonstrasi (contoh)</span>
          )}
        </p>
        <button
          type="button"
          className="dasbor__btn"
          onClick={() => setIsLiveMode(!isLiveMode)}
          style={{ gap: '0.5rem' }}
        >
          {/* @ts-ignore */}
          <iconify-icon icon={isLiveMode ? 'lucide:eye' : 'lucide:eye-off'} aria-hidden="true" />
          <span>{isLiveMode ? 'Tampilkan Demo' : 'Tampilkan Live'}</span>
        </button>
      </div>

      {/* Website Analytics (GA4) */}
      <section className="dasbor__card">
        <div className="dasbor__card-head">
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, margin: '0 0 0.25rem' }}>
              📊 Analitik Website (30 Hari)
            </h2>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-muted)' }}>
              {isLiveMode && !ga4Metrics ? 'Belum terhubung - ' : ''}
              Google Analytics 4
            </p>
          </div>
          <Link href="/pengaturan" className="dasbor__btn dasbor__btn--ghost">
            {/* @ts-ignore */}
            <iconify-icon icon="lucide:settings" aria-hidden="true" />
            <span>Kelola</span>
          </Link>
        </div>

        {loading && isLiveMode ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-muted)' }}>
            <div className="spinner">⏳</div>
            <p>Memuat data live...</p>
          </div>
        ) : (
          <>
            {isLiveMode && !ga4Metrics && (
              <div
                style={{
                  padding: '1rem',
                  background: 'rgba(245, 158, 11, 0.1)',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                }}
              >
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#f59e0b' }}>
                  ⚠️ Google Analytics belum terhubung. <Link href="/pengaturan" style={{ textDecoration: 'underline' }}>Hubungkan sekarang</Link>
                </p>
              </div>
            )}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
              }}
            >
              <div className="dasbor__kpi-card">
                <div className="dasbor__kpi-head">
                  <span>Pengguna</span>
                  {/* @ts-ignore */}
                  <iconify-icon icon="lucide:users" style={{ color: 'var(--color-muted)' }} />
                </div>
                <div className="dasbor__kpi-val">
                  {activeGA4 ? formatNumber(activeGA4.totalUsers) : '-'}
                </div>
              </div>

              <div className="dasbor__kpi-card">
                <div className="dasbor__kpi-head">
                  <span>Sesi</span>
                  {/* @ts-ignore */}
                  <iconify-icon icon="lucide:activity" style={{ color: 'var(--color-muted)' }} />
                </div>
                <div className="dasbor__kpi-val">
                  {activeGA4 ? formatNumber(activeGA4.totalSessions) : '-'}
                </div>
              </div>

              <div className="dasbor__kpi-card">
                <div className="dasbor__kpi-head">
                  <span>Tampilan Halaman</span>
                  {/* @ts-ignore */}
                  <iconify-icon icon="lucide:file-text" style={{ color: 'var(--color-muted)' }} />
                </div>
                <div className="dasbor__kpi-val">
                  {activeGA4 ? formatNumber(activeGA4.totalPageviews) : '-'}
                </div>
              </div>

              <div className="dasbor__kpi-card">
                <div className="dasbor__kpi-head">
                  <span>Bounce Rate</span>
                  {/* @ts-ignore */}
                  <iconify-icon icon="lucide:trending-down" style={{ color: 'var(--color-muted)' }} />
                </div>
                <div className="dasbor__kpi-val">
                  {activeGA4 ? `${activeGA4.avgBounceRate.toFixed(1)}%` : '-'}
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      {/* YouTube Performance */}
      <section className="dasbor__card">
        <div className="dasbor__card-head">
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, margin: '0 0 0.25rem' }}>
              📺 Performa YouTube (30 Hari)
            </h2>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-muted)' }}>
              {isLiveMode && !youtubeMetrics ? 'Belum terhubung - ' : ''}
              YouTube Data & Analytics API
            </p>
          </div>
          <Link href="/integrasi-youtube" className="dasbor__btn dasbor__btn--ghost">
            {/* @ts-ignore */}
            <iconify-icon icon="lucide:youtube" aria-hidden="true" />
            <span>Kelola</span>
          </Link>
        </div>

        {loading && isLiveMode ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-muted)' }}>
            <div className="spinner">⏳</div>
            <p>Memuat data live...</p>
          </div>
        ) : (
          <>
            {isLiveMode && !youtubeMetrics && (
              <div
                style={{
                  padding: '1rem',
                  background: 'rgba(245, 158, 11, 0.1)',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                }}
              >
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#f59e0b' }}>
                  ⚠️ YouTube belum terhubung. <Link href="/integrasi-youtube" style={{ textDecoration: 'underline' }}>Hubungkan sekarang</Link>
                </p>
              </div>
            )}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
              }}
            >
              <div className="dasbor__kpi-card">
                <div className="dasbor__kpi-head">
                  <span>Subscribers</span>
                  {/* @ts-ignore */}
                  <iconify-icon icon="lucide:users-2" style={{ color: 'var(--color-muted)' }} />
                </div>
                <div className="dasbor__kpi-val">
                  {activeYT ? formatNumber(activeYT.subscriberCount) : '-'}
                </div>
              </div>

              <div className="dasbor__kpi-card">
                <div className="dasbor__kpi-head">
                  <span>Total Views</span>
                  {/* @ts-ignore */}
                  <iconify-icon icon="lucide:eye" style={{ color: 'var(--color-muted)' }} />
                </div>
                <div className="dasbor__kpi-val">
                  {activeYT ? formatNumber(activeYT.totalViewsCount) : '-'}
                </div>
              </div>

              <div className="dasbor__kpi-card">
                <div className="dasbor__kpi-head">
                  <span>Views (30d)</span>
                  {/* @ts-ignore */}
                  <iconify-icon icon="lucide:bar-chart" style={{ color: 'var(--color-muted)' }} />
                </div>
                <div className="dasbor__kpi-val">
                  {activeYT ? formatNumber(activeYT.analyticsViews30d) : '-'}
                </div>
              </div>

              <div className="dasbor__kpi-card">
                <div className="dasbor__kpi-head">
                  <span>Watch Time (30d)</span>
                  {/* @ts-ignore */}
                  <iconify-icon icon="lucide:clock" style={{ color: 'var(--color-muted)' }} />
                </div>
                <div className="dasbor__kpi-val">
                  {activeYT ? `${formatNumber(activeYT.analyticsWatchTimeMinutes30d)} min` : '-'}
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Quick Actions */}
      <section className="dasbor__card">
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>⚡ Aksi Cepat</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          <Link href="/papan-proyek" className="dasbor__btn" style={{ justifyContent: 'flex-start' }}>
            {/* @ts-ignore */}
            <iconify-icon icon="lucide:kanban-square" aria-hidden="true" />
            <span>Papan Proyek</span>
          </Link>
          <Link href="/kalender-konten" className="dasbor__btn" style={{ justifyContent: 'flex-start' }}>
            {/* @ts-ignore */}
            <iconify-icon icon="lucide:calendar-days" aria-hidden="true" />
            <span>Kalender Konten</span>
          </Link>
          <Link href="/pantauan-berita" className="dasbor__btn" style={{ justifyContent: 'flex-start' }}>
            {/* @ts-ignore */}
            <iconify-icon icon="lucide:rss" aria-hidden="true" />
            <span>Pantauan Berita</span>
          </Link>
          <Link href="/basis-pengetahuan" className="dasbor__btn" style={{ justifyContent: 'flex-start' }}>
            {/* @ts-ignore */}
            <iconify-icon icon="lucide:library" aria-hidden="true" />
            <span>Basis Pengetahuan</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

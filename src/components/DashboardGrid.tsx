import React, { useState } from 'react';
import {
  QueryClient,
  QueryClientProvider,
  useQueries
} from '@tanstack/react-query';

// Inisialisasi QueryClient untuk Island
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Helper fetching ke internal BFF Route (/src/pages/api/metrics.ts)
async function fetchPlatformMetrics(platform: string) {
  const res = await fetch(`/api/metrics?platform=${platform}`);
  if (!res.ok) {
    throw new Error(`Gagal memuat data dari gateway ${platform}`);
  }
  return res.json();
}

/**
 * Komponen Skeleton Loading per Card
 */
function MetricCardSkeleton({ title }: { title: string }) {
  return (
    <article className="dasbor__card dasbor__kpi" style={{ opacity: 0.7 }}>
      <div className="dasbor__kpi-top">
        <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--color-border, #e2e8f0)', animation: 'pulse 1.5s infinite' }}></div>
        <span className="dasbor__badge" style={{ width: '45px', height: '16px', background: 'var(--color-border, #e2e8f0)' }}></span>
      </div>
      <div className="dasbor__kpi-label" style={{ color: 'var(--color-muted, #72747a)' }}>{title}</div>
      <div className="dasbor__kpi-row" style={{ marginTop: '8px' }}>
        <div style={{ width: '120px', height: '26px', borderRadius: '4px', background: 'var(--color-border, #e2e8f0)', animation: 'pulse 1.5s infinite' }}></div>
      </div>
    </article>
  );
}

/**
 * Konten Utama Grid menggunakan useQueries (Parallel Queries)
 */
function DashboardGridContent() {
  const [lastRefetchAll, setLastRefetchAll] = useState<string>('');

  /**
   * Strategi Caching:
   * 1. Data Iklan/Kritis (Meta & TikTok Ads): staleTime pendek (1-2 menit)
   * 2. Data Publik/Statis/Monitoring (X Followers, GSC, Telegram Feed, WA, RSS): staleTime menengah-panjang (5-15 menit)
   */
  const results = useQueries({
    queries: [
      {
        queryKey: ['metrics', 'meta'],
        queryFn: () => fetchPlatformMetrics('meta'),
        staleTime: 60 * 1000, // 1 menit (kritis: spend & ads insights)
        gcTime: 5 * 60 * 1000,
      },
      {
        queryKey: ['metrics', 'tiktok'],
        queryFn: () => fetchPlatformMetrics('tiktok'),
        staleTime: 2 * 60 * 1000, // 2 menit (kritis: ads & reach)
        gcTime: 10 * 60 * 1000,
      },
      {
        queryKey: ['metrics', 'telegram_feed'],
        queryFn: () => fetchPlatformMetrics('telegram_feed'),
        staleTime: 5 * 60 * 1000, // 5 menit (monitoring feed internal tim)
        gcTime: 15 * 60 * 1000,
      },
      {
        queryKey: ['metrics', 'x'],
        queryFn: () => fetchPlatformMetrics('x'),
        staleTime: 15 * 60 * 1000, // 15 menit (hemat rate limit X API v2)
        gcTime: 30 * 60 * 1000,
      },
      {
        queryKey: ['metrics', 'search_console'],
        queryFn: () => fetchPlatformMetrics('search_console'),
        staleTime: 15 * 60 * 1000, // 15 menit (Search Console)
        gcTime: 30 * 60 * 1000,
      },
      {
        queryKey: ['metrics', 'whatsapp'],
        queryFn: () => fetchPlatformMetrics('whatsapp'),
        staleTime: 10 * 60 * 1000, // 10 menit (WhatsApp Cloud API)
        gcTime: 20 * 60 * 1000,
      },
      {
        queryKey: ['metrics', 'rss_feed'],
        queryFn: () => fetchPlatformMetrics('rss_feed'),
        staleTime: 15 * 60 * 1000, // 15 menit (Google News & RSS)
        gcTime: 30 * 60 * 1000,
      },
    ],
  });

  const [metaQ, tiktokQ, teleFeedQ, xQ, gscQ, waQ, rssQ] = results;

  const handleManualRefetchCritical = () => {
    metaQ.refetch();
    tiktokQ.refetch();
    setLastRefetchAll(new Date().toLocaleTimeString('id-ID'));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
      {/* Toolbar Status Caching & Manual Refresh */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ fontSize: '12px', color: 'var(--color-muted, #5a6875)' }}>
          Status Multi-Platform: <b>Parallel Queries Aktif</b> • 
          {lastRefetchAll ? ` Refetch manual: ${lastRefetchAll}` : ' Caching adaptif (1-2 mnt iklan, 5-15 mnt feed/statis)'}
        </div>
        <button
          type="button"
          onClick={handleManualRefetchCritical}
          className="dasbor__btn dasbor__btn--primary"
          style={{ fontSize: '11px', padding: '5px 12px' }}
        >
          ⚡ Segarkan Metrik Iklan (Meta & TikTok)
        </button>
      </div>

      {/* Grid Kartu Agregasi Data */}
      <div className="dasbor__kpis" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {/* 1. Meta (Graph API & Ads) */}
        {metaQ.isLoading ? (
          <MetricCardSkeleton title="Meta Ads & Insights" />
        ) : metaQ.isError ? (
          <article className="dasbor__card dasbor__kpi"><p style={{ color: 'red', fontSize: '12px' }}>Gagal memuat Meta</p></article>
        ) : (
          <article className="dasbor__card dasbor__kpi">
            <div className="dasbor__kpi-top">
              <span className="dasbor__badge dasbor__badge--blue">Meta Graph API</span>
              <span className="dasbor__badge dasbor__badge--up">+{metaQ.data?.metrics?.engagementRate}% ER</span>
            </div>
            <div className="dasbor__kpi-label">Jangkauan & Belanja Iklan Meta</div>
            <div className="dasbor__kpi-row">
              <strong className="dasbor__kpi-value">{metaQ.data?.metrics?.reach?.toLocaleString('id-ID')}</strong>
              <span style={{ fontSize: '11px', color: '#72747a' }}>
                Spend: Rp {(metaQ.data?.metrics?.spend / 1_000_000).toFixed(1)} jt
              </span>
            </div>
          </article>
        )}

        {/* 2. TikTok API */}
        {tiktokQ.isLoading ? (
          <MetricCardSkeleton title="TikTok Display API" />
        ) : tiktokQ.isError ? (
          <article className="dasbor__card dasbor__kpi"><p style={{ color: 'red', fontSize: '12px' }}>Gagal memuat TikTok</p></article>
        ) : (
          <article className="dasbor__card dasbor__kpi">
            <div className="dasbor__kpi-top">
              <span className="dasbor__badge dasbor__badge--blue">TikTok Display API</span>
              <span className="dasbor__badge dasbor__badge--up">Active</span>
            </div>
            <div className="dasbor__kpi-label">Followers & Likes TikTok</div>
            <div className="dasbor__kpi-row">
              <strong className="dasbor__kpi-value">{tiktokQ.data?.metrics?.follower_count?.toLocaleString('id-ID')}</strong>
              <span style={{ fontSize: '11px', color: '#72747a' }}>
                {(tiktokQ.data?.metrics?.likes_count / 1_000_000).toFixed(1)}M Suka
              </span>
            </div>
          </article>
        )}

        {/* 3. Telegram Channel Live Feed (Monitoring Internal) */}
        {teleFeedQ.isLoading ? (
          <MetricCardSkeleton title="Telegram Channel Live Feed" />
        ) : teleFeedQ.isError ? (
          <article className="dasbor__card dasbor__kpi"><p style={{ color: 'red', fontSize: '12px' }}>Gagal memuat Telegram</p></article>
        ) : (
          <article className="dasbor__card dasbor__kpi">
            <div className="dasbor__kpi-top">
              <span className="dasbor__badge dasbor__badge--blue">Telegram Feed</span>
              <span className="dasbor__badge dasbor__badge--flat">5m Cache</span>
            </div>
            <div className="dasbor__kpi-label">Monitoring {teleFeedQ.data?.channel}</div>
            <div className="dasbor__kpi-row">
              <strong className="dasbor__kpi-value">{teleFeedQ.data?.membersCount?.toLocaleString('id-ID')}</strong>
              <span style={{ fontSize: '11px', color: '#72747a' }}>
                {teleFeedQ.data?.feedMessages ? `${teleFeedQ.data.feedMessages.length} Warta Siaga` : 'Tersinkron'}
              </span>
            </div>
          </article>
        )}

        {/* 4. X API v2 */}
        {xQ.isLoading ? (
          <MetricCardSkeleton title="X API v2 (Twitter)" />
        ) : xQ.isError ? (
          <article className="dasbor__card dasbor__kpi"><p style={{ color: 'red', fontSize: '12px' }}>Gagal memuat X</p></article>
        ) : (
          <article className="dasbor__card dasbor__kpi">
            <div className="dasbor__kpi-top">
              <span className="dasbor__badge dasbor__badge--blue">X API v2</span>
              <span className="dasbor__badge dasbor__badge--flat">15m Cache</span>
            </div>
            <div className="dasbor__kpi-label">Pengikut Publik (@{xQ.data?.metrics?.username})</div>
            <div className="dasbor__kpi-row">
              <strong className="dasbor__kpi-value">{xQ.data?.metrics?.followers_count?.toLocaleString('id-ID')}</strong>
              <span style={{ fontSize: '11px', color: '#72747a' }}>
                {xQ.data?.metrics?.tweet_count} Cuitan
              </span>
            </div>
          </article>
        )}

        {/* 5. Google Search Console */}
        {gscQ.isLoading ? (
          <MetricCardSkeleton title="Google Search Console" />
        ) : gscQ.isError ? (
          <article className="dasbor__card dasbor__kpi"><p style={{ color: 'red', fontSize: '12px' }}>Gagal memuat GSC</p></article>
        ) : (
          <article className="dasbor__card dasbor__kpi">
            <div className="dasbor__kpi-top">
              <span className="dasbor__badge dasbor__badge--green">Search Console</span>
              <span className="dasbor__badge dasbor__badge--up">{gscQ.data?.metrics?.ctr}% CTR</span>
            </div>
            <div className="dasbor__kpi-label">Klik Penelusuran Organik Web</div>
            <div className="dasbor__kpi-row">
              <strong className="dasbor__kpi-value">{gscQ.data?.metrics?.clicks?.toLocaleString('id-ID')}</strong>
              <span style={{ fontSize: '11px', color: '#72747a' }}>
                Posisi rata-rata: {gscQ.data?.metrics?.averagePosition}
              </span>
            </div>
          </article>
        )}

        {/* 6. WhatsApp Cloud API */}
        {waQ.isLoading ? (
          <MetricCardSkeleton title="WhatsApp Cloud API" />
        ) : waQ.isError ? (
          <article className="dasbor__card dasbor__kpi"><p style={{ color: 'red', fontSize: '12px' }}>Gagal memuat WhatsApp</p></article>
        ) : (
          <article className="dasbor__card dasbor__kpi">
            <div className="dasbor__kpi-top">
              <span className="dasbor__badge dasbor__badge--green">WhatsApp Cloud</span>
              <span className="dasbor__badge dasbor__badge--up">{waQ.data?.metrics?.messageOpenRate}% Buka</span>
            </div>
            <div className="dasbor__kpi-label">Pelanggan Siaran WhatsApp</div>
            <div className="dasbor__kpi-row">
              <strong className="dasbor__kpi-value">{waQ.data?.metrics?.broadcastListSubscribers?.toLocaleString('id-ID')}</strong>
              <span style={{ fontSize: '11px', color: '#72747a' }}>
                {waQ.data?.metrics?.inquiryCount} Pesan masuk
              </span>
            </div>
          </article>
        )}

        {/* 7. RSS / Google News Feed */}
        {rssQ.isLoading ? (
          <MetricCardSkeleton title="RSS & Google News" />
        ) : rssQ.isError ? (
          <article className="dasbor__card dasbor__kpi"><p style={{ color: 'red', fontSize: '12px' }}>Gagal memuat RSS</p></article>
        ) : (
          <article className="dasbor__card dasbor__kpi">
            <div className="dasbor__kpi-top">
              <span className="dasbor__badge dasbor__badge--blue">Google News & RSS</span>
              <span className="dasbor__badge dasbor__badge--flat">15m Cache</span>
            </div>
            <div className="dasbor__kpi-label">Kabar Berita Publik Terkurasi</div>
            <div className="dasbor__kpi-row">
              <strong className="dasbor__kpi-value">{rssQ.data?.items?.length || 2} Isu Utama</strong>
              <span style={{ fontSize: '11px', color: '#72747a' }}>
                XML Feed Terhubung
              </span>
            </div>
          </article>
        )}
      </div>
    </div>
  );
}

/**
 * Root Component pembungkus Provider untuk Island di Astro
 */
export default function DashboardGrid() {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardGridContent />
    </QueryClientProvider>
  );
}

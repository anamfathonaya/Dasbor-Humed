'use client';

import React, { useState, useEffect } from 'react';
import { HumasShell } from '@/components/layout/HumasShell';
import { useLayout } from '@/components/layout/LayoutContext';

interface YouTubeChannel {
  id: number;
  channelTitle: string;
  customUrl: string;
  avatarUrl?: string;
  subscriberCount: number;
  totalViewsCount: number;
  videoCount: number;
  analyticsViews30d: number;
  analyticsWatchTimeMinutes30d: number;
  analyticsEngagements30d: number;
  oauthStatus: 'connected' | 'expiring_soon' | 'expired' | 'disconnected';
  lastSyncedAt?: string;
}

export default function IntegrasiYouTubePage() {
  const { currentRole, hasAccess } = useLayout();
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [channels, setChannels] = useState<YouTubeChannel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const canManage = hasAccess(['head', 'admin']);

  useEffect(() => {
    loadChannels();

    // Check for OAuth callback result
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const errorParam = params.get('error');
    const message = params.get('message');

    if (success === 'youtube_connected') {
      setSuccessMessage('YouTube channel berhasil terhubung!');
      // Clear URL params
      window.history.replaceState({}, '', '/integrasi-youtube');
    } else if (errorParam) {
      setError(message || `OAuth error: ${errorParam}`);
      window.history.replaceState({}, '', '/integrasi-youtube');
    }
  }, []);

  const loadChannels = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/channels/youtube/route');
      const data = await response.json();

      if (data.ok) {
        setChannels(data.channels || []);
      } else {
        setError(data.error || 'Failed to load channels');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/channels/youtube/oauth/start');
      const data = await response.json();

      if (data.ok && data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        setError(data.error || 'Failed to initiate OAuth');
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      setError(null);

      const response = await fetch('/api/channels/youtube/sync', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.ok) {
        await loadChannels();
        setSuccessMessage('Metrics synced successfully!');
      } else {
        setError(data.error || 'Sync failed');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSyncing(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Belum pernah';
    return new Date(dateStr).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  if (!canManage) {
    return (
      <HumasShell
        pageTitle="Penghubung YouTube"
        pageSubtitle="Integrasi YouTube Data API v3 & Analytics API"
      >
        <div className="dasbor__card" style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔒</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#b91c1c', margin: '0 0 0.5rem' }}>
            Akses Terbatas
          </h2>
          <p style={{ color: 'var(--color-muted)' }}>
            Hanya Admin dan Kepala Humas yang dapat mengelola integrasi YouTube.
          </p>
        </div>
      </HumasShell>
    );
  }

  return (
    <HumasShell
      pageTitle="Penghubung YouTube"
      pageSubtitle="YouTube Data API v3 & Analytics API · Kanal resmi Komnas Palestina"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {successMessage && (
          <div
            className="dasbor__card"
            style={{
              padding: '1rem',
              background: 'rgba(16, 185, 129, 0.1)',
              borderColor: '#10b981',
            }}
          >
            <p style={{ margin: 0, color: '#10b981', fontSize: '0.875rem' }}>✓ {successMessage}</p>
          </div>
        )}

        {error && (
          <div
            className="dasbor__card"
            style={{
              padding: '1rem',
              background: 'rgba(239, 68, 68, 0.1)',
              borderColor: '#ef4444',
            }}
          >
            <p style={{ margin: 0, color: '#ef4444', fontSize: '0.875rem' }}>{error}</p>
          </div>
        )}

        {loading && channels.length === 0 ? (
          <div className="dasbor__card" style={{ padding: '2rem', textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem' }}>⏳</div>
            <p style={{ color: 'var(--color-muted)' }}>Memuat kanal YouTube...</p>
          </div>
        ) : channels.length === 0 ? (
          <div className="dasbor__card" style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📺</div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: '0 0 0.5rem' }}>
              YouTube Belum Terhubung
            </h3>
            <p style={{ color: 'var(--color-muted)', marginBottom: '1.5rem', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
              Hubungkan kanal YouTube resmi untuk memantau subscriber, views, watch time, dan engagement analytics.
            </p>
            <button
              type="button"
              className="dasbor__btn dasbor__btn--primary"
              onClick={handleConnect}
              disabled={loading}
            >
              {loading ? 'Menginisialisasi...' : '🔗 Hubungkan YouTube Channel'}
            </button>
          </div>
        ) : (
          <>
            <div className="dasbor__card">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem',
                }}
              >
                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>
                  Kanal Terhubung
                </h3>
                <button
                  type="button"
                  className="dasbor__btn"
                  onClick={handleSync}
                  disabled={syncing}
                >
                  {/* @ts-ignore */}
                  <iconify-icon icon="lucide:refresh-cw" aria-hidden="true" />
                  <span>{syncing ? 'Menarik Analytics...' : 'Tarik Analytics'}</span>
                </button>
              </div>

              {channels.map((channel) => (
                <div
                  key={channel.id}
                  className="dasbor__card"
                  style={{
                    padding: '1rem',
                    background: 'var(--color-surface-sunken)',
                    marginBottom: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    {channel.avatarUrl && (
                      <img
                        src={channel.avatarUrl}
                        alt={channel.channelTitle}
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '1px solid var(--color-border)',
                        }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, margin: '0 0 0.25rem' }}>
                        {channel.channelTitle}
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-muted)' }}>
                        youtube.com/{channel.customUrl || channel.channelTitle}
                      </p>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', marginTop: '0.5rem' }}>
                        Sinkronisasi terakhir: {formatDate(channel.lastSyncedAt)}
                      </div>
                    </div>
                    <span
                      className="dasbor__badge"
                      style={{
                        background: channel.oauthStatus === 'connected' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                        color: channel.oauthStatus === 'connected' ? '#10b981' : '#f59e0b',
                        borderColor: channel.oauthStatus === 'connected' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)',
                      }}
                    >
                      {channel.oauthStatus === 'connected' ? 'Aktif' : 'Terputus'}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                      gap: '0.75rem',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: '0.25rem' }}>
                        Subscribers
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                        {formatNumber(channel.subscriberCount)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: '0.25rem' }}>
                        Total Views
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                        {formatNumber(channel.totalViewsCount)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: '0.25rem' }}>
                        Videos
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                        {formatNumber(channel.videoCount)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: '0.25rem' }}>
                        Views (30d)
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                        {formatNumber(channel.analyticsViews30d)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: '0.25rem' }}>
                        Watch Time (30d)
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                        {formatNumber(channel.analyticsWatchTimeMinutes30d)} min
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: '0.25rem' }}>
                        Engagements (30d)
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                        {formatNumber(channel.analyticsEngagements30d)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="dasbor__card" style={{ padding: '1rem' }}>
              <button
                type="button"
                className="dasbor__btn"
                onClick={handleConnect}
                disabled={loading}
              >
                {/* @ts-ignore */}
                <iconify-icon icon="lucide:plus" aria-hidden="true" />
                <span>Tambah Kanal Lain</span>
              </button>
            </div>
          </>
        )}
      </div>
    </HumasShell>
  );
}

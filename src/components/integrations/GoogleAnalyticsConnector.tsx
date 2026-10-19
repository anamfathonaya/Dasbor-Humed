'use client';

import React, { useState, useEffect } from 'react';
import { useLayout } from '@/components/layout/LayoutContext';

interface GA4Property {
  id: number;
  propertyName: string;
  websiteUrl?: string;
  accountName?: string;
  oauthStatus: 'connected' | 'expired' | 'disconnected';
  lastSyncedAt?: string;
  syncEnabled: boolean;
  metrics?: {
    totalUsers: number;
    totalSessions: number;
    totalPageviews: number;
    avgBounceRate: number;
  };
}

export function GoogleAnalyticsConnector() {
  const { currentRole, hasAccess } = useLayout();
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [properties, setProperties] = useState<GA4Property[]>([]);
  const [error, setError] = useState<string | null>(null);

  const canManage = hasAccess(['head', 'admin']);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/integrations/google-analytics/properties?includeMetrics=true');
      const data = await response.json();

      if (data.ok) {
        setProperties(data.properties || []);
      } else {
        setError(data.error || 'Failed to load properties');
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

      const response = await fetch('/api/integrations/google-analytics/start');
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

      const response = await fetch('/api/integrations/google-analytics/sync', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.ok) {
        await loadProperties();
        alert('Metrics synced successfully!');
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

  if (loading && properties.length === 0) {
    return (
      <div className="dasbor__card" style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 1rem' }}>⏳</div>
        <p style={{ color: 'var(--color-muted)' }}>Memuat properti Google Analytics...</p>
      </div>
    );
  }

  if (!canManage) {
    return (
      <div className="dasbor__card" style={{ padding: '2rem' }}>
        <p style={{ color: 'var(--color-muted)' }}>
          Hanya Admin dan Kepala Humas yang dapat mengelola integrasi Google Analytics.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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

      {properties.length === 0 ? (
        <div className="dasbor__card" style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: '0 0 0.5rem' }}>
            Google Analytics 4 Belum Terhubung
          </h3>
          <p style={{ color: 'var(--color-muted)', marginBottom: '1.5rem', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
            Hubungkan properti GA4 Anda untuk memantau trafik website, perilaku pengguna, dan performa konten secara real-time.
          </p>
          <button
            type="button"
            className="dasbor__btn dasbor__btn--primary"
            onClick={handleConnect}
            disabled={loading}
          >
            {loading ? 'Menginisialisasi...' : '🔗 Hubungkan Google Analytics'}
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
                Properti Terhubung
              </h3>
              <button
                type="button"
                className="dasbor__btn"
                onClick={handleSync}
                disabled={syncing}
              >
                {/* @ts-ignore */}
                <iconify-icon icon="lucide:refresh-cw" aria-hidden="true" />
                <span>{syncing ? 'Menarik Metrik...' : 'Tarik Metrik'}</span>
              </button>
            </div>

            {properties.map((property) => (
              <div
                key={property.id}
                className="dasbor__card"
                style={{
                  padding: '1rem',
                  background: 'var(--color-surface-sunken)',
                  marginBottom: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                  <div>
                    <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, margin: '0 0 0.25rem' }}>
                      {property.propertyName}
                    </h4>
                    {property.websiteUrl && (
                      <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-muted)' }}>
                        {property.websiteUrl}
                      </p>
                    )}
                  </div>
                  <span
                    className="dasbor__badge"
                    style={{
                      background: property.oauthStatus === 'connected' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                      color: property.oauthStatus === 'connected' ? '#10b981' : '#f59e0b',
                      borderColor: property.oauthStatus === 'connected' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)',
                    }}
                  >
                    {property.oauthStatus === 'connected' ? 'Aktif' : 'Terputus'}
                  </span>
                </div>

                <div style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', marginBottom: '1rem' }}>
                  Sinkronisasi terakhir: {formatDate(property.lastSyncedAt)}
                </div>

                {property.metrics && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                      gap: '0.75rem',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: '0.25rem' }}>
                        Pengguna (30h)
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)' }}>
                        {formatNumber(property.metrics.totalUsers)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: '0.25rem' }}>
                        Sesi
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)' }}>
                        {formatNumber(property.metrics.totalSessions)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: '0.25rem' }}>
                        Tampilan Halaman
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)' }}>
                        {formatNumber(property.metrics.totalPageviews)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: '0.25rem' }}>
                        Bounce Rate
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)' }}>
                        {property.metrics.avgBounceRate.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                )}
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
              <span>Tambah Properti Lain</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

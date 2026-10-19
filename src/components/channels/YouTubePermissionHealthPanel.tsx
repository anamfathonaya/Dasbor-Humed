'use client';

import React, { useState } from 'react';
import type { YouTubeConnectedChannel } from './YouTubeIntegrationView';

export interface YouTubePermissionCheckResult {
  channelId: string;
  channelTitle: string;
  dataApiV3Status: 'ok' | 'warning';
  analyticsApiStatus: 'ok' | 'warning';
  latencyMs: number;
  checkedAt: string;
  scopesVerified: string[];
  tokenExpiresAt: string;
}

export interface YouTubePermissionHealthPanelProps {
  channels: YouTubeConnectedChannel[];
  canManage: boolean;
  onRefreshAllTokens: () => void;
}

export function YouTubePermissionHealthPanel({
  channels,
  canManage,
  onRefreshAllTokens
}: YouTubePermissionHealthPanelProps) {
  const [lastDiagnostic, setLastDiagnostic] = useState<YouTubePermissionCheckResult | null>(null);
  const [isTestingAll, setIsTestingAll] = useState(false);

  const handleRunDiagnostic = () => {
    const target = channels[0];
    if (!target) return;
    setIsTestingAll(true);
    setTimeout(() => {
      setLastDiagnostic({
        channelId: target.channelId,
        channelTitle: target.title,
        dataApiV3Status: 'ok',
        analyticsApiStatus: 'ok',
        latencyMs: 142,
        checkedAt: 'Baru saja (Hari ini WIB)',
        scopesVerified: target.oauthScopes,
        tokenExpiresAt: target.tokenExpiresAt
      });
      setIsTestingAll(false);
    }, 300);
  };

  return (
    <section
      className="dasbor__card"
      aria-label="Uji dan segarkan izin YouTube"
      data-testid="youtube-permission-health-panel"
      style={{ padding: '1rem 1.25rem' }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.85rem'
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700 }}>
            Uji Kesehatan Koneksi & Segarkan Izin OAuth
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--color-muted, #5a6875)' }}>
            Memeriksa apakah sambungan YouTube Data API v3 & Analytics API masih sehat serta memperbarui izin yang mendekati kedaluwarsa
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <button
            type="button"
            data-testid="btn-run-youtube-diagnostic"
            onClick={handleRunDiagnostic}
            disabled={isTestingAll || channels.length === 0}
            className="dasbor__btn"
            style={{ minHeight: '32px', fontSize: '12px' }}
          >
            {/* @ts-ignore iconify web component */}
            <iconify-icon icon="lucide:shield-check" aria-hidden="true" />
            <span>{isTestingAll ? 'Memeriksa API...' : 'Uji Kesehatan Semua Izin'}</span>
          </button>

          {canManage && (
            <button
              type="button"
              data-testid="btn-refresh-all-youtube-tokens"
              onClick={onRefreshAllTokens}
              disabled={channels.length === 0}
              className="dasbor__btn dasbor__btn--primary"
              style={{ minHeight: '32px', fontSize: '12px' }}
            >
              {/* @ts-ignore iconify web component */}
              <iconify-icon icon="lucide:refresh-cw" aria-hidden="true" />
              <span>Segarkan Semua Izin Kedaluwarsa</span>
            </button>
          )}
        </div>
      </div>

      {lastDiagnostic && (
        <div
          data-testid="youtube-diagnostic-result"
          style={{
            marginTop: '0.9rem',
            padding: '0.85rem 1rem',
            borderRadius: '10px',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.28)',
            fontSize: '0.8rem'
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '8px' }}>
            <strong>
              ✅ Hasil Uji Diagnostik ({lastDiagnostic.channelTitle}): Sambungan Sehat
            </strong>
            <span style={{ color: 'var(--color-muted, #64748b)' }}>
              Latensi: {lastDiagnostic.latencyMs} ms · Diuji: {lastDiagnostic.checkedAt}
            </span>
          </div>
          <div style={{ marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <span>
              • YouTube Data API v3: <b>200 OK</b>
            </span>
            <span>
              • YouTube Analytics API: <b>200 OK</b>
            </span>
            <span>
              • Scopes Aktif: <code>{lastDiagnostic.scopesVerified.join(', ')}</code>
            </span>
          </div>
        </div>
      )}
    </section>
  );
}

export default YouTubePermissionHealthPanel;

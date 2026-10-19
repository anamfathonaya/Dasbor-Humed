'use client';

import React from 'react';
import type { YouTubeConnectedChannel } from './YouTubeIntegrationView';
import { YouTubeEmptyStateCard } from './YouTubeEmptyStateCard';

export interface YouTubeConnectedChannelsListProps {
  channels: YouTubeConnectedChannel[];
  canManage: boolean;
  testingChannelId: string | null;
  refreshingChannelId: string | null;
  onTestConnection: (id: string) => void;
  onRefreshToken: (id: string) => void;
  onRequestDisconnect: (channel: YouTubeConnectedChannel) => void;
  onConnectOAuth?: () => void;
  onRestoreSampleChannels?: () => void;
  onSimulateEmptyState?: () => void;
}

export function YouTubeConnectedChannelsList({
  channels,
  canManage,
  testingChannelId,
  refreshingChannelId,
  onTestConnection,
  onRefreshToken,
  onRequestDisconnect,
  onConnectOAuth = () => {},
  onRestoreSampleChannels,
  onSimulateEmptyState
}: YouTubeConnectedChannelsListProps) {
  return (
    <section
      className="dasbor__card"
      aria-label="Daftar kanal YouTube terhubung"
      data-testid="youtube-connected-list"
    >
      <div
        className="dasbor__card-head"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem'
        }}
      >
        <div>
          <h2>Daftar Kanal YouTube Terhubung ({channels.length})</h2>
          <p>
            Melihat kanal YouTube mana saja yang sudah tersambung beserta status kesehatan, masa berlaku izin, dan cakupan OAuth
          </p>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {channels.length > 0 && onSimulateEmptyState && (
            <button
              type="button"
              data-testid="btn-simulate-youtube-empty"
              onClick={onSimulateEmptyState}
              className="dasbor__mini-btn"
              style={{ fontSize: '11px', cursor: 'pointer' }}
            >
              Pratinjau Status Kosong
            </button>
          )}
          {channels.length === 0 && onRestoreSampleChannels && (
            <button
              type="button"
              data-testid="btn-restore-youtube-samples"
              onClick={onRestoreSampleChannels}
              className="dasbor__mini-btn"
              style={{ fontSize: '11px', cursor: 'pointer' }}
            >
              Tampilkan Kanal Contoh
            </button>
          )}
        </div>
      </div>

      {channels.length === 0 ? (
        <YouTubeEmptyStateCard
          canManage={canManage}
          onConnectOAuth={onConnectOAuth}
          onRestoreSampleChannels={onRestoreSampleChannels}
        />
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            marginTop: '0.75rem'
          }}
        >
          {channels.map((ch) => (
            <article
              key={ch.id}
              data-testid={`youtube-channel-item-${ch.id}`}
              style={{
                padding: '1.1rem',
                borderRadius: '10px',
                border: '1px solid var(--color-border, #e2e8f0)',
                background: 'var(--color-bg-subtle, #f8fafc)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '1rem'
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      flexWrap: 'wrap'
                    }}
                  >
                    <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 700 }}>
                      {ch.title}
                    </h3>
                    <span style={{ fontSize: '0.82rem', color: 'var(--color-muted, #64748b)' }}>
                      ({ch.handle} · ID: <code>{ch.channelId}</code>)
                    </span>
                    <span
                      className={`dasbor__badge ${
                        ch.status === 'connected' ? 'dasbor__badge--up' : 'dasbor__badge--down'
                      }`}
                      style={{ fontSize: '11px' }}
                    >
                      {ch.status === 'connected'
                        ? 'Sehat & Tersambung'
                        : 'Izin Segera Kedaluwarsa'}
                    </span>
                  </div>

                  <p
                    style={{
                      margin: '6px 0 0',
                      fontSize: '0.82rem',
                      color: 'var(--color-text, #16202b)'
                    }}
                  >
                    {ch.lastCheckMessage}
                  </p>
                </div>

                {/* Tombol Aksi Uji, Segarkan Izin, & Putuskan Sambungan */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <button
                    type="button"
                    data-testid={`btn-test-youtube-${ch.id}`}
                    onClick={() => onTestConnection(ch.id)}
                    disabled={testingChannelId === ch.id}
                    className="dasbor__btn"
                    style={{ minHeight: '32px', fontSize: '12px' }}
                  >
                    {/* @ts-ignore iconify web component */}
                    <iconify-icon icon="lucide:activity" aria-hidden="true" />
                    <span>{testingChannelId === ch.id ? 'Menguji...' : 'Uji Sambungan'}</span>
                  </button>

                  {canManage && (
                    <>
                      <button
                        type="button"
                        data-testid={`btn-refresh-youtube-${ch.id}`}
                        onClick={() => onRefreshToken(ch.id)}
                        disabled={refreshingChannelId === ch.id}
                        className="dasbor__btn dasbor__btn--primary"
                        style={{ minHeight: '32px', fontSize: '12px' }}
                      >
                        {/* @ts-ignore iconify web component */}
                        <iconify-icon icon="lucide:refresh-cw" aria-hidden="true" />
                        <span>
                          {refreshingChannelId === ch.id
                            ? 'Menyegarkan...'
                            : 'Segarkan Izin OAuth'}
                        </span>
                      </button>

                      <button
                        type="button"
                        data-testid={`btn-disconnect-youtube-${ch.id}`}
                        onClick={() => onRequestDisconnect(ch)}
                        className="dasbor__btn"
                        style={{
                          minHeight: '32px',
                          fontSize: '12px',
                          color: '#b91c1c',
                          borderColor: 'rgba(185, 28, 28, 0.3)'
                        }}
                      >
                        {/* @ts-ignore iconify web component */}
                        <iconify-icon icon="lucide:unlink" aria-hidden="true" />
                        <span>Putuskan Sambungan</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Detail Metrik Dasar & Masa Berlaku Token */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                  gap: '0.75rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--color-border, #e2e8f0)',
                  fontSize: '0.78rem'
                }}
              >
                <div>
                  <span style={{ color: 'var(--color-muted, #64748b)', display: 'block' }}>
                    Pelanggan (Subscribers)
                  </span>
                  <strong>{ch.subscribersCount.toLocaleString('id-ID')}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-muted, #64748b)', display: 'block' }}>
                    Tayangan 30 Hari
                  </span>
                  <strong>{ch.viewsCount.toLocaleString('id-ID')}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-muted, #64748b)', display: 'block' }}>
                    Masa Berlaku Izin OAuth
                  </span>
                  <strong>{ch.tokenExpiresAt}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-muted, #64748b)', display: 'block' }}>
                    Sinkron & Uji Terakhir
                  </span>
                  <strong>{ch.lastHealthCheck}</strong>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default YouTubeConnectedChannelsList;

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLayout } from '@/components/layout/LayoutContext';
import { YouTubeOAuthConnectFlow } from './YouTubeOAuthConnectFlow';
import { YouTubeConnectedChannelsList } from './YouTubeConnectedChannelsList';
import { YouTubePermissionHealthPanel } from './YouTubePermissionHealthPanel';
import { YouTubeDisconnectDialog } from './YouTubeDisconnectDialog';
import { ChannelAdminActionGate } from './ChannelAdminActionGate';

export interface YouTubeConnectedChannel {
  id: string;
  channelId: string;
  title: string;
  handle: string;
  subscribersCount: number;
  viewsCount: number;
  videosCount: number;
  status: 'connected' | 'token_expiring' | 'expired' | 'disconnected';
  oauthScopes: string[];
  tokenExpiresAt: string;
  lastSyncedAt: string;
  lastHealthCheck: string;
  lastCheckMessage: string;
}

export const INITIAL_YOUTUBE_CHANNELS: YouTubeConnectedChannel[] = [
  {
    id: 'yt-01',
    channelId: 'UC_PeduliNegeriTV_01',
    title: 'Peduli Negeri TV (Kanal Utama)',
    handle: '@PeduliNegeriTV',
    subscribersCount: 185000,
    viewsCount: 682900,
    videosCount: 342,
    status: 'connected',
    oauthScopes: [
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/yt-analytics.readonly'
    ],
    tokenExpiresAt: '2026-11-18 08:35 WIB (29 hari lagi)',
    lastSyncedAt: 'Hari ini, 08:35 WIB',
    lastHealthCheck: 'Hari ini, 08:35 WIB',
    lastCheckMessage: 'YouTube Data API v3 & Analytics API merespons normal (200 OK).'
  },
  {
    id: 'yt-02',
    channelId: 'UC_PeduliNegeriRelawan_02',
    title: 'Dokumentasi Relawan & Edukasi Bencana',
    handle: '@RelawanPeduliNegeri',
    subscribersCount: 24600,
    viewsCount: 118400,
    videosCount: 96,
    status: 'token_expiring',
    oauthScopes: [
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/yt-analytics.readonly'
    ],
    tokenExpiresAt: '2026-10-21 18:00 WIB (2 hari lagi)',
    lastSyncedAt: 'Hari ini, 06:00 WIB',
    lastHealthCheck: 'Hari ini, 08:00 WIB',
    lastCheckMessage: 'Peringatan: Izin OAuth mendekati kedaluwarsa, disarankan segarkan izin.'
  }
];

export function YouTubeIntegrationView() {
  const { currentRole, setRole } = useLayout();
  const isAdminOrHead = currentRole === 'admin' || currentRole === 'head';

  const [channels, setChannels] = useState<YouTubeConnectedChannel[]>(INITIAL_YOUTUBE_CHANNELS);
  const [isConnecting, setIsConnecting] = useState(false);
  const [testingChannelId, setTestingChannelId] = useState<string | null>(null);
  const [refreshingChannelId, setRefreshingChannelId] = useState<string | null>(null);
  const [disconnectModalChannel, setDisconnectModalChannel] = useState<YouTubeConnectedChannel | null>(null);
  const [bannerMessage, setBannerMessage] = useState<{
    type: 'success' | 'warning' | 'info';
    text: string;
  } | null>(null);

  const handleOAuthConnect = () => {
    if (!isAdminOrHead) return;
    setIsConnecting(true);
    setTimeout(() => {
      const exists = channels.some((c) => c.channelId === 'UC_PeduliNegeriLive_03');
      if (!exists) {
        const newChan: YouTubeConnectedChannel = {
          id: `yt-0${channels.length + 1}`,
          channelId: 'UC_PeduliNegeriLive_03',
          title: 'Siaran Pers & Liputan Lapangan Peduli Negeri',
          handle: '@LiputanPeduliNegeri',
          subscribersCount: 14200,
          viewsCount: 54900,
          videosCount: 48,
          status: 'connected',
          oauthScopes: [
            'https://www.googleapis.com/auth/youtube.readonly',
            'https://www.googleapis.com/auth/yt-analytics.readonly'
          ],
          tokenExpiresAt: '2026-12-19 09:00 WIB (60 hari lagi)',
          lastSyncedAt: 'Baru saja (Hari ini WIB)',
          lastHealthCheck: 'Baru saja (Hari ini WIB)',
          lastCheckMessage: 'Otorisasi OAuth 2.0 berhasil. Kredensial disimpan terenkripsi di server.'
        };
        setChannels((prev) => [...prev, newChan]);
      }
      setIsConnecting(false);
      setBannerMessage({
        type: 'success',
        text: 'Kanal resmi YouTube berhasil dihubungkan via OAuth 2.0 (Hanya-Baca: youtube.readonly & yt-analytics.readonly).'
      });
    }, 450);
  };

  const handleTestConnection = (id: string) => {
    setTestingChannelId(id);
    setTimeout(() => {
      setChannels((prev) =>
        prev.map((ch) =>
          ch.id === id
            ? {
                ...ch,
                lastHealthCheck: 'Baru saja (Hari ini WIB)',
                lastCheckMessage:
                  'Uji koneksi berhasil: YouTube Data API v3 (channels.list) & Analytics API (reports.query) aktif.'
              }
            : ch
        )
      );
      setTestingChannelId(null);
      setBannerMessage({
        type: 'info',
        text: 'Pengujian koneksi API YouTube selesai: Respons 200 OK.'
      });
    }, 350);
  };

  const handleRefreshToken = (id: string) => {
    if (!isAdminOrHead) return;
    setRefreshingChannelId(id);
    setTimeout(() => {
      setChannels((prev) =>
        prev.map((ch) =>
          ch.id === id
            ? {
                ...ch,
                status: 'connected',
                tokenExpiresAt: '2026-12-19 08:45 WIB (Diperpanjang 60 hari)',
                lastHealthCheck: 'Baru saja (Hari ini WIB)',
                lastCheckMessage: 'Refresh token OAuth berhasil diperbarui dan disimpan di server.'
              }
            : ch
        )
      );
      setRefreshingChannelId(null);
      setBannerMessage({
        type: 'success',
        text: 'Izin akses OAuth YouTube berhasil disegarkan untuk 60 hari ke depan.'
      });
    }, 400);
  };

  const handleConfirmDisconnect = () => {
    if (!disconnectModalChannel || !isAdminOrHead) return;
    const removedTitle = disconnectModalChannel.title;
    setChannels((prev) => prev.filter((c) => c.id !== disconnectModalChannel.id));
    setDisconnectModalChannel(null);
    setBannerMessage({
      type: 'warning',
      text: `Sambungan kanal "${removedTitle}" telah diputuskan dengan aman dan token dicabut dari server.`
    });
  };

  return (
    <div className="dasbor" data-testid="youtube-integration-page">
      {/* Banner Informasi OAuth Read-Only */}
      <section className="dasbor__bar" aria-label="Informasi penghubung YouTube">
        <div className="dasbor__bar-text">
          <b>Penghubung Resmi YouTube (OAuth 2.0):</b> Membaca profil kanal & metrik harian lewat{' '}
          <code>YouTube Data API v3</code> dan <code>YouTube Analytics API</code> secara{' '}
          <b>hanya-baca (read-only)</b> tanpa membagikan kata sandi dan tanpa fitur upload/penerbitan otomatis.
        </div>
        <div className="dasbor__bar-actions">
          <Link className="dasbor__btn" href="/pemantauan-kanal">
            {/* @ts-ignore iconify web component */}
            <iconify-icon icon="lucide:radio" aria-hidden="true" />
            <span>Halaman Pemantauan Kanal</span>
          </Link>
        </div>
      </section>

      {/* Kontrol Hak Akses Pengelolaan Integrasi (Sembunyikan Aksi dari Non-Admin) */}
      <ChannelAdminActionGate
        currentRole={currentRole}
        onChangeRole={setRole}
      />

      {/* Komponen Tombol Sambung YouTube beserta Status Alurnya */}
      <YouTubeOAuthConnectFlow
        canManage={isAdminOrHead}
        onConnected={handleOAuthConnect}
      />

      {/* Umpan Balik Aksi */}
      {bannerMessage && (
        <div
          role="status"
          data-testid="youtube-action-feedback"
          style={{
            padding: '0.85rem 1.1rem',
            borderRadius: '10px',
            background:
              bannerMessage.type === 'success'
                ? 'rgba(16, 185, 129, 0.1)'
                : bannerMessage.type === 'warning'
                ? 'rgba(245, 158, 11, 0.12)'
                : 'rgba(59, 130, 246, 0.1)',
            border: '1px solid var(--color-border, #cbd5e1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            fontSize: '0.85rem',
            fontWeight: 500
          }}
        >
          <span>{bannerMessage.text}</span>
          <button
            type="button"
            onClick={() => setBannerMessage(null)}
            className="dasbor__mini-btn"
            style={{ fontSize: '11px' }}
          >
            Tutup
          </button>
        </div>
      )}

      {/* Ringkasan Cakupan Izin & Keamanan Kredensial */}
      <div className="dasbor__analytics-grid">
        <article className="dasbor__card dasbor__kpi">
          <div className="dasbor__kpi-top">
            <span className="dasbor__kpi-label">Kanal YouTube Terhubung</span>
            <span className="dasbor__badge dasbor__badge--up">Aktif</span>
          </div>
          <div className="dasbor__kpi-row" style={{ marginTop: '6px' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 700 }}>{channels.length} Kanal</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-muted, #64748b)', margin: '4px 0 0' }}>
            Terhubung ke modul pemantauan & penarikan terjadwal
          </p>
        </article>

        <article className="dasbor__card dasbor__kpi">
          <div className="dasbor__kpi-top">
            <span className="dasbor__kpi-label">Cakupan Izin OAuth 2.0</span>
            <span className="dasbor__badge dasbor__badge--flat">Hanya-Baca</span>
          </div>
          <div className="dasbor__kpi-row" style={{ marginTop: '6px' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 700 }}>
              youtube.readonly & yt-analytics.readonly
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-muted, #64748b)', margin: '4px 0 0' }}>
            Tanpa izin unggah video/Shorts atau manajemen komentar
          </p>
        </article>

        <article className="dasbor__card dasbor__kpi">
          <div className="dasbor__kpi-top">
            <span className="dasbor__kpi-label">Penyimpanan Kredensial</span>
            <span className="dasbor__badge dasbor__badge--up">Terenkripsi Server</span>
          </div>
          <div className="dasbor__kpi-row" style={{ marginTop: '6px' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 700 }}>
              Token Tidak Pernah Tampil di Klien
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-muted, #64748b)', margin: '4px 0 0' }}>
            Tercatat otomatis pada Jejak Audit Sistem
          </p>
        </article>
      </div>

      {/* Daftar Kanal YouTube Terhubung */}
      <YouTubeConnectedChannelsList
        channels={channels}
        canManage={isAdminOrHead}
        testingChannelId={testingChannelId}
        refreshingChannelId={refreshingChannelId}
        onTestConnection={handleTestConnection}
        onRefreshToken={handleRefreshToken}
        onRequestDisconnect={(ch) => setDisconnectModalChannel(ch)}
        onConnectOAuth={handleOAuthConnect}
        onRestoreSampleChannels={() => setChannels(INITIAL_YOUTUBE_CHANNELS)}
        onSimulateEmptyState={() => setChannels([])}
      />

      {/* Panel Uji & Segarkan Izin Tiruan */}
      <YouTubePermissionHealthPanel
        channels={channels}
        canManage={isAdminOrHead}
        onRefreshAllTokens={() => {
          setChannels((prev) =>
            prev.map((ch) => ({
              ...ch,
              status: 'connected',
              tokenExpiresAt: '2026-12-19 09:00 WIB (Diperpanjang 60 hari)',
              lastHealthCheck: 'Baru saja (Hari ini WIB)',
              lastCheckMessage: 'Seluruh izin OAuth YouTube telah disegarkan dan sehat.'
            }))
          );
          setBannerMessage({
            type: 'success',
            text: 'Seluruh izin OAuth kanal YouTube berhasil disegarkan.'
          });
        }}
      />

      {/* Dialog Konfirmasi Putuskan Sambungan */}
      <YouTubeDisconnectDialog
        channel={disconnectModalChannel}
        onCancel={() => setDisconnectModalChannel(null)}
        onConfirm={handleConfirmDisconnect}
      />
    </div>
  );
}

export default YouTubeIntegrationView;

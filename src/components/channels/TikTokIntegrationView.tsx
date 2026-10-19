'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLayout } from '@/components/layout/LayoutContext';
import { TikTokOAuthModal } from './TikTokOAuthModal';

export interface TikTokConnectedAccount {
  id: string;
  openId: string;
  unionId: string;
  displayName: string;
  handle: string;
  avatarUrl: string;
  followersCount: number;
  likesCount: number;
  videoCount: number;
  reach30d: number;
  views30d: number;
  engagementRate: number;
  status: 'connected' | 'token_expiring' | 'disconnected';
  tokenExpiresAt: string;
  lastSyncedAt: string;
  lastHealthCheckAt: string;
  grantedScopes: string[];
  disallowedAttemptDetected: boolean;
}

export const INITIAL_TIKTOK_ACCOUNTS: TikTokConnectedAccount[] = [
  {
    id: 'tt-acc-01',
    openId: '_000vK8xQy9ZmP_KemensosHumas',
    unionId: 'uid_kemensos_peduli_negeri_01',
    displayName: 'Aksi Peduli Negeri Humas',
    handle: '@aksipedulinegeri',
    avatarUrl: 'https://ui-avatars.com/api/?name=APN&background=00f2fe&color=000',
    followersCount: 89000,
    likesCount: 1420000,
    videoCount: 215,
    reach30d: 890000,
    views30d: 1340500,
    engagementRate: 10.59,
    status: 'token_expiring',
    tokenExpiresAt: '2026-10-22 19:00 WIB (3 hari lagi)',
    lastSyncedAt: 'Kemarin, 19:00 WIB',
    lastHealthCheckAt: 'Hari ini, 06:00 WIB (200 OK — 184ms)',
    grantedScopes: ['user.info.basic', 'video.list'],
    disallowedAttemptDetected: false
  },
  {
    id: 'tt-acc-02',
    openId: '_000aB2xLy8WnQ_PusdatinOfficial',
    unionId: 'uid_pusdatin_kesos_official_02',
    displayName: 'Pusdatin Kesos Edukasi',
    handle: '@pusdatinkesos_id',
    avatarUrl: 'https://ui-avatars.com/api/?name=PK&background=38bdf8&color=000',
    followersCount: 42300,
    likesCount: 685000,
    videoCount: 94,
    reach30d: 412000,
    views30d: 598000,
    engagementRate: 7.82,
    status: 'connected',
    tokenExpiresAt: '2026-11-20 12:00 WIB (32 hari lagi)',
    lastSyncedAt: 'Hari ini, 06:00 WIB',
    lastHealthCheckAt: 'Hari ini, 06:00 WIB (200 OK — 156ms)',
    grantedScopes: ['user.info.basic', 'video.list'],
    disallowedAttemptDetected: false
  }
];

export function TikTokIntegrationView() {
  const { currentRole } = useLayout();
  const isAdminOrHead = currentRole === 'admin' || currentRole === 'head';

  const [accounts, setAccounts] = useState<TikTokConnectedAccount[]>(INITIAL_TIKTOK_ACCOUNTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'connected' | 'token_expiring' | 'disconnected'>('all');
  const [bannerNotice, setBannerNotice] = useState<{ type: 'success' | 'warning' | 'info'; text: string } | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [pullingId, setPullingId] = useState<string | null>(null);
  const [isOAuthModalOpen, setIsOAuthModalOpen] = useState(false);

  const filteredAccounts = accounts.filter((acc) => {
    const matchSearch =
      acc.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.handle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || acc.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handlePullMetrics = (id: string) => {
    setPullingId(id);
    const target = accounts.find((a) => a.id === id);
    setTimeout(() => {
      // Simulate pulled metrics updates
      const newViews = (target?.views30d || 0) + Math.floor(Math.random() * 5000 + 1200);
      const newReach = (target?.reach30d || 0) + Math.floor(Math.random() * 3000 + 800);
      const newLikes = (target?.likesCount || 0) + Math.floor(Math.random() * 800 + 150);

      setAccounts((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                views30d: newViews,
                reach30d: newReach,
                likesCount: newLikes,
                lastSyncedAt: 'Baru saja (Display API Sync)'
              }
            : a
        )
      );
      setPullingId(null);
      setBannerNotice({
        type: 'success',
        text: `Metrik TikTok untuk akun ${target?.displayName || ''} berhasil ditarik: ${newViews.toLocaleString('id-ID')} tayangan, ${newLikes.toLocaleString('id-ID')} interaksi suka/komentar.`
      });
    }, 600);
  };

  const handleTestHealth = (id: string) => {
    setTestingId(id);
    const target = accounts.find((a) => a.id === id);
    setTimeout(() => {
      setAccounts((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                lastHealthCheckAt: 'Baru saja (200 OK — Respons 148ms)'
              }
            : a
        )
      );
      setTestingId(null);
      setBannerNotice({
        type: 'success',
        text: `Uji kesehatan Display API akun TikTok ${target?.displayName || ''} berhasil (200 OK — 148ms).`
      });
    }, 450);
  };

  const handleRefreshToken = (id: string) => {
    const target = accounts.find((a) => a.id === id);
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: 'connected',
              tokenExpiresAt: '2026-12-19 12:00 WIB (60 hari lagi)',
              lastHealthCheckAt: 'Baru saja (200 OK — Token Segar)'
            }
          : a
      )
    );
    setBannerNotice({
      type: 'success',
      text: `Token TikTok Display API untuk ${target?.displayName} berhasil diperbarui (Masa aktif s/d 60 hari).`
    });
  };

  const handleDisconnect = (id: string) => {
    const target = accounts.find((a) => a.id === id);
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: 'disconnected',
              tokenExpiresAt: 'Terputus (Kredensial Dihapus)'
            }
          : a
      )
    );
    setBannerNotice({
      type: 'warning',
      text: `Sambungan akun TikTok ${target?.displayName} telah diputuskan. Token dihapus dari server.`
    });
  };

  return (
    <div className="dasbor" data-testid="tiktok-integration-view">
      {/* Banner Pemberitahuan Aksi */}
      {bannerNotice && (
        <div
          role="status"
          className={`dasbor__banner dasbor__banner--${bannerNotice.type}`}
          data-testid="tiktok-banner-notice"
          style={{ marginBottom: '1rem' }}
        >
          <span>{bannerNotice.text}</span>
          <button
            type="button"
            className="dasbor__banner-close"
            onClick={() => setBannerNotice(null)}
            aria-label="Tutup pemberitahuan"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Halaman Penghubung TikTok */}
      <section className="dasbor__card" style={{ marginBottom: '1.25rem' }}>
        <div className="dasbor__card-head" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <p className="dasbor__eyebrow">Penghubung Platform Resmi</p>
            <h1 className="dasbor__card-title" style={{ fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '1.85rem',
                  height: '1.85rem',
                  borderRadius: '0.4rem',
                  background: '#00f2fe22',
                  color: '#00f2fe',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}
              >
                TT
              </span>
              Penghubung TikTok (Display API)
            </h1>
            <p className="dasbor__muted" style={{ fontSize: '0.86rem', marginTop: '0.2rem' }}>
              Otorisasi hanya-baca (Read-Only) akun resmi TikTok via TikTok Display API (v2) untuk agregasi tayangan video dan interaksi humas.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Link href="/status-integrasi" className="dasbor__btn" data-testid="link-back-to-status">
              Lihat Status Semua Kanal
            </Link>
            {isAdminOrHead && (
              <>
                <button
                  type="button"
                  className="dasbor__btn"
                  onClick={() => {
                    const connected = accounts.find((a) => a.status === 'connected');
                    if (connected) {
                      handlePullMetrics(connected.id);
                    }
                  }}
                  disabled={pullingId !== null}
                  data-testid="btn-pull-all-tiktok-metrics"
                  style={{ background: 'rgba(0, 242, 254, 0.1)', borderColor: '#00f2fe', color: '#00f2fe' }}
                >
                  {pullingId ? '⏳ Menarik Metrik...' : '⚡ Tarik Metrik TikTok'}
                </button>
                <button
                  type="button"
                  className="dasbor__btn dasbor__btn--primary"
                  onClick={() => setIsOAuthModalOpen(true)}
                  data-testid="btn-connect-tiktok-oauth"
                >
                  + Sambungkan Akun TikTok
                </button>
              </>
            )}
          </div>
        </div>

        {/* Batasan Tegas Kebijakan TikTok Display API */}
        <div
          data-testid="tiktok-read-only-banner"
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            background: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.65rem'
          }}
        >
          <span style={{ fontSize: '1.15rem' }}>🔒</span>
          <div style={{ fontSize: '0.78rem' }}>
            <strong style={{ color: '#38bdf8' }}>Batasan Keamanan &amp; Integritas Data (Hanya-Baca):</strong>
            <p className="dasbor__muted" style={{ margin: '0.2rem 0 0' }}>
              Integrasi ini menggunakan <strong>TikTok Display API</strong> resmi dengan cakupan <code>user.info.basic</code> dan <code>video.list</code>.
              Sistem <strong>menolak tegas</strong> Content Posting API (tanpa penerbitan video/stories/draft) dan <strong>tanpa TikTok Research API</strong>. Seluruh proses unggah video dilakukan manual oleh tim humas di aplikasi TikTok.
            </p>
          </div>
        </div>

        {/* Kartu Metrik Dasar TikTok */}
        <div
          data-testid="tiktok-basic-metrics-cards"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '1rem',
            marginTop: '1rem'
          }}
        >
          <div
            className="dasbor__card"
            style={{
              padding: '0.85rem 1rem',
              borderRadius: '0.5rem',
              background: 'var(--color-surface-muted, #1e293b)',
              border: '1px solid var(--color-border, #334155)',
              margin: 0
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="dasbor__muted" style={{ fontSize: '0.76rem' }}>Akun &amp; Video Terpantau</span>
              <span style={{ fontSize: '0.72rem', color: '#00f2fe' }}>Display API v2</span>
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, marginTop: '0.2rem' }}>
              {accounts.length} Akun · {accounts.reduce((sum, a) => sum + a.videoCount, 0)} Video
            </div>
            <div className="dasbor__muted" style={{ fontSize: '0.72rem', marginTop: '0.15rem' }}>
              Cakupan: <code>video.list</code> publik
            </div>
          </div>

          <div
            className="dasbor__card"
            style={{
              padding: '0.85rem 1rem',
              borderRadius: '0.5rem',
              background: 'var(--color-surface-muted, #1e293b)',
              border: '1px solid var(--color-border, #334155)',
              margin: 0
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="dasbor__muted" style={{ fontSize: '0.76rem' }}>Total Pengikut TikTok</span>
              <span className="dasbor__badge dasbor__badge--up" style={{ fontSize: '0.68rem' }}>+4.8%</span>
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, marginTop: '0.2rem' }}>
              {accounts.reduce((sum, a) => sum + a.followersCount, 0).toLocaleString('id-ID')}
            </div>
            <div className="dasbor__muted" style={{ fontSize: '0.72rem', marginTop: '0.15rem' }}>
              Total pemirsa akun resmi
            </div>
          </div>

          <div
            className="dasbor__card"
            style={{
              padding: '0.85rem 1rem',
              borderRadius: '0.5rem',
              background: 'var(--color-surface-muted, #1e293b)',
              border: '1px solid var(--color-border, #334155)',
              margin: 0
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="dasbor__muted" style={{ fontSize: '0.76rem' }}>Total Tayangan Video (30h)</span>
              <span style={{ fontSize: '0.72rem', color: '#86efac' }}>Tayangan Organik</span>
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, marginTop: '0.2rem', color: '#38bdf8' }}>
              {accounts.reduce((sum, a) => sum + a.views30d, 0).toLocaleString('id-ID')}
            </div>
            <div className="dasbor__muted" style={{ fontSize: '0.72rem', marginTop: '0.15rem' }}>
              Jangkauan: {accounts.reduce((sum, a) => sum + a.reach30d, 0).toLocaleString('id-ID')} akun
            </div>
          </div>

          <div
            className="dasbor__card"
            style={{
              padding: '0.85rem 1rem',
              borderRadius: '0.5rem',
              background: 'var(--color-surface-muted, #1e293b)',
              border: '1px solid var(--color-border, #334155)',
              margin: 0
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="dasbor__muted" style={{ fontSize: '0.76rem' }}>Interaksi Suka &amp; ER</span>
              <span className="dasbor__badge dasbor__badge--up" style={{ fontSize: '0.68rem' }}>Tinggi</span>
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, marginTop: '0.2rem' }}>
              ❤️ {accounts.reduce((sum, a) => sum + a.likesCount, 0).toLocaleString('id-ID')}
            </div>
            <div className="dasbor__muted" style={{ fontSize: '0.72rem', marginTop: '0.15rem' }}>
              Rata-rata Tingkat Interaksi (ER): 9.2%
            </div>
          </div>
        </div>
      </section>

      {/* Filter dan Tabel Akun TikTok */}
      <section className="dasbor__card">
        <div className="dasbor__card-head" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 className="dasbor__card-title" style={{ fontSize: '1.15rem' }}>
              Daftar Akun Resmi TikTok Tersambung
            </h2>
            <span className="dasbor__muted" style={{ fontSize: '0.8rem' }}>
              {filteredAccounts.length} dari {accounts.length} akun ditampilkan
            </span>
          </div>

          {/* Baris Pencarian & Filter Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Cari nama akun atau @handle..."
              className="dasbor__input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '220px', padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
              data-testid="input-search-tiktok"
            />
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              {(['all', 'connected', 'token_expiring', 'disconnected'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`dasbor__btn ${statusFilter === tab ? 'dasbor__btn--primary' : ''}`}
                  style={{ padding: '0.3rem 0.6rem', fontSize: '0.76rem' }}
                  onClick={() => setStatusFilter(tab)}
                  data-testid={`filter-status-${tab}`}
                >
                  {tab === 'all'
                    ? 'Semua'
                    : tab === 'connected'
                    ? 'Tersambung'
                    : tab === 'token_expiring'
                    ? 'Perlu Perhatian'
                    : 'Terputus'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Legenda Status Sambungan Akun TikTok */}
        <div
          data-testid="tiktok-status-legend"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '1rem',
            padding: '0.65rem 0.85rem',
            marginBottom: '0.85rem',
            borderRadius: '0.45rem',
            background: 'var(--color-surface-muted, #1e293b)',
            border: '1px solid var(--color-border, #334155)',
            fontSize: '0.78rem'
          }}
        >
          <span style={{ fontWeight: 600, color: 'var(--color-muted, #94a3b8)' }}>
            Legenda Status TikTok:
          </span>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }} data-testid="tiktok-legend-connected">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
            <strong style={{ color: '#22c55e' }}>Tersambung Normal (Hijau)</strong>
            <span className="dasbor__muted">— Token Display API aktif, penarikan metrik video lancar.</span>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }} data-testid="tiktok-legend-expiring">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
            <strong style={{ color: '#f59e0b' }}>Segera Berakhir (Kuning)</strong>
            <span className="dasbor__muted">— Masa berlaku sisa &le; 7 hari, perlu penyegaran token.</span>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }} data-testid="tiktok-legend-disconnected">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
            <strong style={{ color: '#ef4444' }}>Terputus (Merah)</strong>
            <span className="dasbor__muted">— Kredensial kedaluwarsa atau diputus oleh admin.</span>
          </div>
        </div>

        {/* Indikator Peringatan Token Kedaluwarsa / Segera Berakhir */}
        {accounts.some((a) => a.status === 'token_expiring' || a.status === 'disconnected') && (
          <div
            data-testid="tiktok-token-expiration-indicator-banner"
            style={{
              padding: '0.85rem 1rem',
              marginBottom: '1rem',
              borderRadius: '0.5rem',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              flexWrap: 'wrap'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span style={{ fontSize: '1.25rem' }}>⚠️</span>
              <div>
                <strong style={{ color: '#f59e0b', fontSize: '0.85rem' }}>
                  Perhatian: Terdapat Izin Akun TikTok yang Memerlukan Penyegaran / Perbaruan
                </strong>
                <p className="dasbor__muted" style={{ fontSize: '0.76rem', margin: '0.15rem 0 0' }}>
                  Token TikTok Display API berlaku 60 hari. Akun dengan token segera berakhir atau terputus harus segera diperbarui agar penarikan metrik video tidak terhenti.
                </p>
              </div>
            </div>
            {isAdminOrHead && (
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {accounts
                  .filter((a) => a.status === 'token_expiring')
                  .map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      className="dasbor__btn dasbor__btn--primary"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.76rem' }}
                      onClick={() => handleRefreshToken(acc.id)}
                      data-testid={`banner-btn-refresh-token-${acc.id}`}
                    >
                      🔄 Perbarui Izin {acc.displayName}
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Tabel Akun TikTok */}
        <div style={{ overflowX: 'auto', marginTop: '0.75rem' }}>
          <table className="dasbor__table" data-testid="tiktok-accounts-table">
            <thead>
              <tr>
                <th>Akun &amp; OpenID</th>
                <th>Pengikut</th>
                <th>Tayangan (30h)</th>
                <th>Suka &amp; Interaksi</th>
                <th>Status Izin</th>
                <th>Sinkron Terakhir</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.length === 0 ? (
                <tr data-testid="tiktok-empty-state">
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>🔍</div>
                    <div style={{ fontWeight: 600, fontSize: '0.92rem', marginBottom: '0.25rem' }}>
                      Tidak Ada Akun TikTok yang Cocok
                    </div>
                    <p className="dasbor__muted" style={{ fontSize: '0.8rem', maxWidth: '380px', margin: '0 auto 0.75rem' }}>
                      Tidak ditemukan akun TikTok resmi yang sesuai kriteria pencarian "{searchQuery}".
                    </p>
                    <button
                      type="button"
                      className="dasbor__btn"
                      style={{ padding: '0.3rem 0.75rem', fontSize: '0.78rem' }}
                      onClick={() => {
                        setSearchQuery('');
                        setStatusFilter('all');
                      }}
                    >
                      Reset Filter
                    </button>
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((acc) => (
                  <tr key={acc.id} data-testid={`tiktok-account-row-${acc.id}`}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '2.2rem',
                            height: '2.2rem',
                            borderRadius: '0.45rem',
                            background: '#00f2fe22',
                            color: '#00f2fe',
                            fontWeight: 700,
                            fontSize: '0.8rem'
                          }}
                        >
                          TT
                        </span>
                        <div>
                          <strong style={{ fontSize: '0.88rem' }}>{acc.displayName}</strong>
                          <div className="dasbor__muted" style={{ fontSize: '0.74rem' }}>
                            {acc.handle} · OpenID: <span style={{ fontFamily: 'monospace' }}>{acc.openId.substring(0, 12)}...</span>
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#00f2fe', marginTop: '0.1rem' }}>
                            🎥 {acc.videoCount} Video Publik Terpantau
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <strong style={{ fontSize: '0.86rem' }}>
                        {acc.followersCount.toLocaleString('id-ID')}
                      </strong>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.86rem', fontWeight: 600 }}>
                        {acc.views30d.toLocaleString('id-ID')}
                      </div>
                      <span className="dasbor__muted" style={{ fontSize: '0.72rem' }}>
                        Jangkauan: {acc.reach30d.toLocaleString('id-ID')}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.86rem' }}>
                        ❤️ {acc.likesCount.toLocaleString('id-ID')}
                      </div>
                      <span className="dasbor__badge dasbor__badge--up" style={{ fontSize: '0.7rem', marginTop: '0.15rem' }}>
                        ER {acc.engagementRate}%
                      </span>
                    </td>
                    <td>
                      {acc.status === 'connected' ? (
                        <span className="dasbor__badge dasbor__badge--up" data-testid={`tiktok-status-${acc.id}`}>
                          ● Tersambung
                        </span>
                      ) : acc.status === 'token_expiring' ? (
                        <span className="dasbor__badge dasbor__badge--warn" data-testid={`tiktok-status-${acc.id}`}>
                          ▲ Segera Berakhir
                        </span>
                      ) : (
                        <span className="dasbor__badge dasbor__badge--down" data-testid={`tiktok-status-${acc.id}`}>
                          ✕ Terputus
                        </span>
                      )}
                      <div className="dasbor__muted" style={{ fontSize: '0.72rem', marginTop: '0.15rem' }}>
                        {acc.tokenExpiresAt}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.78rem' }}>
                      <div>{acc.lastSyncedAt}</div>
                      <div className="dasbor__muted" style={{ fontSize: '0.72rem' }}>
                        Uji: {acc.lastHealthCheckAt}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {isAdminOrHead ? (
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          <button
                            type="button"
                            className="dasbor__btn"
                            style={{ padding: '0.25rem 0.55rem', fontSize: '0.74rem', background: 'rgba(0, 242, 254, 0.1)', color: '#00f2fe', borderColor: '#00f2fe' }}
                            disabled={pullingId === acc.id || acc.status === 'disconnected'}
                            onClick={() => handlePullMetrics(acc.id)}
                            data-testid={`btn-pull-metrics-tiktok-${acc.id}`}
                          >
                            {pullingId === acc.id ? 'Menarik...' : 'Tarik Metrik'}
                          </button>
                          <button
                            type="button"
                            className="dasbor__btn"
                            style={{ padding: '0.25rem 0.55rem', fontSize: '0.74rem' }}
                            disabled={testingId === acc.id}
                            onClick={() => handleTestHealth(acc.id)}
                            data-testid={`btn-test-tiktok-${acc.id}`}
                          >
                            {testingId === acc.id ? 'Menguji...' : 'Uji Koneksi'}
                          </button>
                          {acc.status === 'token_expiring' && (
                            <button
                              type="button"
                              className="dasbor__btn dasbor__btn--primary"
                              style={{ padding: '0.25rem 0.55rem', fontSize: '0.74rem' }}
                              onClick={() => handleRefreshToken(acc.id)}
                              data-testid={`btn-refresh-tiktok-${acc.id}`}
                            >
                              Segarkan Token
                            </button>
                          )}
                          <button
                            type="button"
                            className="dasbor__btn"
                            style={{ padding: '0.25rem 0.55rem', fontSize: '0.74rem', color: '#ef4444' }}
                            onClick={() => handleDisconnect(acc.id)}
                            data-testid={`btn-disconnect-tiktok-${acc.id}`}
                          >
                            Putus
                          </button>
                        </div>
                      ) : (
                        <span className="dasbor__muted" style={{ fontSize: '0.74rem', fontStyle: 'italic' }}>
                          Hanya-baca
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal Alur Izin OAuth TikTok Display API */}
      <TikTokOAuthModal
        isOpen={isOAuthModalOpen}
        onClose={() => setIsOAuthModalOpen(false)}
        onSuccess={(newAcc) => {
          setAccounts((prev) => [newAcc, ...prev]);
          setBannerNotice({
            type: 'success',
            text: `Akun TikTok "${newAcc.displayName}" (${newAcc.handle}) berhasil dihubungkan via TikTok Display API (v2).`
          });
        }}
      />
    </div>
  );
}

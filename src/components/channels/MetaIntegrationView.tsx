'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLayout } from '@/components/layout/LayoutContext';

import { ChannelAdminActionGate } from './ChannelAdminActionGate';
import { InstagramOAuthModal } from './InstagramOAuthModal';
import { FacebookOAuthModal } from './FacebookOAuthModal';

export interface MetaAccountItem {
  id: string;
  platform: 'instagram' | 'facebook';
  name: string;
  handle: string;
  accountType: 'Instagram Business / Creator' | 'Facebook Page Resmi';
  followersCount: number;
  reach30d: number;
  engagementRate: number;
  status: 'connected' | 'token_expiring' | 'disconnected';
  tokenExpiresAt: string;
  lastSyncedAt: string;
  grantedScopes: string[];
}

export const SAMPLE_META_ACCOUNTS: MetaAccountItem[] = [
  {
    id: 'meta-ig-01',
    platform: 'instagram',
    name: 'Instagram Resmi Kemensos RI',
    handle: '@kemensosri',
    accountType: 'Instagram Business / Creator',
    followersCount: 524000,
    reach30d: 1845000,
    engagementRate: 4.82,
    status: 'connected',
    tokenExpiresAt: '2026-12-18 10:00 WIB (59 hari lagi)',
    lastSyncedAt: 'Hari ini, 06:00 WIB',
    grantedScopes: [
      'instagram_basic',
      'instagram_manage_insights',
      'pages_show_list',
      'pages_read_engagement'
    ]
  },
  {
    id: 'meta-fb-01',
    platform: 'facebook',
    name: 'Kementerian Sosial Republik Indonesia',
    handle: 'KemensosRI',
    accountType: 'Facebook Page Resmi',
    followersCount: 890000,
    reach30d: 2120000,
    engagementRate: 3.45,
    status: 'connected',
    tokenExpiresAt: '2026-11-25 15:30 WIB (36 hari lagi)',
    lastSyncedAt: 'Hari ini, 06:00 WIB',
    grantedScopes: [
      'pages_show_list',
      'pages_read_engagement',
      'read_insights'
    ]
  },
  {
    id: 'meta-ig-02',
    platform: 'instagram',
    name: 'Pusat Data dan Informasi Kesejahteraan Sosial (Pusdatin Kesos)',
    handle: '@pusdatinkesos',
    accountType: 'Instagram Business / Creator',
    followersCount: 89200,
    reach30d: 312000,
    engagementRate: 5.14,
    status: 'token_expiring',
    tokenExpiresAt: '2026-10-22 18:00 WIB (3 hari lagi)',
    lastSyncedAt: 'Kemarin, 18:00 WIB',
    grantedScopes: [
      'instagram_basic',
      'instagram_manage_insights'
    ]
  }
];

export interface MetaAuditEntry {
  id: string;
  action: 'OAUTH_CONNECT' | 'TOKEN_REFRESH' | 'HEALTH_CHECK' | 'DISCONNECT';
  platform: 'instagram' | 'facebook';
  accountName: string;
  userRole: string;
  userName: string;
  timestamp: string;
  status: 'success' | 'warning' | 'failed';
  details: string;
}

export const SAMPLE_META_AUDIT_LOGS: MetaAuditEntry[] = [
  {
    id: 'audit-meta-01',
    action: 'TOKEN_REFRESH',
    platform: 'instagram',
    accountName: 'Pusat Data dan Informasi Kesejahteraan Sosial (@pusdatinkesos)',
    userRole: 'admin',
    userName: 'Admin Humas Kemensos',
    timestamp: '19 Okt 2026, 07:15 WIB',
    status: 'success',
    details: 'Penyegaran Long-Lived User Access Token Instagram Graph API berhasil. Masa berlaku diperpanjang 60 hari.'
  },
  {
    id: 'audit-meta-02',
    action: 'OAUTH_CONNECT',
    platform: 'facebook',
    accountName: 'Kementerian Sosial Republik Indonesia (KemensosRI)',
    userRole: 'admin',
    userName: 'Admin Humas Kemensos',
    timestamp: '18 Okt 2026, 14:20 WIB',
    status: 'success',
    details: 'Penyambungan resmi Facebook Page via OAuth 2.0 (scopes: pages_show_list, pages_read_engagement, read_insights).'
  },
  {
    id: 'audit-meta-03',
    action: 'DISCONNECT',
    platform: 'instagram',
    accountName: 'Akun Kampanye Sementara (@bansos_tanggap2025)',
    userRole: 'admin',
    userName: 'Kepala Bidang Humas',
    timestamp: '15 Okt 2026, 11:00 WIB',
    status: 'warning',
    details: 'Pemutusan sambungan kanal Instagram pasca program kampanye berakhir. Token akses dihapus aman dari server.'
  },
  {
    id: 'audit-meta-04',
    action: 'HEALTH_CHECK',
    platform: 'instagram',
    accountName: 'Instagram Resmi Kemensos RI (@kemensosri)',
    userRole: 'system',
    userName: 'Sistem Scheduler',
    timestamp: '19 Okt 2026, 06:00 WIB',
    status: 'success',
    details: 'Pemeriksaan kesehatan token dan endpoint profil Instagram mengembalikan HTTP 200 OK (Latency: 142ms).'
  }
];

export function MetaIntegrationView() {
  const { currentRole, setRole } = useLayout();
  const isAdminOrHead = currentRole === 'admin' || currentRole === 'head';

  const [accounts, setAccounts] = useState<MetaAccountItem[]>(SAMPLE_META_ACCOUNTS);
  const [platformFilter, setPlatformFilter] = useState<'all' | 'instagram' | 'facebook'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [testingId, setTestingId] = useState<string | null>(null);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [isIgModalOpen, setIsIgModalOpen] = useState(false);
  const [isFbModalOpen, setIsFbModalOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState<MetaAuditEntry[]>(SAMPLE_META_AUDIT_LOGS);
  const [bannerNotice, setBannerNotice] = useState<{ type: 'success' | 'info' | 'warning'; text: string } | null>(null);

  const filteredAccounts = accounts.filter((acc) => {
    if (platformFilter !== 'all' && acc.platform !== platformFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = acc.name.toLowerCase().includes(q);
      const matchHandle = acc.handle.toLowerCase().includes(q);
      if (!matchName && !matchHandle) return false;
    }
    return true;
  });

  const handleTestConnection = (id: string) => {
    setTestingId(id);
    setTimeout(() => {
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === id
            ? {
                ...acc,
                status: 'connected',
                lastSyncedAt: 'Baru saja (Hari ini WIB)'
              }
            : acc
        )
      );
      setTestingId(null);
      setBannerNotice({
        type: 'success',
        text: 'Pemeriksaan kesehatan koneksi Meta Graph API berhasil (200 OK — Izin Hanya-Baca Aktif).'
      });
    }, 450);
  };

  const handleRefreshToken = (id: string) => {
    setRefreshingId(id);
    setTimeout(() => {
      // Hitung tanggal 60 hari ke depan
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 60);
      const formattedDate = `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, '0')}-${String(futureDate.getDate()).padStart(2, '0')} 12:00 WIB (60 hari lagi)`;

      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id !== id) return acc;
          return {
            ...acc,
            status: 'connected',
            tokenExpiresAt: formattedDate,
            lastSyncedAt: 'Baru saja (Diperbarui)'
          };
        })
      );
      setRefreshingId(null);
      setBannerNotice({
        type: 'success',
        text: 'Izin akses token Meta berhasil diperbarui! Masa berlaku diperpanjang 60 hari ke depan.'
      });
    }, 500);
  };

  return (
    <div className="dasbor" data-testid="meta-accounts-main-view">
      {/* Kontrol Hak Akses Peran Admin / Staf */}
      <div style={{ marginBottom: '1.25rem' }}>
        <ChannelAdminActionGate currentRole={currentRole} onChangeRole={setRole} />
      </div>

      {/* Banner Pemberitahuan */}
      {bannerNotice && (
        <div
          role="status"
          className={`dasbor__banner dasbor__banner--${bannerNotice.type}`}
          data-testid="meta-banner-notice"
          style={{ marginBottom: '1.25rem' }}
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

      {/* Ringkasan Header & Akses */}
      <section className="dasbor__card" style={{ marginBottom: '1.25rem' }}>
        <div className="dasbor__card-head">
          <div>
            <p className="dasbor__eyebrow">Penghubung Meta Graph API</p>
            <h1 className="dasbor__card-title" style={{ fontSize: '1.35rem' }}>
              Akun Resmi Instagram &amp; Facebook Page
            </h1>
            <p className="dasbor__muted" style={{ fontSize: '0.86rem', marginTop: '0.2rem' }}>
              Integrasi resmi Meta Graph API (Instagram Graph API &amp; Facebook Page Insights) secara <strong>Hanya-Baca</strong>.
              Tidak ada fitur posting/iklan otomatis. Seluruh metrik harian ditarik otomatis via jadwal cron.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            {isAdminOrHead && (
              <>
                <button
                  type="button"
                  className="dasbor__btn dasbor__btn--primary"
                  onClick={() => setIsIgModalOpen(true)}
                  data-testid="btn-open-ig-oauth-modal"
                  style={{ background: '#e1306c', borderColor: '#e1306c' }}
                >
                  + Sambung Akun Instagram
                </button>
                <button
                  type="button"
                  className="dasbor__btn dasbor__btn--primary"
                  onClick={() => setIsFbModalOpen(true)}
                  data-testid="btn-open-fb-oauth-modal"
                  style={{ background: '#1877f2', borderColor: '#1877f2' }}
                >
                  + Sambung Facebook Page
                </button>
              </>
            )}
            <Link
              href="/penarikan-metrik-terjadwal"
              className="dasbor__btn"
              data-testid="link-to-schedule-from-meta"
            >
              Jadwal Tarik Harian
            </Link>
            <Link
              href="/pemantauan-kanal"
              className="dasbor__btn dasbor__btn--primary"
              data-testid="link-to-channel-monitor"
            >
              Buka Pemantau Kanal
            </Link>
          </div>
        </div>

        {/* Batasan Tegas Arsitektur */}
        <div
          style={{
            marginTop: '0.75rem',
            padding: '0.75rem 0.9rem',
            borderRadius: '0.5rem',
            background: 'var(--color-surface-muted, #1e293b)',
            border: '1px solid var(--color-border, #334155)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.8rem'
          }}
        >
          <div>
            <span style={{ color: '#22c55e', fontWeight: 600 }}>✓ Hanya-Baca:</span> Data profil, pengikut, impresi &amp; interaksi
          </div>
          <div>
            <span style={{ color: '#f59e0b', fontWeight: 600 }}>⛔ Tanpa Posting:</span> Publikasi Reels/Feed tetap manual
          </div>
          <div>
            <span style={{ color: '#f59e0b', fontWeight: 600 }}>⛔ Tanpa Meta Ads:</span> Tanpa Conversions API / Piksel / WABA
          </div>
          <div>
            <span style={{ color: '#38bdf8', fontWeight: 600 }}>🔒 Kredensial:</span> Token akses tersimpan aman di server
          </div>
        </div>
      </section>

      {/* Tabel Akun Instagram & Facebook */}
      <section className="dasbor__card" data-testid="meta-accounts-table-card">
        <div className="dasbor__card-head">
          <div>
            <p className="dasbor__eyebrow">Daftar Akun Tersambung</p>
            <h2 className="dasbor__card-title">Tabel Akun Meta (Instagram &amp; Facebook)</h2>
          </div>

          {/* Filter Bar Platform & Pencarian Akun */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama atau @handle..."
                data-testid="meta-search-input"
                aria-label="Cari nama akun atau handle Meta"
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '0.45rem',
                  border: '1px solid var(--color-border, #334155)',
                  background: 'var(--color-surface, #0f172a)',
                  color: 'inherit',
                  fontSize: '0.8rem',
                  minWidth: '200px'
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Hapus pencarian"
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-muted, #94a3b8)',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
              {(['all', 'instagram', 'facebook'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`dasbor__btn ${platformFilter === tab ? 'dasbor__btn--primary' : ''}`}
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                  onClick={() => setPlatformFilter(tab)}
                  data-testid={`meta-filter-${tab}`}
                >
                  {tab === 'all' ? 'Semua Meta' : tab === 'instagram' ? 'Instagram' : 'Facebook Page'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Legenda Status Sambungan */}
        <div
          data-testid="meta-status-legend"
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
            Legenda Status Sambungan:
          </span>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }} data-testid="legend-item-connected">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
            <strong style={{ color: '#22c55e' }}>Tersambung (Hijau)</strong>
            <span className="dasbor__muted">— Token OAuth valid, penarikan metrik aktif.</span>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }} data-testid="legend-item-expiring">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
            <strong style={{ color: '#f59e0b' }}>Segera Berakhir (Kuning)</strong>
            <span className="dasbor__muted">— Masa berlaku sisa &le; 7 hari, perlu penyegaran.</span>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }} data-testid="legend-item-disconnected">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
            <strong style={{ color: '#ef4444' }}>Terputus (Merah)</strong>
            <span className="dasbor__muted">— Kredensial kedaluwarsa atau diputus oleh admin.</span>
          </div>
        </div>

        <div style={{ overflowX: 'auto', marginTop: '0.5rem' }}>
          <table className="dasbor__table" data-testid="meta-accounts-table">
            <thead>
              <tr>
                <th>Platform &amp; Akun</th>
                <th>Tipe Akun</th>
                <th>Pengikut</th>
                <th>Jangkauan (30h)</th>
                <th>Tingkat Interaksi</th>
                <th>Status Izin</th>
                <th>Sinkronisasi Terakhir</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.length === 0 ? (
                <tr data-testid="meta-accounts-empty-state">
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>🔍</div>
                    <div style={{ fontWeight: 600, fontSize: '0.92rem', marginBottom: '0.25rem' }}>
                      Tidak Ada Akun Meta yang Cocok
                    </div>
                    <p className="dasbor__muted" style={{ fontSize: '0.8rem', maxWidth: '420px', margin: '0 auto 0.75rem' }}>
                      {searchQuery
                        ? `Tidak ditemukan akun resmi Instagram atau Facebook yang cocok dengan kata kunci "${searchQuery}".`
                        : `Belum ada akun ${platformFilter === 'instagram' ? 'Instagram' : platformFilter === 'facebook' ? 'Facebook' : 'Meta'} yang tersambung.`}
                    </p>
                    {(searchQuery || platformFilter !== 'all') && (
                      <button
                        type="button"
                        className="dasbor__btn"
                        style={{ padding: '0.3rem 0.75rem', fontSize: '0.78rem' }}
                        onClick={() => {
                          setSearchQuery('');
                          setPlatformFilter('all');
                        }}
                        data-testid="btn-reset-meta-filter"
                      >
                        Reset Filter &amp; Pencarian
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((acc) => (
                  <tr key={acc.id} data-testid={`meta-account-row-${acc.id}`}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '2.2rem',
                            height: '2.2rem',
                            borderRadius: '0.5rem',
                            background: acc.platform === 'instagram' ? '#e1306c22' : '#1877f222',
                            color: acc.platform === 'instagram' ? '#e1306c' : '#1877f2',
                            fontWeight: 700,
                            fontSize: '0.8rem'
                          }}
                        >
                          {acc.platform === 'instagram' ? 'IG' : 'FB'}
                        </span>
                        <div>
                          <div style={{ fontWeight: 600 }}>{acc.name}</div>
                          <div className="dasbor__muted" style={{ fontSize: '0.78rem' }}>
                            {acc.handle}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="dasbor__muted" style={{ fontSize: '0.8rem' }}>
                        {acc.accountType}
                      </span>
                    </td>
                    <td>
                      <strong style={{ fontSize: '0.92rem' }}>
                        {acc.followersCount.toLocaleString('id-ID')}
                      </strong>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.88rem' }}>
                        {acc.reach30d.toLocaleString('id-ID')}
                      </span>
                    </td>
                    <td>
                      <span className="dasbor__badge dasbor__badge--up">
                        {acc.engagementRate}%
                      </span>
                    </td>
                    <td>
                      {acc.status === 'connected' ? (
                        <span className="dasbor__badge dasbor__badge--up" data-testid={`status-badge-${acc.id}`}>
                          ● Tersambung
                        </span>
                      ) : acc.status === 'token_expiring' ? (
                        <span className="dasbor__badge dasbor__badge--warn" data-testid={`status-badge-${acc.id}`}>
                          ▲ Segera Berakhir
                        </span>
                      ) : (
                        <span className="dasbor__badge dasbor__badge--down" data-testid={`status-badge-${acc.id}`}>
                          ✕ Terputus
                        </span>
                      )}
                      <div className="dasbor__muted" style={{ fontSize: '0.72rem', marginTop: '0.15rem' }}>
                        {acc.tokenExpiresAt}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem' }}>{acc.lastSyncedAt}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {isAdminOrHead ? (
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }} data-testid={`admin-actions-${acc.id}`}>
                          <button
                            type="button"
                            className="dasbor__btn"
                            style={{ padding: '0.28rem 0.55rem', fontSize: '0.75rem' }}
                            disabled={testingId === acc.id || refreshingId === acc.id}
                            onClick={() => handleTestConnection(acc.id)}
                            data-testid={`btn-test-meta-${acc.id}`}
                          >
                            {testingId === acc.id ? 'Menguji...' : 'Uji Sambungan'}
                          </button>
                          <button
                            type="button"
                            className="dasbor__btn"
                            style={{
                              padding: '0.28rem 0.55rem',
                              fontSize: '0.75rem',
                              color: acc.status === 'token_expiring' ? '#f59e0b' : undefined,
                              borderColor: acc.status === 'token_expiring' ? 'rgba(245, 158, 11, 0.4)' : undefined
                            }}
                            disabled={refreshingId === acc.id || testingId === acc.id}
                            onClick={() => handleRefreshToken(acc.id)}
                            data-testid={`btn-refresh-meta-${acc.id}`}
                          >
                            {refreshingId === acc.id ? 'Menyegarkan...' : 'Perbarui Izin'}
                          </button>
                        </div>
                      ) : (
                        <span
                          className="dasbor__muted"
                          style={{ fontSize: '0.74rem', fontStyle: 'italic' }}
                          data-testid={`readonly-indicator-${acc.id}`}
                        >
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

      {/* Panel Jejak Audit Sambung, Perbarui, dan Putus */}
      <section className="dasbor__card" data-testid="meta-audit-trail-card" style={{ marginTop: '1.25rem' }}>
        <div className="dasbor__card-head">
          <div>
            <p className="dasbor__eyebrow">Log Keamanan &amp; Tata Kelola Kredensial</p>
            <h2 className="dasbor__card-title">Jejak Audit Sambung, Perbarui, &amp; Putus Akun Meta</h2>
          </div>
          <span className="dasbor__badge" data-testid="audit-trail-count-badge">
            {auditLogs.length} Aktivitas Tercatat
          </span>
        </div>

        <div style={{ overflowX: 'auto', marginTop: '0.5rem' }}>
          <table className="dasbor__table" data-testid="meta-audit-trail-table">
            <thead>
              <tr>
                <th>Waktu (WIB)</th>
                <th>Jenis Aksi</th>
                <th>Platform &amp; Target Akun</th>
                <th>Aktor / Peran</th>
                <th>Status</th>
                <th>Rincian Teknis</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id} data-testid={`audit-row-${log.id}`}>
                  <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                    {log.timestamp}
                  </td>
                  <td>
                    {log.action === 'OAUTH_CONNECT' ? (
                      <span className="dasbor__badge dasbor__badge--up" style={{ fontSize: '0.72rem' }}>
                        + SAMBUNG OAUTH
                      </span>
                    ) : log.action === 'TOKEN_REFRESH' ? (
                      <span className="dasbor__badge" style={{ fontSize: '0.72rem', background: '#38bdf822', color: '#38bdf8' }}>
                        ↻ PERBARUI IZIN
                      </span>
                    ) : log.action === 'DISCONNECT' ? (
                      <span className="dasbor__badge dasbor__badge--down" style={{ fontSize: '0.72rem' }}>
                        ✕ PUTUS SAMBUNGAN
                      </span>
                    ) : (
                      <span className="dasbor__badge" style={{ fontSize: '0.72rem' }}>
                        ✓ UJI KONEKSI
                      </span>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>
                      {log.accountName}
                    </div>
                    <span className="dasbor__muted" style={{ fontSize: '0.74rem' }}>
                      Platform: {log.platform.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.82rem' }}>{log.userName}</div>
                    <span className="dasbor__muted" style={{ fontSize: '0.74rem' }}>
                      Peran: {log.userRole}
                    </span>
                  </td>
                  <td>
                    {log.status === 'success' ? (
                      <span style={{ color: '#22c55e', fontSize: '0.8rem', fontWeight: 600 }}>
                        ● Berhasil
                      </span>
                    ) : log.status === 'warning' ? (
                      <span style={{ color: '#f59e0b', fontSize: '0.8rem', fontWeight: 600 }}>
                        ▲ Perhatian
                      </span>
                    ) : (
                      <span style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 600 }}>
                        ✕ Gagal
                      </span>
                    )}
                  </td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--color-muted, #94a3b8)', maxWidth: '340px' }}>
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal Simulasi OAuth Instagram */}
      <InstagramOAuthModal
        isOpen={isIgModalOpen}
        onClose={() => setIsIgModalOpen(false)}
        onSuccess={(newAccount) => {
          const newItem: MetaAccountItem = {
            id: `meta-ig-${Date.now()}`,
            platform: 'instagram',
            name: newAccount.name,
            handle: newAccount.handle,
            accountType: 'Instagram Business / Creator',
            followersCount: newAccount.followersCount,
            reach30d: newAccount.reach30d,
            engagementRate: 5.25,
            status: 'connected',
            tokenExpiresAt: '2026-12-19 10:00 WIB (60 hari lagi)',
            lastSyncedAt: 'Baru saja (Hari ini WIB)',
            grantedScopes: ['instagram_basic', 'instagram_manage_insights', 'pages_read_engagement']
          };
          setAccounts((prev) => [...prev, newItem]);
          setBannerNotice({
            type: 'success',
            text: `Akun Instagram ${newAccount.handle} berhasil dihubungkan via OAuth (Hanya-Baca).`
          });
        }}
      />

      {/* Modal Simulasi OAuth Facebook Page */}
      <FacebookOAuthModal
        isOpen={isFbModalOpen}
        onClose={() => setIsFbModalOpen(false)}
        onSuccess={(selectedPage) => {
          const newItem: MetaAccountItem = {
            id: `meta-fb-${Date.now()}`,
            platform: 'facebook',
            name: selectedPage.name,
            handle: selectedPage.handle,
            accountType: 'Facebook Page Resmi',
            followersCount: selectedPage.followersCount,
            reach30d: selectedPage.reach30d,
            engagementRate: 3.85,
            status: 'connected',
            tokenExpiresAt: '2026-12-19 10:00 WIB (60 hari lagi)',
            lastSyncedAt: 'Baru saja (Hari ini WIB)',
            grantedScopes: ['pages_show_list', 'pages_read_engagement', 'read_insights']
          };
          setAccounts((prev) => [...prev, newItem]);
          setBannerNotice({
            type: 'success',
            text: `Halaman Facebook ${selectedPage.name} (${selectedPage.handle}) berhasil dihubungkan via OAuth.`
          });
        }}
      />
    </div>
  );
}

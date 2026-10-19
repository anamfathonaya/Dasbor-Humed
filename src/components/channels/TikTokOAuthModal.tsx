'use client';

import React, { useState } from 'react';
import { TikTokConnectedAccount } from './TikTokIntegrationView';

interface TikTokOAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newAccount: TikTokConnectedAccount) => void;
}

export function TikTokOAuthModal({ isOpen, onClose, onSuccess }: TikTokOAuthModalProps) {
  const [step, setStep] = useState<'prompt' | 'processing' | 'success' | 'denied'>('prompt');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGrantConsent = () => {
    setStep('processing');
    setTimeout(() => {
      const simulatedAccount: TikTokConnectedAccount = {
        id: `tt-acc-${Date.now()}`,
        openId: `_000${Math.random().toString(36).substring(2, 10)}_KemensosBaru`,
        unionId: `uid_kemensos_${Date.now()}`,
        displayName: 'Kemensos Peduli Sahabat',
        handle: '@kemensospedulisahabat',
        avatarUrl: 'https://ui-avatars.com/api/?name=KPS&background=00f2fe&color=000',
        followersCount: 16800,
        likesCount: 312000,
        videoCount: 42,
        reach30d: 145000,
        views30d: 215000,
        engagementRate: 8.45,
        status: 'connected',
        tokenExpiresAt: '2026-12-19 12:00 WIB (60 hari lagi)',
        lastSyncedAt: 'Baru saja',
        lastHealthCheckAt: 'Baru saja (200 OK — 142ms)',
        grantedScopes: ['user.info.basic', 'video.list'],
        disallowedAttemptDetected: false
      };

      setStep('success');
      setTimeout(() => {
        onSuccess(simulatedAccount);
        onClose();
        setStep('prompt');
      }, 900);
    }, 700);
  };

  const handleDenyConsent = () => {
    setErrorMessage('Pengguna menolak izin akses TikTok Display API.');
    setStep('denied');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tiktok-oauth-title"
      data-testid="tiktok-oauth-modal"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      <div
        className="dasbor__card"
        style={{
          width: '100%',
          maxWidth: '520px',
          margin: 0,
          background: 'var(--color-surface, #0f172a)',
          border: '1px solid var(--color-border, #334155)',
          borderRadius: '0.75rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Header Modal */}
        <div className="dasbor__card-head" style={{ borderBottom: '1px solid var(--color-border, #334155)', padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '2rem',
                height: '2rem',
                borderRadius: '0.4rem',
                background: '#00f2fe22',
                color: '#00f2fe',
                fontWeight: 700,
                fontSize: '0.85rem'
              }}
            >
              TT
            </span>
            <div>
              <h2 id="tiktok-oauth-title" style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
                Otorisasi TikTok Display API
              </h2>
              <span className="dasbor__muted" style={{ fontSize: '0.75rem' }}>
                Hanya-Baca (Read-Only) · TikTok for Developers
              </span>
            </div>
          </div>
          <button
            type="button"
            className="dasbor__btn"
            style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
            onClick={onClose}
            aria-label="Tutup dialog"
            data-testid="btn-close-tiktok-modal"
          >
            ✕
          </button>
        </div>

        {/* Konten Modal */}
        <div style={{ padding: '1.25rem' }}>
          {step === 'prompt' && (
            <div>
              <p style={{ fontSize: '0.86rem', margin: '0 0 1rem' }}>
                Aplikasi <strong>Dasbor Pemantauan Humas</strong> meminta izin hanya-baca ke akun resmi TikTok lembaga Anda untuk menyinkronkan data tayangan:
              </p>

              {/* Daftar Izin Read-Only yang Diminta */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                  marginBottom: '1.25rem'
                }}
              >
                <div
                  style={{
                    padding: '0.65rem 0.85rem',
                    borderRadius: '0.5rem',
                    background: 'var(--color-surface-muted, #1e293b)',
                    border: '1px solid var(--color-border, #334155)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.6rem'
                  }}
                >
                  <span style={{ color: '#00f2fe', fontSize: '1.1rem' }}>✓</span>
                  <div>
                    <strong style={{ fontSize: '0.84rem' }}>user.info.basic</strong>
                    <p className="dasbor__muted" style={{ margin: '0.15rem 0 0', fontSize: '0.76rem' }}>
                      Membaca foto profil, nama tampilan, @handle publik, dan metrik jumlah pengikut resmi.
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    padding: '0.65rem 0.85rem',
                    borderRadius: '0.5rem',
                    background: 'var(--color-surface-muted, #1e293b)',
                    border: '1px solid var(--color-border, #334155)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.6rem'
                  }}
                >
                  <span style={{ color: '#00f2fe', fontSize: '1.1rem' }}>✓</span>
                  <div>
                    <strong style={{ fontSize: '0.84rem' }}>video.list</strong>
                    <p className="dasbor__muted" style={{ margin: '0.15rem 0 0', fontSize: '0.76rem' }}>
                      Membaca daftar video publik, total tayangan, jumlah suka, komentar, dan tingkat interaksi video.
                    </p>
                  </div>
                </div>
              </div>

              {/* Jaminan Keamanan & Batasan Tegas */}
              <div
                data-testid="tiktok-security-guarantee"
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: '0.45rem',
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  fontSize: '0.76rem',
                  marginBottom: '1.25rem'
                }}
              >
                <div style={{ fontWeight: 600, color: '#f87171', marginBottom: '0.2rem' }}>
                  🚫 Batasan Tegas (Tanpa Penerbitan Otomatis):
                </div>
                <div className="dasbor__muted">
                  Aplikasi ini <strong>tidak meminta</strong> izin Content Posting API (tanpa posting video/draft/stories otomatis) dan <strong>tanpa TikTok Research API</strong>. Seluruh video diposting langsung oleh tim di aplikasi TikTok.
                </div>
              </div>

              {/* Tombol Aksi */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
                <button
                  type="button"
                  className="dasbor__btn"
                  onClick={handleDenyConsent}
                  data-testid="btn-deny-tiktok-oauth"
                  style={{ color: '#ef4444' }}
                >
                  Tolak Izin
                </button>
                <button
                  type="button"
                  className="dasbor__btn"
                  onClick={onClose}
                  data-testid="btn-cancel-tiktok-oauth"
                >
                  Batal
                </button>
                <button
                  type="button"
                  className="dasbor__btn dasbor__btn--primary"
                  onClick={handleGrantConsent}
                  data-testid="btn-grant-tiktok-consent"
                  style={{ background: '#00f2fe', color: '#000', borderColor: '#00f2fe', fontWeight: 600 }}
                >
                  Izinkan &amp; Hubungkan (Read-Only)
                </button>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }} data-testid="tiktok-oauth-processing">
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⏳</div>
              <h3 style={{ fontSize: '1rem', margin: '0 0 0.35rem' }}>Menghubungi TikTok Display API...</h3>
              <p className="dasbor__muted" style={{ fontSize: '0.8rem', margin: 0 }}>
                Menukar authorization code dengan token akses hanya-baca dan mengenkripsi kredensial di server.
              </p>
            </div>
          )}

          {step === 'success' && (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }} data-testid="tiktok-oauth-success">
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✓</div>
              <h3 style={{ fontSize: '1.05rem', margin: '0 0 0.35rem', color: '#22c55e' }}>
                Akun TikTok Berhasil Dihubungkan!
              </h3>
              <p className="dasbor__muted" style={{ fontSize: '0.8rem', margin: 0 }}>
                Kredensial disimpan terenkripsi di server. Agregasi metrik video publik kini aktif.
              </p>
            </div>
          )}

          {step === 'denied' && (
            <div style={{ textAlign: 'center', padding: '1.5rem 1rem' }} data-testid="tiktok-oauth-denied">
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>❌</div>
              <h3 style={{ fontSize: '1.05rem', margin: '0 0 0.35rem', color: '#f87171' }}>
                Otorisasi TikTok Ditolak / Gagal
              </h3>
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '0.5rem',
                  padding: '0.75rem 1rem',
                  margin: '1rem 0',
                  textAlign: 'left',
                  fontSize: '0.8rem'
                }}
                data-testid="tiktok-oauth-error-detail"
              >
                <strong style={{ color: '#f87171' }}>Penyebab Penolakan / Galat:</strong>
                <p className="dasbor__muted" style={{ margin: '0.25rem 0 0.5rem' }}>
                  {errorMessage || 'Pengguna membatalkan dialog izin atau menolak cakupan Display API yang dibutuhkan.'}
                </p>
                <div style={{ fontSize: '0.74rem', color: 'var(--color-muted, #94a3b8)', borderTop: '1px dashed rgba(239, 68, 68, 0.25)', paddingTop: '0.4rem' }}>
                  💡 <strong>Solusi:</strong> Pastikan Anda masuk dengan akun TikTok resmi lembaga yang memiliki wewenang administrator, lalu pilih "Izinkan" untuk cakupan <code>user.info.basic</code> dan <code>video.list</code>.
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="dasbor__btn"
                  onClick={onClose}
                  data-testid="btn-dismiss-tiktok-error"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  className="dasbor__btn dasbor__btn--primary"
                  onClick={() => {
                    setErrorMessage(null);
                    setStep('prompt');
                  }}
                  data-testid="btn-retry-tiktok-oauth"
                  style={{ background: '#00f2fe', color: '#000', borderColor: '#00f2fe' }}
                >
                  Coba Otorisasi Ulang
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

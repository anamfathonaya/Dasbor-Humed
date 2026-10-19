'use client';

import React, { useState } from 'react';

export interface InstagramOAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newAccount: {
    name: string;
    handle: string;
    followersCount: number;
    reach30d: number;
  }) => void;
  onDenied?: (reason: string) => void;
}

export function InstagramOAuthModal({
  isOpen,
  onClose,
  onSuccess,
  onDenied
}: InstagramOAuthModalProps) {
  const [step, setStep] = useState<'consent_screen' | 'authorizing' | 'denied' | 'success'>('consent_screen');
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isOpen) return null;

  const handleDenyConsent = () => {
    const reason = 'Izin ditolak oleh pengguna pada layar persetujuan OAuth Instagram.';
    setErrorMessage(reason);
    setStep('denied');
    if (onDenied) {
      onDenied(reason);
    }
  };

  const handleGrantConsent = () => {
    setStep('authorizing');
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onSuccess({
          name: 'Instagram Resmi Humas Peduli Negeri',
          handle: '@humas_pedulinegeri',
          followersCount: 128400,
          reach30d: 489000
        });
        setStep('consent_screen');
        onClose();
      }, 700);
    }, 700);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ig-oauth-modal-title"
      data-testid="instagram-oauth-modal"
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
          background: 'var(--color-surface, #0f172a)',
          border: '1px solid var(--color-border, #334155)',
          borderRadius: '0.75rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden'
        }}
      >
        {/* Header Modal / Simulasi Meta Login */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--color-border, #334155)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--color-surface-muted, #1e293b)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '1.9rem',
                height: '1.9rem',
                borderRadius: '0.4rem',
                background: '#e1306c',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.75rem'
              }}
            >
              IG
            </span>
            <div>
              <h2 id="ig-oauth-modal-title" style={{ margin: 0, fontSize: '0.98rem', fontWeight: 600 }}>
                Simulasi Persetujuan OAuth Instagram
              </h2>
              <span className="dasbor__muted" style={{ fontSize: '0.74rem' }}>
                Meta for Developers · Instagram Graph API (Read-Only)
              </span>
            </div>
          </div>
          <button
            type="button"
            className="dasbor__btn"
            style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
            onClick={onClose}
            aria-label="Tutup modal"
          >
            ✕
          </button>
        </div>

        {/* Konten Simulasi */}
        <div style={{ padding: '1.25rem' }}>
          {step === 'consent_screen' && (
            <div>
              <div
                style={{
                  textAlign: 'center',
                  padding: '0.75rem 0',
                  borderBottom: '1px solid var(--color-border, #334155)',
                  marginBottom: '1rem'
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>📸</div>
                <h3 style={{ fontSize: '1.05rem', margin: '0 0 0.25rem', fontWeight: 600 }}>
                  Dasbor Humas Kemensos meminta akses hanya-baca
                </h3>
                <p className="dasbor__muted" style={{ fontSize: '0.82rem', margin: 0 }}>
                  Aplikasi ini akan membaca profil dan analitik statistik akun Instagram Business / Creator Anda.
                </p>
              </div>

              {/* Rincian Cakupan Izin Read-Only */}
              <div style={{ marginBottom: '1.25rem' }}>
                <p style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Cakupan Izin Resmi yang Diminta (Hanya-Baca):
                </p>
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    fontSize: '0.8rem'
                  }}
                >
                  <li
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.5rem',
                      padding: '0.5rem 0.65rem',
                      background: 'var(--color-surface-muted, #1e293b)',
                      borderRadius: '0.4rem',
                      border: '1px solid var(--color-border, #334155)'
                    }}
                  >
                    <span style={{ color: '#22c55e', fontWeight: 700 }}>✓</span>
                    <div>
                      <strong>instagram_basic:</strong>
                      <div className="dasbor__muted">Membaca informasi profil dasar (nama, handle @akun, foto profil, dan jumlah pengikut).</div>
                    </div>
                  </li>
                  <li
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.5rem',
                      padding: '0.5rem 0.65rem',
                      background: 'var(--color-surface-muted, #1e293b)',
                      borderRadius: '0.4rem',
                      border: '1px solid var(--color-border, #334155)'
                    }}
                  >
                    <span style={{ color: '#22c55e', fontWeight: 700 }}>✓</span>
                    <div>
                      <strong>instagram_manage_insights:</strong>
                      <div className="dasbor__muted">Membaca metrik jangkauan unik (reach), impresi harian, dan interaksi (suka, komentar, bagikan).</div>
                    </div>
                  </li>
                  <li
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.5rem',
                      padding: '0.5rem 0.65rem',
                      background: 'var(--color-surface-muted, #1e293b)',
                      borderRadius: '0.4rem',
                      border: '1px solid var(--color-border, #334155)'
                    }}
                  >
                    <span style={{ color: '#22c55e', fontWeight: 700 }}>✓</span>
                    <div>
                      <strong>pages_read_engagement:</strong>
                      <div className="dasbor__muted">Membaca interaksi publik halaman Facebook yang tertaut ke akun bisnis Instagram.</div>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Batasan Keamanan */}
              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: '0.4rem',
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  fontSize: '0.78rem',
                  color: '#fca5a5',
                  marginBottom: '1.25rem'
                }}
              >
                ⛔ <strong>Batasan Tegas:</strong> Aplikasi TIDAK memiliki hak posting konten (Reels/Stories/Feed), TIDAK mengelola direct message (DM), dan TIDAK mengakses Meta Ads / Piksel.
              </div>

              {/* Tombol Tindakan Persetujuan */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
                <button
                  type="button"
                  className="dasbor__btn"
                  onClick={handleDenyConsent}
                  data-testid="btn-deny-ig-oauth"
                  style={{ color: '#ef4444' }}
                >
                  Tolak Izin
                </button>
                <button
                  type="button"
                  className="dasbor__btn"
                  onClick={onClose}
                  data-testid="btn-cancel-ig-oauth"
                >
                  Batal
                </button>
                <button
                  type="button"
                  className="dasbor__btn dasbor__btn--primary"
                  onClick={handleGrantConsent}
                  data-testid="btn-grant-ig-consent"
                  style={{ background: '#e1306c', borderColor: '#e1306c' }}
                >
                  Izinkan Akses Hanya-Baca
                </button>
              </div>
            </div>
          )}

          {step === 'denied' && (
            <div style={{ textAlign: 'center', padding: '1.5rem 1rem' }} data-testid="ig-oauth-denied-view">
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>❌</div>
              <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.4rem', color: '#f87171' }}>
                Otorisasi Dibatalkan / Izin Ditolak
              </h3>
              <p className="dasbor__muted" style={{ fontSize: '0.84rem', margin: '0 0 1.25rem' }}>
                {errorMessage || 'Izin ditolak oleh pengguna pada layar persetujuan OAuth. Tidak ada data akun atau token setengah-tersambung yang disimpan ke sistem.'}
              </p>
              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: '0.45rem',
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  fontSize: '0.76rem',
                  color: '#fca5a5',
                  marginBottom: '1.25rem',
                  textAlign: 'left'
                }}
              >
                🔒 <strong>Status Bersih:</strong> Kredensial tidak tersimpan di server. Daftar kanal tidak terpengaruh oleh upaya otorisasi yang gagal.
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem' }}>
                <button
                  type="button"
                  className="dasbor__btn"
                  onClick={() => {
                    setStep('consent_screen');
                  }}
                  data-testid="btn-retry-ig-oauth"
                >
                  Coba Otorisasi Lagi
                </button>
                <button
                  type="button"
                  className="dasbor__btn dasbor__btn--primary"
                  onClick={() => {
                    setStep('consent_screen');
                    onClose();
                  }}
                  data-testid="btn-close-ig-denied"
                >
                  Tutup
                </button>
              </div>
            </div>
          )}

          {step === 'authorizing' && (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }} data-testid="ig-oauth-loading">
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⏳</div>
              <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.4rem' }}>
                Memproses Otorisasi &amp; Mengenkripsi Token...
              </h3>
              <p className="dasbor__muted" style={{ fontSize: '0.84rem', margin: 0 }}>
                Menghubungkan ke Meta Graph API dan menyimpan token akses di sisi server.
              </p>
            </div>
          )}

          {step === 'success' && (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }} data-testid="ig-oauth-success">
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✅</div>
              <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.4rem', color: '#22c55e' }}>
                Otorisasi Instagram Berhasil!
              </h3>
              <p className="dasbor__muted" style={{ fontSize: '0.84rem', margin: 0 }}>
                Kanal Instagram resmi berhasil dihubungkan dengan mode hanya-baca.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

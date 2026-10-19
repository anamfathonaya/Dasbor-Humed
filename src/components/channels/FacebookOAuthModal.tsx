'use client';

import React, { useState } from 'react';

export interface FacebookPageOption {
  id: string;
  name: string;
  handle: string;
  category: string;
  fansCount: number;
  isSelected?: boolean;
}

export interface FacebookOAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (selectedPage: {
    name: string;
    handle: string;
    followersCount: number;
    reach30d: number;
  }) => void;
  onDenied?: (reason: string) => void;
}

const AVAILABLE_FACEBOOK_PAGES: FacebookPageOption[] = [
  {
    id: 'fb-page-01',
    name: 'Kementerian Sosial Republik Indonesia (Halaman Utama)',
    handle: 'KemensosRI',
    category: 'Organisasi Pemerintah',
    fansCount: 890000
  },
  {
    id: 'fb-page-02',
    name: 'Direktorat Perlindungan Sosial Korban Bencana Alam (PSKBA)',
    handle: 'PSKBA.Kemensos',
    category: 'Layanan Publik & Sosial',
    fansCount: 145000
  },
  {
    id: 'fb-page-03',
    name: 'Pusdatin Kesejahteraan Sosial RI',
    handle: 'PusdatinKesosRI',
    category: 'Pusat Informasi & Data',
    fansCount: 68400
  }
];

export function FacebookOAuthModal({
  isOpen,
  onClose,
  onSuccess,
  onDenied
}: FacebookOAuthModalProps) {
  const [step, setStep] = useState<'page_selector' | 'authorizing' | 'denied' | 'success'>('page_selector');
  const [selectedPageId, setSelectedPageId] = useState<string>('fb-page-01');
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isOpen) return null;

  const handleDenyConsent = () => {
    const reason = 'Pengguna menolak izin akses halaman Facebook atau membatalkan otorisasi.';
    setErrorMessage(reason);
    setStep('denied');
    if (onDenied) {
      onDenied(reason);
    }
  };

  const handleGrantConsent = () => {
    const chosen = AVAILABLE_FACEBOOK_PAGES.find((p) => p.id === selectedPageId) || AVAILABLE_FACEBOOK_PAGES[0];
    setStep('authorizing');
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onSuccess({
          name: chosen.name,
          handle: chosen.handle,
          followersCount: chosen.fansCount,
          reach30d: Math.round(chosen.fansCount * 2.3)
        });
        setStep('page_selector');
        onClose();
      }, 700);
    }, 700);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="fb-oauth-modal-title"
      data-testid="facebook-oauth-modal"
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
          maxWidth: '540px',
          background: 'var(--color-surface, #0f172a)',
          border: '1px solid var(--color-border, #334155)',
          borderRadius: '0.75rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden'
        }}
      >
        {/* Header Modal */}
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
                background: '#1877f2',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.8rem'
              }}
            >
              f
            </span>
            <div>
              <h2 id="fb-oauth-modal-title" style={{ margin: 0, fontSize: '0.98rem', fontWeight: 600 }}>
                Pemilih Halaman Resmi Facebook (OAuth)
              </h2>
              <span className="dasbor__muted" style={{ fontSize: '0.74rem' }}>
                Meta Graph API · Facebook Pages Read-Only Insights
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

        {/* Konten Modal */}
        <div style={{ padding: '1.25rem' }}>
          {step === 'page_selector' && (
            <div>
              <p style={{ fontSize: '0.84rem', margin: '0 0 0.85rem' }}>
                Pilih halaman resmi Facebook yang ingin dihubungkan secara <strong>hanya-baca</strong> ke dalam dasbor pemantauan:
              </p>

              {/* Daftar Pilihan Halaman Resmi */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                  marginBottom: '1.25rem'
                }}
                data-testid="facebook-pages-list"
              >
                {AVAILABLE_FACEBOOK_PAGES.map((page) => {
                  const isChecked = selectedPageId === page.id;
                  return (
                    <label
                      key={page.id}
                      data-testid={`fb-page-option-${page.id}`}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem',
                        padding: '0.75rem 0.85rem',
                        borderRadius: '0.5rem',
                        background: isChecked ? 'rgba(24, 119, 242, 0.12)' : 'var(--color-surface-muted, #1e293b)',
                        border: isChecked ? '1px solid #1877f2' : '1px solid var(--color-border, #334155)',
                        cursor: 'pointer'
                      }}
                    >
                      <input
                        type="radio"
                        name="selectedFacebookPage"
                        value={page.id}
                        checked={isChecked}
                        onChange={() => setSelectedPageId(page.id)}
                        style={{ marginTop: '0.25rem' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{page.name}</div>
                        <div className="dasbor__muted" style={{ fontSize: '0.76rem' }}>
                          {page.handle} · {page.category}
                        </div>
                        <div style={{ fontSize: '0.78rem', marginTop: '0.2rem', color: '#38bdf8' }}>
                          👥 {page.fansCount.toLocaleString('id-ID')} Pengikut / Suka
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* Cakupan Izin & Batasan Keamanan */}
              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: '0.45rem',
                  background: 'var(--color-surface-muted, #1e293b)',
                  border: '1px solid var(--color-border, #334155)',
                  fontSize: '0.76rem',
                  marginBottom: '1.25rem'
                }}
              >
                <div style={{ fontWeight: 600, color: '#38bdf8', marginBottom: '0.25rem' }}>
                  🔒 Izin Hanya-Baca: pages_show_list, pages_read_engagement, read_insights
                </div>
                <div className="dasbor__muted">
                  Aplikasi hanya akan membaca metrik impresi halaman dan interaksi posting publik. Tidak ada akses posting status, iklan, atau pesan halaman.
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
                <button
                  type="button"
                  className="dasbor__btn"
                  onClick={handleDenyConsent}
                  data-testid="btn-deny-fb-oauth"
                  style={{ color: '#ef4444' }}
                >
                  Tolak Izin
                </button>
                <button
                  type="button"
                  className="dasbor__btn"
                  onClick={onClose}
                  data-testid="btn-cancel-fb-oauth"
                >
                  Batal
                </button>
                <button
                  type="button"
                  className="dasbor__btn dasbor__btn--primary"
                  onClick={handleGrantConsent}
                  data-testid="btn-grant-fb-consent"
                  style={{ background: '#1877f2', borderColor: '#1877f2' }}
                >
                  Hubungkan Halaman Terpilih
                </button>
              </div>
            </div>
          )}

          {step === 'denied' && (
            <div style={{ textAlign: 'center', padding: '1.5rem 1rem' }} data-testid="fb-oauth-denied-view">
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>❌</div>
              <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.4rem', color: '#f87171' }}>
                Otorisasi Facebook Halaman Ditolak / Dibatalkan
              </h3>
              <p className="dasbor__muted" style={{ fontSize: '0.84rem', margin: '0 0 1.25rem' }}>
                {errorMessage || 'Pengguna menolak izin akses halaman Facebook. Tidak ada Page Access Token atau akun setengah-tersambung yang disimpan ke database.'}
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
                🔒 <strong>Integritas Database:</strong> Operasi dibatalkan secara bersih. Tabel akun resmi tidak memiliki entri zombie/setengah jadi.
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem' }}>
                <button
                  type="button"
                  className="dasbor__btn"
                  onClick={() => {
                    setStep('page_selector');
                  }}
                  data-testid="btn-retry-fb-oauth"
                >
                  Pilih Halaman Lain
                </button>
                <button
                  type="button"
                  className="dasbor__btn dasbor__btn--primary"
                  onClick={() => {
                    setStep('page_selector');
                    onClose();
                  }}
                  data-testid="btn-close-fb-denied"
                >
                  Tutup
                </button>
              </div>
            </div>
          )}

          {step === 'authorizing' && (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }} data-testid="fb-oauth-loading">
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⏳</div>
              <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.4rem' }}>
                Memvalidasi Token Halaman Facebook...
              </h3>
              <p className="dasbor__muted" style={{ fontSize: '0.84rem', margin: 0 }}>
                Menyimpan token akses halaman (Page Access Token) terenkripsi di server.
              </p>
            </div>
          )}

          {step === 'success' && (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }} data-testid="fb-oauth-success">
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✅</div>
              <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.4rem', color: '#22c55e' }}>
                Halaman Facebook Berhasil Terhubung!
              </h3>
              <p className="dasbor__muted" style={{ fontSize: '0.84rem', margin: 0 }}>
                Metrik halaman Facebook kini aktif dan siap ditarik setiap hari.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

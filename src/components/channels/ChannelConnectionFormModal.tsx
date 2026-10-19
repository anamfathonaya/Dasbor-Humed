'use client';

import React, { useState } from 'react';
import type { SocialPlatform } from './ChannelMonitoringView';

export interface ChannelConnectionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (channelData: {
    platform: SocialPlatform;
    accountName: string;
    handle: string;
    followersCount: number;
  }) => void;
}

export function ChannelConnectionFormModal({
  isOpen,
  onClose,
  onSuccess
}: ChannelConnectionFormModalProps) {
  const [platform, setPlatform] = useState<SocialPlatform>('instagram');
  const [accountName, setAccountName] = useState('');
  const [handle, setHandle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);

      const generatedFollowers = Math.floor(Math.random() * 50000) + 12000;
      if (onSuccess) {
        onSuccess({
          platform,
          accountName: accountName || `${platform.toUpperCase()} Resmi Humas`,
          handle: handle.startsWith('@') ? handle : `@${handle || 'humas_resmi'}`,
          followersCount: generatedFollowers
        });
      }

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 800);
    }, 600);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="channel-connect-form-title"
      data-testid="channel-connect-form-modal"
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
          maxWidth: '500px',
          margin: 0,
          background: 'var(--color-surface, #0f172a)',
          border: '1px solid var(--color-border, #334155)',
          borderRadius: '0.75rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
        }}
      >
        <div className="dasbor__card-head" style={{ borderBottom: '1px solid var(--color-border, #334155)', padding: '1rem 1.25rem' }}>
          <div>
            <h2 id="channel-connect-form-title" style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>
              Formulir Sambungkan Kanal Baru (Data Tiruan)
            </h2>
            <span className="dasbor__muted" style={{ fontSize: '0.76rem' }}>
              Uji coba otorisasi akun media sosial resmi secara aman &amp; hanya-baca
            </span>
          </div>
          <button
            type="button"
            className="dasbor__btn"
            style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
            onClick={onClose}
            aria-label="Tutup form"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.25rem' }}>
          {isSuccess ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }} data-testid="channel-form-success">
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✓</div>
              <h3 style={{ fontSize: '1.05rem', color: '#22c55e', margin: '0 0 0.25rem' }}>
                Kanal Berhasil Dihubungkan!
              </h3>
              <p className="dasbor__muted" style={{ fontSize: '0.8rem', margin: 0 }}>
                Data kanal tiruan telah terdaftar dalam sistem dan siap dipantau.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Platform Media Sosial
                </label>
                <select
                  className="dasbor__input"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as SocialPlatform)}
                  data-testid="select-channel-platform"
                  style={{ width: '100%', padding: '0.45rem 0.75rem', fontSize: '0.84rem' }}
                >
                  <option value="instagram">Instagram (Instagram Graph API)</option>
                  <option value="facebook">Facebook (Page Insights API)</option>
                  <option value="tiktok">TikTok (Display API v2)</option>
                  <option value="youtube">YouTube (Data API v3 + Analytics)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Nama Tampilan Akun
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Instagram Resmi Kemensos RI"
                  className="dasbor__input"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  data-testid="input-account-name"
                  style={{ width: '100%', padding: '0.45rem 0.75rem', fontSize: '0.84rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Username / Handle Akun (@)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: @kemensosri"
                  className="dasbor__input"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  data-testid="input-account-handle"
                  style={{ width: '100%', padding: '0.45rem 0.75rem', fontSize: '0.84rem' }}
                />
              </div>

              <div
                style={{
                  padding: '0.75rem',
                  borderRadius: '0.45rem',
                  background: 'rgba(56, 189, 248, 0.08)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  fontSize: '0.76rem'
                }}
              >
                🔒 <strong>Prinsip Hanya-Baca (Read-Only):</strong> Sistem tidak meminta kata sandi akun dan menolak izin penerbitan/posting otomatis.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="dasbor__btn"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="dasbor__btn dasbor__btn--primary"
                  disabled={isSubmitting}
                  data-testid="btn-submit-channel-form"
                  style={{ minWidth: '120px' }}
                >
                  {isSubmitting ? 'Menyambungkan...' : 'Simpan & Sambungkan'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default ChannelConnectionFormModal;

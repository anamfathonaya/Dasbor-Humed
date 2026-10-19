'use client';

import React, { useState } from 'react';
import type { SocialPlatform } from './ChannelMonitoringView';

export interface ChannelDisconnectModalProps {
  isOpen: boolean;
  channel: {
    id: string;
    platform: SocialPlatform;
    accountName: string;
    handle: string;
  } | null;
  onCancel: () => void;
  onConfirm: (channelId: string, reason: string) => void;
}

export function ChannelDisconnectModal({
  isOpen,
  channel,
  onCancel,
  onConfirm
}: ChannelDisconnectModalProps) {
  const [reason, setReason] = useState('Pembaruan otorisasi berkala / rotasi akun');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !channel) return null;

  const handleConfirm = () => {
    setIsDeleting(true);
    setTimeout(() => {
      onConfirm(channel.id, reason);
      setIsDeleting(false);
    }, 450);
  };

  const getPlatformLabel = (plat: SocialPlatform) => {
    switch (plat) {
      case 'instagram':
        return 'Instagram Graph API';
      case 'facebook':
        return 'Facebook Page Insights API';
      case 'tiktok':
        return 'TikTok Display API';
      case 'youtube':
        return 'YouTube Data & Analytics API';
      default:
        return 'Kanal Media Sosial';
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="disconnect-channel-title"
      data-testid="channel-disconnect-modal"
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
          maxWidth: '480px',
          margin: 0,
          background: 'var(--color-surface, #0f172a)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '0.75rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
        }}
      >
        <div
          className="dasbor__card-head"
          style={{
            borderBottom: '1px solid var(--color-border, #334155)',
            padding: '1rem 1.25rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.25rem', color: '#ef4444' }}>⚠️</span>
            <h3
              id="disconnect-channel-title"
              style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-text, #f1f5f9)' }}
            >
              Konfirmasi Lepas Sambungan Kanal
            </h3>
          </div>
          <button
            type="button"
            className="dasbor__btn"
            style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
            onClick={onCancel}
            aria-label="Tutup modal"
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '1.25rem' }}>
          <p style={{ fontSize: '0.85rem', lineHeight: 1.5, margin: '0 0 0.85rem' }}>
            Apakah Anda yakin ingin memutuskan sambungan <strong>{getPlatformLabel(channel.platform)}</strong> untuk akun:
          </p>

          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              background: 'var(--color-surface-muted, #1e293b)',
              border: '1px solid var(--color-border, #334155)',
              marginBottom: '1rem'
            }}
          >
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{channel.accountName}</div>
            <div className="dasbor__muted" style={{ fontSize: '0.76rem', marginTop: '0.15rem' }}>
              Handle: {channel.handle} · ID Kanal: <code>{channel.id}</code>
            </div>
          </div>

          <div
            style={{
              padding: '0.65rem 0.85rem',
              borderRadius: '0.45rem',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              fontSize: '0.76rem',
              color: 'var(--color-text-muted, #cbd5e1)',
              marginBottom: '1rem'
            }}
          >
            <strong style={{ color: '#f87171', display: 'block', marginBottom: '0.2rem' }}>
              Dampak Pelepasan Sambungan:
            </strong>
            <ul style={{ margin: 0, paddingLeft: '1.15rem', lineHeight: 1.5 }}>
              <li>Token akses dan refresh token server akan langsung dihapus permanen.</li>
              <li>Histori metrik yang telah ditarik tetap tersimpan untuk integritas laporan.</li>
              <li>Aksi pelepasan ini dicatat ke log jejak audit sistem.</li>
            </ul>
          </div>

          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            Alasan Pelepasan Sambungan (Wajib untuk Audit):
          </label>
          <input
            type="text"
            className="dasbor__input"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Masukkan alasan pemutusan sambungan..."
            data-testid="input-disconnect-reason"
            style={{ width: '100%', padding: '0.45rem 0.75rem', fontSize: '0.82rem', marginBottom: '1.25rem' }}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button
              type="button"
              className="dasbor__btn"
              onClick={onCancel}
              disabled={isDeleting}
              data-testid="btn-cancel-disconnect-channel"
            >
              Batal
            </button>
            <button
              type="button"
              className="dasbor__btn"
              onClick={handleConfirm}
              disabled={isDeleting}
              data-testid="btn-confirm-disconnect-channel"
              style={{ background: '#ef4444', color: '#fff', borderColor: '#ef4444', fontWeight: 600 }}
            >
              {isDeleting ? 'Memutuskan...' : 'Ya, Putuskan Sambungan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChannelDisconnectModal;

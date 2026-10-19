'use client';

import React, { useState } from 'react';
import type { YouTubeConnectedChannel } from './YouTubeIntegrationView';

export interface YouTubeDisconnectDialogProps {
  channel: YouTubeConnectedChannel | null;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}

export function YouTubeDisconnectDialog({
  channel,
  onCancel,
  onConfirm
}: YouTubeDisconnectDialogProps) {
  const [reason, setReason] = useState('Rotasi kredensial berkala / pergantian pengelola kanal');

  if (!channel) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="disconnect-yt-title"
      data-testid="modal-disconnect-youtube"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.55)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 1000,
        padding: '1rem'
      }}
    >
      <div
        className="dasbor__card"
        style={{ maxWidth: '480px', width: '100%', padding: '1.5rem' }}
      >
        <h3 id="disconnect-yt-title" style={{ margin: '0 0 0.5rem', fontSize: '1.1rem' }}>
          Konfirmasi Putuskan Sambungan YouTube
        </h3>

        <p style={{ fontSize: '0.85rem', color: 'var(--color-muted, #5a6875)', lineHeight: 1.5 }}>
          Apakah Anda yakin ingin melepas akses OAuth untuk kanal <b>{channel.title}</b> (
          {channel.handle} · ID: <code>{channel.channelId}</code>)?
        </p>

        <ul
          style={{
            margin: '0.6rem 0',
            paddingLeft: '1.25rem',
            fontSize: '0.8rem',
            color: 'var(--color-text, #16202b)',
            lineHeight: 1.5
          }}
        >
          <li>Token akses & refresh token di sisi server akan dicabut dan dihapus.</li>
          <li>Histori metrik harian yang sudah tersimpan tetap aman untuk laporan.</li>
          <li>Tindakan ini akan dicatat otomatis ke dalam Jejak Audit Sistem.</li>
        </ul>

        <label style={{ display: 'block', marginTop: '0.85rem', fontSize: '0.8rem' }}>
          <span style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>
            Catatan Alasan Pelepasan (Untuk Log Audit):
          </span>
          <input
            type="text"
            data-testid="input-disconnect-youtube-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={{
              width: '100%',
              padding: '7px 10px',
              fontSize: '0.82rem',
              borderRadius: '8px',
              border: '1px solid var(--color-border, #cbd5e1)'
            }}
          />
        </label>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.5rem',
            marginTop: '1.25rem'
          }}
        >
          <button
            type="button"
            data-testid="btn-cancel-disconnect-youtube"
            onClick={onCancel}
            className="dasbor__btn"
          >
            Batal
          </button>
          <button
            type="button"
            data-testid="btn-confirm-disconnect-youtube"
            onClick={() => onConfirm(reason)}
            className="dasbor__btn"
            style={{ background: '#dc2626', color: '#fff', borderColor: '#b91c1c' }}
          >
            Ya, Putuskan Sambungan
          </button>
        </div>
      </div>
    </div>
  );
}

export default YouTubeDisconnectDialog;

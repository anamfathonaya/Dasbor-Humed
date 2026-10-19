'use client';

import React from 'react';

export interface YouTubeEmptyStateCardProps {
  canManage: boolean;
  onConnectOAuth: () => void;
  onRestoreSampleChannels?: () => void;
}

export function YouTubeEmptyStateCard({
  canManage,
  onConnectOAuth,
  onRestoreSampleChannels
}: YouTubeEmptyStateCardProps) {
  return (
    <div
      data-testid="youtube-empty-state"
      style={{
        padding: '2.5rem 1.5rem',
        textAlign: 'center',
        borderRadius: '12px',
        border: '1px dashed var(--color-border, #cbd5e1)',
        background: 'var(--color-bg-subtle, #f8fafc)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.85rem'
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.1)',
          color: '#dc2626',
          display: 'grid',
          placeItems: 'center',
          fontSize: '1.4rem'
        }}
        aria-hidden="true"
      >
        📺
      </div>

      <h3 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 700 }}>
        Belum Ada Kanal YouTube yang Tersambung
      </h3>

      {canManage ? (
        <>
          <p
            style={{
              margin: 0,
              maxWidth: '520px',
              fontSize: '0.84rem',
              color: 'var(--color-muted, #5a6875)',
              lineHeight: 1.55
            }}
          >
            <b>Arahan Administrator:</b> Sambungkan akun resmi YouTube organisasi menggunakan izin
            OAuth 2.0 hanya-baca (<code>youtube.readonly</code> &{' '}
            <code>yt-analytics.readonly</code>) agar penarikan metrik pelanggan, tayangan, dan
            interaksi harian dapat berjalan otomatis.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '0.5rem' }}>
            <button
              type="button"
              data-testid="empty-state-connect-youtube-btn"
              onClick={onConnectOAuth}
              className="dasbor__btn dasbor__btn--primary"
            >
              + Sambungkan Akun YouTube Sekarang
            </button>
            {onRestoreSampleChannels && (
              <button
                type="button"
                onClick={onRestoreSampleChannels}
                className="dasbor__btn"
              >
                Muat Ulang Data Tiruan (2 Kanal)
              </button>
            )}
          </div>
        </>
      ) : (
        <div
          data-testid="youtube-staff-guidance-message"
          style={{
            maxWidth: '520px',
            padding: '0.85rem 1rem',
            borderRadius: '8px',
            background: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            fontSize: '0.82rem',
            color: '#1e40af',
            lineHeight: 1.5
          }}
        >
          <b>Arahan untuk Anggota Tim (Staf):</b> Saat ini belum ada kanal YouTube yang terhubung.
          Penyambungan OAuth hanya dapat dilakukan oleh <b>Kepala Humas</b> atau{' '}
          <b>Admin Teknis</b>. Silakan hubungi Administrator untuk menyambungkan kanal resmi.
        </div>
      )}
    </div>
  );
}

export default YouTubeEmptyStateCard;

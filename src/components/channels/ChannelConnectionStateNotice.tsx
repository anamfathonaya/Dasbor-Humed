'use client';

import React from 'react';
import Link from 'next/link';
import type { ChannelSummaryData } from './ChannelMonitoringView';

export type ConnectionSimulationState = 'normal' | 'unconnected' | 'sync_failed';

export interface ChannelConnectionStateNoticeProps {
  channels: ChannelSummaryData[];
  simulationState: ConnectionSimulationState;
  onChangeSimulationState: (state: ConnectionSimulationState) => void;
}

export function ChannelConnectionStateNotice({
  channels,
  simulationState,
  onChangeSimulationState
}: ChannelConnectionStateNoticeProps) {
  const unconnectedChannels = channels.filter((ch) => ch.status === 'not_connected');
  const failedChannels = channels.filter(
    (ch) => ch.status === 'sync_failed' || ch.status === 'reauth_required'
  );

  return (
    <section
      className="dasbor__card"
      aria-label="Status sambungan kanal dan simulasi kondisi"
      data-testid="channel-connection-state-section"
      style={{ padding: '1rem 1.25rem' }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem'
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700 }}>
            Kondisi Sambungan & Ketahanan Sinkronisasi Kanal
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--color-muted, #5a6875)' }}>
            Kegagalan tarik atau kanal yang belum tersambung tetap terisolasi tanpa menghentikan kanal lainnya
          </p>
        </div>

        {/* Tombol Simulasi Kondisi untuk Uji Tampilan (Pratinjau UI) */}
        <div
          role="group"
          aria-label="Simulasi kondisi sambungan kanal"
          style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px' }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-muted, #64748b)' }}>
            Pratinjau Status:
          </span>
          {(
            [
              { id: 'normal', label: 'Semua Normal (Contoh)' },
              { id: 'unconnected', label: 'Simulasi Belum Tersambung' },
              { id: 'sync_failed', label: 'Simulasi Gagal Tarik' }
            ] as const
          ).map((mode) => {
            const active = simulationState === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                data-testid={`sim-mode-${mode.id}`}
                onClick={() => onChangeSimulationState(mode.id)}
                className={`dasbor__btn ${active ? 'dasbor__btn--primary' : ''}`}
                style={{ minHeight: '30px', padding: '0 10px', fontSize: '11px' }}
                aria-pressed={active}
              >
                {mode.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Peringatan ketika ada kanal belum tersambung */}
      {unconnectedChannels.length > 0 && (
        <div
          role="status"
          data-testid="banner-channel-unconnected"
          style={{
            marginTop: '0.85rem',
            padding: '0.85rem 1rem',
            borderRadius: '10px',
            background: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.28)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <span style={{ fontSize: '1.15rem' }} aria-hidden="true">
              🔌
            </span>
            <div>
              <strong style={{ fontSize: '0.88rem', color: '#93c5fd', display: 'block' }}>
                {unconnectedChannels.length} Kanal Belum Tersambung (
                {unconnectedChannels.map((c) => c.platformLabel).join(', ')})
              </strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text, #ffffff)' }}>
                Kanal ini belum dihubungkan melalui OAuth resmi. Angka yang ditampilkan saat ini menggunakan data contoh agar halaman pemantauan tetap dapat dicoba oleh tim.
              </span>
            </div>
          </div>
          <Link
            href="/pengaturan"
            className="dasbor__btn dasbor__btn--primary"
            style={{ fontSize: '12px', minHeight: '32px' }}
          >
            Sambungkan Kanal di Pengaturan
          </Link>
        </div>
      )}

      {/* Peringatan ketika ada kanal gagal tarik / kedaluwarsa izin */}
      {failedChannels.length > 0 && (
        <div
          role="alert"
          data-testid="banner-channel-sync-failed"
          style={{
            marginTop: '0.85rem',
            padding: '0.85rem 1rem',
            borderRadius: '10px',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <span style={{ fontSize: '1.15rem' }} aria-hidden="true">
              ⚠️
            </span>
            <div>
              <strong style={{ fontSize: '0.88rem', color: '#f87171', display: 'block' }}>
                Penarikan Metrik Terkendala pada{' '}
                {failedChannels.map((c) => c.platformLabel).join(', ')}
              </strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text, #ffffff)' }}>
                {failedChannels[0]?.errorMessage ||
                  'Terjadi kendala saat menarik metrik terbaru (batas kuota API atau izin OAuth kedaluwarsa). Data historis terakhir tetap ditampilkan dengan aman.'}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link
              href="/pengaturan"
              className="dasbor__btn"
              style={{ fontSize: '12px', minHeight: '32px' }}
            >
              Periksa & Segarkan Izin
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}

export default ChannelConnectionStateNotice;

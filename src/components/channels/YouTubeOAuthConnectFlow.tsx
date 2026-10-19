'use client';

import React, { useState } from 'react';

export type YouTubeOAuthFlowStep =
  | 'idle'
  | 'requesting_consent'
  | 'exchanging_token'
  | 'fetching_channel_profile'
  | 'completed'
  | 'error';

export interface YouTubeOAuthConnectFlowProps {
  canManage: boolean;
  onConnected: () => void;
}

const FLOW_STEPS: Array<{
  id: Exclude<YouTubeOAuthFlowStep, 'idle' | 'error'>;
  label: string;
  desc: string;
}> = [
  {
    id: 'requesting_consent',
    label: '1. Persetujuan OAuth Google',
    desc: 'Meminta izin hanya-baca (youtube.readonly & yt-analytics.readonly)'
  },
  {
    id: 'exchanging_token',
    label: '2. Pertukaran Token & Enkripsi Server',
    desc: 'Menyimpan access_token & refresh_token terenkripsi di basis data server'
  },
  {
    id: 'fetching_channel_profile',
    label: '3. Pembacaan Profil Kanal',
    desc: 'Mengambil identitas kanal resmi dari YouTube Data API v3'
  },
  {
    id: 'completed',
    label: '4. Tersambung & Tercatat di Audit',
    desc: 'Kanal aktif dan siap ditarik metrik hariannya'
  }
];

export function YouTubeOAuthConnectFlow({
  canManage,
  onConnected
}: YouTubeOAuthConnectFlowProps) {
  const [step, setStep] = useState<YouTubeOAuthFlowStep>('idle');

  const startOAuthSimulation = () => {
    if (!canManage) return;
    setStep('requesting_consent');

    setTimeout(() => {
      setStep('exchanging_token');
    }, 250);

    setTimeout(() => {
      setStep('fetching_channel_profile');
    }, 500);

    setTimeout(() => {
      setStep('completed');
      onConnected();
    }, 750);
  };

  const isRunning =
    step === 'requesting_consent' ||
    step === 'exchanging_token' ||
    step === 'fetching_channel_profile';

  return (
    <section
      className="dasbor__card"
      aria-label="Alur penyambungan OAuth YouTube"
      data-testid="youtube-oauth-connect-flow"
      style={{ padding: '1rem 1.25rem' }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
            Sambungkan Akun Resmi YouTube (OAuth 2.0)
          </h2>
          <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: 'var(--color-muted, #5a6875)' }}>
            Menghubungkan kanal resmi tanpa membagikan kata sandi akun Google kepada aplikasi
          </p>
        </div>

        {canManage ? (
          <button
            type="button"
            data-testid="btn-connect-youtube-oauth"
            onClick={startOAuthSimulation}
            disabled={isRunning}
            className="dasbor__btn dasbor__btn--primary"
          >
            {/* @ts-ignore iconify web component */}
            <iconify-icon icon="lucide:youtube" aria-hidden="true" />
            <span>
              {isRunning
                ? 'Memproses Otorisasi OAuth...'
                : step === 'completed'
                ? '+ Sambungkan Kanal YouTube Lainnya'
                : '+ Sambungkan Akun YouTube (OAuth)'}
            </span>
          </button>
        ) : (
          <span className="dasbor__badge dasbor__badge--flat" style={{ fontSize: '12px' }}>
            Hanya Admin / Kepala Humas yang dapat menyambungkan kanal
          </span>
        )}
      </div>

      {/* Tahapan Status Alur OAuth */}
      {step !== 'idle' && (
        <div
          data-testid="youtube-oauth-flow-steps"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.75rem',
            marginTop: '1rem',
            paddingTop: '0.85rem',
            borderTop: '1px solid var(--color-border, #e2e8f0)'
          }}
        >
          {FLOW_STEPS.map((item, idx) => {
            const stepOrder = [
              'requesting_consent',
              'exchanging_token',
              'fetching_channel_profile',
              'completed'
            ];
            const currentIdx = stepOrder.indexOf(step);
            const isDone = currentIdx > idx || step === 'completed';
            const isActive = currentIdx === idx && step !== 'completed';

            return (
              <div
                key={item.id}
                style={{
                  padding: '0.65rem 0.8rem',
                  borderRadius: '8px',
                  border: isActive
                    ? '1px solid #2563eb'
                    : isDone
                    ? '1px solid rgba(16, 185, 129, 0.35)'
                    : '1px solid var(--color-border, #e2e8f0)',
                  background: isActive
                    ? 'rgba(59, 130, 246, 0.06)'
                    : isDone
                    ? 'rgba(16, 185, 129, 0.06)'
                    : 'var(--color-surface, #ffffff)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <strong style={{ fontSize: '0.8rem' }}>{item.label}</strong>
                  <span style={{ fontSize: '0.75rem' }}>
                    {isDone ? '✅' : isActive ? '⏳' : '⚪'}
                  </span>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '0.73rem', color: 'var(--color-muted, #64748b)' }}>
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default YouTubeOAuthConnectFlow;

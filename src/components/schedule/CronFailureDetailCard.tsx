'use client';

import React from 'react';

export interface CronFailureDetail {
  id: string;
  taskName: string;
  failedAt: string;
  errorMessage: string;
  stackTrace?: string;
  retryCount: number;
  maxRetries: number;
  suggestedAction: string;
}

export function CronFailureDetailCard({
  failure = {
    id: 'fail-991',
    taskName: 'Sinkronisasi RSS BMKG',
    failedAt: '18 Okt 2026, 18:45 WIB',
    errorMessage: 'ETIMEDOUT: Koneksi ke endpoint feed luar melebihi ambang batas 10000ms',
    stackTrace: 'Error: Connection timeout at fetchWithTimeout (src/lib/newsScheduler.ts:45)\n  at processCronJob (src/app/api/cron/news-sync/route.ts:18)',
    retryCount: 2,
    maxRetries: 3,
    suggestedAction: 'Sistem telah menjadwalkan percobaan ulang otomatis dalam 5 menit.'
  }
}: { failure?: CronFailureDetail }) {
  return (
    <article
      className="dasbor__card"
      style={{
        borderLeft: '4px solid #ef4444',
        background: '#fff',
        padding: '1.25rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.75rem' }}>
        <div>
          <span className="dasbor__badge dasbor__badge--amber" style={{ marginBottom: '6px' }}>
            Percobaan #{failure.retryCount} dari {failure.maxRetries}
          </span>
          <h3 style={{ margin: '4px 0', fontSize: '1rem', color: '#991b1b' }}>
            Kegagalan Eksekusi: {failure.taskName}
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-muted, #64748b)' }}>
            Waktu Insiden: {failure.failedAt} (ID: {failure.id})
          </span>
        </div>

        <button
          type="button"
          className="dasbor__btn"
          style={{ fontSize: '0.82rem' }}
          onClick={() => alert(`Memicu eksekusi ulang manual untuk ${failure.taskName}...`)}
        >
          {/* @ts-ignore iconify web component */}
          <iconify-icon icon="lucide:refresh-cw" aria-hidden="true" />
          <span>Jalankan Manual Sekarang</span>
        </button>
      </div>

      <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '6px', padding: '0.75rem', marginBottom: '0.75rem' }}>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#7f1d1d', fontFamily: 'monospace' }}>
          {failure.errorMessage}
        </p>
      </div>

      {failure.stackTrace && (
        <details style={{ fontSize: '0.8rem', color: '#64748b', cursor: 'pointer' }}>
          <summary style={{ fontWeight: 600, marginBottom: '4px' }}>Lihat Jejak Panggilan (Stack Trace)</summary>
          <pre style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '4px', overflowX: 'auto', fontSize: '0.75rem' }}>
            {failure.stackTrace}
          </pre>
        </details>
      )}

      <p style={{ margin: '0.75rem 0 0', fontSize: '0.82rem', color: 'var(--color-muted, #64748b)' }}>
        <b>Langkah Mitigasi:</b> {failure.suggestedAction}
      </p>
    </article>
  );
}

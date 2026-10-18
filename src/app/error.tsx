'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { HumasShell } from '@/components/layout/HumasShell';

export default function ErrorBoundary({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <HumasShell
      pageTitle="Terjadi Kendala Sistem"
      pageSubtitle="Error 500 — Permintaan tidak dapat diproses"
    >
      <div
        style={{
          padding: '4rem 2rem',
          textAlign: 'center',
          background: 'var(--color-surface, #ffffff)',
          borderRadius: '8px',
          border: '1px solid var(--color-border, #e2e8f0)',
          maxWidth: '640px',
          margin: '2rem auto'
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#b91c1c' }}>
          Terjadi Gangguan pada Modul
        </h2>
        <p style={{ color: 'var(--color-muted, #64748b)', margin: '0 0 1.5rem', lineHeight: 1.6 }}>
          {error.message || 'Sistem mendeteksi kendala pada pemuatan modul halaman.'}
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => reset()}
            className="dasbor__btn dasbor__btn--primary"
          >
            Coba Lagi
          </button>
          <Link href="/dasbor" className="dasbor__btn" style={{ textDecoration: 'none' }}>
            Ke Dasbor
          </Link>
        </div>
      </div>
    </HumasShell>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { HumasShell } from '@/components/layout/HumasShell';
import { useLayout } from '@/components/layout/LayoutContext';

export default function AksesDitolakPage() {
  const { currentRole } = useLayout();

  return (
    <HumasShell
      pageTitle="Akses Ditolak"
      pageSubtitle="Halaman Terbatas Khusus Administrator dan Pimpinan Humas"
      pageContentId="dasbor-utama"
    >
      <div className="dasbor" data-testid="access-denied-page" style={{ maxWidth: '680px', margin: '2rem auto' }}>
        <div
          className="dasbor__card"
          style={{
            textAlign: 'center',
            padding: '2.5rem 1.75rem',
            background: 'var(--color-surface, #0f172a)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '0.75rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)'
          }}
        >
          <div
            style={{
              width: '4rem',
              height: '4rem',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.12)',
              color: '#ef4444',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              marginBottom: '1.25rem'
            }}
          >
            🔒
          </div>

          <h1
            style={{
              fontSize: '1.45rem',
              fontWeight: 700,
              color: 'var(--color-text, #f1f5f9)',
              margin: '0 0 0.5rem'
            }}
            data-testid="access-denied-title"
          >
            Akses Dibatasi: Hak Kelola Integrasi Kanal
          </h1>

          <p
            className="dasbor__muted"
            style={{
              fontSize: '0.9rem',
              lineHeight: 1.6,
              maxWidth: '520px',
              margin: '0 auto 1.5rem'
            }}
          >
            Halaman konfigurasi kredensial OAuth, penyambungan kanal resmi, perbaruan token, dan pemutusan sambungan hanya dapat diakses oleh pengguna dengan peran <strong>Admin Teknis</strong> atau <strong>Kepala Humas</strong>.
          </p>

          <div
            style={{
              padding: '1rem',
              borderRadius: '0.5rem',
              background: 'var(--color-surface-muted, #1e293b)',
              border: '1px solid var(--color-border, #334155)',
              textAlign: 'left',
              fontSize: '0.82rem',
              marginBottom: '1.75rem'
            }}
            data-testid="access-denied-info-box"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span className="dasbor__muted">Peran Anda Saat Ini:</span>
              <span className="dasbor__badge dasbor__badge--flat" style={{ textTransform: 'capitalize' }}>
                {currentRole}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span className="dasbor__muted">Peran yang Dibutuhkan:</span>
              <span className="dasbor__badge dasbor__badge--up">
                Admin / Kepala Humas
              </span>
            </div>
            <div style={{ borderTop: '1px dashed var(--color-border, #334155)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
              <span className="dasbor__muted">
                🛡️ Anggota tim (Staf) tetap dapat melihat metrik kanal yang telah ditarik di halaman <strong>Pemantauan Kanal</strong> dan modul <strong>Laporan Kinerja</strong> tanpa memerlukan akses kredensial.
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link
              href="/pemantauan-kanal"
              className="dasbor__btn dasbor__btn--primary"
              data-testid="btn-back-to-monitoring"
              style={{ padding: '0.55rem 1.25rem', fontSize: '0.86rem' }}
            >
              Lihat Pemantauan Kanal
            </Link>
            <Link
              href="/dasbor"
              className="dasbor__btn"
              data-testid="btn-back-to-dashboard"
              style={{ padding: '0.55rem 1.25rem', fontSize: '0.86rem' }}
            >
              Kembali ke Dasbor Utama
            </Link>
          </div>
        </div>
      </div>
    </HumasShell>
  );
}

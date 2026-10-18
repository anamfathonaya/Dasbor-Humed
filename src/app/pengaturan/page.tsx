'use client';

import React from 'react';
import { HumasShell } from '@/components/layout/HumasShell';
import { useLayout } from '@/components/layout/LayoutContext';
import RoleMatrixTable from '@/components/RoleMatrixTable';

export default function PengaturanPage() {
  const { currentRole } = useLayout();

  if (currentRole === 'staff') {
    return (
      <HumasShell
        pageTitle="Pengaturan & Integrasi"
        pageSubtitle="Konfigurasi sistem & kredensial integrasi · 2026"
      >
        <div
          style={{
            padding: '3rem',
            textAlign: 'center',
            background: 'var(--color-surface, #ffffff)',
            borderRadius: '8px',
            border: '1px solid var(--color-border, #e2e8f0)'
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔒</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#b91c1c', margin: '0 0 0.5rem' }}>
            Akses Terbatas (403 Forbidden)
          </h2>
          <p style={{ color: 'var(--color-muted, #64748b)', maxWidth: '480px', margin: '0 auto' }}>
            Halaman Pengaturan & Integrasi hanya dapat diakses oleh Kepala Humas atau Admin Teknis.
          </p>
        </div>
      </HumasShell>
    );
  }

  return (
    <HumasShell
      pageTitle="Pengaturan & Integrasi"
      pageSubtitle="DAM NAS, Google Workspace, dan konektor API platform · 2026"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <section className="dasbor__bar">
          <p className="dasbor__bar-text">
            <b>Status Integrasi:</b> 3 integrasi aktif, 1 butuh pembaruan token (Meta Ads).
          </p>
        </section>

        <div className="dasbor__analytics-grid">
          <article className="dasbor__card">
            <div className="dasbor__card-head">
              <div>
                <h2>Google Workspace & Drive DAM</h2>
                <p>Sinkronisasi kalender liputan & repositori berkas foto</p>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-muted, #64748b)' }}>
              Akun: humas@pedulinegeri.org (Aktif tersambung)
            </p>
            <button type="button" className="dasbor__btn">
              Sinkronkan Ulang
            </button>
          </article>

          <article className="dasbor__card">
            <div className="dasbor__card-head">
              <div>
                <h2>Meta Marketing API & Graph</h2>
                <p>Pengambilan data metrik impresi Instagram & Facebook</p>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#b45309' }}>
              ⚠️ Perlu Refresh Token sebelum tenggat bulan ini.
            </p>
            <button type="button" className="dasbor__btn dasbor__btn--primary">
              Perbarui Token
            </button>
          </article>
        </div>

        {/* Matriks Hak Akses & Peran Pengguna (RBAC) */}
        <section style={{ marginTop: '1rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 600, margin: '0 0 0.25rem' }}>
              Matriks Hak Akses & Peran Pengguna (RBAC)
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-muted, #64748b)', margin: 0 }}>
              Konfigurasi izin akses per peran staf untuk modul konten, anggaran, SOP, dan sistem audit.
            </p>
          </div>
          <RoleMatrixTable editable={currentRole === 'head'} />
        </section>
      </div>
    </HumasShell>
  );
}

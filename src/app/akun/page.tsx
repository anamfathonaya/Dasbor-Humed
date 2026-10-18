'use client';

import React from 'react';
import { HumasShell } from '@/components/layout/HumasShell';
import { useLayout } from '@/components/layout/LayoutContext';
import RoleMatrixTable from '@/components/RoleMatrixTable';

export default function AkunAuditPage() {
  const { currentRole } = useLayout();

  if (currentRole === 'staff') {
    return (
      <HumasShell
        pageTitle="Akun & Audit"
        pageSubtitle="Manajemen staf & log keamanan · 2026"
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
            Manajemen akun staf dan jejak audit memerlukan peran Kepala Humas atau Admin Teknis.
          </p>
        </div>
      </HumasShell>
    );
  }

  return (
    <HumasShell
      pageTitle="Akun & Audit"
      pageSubtitle="Matriks RBAC, daftar staf terverifikasi, dan log keamanan · 2026"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <section className="dasbor__bar">
          <p className="dasbor__bar-text">
            <b>Keamanan & Hak Akses:</b> Seluruh aktivitas staf dicatat dalam audit trail terenkripsi.
          </p>
        </section>

        {/* Tabel Hak Akses RBAC yang dipakai ulang */}
        <RoleMatrixTable />
      </div>
    </HumasShell>
  );
}

'use client';

import React from 'react';
import { HumasShell } from '@/components/layout/HumasShell';
import { useLayout } from '@/components/layout/LayoutContext';

export default function ProfilAkunPage() {
  const { currentUser } = useLayout();

  return (
    <HumasShell
      pageTitle="Profil Akun"
      pageSubtitle="Pengaturan akun pengguna & preferensi staf · 2026"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '720px' }}>
        <article className="dasbor__card">
          <div className="dasbor__card-head">
            <div>
              <h2>Informasi Staf</h2>
              <p>Rincian akun yang sedang masuk saat ini</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', margin: '1rem 0' }}>
            <span
              className="l-humas__avatar"
              style={{ width: '56px', height: '56px', fontSize: '1.25rem' }}
            >
              {currentUser.initials}
            </span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{currentUser.name}</h3>
              <p style={{ margin: '4px 0 0', color: 'var(--color-muted, #64748b)', fontSize: '0.85rem' }}>
                Peran Aktif: <b>{currentUser.roleLabel}</b>
              </p>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--color-border, #e2e8f0)', paddingTop: '1rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-muted, #64748b)', lineHeight: 1.6 }}>
              Di Next.js dan Supabase Auth, perubahan foto profil akan disinkronkan ke Supabase Storage,
              dan penyetelan kata sandi baru diproses melalui tautan reset resmi.
            </p>
          </div>
        </article>
      </div>
    </HumasShell>
  );
}

import React from 'react';
import Link from 'next/link';
import { HumasShell } from '@/components/layout/HumasShell';

export default function NotFound() {
  return (
    <HumasShell
      pageTitle="Halaman Tidak Ditemukan"
      pageSubtitle="Error 404 — Halaman yang Anda cari tidak tersedia"
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
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧭</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
          Halaman Tidak Ditemukan (404)
        </h2>
        <p style={{ color: 'var(--color-muted, #64748b)', margin: '0 0 1.5rem', lineHeight: 1.6 }}>
          Alamat rute modul yang Anda tuju mungkin telah dipindahkan atau belum tersedia
          pada fase migrasi ini.
        </p>
        <Link href="/dasbor" className="dasbor__btn dasbor__btn--primary" style={{ textDecoration: 'none' }}>
          Kembali ke Dasbor Utama
        </Link>
      </div>
    </HumasShell>
  );
}

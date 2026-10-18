'use client';

import React, { useState } from 'react';
import { HumasShell } from '@/components/layout/HumasShell';
import { StandardPagePattern } from '@/components/layout/StandardPagePattern';
import { useLayout } from '@/components/layout/LayoutContext';
import { mockBudgetLines } from '@/lib/clientDataFetcher';

export default function LaporanPage() {
  const { currentRole } = useLayout();
  const [searchQuery, setSearchQuery] = useState('');

  // Batasi akses: Hanya Head dan Admin
  if (currentRole === 'staff') {
    return (
      <HumasShell
        pageTitle="Laporan & Anggaran"
        pageSubtitle="Rencana & Realisasi Anggaran (RAB/LRA) · 2026"
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
            Modul Laporan Anggaran, RAB & LRA memerlukan wewenang Kepala Humas atau Admin Teknis.
            Peran Anda saat ini: <b>Staf Konten</b>.
          </p>
        </div>
      </HumasShell>
    );
  }

  const filtered = mockBudgetLines.filter((b) =>
    !searchQuery ||
    b.program.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <HumasShell
      pageTitle="Laporan & Anggaran"
      pageSubtitle="RAB, LRA & Laporan Kinerja Humas Media · 2026"
    >
      <StandardPagePattern
        title="Laporan & Anggaran"
        subtitle="Rincian alokasi dan realisasi belanja"
        statusBarText={
          <span>
            <b>Realisasi Pagu Anggaran 2026:</b> Terdaftar {mockBudgetLines.length} pos kegiatan program humas & media.
          </span>
        }
        headerActions={
          <button type="button" className="dasbor__btn dasbor__btn--primary">
            {/* @ts-ignore iconify web component */}
            <iconify-icon icon="lucide:download" aria-hidden="true" />
            <span>Ekspor PDF / Excel</span>
          </button>
        }
        searchPlaceholder="Cari nama program, kategori..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        totalCountText={`Menampilkan ${filtered.length} pos anggaran`}
        renderTable={() => (
          <div className="dasbor__card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="dasbor__table-wrap">
              <table className="dasbor__table">
                <thead>
                  <tr>
                    <th scope="col" style={{ width: '100px' }}>Kuartal</th>
                    <th scope="col">Nama Program Humas</th>
                    <th scope="col" style={{ width: '150px' }}>Kategori</th>
                    <th scope="col" style={{ width: '150px', textAlign: 'right' }}>Rencana (RAB)</th>
                    <th scope="col" style={{ width: '150px', textAlign: 'right' }}>Realisasi (LRA)</th>
                    <th scope="col" style={{ width: '110px', textAlign: 'center' }}>Serapan</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{item.quarter} {item.year}</td>
                      <td>
                        <strong style={{ fontSize: '0.88rem', color: 'var(--color-text, #0f172a)' }}>
                          {item.program}
                        </strong>
                        <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--color-muted, #64748b)' }}>
                          Pengelola: {item.owner}
                        </p>
                      </td>
                      <td>
                        <span className="dasbor__badge dasbor__badge--blue" style={{ fontSize: '11px' }}>
                          {item.category}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 500 }}>
                        Rp {item.rab.toLocaleString('id-ID')}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        Rp {item.lra.toLocaleString('id-ID')}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span
                          className={`dasbor__badge ${
                            item.status === 'hemat'
                              ? 'dasbor__badge--up'
                              : item.status === 'sesuai'
                              ? 'dasbor__badge--blue'
                              : 'dasbor__badge--amber'
                          }`}
                          style={{ fontSize: '11px' }}
                        >
                          {((item.lra / item.rab) * 100).toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      />
    </HumasShell>
  );
}

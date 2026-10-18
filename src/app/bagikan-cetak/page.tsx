'use client';

import React from 'react';
import Link from 'next/link';
import { HumasShell } from '@/components/layout/HumasShell';
import { mockBudgetLines } from '@/lib/clientDataFetcher';

export default function BagikanCetakPage() {
  const currentYear = 2026;
  const budgetItems = mockBudgetLines.filter((item) => item.year === currentYear);
  const totalRAB = budgetItems.reduce((acc, curr) => acc + curr.rab, 0);
  const totalLRA = budgetItems.reduce((acc, curr) => acc + curr.lra, 0);
  const absorption = totalRAB > 0 ? ((totalLRA / totalRAB) * 100).toFixed(1) : '0';

  return (
    <HumasShell
      pageTitle="Salinan Resmi Dokumen & Cetak Laporan"
      pageSubtitle="Pratinjau format lembar cetak standar berkop resmi yayasan, ekspor PDF, salin tautan, dan distribusi dokumen · 2026"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Sub-Navigasi Modul Laporan */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Link href="/laporan" className="dasbor__btn">
            Ringkasan Semua Laporan
          </Link>
          <Link href="/laporan-kinerja" className="dasbor__btn">
            Laporan Kinerja Kanal
          </Link>
          <Link href="/bagikan-cetak" className="dasbor__btn dasbor__btn--primary">
            Bagikan & Cetak
          </Link>
        </div>

        {/* Toolbar Cetak & Bagikan */}
        <div className="dasbor__card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="dasbor__btn"
                onClick={() => {
                  if (typeof navigator !== 'undefined' && navigator.clipboard) {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Tautan salinan resmi laporan berhasil disalin ke clipboard!');
                  }
                }}
              >
                {/* @ts-ignore iconify web component */}
                <iconify-icon icon="lucide:link" aria-hidden="true" />
                <span>Salin Tautan</span>
              </button>

              <button
                type="button"
                className="dasbor__btn"
                onClick={() => {
                  alert('Laporan siap didistribusikan ke komite pengawas dan mitra donor.');
                }}
              >
                {/* @ts-ignore iconify web component */}
                <iconify-icon icon="lucide:send" aria-hidden="true" />
                <span>Bagikan ke Mitra</span>
              </button>
            </div>

            <button
              type="button"
              className="dasbor__btn dasbor__btn--primary"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.print();
                }
              }}
            >
              {/* @ts-ignore iconify web component */}
              <iconify-icon icon="lucide:printer" aria-hidden="true" />
              <span>Cetak / Simpan PDF</span>
            </button>
          </div>
        </div>

        {/* Lembar Format Cetak */}
        <article className="dasbor__card" style={{ padding: '2rem', background: '#fff' }}>
          <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '1.3rem', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Yayasan Peduli Negeri Indonesia
            </h1>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-muted, #64748b)' }}>
              Bidang Hubungan Masyarakat & Komunikasi Publik · Lembar Salinan Laporan Resmi {currentYear}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '6px' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Total Pagu Rencana (RAB)</span>
              <p style={{ margin: '4px 0 0', fontWeight: 600, fontSize: '1.1rem' }}>
                Rp {totalRAB.toLocaleString('id-ID')}
              </p>
            </div>
            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '6px' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Realisasi Berjalan (LRA)</span>
              <p style={{ margin: '4px 0 0', fontWeight: 600, fontSize: '1.1rem' }}>
                Rp {totalLRA.toLocaleString('id-ID')}
              </p>
            </div>
            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '6px' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Tingkat Penyerapan</span>
              <p style={{ margin: '4px 0 0', fontWeight: 600, fontSize: '1.1rem', color: '#0369a1' }}>
                {absorption}%
              </p>
            </div>
          </div>

          <div className="dasbor__table-wrap">
            <table className="dasbor__table">
              <thead>
                <tr>
                  <th scope="col">Nama Program Humas</th>
                  <th scope="col">Kategori</th>
                  <th scope="col" style={{ textAlign: 'right' }}>Pagu (RAB)</th>
                  <th scope="col" style={{ textAlign: 'right' }}>Realisasi (LRA)</th>
                </tr>
              </thead>
              <tbody>
                {budgetItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong style={{ fontSize: '0.88rem' }}>{item.program}</strong>
                      <span style={{ display: 'block', fontSize: '0.78rem', color: '#64748b' }}>{item.quarter}</span>
                    </td>
                    <td>{item.category}</td>
                    <td style={{ textAlign: 'right' }}>Rp {item.rab.toLocaleString('id-ID')}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>Rp {item.lra.toLocaleString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </div>
    </HumasShell>
  );
}

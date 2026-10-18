'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { HumasShell } from '@/components/layout/HumasShell';
import { StandardPagePattern } from '@/components/layout/StandardPagePattern';
import { mockProposals } from '@/lib/clientDataFetcher';

export default function StatusUsulanSopPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = mockProposals.filter((p) => {
    const matchQuery =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.submitterName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status.toLowerCase() === statusFilter.toLowerCase();
    return matchQuery && matchStatus;
  });

  return (
    <HumasShell
      pageTitle="Status Usulan SOP"
      pageSubtitle="Alur pengajuan, telaah komite, revisi redaksional, dan persetujuan pengesahan SOP baru · 2026"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Navigasi Sub-Modul Pengetahuan */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Link href="/basis-pengetahuan" className="dasbor__btn">
            Katalog Dokumen Resmi
          </Link>
          <Link href="/sop" className="dasbor__btn">
            SOP Visual & Checklist
          </Link>
          <Link href="/status-usulan-sop" className="dasbor__btn dasbor__btn--primary">
            Status Usulan SOP
          </Link>
        </div>

        <StandardPagePattern
          title="Status Usulan SOP & Panduan"
          subtitle="Daftar pengajuan pembaruan prosedur operasional lembaga"
          statusBarText={
            <span>
              <b>Status Alur Usulan:</b> {mockProposals.length} pengajuan tercatat, diproses melalui mekanisme telaah sejawat.
            </span>
          }
          searchPlaceholder="Cari judul usulan, nama pengusul..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          totalCountText={`Menampilkan ${filtered.length} usulan`}
          renderTable={() => (
            <article className="dasbor__card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="dasbor__table-wrap">
                <table className="dasbor__table">
                  <thead>
                    <tr>
                      <th scope="col" style={{ width: '130px' }}>ID Usulan</th>
                      <th scope="col">Judul Pembaruan / Usulan Baru</th>
                      <th scope="col" style={{ width: '140px' }}>Dokumen Target</th>
                      <th scope="col" style={{ width: '150px' }}>Pengusul</th>
                      <th scope="col" style={{ width: '120px', textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item) => (
                      <tr key={item.id}>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>
                          <strong>{item.id}</strong>
                        </td>
                        <td>
                          <strong style={{ fontSize: '0.88rem', color: 'var(--color-text, #0f172a)' }}>
                            {item.title}
                          </strong>
                          <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--color-muted, #64748b)' }}>
                            Diajukan: {item.submittedAt}
                          </p>
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>
                          <span className="dasbor__badge dasbor__badge--blue" style={{ fontSize: '11px' }}>
                            {item.targetDocCode || 'Baru'}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>
                          {item.submitterName}
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-muted, #64748b)' }}>
                            {item.submitterRole}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span
                            className={`dasbor__badge ${
                              item.status === 'approved'
                                ? 'dasbor__badge--up'
                                : item.status === 'review'
                                ? 'dasbor__badge--amber'
                                : 'dasbor__badge--blue'
                            }`}
                            style={{ fontSize: '11px' }}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          )}
        />
      </div>
    </HumasShell>
  );
}

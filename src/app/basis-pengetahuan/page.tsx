'use client';

import React, { useState } from 'react';
import { HumasShell } from '@/components/layout/HumasShell';
import { StandardPagePattern } from '@/components/layout/StandardPagePattern';
import { mockKnowledgeDocs } from '@/lib/clientDataFetcher';

export default function BasisPengetahuanPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = mockKnowledgeDocs.filter((d) =>
    !searchQuery ||
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <HumasShell
      pageTitle="Basis Pengetahuan"
      pageSubtitle="Repositori SOP resmi, panduan krisis, etika peliputan bencana & alur kerja lembaga · 2026"
    >
      <StandardPagePattern
        title="Basis Pengetahuan"
        subtitle="Dokumen rujukan operasional terverifikasi"
        statusBarText={
          <span>
            <b>Katalog Dokumen Resmi:</b> {mockKnowledgeDocs.length} prosedur SOP & pedoman standar aktif.
          </span>
        }
        searchPlaceholder="Cari judul pedoman, standar etika, kata kunci..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        totalCountText={`Menampilkan ${filtered.length} dokumen`}
        renderTable={() => (
          <div className="dasbor__card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="dasbor__table-wrap">
              <table className="dasbor__table">
                <thead>
                  <tr>
                    <th scope="col" style={{ width: '110px' }}>Versi</th>
                    <th scope="col">Judul Dokumen / Pedoman</th>
                    <th scope="col" style={{ width: '160px' }}>Kategori</th>
                    <th scope="col" style={{ width: '130px' }}>Terakhir Diperbarui</th>
                    <th scope="col" style={{ width: '110px', textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((doc) => (
                    <tr key={doc.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{doc.version}</td>
                      <td>
                        <strong style={{ fontSize: '0.88rem', color: 'var(--color-text, #0f172a)' }}>
                          {doc.title}
                        </strong>
                        <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--color-muted, #64748b)' }}>
                          {doc.summary}
                        </p>
                      </td>
                      <td>
                        <span className="dasbor__badge dasbor__badge--blue" style={{ fontSize: '11px' }}>
                          {doc.category}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--color-muted, #64748b)' }}>
                        {doc.updatedAt}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button type="button" className="dasbor__mini-btn">
                          Buka SOP
                        </button>
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

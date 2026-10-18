'use client';

import React, { useState } from 'react';
import { HumasShell } from '@/components/layout/HumasShell';
import { StandardPagePattern } from '@/components/layout/StandardPagePattern';
import { mockContentInsights } from '@/lib/clientDataFetcher';

export default function InsightKontenPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = mockContentInsights.filter((i) =>
    !searchQuery || i.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <HumasShell
      pageTitle="Insight Konten"
      pageSubtitle="Analisis gap pilar pesan, tren isu, dan rekomendasi ide tayang · 2026"
    >
      <StandardPagePattern
        title="Insight Konten"
        subtitle="Analisis tren isu & peluang pesan"
        statusBarText={
          <span>
            <b>Analisis AI & Pemantauan:</b> 3 pilar utama perlu peningkatan frekuensi publikasi pekan ini.
          </span>
        }
        searchPlaceholder="Cari topik tren, rekomendasi..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        totalCountText={`Menampilkan ${filtered.length} topik insight`}
        renderTable={() => (
          <div className="dasbor__card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="dasbor__table-wrap">
              <table className="dasbor__table">
                <thead>
                  <tr>
                    <th scope="col">Topik Bahasan</th>
                    <th scope="col" style={{ width: '130px', textAlign: 'right' }}>Skor Relevansi</th>
                    <th scope="col" style={{ width: '150px' }}>Pilar Terkait</th>
                    <th scope="col">Rekomendasi Format</th>
                    <th scope="col" style={{ width: '120px', textAlign: 'center' }}>Status Celah</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong style={{ fontSize: '0.88rem', color: 'var(--color-text, #0f172a)' }}>
                          {item.topic}
                        </strong>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {item.score} / 100
                      </td>
                      <td>
                        <span className="dasbor__badge dasbor__badge--blue" style={{ fontSize: '11px' }}>
                          {item.pillar}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--color-muted, #64748b)' }}>
                        {item.suggestedFormat}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="dasbor__badge dasbor__badge--amber" style={{ fontSize: '11px' }}>
                          Gap Tinggi
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

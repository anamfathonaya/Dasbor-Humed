'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { HumasShell } from '@/components/layout/HumasShell';
import { StandardPagePattern, type FilterConfig } from '@/components/layout/StandardPagePattern';
import { mockContentItems } from '@/lib/clientDataFetcher';

export default function KalenderKontenPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState('all');

  const filteredItems = mockContentItems.filter((item) => {
    const matchQuery =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.pillar.toLowerCase().includes(searchQuery.toLowerCase());
    const matchChannel =
      channelFilter === 'all' || item.channel.toLowerCase() === channelFilter.toLowerCase();
    return matchQuery && matchChannel;
  });

  const filters: FilterConfig[] = [
    {
      id: 'channel',
      label: 'Kanal',
      value: channelFilter,
      onChange: setChannelFilter,
      options: [
        { label: 'Semua Kanal', value: 'all' },
        { label: 'Instagram', value: 'instagram' },
        { label: 'YouTube', value: 'youtube' },
        { label: 'TikTok', value: 'tiktok' },
        { label: 'Facebook', value: 'facebook' },
        { label: 'Situs Web', value: 'situs web' }
      ]
    }
  ];

  return (
    <HumasShell
      pageTitle="Kalender Konten"
      pageSubtitle="Jadwal tayang editorial lintas platform & pengingat berkala · 2026"
    >
      <StandardPagePattern
        title="Kalender Konten"
        subtitle="Jadwal publikasi materi kampanye"
        statusBarText={
          <span>
            <b>Status Kalender:</b> 18 jadwal tayang terdaftar, 4 materi dalam antrean review.
          </span>
        }
        headerActions={
          <button type="button" className="dasbor__btn dasbor__btn--primary">
            {/* @ts-ignore iconify web component */}
            <iconify-icon icon="lucide:plus" aria-hidden="true" />
            <span>Buat Jadwal Baru</span>
          </button>
        }
        searchPlaceholder="Cari judul jadwal, pilar pesan..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        filters={filters}
        totalCountText={`Menampilkan ${filteredItems.length} dari ${mockContentItems.length} agenda`}
        allowViewToggle={true}
        defaultViewMode="table"
        isEmpty={filteredItems.length === 0}
        emptyTitle="Tidak ditemukan agenda konten"
        emptyDescription="Kriteria filter kanal atau kata kunci tidak sesuai dengan jadwal editorial yang terdaftar."
        emptyActionLabel="Reset Filter"
        onEmptyAction={() => {
          setSearchQuery('');
          setChannelFilter('all');
        }}
        renderTable={() => (
          <div className="dasbor__card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="dasbor__table-wrap">
              <table className="dasbor__table">
                <thead>
                  <tr>
                    <th scope="col" style={{ width: '130px' }}>Tanggal Rilis</th>
                    <th scope="col" style={{ width: '130px' }}>Kanal</th>
                    <th scope="col">Judul Konten & Tema</th>
                    <th scope="col" style={{ width: '140px' }}>Pilar Pesan</th>
                    <th scope="col" style={{ width: '130px', textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontSize: '0.82rem', color: 'var(--color-muted, #64748b)' }}>
                        {item.publishDate}
                      </td>
                      <td>
                        <span className="dasbor__badge dasbor__badge--blue" style={{ fontSize: '11px' }}>
                          {item.channel}
                        </span>
                      </td>
                      <td>
                        <strong style={{ fontSize: '0.88rem', color: 'var(--color-text, #0f172a)' }}>
                          {item.title}
                        </strong>
                        <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--color-muted, #64748b)' }}>
                          Tema: {item.theme} • Format: {item.contentType}
                        </p>
                      </td>
                      <td>
                        <span className="dasbor__badge dasbor__badge--flat" style={{ fontSize: '11px' }}>
                          {item.pillar}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span
                          className={`dasbor__badge ${
                            item.status === 'published'
                              ? 'dasbor__badge--up'
                              : item.status === 'ready'
                              ? 'dasbor__badge--blue'
                              : 'dasbor__badge--amber'
                          }`}
                          style={{ fontSize: '11px' }}
                        >
                          {item.status === 'published'
                            ? 'Terbit'
                            : item.status === 'ready'
                            ? 'Siap Terbit'
                            : 'Review'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        renderCards={() => (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1rem'
            }}
          >
            {filteredItems.map((item) => (
              <article
                key={item.id}
                className="dasbor__card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.75rem'
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.5rem'
                    }}
                  >
                    <span className="dasbor__badge dasbor__badge--blue" style={{ fontSize: '11px' }}>
                      {item.channel}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-muted, #64748b)' }}>
                      {item.publishDate}
                    </span>
                  </div>
                  <h3
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      margin: '0 0 0.35rem',
                      lineHeight: 1.4,
                      color: 'var(--color-text, #0f172a)'
                    }}
                  >
                    {item.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-muted, #64748b)' }}>
                    Pilar: <b>{item.pillar}</b> • Tema: {item.theme}
                  </p>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '0.5rem',
                    borderTop: '1px solid var(--color-border, #f1f5f9)'
                  }}
                >
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-muted, #64748b)' }}>
                    {item.contentType}
                  </span>
                  <span
                    className={`dasbor__badge ${
                      item.status === 'published'
                        ? 'dasbor__badge--up'
                        : item.status === 'ready'
                        ? 'dasbor__badge--blue'
                        : 'dasbor__badge--amber'
                    }`}
                    style={{ fontSize: '11px' }}
                  >
                    {item.status === 'published'
                      ? 'Terbit'
                      : item.status === 'ready'
                      ? 'Siap Terbit'
                      : 'Review'}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      />
    </HumasShell>
  );
}

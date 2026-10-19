'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { HumasShell } from '@/components/layout/HumasShell';
import { ChannelReportSummaryBlock } from '@/components/channels/ChannelReportSummaryBlock';
import { mockPerformance, reportChannels, reportPeriods } from '@/lib/clientDataFetcher';

export default function LaporanKinerjaPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedChannel, setSelectedChannel] = useState('Semua Kanal');

  const filteredRows = (Array.isArray(mockPerformance) ? mockPerformance : []).filter((row) => {
    const matchChannel = selectedChannel === 'Semua Kanal' || row.channel.toLowerCase() === selectedChannel.toLowerCase();
    const matchPeriod = !row.period || row.period === selectedPeriod;
    return matchChannel && matchPeriod;
  });

  return (
    <HumasShell
      pageTitle="Laporan Kinerja Kanal"
      pageSubtitle="Ringkasan performa per kanal publikasi, konversi kampanye, dan pencatatan temuan berkala · 2026"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Sub-Navigasi Modul Laporan */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Link href="/laporan" className="dasbor__btn">
            Ringkasan Semua Laporan
          </Link>
          <Link href="/laporan-kinerja" className="dasbor__btn dasbor__btn--primary">
            Laporan Kinerja Kanal
          </Link>
          <Link href="/bagikan-cetak" className="dasbor__btn">
            Bagikan & Cetak
          </Link>
        </div>

        {/* Filter Toolbar */}
        <div className="dasbor__card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{ fontSize: '13px', fontWeight: 600 }}>Periode:</label>
              <select
                className="dasbor__select"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                {reportPeriods.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>

              <label style={{ fontSize: '13px', fontWeight: 600, marginLeft: '8px' }}>Kanal:</label>
              <select
                className="dasbor__select"
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value)}
              >
                {reportChannels.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <button type="button" className="dasbor__btn dasbor__btn--primary">
              {/* @ts-ignore iconify web component */}
              <iconify-icon icon="lucide:file-plus" aria-hidden="true" />
              <span>Simpan sebagai Catatan</span>
            </button>
          </div>
        </div>

        {/* Ringkasan Metrik Kanal Media Sosial */}
        <ChannelReportSummaryBlock selectedChannel={selectedChannel} />

        {/* Tabel Rincian per Kanal */}
        <article className="dasbor__card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="dasbor__card-head" style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-border, #e2e8f0)' }}>
            <div>
              <h2 style={{ fontSize: '1rem', margin: 0 }}>Rincian Metrik per Kanal</h2>
              <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: 'var(--color-muted, #64748b)' }}>
                Data performa keterlibatan publik dan laju akuisisi mitra lembaga
              </p>
            </div>
          </div>

          <div className="dasbor__table-wrap">
            <table className="dasbor__table">
              <thead>
                <tr>
                  <th scope="col">Kanal</th>
                  <th scope="col" style={{ textAlign: 'right' }}>Jangkauan</th>
                  <th scope="col" style={{ textAlign: 'right' }}>Interaksi</th>
                  <th scope="col" style={{ textAlign: 'right' }}>Konversi</th>
                  <th scope="col" style={{ textAlign: 'right' }}>Perubahan</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong style={{ fontSize: '0.88rem' }}>{row.channel}</strong>
                    </td>
                    <td style={{ textAlign: 'right' }}>{row.reach.toLocaleString('id-ID')}</td>
                    <td style={{ textAlign: 'right' }}>{row.engagement.toLocaleString('id-ID')}</td>
                    <td style={{ textAlign: 'right' }}>{row.conversions.toLocaleString('id-ID')}</td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={`dasbor__badge ${(row.delta ?? 0) >= 0 ? 'dasbor__badge--up' : 'dasbor__badge--amber'}`}>
                        {(row.delta ?? 0) >= 0 ? `+${row.delta}%` : `${row.delta}%`}
                      </span>
                    </td>
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

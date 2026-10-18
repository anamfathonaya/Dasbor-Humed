'use client';

import React from 'react';
import { HumasShell } from '@/components/layout/HumasShell';

export default function SopPage() {
  return (
    <HumasShell
      pageTitle="SOP Visual"
      pageSubtitle="Alur tahapan operasional dan verifikasi checklist APD peliputan bencana · 2026"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <section className="dasbor__bar">
          <p className="dasbor__bar-text">
            <b>Panduan Lapangan:</b> SOP-HUMAS-001 (Protokol Keselamatan & Peliputan Dokumentasi Bencana).
          </p>
        </section>

        <div className="dasbor__analytics-grid">
          <article className="dasbor__card">
            <div className="dasbor__card-head">
              <div>
                <h2>Fase 1: Pra-Keberangkatan & Briefing</h2>
                <p>30 menit sebelum mobilisasi ke zona terdampak</p>
              </div>
            </div>
            <ul style={{ paddingLeft: '1.25rem', lineHeight: 1.8, fontSize: '0.88rem' }}>
              <li>Briefing keselamatan dengan tim SAR dan koordinator logistik induk.</li>
              <li>Pengecekan helm keselamatan, rompi identitas bertuliskan <b>HUMAS RESMI</b>, dan sepatu boot.</li>
              <li>Penyelarasan kartu memori kamera cadangan kedap air.</li>
            </ul>
          </article>

          <article className="dasbor__card">
            <div className="dasbor__card-head">
              <div>
                <h2>Fase 2: Etika Peliputan & Wawancara</h2>
                <p>Prosedur persetujuan sukarela penyintas bencana</p>
              </div>
            </div>
            <ul style={{ paddingLeft: '1.25rem', lineHeight: 1.8, fontSize: '0.88rem' }}>
              <li>Meminta izin lisan sebelum mendokumentasikan penerima manfaat.</li>
              <li>Privasi wajah anak-anak terlindungi tanpa izin wali tertulis.</li>
              <li>Dilarang mengeksploitasi kesedihan demi dramatisasi visual semata.</li>
            </ul>
          </article>
        </div>
      </div>
    </HumasShell>
  );
}

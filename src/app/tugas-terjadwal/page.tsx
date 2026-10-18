'use client';

import React from 'react';
import Link from 'next/link';
import { HumasShell } from '@/components/layout/HumasShell';

const scheduledTasks = [
  {
    id: 'cron-news-sync',
    name: 'Sinkronisasi Berita Berkala (News Sync)',
    schedule: 'Setiap 15 Menit',
    endpoint: '/api/cron/news-sync',
    lastRun: '10 menit yang lalu',
    nextRun: '5 menit lagi',
    status: 'active',
    description: 'Menarik kabar bencana & bantuan dari saluran Telegram serta RSS media terkurasi.'
  },
  {
    id: 'cron-reminders',
    name: 'Pemrosesan Pengingat Tugas & Konten (Reminder Service)',
    schedule: 'Setiap 1 Jam',
    endpoint: '/api/cron/reminders',
    lastRun: '25 menit yang lalu',
    nextRun: '35 menit lagi',
    status: 'active',
    description: 'Memeriksa jadwal tenggat tugas peliputan dan notifikasi persetujuan draf konten.'
  },
  {
    id: 'cron-analytics-rollup',
    name: 'Kompilasi Agregasi Metrik Kanal (Daily Rollup)',
    schedule: 'Setiap Hari (00:00 WIB)',
    endpoint: '/api/cron/metrics-rollup',
    lastRun: 'Kemarin, 23:59 WIB',
    nextRun: 'Nanti malam',
    status: 'active',
    description: 'Mengompilasi capaian jangkauan, interaksi sosial media, donasi, dan konversi kampanye.'
  }
];

export default function PemantauanTugasTerjadwalPage() {
  return (
    <HumasShell
      pageTitle="Pemantauan Tugas Terjadwal (Cron Jobs)"
      pageSubtitle="Jadwal otomatisasi latar belakang Vercel Cron & pemrosesan sinkronisasi sistem · 2026"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="dasbor__bar">
          <p className="dasbor__bar-text">
            <b>Status Vercel Cron:</b> 3 tugas latar belakang aktif beroperasi di runtime serverless.
          </p>
        </div>

        <article className="dasbor__card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="dasbor__card-head" style={{ padding: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Daftar Tugas Terjadwal Aktif</h2>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--color-muted, #64748b)' }}>
                Dikonfigurasi otomatis melalui file vercel.json untuk menjamin keberlanjutan proses tanpa server dedicated.
              </p>
            </div>
          </div>

          <div className="dasbor__table-wrap">
            <table className="dasbor__table">
              <thead>
                <tr>
                  <th scope="col">Nama Otomatisasi</th>
                  <th scope="col" style={{ width: '150px' }}>Frekuensi</th>
                  <th scope="col" style={{ width: '180px' }}>Endpoint Rute</th>
                  <th scope="col" style={{ width: '140px' }}>Eksekusi Terakhir</th>
                  <th scope="col" style={{ width: '110px', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {scheduledTasks.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <strong style={{ fontSize: '0.88rem', color: 'var(--color-text, #0f172a)' }}>
                        {t.name}
                      </strong>
                      <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--color-muted, #64748b)' }}>
                        {t.description}
                      </p>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{t.schedule}</td>
                    <td style={{ fontSize: '0.82rem', fontFamily: 'monospace' }}>{t.endpoint}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--color-muted, #64748b)' }}>{t.lastRun}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="dasbor__badge dasbor__badge--up" style={{ fontSize: '11px' }}>
                        Berjalan Normal
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

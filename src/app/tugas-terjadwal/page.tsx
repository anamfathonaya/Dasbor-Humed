'use client';

import React from 'react';
import { HumasShell } from '@/components/layout/HumasShell';
import { ScheduledMetricsSyncView } from '@/components/channels/ScheduledMetricsSyncView';

const scheduledTasks = [
  {
    id: 'cron-social-metrics',
    name: 'Penarikan Metrik Harian Kanal Sosial (YouTube, Meta, TikTok)',
    schedule: 'Setiap 06:00 & 18:00 WIB',
    endpoint: '/api/cron/social-metrics-sync',
    lastRun: 'Hari ini, 06:00 WIB',
    nextRun: 'Hari ini, 18:00 WIB',
    status: 'active',
    description: 'Menarik metrik harian dari YouTube Data/Analytics API, Instagram/Facebook Graph API, dan TikTok Display API.'
  },
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
      pageTitle="Penarikan Metrik & Tugas Terjadwal (Cron Jobs)"
      pageSubtitle="Jadwal otomatisasi penarikan metrik harian kanal media sosial & sinkronisasi latar belakang · 2026"
      pageContentId="dasbor-utama"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <ScheduledMetricsSyncView />

        <article className="dasbor__card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="dasbor__card-head" style={{ padding: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Daftar Worker Cron Sistem Latar Belakang</h2>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--color-muted, #64748b)' }}>
                Dikonfigurasi otomatis melalui jadwal cron untuk menjamin keberlanjutan proses sinkronisasi.
              </p>
            </div>
          </div>

          <div className="dasbor__table-wrap">
            <table className="dasbor__table">
              <thead>
                <tr>
                  <th scope="col">Nama Otomatisasi</th>
                  <th scope="col" style={{ width: '160px' }}>Frekuensi</th>
                  <th scope="col" style={{ width: '210px' }}>Endpoint Rute</th>
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

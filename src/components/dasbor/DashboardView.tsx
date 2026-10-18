'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import DashboardGrid from '@/components/DashboardGrid';
import RealtimeNewsFeed from '@/components/react/RealtimeNewsFeed';
import MetricTrendChart from '@/components/charts/MetricTrendChart';

interface PlatformMetric {
  name: string;
  reach: string;
  interactions: string;
  engagement: string;
  growth: string;
  growthType: 'up' | 'down' | 'flat';
}

interface AlertItem {
  id: string;
  title: string;
  note: string;
  level: 'danger' | 'warning' | 'info';
  actionLabel: string;
  actionHref: string;
}

const INITIAL_PLATFORMS: PlatformMetric[] = [
  {
    name: 'Instagram',
    reach: '1.024.300',
    interactions: '58.420',
    engagement: '5,70%',
    growth: '+12,4%',
    growthType: 'up'
  },
  {
    name: 'Facebook',
    reach: '724.180',
    interactions: '31.960',
    engagement: '4,41%',
    growth: '+6,2%',
    growthType: 'up'
  },
  {
    name: 'YouTube',
    reach: '561.420',
    interactions: '38.240',
    engagement: '6,81%',
    growth: '+18,9%',
    growthType: 'up'
  },
  {
    name: 'WhatsApp Siaran',
    reach: '338.900',
    interactions: '12.880',
    engagement: '3,80%',
    growth: '+2,4%',
    growthType: 'up'
  },
  {
    name: 'Situs Web Resmi',
    reach: '194.600',
    interactions: '4.780',
    engagement: '2,46%',
    growth: '-1,1%',
    growthType: 'down'
  }
];

const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 'alert-1',
    title: 'Sinkronisasi Google Sheets terputus',
    note: 'Otorisasi akun lembaga kedaluwarsa sejak kemarin.',
    level: 'danger',
    actionLabel: 'Sambungkan kembali',
    actionHref: '/pengaturan'
  },
  {
    id: 'alert-2',
    title: '4 jadwal konten menunggu persetujuan',
    note: 'Tenggat terdekat publikasi Instagram besok pagi.',
    level: 'warning',
    actionLabel: 'Tinjau jadwal',
    actionHref: '/kalender-konten'
  },
  {
    id: 'alert-3',
    title: 'Konektor Meta Ads perlu refresh token',
    note: 'Data analitik belanja iklan bulan ini belum sinkron.',
    level: 'info',
    actionLabel: 'Perbarui token',
    actionHref: '/pengaturan'
  }
];

export function DashboardView() {
  const [selectedPlatform, setSelectedPlatform] = useState('semua');
  const [selectedPeriod, setSelectedPeriod] = useState<number>(12);
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);

  const handleResolveAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="dasbor" data-node-id="dasbor.root">
      {/* 1. Baris Operasional Ringkas Hari Ini */}
      <section className="dasbor__bar" aria-label="Status ringkas hari ini">
        <p className="dasbor__bar-text">
          Kalender konten bulan ini: <b>18 jadwal</b> terjadwal, <b>4</b> menunggu persetujuan redaksi.
          Sinkronisasi Google Calendar & Sheets: <b>normal</b>.
        </p>
        <div className="dasbor__bar-actions">
          <Link className="dasbor__btn" href="/kalender-konten">
            {/* @ts-ignore iconify web component */}
            <iconify-icon icon="lucide:calendar-plus" aria-hidden="true" />
            <span>Tambah jadwal konten</span>
          </Link>
          <Link className="dasbor__btn dasbor__btn--primary" href="/laporan">
            {/* @ts-ignore iconify web component */}
            <iconify-icon icon="lucide:download" aria-hidden="true" />
            <span>Unduh laporan bulanan</span>
          </Link>
        </div>
      </section>

      {/* Komponen Asli Dipakai Ulang: Multi-Platform Metric Aggregator Island */}
      <DashboardGrid />

      {/* 2. Kartu KPI Ringkasan Metrik Utama */}
      <div className="dasbor__analytics-grid" style={{ marginBottom: '1.25rem' }}>
        <article className="dasbor__card dasbor__kpi">
          <div className="dasbor__kpi-top">
            <span style={{ fontSize: '1.4rem' }}>📈</span>
            <span className="dasbor__badge dasbor__badge--up">+14,2%</span>
          </div>
          <div className="dasbor__kpi-label">Total Jangkauan Akun</div>
          <div className="dasbor__kpi-row" style={{ marginTop: '4px' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>2.843.400</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-muted, #72747a)', margin: '4px 0 0' }}>
            Akumulasi 5 kanal aktif periode 30 hari
          </p>
        </article>

        <article className="dasbor__card dasbor__kpi">
          <div className="dasbor__kpi-top">
            <span style={{ fontSize: '1.4rem' }}>💬</span>
            <span className="dasbor__badge dasbor__badge--up">+8,7%</span>
          </div>
          <div className="dasbor__kpi-label">Interaksi Keterlibatan</div>
          <div className="dasbor__kpi-row" style={{ marginTop: '4px' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>145.280</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-muted, #72747a)', margin: '4px 0 0' }}>
            Komentar, share, save & tanggapan
          </p>
        </article>

        <article className="dasbor__card dasbor__kpi">
          <div className="dasbor__kpi-top">
            <span style={{ fontSize: '1.4rem' }}>👥</span>
            <span className="dasbor__badge dasbor__badge--up">+4.250</span>
          </div>
          <div className="dasbor__kpi-label">Total Pengikut & Audiens</div>
          <div className="dasbor__kpi-row" style={{ marginTop: '4px' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>489.100</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-muted, #72747a)', margin: '4px 0 0' }}>
            Pertumbuhan bersih lintas platform
          </p>
        </article>

        <article className="dasbor__card dasbor__kpi">
          <div className="dasbor__kpi-top">
            <span style={{ fontSize: '1.4rem' }}>🎯</span>
            <span className="dasbor__badge dasbor__badge--up">-11,5% CPA</span>
          </div>
          <div className="dasbor__kpi-label">Efisiensi Iklan & Akuisisi</div>
          <div className="dasbor__kpi-row" style={{ marginTop: '4px' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>Rp 4.120</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-muted, #72747a)', margin: '4px 0 0' }}>
            Rata-rata biaya per interaksi terverifikasi
          </p>
        </article>
      </div>

      {/* 3. Baris Grafik Tren & Sebaran Platform */}
      <div className="dasbor__analytics-grid">
        {/* Grafik Tren Jangkauan & Interaksi menggunakan komponen pakai ulang */}
        <MetricTrendChart
          initialPeriod={selectedPeriod}
          initialPlatform={selectedPlatform}
          onPeriodChange={(p) => setSelectedPeriod(p)}
          onPlatformChange={(pl) => setSelectedPlatform(pl)}
        />

        {/* Sebaran Platform & Konten Terbaik */}
        <article className="dasbor__card">
          <div className="dasbor__card-head">
            <div>
              <h2>Sebaran jangkauan per platform</h2>
              <p>Porsi pembaca dan audiens aktif periode ini</p>
            </div>
          </div>

          <div className="dasbor__channels">
            <div className="dasbor__channel" style={{ ['--value' as any]: '100%' }}>
              <span>
                {/* @ts-ignore iconify web component */}
                <iconify-icon icon="simple-icons:instagram" aria-hidden="true" style={{ color: '#e1306c' }} />
                {' Instagram'}
              </span>
              <strong>1.024.300 (46%)</strong>
            </div>
            <div className="dasbor__channel" style={{ ['--value' as any]: '71%' }}>
              <span>
                {/* @ts-ignore iconify web component */}
                <iconify-icon icon="simple-icons:facebook" aria-hidden="true" style={{ color: '#1877f2' }} />
                {' Facebook'}
              </span>
              <strong>724.180 (32%)</strong>
            </div>
            <div className="dasbor__channel" style={{ ['--value' as any]: '55%' }}>
              <span>
                {/* @ts-ignore iconify web component */}
                <iconify-icon icon="simple-icons:youtube" aria-hidden="true" style={{ color: '#ff0000' }} />
                {' YouTube'}
              </span>
              <strong>561.420 (25%)</strong>
            </div>
            <div className="dasbor__channel" style={{ ['--value' as any]: '33%' }}>
              <span>
                {/* @ts-ignore iconify web component */}
                <iconify-icon icon="simple-icons:whatsapp" aria-hidden="true" style={{ color: '#25d366' }} />
                {' WhatsApp Siaran'}
              </span>
              <strong>338.900 (15%)</strong>
            </div>
            <div className="dasbor__channel" style={{ ['--value' as any]: '19%' }}>
              <span>
                {/* @ts-ignore iconify web component */}
                <iconify-icon icon="lucide:globe" aria-hidden="true" style={{ color: '#1d5c94' }} />
                {' Situs Web Resmi'}
              </span>
              <strong>194.600 (9%)</strong>
            </div>
          </div>

          <div style={{ marginTop: '16px', borderTop: '1px solid var(--color-border, #e8e8ea)', paddingTop: '12px' }}>
            <div className="dasbor__card-head" style={{ marginBottom: '8px' }}>
              <div>
                <h3 style={{ fontSize: '13px', margin: 0 }}>Konten terbaik periode ini</h3>
              </div>
            </div>
            <div className="dasbor__top-list">
              <div className="dasbor__top-item">
                <strong>Dokumenter penyaluran air bersih</strong>
                <span>YouTube · 412 rb tayangan · 28,4 rb interaksi</span>
              </div>
              <div className="dasbor__top-item">
                <strong>Reels program beasiswa yatim</strong>
                <span>Instagram · 268 rb tayangan · 19,1 rb interaksi</span>
              </div>
            </div>
          </div>
        </article>
      </div>

      {/* 4. Baris Tabel Performa Tiap Platform & Peringatan */}
      <div className="dasbor__analytics-grid">
        {/* Tabel Performa Platform */}
        <article className="dasbor__card">
          <div className="dasbor__card-head">
            <div>
              <h2>Performa tiap platform</h2>
              <p>Rincian metrik keterlibatan dan pertumbuhan pengikut</p>
            </div>
          </div>

          <div className="dasbor__table-wrap">
            <table className="dasbor__table">
              <thead>
                <tr>
                  <th scope="col">Platform</th>
                  <th scope="col" style={{ textAlign: 'right' }}>Jangkauan</th>
                  <th scope="col" style={{ textAlign: 'right' }}>Interaksi</th>
                  <th scope="col" style={{ textAlign: 'right' }}>Engagement</th>
                  <th scope="col" style={{ textAlign: 'right' }}>Pertumbuhan</th>
                </tr>
              </thead>
              <tbody>
                {INITIAL_PLATFORMS.map((p) => (
                  <tr key={p.name}>
                    <td><strong>{p.name}</strong></td>
                    <td className="num">{p.reach}</td>
                    <td className="num">{p.interactions}</td>
                    <td className="num">
                      <span className="dasbor__badge dasbor__badge--flat">{p.engagement}</span>
                    </td>
                    <td className="num">
                      <span className={`dasbor__badge dasbor__badge--${p.growthType}`}>
                        {p.growth}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        {/* Peringatan & Tindak Lanjut */}
        <article className="dasbor__card">
          <div className="dasbor__card-head">
            <div>
              <h2>Peringatan & tindak lanjut</h2>
              <p><span>{alerts.length}</span> butir membutuhkan perhatian staf</p>
            </div>
            <Link className="dasbor__mini-btn" href="/pengaturan" style={{ textDecoration: 'none' }}>
              Semua integrasi
            </Link>
          </div>

          {alerts.length > 0 ? (
            <div className="dasbor__alerts">
              {alerts.map((alert) => (
                <div className="dasbor__alert" key={alert.id} data-level={alert.level}>
                  <div className="dasbor__alert-body">
                    <p className="dasbor__alert-title">{alert.title}</p>
                    <p className="dasbor__alert-note">{alert.note}</p>
                    <div className="dasbor__alert-actions">
                      <Link className="dasbor__mini-btn" href={alert.actionHref} style={{ textDecoration: 'none' }}>
                        {alert.actionLabel}
                      </Link>
                      <button
                        className="dasbor__mini-btn"
                        type="button"
                        onClick={() => handleResolveAlert(alert.id)}
                      >
                        Selesai
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="dasbor__empty" style={{ textAlign: 'center', padding: '16px', color: '#72747a' }}>
              Semua peringatan telah diselesaikan.
            </p>
          )}
        </article>
      </div>

      {/* 5. Baris Modular: Umpan Berita Waktu Nyata & Jadwal Konten Terdekat */}
      <div className="dasbor__analytics-grid">
        <RealtimeNewsFeed />

        <article className="dasbor__card">
          <div className="dasbor__card-head">
            <div>
              <h2>Jadwal konten terdekat</h2>
              <p>Kalender publikasi 3 hari mendatang</p>
            </div>
            <Link className="dasbor__mini-btn" href="/kalender-konten" style={{ textDecoration: 'none' }}>
              Buka Kalender
            </Link>
          </div>
          <div className="dasbor__table-wrap">
            <table className="dasbor__table">
              <thead>
                <tr>
                  <th scope="col">Tanggal</th>
                  <th scope="col">Konten</th>
                  <th scope="col">Kanal</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Besok</strong></td>
                  <td className="title-col">Siaran pers bakti sosial penyaluran air bersih</td>
                  <td>Instagram</td>
                  <td><span className="dasbor__badge dasbor__badge--up">Siap terbit</span></td>
                </tr>
                <tr>
                  <td><strong>Lusa</strong></td>
                  <td className="title-col">Klarifikasi isu penanganan darurat banjir lahar</td>
                  <td>Situs Web</td>
                  <td><span className="dasbor__badge dasbor__badge--flat">Menunggu review</span></td>
                </tr>
                <tr>
                  <td><strong>+3 Hari</strong></td>
                  <td className="title-col">Reels program beasiswa yatim dhuafa</td>
                  <td>TikTok</td>
                  <td><span className="dasbor__badge dasbor__badge--flat">Menunggu review</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import DashboardGrid from '@/components/DashboardGrid';
import RealtimeNewsFeed from '@/components/react/RealtimeNewsFeed';

interface ConnectedChannelItem {
  id: string;
  platform: string;
  handle: string;
  followersLabel: string;
  pulledAgoLabel: string;
  statusLabel: 'Aktif' | 'Re-Auth';
  icon: string;
  iconColor: string;
}

const CONNECTED_CHANNELS: ConnectedChannelItem[] = [
  {
    id: 'ig',
    platform: 'Instagram',
    handle: '@kemensosri',
    followersLabel: '2,4 jt Pengikut',
    pulledAgoLabel: 'Ditarik 2 mnt lalu',
    statusLabel: 'Aktif',
    icon: 'mdi:instagram',
    iconColor: '#ec4899'
  },
  {
    id: 'yt',
    platform: 'YouTube',
    handle: '@KemensosRI',
    followersLabel: '840,2 rb Pengikut',
    pulledAgoLabel: 'Ditarik 15 mnt lalu',
    statusLabel: 'Aktif',
    icon: 'mdi:youtube',
    iconColor: '#dc2626'
  },
  {
    id: 'tt',
    platform: 'TikTok',
    handle: '@kemensos.ri',
    followersLabel: '1,2 jt Pengikut',
    pulledAgoLabel: 'Ditarik 8 mnt lalu',
    statusLabel: 'Re-Auth',
    icon: 'simple-icons:tiktok',
    iconColor: '#ffffff'
  },
  {
    id: 'fb',
    platform: 'Facebook',
    handle: 'Kemensos RI',
    followersLabel: '420,1 rb Pengikut',
    pulledAgoLabel: 'Ditarik 32 mnt lalu',
    statusLabel: 'Aktif',
    icon: 'mdi:facebook',
    iconColor: '#2563eb'
  }
];

const NEWS_CLIPPINGS = [
  {
    id: 'news-1',
    sentiment: 'Negatif',
    sentimentTone: 'danger' as const,
    timeAgo: '2 jam lalu',
    title: 'Polemik Kebijakan Impor Beras, Warga Mengeluhkan Harga',
    source: 'Pantauan Media Nasional'
  },
  {
    id: 'news-2',
    sentiment: 'Positif',
    sentimentTone: 'up' as const,
    timeAgo: '5 jam lalu',
    title: 'Pemerintah Resmikan Jembatan Baru di Kalimantan Timur',
    source: 'Antara News'
  },
  {
    id: 'news-3',
    sentiment: 'Netral',
    sentimentTone: 'flat' as const,
    timeAgo: '8 jam lalu',
    title: 'Stok Pangan Nasional Aman Menjelang Akhir Tahun',
    source: 'Republika'
  }
];

export function DashboardView() {
  const [periodRange, setPeriodRange] = useState<'7d' | '30d'>('7d');
  const [activeChannelLine, setActiveChannelLine] = useState<'all' | 'ig' | 'yt' | 'fb' | 'tt'>('all');

  const kpiMetrics =
    periodRange === '7d'
      ? [
          {
            label: 'Total Jangkauan',
            value: '12.410.802',
            delta: '+14,2%',
            deltaTone: 'up' as const,
            compare: 'vs 7 hari lalu'
          },
          {
            label: 'Interaksi Aktif',
            value: '842.109',
            delta: '+8,5%',
            deltaTone: 'up' as const,
            compare: 'vs 7 hari lalu'
          },
          {
            label: 'Sentimen Positif',
            value: '68,4%',
            delta: '-2,1%',
            deltaTone: 'down' as const,
            compare: 'vs 7 hari lalu'
          },
          {
            label: 'Total Konten',
            value: '142',
            delta: '±0%',
            deltaTone: 'flat' as const,
            compare: 'vs 7 hari lalu'
          }
        ]
      : [
          {
            label: 'Total Jangkauan',
            value: '46.890.410',
            delta: '+19,4%',
            deltaTone: 'up' as const,
            compare: 'vs 30 hari lalu'
          },
          {
            label: 'Interaksi Aktif',
            value: '3.124.850',
            delta: '+11,2%',
            deltaTone: 'up' as const,
            compare: 'vs 30 hari lalu'
          },
          {
            label: 'Sentimen Positif',
            value: '71,8%',
            delta: '+3,4%',
            deltaTone: 'up' as const,
            compare: 'vs 30 hari lalu'
          },
          {
            label: 'Total Konten',
            value: '548',
            delta: '+6,2%',
            deltaTone: 'up' as const,
            compare: 'vs 30 hari lalu'
          }
        ];

  return (
    <div className="dasbor" data-node-id="dasbor.root">
      {/* 1. Baris Kontrol Rentang Waktu & Status Ringkas */}
      <section className="dasbor__bar" aria-label="Status ringkas hari ini">
        <p className="dasbor__bar-text">
          Kalender konten bulan ini: <b>18 jadwal</b> terjadwal, <b>4</b> menunggu persetujuan redaksi.
          Sinkronisasi lintas kanal: <b>normal</b>.
        </p>
        <div className="dasbor__bar-actions">
          <div className="dasbor__seg" role="group" aria-label="Rentang periode ikhtisar">
            <button
              type="button"
              className="dasbor__seg-btn"
              aria-pressed={periodRange === '7d'}
              onClick={() => setPeriodRange('7d')}
            >
              7 Hari
            </button>
            <button
              type="button"
              className="dasbor__seg-btn"
              aria-pressed={periodRange === '30d'}
              onClick={() => setPeriodRange('30d')}
            >
              30 Hari
            </button>
          </div>
          <Link className="dasbor__btn" href="/pemantauan-kanal">
            {/* @ts-ignore iconify web component */}
            <iconify-icon icon="lucide:radio" aria-hidden="true" />
            <span>Pemantauan Kanal</span>
          </Link>
          <Link className="dasbor__btn dasbor__btn--primary" href="/kalender-konten">
            {/* @ts-ignore iconify web component */}
            <iconify-icon icon="lucide:calendar-plus" aria-hidden="true" />
            <span>Tambah Jadwal</span>
          </Link>
        </div>
      </section>

      {/* 2. KPI Metrics Grid (4 Kartu Seragam) */}
      <div className="dasbor__kpis">
        {kpiMetrics.map((kpi) => (
          <article key={kpi.label} className="dasbor__card dasbor__kpi">
            <span className="dasbor__kpi-label">{kpi.label}</span>
            <div className="dasbor__kpi-row">
              <span className="dasbor__kpi-value">{kpi.value}</span>
              <span
                className={`dasbor__badge ${
                  kpi.deltaTone === 'up'
                    ? 'dasbor__badge--up'
                    : kpi.deltaTone === 'down'
                    ? 'dasbor__badge--down'
                    : 'dasbor__badge--flat'
                }`}
              >
                {kpi.delta}
              </span>
            </div>
            <p className="dasbor__kpi-compare">{kpi.compare}</p>
          </article>
        ))}
      </div>

      {/* 3. Baris Grafik Tren Interaksi Kanal (8 Kolom) & Kanal Terhubung (4 Kolom) */}
      <div className="sd-grid-12">
        {/* Grafik Tren Interaksi Kanal */}
        <article className="dasbor__card sd-col-8">
          <div className="dasbor__card-head">
            <div>
              <h2 className="sd-section-title">Tren Interaksi Kanal</h2>
              <p>Perbandingan interaksi harian lintas 4 kanal resmi ({periodRange === '7d' ? '13 Okt – 19 Okt 2026' : '30 Hari Terakhir'})</p>
            </div>
            <div className="sd-chart-legend" role="group" aria-label="Filter garis kanal">
              <button
                type="button"
                className={`sd-legend-pill ${activeChannelLine === 'all' || activeChannelLine === 'ig' ? 'is-active' : ''}`}
                onClick={() => setActiveChannelLine((prev) => (prev === 'ig' ? 'all' : 'ig'))}
              >
                <span className="sd-dot" style={{ background: '#ec4899' }} />
                Instagram
              </button>
              <button
                type="button"
                className={`sd-legend-pill ${activeChannelLine === 'all' || activeChannelLine === 'yt' ? 'is-active' : ''}`}
                onClick={() => setActiveChannelLine((prev) => (prev === 'yt' ? 'all' : 'yt'))}
              >
                <span className="sd-dot" style={{ background: '#dc2626' }} />
                YouTube
              </button>
              <button
                type="button"
                className={`sd-legend-pill ${activeChannelLine === 'all' || activeChannelLine === 'fb' ? 'is-active' : ''}`}
                onClick={() => setActiveChannelLine((prev) => (prev === 'fb' ? 'all' : 'fb'))}
              >
                <span className="sd-dot" style={{ background: '#2563eb' }} />
                Facebook
              </button>
              <button
                type="button"
                className={`sd-legend-pill ${activeChannelLine === 'all' || activeChannelLine === 'tt' ? 'is-active' : ''}`}
                onClick={() => setActiveChannelLine((prev) => (prev === 'tt' ? 'all' : 'tt'))}
              >
                <span className="sd-dot" style={{ background: '#f4f4f5' }} />
                TikTok
              </button>
            </div>
          </div>

          <div className="sd-chart-frame">
            <div className="sd-chart-yaxis" aria-hidden="true">
              <div className="sd-chart-yrow">
                <span>100 rb</span>
                <div className="sd-chart-gridline" />
              </div>
              <div className="sd-chart-yrow">
                <span>75 rb</span>
                <div className="sd-chart-gridline" />
              </div>
              <div className="sd-chart-yrow">
                <span>50 rb</span>
                <div className="sd-chart-gridline" />
              </div>
              <div className="sd-chart-yrow">
                <span>25 rb</span>
                <div className="sd-chart-gridline" />
              </div>
              <div className="sd-chart-yrow sd-chart-yrow--zero">
                <span>0</span>
                <div className="sd-chart-gridline sd-chart-gridline--strong" />
              </div>
            </div>

            <svg
              viewBox="0 0 800 260"
              className="sd-chart-svg"
              role="img"
              aria-label="Grafik garis tren interaksi Instagram, YouTube, Facebook, dan TikTok"
            >
              {(activeChannelLine === 'all' || activeChannelLine === 'ig') && (
                <path
                  d="M 0 175 L 133 155 L 266 190 L 399 130 L 532 85 L 665 102 L 800 68"
                  fill="none"
                  stroke="#ec4899"
                  strokeWidth="2.25"
                />
              )}
              {(activeChannelLine === 'all' || activeChannelLine === 'yt') && (
                <path
                  d="M 0 215 L 133 198 L 266 206 L 399 162 L 532 180 L 665 145 L 800 162"
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth="2.25"
                />
              )}
              {(activeChannelLine === 'all' || activeChannelLine === 'fb') && (
                <path
                  d="M 0 232 L 133 240 L 266 224 L 399 232 L 532 215 L 665 206 L 800 198"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2.25"
                />
              )}
              {(activeChannelLine === 'all' || activeChannelLine === 'tt') && (
                <path
                  d="M 0 130 L 133 85 L 266 68 L 399 76 L 532 50 L 665 34 L 800 18"
                  fill="none"
                  stroke="#f4f4f5"
                  strokeWidth="2.25"
                />
              )}
            </svg>

            <div className="sd-chart-xaxis">
              <span>13 OKT</span>
              <span>14 OKT</span>
              <span>15 OKT</span>
              <span>16 OKT</span>
              <span>17 OKT</span>
              <span>18 OKT</span>
              <span>19 OKT</span>
            </div>
          </div>
        </article>

        {/* Kanal Terhubung */}
        <article className="dasbor__card sd-col-4">
          <div className="dasbor__card-head">
            <div>
              <h2 className="sd-section-title">Kanal Terhubung</h2>
              <p>Satuan seragam &amp; waktu sinkronisasi terakhir</p>
            </div>
            <Link href="/pemantauan-kanal" className="dasbor__mini-btn">
              Detail
            </Link>
          </div>

          <div className="sd-channel-list">
            {CONNECTED_CHANNELS.map((ch) => (
              <Link
                href="/pemantauan-kanal"
                key={ch.id}
                className="sd-channel-item"
              >
                <div className="sd-channel-item__left">
                  {/* @ts-ignore iconify web component */}
                  <iconify-icon
                    icon={ch.icon}
                    aria-hidden="true"
                    style={{ fontSize: '20px', color: ch.iconColor }}
                  />
                  <div className="sd-channel-item__meta">
                    <strong>{ch.handle}</strong>
                    <span>
                      {ch.followersLabel} · {ch.pulledAgoLabel}
                    </span>
                  </div>
                </div>
                <span
                  className={`sd-status-tag ${
                    ch.statusLabel === 'Aktif' ? 'sd-status-tag--ok' : 'sd-status-tag--warn'
                  }`}
                >
                  {ch.statusLabel}
                </span>
              </Link>
            ))}
          </div>
        </article>
      </div>

      {/* 4. Baris Kalender Konten (7 Kolom) & Basis Pengetahuan (5 Kolom) */}
      <div className="sd-grid-12">
        <article className="dasbor__card sd-col-7">
          <div className="dasbor__card-head">
            <div>
              <h2 className="sd-section-title">Kalender Konten</h2>
              <p>Jadwal publikasi lintas kanal pekan berjalan</p>
            </div>
            <span className="sd-mono-tag">Minggu 42 — Okt 2026</span>
          </div>

          <div className="sd-agenda-list">
            <Link href="/kalender-konten" className="sd-agenda-item">
              <div className="sd-agenda-date">
                <strong>19</strong>
                <span>Sen</span>
              </div>
              <div className="sd-agenda-body">
                <strong>Edukasi Pajak Digital (IG Story)</strong>
                <span>Status: Terbit · 09:00 WIB</span>
              </div>
              {/* @ts-ignore iconify web component */}
              <iconify-icon
                icon="lucide:check-circle"
                aria-hidden="true"
                style={{ color: '#10b981', fontSize: '18px' }}
              />
            </Link>

            <Link href="/kalender-konten" className="sd-agenda-item">
              <div className="sd-agenda-date">
                <strong>20</strong>
                <span>Sel</span>
              </div>
              <div className="sd-agenda-body">
                <strong>Live: Tanya Jawab Bansos (YouTube)</strong>
                <span>Status: Reviu · 19:30 WIB</span>
              </div>
              {/* @ts-ignore iconify web component */}
              <iconify-icon
                icon="lucide:clock"
                aria-hidden="true"
                style={{ color: '#f59e0b', fontSize: '18px' }}
              />
            </Link>

            <Link href="/kalender-konten" className="sd-agenda-item">
              <div className="sd-agenda-date">
                <strong>22</strong>
                <span>Kam</span>
              </div>
              <div className="sd-agenda-body">
                <strong>Infografis Penyaluran Logistik Daerah Terdampak (Reels &amp; TikTok)</strong>
                <span>Status: Terjadwal · 16:00 WIB</span>
              </div>
              {/* @ts-ignore iconify web component */}
              <iconify-icon
                icon="lucide:calendar-check"
                aria-hidden="true"
                style={{ color: '#3b82f6', fontSize: '18px' }}
              />
            </Link>
          </div>
        </article>

        <article className="dasbor__card sd-col-5">
          <div className="dasbor__card-head">
            <div>
              <h2 className="sd-section-title">Basis Pengetahuan</h2>
              <p>Dokumen rujukan operasional &amp; SOP aktif</p>
            </div>
          </div>

          <div className="sd-kb-list">
            <Link href="/basis-pengetahuan" id="kb-1" className="sd-kb-link">
              <span>SOP Komunikasi Krisis v2.1</span>
              {/* @ts-ignore iconify web component */}
              <iconify-icon icon="lucide:chevron-right" aria-hidden="true" />
            </Link>
            <Link href="/basis-pengetahuan" id="kb-2" className="sd-kb-link">
              <span>Panduan Visual Brand 2026</span>
              {/* @ts-ignore iconify web component */}
              <iconify-icon icon="lucide:chevron-right" aria-hidden="true" />
            </Link>
            <Link href="/sop" id="kb-3" className="sd-kb-link">
              <span>Protokol Keselamatan Liputan Bencana</span>
              {/* @ts-ignore iconify web component */}
              <iconify-icon icon="lucide:chevron-right" aria-hidden="true" />
            </Link>
            <Link href="/basis-pengetahuan" className="sd-kb-cta">
              Buka Perpustakaan
            </Link>
          </div>
        </article>
      </div>

      {/* 5. Pantauan Berita Terkini (3 Kolom Responsif) */}
      <article className="dasbor__card">
        <div className="dasbor__card-head">
          <div>
            <h2 className="sd-section-title">Pantauan Berita Terkini</h2>
            <p>Kliping isu publik &amp; sentimen pemberitaan utama hari ini</p>
          </div>
          <Link href="/pantauan-berita" id="news-link" className="sd-link-accent">
            Lihat Semua
          </Link>
        </div>

        <div className="sd-news-grid">
          {NEWS_CLIPPINGS.map((clip) => (
            <Link href="/pantauan-berita" key={clip.id} className="sd-news-card">
              <div className="sd-news-card__top">
                <span className={`sd-sentiment sd-sentiment--${clip.sentimentTone}`}>
                  {clip.sentiment}
                </span>
                <span className="sd-mono-tag">{clip.timeAgo}</span>
              </div>
              <h3 className="sd-news-card__title">{clip.title}</h3>
              <span className="sd-news-card__source">{clip.source}</span>
            </Link>
          ))}
        </div>
      </article>

      {/* 6. Agregasi Multi-Platform & Stream Berita Live */}
      <DashboardGrid />
      <RealtimeNewsFeed />
    </div>
  );
}
export default DashboardView;

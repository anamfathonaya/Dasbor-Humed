'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { HumasShell } from '@/components/layout/HumasShell';
import { StandardPagePattern, type FilterConfig } from '@/components/layout/StandardPagePattern';
import RealtimeNewsFeed from '@/components/react/RealtimeNewsFeed';

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  sourceType: string;
  sourceName: string;
  category: string;
  publishedAt: string;
  isImportant: boolean;
  url: string;
}

export default function PantauanBeritaPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    loadNewsItems();
  }, []);

  const loadNewsItems = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/news/items?limit=200');
      const data = await response.json();

      if (data.ok) {
        setNewsItems(data.items);
      }
    } catch (error) {
      console.error('Failed to load news items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/news/sync-all', { method: 'POST' });
      const data = await response.json();

      if (data.ok) {
        setLastSync(new Date().toLocaleTimeString('id-ID'));
        await loadNewsItems();
      }
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncing(false);
    }
  };

  const toggleBookmark = (id: number) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Filter data berdasarkan query pencarian dan dropdown filter
  const filteredItems = useMemo(() => {
    return newsItems.filter((item) => {
      const matchQuery =
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchQuery.toLowerCase());

      const matchSource =
        sourceFilter === 'all' ||
        item.sourceType.toLowerCase() === sourceFilter.toLowerCase();

      const matchCategory =
        categoryFilter === 'all' ||
        item.category.toLowerCase() === categoryFilter.toLowerCase();

      return matchQuery && matchSource && matchCategory;
    });
  }, [newsItems, searchQuery, sourceFilter, categoryFilter]);

  // Konfigurasi dropdown filter untuk pola halaman baku
  const filters: FilterConfig[] = [
    {
      id: 'source-filter',
      label: 'Sumber',
      value: sourceFilter,
      onChange: setSourceFilter,
      options: [
        { label: 'Semua Sumber', value: 'all' },
        { label: 'Telegram', value: 'telegram' },
        { label: 'RSS', value: 'rss' },
        { label: 'Google News', value: 'google_news' }
      ]
    },
    {
      id: 'category-filter',
      label: 'Kategori',
      value: categoryFilter,
      onChange: setCategoryFilter,
      options: [
        { label: 'Semua Kategori', value: 'all' },
        { label: 'Bencana', value: 'bencana' },
        { label: 'Bantuan Kemanusiaan', value: 'bantuan kemanusiaan' },
        { label: 'Kesehatan', value: 'kesehatan' }
      ]
    }
  ];

  return (
    <HumasShell
      pageTitle="Pantauan Berita"
      pageSubtitle="Feed Telegram & RSS, daftar sumber terhubung, dan item tersimpan · 2026"
    >
      <StandardPagePattern
        title="Pantauan Berita"
        subtitle="Feed Telegram & RSS terintegrasi"
        statusBarText={
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
            <div>
              <b>Status Pemantauan:</b> {newsItems.length} kabar terpantau dari sumber RSS dan Telegram.
              {lastSync && ` Sinkronisasi terakhir: ${lastSync}`}
            </div>
            <RealtimeNewsFeed />
          </div>
        }
        headerActions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="dasbor__btn"
              onClick={handleSync}
              disabled={syncing}
            >
              {/* @ts-ignore iconify web component */}
              <iconify-icon icon={syncing ? "lucide:loader-2" : "lucide:refresh-cw"} aria-hidden="true" />
              <span>{syncing ? 'Sinkronisasi...' : 'Tarik Berita'}</span>
            </button>
            <Link className="dasbor__btn dasbor__btn--primary" href="/kalender-konten">
              {/* @ts-ignore iconify web component */}
              <iconify-icon icon="lucide:calendar-plus" aria-hidden="true" />
              <span>Jadikan Agenda Konten</span>
            </Link>
          </div>
        }
        searchPlaceholder="Cari judul berita, topik bencana, kata kunci..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        filters={filters}
        totalCountText={loading ? 'Memuat...' : `Menampilkan ${filteredItems.length} dari ${newsItems.length} kabar`}
        allowViewToggle={true}
        defaultViewMode="table"
        isEmpty={filteredItems.length === 0}
        emptyTitle="Tidak ditemukan kabar berita"
        emptyDescription="Kriteria pencarian atau filter yang Anda masukkan tidak menghasilkan item berita aktif."
        emptyActionLabel="Reset Filter Pencarian"
        onEmptyAction={() => {
          setSearchQuery('');
          setSourceFilter('all');
          setCategoryFilter('all');
        }}
        renderTable={() => (
          <div className="dasbor__card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="dasbor__table-wrap">
              <table className="dasbor__table">
                <thead>
                  <tr>
                    <th scope="col" style={{ width: '130px' }}>Waktu</th>
                    <th scope="col" style={{ width: '140px' }}>Sumber</th>
                    <th scope="col">Kabar Berita & Ringkasan</th>
                    <th scope="col" style={{ width: '130px' }}>Kategori</th>
                    <th scope="col" style={{ width: '100px', textAlign: 'center' }}>Tindakan</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontSize: '0.8rem', color: 'var(--color-muted, #64748b)' }}>
                        {item.publishedAt}
                      </td>
                      <td>
                        <span
                          className={`dasbor__badge ${
                            item.sourceType === 'telegram'
                              ? 'dasbor__badge--blue'
                              : 'dasbor__badge--flat'
                          }`}
                          style={{ fontSize: '11px' }}
                        >
                          {item.sourceName}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                          <strong style={{ fontSize: '0.9rem', color: 'var(--color-text, #0f172a)' }}>
                            {item.title}
                          </strong>
                          {item.isImportant ? (
                            <span className="dasbor__badge dasbor__badge--amber" style={{ fontSize: '10px' }}>
                              Prioritas
                            </span>
                          ) : null}
                        </div>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-muted, #64748b)', lineHeight: 1.4 }}>
                          {item.summary}
                        </p>
                      </td>
                      <td>
                        <span className="dasbor__badge dasbor__badge--green" style={{ fontSize: '11px' }}>
                          {item.category}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          <button
                            type="button"
                            onClick={() => toggleBookmark(item.id)}
                            className="dasbor__mini-btn"
                            title={bookmarkedIds.includes(item.id) ? 'Hapus simpan' : 'Simpan rujukan'}
                          >
                            {bookmarkedIds.includes(item.id) ? '★ Tersimpan' : '☆ Simpan'}
                          </button>
                        </div>
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
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
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
                      {item.sourceName}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-muted, #64748b)' }}>
                      {item.publishedAt}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      margin: '0 0 0.4rem',
                      lineHeight: 1.4,
                      color: 'var(--color-text, #0f172a)'
                    }}
                  >
                    {item.title}
                  </h3>

                  <p
                    style={{
                      fontSize: '0.82rem',
                      color: 'var(--color-muted, #64748b)',
                      lineHeight: 1.45,
                      margin: 0
                    }}
                  >
                    {item.summary}
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--color-border, #f1f5f9)'
                  }}
                >
                  <span className="dasbor__badge dasbor__badge--green" style={{ fontSize: '11px' }}>
                    {item.category}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleBookmark(item.id)}
                    className="dasbor__mini-btn"
                  >
                    {bookmarkedIds.includes(item.id) ? '★ Tersimpan' : '☆ Simpan'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      />
    </HumasShell>
  );
}

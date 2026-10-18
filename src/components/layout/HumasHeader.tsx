'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLayout, type UserRole } from './LayoutContext';

interface HumasHeaderProps {
  pageTitle?: string;
  pageSubtitle?: string;
  headerActions?: React.ReactNode;
}

export function HumasHeader({
  pageTitle = 'Dasbor & Metrik',
  pageSubtitle = 'Ringkasan operasional humas, akuisisi, dan analitik performa kanal',
  headerActions
}: HumasHeaderProps) {
  const router = useRouter();
  const { theme, toggleTheme, isNavOpen, toggleNav, currentRole, setRole } = useLayout();
  const [searchQuery, setSearchQuery] = useState('');

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value as UserRole);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return;

      if (q.includes('berita') || q.includes('rss') || q.includes('telegram')) {
        router.push('/pantauan-berita?q=' + encodeURIComponent(q));
      } else if (q.includes('kalender') || q.includes('jadwal') || q.includes('konten')) {
        router.push('/kalender-konten');
      } else if (q.includes('sop') || q.includes('krisis') || q.includes('alur')) {
        router.push('/sop');
      } else if (q.includes('dokumen') || q.includes('pedoman')) {
        router.push('/basis-pengetahuan?q=' + encodeURIComponent(q));
      } else if (q.includes('laporan') || q.includes('anggaran') || q.includes('rab')) {
        router.push('/laporan');
      } else if (q.includes('pengaturan') || q.includes('integrasi') || q.includes('dam')) {
        router.push('/pengaturan');
      } else if (q.includes('akun') || q.includes('audit')) {
        router.push('/akun');
      } else {
        router.push('/pantauan-berita?q=' + encodeURIComponent(q));
      }
    }
  };

  const handleNotificationClick = () => {
    alert(
      'Peringatan Aktif Humas:\n1. Sinkronisasi Google Sheets terputus (perlu re-auth)\n2. 4 jadwal konten menunggu persetujuan (IG besok)\n3. Refresh token Meta Ads diperlukan'
    );
  };

  return (
    <header className="l-humas__header">
      <div className="l-humas__header-inner" data-layout-container>
        <button
          className="l-humas__menu-btn"
          type="button"
          onClick={toggleNav}
          aria-label={isNavOpen ? 'Tutup navigasi' : 'Buka navigasi'}
          aria-expanded={isNavOpen}
          aria-controls="humas-sidebar"
        >
          {/* @ts-ignore iconify-icon web component */}
          <iconify-icon icon="lucide:menu" aria-hidden="true" />
        </button>

        <div className="l-humas__heading">
          <h1 className="l-humas__title">{pageTitle}</h1>
          <p className="l-humas__subtitle">{pageSubtitle}</p>
        </div>

        <div className="l-humas__tools">
          <label className="l-humas__search">
            {/* @ts-ignore iconify-icon web component */}
            <iconify-icon icon="lucide:search" aria-hidden="true" />
            <span
              style={{
                position: 'absolute',
                width: '1px',
                height: '1px',
                overflow: 'hidden',
                clip: 'rect(0 0 0 0)'
              }}
            >
              Cari modul, dokumen, atau jadwal
            </span>
            <input
              type="search"
              placeholder="Cari modul, dokumen, jadwal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
          </label>

          {/* Pemilih Peran Tiruan (Mock Role Switcher) */}
          <span className="l-humas__role" data-testid="header-role-switcher" title={`Peran aktif: ${currentRole === 'head' ? 'Kepala Humas (Wewenang Penuh)' : currentRole === 'admin' ? 'Admin Teknis (Integrasi & Sistem)' : 'Staf Konten (Produksi Konten & Berita)'}`}>
            <span className="l-humas__role-label">Peran</span>
            <select
              aria-label="Pilih peran pengguna"
              value={currentRole}
              onChange={handleRoleChange}
              data-shell-role
              style={{ cursor: 'pointer', fontWeight: 500 }}
            >
              <option value="head">Kepala Humas</option>
              <option value="admin">Admin Teknis</option>
              <option value="staff">Staf Konten</option>
              <option value="reviewer">Reviewer / Mitra</option>
            </select>
          </span>

          <button
            className="l-humas__icon-btn"
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Ubah mode terang' : 'Ubah mode gelap'}
            aria-pressed={theme === 'dark'}
            title="Mode Terang / Gelap"
          >
            {/* @ts-ignore iconify-icon web component */}
            <iconify-icon
              icon={theme === 'dark' ? 'lucide:sun' : 'lucide:moon'}
              aria-hidden="true"
            />
          </button>

          <button
            className="l-humas__icon-btn"
            type="button"
            onClick={handleNotificationClick}
            aria-label="Peringatan aktif"
            title="3 Peringatan Aktif"
          >
            <span style={{ position: 'relative', display: 'grid', placeItems: 'center' }}>
              {/* @ts-ignore iconify-icon web component */}
              <iconify-icon icon="lucide:bell" aria-hidden="true" />
              <span className="l-humas__badge" style={{ position: 'absolute', top: -6, right: -8 }}>
                3
              </span>
            </span>
          </button>

          {headerActions && (
            <div style={{ display: 'contents' }}>
              {headerActions}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NotificationBell } from './NotificationBell';
import { useLayout } from './LayoutContext';
import { HumasSidebar } from './HumasSidebar';
import { HumasHeader } from './HumasHeader';

interface HumasShellProps {
  children: React.ReactNode;
  pageTitle?: string;
  pageSubtitle?: string;
  headerActions?: React.ReactNode;
  pageContentId?: string;
}

function resolvePageContentId(pathname: string, propId?: string): string {
  if (propId) return propId;
  const path = pathname.toLowerCase();
  if (
    path === '/' ||
    path === '/dasbor' ||
    path.startsWith('/pemantauan-kanal') ||
    path.startsWith('/penarikan-metrik-terjadwal') ||
    path.startsWith('/integrasi-youtube') ||
    path.startsWith('/integrasi-meta') ||
    path.startsWith('/integrasi-tiktok') ||
    path.startsWith('/status-integrasi')
  ) {
    return 'dasbor-utama';
  }
  if (path.startsWith('/dasbor-metrik')) return 'dasbor-metrik';
  if (path.startsWith('/pantauan-berita')) return 'pantauan-berita';
  if (path.startsWith('/insight-konten')) return 'insight-konten';
  if (path.startsWith('/kalender-konten')) return 'kalender-konten';
  if (path.startsWith('/papan-proyek')) return 'papan-proyek';
  if (
    path.startsWith('/laporan') ||
    path.startsWith('/daftar-rab-lra') ||
    path.startsWith('/bagikan-cetak')
  ) {
    return 'laporan';
  }
  if (path.startsWith('/basis-pengetahuan')) return 'basis-pengetahuan';
  if (
    path.startsWith('/pengaturan') ||
    path.startsWith('/integrasi-google') ||
    path.startsWith('/pengaturan-dam')
  ) {
    return 'pengaturan';
  }
  if (
    path.startsWith('/akun') ||
    path.startsWith('/manajemen-akun') ||
    path.startsWith('/profil-akun') ||
    path.startsWith('/jejak-audit') ||
    path.startsWith('/verifikasi-paritas') ||
    path.startsWith('/tugas-terjadwal')
  ) {
    return 'akun';
  }
  if (path.startsWith('/sop') || path.startsWith('/status-usulan-sop')) {
    return 'sop';
  }
  if (path.startsWith('/masuk')) return 'masuk';
  return 'dasbor-utama';
}

const MOBILE_PRIMARY_NAV = [
  { label: 'Ikhtisar', href: '/dasbor', icon: 'lucide:layout-dashboard' },
  { label: 'Kanal', href: '/pemantauan-kanal', icon: 'lucide:radio' },
  { label: 'Proyek', href: '/papan-proyek', icon: 'lucide:kanban-square' },
  { label: 'Kalender', href: '/kalender-konten', icon: 'lucide:calendar-days' },
  { label: 'Berita', href: '/pantauan-berita', icon: 'lucide:rss' }
];

function HumasShellInner({
  children,
  pageTitle,
  pageSubtitle,
  headerActions,
  pageContentId
}: HumasShellProps) {
  const { theme, isNavOpen, closeNav, toggleNav } = useLayout();
  const pathname = usePathname() || '/';
  const resolvedContentId = resolvePageContentId(pathname, pageContentId);

  const isBottomItemActive = (href: string) => {
    if (href === '/dasbor') {
      return pathname === '/' || pathname === '/dasbor';
    }
    return pathname.startsWith(href);
  };

  return (
    <div data-layout-system="humas-shell">
      <div
        className="l-humas"
        data-layout="humas-shell"
        data-theme={theme}
        data-nav={isNavOpen ? 'open' : 'closed'}
        id="humas-shell-root"
      >
        <a className="l-humas__skip" href="#humas-main">
          Lewati ke konten utama
        </a>

        <div className="l-humas__frame">
          {/* Menu Samping */}
          <HumasSidebar />

          {/* Scrim Penutup Mobile Drawer */}
          <button
            className="l-humas__scrim"
            type="button"
            onClick={closeNav}
            aria-label="Tutup navigasi"
          />

          {/* Kolom Konten Utama */}
          <div className="l-humas__main">
            {/* Header */}
            <HumasHeader
              pageTitle={pageTitle}
              pageSubtitle={pageSubtitle}
              headerActions={
                <>
                  <NotificationBell />
                  {headerActions}
                </>
              }
              pageContentId={resolvedContentId}
            />

            {/* Konten Halaman */}
            <main className="l-humas__content" id="humas-main">
              <div className="l-humas__content-inner">
                <div data-layout-container data-layout-content>
                  <div
                    data-page-content={resolvedContentId}
                    data-page-slot="content"
                    style={{ display: 'contents' }}
                  >
                    {children}
                  </div>
                </div>
              </div>
            </main>

            {/* Navigasi Bawah Responsif untuk Layar Seluler */}
            <nav
              className="l-humas__bottom-nav"
              aria-label="Navigasi cepat seluler"
              data-testid="mobile-bottom-nav"
            >
              {MOBILE_PRIMARY_NAV.map((item) => {
                const active = isBottomItemActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="l-humas__bottom-link"
                    aria-current={active ? 'page' : undefined}
                    onClick={closeNav}
                  >
                    {/* @ts-ignore iconify-icon web component */}
                    <iconify-icon icon={item.icon} aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <button
                type="button"
                className="l-humas__bottom-link"
                onClick={toggleNav}
                aria-expanded={isNavOpen}
                aria-controls="humas-sidebar"
              >
                {/* @ts-ignore iconify-icon web component */}
                <iconify-icon icon="lucide:menu" aria-hidden="true" />
                <span>Lainnya</span>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HumasShell(props: HumasShellProps) {
  return <HumasShellInner {...props} />;
}

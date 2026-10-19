'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLayout, type UserRole } from './LayoutContext';

interface NavItem {
  title: string;
  href: string;
  icon: string;
  badge?: string | number;
  roles: UserRole[];
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Ringkasan Harian',
    items: [
      {
        title: 'Dasbor & Metrik',
        href: '/dasbor',
        icon: 'lucide:layout-dashboard',
        roles: ['head', 'admin', 'staff', 'reviewer']
      },
      {
        title: 'Pemantauan Kanal',
        href: '/pemantauan-kanal',
        icon: 'lucide:radio',
        roles: ['head', 'admin', 'staff', 'reviewer']
      },
      {
        title: 'Dasbor Metrik Kanal',
        href: '/dasbor-metrik-kanal',
        icon: 'lucide:bar-chart-3',
        roles: ['head', 'admin', 'staff', 'reviewer']
      },
      {
        title: 'Jadwal Tarik Metrik',
        href: '/penarikan-metrik-terjadwal',
        icon: 'lucide:calendar-clock',
        roles: ['head', 'admin', 'staff', 'reviewer']
      }
    ]
  },
  {
    title: 'Produksi Konten',
    items: [
      {
        title: 'Papan Proyek',
        href: '/papan-proyek',
        icon: 'lucide:kanban-square',
        badge: 12,
        roles: ['head', 'admin', 'staff', 'reviewer']
      },
      {
        title: 'Kalender Konten',
        href: '/kalender-konten',
        icon: 'lucide:calendar-days',
        roles: ['head', 'admin', 'staff', 'reviewer']
      },
      {
        title: 'Insight Konten',
        href: '/insight-konten',
        icon: 'lucide:trending-up',
        roles: ['head', 'admin', 'staff']
      }
    ]
  },
  {
    title: 'Pemantauan & Laporan',
    items: [
      {
        title: 'Pantauan Berita',
        href: '/pantauan-berita',
        icon: 'lucide:rss',
        badge: 5,
        roles: ['head', 'admin', 'staff', 'reviewer']
      },
      {
        title: 'Laporan & Anggaran',
        href: '/laporan',
        icon: 'lucide:file-text',
        roles: ['head', 'admin']
      }
    ]
  },
  {
    title: 'Rujukan Kerja',
    items: [
      {
        title: 'Basis Pengetahuan',
        href: '/basis-pengetahuan',
        icon: 'lucide:library',
        roles: ['head', 'admin', 'staff', 'reviewer']
      },
      {
        title: 'SOP Visual',
        href: '/sop',
        icon: 'lucide:workflow',
        roles: ['head', 'admin', 'staff', 'reviewer']
      }
    ]
  },
  {
    title: 'Pengaturan',
    items: [
      {
        title: 'Pengaturan & Integrasi',
        href: '/pengaturan',
        icon: 'lucide:plug-zap',
        roles: ['head', 'admin']
      },
      {
        title: 'Status Integrasi Kanal',
        href: '/status-integrasi',
        icon: 'lucide:activity',
        roles: ['head', 'admin', 'staff', 'reviewer']
      },
      {
        title: 'Penghubung YouTube',
        href: '/integrasi-youtube',
        icon: 'lucide:youtube',
        roles: ['head', 'admin']
      },
      {
        title: 'Penghubung Meta',
        href: '/integrasi-meta',
        icon: 'lucide:share-2',
        roles: ['head', 'admin']
      },
      {
        title: 'Akun & Audit',
        href: '/akun',
        icon: 'lucide:users',
        roles: ['head', 'admin']
      },
      {
        title: 'Verifikasi Paritas DB',
        href: '/verifikasi-paritas',
        icon: 'lucide:database',
        roles: ['head', 'admin']
      }
    ]
  }
];

export function HumasSidebar() {
  const pathname = usePathname() || '/';
  const { currentRole, currentUser, closeNav } = useLayout();

  const isPathActive = (target: string) => {
    if (target === '/dasbor') {
      return pathname === '/' || pathname === '/dasbor' || pathname.startsWith('/dasbor-metrik');
    }
    if (target === '/laporan') {
      return (
        pathname.startsWith('/laporan') ||
        pathname.startsWith('/daftar-rab-lra') ||
        pathname.startsWith('/bagikan-cetak')
      );
    }
    if (target === '/akun') {
      return (
        pathname.startsWith('/akun') ||
        pathname.startsWith('/manajemen-akun') ||
        pathname.startsWith('/profil-akun')
      );
    }
    return pathname.startsWith(target);
  };

  return (
    <aside
      className="l-humas__sidebar"
      id="humas-sidebar"
      aria-label="Navigasi utama"
      data-testid="humas-sidebar"
      data-role-active={currentRole}
    >
      <div className="l-humas__brand">
        <span className="l-humas__brand-mark" aria-hidden="true" style={{ background: '#059669', color: '#ffffff', fontWeight: 800 }}>
          KP
        </span>
        <div className="l-humas__brand-text">
          <p className="l-humas__brand-title" style={{ fontWeight: 700, letterSpacing: '-0.01em', margin: 0 }}>Dasbor Humed</p>
          <span style={{ fontSize: '11px', color: 'var(--color-muted, #94a3b8)', display: 'block' }}>Komnas Palestina</span>
        </div>
        <button
          type="button"
          className="l-humas__sidebar-close"
          onClick={closeNav}
          aria-label="Tutup menu navigasi"
        >
          {/* @ts-ignore iconify-icon web component */}
          <iconify-icon icon="lucide:x" aria-hidden="true" />
        </button>
      </div>

      <nav className="l-humas__nav" aria-label="Modul humas">
        {NAV_GROUPS.map((group) => {
          const visibleItems = group.items.filter((item) => item.roles.includes(currentRole));
          if (visibleItems.length === 0) return null;

          return (
            <div className="l-humas__group" key={group.title} data-group={group.title}>
              <p className="l-humas__group-title">{group.title}</p>
              {visibleItems.map((item) => {
                const active = isPathActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="l-humas__link"
                    aria-current={active ? 'page' : undefined}
                    data-roles={JSON.stringify(item.roles)}
                    data-nav-href={item.href}
                    onClick={closeNav}
                  >
                    {/* @ts-ignore iconify-icon web component */}
                    <iconify-icon icon={item.icon} aria-hidden="true" />
                    <span>{item.title}</span>
                    {item.badge !== undefined && (
                      <span className="l-humas__link-count">{item.badge}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className="l-humas__sidebar-foot">
        <p className="l-humas__sync">
          {/* @ts-ignore iconify-icon web component */}
          <iconify-icon icon="lucide:refresh-cw" aria-hidden="true" />
          <span>
            Sinkron terakhir <b data-shell-synced>19 Okt 2026, 08:35 WIB</b>
          </span>
        </p>

        <div className="l-humas__user" data-testid="sidebar-user-card">
          {currentUser.avatarUrl ? (
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="l-humas__avatar"
              style={{ objectFit: 'cover', border: '1px solid #303236' }}
            />
          ) : (
            <span className="l-humas__avatar" aria-hidden="true" data-testid="sidebar-user-avatar">
              {currentUser.initials}
            </span>
          )}
          <span className="l-humas__user-meta">
            <span className="l-humas__user-name" data-testid="sidebar-user-name">
              {currentUser.name}
            </span>
            <span className="l-humas__user-role" data-shell-role-label data-testid="sidebar-user-role">
              {currentUser.roleLabel}
            </span>
          </span>
          <Link
            href="/profil-akun"
            title="Pengaturan profil akun"
            className="l-humas__user-settings"
            onClick={closeNav}
          >
            {/* @ts-ignore iconify-icon web component */}
            <iconify-icon icon="lucide:settings" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </aside>
  );
}

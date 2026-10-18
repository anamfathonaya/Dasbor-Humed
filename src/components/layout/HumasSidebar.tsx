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
  hint?: string;
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
      }
    ]
  },
  {
    title: 'Produksi Konten',
    hint: 'Dari permintaan bidang sampai siap terbit.',
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
  const { currentRole, currentUser } = useLayout();

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
        <span className="l-humas__brand-mark" aria-hidden="true">
          HM
        </span>
        <div className="l-humas__brand-text">
          <p className="l-humas__brand-title">Humas Internal</p>
          <p className="l-humas__brand-sub">Ruang kerja komunikasi</p>
        </div>
      </div>

      <nav className="l-humas__nav" aria-label="Modul humas">
        {NAV_GROUPS.map((group) => {
          // Filter item navigasi sesuai hak akses peran aktif
          const visibleItems = group.items.filter((item) => item.roles.includes(currentRole));
          if (visibleItems.length === 0) return null;

          return (
            <div className="l-humas__group" key={group.title} data-group={group.title}>
              <p className="l-humas__group-title l-humas__group-title-inline">{group.title}</p>
              {group.hint && <p className="l-humas__group-hint">{group.hint}</p>}
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
        <div className="l-humas__target">
          <p className="l-humas__target-title">Target konten bulan ini</p>
          <div
            className="l-humas__target-bar"
            role="img"
            aria-label="Realisasi target konten 68 persen"
          >
            <span style={{ width: '68%' }} />
          </div>
          <p className="l-humas__target-meta">68 dari 100 konten terbit</p>
        </div>

        <p className="l-humas__sync">
          {/* @ts-ignore iconify-icon web component */}
          <iconify-icon icon="lucide:refresh-cw" aria-hidden="true" />
          <span>
            Sinkron terakhir <b data-shell-synced>Hari ini WIB</b>
          </span>
        </p>

        <div className="l-humas__user" data-testid="sidebar-user-card">
          {currentUser.avatarUrl ? (
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="l-humas__avatar"
              style={{ objectFit: 'cover', border: '1px solid rgba(255,255,255,0.2)' }}
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
              Peran: {currentUser.roleLabel}
            </span>
          </span>
          <Link
            href="/profil-akun"
            title="Pengaturan profil akun"
            style={{
              marginLeft: 'auto',
              color: '#8496a6',
              textDecoration: 'none',
              display: 'grid',
              placeItems: 'center',
              padding: '4px'
            }}
          >
            {/* @ts-ignore iconify-icon web component */}
            <iconify-icon icon="lucide:settings" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </aside>
  );
}

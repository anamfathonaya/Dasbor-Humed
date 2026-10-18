'use client';

import React from 'react';
import { LayoutProvider, useLayout } from './LayoutContext';
import { HumasSidebar } from './HumasSidebar';
import { HumasHeader } from './HumasHeader';

interface HumasShellProps {
  children: React.ReactNode;
  pageTitle?: string;
  pageSubtitle?: string;
  headerActions?: React.ReactNode;
}

function HumasShellInner({
  children,
  pageTitle,
  pageSubtitle,
  headerActions
}: HumasShellProps) {
  const { theme, isNavOpen, closeNav } = useLayout();

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
              headerActions={headerActions}
            />

            {/* Konten Halaman */}
            <main className="l-humas__content" id="humas-main">
              <div className="l-humas__content-inner">
                <div data-layout-container data-layout-content>
                  {children}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HumasShell(props: HumasShellProps) {
  return <HumasShellInner {...props} />;
}

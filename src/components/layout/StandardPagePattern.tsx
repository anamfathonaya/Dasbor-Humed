'use client';

import React, { useState } from 'react';

export type ViewMode = 'table' | 'cards';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  id: string;
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}

/**
 * 1. Komponen Status Bar Operasional
 */
export function PageStatusBar({
  text,
  actions
}: {
  text?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  if (!text && !actions) return null;

  return (
    <section
      className="dasbor__bar"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}
    >
      {text && (
        <div className="dasbor__bar-text" style={{ margin: 0, flex: '1 1 280px' }}>
          {text}
        </div>
      )}
      {actions && <div className="dasbor__bar-actions">{actions}</div>}
    </section>
  );
}

/**
 * 2. Komponen Status Badge Seragam
 */
export function StatusBadge({
  variant = 'flat',
  children
}: {
  variant?: 'up' | 'down' | 'blue' | 'amber' | 'green' | 'flat';
  children: React.ReactNode;
}) {
  const variantClass =
    variant === 'green'
      ? 'dasbor__badge--up'
      : variant === 'down'
      ? 'dasbor__badge--down'
      : variant === 'blue'
      ? 'dasbor__badge--blue'
      : variant === 'amber'
      ? 'dasbor__badge--amber'
      : variant === 'up'
      ? 'dasbor__badge--up'
      : 'dasbor__badge--flat';

  return (
    <span className={`dasbor__badge ${variantClass}`} style={{ fontSize: '12px' }}>
      {children}
    </span>
  );
}

/**
 * 3. Komponen Empty State
 */
export function EmptyState({
  title = 'Belum ada data',
  description = 'Tidak ada item yang cocok dengan kriteria pencarian atau filter saat ini.',
  actionLabel,
  onAction
}: {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div
      className="dasbor__card"
      style={{
        padding: '3rem 1.5rem',
        textAlign: 'center'
      }}
    >
      <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📂</div>
      <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: '0 0 0.5rem', color: 'var(--color-text)' }}>
        {title}
      </h3>
      <p
        style={{
          margin: '0 auto 1.25rem',
          maxWidth: '420px',
          fontSize: '0.85rem',
          color: 'var(--color-text-muted)'
        }}
      >
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="dasbor__btn dasbor__btn--primary"
          style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

/**
 * 4. Komponen Toolbar Pencarian & Filter
 */
export function PageToolbar({
  searchPlaceholder = 'Cari data...',
  searchValue = '',
  onSearchChange,
  filters = [],
  totalCountText,
  allowViewToggle = false,
  viewMode = 'table',
  onViewModeChange
}: {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  filters?: FilterConfig[];
  totalCountText?: string;
  allowViewToggle?: boolean;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
}) {
  return (
    <div
      className="page-toolbar dasbor__card"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.85rem',
        padding: '0.85rem 1rem'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          flex: 1,
          minWidth: 0
        }}
      >
        {/* Kotak Cari */}
        {onSearchChange && (
          <div style={{ position: 'relative', minWidth: '200px', maxWidth: '360px', flex: '1 1 220px' }}>
            <input
              type="search"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{
                width: '100%',
                minHeight: '38px',
                padding: '0.45rem 0.75rem',
                fontSize: '0.85rem',
                border: '1px solid var(--color-border)',
                borderRadius: '4px',
                background: 'var(--color-surface-sunken)',
                color: 'var(--color-text)'
              }}
            />
          </div>
        )}

        {/* Filter Dropdowns */}
        {filters.map((filter) => (
          <div key={filter.id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              {filter.label}:
            </span>
            <select
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              className="dasbor__select"
            >
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ))}

        {/* Indikator Total Data */}
        {totalCountText && (
          <span
            style={{
              fontSize: '0.78rem',
              color: 'var(--color-text-muted)',
              marginLeft: 'auto',
              fontFamily: 'var(--font-mono)'
            }}
          >
            {totalCountText}
          </span>
        )}
      </div>

      {/* Toggle Mode Tampilan (Tabel vs Kartu) */}
      {allowViewToggle && onViewModeChange && (
        <div className="dasbor__seg" role="group" aria-label="Mode tampilan">
          <button
            type="button"
            className="dasbor__seg-btn"
            aria-pressed={viewMode === 'table'}
            onClick={() => onViewModeChange('table')}
          >
            Tabel
          </button>
          <button
            type="button"
            className="dasbor__seg-btn"
            aria-pressed={viewMode === 'cards'}
            onClick={() => onViewModeChange('cards')}
          >
            Kartu
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * 5. Komponen Wadah Tabel Standar
 */
export function DataTableContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="dasbor__card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="dasbor__table-wrap">{children}</div>
    </div>
  );
}

/**
 * 6. Komponen Pola Halaman Baku Utama (StandardPagePattern)
 */
export interface StandardPagePatternProps {
  title?: string;
  subtitle?: string;
  statusBarText?: React.ReactNode;
  headerActions?: React.ReactNode;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (query: string) => void;
  filters?: FilterConfig[];
  totalCountText?: string;
  allowViewToggle?: boolean;
  defaultViewMode?: ViewMode;
  renderTable?: () => React.ReactNode;
  renderCards?: () => React.ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  children?: React.ReactNode;
}

export function StandardPagePattern({
  statusBarText,
  headerActions,
  searchPlaceholder = 'Cari data...',
  searchValue = '',
  onSearchChange,
  filters = [],
  totalCountText,
  allowViewToggle = false,
  defaultViewMode = 'table',
  renderTable,
  renderCards,
  isLoading = false,
  isEmpty = false,
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  children
}: StandardPagePatternProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(defaultViewMode);

  return (
    <div
      className="standard-page-pattern dasbor"
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
    >
      <PageStatusBar text={statusBarText} actions={headerActions} />

      <PageToolbar
        searchPlaceholder={searchPlaceholder}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        filters={filters}
        totalCountText={totalCountText}
        allowViewToggle={allowViewToggle}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {isLoading ? (
        <div
          className="dasbor__card"
          style={{
            padding: '3rem',
            textAlign: 'center',
            color: 'var(--color-text-muted)'
          }}
        >
          <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text)' }}>
            Memuat data...
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem' }}>Mohon tunggu sejenak</p>
        </div>
      ) : isEmpty ? (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          actionLabel={emptyActionLabel}
          onAction={onEmptyAction}
        />
      ) : (
        <>
          {children}
          {viewMode === 'table' && renderTable && renderTable()}
          {viewMode === 'cards' && renderCards && renderCards()}
        </>
      )}
    </div>
  );
}

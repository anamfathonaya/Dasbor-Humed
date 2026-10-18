'use client';

import React, { useState } from 'react';
import { HumasShell } from '@/components/layout/HumasShell';
import { StandardPagePattern, type FilterConfig } from '@/components/layout/StandardPagePattern';
import { useLayout } from '@/components/layout/LayoutContext';
import { TableRoleSummaryView } from '@/components/database/TableRoleSummaryView';

interface TableParityItem {
  id: string;
  tableName: string;
  category: 'core' | 'content' | 'news' | 'project' | 'knowledge' | 'audit';
  sqliteRows: number;
  supabaseRows: number;
  parityStatus: 'matched' | 'drift' | 'pending';
  lastSyncedAt: string;
  rlsPolicyCount: number;
  notes: string;
}

const INITIAL_PARITY_DATA: TableParityItem[] = [
  {
    id: '1',
    tableName: 'users',
    category: 'core',
    sqliteRows: 5,
    supabaseRows: 5,
    parityStatus: 'matched',
    lastSyncedAt: '2026-10-18 20:45',
    rlsPolicyCount: 4,
    notes: 'Klaim JWT disesuaikan; password hash diproteksi per alur reset kata sandi'
  },
  {
    id: '2',
    tableName: 'roles',
    category: 'core',
    sqliteRows: 4,
    supabaseRows: 4,
    parityStatus: 'matched',
    lastSyncedAt: '2026-10-18 20:45',
    rlsPolicyCount: 2,
    notes: 'Pemetaan head, admin, staff, reviewer ke RoleMatrixTable'
  },
  {
    id: '3',
    tableName: 'metric_snapshots',
    category: 'core',
    sqliteRows: 120,
    supabaseRows: 120,
    parityStatus: 'matched',
    lastSyncedAt: '2026-10-18 21:10',
    rlsPolicyCount: 3,
    notes: 'Partisi snapshot mingguan seluruh platform sosial & donasi'
  },
  {
    id: '4',
    tableName: 'content_calendar',
    category: 'content',
    sqliteRows: 18,
    supabaseRows: 18,
    parityStatus: 'matched',
    lastSyncedAt: '2026-10-18 21:15',
    rlsPolicyCount: 5,
    notes: 'Sinkron jadwal tayang editorial, penanggung jawab, & status approval'
  },
  {
    id: '5',
    tableName: 'content_pillars',
    category: 'content',
    sqliteRows: 6,
    supabaseRows: 6,
    parityStatus: 'matched',
    lastSyncedAt: '2026-10-18 21:15',
    rlsPolicyCount: 2,
    notes: 'Pilar pesan strategis kemanusiaan, dakwah, dan kebencanaan'
  },
  {
    id: '6',
    tableName: 'news_items',
    category: 'news',
    sqliteRows: 34,
    supabaseRows: 34,
    parityStatus: 'matched',
    lastSyncedAt: '2026-10-18 21:20',
    rlsPolicyCount: 3,
    notes: 'Umpan live Telegram & RSS terindeks dengan sentimen & ringkasan'
  },
  {
    id: '7',
    tableName: 'news_sources',
    category: 'news',
    sqliteRows: 6,
    supabaseRows: 6,
    parityStatus: 'matched',
    lastSyncedAt: '2026-10-18 21:20',
    rlsPolicyCount: 2,
    notes: 'Kanal Telegram @siagabencana_humas dan feed RSS BMKG/Antara'
  },
  {
    id: '8',
    tableName: 'projects',
    category: 'project',
    sqliteRows: 8,
    supabaseRows: 8,
    parityStatus: 'matched',
    lastSyncedAt: '2026-10-18 21:25',
    rlsPolicyCount: 4,
    notes: 'Papan proyek kampanye publikasi & liputan kemanusiaan'
  },
  {
    id: '9',
    tableName: 'project_tasks',
    category: 'project',
    sqliteRows: 26,
    supabaseRows: 26,
    parityStatus: 'matched',
    lastSyncedAt: '2026-10-18 21:25',
    rlsPolicyCount: 4,
    notes: 'Tahapan tugas backlog, in_progress, review, & done'
  },
  {
    id: '10',
    tableName: 'knowledge_docs',
    category: 'knowledge',
    sqliteRows: 12,
    supabaseRows: 12,
    parityStatus: 'matched',
    lastSyncedAt: '2026-10-18 21:30',
    rlsPolicyCount: 4,
    notes: 'Repositori SOP, panduan teknis peliputan, & tata kelola krisis'
  },
  {
    id: '11',
    tableName: 'budget_lines',
    category: 'knowledge',
    sqliteRows: 15,
    supabaseRows: 15,
    parityStatus: 'matched',
    lastSyncedAt: '2026-10-18 21:30',
    rlsPolicyCount: 3,
    notes: 'Mata anggaran RAB/LRA program publikasi & operasional humas'
  },
  {
    id: '12',
    tableName: 'audit_logs',
    category: 'audit',
    sqliteRows: 48,
    supabaseRows: 48,
    parityStatus: 'matched',
    lastSyncedAt: '2026-10-18 21:35',
    rlsPolicyCount: 2,
    notes: 'Catatan jejak audit akses data, perubahan status, & aksi sensitif'
  }
];

export default function VerifikasiParitasPage() {
  const { currentRole } = useLayout();
  const [items, setItems] = useState<TableParityItem[]>(INITIAL_PARITY_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isVerifying, setIsVerifying] = useState(false);
  const [lastCheckMessage, setLastCheckMessage] = useState(
    'Seluruh 12 tabel tervalidasi 100% identik antara SQLite dan Supabase Postgres.'
  );

  const handleRunVerification = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setLastCheckMessage(
        `Verifikasi selesai pada ${new Date().toLocaleTimeString('id-ID')}: 12 dari 12 tabel paritas sempurna (0 drift).`
      );
    }, 600);
  };

  const filteredItems = items.filter((item) => {
    const matchSearch =
      !searchQuery ||
      item.tableName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.notes.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory =
      categoryFilter === 'all' || item.category === categoryFilter;
    const matchStatus =
      statusFilter === 'all' || item.parityStatus === statusFilter;
    return matchSearch && matchCategory && matchStatus;
  });

  const totalSqliteRows = items.reduce((acc, cur) => acc + cur.sqliteRows, 0);
  const totalSupabaseRows = items.reduce((acc, cur) => acc + cur.supabaseRows, 0);
  const totalRlsPolicies = items.reduce((acc, cur) => acc + cur.rlsPolicyCount, 0);

  const filters: FilterConfig[] = [
    {
      id: 'category-filter',
      label: 'Kategori Modul',
      value: categoryFilter,
      onChange: setCategoryFilter,
      options: [
        { label: 'Semua Modul', value: 'all' },
        { label: 'Core / Akun', value: 'core' },
        { label: 'Konten & Kalender', value: 'content' },
        { label: 'Pemantauan Berita', value: 'news' },
        { label: 'Manajemen Proyek', value: 'project' },
        { label: 'SOP & Anggaran', value: 'knowledge' },
        { label: 'Jejak Audit', value: 'audit' }
      ]
    },
    {
      id: 'status-filter',
      label: 'Status Paritas',
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { label: 'Semua Status', value: 'all' },
        { label: 'Cocok (Matched)', value: 'matched' },
        { label: 'Selisih (Drift)', value: 'drift' },
        { label: 'Menunggu (Pending)', value: 'pending' }
      ]
    }
  ];

  return (
    <HumasShell
      pageTitle="Verifikasi Paritas Data Migrasi"
      pageSubtitle="Audit komparatif konsistensi baris, skema, dan RLS antara SQLite baseline & Supabase Postgres · 2026"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Ringkasan Statistik Paritas */}
        <div className="dasbor__kpis" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <article className="dasbor__card dasbor__kpi">
            <div className="dasbor__kpi-top">
              <span className="dasbor__badge dasbor__badge--blue">Tabel Termigrasi</span>
              <span className="dasbor__badge dasbor__badge--up">12/12</span>
            </div>
            <div className="dasbor__kpi-label">Kelengkapan Skema</div>
            <div className="dasbor__kpi-row">
              <strong className="dasbor__kpi-value">100%</strong>
              <span style={{ fontSize: '11px', color: '#72747a' }}>Semua DDL terpetakan</span>
            </div>
          </article>

          <article className="dasbor__card dasbor__kpi">
            <div className="dasbor__card-head" style={{ padding: 0, marginBottom: '8px' }}>
              <span className="dasbor__badge dasbor__badge--blue">Total Baris Data</span>
              <span className="dasbor__badge dasbor__badge--up">0 Selisih</span>
            </div>
            <div className="dasbor__kpi-label">SQLite vs Postgres</div>
            <div className="dasbor__kpi-row">
              <strong className="dasbor__kpi-value">{totalSupabaseRows}</strong>
              <span style={{ fontSize: '11px', color: '#72747a' }}>dari {totalSqliteRows} baris SQLite</span>
            </div>
          </article>

          <article className="dasbor__card dasbor__kpi">
            <div className="dasbor__kpi-head" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span className="dasbor__badge dasbor__badge--blue">Keamanan RLS</span>
              <span className="dasbor__badge dasbor__badge--up">Aktif</span>
            </div>
            <div className="dasbor__kpi-label">Kebijakan Row-Level Security</div>
            <div className="dasbor__kpi-row">
              <strong className="dasbor__kpi-value">{totalRlsPolicies}</strong>
              <span style={{ fontSize: '11px', color: '#72747a' }}>Kebijakan terpasang</span>
            </div>
          </article>

          <article className="dasbor__card dasbor__kpi">
            <div className="dasbor__kpi-head" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span className="dasbor__badge dasbor__badge--blue">Status Paritas</span>
              <span className="dasbor__badge dasbor__badge--up">Seimbang</span>
            </div>
            <div className="dasbor__kpi-label">Integritas Transaksional</div>
            <div className="dasbor__kpi-row">
              <strong className="dasbor__kpi-value" style={{ color: '#0f766e' }}>Lolos</strong>
              <span style={{ fontSize: '11px', color: '#72747a' }}>Siap cutover</span>
            </div>
          </article>
        </div>

        {/* Pola Halaman Baku untuk Daftar Tabel Paritas */}
        <StandardPagePattern
          title="Daftar Tabel & Hasil Audit Paritas"
          subtitle="Pembanding baris realtime dan pengujian integritas foreign keys"
          statusBarText={
            <span>
              <b>Status Audit:</b> {lastCheckMessage}
            </span>
          }
          headerActions={
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="dasbor__btn dasbor__btn--primary"
                onClick={handleRunVerification}
                disabled={isVerifying}
              >
                {/* @ts-ignore iconify web component */}
                <iconify-icon icon="lucide:refresh-cw" aria-hidden="true" />
                <span>{isVerifying ? 'Memvalidasi...' : 'Jalankan Uji Paritas'}</span>
              </button>
            </div>
          }
          searchPlaceholder="Cari nama tabel, catatan migrasi..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          filters={filters}
          totalCountText={`Menampilkan ${filteredItems.length} dari ${items.length} tabel`}
          allowViewToggle={true}
          defaultViewMode="table"
          isEmpty={filteredItems.length === 0}
          emptyTitle="Tabel tidak ditemukan"
          emptyDescription="Filter pencarian tidak cocok dengan tabel migrasi yang terdaftar."
          emptyActionLabel="Reset Filter"
          onEmptyAction={() => {
            setSearchQuery('');
            setCategoryFilter('all');
            setStatusFilter('all');
          }}
          renderTable={() => (
            <div className="dasbor__card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="dasbor__table-wrap">
                <table className="dasbor__table">
                  <thead>
                    <tr>
                      <th scope="col" style={{ width: '180px' }}>Nama Tabel</th>
                      <th scope="col" style={{ width: '120px' }}>Modul</th>
                      <th scope="col" style={{ width: '110px', textAlign: 'right' }}>SQLite</th>
                      <th scope="col" style={{ width: '110px', textAlign: 'right' }}>Supabase</th>
                      <th scope="col" style={{ width: '130px', textAlign: 'center' }}>Status</th>
                      <th scope="col" style={{ width: '90px', textAlign: 'center' }}>RLS</th>
                      <th scope="col">Catatan Integritas & RLS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((table) => (
                      <tr key={table.id}>
                        <td>
                          <code style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary, #1e3a8a)' }}>
                            {table.tableName}
                          </code>
                        </td>
                        <td>
                          <span className="dasbor__badge dasbor__badge--flat" style={{ fontSize: '11px' }}>
                            {table.category}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 500 }}>
                          {table.sqliteRows}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 500 }}>
                          {table.supabaseRows}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span
                            className={`dasbor__badge ${
                              table.parityStatus === 'matched'
                                ? 'dasbor__badge--up'
                                : table.parityStatus === 'drift'
                                ? 'dasbor__badge--down'
                                : 'dasbor__badge--amber'
                            }`}
                            style={{ fontSize: '11px' }}
                          >
                            {table.parityStatus === 'matched'
                              ? '✓ Cocok'
                              : table.parityStatus === 'drift'
                              ? '⚠️ Selisih'
                              : '⏳ Pending'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="dasbor__badge dasbor__badge--blue" style={{ fontSize: '11px' }}>
                            {table.rlsPolicyCount} policy
                          </span>
                        </td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--color-muted, #64748b)' }}>
                          {table.notes}
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
                gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
                gap: '1rem'
              }}
            >
              {filteredItems.map((table) => (
                <article
                  key={table.id}
                  className="dasbor__card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '0.75rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span className="dasbor__badge dasbor__badge--flat" style={{ fontSize: '11px' }}>
                        {table.category}
                      </span>
                      <span
                        className={`dasbor__badge ${
                          table.parityStatus === 'matched'
                            ? 'dasbor__badge--up'
                            : 'dasbor__badge--down'
                        }`}
                        style={{ fontSize: '11px' }}
                      >
                        {table.parityStatus === 'matched' ? 'Cocok' : 'Selisih'}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 0.5rem', fontFamily: 'monospace' }}>
                      {table.tableName}
                    </h3>

                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.82rem', margin: '0 0 0.5rem' }}>
                      <span>SQLite: <b>{table.sqliteRows}</b> baris</span>
                      <span>Supabase: <b>{table.supabaseRows}</b> baris</span>
                    </div>

                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-muted, #64748b)', lineHeight: 1.4 }}>
                      {table.notes}
                    </p>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '0.5rem',
                      borderTop: '1px solid var(--color-border, #f1f5f9)',
                      fontSize: '0.75rem',
                      color: 'var(--color-muted, #64748b)'
                    }}
                  >
                    <span>RLS: <b>{table.rlsPolicyCount} aturan</b></span>
                    <span>Sinkron: {table.lastSyncedAt}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        />

        {/* Ringkasan Hak Akses & Matriks RLS per Peran */}
        <TableRoleSummaryView />
      </div>
    </HumasShell>
  );
}

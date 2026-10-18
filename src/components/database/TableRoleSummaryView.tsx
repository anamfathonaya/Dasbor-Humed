'use client';

import React, { useState } from 'react';
import type { RoleName } from '@/types/contracts';

export interface TableRoleSummary {
  tableName: string;
  category: string;
  description: string;
  rlsPolicies: {
    role: RoleName;
    select: boolean;
    insert: boolean;
    update: boolean;
    delete: boolean;
    condition: string;
  }[];
}

const MOCK_TABLE_SUMMARIES: TableRoleSummary[] = [
  {
    tableName: 'users & roles',
    category: 'Autentikasi & Akun',
    description: 'Manajemen kredensial staf, penugasan peran JWT, dan profil pengguna.',
    rlsPolicies: [
      { role: 'head', select: true, insert: true, update: true, delete: true, condition: 'Seluruh akun & audit log' },
      { role: 'admin', select: true, insert: true, update: true, delete: false, condition: 'Kelola akun non-head' },
      { role: 'staff', select: true, insert: false, update: true, delete: false, condition: 'Hanya profil & avatar mandiri' },
      { role: 'reviewer', select: true, insert: false, update: false, delete: false, condition: 'Hanya info nama & avatar' },
    ]
  },
  {
    tableName: 'content_calendar & pillars',
    category: 'Konten & Publikasi',
    description: 'Jadwal tayang editorial lintas kanal, tema liputan, dan persetujuan naskah.',
    rlsPolicies: [
      { role: 'head', select: true, insert: true, update: true, delete: true, condition: 'Akses penuh & persetujuan final' },
      { role: 'admin', select: true, insert: true, update: true, delete: true, condition: 'Kelola jadwal, pilar, dan penugasan' },
      { role: 'staff', select: true, insert: true, update: true, delete: false, condition: 'Draf konten & materi yang ditugaskan' },
      { role: 'reviewer', select: true, insert: false, update: true, delete: false, condition: 'Persetujuan review naskah & revisi' },
    ]
  },
  {
    tableName: 'news_items & sources',
    category: 'Pemantauan Berita',
    description: 'Arsip umpan Telegram siaga dan RSS media berita nasional.',
    rlsPolicies: [
      { role: 'head', select: true, insert: true, update: true, delete: true, condition: 'Pantauan analitik & rujukan kebijakan' },
      { role: 'admin', select: true, insert: true, update: true, delete: true, condition: 'Kelola sumber URL & token Telegram' },
      { role: 'staff', select: true, insert: true, update: true, delete: false, condition: 'Baca feed, bookmark rujukan, buat draf' },
      { role: 'reviewer', select: true, insert: false, update: false, delete: false, condition: 'Baca feed & tinjau konteks' },
    ]
  },
  {
    tableName: 'projects & project_tasks',
    category: 'Manajemen Proyek',
    description: 'Papan kanban tugas kampanye, tenggat waktu, dan pembagian beban kerja.',
    rlsPolicies: [
      { role: 'head', select: true, insert: true, update: true, delete: true, condition: 'Pantauan progres & approval anggaran' },
      { role: 'admin', select: true, insert: true, update: true, delete: true, condition: 'Kelola papan proyek & delegasi tugas' },
      { role: 'staff', select: true, insert: true, update: true, delete: false, condition: 'Tugas yang di-assign & pindah tahapan' },
      { role: 'reviewer', select: true, insert: false, update: false, delete: false, condition: 'Tinjau hasil kerja & deliverable' },
    ]
  },
  {
    tableName: 'metric_snapshots',
    category: 'Metrik & Analitik',
    description: 'Agregat analitik mingguan: jangkauan sosmed, donasi, belanja iklan Meta/TikTok.',
    rlsPolicies: [
      { role: 'head', select: true, insert: true, update: true, delete: true, condition: 'Seluruh metrik termasuk donasi & iklan' },
      { role: 'admin', select: true, insert: true, update: true, delete: true, condition: 'Sinkronisasi API & input realisasi' },
      { role: 'staff', select: true, insert: false, update: false, delete: false, condition: 'Hanya jangkauan sosmed & situs web' },
      { role: 'reviewer', select: true, insert: false, update: false, delete: false, condition: 'Metrik agregat ringkasan' },
    ]
  },
  {
    tableName: 'knowledge_docs & budget_lines',
    category: 'SOP & Anggaran',
    description: 'Repositori tata kelola SOP humas, berkas liputan, dan rincian RAB/LRA.',
    rlsPolicies: [
      { role: 'head', select: true, insert: true, update: true, delete: true, condition: 'Kategori head, admin, all & hapus SOP' },
      { role: 'admin', select: true, insert: true, update: true, delete: false, condition: 'Kategori admin, all & draf SOP' },
      { role: 'staff', select: true, insert: false, update: false, delete: false, condition: 'Hanya dokumen kategori publik/all' },
      { role: 'reviewer', select: true, insert: false, update: false, delete: false, condition: 'Tinjau proposal & draf SOP' },
    ]
  }
];

export function TableRoleSummaryView() {
  const [selectedRole, setSelectedRole] = useState<RoleName>('staff');

  return (
    <div className="dasbor__card" style={{ marginTop: '1.25rem' }}>
      <div className="dasbor__card-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 600, margin: '0 0 4px' }}>
            Ringkasan Hak Akses Tabel per Peran (RLS Matrix)
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-muted, #64748b)', margin: 0 }}>
            Kebijakan Row-Level Security Supabase yang membatasi SELECT, INSERT, UPDATE, dan DELETE per klaim peran.
          </p>
        </div>

        {/* Pemilih Tab Peran */}
        <div className="dasbor__seg" role="tablist" aria-label="Pilih Peran">
          {(['head', 'admin', 'staff', 'reviewer'] as RoleName[]).map((role) => (
            <button
              key={role}
              type="button"
              role="tab"
              aria-selected={selectedRole === role}
              className={`dasbor__seg-btn ${selectedRole === role ? 'dasbor__seg-btn--active' : ''}`}
              onClick={() => setSelectedRole(role)}
            >
              {role === 'head' ? 'Kepala Humas' : role === 'admin' ? 'Admin Teknis' : role === 'staff' ? 'Staf Media' : 'Reviewer'}
            </button>
          ))}
        </div>
      </div>

      <div className="dasbor__table-wrap" style={{ marginTop: '1rem' }}>
        <table className="dasbor__table">
          <thead>
            <tr>
              <th scope="col" style={{ width: '200px' }}>Tabel & Skema</th>
              <th scope="col" style={{ width: '150px' }}>Modul Bisnis</th>
              <th scope="col" style={{ width: '90px', textAlign: 'center' }}>BACA</th>
              <th scope="col" style={{ width: '90px', textAlign: 'center' }}>BUAT</th>
              <th scope="col" style={{ width: '90px', textAlign: 'center' }}>UBAH</th>
              <th scope="col" style={{ width: '90px', textAlign: 'center' }}>HAPUS</th>
              <th scope="col">Aturan Filter Baris RLS (USING Expression)</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_TABLE_SUMMARIES.map((item) => {
              const policy = item.rlsPolicies.find((p) => p.role === selectedRole);
              return (
                <tr key={item.tableName}>
                  <td>
                    <strong style={{ fontSize: '0.88rem', color: 'var(--color-text, #0f172a)' }}>
                      {item.tableName}
                    </strong>
                    <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--color-muted, #64748b)' }}>
                      {item.description}
                    </p>
                  </td>
                  <td>
                    <span className="dasbor__badge dasbor__badge--flat" style={{ fontSize: '11px' }}>
                      {item.category}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`dasbor__badge ${policy?.select ? 'dasbor__badge--up' : 'dasbor__badge--down'}`} style={{ fontSize: '10px' }}>
                      {policy?.select ? 'YA' : 'TIDAK'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`dasbor__badge ${policy?.insert ? 'dasbor__badge--up' : 'dasbor__badge--down'}`} style={{ fontSize: '10px' }}>
                      {policy?.insert ? 'YA' : 'TIDAK'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`dasbor__badge ${policy?.update ? 'dasbor__badge--up' : 'dasbor__badge--down'}`} style={{ fontSize: '10px' }}>
                      {policy?.update ? 'YA' : 'TIDAK'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`dasbor__badge ${policy?.delete ? 'dasbor__badge--up' : 'dasbor__badge--down'}`} style={{ fontSize: '10px' }}>
                      {policy?.delete ? 'YA' : 'TIDAK'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--color-muted, #64748b)' }}>
                    <code>{policy?.condition || '-'}</code>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TableRoleSummaryView;

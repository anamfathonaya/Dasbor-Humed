'use client';

import React, { useState } from 'react';
import { HumasShell } from '@/components/layout/HumasShell';
import { StandardPagePattern } from '@/components/layout/StandardPagePattern';
import { mockProjects } from '@/lib/clientDataFetcher';

export default function PapanProyekPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const allTasks = mockProjects.flatMap((p) => p.tasks);

  const filteredTasks = allTasks.filter((t) =>
    !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <HumasShell
      pageTitle="Papan Proyek"
      pageSubtitle="Kanban peliputan lapangan & produksi konten multi-divisi · 2026"
    >
      <StandardPagePattern
        title="Papan Proyek"
        subtitle="Manajemen tugas & alur penugasan liputan"
        statusBarText={
          <span>
            <b>Status Proyek Aktif:</b> {mockProjects.length} proyek peliputan berjalan, {allTasks.length} total kartu tugas.
          </span>
        }
        searchPlaceholder="Cari kartu tugas, nama liputan..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        totalCountText={`Menampilkan ${filteredTasks.length} tugas`}
        renderTable={() => (
          <div className="dasbor__card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="dasbor__table-wrap">
              <table className="dasbor__table">
                <thead>
                  <tr>
                    <th scope="col">Nama Tugas Peliputan</th>
                    <th scope="col" style={{ width: '140px' }}>Tahapan</th>
                    <th scope="col" style={{ width: '130px' }}>Tenggat</th>
                    <th scope="col" style={{ width: '140px' }}>PIC Petugas</th>
                    <th scope="col" style={{ width: '110px', textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task) => (
                    <tr key={task.id}>
                      <td>
                        <strong style={{ fontSize: '0.88rem', color: 'var(--color-text, #0f172a)' }}>
                          {task.title}
                        </strong>
                      </td>
                      <td>
                        <span className="dasbor__badge dasbor__badge--blue" style={{ fontSize: '11px' }}>
                          {task.stage}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--color-muted, #64748b)' }}>
                        {task.dueDate}
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {task.assigneeName || 'Belum ditugaskan'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="dasbor__badge dasbor__badge--up" style={{ fontSize: '11px' }}>
                          {task.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      />
    </HumasShell>
  );
}

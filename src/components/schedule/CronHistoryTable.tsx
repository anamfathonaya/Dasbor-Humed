'use client';

import React from 'react';

export interface CronRunLog {
  id: string;
  taskName: string;
  startedAt: string;
  durationMs: number;
  status: 'success' | 'failed' | 'running';
  itemsProcessed: number;
  message: string;
}

export function CronHistoryTable({
  logs = [
    {
      id: 'run-103',
      taskName: 'Sinkronisasi Berita',
      startedAt: '19 Okt 2026, 00:00 WIB',
      durationMs: 420,
      status: 'success',
      itemsProcessed: 8,
      message: '8 berita baru berhasil ditarik dan disematkan ke feed.'
    },
    {
      id: 'run-102',
      taskName: 'Pengingat Konten',
      startedAt: '18 Okt 2026, 23:00 WIB',
      durationMs: 180,
      status: 'success',
      itemsProcessed: 2,
      message: '2 pengingat draf mendekati tenggat terkirim ke PIC.'
    },
    {
      id: 'run-101',
      taskName: 'Agregasi Metrik',
      startedAt: '18 Okt 2026, 00:00 WIB',
      durationMs: 850,
      status: 'success',
      itemsProcessed: 32,
      message: 'Kompilasi metrik harian kanal selesai tanpa anomali.'
    }
  ]
}: { logs?: CronRunLog[] }) {
  return (
    <article className="dasbor__card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="dasbor__card-head" style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-border, #e2e8f0)' }}>
        <div>
          <h2 style={{ fontSize: '1rem', margin: 0 }}>Riwayat Eksekusi Tugas Otomatis</h2>
          <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: 'var(--color-muted, #64748b)' }}>
            Log catatan hasil eksekusi Vercel Cron serverless
          </p>
        </div>
      </div>

      <div className="dasbor__table-wrap">
        <table className="dasbor__table">
          <thead>
            <tr>
              <th scope="col" style={{ width: '100px' }}>ID</th>
              <th scope="col">Nama Tugas</th>
              <th scope="col" style={{ width: '160px' }}>Waktu Eksekusi</th>
              <th scope="col" style={{ width: '110px', textAlign: 'right' }}>Durasi</th>
              <th scope="col" style={{ width: '110px', textAlign: 'center' }}>Item</th>
              <th scope="col" style={{ width: '110px', textAlign: 'center' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{log.id}</td>
                <td>
                  <strong style={{ fontSize: '0.88rem' }}>{log.taskName}</strong>
                  <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--color-muted, #64748b)' }}>
                    {log.message}
                  </p>
                </td>
                <td style={{ fontSize: '0.82rem', color: 'var(--color-muted, #64748b)' }}>{log.startedAt}</td>
                <td style={{ textAlign: 'right', fontSize: '0.85rem' }}>{log.durationMs} ms</td>
                <td style={{ textAlign: 'center', fontSize: '0.85rem' }}>{log.itemsProcessed}</td>
                <td style={{ textAlign: 'center' }}>
                  <span
                    className={`dasbor__badge ${log.status === 'success' ? 'dasbor__badge--up' : 'dasbor__badge--amber'}`}
                    style={{ fontSize: '11px' }}
                  >
                    {log.status === 'success' ? 'Sukses' : 'Gagal'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

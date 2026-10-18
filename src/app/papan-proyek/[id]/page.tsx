'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { HumasShell } from '@/components/layout/HumasShell';
import { mockProjects } from '@/lib/clientDataFetcher';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RincianTugasPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const taskId = parseInt(resolvedParams.id, 10);

  const allTasks = mockProjects.flatMap((p) => p.tasks);
  const task = allTasks.find((t) => t.id === taskId) || allTasks[0];

  return (
    <HumasShell
      pageTitle="Rincian Tugas Peliputan"
      pageSubtitle={`Kelola detail tugas & instruksi liputan · ${task ? task.title : 'Tugas'}`}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '800px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link href="/papan-proyek" className="dasbor__btn">
            {/* @ts-ignore iconify web component */}
            <iconify-icon icon="lucide:arrow-left" aria-hidden="true" />
            <span>Kembali ke Papan Proyek</span>
          </Link>
        </div>

        <article className="dasbor__card">
          <div className="dasbor__card-head" style={{ marginBottom: '1.25rem' }}>
            <div>
              <span className="dasbor__badge dasbor__badge--blue" style={{ marginBottom: '8px' }}>
                {task.stage}
              </span>
              <h2 style={{ fontSize: '1.4rem', margin: '4px 0' }}>{task.title}</h2>
              <p style={{ color: 'var(--color-muted, #64748b)', fontSize: '0.88rem' }}>
                ID Tugas: #{task.id} · Tenggat: <b>{task.dueDate}</b>
              </p>
            </div>
            <div>
              <span className="dasbor__badge dasbor__badge--up">
                {task.status}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', borderTop: '1px solid var(--color-border, #e2e8f0)', paddingTop: '1.25rem', marginBottom: '1.25rem' }}>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Penanggung Jawab (PIC)
              </span>
              <p style={{ margin: '4px 0 0', fontWeight: 600 }}>
                {task.assigneeName || 'Belum Ditugaskan'}
              </p>
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Tahapan Produksi
              </span>
              <p style={{ margin: '4px 0 0', fontWeight: 600 }}>
                {task.stage}
              </p>
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Batas Pengumpulan
              </span>
              <p style={{ margin: '4px 0 0', fontWeight: 600 }}>
                {task.dueDate}
              </p>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--color-border, #e2e8f0)', paddingTop: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '8px' }}>Instruksi & Catatan Lapangan</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-text, #334155)', lineHeight: 1.6 }}>
              Pastikan seluruh aset dokumentasi foto resolusi tinggi dan rekaman video wawancara
              telah diunggah ke folder penyimpanan DAM sebelum status diubah ke tahap penyuntingan.
            </p>
          </div>
        </article>
      </div>
    </HumasShell>
  );
}

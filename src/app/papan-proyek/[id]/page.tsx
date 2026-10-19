'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { HumasShell } from '@/components/layout/HumasShell';
import { getStoredAgileTasks } from '@/lib/agileTrackerData';
import { mockProjects } from '@/lib/clientDataFetcher';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RincianTugasPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const rawId = resolvedParams.id;

  // Cek di Agile Tasks (KMN-XXX)
  const agileTasks = getStoredAgileTasks();
  const agileMatch = agileTasks.find((t) => t.taskId.toLowerCase() === rawId.toLowerCase());

  // Cek fallback legacy mock projects
  const numId = parseInt(rawId, 10);
  const legacyTasks = mockProjects.flatMap((p) => p.tasks);
  const legacyMatch = legacyTasks.find((t) => t.id === numId) || legacyTasks[0];

  const title = agileMatch ? agileMatch.title : legacyMatch?.title || 'Tugas';
  const taskId = agileMatch ? agileMatch.taskId : `#${legacyMatch?.id || rawId}`;
  const status = agileMatch ? agileMatch.status : legacyMatch?.stage || 'To Do';
  const assignee = agileMatch ? agileMatch.assignee : legacyMatch?.assignee || 'Belum Ditugaskan';
  const dueDate = agileMatch ? agileMatch.dueDate : legacyMatch?.dueDate || '-';
  const epic = agileMatch ? agileMatch.epic : 'Produksi Konten';
  const description = agileMatch
    ? agileMatch.description
    : 'Pastikan seluruh aset dokumentasi foto resolusi tinggi dan rekaman video telah tersimpan sebelum status diubah ke tahap penyuntingan.';

  return (
    <HumasShell
      pageTitle="Rincian Tugas Agile & RACI"
      pageSubtitle={`Kelola detail tugas & instruksi alur kerja · ${title}`}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '840px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link href="/papan-proyek" className="l-humas__action-btn l-humas__action-btn--outline">
            {/* @ts-ignore iconify web component */}
            <iconify-icon icon="lucide:arrow-left" aria-hidden="true" />
            <span>Kembali ke Papan Proyek</span>
          </Link>
        </div>

        <article className="dasbor__card" style={{ padding: '24px', background: 'var(--color-bg-card, #1e293b)', borderRadius: '12px' }}>
          <div className="dasbor__card-head" style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="dasbor__badge dasbor__badge--blue" style={{ marginBottom: '8px' }}>
                {epic}
              </span>
              <h2 style={{ fontSize: '1.4rem', margin: '4px 0', color: 'var(--color-text, #f8fafc)' }}>{title}</h2>
              <p style={{ color: 'var(--color-muted, #94a3b8)', fontSize: '0.88rem' }}>
                ID Tugas: <b>{taskId}</b> · Tenggat: <b>{dueDate}</b>
              </p>
            </div>
            <div>
              <span className="dasbor__badge dasbor__badge--up">
                {status}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', borderTop: '1px solid var(--color-border, #334155)', paddingTop: '1.25rem', marginBottom: '1.25rem' }}>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-muted, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Penanggung Jawab (Responsible)
              </span>
              <p style={{ margin: '4px 0 0', fontWeight: 600, color: 'var(--color-text, #f8fafc)' }}>
                {assignee}
              </p>
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-muted, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Tahapan / Status
              </span>
              <p style={{ margin: '4px 0 0', fontWeight: 600, color: 'var(--color-text, #f8fafc)' }}>
                {status}
              </p>
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-muted, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Batas Pengumpulan (Due Date)
              </span>
              <p style={{ margin: '4px 0 0', fontWeight: 600, color: 'var(--color-text, #f8fafc)' }}>
                {dueDate}
              </p>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--color-border, #334155)', paddingTop: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '8px', color: 'var(--color-text, #f8fafc)' }}>Instruksi & Catatan Tugas</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-muted, #94a3b8)', lineHeight: 1.6 }}>
              {description}
            </p>
          </div>
        </article>
      </div>
    </HumasShell>
  );
}

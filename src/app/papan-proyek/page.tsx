'use client';

import React from 'react';
import { HumasShell } from '@/components/layout/HumasShell';
import { UniversalKanbanBoard } from '@/components/projects/UniversalKanbanBoard';

export default function PapanProyekPage() {
  return (
    <HumasShell
      pageTitle="Papan Proyek Agile & RACI"
      pageSubtitle="Universal Kanban Board multi-divisi · Tim Humas & Media Komnas Palestina (2026)"
    >
      <div style={{ maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
        <UniversalKanbanBoard />
      </div>
    </HumasShell>
  );
}

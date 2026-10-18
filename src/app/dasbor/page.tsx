import React from 'react';
import { HumasShell } from '@/components/layout/HumasShell';
import { DashboardView } from '@/components/dasbor/DashboardView';

export default function DasborPage() {
  return (
    <HumasShell
      pageTitle="Dasbor & Metrik"
      pageSubtitle="Ringkasan operasional humas, akuisisi, dan analitik performa kanal · 2026"
    >
      <DashboardView />
    </HumasShell>
  );
}

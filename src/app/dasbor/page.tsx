import React from 'react';
import { HumasShell } from '@/components/layout/HumasShell';
import { DashboardView } from '@/components/dasbor/DashboardView';

export default function DasborPage() {
  return (
    <HumasShell
      pageTitle="Ikhtisar"
      pageSubtitle="Pembaruan terakhir: 19 Okt 2026, 08:35 WIB"
    >
      <DashboardView />
    </HumasShell>
  );
}

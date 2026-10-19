import React from 'react';
import { HumasShell } from '@/components/layout/HumasShell';
import { DashboardView } from '@/components/dasbor/EnhancedDashboardView';

export default function DasborPage() {
  return (
    <HumasShell
      pageTitle="Ikhtisar"
      pageSubtitle="Ringkasan performa digital & operasional tim humas"
    >
      <DashboardView />
    </HumasShell>
  );
}

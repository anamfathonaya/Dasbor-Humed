'use client';

import React from 'react';
import { HumasShell } from '@/components/layout/HumasShell';
import { ScheduledMetricsSyncView } from '@/components/channels/ScheduledMetricsSyncView';

export default function PenarikanMetrikTerjadwalPage() {
  return (
    <HumasShell
      pageTitle="Penarikan Metrik Terjadwal"
      pageSubtitle="Jadwal tarik harian otomatis (Cron), tarik manual sekali klik, riwayat sinkronisasi, dan penyamaan nama metrik lintas platform"
      pageContentId="dasbor-utama"
    >
      <ScheduledMetricsSyncView />
    </HumasShell>
  );
}

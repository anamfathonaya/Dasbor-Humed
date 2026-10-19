import React from 'react';
import { HumasShell } from '@/components/layout/HumasShell';
import { ChannelMetricsDashboardView } from '@/components/channels/ChannelMetricsDashboardView';

export default function DasborMetrikKanalPage() {
  return (
    <HumasShell
      pageTitle="Dasbor Metrik Kanal"
      pageSubtitle="Ringkasan metrik hanya-baca lintas Instagram, Facebook, TikTok, dan YouTube"
      pageContentId="dasbor-metrik"
    >
      <ChannelMetricsDashboardView />
    </HumasShell>
  );
}

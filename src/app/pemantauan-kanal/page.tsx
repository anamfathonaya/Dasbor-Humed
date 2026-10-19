import React from 'react';
import { HumasShell } from '@/components/layout/HumasShell';
import { ChannelMonitoringView } from '@/components/channels/ChannelMonitoringView';

export default function PemantauanKanalPage() {
  return (
    <HumasShell
      pageTitle="Pemantauan Kanal Media Sosial"
      pageSubtitle="Pemantauan performa hanya-baca lintas Instagram, Facebook, TikTok, dan YouTube · 2026"
      pageContentId="dasbor-utama"
    >
      <ChannelMonitoringView />
    </HumasShell>
  );
}

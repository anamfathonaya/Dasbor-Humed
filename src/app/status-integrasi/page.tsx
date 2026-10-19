import React from 'react';
import { HumasShell } from '@/components/layout/HumasShell';
import { ChannelIntegrationStatusView } from '@/components/channels/ChannelIntegrationStatusView';

export default function StatusIntegrasiPage() {
  return (
    <HumasShell
      pageTitle="Status Integrasi Kanal"
      pageSubtitle="Pemeriksaan status kesehatan, latensi respons API, dan ringkasan metrik harian 4 kanal resmi · 2026"
      pageContentId="dasbor-utama"
    >
      <ChannelIntegrationStatusView />
    </HumasShell>
  );
}

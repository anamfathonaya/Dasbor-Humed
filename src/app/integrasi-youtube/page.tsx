import React from 'react';
import { HumasShell } from '@/components/layout/HumasShell';
import { YouTubeIntegrationView } from '@/components/channels/YouTubeIntegrationView';

export default function IntegrasiYouTubePage() {
  return (
    <HumasShell
      pageTitle="Penghubung YouTube (OAuth 2.0)"
      pageSubtitle="Integrasi resmi YouTube Data API v3 & YouTube Analytics API secara hanya-baca · 2026"
      pageContentId="dasbor-utama"
    >
      <YouTubeIntegrationView />
    </HumasShell>
  );
}

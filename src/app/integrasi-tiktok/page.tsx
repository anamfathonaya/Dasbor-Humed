import React from 'react';
import { TikTokIntegrationView } from '@/components/channels/TikTokIntegrationView';

export const metadata = {
  title: 'Penghubung TikTok — Dasbor Pemantauan Media Humas',
  description: 'Otorisasi dan pemantauan hanya-baca (Read-Only) kanal resmi TikTok via TikTok Display API.'
};

export default function TikTokIntegrationPage() {
  return <TikTokIntegrationView />;
}

import React from 'react';
import { HumasShell } from '@/components/layout/HumasShell';
import { MetaIntegrationView } from '@/components/channels/MetaIntegrationView';

export default function IntegrasiMetaPage() {
  return (
    <HumasShell
      pageTitle="Penghubung Meta (Instagram & Facebook)"
      pageSubtitle="Integrasi resmi Meta Graph API untuk pemantauan hanya-baca akun Instagram & Facebook Page · 2026"
      pageContentId="dasbor-utama"
    >
      <MetaIntegrationView />
    </HumasShell>
  );
}

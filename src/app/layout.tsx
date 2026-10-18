import type { Metadata } from 'next';
import Script from 'next/script';
import '@/styles/humas-theme.css';
import { LayoutProvider } from '@/components/layout/LayoutContext';

export const metadata: Metadata = {
  title: 'Dasbor Humas Media — Yayasan Peduli Negeri',
  description: 'Ringkasan operasional humas, akuisisi, dan analitik performa kanal'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
        />
      </head>
      <body>
        <LayoutProvider>{children}</LayoutProvider>
        <Script
          src="https://code.iconify.design/iconify-icon/3.0.0/iconify-icon.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}

# Shared Layout Components

## HumasShell (`src/components/layout/HumasShell.tsx`)
App shell utama yang menyatukan sidebar navigasi, topbar header, breadcrumbs, dan dynamic page slot.

## HumasSidebar (`src/components/layout/HumasSidebar.tsx`)
Navigasi modul bersarang:
1. Ringkasan Harian: Dasbor & Metrik, Pemantauan Kanal
2. Produksi Konten: Papan Proyek, Kalender Konten, Insight Konten
3. Pemantauan & Laporan: Pantauan Berita, Laporan & Anggaran
4. Rujukan Kerja: Basis Pengetahuan, SOP Visual
5. Pengaturan: Pengaturan & Integrasi, Akun & Audit, Verifikasi Paritas DB

## HumasHeader (`src/components/layout/HumasHeader.tsx`)
Header bar horizontal dengan pageTitle, pageSubtitle, status role switcher (Admin / Staf), dark/light theme toggle, dan header actions.

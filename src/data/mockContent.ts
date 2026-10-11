// Data tiruan (stub) untuk Kalender Konten — sesuai tabel content_calendar & content_pillars di PRD.
export type ContentStatus = 'ide' | 'draft' | 'terjadwal' | 'terbit';

export interface ContentPillar {
  id: number;
  name: string;
  color: string;
}

export interface ContentItem {
  id: number;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  channel: 'Instagram' | 'Facebook' | 'TikTok' | 'YouTube' | 'Website' | 'Telegram';
  pillarId: number;
  assignee: string;
  status: ContentStatus;
  /** Pengingat: menit sebelum jadwal tayang (0/undefined = tanpa pengingat) */
  remindBefore?: number;
  /** Pengingat sudah ditandai selesai */
  reminderDone?: boolean;
}

export const reminderOptions: { value: number; label: string }[] = [
  { value: 0, label: 'Tanpa pengingat' },
  { value: 30, label: '30 menit sebelumnya' },
  { value: 60, label: '1 jam sebelumnya' },
  { value: 1440, label: '1 hari sebelumnya' },
  { value: 4320, label: '3 hari sebelumnya' },
  { value: 10080, label: '1 minggu sebelumnya' },
];

export const pillars: ContentPillar[] = [
  { id: 1, name: 'Aksi Kemanusiaan', color: '#e11d48' },
  { id: 2, name: 'Edukasi', color: '#2563eb' },
  { id: 3, name: 'Donasi & Galang Dana', color: '#16a34a' },
  { id: 4, name: 'Laporan & Transparansi', color: '#d97706' },
];

export const statusLabels: Record<ContentStatus, string> = {
  ide: 'Ide',
  draft: 'Draft',
  terjadwal: 'Terjadwal',
  terbit: 'Terbit',
};

export const contentItems: ContentItem[] = [
  { id: 1, title: 'Penyaluran paket sembako Cianjur', date: '2026-10-02', time: '09:00', channel: 'Instagram', pillarId: 1, assignee: 'Sari', status: 'terbit' },
  { id: 2, title: 'Infografis: cara donasi aman', date: '2026-10-05', time: '12:00', channel: 'Instagram', pillarId: 2, assignee: 'Budi', status: 'terbit' },
  { id: 3, title: 'Video testimoni penerima manfaat', date: '2026-10-08', time: '18:00', channel: 'YouTube', pillarId: 1, assignee: 'Dewi', status: 'terbit' },
  { id: 4, title: 'Kampanye Bantu Pendidikan Anak', date: '2026-10-10', time: '10:00', channel: 'Website', pillarId: 3, assignee: 'Sari', status: 'terjadwal', remindBefore: 60 },
  { id: 5, title: 'Reels relawan di lapangan', date: '2026-10-12', time: '19:00', channel: 'TikTok', pillarId: 1, assignee: 'Dewi', status: 'terjadwal' },
  { id: 6, title: 'Update donasi pekan ke-2', date: '2026-10-14', time: '08:00', channel: 'Facebook', pillarId: 3, assignee: 'Budi', status: 'draft', remindBefore: 1440 },
  { id: 7, title: 'Tips tanggap bencana banjir', date: '2026-10-16', time: '11:00', channel: 'Instagram', pillarId: 2, assignee: 'Rani', status: 'draft', remindBefore: 60 },
  { id: 8, title: 'Laporan penyaluran September', date: '2026-10-20', time: '09:00', channel: 'Website', pillarId: 4, assignee: 'Rani', status: 'draft' },
  { id: 9, title: 'Siaran kabar terbaru ke channel', date: '2026-10-20', time: '15:00', channel: 'Telegram', pillarId: 4, assignee: '', status: 'ide' },
  { id: 10, title: 'Live Q&A bersama ketua bidang', date: '2026-10-24', time: '20:00', channel: 'YouTube', pillarId: 2, assignee: 'Dewi', status: 'ide' },
  { id: 11, title: 'Kisah relawan pekan ini', date: '2026-10-28', time: '17:00', channel: 'Instagram', pillarId: 1, assignee: 'Sari', status: 'ide' },
];

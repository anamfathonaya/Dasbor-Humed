// Data tiruan (stub) untuk Dasbor Metrik Kinerja — mengacu pada tabel metric_snapshots, donations, ad_campaigns di PRD.
export interface Kpi {
  label: string;
  value: string;
  delta: number; // persen perubahan vs periode sebelumnya
  hint?: string;
}

export interface MetricSection {
  id: 'sosmed' | 'website' | 'donasi' | 'meta';
  title: string;
  description: string;
  kpis: Kpi[];
  trendLabel: string;
  trend: { label: string; value: number }[]; // 6 periode terakhir
}

const months = ['Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt'];
const series = (vals: number[]) => vals.map((value, i) => ({ label: months[i], value }));

export const metricSections: MetricSection[] = [
  {
    id: 'sosmed',
    title: 'Media Sosial',
    description: 'Performa Instagram, Facebook, TikTok, dan YouTube lembaga.',
    kpis: [
      { label: 'Pengikut total', value: '48.320', delta: 3.4 },
      { label: 'Jangkauan', value: '312.500', delta: 8.1 },
      { label: 'Engagement rate', value: '4,6%', delta: -0.6 },
      { label: 'Konten terbit', value: '38', delta: 5.0 },
    ],
    trendLabel: 'Jangkauan per bulan',
    trend: series([210000, 228000, 245000, 260000, 289000, 312500]),
  },
  {
    id: 'website',
    title: 'Website Lembaga',
    description: 'Lalu lintas dan perilaku pengunjung website utama.',
    kpis: [
      { label: 'Pengunjung', value: '21.480', delta: 6.2 },
      { label: 'Tampilan halaman', value: '63.910', delta: 4.8 },
      { label: 'Durasi sesi', value: '2m 41d', delta: 1.9 },
      { label: 'Bounce rate', value: '48%', delta: -2.3, hint: 'turun = lebih baik' },
    ],
    trendLabel: 'Pengunjung per bulan',
    trend: series([15200, 16800, 17900, 18700, 20200, 21480]),
  },
  {
    id: 'donasi',
    title: 'Website Donasi',
    description: 'Hasil galang dana di platform donasi/crowdfunding.',
    kpis: [
      { label: 'Total donasi', value: 'Rp 184,6 jt', delta: 12.7 },
      { label: 'Jumlah donatur', value: '1.268', delta: 9.4 },
      { label: 'Rata-rata donasi', value: 'Rp 145 rb', delta: 3.0 },
      { label: 'Kampanye aktif', value: '7', delta: 0 },
    ],
    trendLabel: 'Donasi per bulan (juta Rp)',
    trend: series([96, 118, 131, 142, 164, 184.6]),
  },
  {
    id: 'meta',
    title: 'Iklan Meta',
    description: 'Efektivitas kampanye iklan Facebook & Instagram.',
    kpis: [
      { label: 'Biaya iklan', value: 'Rp 22,4 jt', delta: 4.5 },
      { label: 'Jangkauan iklan', value: '540.200', delta: 10.3 },
      { label: 'Konversi', value: '864', delta: 14.1 },
      { label: 'Biaya per konversi', value: 'Rp 25,9 rb', delta: -8.2, hint: 'turun = lebih baik' },
    ],
    trendLabel: 'Konversi per bulan',
    trend: series([420, 510, 590, 640, 757, 864]),
  },
];

// Rincian per kanal media sosial (metric_snapshots: source = sosmed, channel = ...)
export interface ChannelMetric {
  channel: string;
  followers: number;
  reach: number;
  engagement: number; // persen
  posts: number;
  delta: number; // perubahan jangkauan vs periode lalu (persen)
}

export const socialChannels: ChannelMetric[] = [
  { channel: 'Instagram', followers: 21400, reach: 148200, engagement: 5.2, posts: 14, delta: 9.8 },
  { channel: 'Facebook', followers: 14900, reach: 76400, engagement: 3.1, posts: 10, delta: 2.4 },
  { channel: 'TikTok', followers: 8300, reach: 61900, engagement: 6.7, posts: 8, delta: 21.5 },
  { channel: 'YouTube', followers: 3720, reach: 26000, engagement: 4.0, posts: 6, delta: -1.7 },
];

// Halaman terpopuler website lembaga
export const topPages = [
  { path: '/program/pendidikan-anak', views: 9120, avgTime: '3m 05d' },
  { path: '/berita/penyaluran-cianjur', views: 7480, avgTime: '2m 12d' },
  { path: '/tentang-kami', views: 5260, avgTime: '1m 48d' },
  { path: '/laporan-tahunan', views: 3940, avgTime: '4m 20d' },
];

// Sumber trafik website (persen)
export const trafficSources = [
  { name: 'Pencarian organik', pct: 42 },
  { name: 'Media sosial', pct: 31 },
  { name: 'Langsung', pct: 19 },
  { name: 'Rujukan lain', pct: 8 },
];

// Donasi per kampanye di platform crowdfunding (donations)
export const donationCampaigns = [
  { name: 'Bantu Pendidikan Anak', platform: 'Kitabisa', amount: 72400000, donors: 512, target: 100000000 },
  { name: 'Sembako untuk Korban Banjir', platform: 'Website Lembaga', amount: 58200000, donors: 396, target: 75000000 },
  { name: 'Air Bersih Desa', platform: 'Kitabisa', amount: 31800000, donors: 241, target: 60000000 },
  { name: 'Layanan Kesehatan Keliling', platform: 'Website Lembaga', amount: 22200000, donors: 119, target: 50000000 },
];

// Kampanye iklan Meta (ad_campaigns)
export const adCampaigns = [
  { name: 'Donasi Pendidikan Anak', objective: 'Konversi', status: 'Aktif', spend: 7800000, reach: 198400, conversions: 342 },
  { name: 'Sembako Korban Banjir', objective: 'Konversi', status: 'Aktif', spend: 6200000, reach: 151200, conversions: 281 },
  { name: 'Awareness Program Air Bersih', objective: 'Jangkauan', status: 'Aktif', spend: 4600000, reach: 132900, conversions: 96 },
  { name: 'Rekrut Relawan Oktober', objective: 'Prospek', status: 'Selesai', spend: 3800000, reach: 57700, conversions: 145 },
];

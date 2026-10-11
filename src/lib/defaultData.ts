/**
 * Fallback Data dan Tipe Data Default untuk Klien
 */

/* === mockBudget.ts === */
export interface BudgetLine {
  id: number;
  program: string;
  category: string;
  rab: number; // rencana anggaran
  lra: number; // realisasi
  owner: string;
  year: number;
  quarter: string; // 'Q1' | 'Q2' | 'Q3' | 'Q4'
  status: 'sesuai' | 'melebihi' | 'hemat';
}

export const budgetCategories = ['Semua Kategori', 'Media Sosial', 'Produksi Konten', 'Iklan Berbayar', 'Infrastruktur', 'Hubungan Media', 'Pelaporan'];
export const budgetOwners = ['Semua PJ', 'Tim Media', 'Tim Humas', 'Ketua Bidang'];
export const budgetQuarters = ['Semua Kuartal', 'Q1', 'Q2', 'Q3', 'Q4'];
export const budgetYears = ['2026', '2025'];

export const mockBudgetLines: BudgetLine[] = [
  { id: 1, program: 'Kampanye Donasi Digital Ramadan', category: 'Media Sosial', rab: 120000000, lra: 98500000, owner: 'Tim Media', year: 2026, quarter: 'Q1', status: 'hemat' },
  { id: 2, program: 'Produksi Video Dokumenter Gempa Darurat', category: 'Produksi Konten', rab: 85000000, lra: 91200000, owner: 'Tim Media', year: 2026, quarter: 'Q2', status: 'melebihi' },
  { id: 3, program: 'Iklan Meta (Facebook & Instagram) Q1-Q2', category: 'Iklan Berbayar', rab: 150000000, lra: 112000000, owner: 'Tim Humas', year: 2026, quarter: 'Q2', status: 'hemat' },
  { id: 4, program: 'Pemeliharaan Website & Cloud Hosting', category: 'Infrastruktur', rab: 36000000, lra: 30000000, owner: 'Tim Humas', year: 2026, quarter: 'Q1', status: 'sesuai' },
  { id: 5, program: 'Liputan Media Massa & Press Release', category: 'Hubungan Media', rab: 60000000, lra: 41000000, owner: 'Tim Humas', year: 2026, quarter: 'Q2', status: 'hemat' },
  { id: 6, program: 'Penyusunan & Pencetakan Laporan Tahunan', category: 'Pelaporan', rab: 45000000, lra: 12500000, owner: 'Ketua Bidang', year: 2026, quarter: 'Q3', status: 'hemat' },
  { id: 7, program: 'Pengadaan Alat Liputan & Drone Lapangan', category: 'Produksi Konten', rab: 65000000, lra: 64800000, owner: 'Tim Media', year: 2026, quarter: 'Q1', status: 'sesuai' },
  { id: 8, program: 'Media Gathering & Buka Bersama Jurnalis', category: 'Hubungan Media', rab: 30000000, lra: 34500000, owner: 'Tim Humas', year: 2026, quarter: 'Q1', status: 'melebihi' },
  { id: 9, program: 'Audit Keuangan Lembaga & Publikasi Transparansi', category: 'Pelaporan', rab: 50000000, lra: 49000000, owner: 'Ketua Bidang', year: 2025, quarter: 'Q4', status: 'sesuai' },
  { id: 10, program: 'Kampanye Akhir Tahun Bersama Dhuafa', category: 'Media Sosial', rab: 95000000, lra: 94000000, owner: 'Tim Media', year: 2025, quarter: 'Q4', status: 'sesuai' },
];

export const mockAnnualReportsByYear: Record<string, {
  year: number;
  theme: string;
  executiveSummary: string;
  totalDonors: number;
  totalBeneficiaries: number;
  totalFundsRaised: number;
  totalFundsDistributed: number;
  milestones: { title: string; date: string; impact: string }[];
  quarterlyProgress: { quarter: string; target: string; progress: number; status: string }[];
}> = {
  '2026': {
    year: 2026,
    theme: 'Menjangkau yang Terjauh: Inovasi Penyaluran Bantuan Darurat & Berkelanjutan',
    executiveSummary: 'Pada tahun berjalan 2026, Humas dan Media NGO memprioritaskan akselerasi digital kampanye kemanusiaan terintegrasi, respons tanggap darurat bencana hidrometeorologi, dan transparansi penyaluran donasi publik.',
    totalDonors: 48500,
    totalBeneficiaries: 124000,
    totalFundsRaised: 14500000000,
    totalFundsDistributed: 11800000000,
    milestones: [
      { title: 'Respons Darurat Gempa & Banjir Bandang', date: 'Maret 2026', impact: 'Distribusi 8.500 paket pangan & shelter sementara di 4 kabupaten terdampak.' },
      { title: 'Kampanye Terpadu Ramadan 1447H', date: 'April 2026', impact: 'Penggalangan dana donasi mencapai 118% dari target kuartal pertama.' },
      { title: 'Peluncuran Mobile Water Treatment', date: 'Juni 2026', impact: 'Akses 50.000 liter air minum bersih harian untuk pengungsi.' },
      { title: 'Audit Publik & Dasbor Terbuka', date: 'September 2026', impact: 'Penyajian laporan keuangan wajar tanpa pengecualian (WTP).' },
    ],
    quarterlyProgress: [
      { quarter: 'Q1', target: 'Kampanye Ramadan, respons bencana awal tahun, & audit donasi Q1', progress: 100, status: 'Tuntas' },
      { quarter: 'Q2', target: 'Penyaluran qurban pelosok nusantara & laporan semester', progress: 85, status: 'Berjalan' },
      { quarter: 'Q3', target: 'Program pemulihan pascabencana & beasiswa yatim dhuafa', progress: 55, status: 'Berjalan' },
      { quarter: 'Q4', target: 'Penyusunan laporan tahunan, evaluasi dampak, & audit eksternal', progress: 15, status: 'Direncanakan' },
    ],
  },
  '2025': {
    year: 2025,
    theme: 'Ketangguhan Bersama: Kolaborasi Lintas Lembaga untuk Kemanusiaan',
    executiveSummary: 'Tahun 2025 berhasil ditutup dengan peningkatan serapan anggaran kemanusiaan sebesar 94.2% dan pembukaan 12 posko wilayah respon cepat di Indonesia timur.',
    totalDonors: 62400,
    totalBeneficiaries: 185000,
    totalFundsRaised: 19800000000,
    totalFundsDistributed: 18650000000,
    milestones: [
      { title: 'Ekspedisi Kemanusiaan Pulau Terluar', date: 'Mei 2025', impact: 'Penyaluran fasilitas kesehatan & genset surya untuk 15 pulau terluar.' },
      { title: 'Dapur Gizi Balita & Ibu Hamil', date: 'Agustus 2025', impact: 'Penurunan angka risiko stunting pada 3.200 balita binaan.' },
      { title: 'Penghargaan Transparansi Lembaga Filantropi', date: 'November 2025', impact: 'Meraih predikat Akuntabilitas Terbaik Nasional.' },
    ],
    quarterlyProgress: [
      { quarter: 'Q1', target: 'Eksplorasi wilayah sasaran 3T & kampanye donasi awal tahun', progress: 100, status: 'Tuntas' },
      { quarter: 'Q2', target: 'Distribusi bantuan pangan darurat & logistik pertengahan tahun', progress: 100, status: 'Tuntas' },
      { quarter: 'Q3', target: 'Pembangunan infrastruktur air bersih & sanitasi', progress: 100, status: 'Tuntas' },
      { quarter: 'Q4', target: 'Konsolidasi laporan tahunan & audit tahunan final', progress: 100, status: 'Tuntas' },
    ],
  },
  '2024': {
    year: 2024,
    theme: 'Fondasi Kepedulian: Memperkuat Kapasitas Relawan & Jejaring Donatur',
    executiveSummary: 'Transformasi digital sistem informasi donasi dan integrasi pelaporan keuangan berbasis dasbor terpusat pertama kali diresmikan di tahun 2024.',
    totalDonors: 51200,
    totalBeneficiaries: 142000,
    totalFundsRaised: 16200000000,
    totalFundsDistributed: 15100000000,
    milestones: [
      { title: 'Digitalisasi CRM Donatur Lembaga', date: 'April 2024', impact: 'Peningkatan retensi donatur rutin bulanan hingga 35%.' },
      { title: 'Respons Tanggap Darurat Lahar Dingin', date: 'Juli 2024', impact: 'Evakuasi & suplai logistik bagi 6.000 jiwa warga terdampak.' },
    ],
    quarterlyProgress: [
      { quarter: 'Q1', target: 'Inisiasi integrasi dasbor sistem IT lembaga', progress: 100, status: 'Tuntas' },
      { quarter: 'Q2', target: 'Operasionalisasi pos siaga bencana wilayah barat', progress: 100, status: 'Tuntas' },
      { quarter: 'Q3', target: 'Pengadaan armada ambulans dan mobil logistik', progress: 100, status: 'Tuntas' },
      { quarter: 'Q4', target: 'Laporan tahunan konsolidasi 2024', progress: 100, status: 'Tuntas' },
    ],
  },
};

export const mockAnnualPlan = [
  { quarter: 'Q1', target: 'Kampanye Ramadan & penggalangan dana', progress: 100 },
  { quarter: 'Q2', target: 'Pelaporan semester & audit donasi', progress: 85 },
  { quarter: 'Q3', target: 'Program pemulihan pascabencana', progress: 55 },
  { quarter: 'Q4', target: 'Laporan tahunan & evaluasi program', progress: 15 },
];


/* === mockContent.ts === */
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
  channel: string;
  contentType?: string;
  subType?: string;
  requestBidang?: string;
  pillarId: number;
  assignee: string;
  status: ContentStatus;
  /** Pengingat: menit sebelum jadwal tayang (0/undefined = tanpa pengingat) */
  remindBefore?: number;
  /** Pengingat sudah ditandai selesai */
  reminderDone?: boolean;
}

export const channelPlatforms = [
  'Instagram',
  'WhatsApp',
  'Facebook',
  'Threads & X',
  'YouTube',
  'Kebutuhan Internal',
] as const;

export const channelContentTypes: Record<string, string[]> = {
  'Instagram': [
    'reels',
    'carousel (image)',
    'single image post',
    'story',
    'carousel (short video)',
  ],
  'WhatsApp': [
    'video',
    'foto',
    'status',
    'channel post',
    'community post',
    'CRM marketing message blast',
    'whatsapp ads',
  ],
  'Facebook': [
    'reels',
    'carousel (image)',
    'single image post',
    'story',
    'carousel (short video)',
    'long video',
  ],
  'Threads & X': [
    'artikel panjang',
    'short video',
    'carousel (image)',
    'single image post',
    'story',
    'carousel (short video)',
    'video panjang',
  ],
  'YouTube': [
    'Video panjang',
    'video pendek',
    'youtube shorts',
  ],
  'Kebutuhan Internal': [
    'set desain program',
    'brand identity',
    'video eksklusif',
    'video kegiatan internal',
    'video kompilasi penyaluran',
    'desain proposal',
    'desain laporan penyaluran',
    'desain request bidang',
  ],
};

export const youtubeSubTypes: Record<string, string[]> = {
  'Video panjang': ['podcast', 'video esai', 'video wawancara', 'dokumenter'],
  'video pendek': ['video marketing program', 'video after movie kegiatan', 'video penyaluran'],
};

export const internalBidangOptions = [
  'operasional',
  'keuangan',
  'fundraising',
  'penyaluran-edukasi',
  'BPH',
  'donatur',
  'wilayah',
] as const;

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
  { id: 1, title: 'Penyaluran paket sembako Cianjur', date: '2026-10-02', time: '09:00', channel: 'Instagram', contentType: 'carousel (image)', pillarId: 1, assignee: 'Sari', status: 'terbit' },
  { id: 2, title: 'Infografis: cara donasi aman', date: '2026-10-05', time: '12:00', channel: 'Instagram', contentType: 'single image post', pillarId: 2, assignee: 'Budi', status: 'terbit' },
  { id: 3, title: 'Dokumenter: Perjuangan Relawan Air Bersih', date: '2026-10-08', time: '18:00', channel: 'YouTube', contentType: 'Video panjang', subType: 'dokumenter', pillarId: 1, assignee: 'Dewi', status: 'terbit' },
  { id: 4, title: 'Broadcast update penyaluran darurat', date: '2026-10-10', time: '10:00', channel: 'WhatsApp', contentType: 'channel post', pillarId: 3, assignee: 'Sari', status: 'terjadwal', remindBefore: 60 },
  { id: 5, title: 'Reels relawan di lapangan', date: '2026-10-12', time: '19:00', channel: 'Instagram', contentType: 'reels', pillarId: 1, assignee: 'Dewi', status: 'terjadwal' },
  { id: 6, title: 'Update donasi pekan ke-2', date: '2026-10-14', time: '08:00', channel: 'Facebook', contentType: 'single image post', pillarId: 3, assignee: 'Budi', status: 'draft', remindBefore: 1440 },
  { id: 7, title: 'Tips tanggap bencana banjir', date: '2026-10-16', time: '11:00', channel: 'Threads & X', contentType: 'artikel panjang', pillarId: 2, assignee: 'Rani', status: 'draft', remindBefore: 60 },
  { id: 8, title: 'Desain Laporan Penyaluran Q3', date: '2026-10-20', time: '09:00', channel: 'Kebutuhan Internal', contentType: 'desain request bidang', requestBidang: 'penyaluran-edukasi', pillarId: 4, assignee: 'Rani', status: 'draft' },
  { id: 9, title: 'Shorts: Rekap aksi cepat 60 detik', date: '2026-10-20', time: '15:00', channel: 'YouTube', contentType: 'youtube shorts', pillarId: 4, assignee: '', status: 'ide' },
  { id: 10, title: 'Podcast Kemanusiaan: Dialog Ketahanan Pangan', date: '2026-10-24', time: '20:00', channel: 'YouTube', contentType: 'Video panjang', subType: 'podcast', pillarId: 2, assignee: 'Dewi', status: 'ide' },
  { id: 11, title: 'Set Desain Program Safari Dakwah & Bantuan', date: '2026-10-28', time: '17:00', channel: 'Kebutuhan Internal', contentType: 'set desain program', requestBidang: 'fundraising', pillarId: 1, assignee: 'Sari', status: 'ide' },
];


/* === mockInsights.ts === */
// Data tiruan (stub) untuk fitur Insight Konten
// Mengacu pada insight performa konten terbaru, pilar konten terbaik, waktu posting optimal, dan rekomendasi AI/analisis editorial

export interface ContentInsightItem {
  id: number;
  title: string;
  pillar: string;
  theme: string;
  channel: 'Instagram' | 'TikTok' | 'YouTube' | 'Website' | 'Facebook';
  publishDate: string;
  reach: number;
  engagementRate: number; // Dalam persentase, misal 7.4
  savesOrShares: number;
  conversions: number; // misal donatur baru / pendaftar relawan
  verdict: 'Sangat Efektif' | 'Stabil' | 'Perlu Optimasi';
  summaryInsight: string;
}

export interface BestTimingRecommendation {
  channel: string;
  bestDay: string;
  bestTimeSlot: string;
  peakEngagementRate: string;
  reason: string;
}

export interface PillarPerformanceSummary {
  pillarName: string;
  totalPosts: number;
  avgEngagement: number;
  totalReach: number;
  topFormat: string;
  status: 'High Impact' | 'Solid' | 'Underperforming';
}

export const mockContentInsights: ContentInsightItem[] = [
  {
    id: 1,
    title: 'Kisah Penyaluran Air Bersih Desa Sukamaju: Dari Tetes Pertama Hingga Senyum Warga',
    pillar: 'Edukasi Bencana & Humaniora',
    theme: 'Respons Darurat',
    channel: 'Instagram',
    publishDate: '2026-10-08',
    reach: 48200,
    engagementRate: 8.6,
    savesOrShares: 3240,
    conversions: 412,
    verdict: 'Sangat Efektif',
    summaryInsight: 'Format Carousel foto dokumentasi lapangan + kutipan langsung warga menghasilkan retensi pembaca 2.4x lipat lebih tinggi dari rata-rata akun.',
  },
  {
    id: 2,
    title: 'Reels: 30 Detik Logistik Berangkat Menembus Longsor Cianjur Selatan',
    pillar: 'Transparansi & Akuntabilitas',
    theme: 'Distribusi Lapangan',
    channel: 'Instagram',
    publishDate: '2026-10-09',
    reach: 72500,
    engagementRate: 9.2,
    savesOrShares: 5120,
    conversions: 680,
    verdict: 'Sangat Efektif',
    summaryInsight: 'Audio voiceover narasi relawan di detik ke-3 mencegah drop rate video, menyumbang lonjakan klik profil ke tautan donasi darurat.',
  },
  {
    id: 3,
    title: 'Edukasi: Apa Yang Harus Dilakukan Saat Sirine Peringatan Banjir Berbunyi?',
    pillar: 'Edukasi Bencana & Humaniora',
    theme: 'Mitigasi Bencana',
    channel: 'TikTok',
    publishDate: '2026-10-06',
    reach: 89000,
    engagementRate: 7.9,
    savesOrShares: 8400,
    conversions: 190,
    verdict: 'Sangat Efektif',
    summaryInsight: 'Format infografik animasi singkat banyak dibagikan ulang oleh akun guru dan komunitas relawan sekolah.',
  },
  {
    id: 4,
    title: 'Laporan Audit Penyaluran Q3 2026: Ke Mana Saja Donasi Anda Mengalir?',
    pillar: 'Transparansi & Akuntabilitas',
    theme: 'Laporan Keuangan',
    channel: 'Website',
    publishDate: '2026-10-04',
    reach: 12400,
    engagementRate: 4.8,
    savesOrShares: 890,
    conversions: 245,
    verdict: 'Stabil',
    summaryInsight: 'Pembaca artikel menghabiskan waktu rata-rata 4 menit 12 detik. Keberadaan tabel infografis ringkas menurunkan bounce rate hingga 28%.',
  },
  {
    id: 5,
    title: 'Profil Tokoh: Bu Fatimah, Koordinator Dapur Umum Posko 3',
    pillar: 'Sosial & Relawan',
    theme: 'Human Interest',
    channel: 'Facebook',
    publishDate: '2026-10-02',
    reach: 22100,
    engagementRate: 5.4,
    savesOrShares: 940,
    conversions: 88,
    verdict: 'Stabil',
    summaryInsight: 'Mendapat engagement tinggi dari demografi usia 35-55 tahun yang mendominasi donatur loyal program santunan sembako.',
  },
  {
    id: 6,
    title: 'Pengumuman Webinar: Strategi Penyaluran Bantuan Inklusif Kelompok Disabilitas',
    pillar: 'Pengembangan Kapasitas',
    theme: 'Webinar & Event',
    channel: 'Instagram',
    publishDate: '2026-09-29',
    reach: 8900,
    engagementRate: 2.1,
    savesOrShares: 130,
    conversions: 45,
    verdict: 'Perlu Optimasi',
    summaryInsight: 'Desain poster teks terlalu padat dan waktu posting jam 14:00 siang hari kerja menghasilkan reach di bawah standar pilar.',
  },
];

export const mockPillarPerformance: PillarPerformanceSummary[] = [
  {
    pillarName: 'Transparansi & Akuntabilitas',
    totalPosts: 14,
    avgEngagement: 7.8,
    totalReach: 145000,
    topFormat: 'Video Reels & Ringkasan Infografis',
    status: 'High Impact',
  },
  {
    pillarName: 'Edukasi Bencana & Humaniora',
    totalPosts: 18,
    avgEngagement: 8.1,
    totalReach: 198000,
    topFormat: 'Carousel Slide Panduan Cepat',
    status: 'High Impact',
  },
  {
    pillarName: 'Sosial & Relawan',
    totalPosts: 12,
    avgEngagement: 5.6,
    totalReach: 86000,
    topFormat: 'Foto Human Interest & Cerita Pendek',
    status: 'Solid',
  },
  {
    pillarName: 'Pengembangan Kapasitas & Event',
    totalPosts: 8,
    avgEngagement: 2.9,
    totalReach: 32000,
    topFormat: 'Poster Feed & Story Interaktif',
    status: 'Underperforming',
  },
];

export const mockBestTimings: BestTimingRecommendation[] = [
  {
    channel: 'Instagram',
    bestDay: 'Rabu & Jumat',
    bestTimeSlot: '19:00 - 21:00 WIB',
    peakEngagementRate: '8.9%',
    reason: 'Waktu senggang prime time donatur setelah jam kerja, cocok untuk carousel dokumentasi emosional dan reels distribusi.',
  },
  {
    channel: 'TikTok',
    bestDay: 'Selasa & Sabtu',
    bestTimeSlot: '12:00 - 13:30 & 20:00 WIB',
    peakEngagementRate: '9.4%',
    reason: 'Jam istirahat makan siang dan akhir pekan ramah FYP untuk konten edukasi mitigasi dan cerita relawan muda.',
  },
  {
    channel: 'Website / Blog',
    bestDay: 'Senin & Kamis',
    bestTimeSlot: '09:00 - 11:00 WIB',
    peakEngagementRate: '5.2%',
    reason: 'Waktu kerja pagi saat mitra donor korporat dan pembaca berita kemanusiaan mencari update berkala.',
  },
];

export interface TrendingTopicItem {
  rank: number;
  topic: string;
  category: 'Bencana' | 'Bantuan Kemanusiaan' | 'Sosial' | 'Kesehatan' | 'Regulasi';
  growthPercentage: number; // e.g. +145%
  mentionCount: number;
  recommendedAngle: string;
  momentum: 'Meroket' | 'Meningkat' | 'Stabil';
}

export const mockTrendingTopics: TrendingTopicItem[] = [
  {
    rank: 1,
    topic: 'Krisis Air Bersih Pasca Bencana',
    category: 'Bencana',
    growthPercentage: 182,
    mentionCount: 14200,
    recommendedAngle: 'Publikasikan dokumentasi water treatment mobile dan distribusi jeriken darurat tim lapangan.',
    momentum: 'Meroket',
  },
  {
    rank: 2,
    topic: 'Jalur Logistik Terisolir Cianjur',
    category: 'Bantuan Kemanusiaan',
    growthPercentage: 124,
    mentionCount: 9850,
    recommendedAngle: 'Update video drone jembatan darurat dan call-to-action konvoi armada kemanusiaan.',
    momentum: 'Meroket',
  },
  {
    rank: 3,
    topic: 'Transparansi Audit Donasi Digital',
    category: 'Regulasi',
    growthPercentage: 78,
    mentionCount: 6400,
    recommendedAngle: 'Rilis infografis laporan penyaluran dana publik secara berkala via stories & dasbor terbuka.',
    momentum: 'Meningkat',
  },
  {
    rank: 4,
    topic: 'Dapur Umum Mandiri Komunitas',
    category: 'Sosial',
    growthPercentage: 62,
    mentionCount: 5120,
    recommendedAngle: 'Sorot kisah ketangguhan ibu-ibu relawan lokal dan kebutuhan bahan pokok harian.',
    momentum: 'Meningkat',
  },
  {
    rank: 5,
    topic: 'Mitigasi Cuaca Ekstrem Musim Hujan',
    category: 'Bencana',
    growthPercentage: 45,
    mentionCount: 4300,
    recommendedAngle: 'Panduan carousel kesiapsiagaan tas siaga bencana (TSB) keluarga.',
    momentum: 'Meningkat',
  },
  {
    rank: 6,
    topic: 'Paket Gizi Darurat Balita 3T',
    category: 'Kesehatan',
    growthPercentage: 28,
    mentionCount: 3100,
    recommendedAngle: 'Kolaborasi kampanye donasi spesifik makanan pendamping ASI (MPASI) sehat.',
    momentum: 'Stabil',
  },
];

export interface ContentGapItem {
  id: number;
  gapTopic: string;
  targetPillar: string;
  suggestedFormat: 'Reels / Video Singkat' | 'Carousel Edukasi' | 'Artikel Website & Press' | 'Live Q&A Relawan';
  potentialAudience: string;
  reason: string; // Alasan singkat mengapa topik ini belum diangkat & bernilai tinggi
  urgency: 'Tinggi' | 'Sedang' | 'Rendah';
}

export const mockContentGaps: ContentGapItem[] = [
  {
    id: 1,
    gapTopic: 'Prosedur & Keamanan Distribusi Logistik di Zona Rawan Gempa Susulan',
    targetPillar: 'Edukasi Bencana & Humaniora',
    suggestedFormat: 'Carousel Edukasi',
    potentialAudience: 'Relawan muda & komunitas donor daerah',
    reason: 'Audiens sering bertanya bagaimana relawan tetap aman saat bertugas, namun belum pernah ada konten panduan SOP keselamatan lapangan yang dipublikasikan.',
    urgency: 'Tinggi',
  },
  {
    id: 2,
    gapTopic: 'Lika-Liku Pengelolaan Gudang Donasi Barang Bekas Layak Pakai vs Pangan Darurat',
    targetPillar: 'Transparansi & Akuntabilitas',
    suggestedFormat: 'Reels / Video Singkat',
    potentialAudience: 'Masyarakat umum & calon donatur perseorangan',
    reason: 'Sering terjadi penumpukan pakaian yang tidak sesuai kebutuhan darurat. Konten ini penting untuk mengedukasi donatur agar memprioritaskan bantuan higienis dan dana tunai.',
    urgency: 'Tinggi',
  },
  {
    id: 3,
    gapTopic: 'Dukungan Psikososial Anak Pascabencana (Trauma Healing Sederhana)',
    targetPillar: 'Sosial & Relawan',
    suggestedFormat: 'Carousel Edukasi',
    potentialAudience: 'Guru, orang tua, & relawan pendamping tenda ramah anak',
    reason: 'Konten lembaga saat ini 85% terfokus pada logistik fisik; aspek pemulihan mental dan keceriaan anak belum terdokumentasikan secara terstruktur.',
    urgency: 'Sedang',
  },
  {
    id: 4,
    gapTopic: 'Akuntabilitas Donasi Non-Tunai: Alur Pemanfaatan QRIS dan Pembayaran Otomatis',
    targetPillar: 'Transparansi & Akuntabilitas',
    suggestedFormat: 'Artikel Website & Press',
    potentialAudience: 'Donatur milenial & mitra teknologi perbankan',
    reason: 'Laporan audit digital perbankan dan settlement fee gateway belum pernah dirinci secara infografis padahal 60% donasi masuk via channel ini.',
    urgency: 'Sedang',
  },
];

export interface IdeaRecommendationItem {
  id: number;
  hookTitle: string;
  sourceContext: 'Tren Topik' | 'Celah Konten' | 'Pola Performa Lampau' | 'Hari Besar Kemanusiaan';
  pillar: string;
  suggestedChannel: 'Instagram' | 'TikTok' | 'YouTube' | 'Website' | 'Facebook';
  expectedImpact: 'Tinggi (Viral / Emosional)' | 'Tinggi (Konversi Donasi)' | 'Stabil (Edukasi)';
  rationale: string;
  keyPoints: string[];
}

export const mockIdeaRecommendations: IdeaRecommendationItem[] = [
  {
    id: 1,
    hookTitle: 'Kenapa 1 Jeriken Air Bersih Berarti Hidup dan Harapan Bagi 50 Jiwa?',
    sourceContext: 'Tren Topik',
    pillar: 'Edukasi Bencana & Humaniora',
    suggestedChannel: 'Instagram',
    expectedImpact: 'Tinggi (Konversi Donasi)',
    rationale: 'Topik air bersih sedang memuncak (+182%). Mengaitkannya dengan narasi mikro 1 jeriken mengubah empati publik menjadi tindakan transfer donasi langsung.',
    keyPoints: [
      'Visual kontras: sumber air keruh vs instalasi filter air bergerak',
      'Data infografis kebutuhan harian satu keluarga di tenda darurat',
      'Call to action paket donasi sedekah air bersih Rp 50.000/keluarga'
    ],
  },
  {
    id: 2,
    hookTitle: 'POV Relawan: 12 Jam di Bak Truk Logistik Menembus Jalur Berlumpur',
    sourceContext: 'Pola Performa Lampau',
    pillar: 'Transparansi & Akuntabilitas',
    suggestedChannel: 'TikTok',
    expectedImpact: 'Tinggi (Viral / Emosional)',
    rationale: 'Reels logistik sebelumnya meraup engagement 9.2%. Format storytelling orang pertama (POV) memiliki retention rate 3.1x lipat di platform video pendek.',
    keyPoints: [
      'Hook 3 detik pertama: ban truk amblas dan kerja bakti warga menarik tali tambang',
      'Suara natural lapangan tanpa musik berlebih untuk kesan otentik',
      'Penutup: apresiasi kepada semua donatur yang mendanai bahan bakar armada'
    ],
  },
  {
    id: 3,
    hookTitle: '3 Mitos Bantuan Barang Bekas: Mengapa Sumbangan Pakaian Sering Terbengkalai?',
    sourceContext: 'Celah Konten',
    pillar: 'Edukasi Bencana & Humaniora',
    suggestedChannel: 'Instagram',
    expectedImpact: 'Stabil (Edukasi)',
    rationale: 'Mengisi celah konten prioritas tinggi mengenai edukasi jenis bantuan yang paling tepat sasaran dan mengurangi beban pilah logistik di posko.',
    keyPoints: [
      'Foto realita tumpukan baju basah yang tidak terpakai di posko',
      'Penjelasan biaya sortir & angkut vs bantuan pangan instan',
      'Solusi cerdas: alihkan ke infaq tunai terukur'
    ],
  },
  {
    id: 4,
    hookTitle: 'Mini Dokumenter: Senyum Pertama di Tenda Sekolah Darurat',
    sourceContext: 'Hari Besar Kemanusiaan',
    pillar: 'Sosial & Relawan',
    suggestedChannel: 'YouTube',
    expectedImpact: 'Tinggi (Viral / Emosional)',
    rationale: 'Menjelang Hari Anak Sedunia, peliputan pemulihan psikososial anak akan menyentuh donatur institusi dan CSR perusahaan.',
    keyPoints: [
      'Wawancara singkat relawan psikolog anak',
      'Aktivitas menggambar dan permainan interaktif anak-anak posko',
      'Pesan harapan masa depan pendidikan pascabencana'
    ],
  },
];





/* === mockKnowledge.ts === */
export interface DocSection {
  heading: string;
  content: string;
  checklist?: string[];
  notes?: string;
}

export interface SopStep {
  stepNumber: number;
  phase: string;
  title: string;
  actor: string;
  action: string;
  output: string;
  slaTime?: string;
}

export interface KnowledgeDoc {
  id: number;
  code: string;
  title: string;
  category: 'SOP' | 'Panduan Teknis' | 'Pedoman Brand' | 'Alur Kerja' | 'Template';
  description: string;
  lastUpdated: string;
  author: string;
  version: string;
  accessRole: 'all' | 'admin' | 'head';
  downloadUrl?: string;
  readTime: string;
  sections?: DocSection[];
  relatedCodes?: string[];
  steps?: SopStep[];
}

export const knowledgeCategories = [
  'Semua Kategori',
  'SOP',
  'Panduan Teknis',
  'Pedoman Brand',
  'Alur Kerja',
  'Template'
];

export const mockKnowledgeDocs: KnowledgeDoc[] = [
  {
    id: 1,
    code: 'SOP-HUM-01',
    title: 'SOP Peliputan dan Dokumentasi Bencana di Lapangan',
    category: 'SOP',
    description: 'Prosedur keselamatan tim media, etika wawancara penyintas, batas zona merah, dan perlindungan privasi anak penyintas bencana.',
    lastUpdated: '28 September 2026',
    author: 'Koordinator Peliputan Lapangan',
    version: 'v2.3',
    accessRole: 'all',
    readTime: '6 menit',
    relatedCodes: ['SOP-DON-02', 'SOP-IT-03', 'WRK-PUB-01'],
    sections: [
      {
        heading: '1. Tujuan dan Ruang Lingkup',
        content: 'Dokumen ini mengatur tata laksana standar bagi seluruh personil Humas, fotografer, videografer, dan relawan dokumentasi saat bertugas di lokasi bencana alam maupun tanggap darurat krisis kemanusiaan.',
        notes: 'Berlaku wajib sejak hari pertama fase tanggap darurat dideklarasikan oleh komandan posko operasi.'
      },
      {
        heading: '2. Protokol Keselamatan dan Alat Pelindung Diri (APD)',
        content: 'Keselamatan jiwa personil selalu menjadi prioritas di atas materi liputan. Tim dilarang memasuki radius zona merah aktif tanpa izin resmi Basarnas atau TNI/Polri.',
        checklist: [
          'Rompi identitas kemanusiaan lembaga dan helm keselamatan wajib dipakai setiap saat di lapangan.',
          'Sepatu bot keselamatan dan kartu identitas darurat (tertera golongan darah dan kontak darurat keluarga).',
          'Perangkat komunikasi radio dua arah (HT) cadangan baterai penuh serta powerbank.',
          'Pouch kedap air untuk kartu memori cadangan dan paspor/dokumen resmi relawan.'
        ]
      },
      {
        heading: '3. Etika Wawancara dan Perlindungan Penyintas',
        content: 'Dalam mengambil foto atau mewawancarai warga terdampak, personil wajib menjaga martabat kemanusiaan dan tidak mengeksploitasi kesedihan secara berlebihan demi sensasionalisme.',
        checklist: [
          'Wajib meminta izin lisan sebelum mengambil foto jarak dekat (close-up).',
          'Wajah anak-anak dan korban luka berat dilarang diperlihatkan tanpa persetujuan tertulis wali.',
          'Dilarang memaksa wawancara apabila penyintas masih dalam kondisi syok psikis berat.',
          'Pastikan pakaian dan aurat penyintas tertutup secara pantas dalam hasil dokumentasi visual.'
        ],
        notes: 'Pelanggaran etika peliputan anak dapat dikenakan evaluasi etik internal divisi.'
      },
      {
        heading: '4. Alur Penyetoran Materi dan Kurasi Redaksi',
        content: 'Semua materi foto resolusi tinggi dan video potongan mentah wajib diunggah ke server penyimpanan DAM harian saat tim kembali ke posko media sentral paling lambat pukul 21.00 WIB setiap harinya.'
      }
    ],
    steps: [
      {
        stepNumber: 1,
        phase: 'Fase Pra-Keberangkatan',
        title: 'Briefing Keamanan & Pembagian Zona',
        actor: 'Koordinator Liputan & Tim Dokumentasi',
        action: 'Menghadiri briefing komando di posko induk, mencatat titik kumpul aman (assembly point), serta mengecek fungsi APD dan alat komunikasi satelit.',
        output: 'Surat tugas peliputan terverifikasi & peta zona bahaya.',
        slaTime: '30 menit sebelum berangkat'
      },
      {
        stepNumber: 2,
        phase: 'Fase Tiba di Lapangan',
        title: 'Izin Tokoh Lokal & Asesmen Etis',
        actor: 'Fotografer / Reporter',
        action: 'Menghubungi ketua posko setempat, memperkenalkan diri sebagai tim kemanusiaan resmi, dan meminta persetujuan lisan sebelum merekam aktivitas warga.',
        output: 'Izin akses liputan & catatan etika budaya setempat.',
        slaTime: 'Maksimal 15 menit pasca tiba'
      },
      {
        stepNumber: 3,
        phase: 'Fase Peliputan',
        title: 'Dokumentasi Penyaluran & Pengambilan Cerita',
        actor: 'Videografer & Reporter Humas',
        action: 'Mengambil video interaksi distribusi bantuan dengan framing sopan, mewawancarai penerima manfaat dengan lembar persetujuan sukarela, serta mematuhi aturan privasi anak.',
        output: 'Koleksi materi foto RAW, video b-roll, dan audio wawancara.',
        slaTime: 'Sesuai jadwal distribusi tim logistik'
      },
      {
        stepNumber: 4,
        phase: 'Fase Kurasi & Pengunggahan',
        title: 'Penyortiran Cepat & Upload ke Server DAM',
        actor: 'Editor Redaksi & Staf Data',
        action: 'Memilah 10 foto terbaik dan 1 klip video sorotan utama untuk segera diproses menjadi rilis berita kilat dan konten media sosial.',
        output: 'Folder liputan terunggah rapi di DAM sesuai format penamaan standar.',
        slaTime: 'Maksimal 2 jam setelah kembali ke posko'
      },
      {
        stepNumber: 5,
        phase: 'Fase Evaluasi',
        title: 'Debriefing Etika & Pengarsipan Final',
        actor: 'Ketua Bidang Humas & Tim Liputan',
        action: 'Melakukan evaluasi harian bersama tim relawan dan memastikan tidak ada pelanggaran privasi atau risiko keselamatan personil yang terlewat.',
        output: 'Berita acara liputan & arsip arsip materi resmi.',
        slaTime: 'Pukul 21.30 WIB harian'
      }
    ]
  },
  {
    id: 2,
    code: 'SOP-HUM-02',
    title: 'SOP Komunikasi Krisis dan Pernyataan Media (Press Release)',
    category: 'SOP',
    description: 'Alur eskalasi pers, penunjukan juru bicara resmi lembaga, verifikasi fakta cepat, dan mitigasi disinformasi publik.',
    lastUpdated: '15 Agustus 2026',
    author: 'Ketua Bidang Humas & Media',
    version: 'v3.0',
    accessRole: 'all',
    readTime: '8 menit',
    relatedCodes: ['SOP-HUM-01', 'GDL-MED-01'],
    sections: [
      {
        heading: '1. Pengertian dan Prinsip Komunikasi Krisis',
        content: 'Krisis komunikasi adalah situasi di mana terjadi insiden lapangan, isu reputasi, atau polemik publik yang berpotensi menurunkan tingkat kepercayaan para donatur dan mitra lembaga kemanusiaan.'
      },
      {
        heading: '2. Otoritas Juru Bicara Resmi (One Gate Communication)',
        content: 'Hanya Ketua Bidang Humas atau Pimpinan Yayasan yang berhak memberikan keterangan pers resmi. Staf operasional dilarang memberikan pernyataan spekulatif kepada wartawan.',
        checklist: [
          'Semua permintaan wawancara jurnalis diarahkan ke meja sekretariat humas.',
          'Lembar fakta (fact-sheet) resmi disiapkan maksimal 2 jam setelah verifikasi lapangan.',
          'Rilis media tertulis dikirimkan secara serentak ke jejaring media massa mitra.'
        ]
      },
      {
        heading: '3. Penanganan Disinformasi di Media Sosial',
        content: 'Tim pemantauan sentral wajib memonitor sentimen isu di Twitter/X, TikTok, dan grup WhatsApp publik. Respons klarifikasi diterbitkan dengan pendekatan empatik dan berbasis data aktual.'
      }
    ]
  },
  {
    id: 3,
    code: 'GDL-MED-01',
    title: 'Pedoman Identitas Visual dan Tone of Voice Lembaga',
    category: 'Pedoman Brand',
    description: 'Standar tipografi, palet warna kemanusiaan resmi, format logo, serta panduan narasi kepedulian yang santun dan menggerakkan.',
    lastUpdated: '10 Juli 2026',
    author: 'Tim Kreatif & Desain',
    version: 'v2.0',
    accessRole: 'all',
    readTime: '12 menit',
    relatedCodes: ['WRK-PUB-01', 'SOP-HUM-02'],
    sections: [
      {
        heading: '1. Esensi Brand Peduli Negeri',
        content: 'Suara lembaga kami adalah harapan, ketulusan, transparansi, dan ketegasan dalam aksi nyata kemanusiaan.'
      },
      {
        heading: '2. Palet Warna Resmi Lembaga',
        content: 'Biru Samudra (#0284c7) sebagai simbol ketenangan dan integritas; Merah Peduli (#e11d48) sebagai simbol aksi tanggap darurat dan kepedulian; Hijau Berdaya (#16a34a) untuk program pemberdayaan jangka panjang.'
      },
      {
        heading: '3. Karakter Narasi (Tone of Voice)',
        content: 'Gunakan kalimat ajakan yang empatik dan optimis. Hindari narasi keputusasaan yang merendahkan martabat penerima manfaat bantuan kemanusiaan.'
      }
    ]
  },
  {
    id: 4,
    code: 'WRK-PUB-01',
    title: 'Alur Kerja Publikasi Konten Multi-Kanal (Omnichannel)',
    category: 'Alur Kerja',
    description: 'Diagram tahapan mulai dari riset topik, penulisan naskah, persetujuan redaksi, penjadwalan kalender, hingga evaluasi engagement.',
    lastUpdated: '03 September 2026',
    author: 'Editor Pelaksana Media',
    version: 'v1.4',
    accessRole: 'all',
    readTime: '5 menit'
  },
  {
    id: 5,
    code: 'TPL-LRA-01',
    title: 'Panduan dan Template Penyusunan RAB Program Humas',
    category: 'Template',
    description: 'Format baku estimasi biaya iklan meta, pengadaan materi liputan, honorarium kontributor daerah, dan realisasi LRA.',
    lastUpdated: '01 Oktober 2026',
    author: 'Divisi Administrasi Keuangan Humas',
    version: 'v2.1',
    accessRole: 'admin',
    readTime: '7 menit'
  },
  {
    id: 6,
    code: 'SOP-IT-03',
    title: 'Prosedur Akses Digital Asset Management (DAM Local NAS)',
    category: 'Panduan Teknis',
    description: 'Tata cara koneksi ke server NAS lokal kantor, struktur folder liputan per tahun, penamaan file RAW, dan hak akses folder sensitif.',
    lastUpdated: '20 September 2026',
    author: 'Admin Infrastruktur IT',
    version: 'v1.2',
    accessRole: 'all',
    readTime: '4 menit'
  },
  {
    id: 7,
    code: 'SOP-DON-02',
    title: 'Etika Publikasi Donatur dan Penerima Manfaat',
    category: 'SOP',
    description: 'Aturan kepatuhan perlindungan data pribadi donatur dan martabat keluarga dhuafa dalam publikasi materi visual.',
    lastUpdated: '12 Juni 2026',
    author: 'Divisi Advokasi & Legal Lembaga',
    version: 'v1.8',
    accessRole: 'all',
    readTime: '9 menit'
  },
  {
    id: 8,
    code: 'TPL-RPT-02',
    title: 'Template Standar Laporan Akuntabilitas Semesteran',
    category: 'Template',
    description: 'Dokumen acuan format ringkasan eksekutif, tabel infografis capaian, dan matriks pertanggungjawaban dana publik.',
    lastUpdated: '18 September 2026',
    author: 'Sekretariat Bidang',
    version: 'v2.0',
    accessRole: 'head',
    readTime: '10 menit'
  }
];

export interface DocumentProposal {
  id: string;
  type: 'new' | 'revision';
  title: string;
  category: 'SOP' | 'Panduan Teknis' | 'Pedoman Brand' | 'Alur Kerja' | 'Template';
  targetDocCode?: string;
  targetDocTitle?: string;
  submitterName: string;
  submitterRole: 'staff' | 'admin' | 'head';
  submittedAt: string;
  urgency: 'normal' | 'penting' | 'mendesak';
  reason: string;
  suggestedContent: string;
  status: 'menunggu_tinjauan' | 'disetujui' | 'ditolak' | 'perlu_revisi';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export const mockProposals: DocumentProposal[] = [
  {
    id: 'USUL-2026-001',
    type: 'revision',
    title: 'Pembaruan Batas Waktu Unggah Dokumentasi Tanggap Darurat Bencana',
    category: 'SOP',
    targetDocCode: 'SOP-HUM-01',
    targetDocTitle: 'SOP Peliputan dan Dokumentasi Bencana di Lapangan',
    submitterName: 'Rian Pratama',
    submitterRole: 'staff',
    submittedAt: '09 Oktober 2026, 14:20 WIB',
    urgency: 'penting',
    reason: 'Koneksi internet di posko bencana sering mengalami kendala bandwidth saat jam malam sehingga batas unggah jam 21.00 WIB sulit dipenuhi tanpa risiko kegagalan transmisi.',
    suggestedContent: 'Menambahkan opsi kelonggaran pengunggahan bertahap (priority batching: foto resolusi sedang untuk siaran pers dahulu, file RAW menyusul pagi hari pukul 06.00 WIB).',
    status: 'menunggu_tinjauan'
  },
  {
    id: 'USUL-2026-002',
    type: 'new',
    title: 'Panduan Penanganan Hak Jawab dan Klarifikasi Berita Viral Medsos',
    category: 'Panduan Teknis',
    submitterName: 'Dewi Lestari',
    submitterRole: 'staff',
    submittedAt: '08 Oktober 2026, 09:15 WIB',
    urgency: 'mendesak',
    reason: 'Belum ada panduan resmi tata cara merespons misinformasi penyaluran bantuan di platform X (Twitter) dan TikTok saat isu sedang bergulir cepat.',
    suggestedContent: 'Membuat matriks respon krisis medsos, format template pernyataan klarifikasi resmi, dan pembatasan wewenang admin akun agar tidak membalas tanpa arahan Ketua Bidang.',
    status: 'menunggu_tinjauan'
  },
  {
    id: 'USUL-2026-003',
    type: 'revision',
    title: 'Penyesuaian Aturan Perlindungan Wajah Penerima Manfaat Dhuafa Lansia',
    category: 'SOP',
    targetDocCode: 'SOP-DON-02',
    targetDocTitle: 'Etika Publikasi Donatur dan Penerima Manfaat',
    submitterName: 'Ahmad Fauzi',
    submitterRole: 'admin',
    submittedAt: '04 Oktober 2026, 11:30 WIB',
    urgency: 'normal',
    reason: 'Menegaskan batas persetujuan dokumentasi untuk lansia yang hidup sebatang kara dan menjaga harkat martabat keluarga.',
    suggestedContent: 'Penambahan klausul persetujuan berbasis saksi aparat desa / rukun tetangga setempat bila penerima manfaat berhalangan tanda tangan.',
    status: 'disetujui',
    reviewedBy: 'Dr. Hendra Gunawan (Ketua Bidang Humas)',
    reviewedAt: '06 Oktober 2026, 16:45 WIB',
    reviewNotes: 'Disetujui untuk diintegrasikan pada revisi SOP v1.9 bulan depan. Sangat bagus untuk kepatuhan etis kemanusiaan.'
  },
  {
    id: 'USUL-2026-004',
    type: 'new',
    title: 'SOP Penggunaan AI Generatif dalam Pembuatan Naskah Kampanye Kemanusiaan',
    category: 'Pedoman Brand',
    submitterName: 'Budi Santoso',
    submitterRole: 'staff',
    submittedAt: '29 September 2026, 15:00 WIB',
    urgency: 'normal',
    reason: 'Staf copywriter mulai memanfaatkan AI generatif untuk drafting konten, diperlukan batasan etika dan pelarangan upload data pribadi donatur ke prompt publik.',
    suggestedContent: 'Dilarang memasukkan NIK, nama lengkap penerima manfaat, dan foto asli tanpa enkripsi ke alat AI pihak ketiga.',
    status: 'perlu_revisi',
    reviewedBy: 'Siti Rahma (Admin Humas)',
    reviewedAt: '02 Oktober 2026, 10:10 WIB',
    reviewNotes: 'Ide sangat baik, namun butuh detail sinkronisasi dengan kebijakan IT keamanan siber lembaga sebelum diajukan ke Ketua Bidang.'
  }
];



/* === mockMetrics.ts === */
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


/* === mockNews.ts === */
// Data tiruan (stub) untuk Pusat Pantauan Berita — mengacu pada kebutuhan pantauan RSS, Google News, dan Telegram lembaga

export type NewsSourceType = 'rss' | 'google_news' | 'telegram';

export interface NewsItem {
  id: number;
  title: string;
  sourceType: NewsSourceType;
  sourceName: string;
  url: string;
  publishedAt: string; // ISO string / readable format
  summary: string;
  category: 'Bencana' | 'Bantuan Kemanusiaan' | 'Sosial' | 'Kesehatan' | 'Regulasi';
  isCurated: boolean;
  isImportant?: boolean;
  channelHandle?: string; // Khusus telegram
}

export interface CuratedSource {
  id: number;
  name: string;
  type: NewsSourceType;
  urlOrHandle: string;
  category: string;
  isActive: boolean;
  lastSynced: string;
  unreadCount: number;
}

export const curatedSources: CuratedSource[] = [
  { id: 1, name: 'BNPB Info Bencana', type: 'rss', urlOrHandle: 'https://bnpb.go.id/feed', category: 'Bencana', isActive: true, lastSynced: '10 menit lalu', unreadCount: 4 },
  { id: 2, name: 'BMKG Cuaca & Gempa', type: 'rss', urlOrHandle: 'https://bmkg.go.id/rss', category: 'Bencana', isActive: true, lastSynced: '5 menit lalu', unreadCount: 2 },
  { id: 3, name: 'Antara Humaniora', type: 'rss', urlOrHandle: 'https://antaranews.com/rss/humaniora', category: 'Bantuan Kemanusiaan', isActive: true, lastSynced: '15 menit lalu', unreadCount: 6 },
  { id: 4, name: 'Google News: Penyaluran Bantuan', type: 'google_news', urlOrHandle: 'q=bantuan+kemanusiaan+indonesia', category: 'Bantuan Kemanusiaan', isActive: true, lastSynced: '20 menit lalu', unreadCount: 8 },
  { id: 5, name: 'Google News: Banjir & Longsor', type: 'google_news', urlOrHandle: 'q=bencana+banjir+longsor', category: 'Bencana', isActive: true, lastSynced: '12 menit lalu', unreadCount: 5 },
  { id: 6, name: 'Telegram Siaga Bencana Relawan', type: 'telegram', urlOrHandle: '@siagabencana_id', category: 'Bencana', isActive: true, lastSynced: '3 menit lalu', unreadCount: 11 },
  { id: 7, name: 'Telegram Info Logistik Kemanusiaan', type: 'telegram', urlOrHandle: '@infologistik_ngo', category: 'Bantuan Kemanusiaan', isActive: true, lastSynced: '8 menit lalu', unreadCount: 3 },
  { id: 8, name: 'Telegram Forum Relawan Nusantara', type: 'telegram', urlOrHandle: '@forumrelawan_nusantara', category: 'Sosial', isActive: true, lastSynced: '25 menit lalu', unreadCount: 7 },
];

export const mockNewsItems: NewsItem[] = [
  {
    id: 1,
    title: 'BMKG Rilis Peringatan Dini Cuaca Ekstrem Jawa Barat 3 Hari ke Depan',
    sourceType: 'rss',
    sourceName: 'BMKG Cuaca & Gempa',
    url: 'https://bmkg.go.id/peringatan-dini-jabar',
    publishedAt: '2026-10-10 09:15',
    summary: 'Potensi hujan lebat disertai kilat dan angin kencang berpeluang melanda wilayah Bogor, Cianjur, dan Sukabumi. Tim siaga bencana diimbau meningkatkan kesiapsiagaan logistik.',
    category: 'Bencana',
    isCurated: true,
    isImportant: true,
  },
  {
    id: 2,
    title: 'Update Jalur Logistik: Jembatan Darurat Cianjur Selatan Selesai Dibangun',
    sourceType: 'telegram',
    sourceName: 'Telegram Siaga Bencana Relawan',
    url: 'https://t.me/siagabencana_id/4129',
    publishedAt: '2026-10-10 08:40',
    summary: 'Truk logistik sembako kapasitas hingga 5 ton kini sudah dapat melintas menuju 4 desa terisolir. Distribusi paket pangan lanjutan dijadwalkan mulai pukul 11:00 WIB.',
    category: 'Bantuan Kemanusiaan',
    isCurated: true,
    isImportant: true,
    channelHandle: '@siagabencana_id',
  },
  {
    id: 3,
    title: 'Kemenkes Percepat Distribusi Paket Gizi Balita Wilayah 3T',
    sourceType: 'google_news',
    sourceName: 'Google News: Penyaluran Bantuan',
    url: 'https://news.google.com/articles/kemenkes-gizi-3t',
    publishedAt: '2026-10-10 07:30',
    summary: 'Pemerintah menggandeng koalisi NGO penyalur bantuan untuk menjangkau 25 ribu anak di daerah terluar guna menekan angka risiko stunting pascabencana.',
    category: 'Kesehatan',
    isCurated: true,
    isImportant: false,
  },
  {
    id: 4,
    title: 'BNPB Catat Tren Peningkatan Kejadian Bencana Hidrometeorologi Basah',
    sourceType: 'rss',
    sourceName: 'BNPB Info Bencana',
    url: 'https://bnpb.go.id/berita/tren-hidrometeorologi-oktober',
    publishedAt: '2026-10-09 19:20',
    summary: 'Sebanyak 64 kejadian banjir dan tanah longsor tercatat dalam sepekan terakhir. Wilayah penyangga sungai diminta memperkuat koordinasi tanggap darurat.',
    category: 'Bencana',
    isCurated: true,
    isImportant: false,
  },
  {
    id: 5,
    title: 'Kebutuhan Mendesak Air Bersih di Pengungsian Desa Sukamaju',
    sourceType: 'telegram',
    sourceName: 'Telegram Info Logistik Kemanusiaan',
    url: 'https://t.me/infologistik_ngo/1042',
    publishedAt: '2026-10-09 16:55',
    summary: 'Diperlukan tambahan 2 tangki air bersih harian dan 300 jeriken keluarga untuk pengungsi mandiri di posko 3. Relawan terdekat diharapkan merapat.',
    category: 'Bantuan Kemanusiaan',
    isCurated: true,
    isImportant: true,
    channelHandle: '@infologistik_ngo',
  },
  {
    id: 6,
    title: 'Transparansi Lembaga Donasi Digital Jadi Sorotan Publik di Era Pasca Bencana',
    sourceType: 'rss',
    sourceName: 'Antara Humaniora',
    url: 'https://antaranews.com/humaniora/transparansi-donasi-digital',
    publishedAt: '2026-10-09 14:10',
    summary: 'Laporan audit terbuka dan pembaruan berkala via dasbor digital dinilai kunci meningkatkan kepercayaan muzaki serta donatur perseorangan.',
    category: 'Regulasi',
    isCurated: true,
    isImportant: false,
  },
  {
    id: 7,
    title: 'Inisiatif Dapur Umum Mandiri Ibu-Ibu Relawan di Posko Pengungsian',
    sourceType: 'telegram',
    sourceName: 'Telegram Forum Relawan Nusantara',
    url: 'https://t.me/forumrelawan_nusantara/884',
    publishedAt: '2026-10-09 11:30',
    summary: 'Penyajian 1.200 porsi makanan hangat per hari berhasil dijalankan berkat kolaborasi bahan pangan lokal dan donasi sembako lembaga.',
    category: 'Sosial',
    isCurated: true,
    isImportant: false,
    channelHandle: '@forumrelawan_nusantara',
  },
  {
    id: 8,
    title: 'Survei Kesiapsiagaan Logistik Obat-Obatan untuk Komunitas Rentan',
    sourceType: 'google_news',
    sourceName: 'Google News: Penyaluran Bantuan',
    url: 'https://news.google.com/articles/survei-obat-komunitas',
    publishedAt: '2026-10-08 17:45',
    summary: 'Ketersediaan obat infeksi kulit dan saluran pernapasan menjadi prioritas bantuan medis darurat di tenda-tenda penampungan sementara.',
    category: 'Kesehatan',
    isCurated: true,
    isImportant: false,
  },
];


/* === mockProjects.ts === */
// Data tiruan (stub) untuk Papan Proyek (projects & project_tasks di PRD)

export interface ProjectTask {
  id: number;
  projectId: number;
  title: string;
  stage: 'todo' | 'in_progress' | 'review' | 'done';
  assignee: string;
  dueDate: string; // YYYY-MM-DD
  priority: 'Rendah' | 'Sedang' | 'Tinggi';
}

export interface Project {
  id: number;
  name: string;
  owner: string;
  startDate: string;
  endDate: string;
  progress: number; // 0 - 100
  tasks: ProjectTask[];
}

export const stageLabels: Record<ProjectTask['stage'], string> = {
  todo: 'Belum Mulai',
  in_progress: 'Sedang Dikerjakan',
  review: 'Peninjauan',
  done: 'Selesai',
};

export const mockProjects: Project[] = [
  {
    id: 1,
    name: 'Kampanye Respons Bencana Cianjur',
    owner: 'Dewi (Ketua Tim Lapangan)',
    startDate: '2026-10-01',
    endDate: '2026-10-25',
    progress: 65,
    tasks: [
      { id: 101, projectId: 1, title: 'Liputan dokumentasi distribusi logistik', stage: 'done', assignee: 'Dewi', dueDate: '2026-10-05', priority: 'Tinggi' },
      { id: 102, projectId: 1, title: 'Rilis siaran pers ke media nasional', stage: 'done', assignee: 'Budi', dueDate: '2026-10-08', priority: 'Sedang' },
      { id: 103, projectId: 1, title: 'Produksi video rangkuman pekan ke-2', stage: 'in_progress', assignee: 'Sari', dueDate: '2026-10-14', priority: 'Tinggi' },
      { id: 104, projectId: 1, title: 'Laporan dampak & infografis penerima manfaat', stage: 'todo', assignee: 'Rani', dueDate: '2026-10-22', priority: 'Sedang' },
    ]
  },
  {
    id: 2,
    name: 'Revitalisasi Portal Donasi Digital',
    owner: 'Budi (Admin IT & Humas)',
    startDate: '2026-10-05',
    endDate: '2026-11-10',
    progress: 35,
    tasks: [
      { id: 201, projectId: 2, title: 'Audit UX alur checkout donasi instan', stage: 'done', assignee: 'Budi', dueDate: '2026-10-09', priority: 'Sedang' },
      { id: 202, projectId: 2, title: 'Integrasi payment gateway QRIS', stage: 'in_progress', assignee: 'Budi', dueDate: '2026-10-18', priority: 'Tinggi' },
      { id: 203, projectId: 2, title: 'A/B testing landing page kampanye pendidikan', stage: 'review', assignee: 'Sari', dueDate: '2026-10-24', priority: 'Sedang' },
      { id: 204, projectId: 2, title: 'Penyusunan panduan donasi bagi publik', stage: 'todo', assignee: 'Rani', dueDate: '2026-11-05', priority: 'Rendah' },
    ]
  },
  {
    id: 3,
    name: 'Penyusunan Laporan Tahunan Kemanusiaan 2026',
    owner: 'Rani (Ketua Bidang Humas)',
    startDate: '2026-10-10',
    endDate: '2026-12-15',
    progress: 15,
    tasks: [
      { id: 301, projectId: 3, title: 'Pengumpulan data audit RAB & realisasi LRA', stage: 'in_progress', assignee: 'Rani', dueDate: '2026-10-25', priority: 'Tinggi' },
      { id: 302, projectId: 3, title: 'Wawancara studi kasus mitra lapangan', stage: 'todo', assignee: 'Dewi', dueDate: '2026-11-10', priority: 'Sedang' },
      { id: 303, projectId: 3, title: 'Desain layout & infografis booklet PDF', stage: 'todo', assignee: 'Sari', dueDate: '2026-11-30', priority: 'Sedang' },
    ]
  }
];


/* === mockReport.ts === */
export const reportChannels = ['Semua Kanal', 'Instagram', 'TikTok', 'YouTube', 'Website', 'Donasi', 'Iklan Meta'];
export const reportPeriods = [
  { value: '7d', label: '7 Hari Terakhir' },
  { value: '30d', label: '30 Hari Terakhir' },
  { value: '90d', label: '90 Hari Terakhir' },
];

export interface PerfRow {
  channel: string;
  period: string;
  reach: number;
  engagement: number;
  conversions: number;
  delta: number; // % perubahan vs periode sebelumnya
}

export const mockPerformance: PerfRow[] = [
  { channel: 'Instagram', period: '7d', reach: 48200, engagement: 3100, conversions: 85, delta: 6.2 },
  { channel: 'Instagram', period: '30d', reach: 192000, engagement: 12800, conversions: 340, delta: 9.8 },
  { channel: 'Instagram', period: '90d', reach: 540000, engagement: 35400, conversions: 910, delta: 14.1 },
  { channel: 'TikTok', period: '7d', reach: 91000, engagement: 7400, conversions: 40, delta: 18.5 },
  { channel: 'TikTok', period: '30d', reach: 365000, engagement: 29800, conversions: 160, delta: 22.3 },
  { channel: 'TikTok', period: '90d', reach: 980000, engagement: 81000, conversions: 420, delta: 31.0 },
  { channel: 'YouTube', period: '7d', reach: 15400, engagement: 1200, conversions: 22, delta: -2.1 },
  { channel: 'YouTube', period: '30d', reach: 66000, engagement: 5100, conversions: 95, delta: 3.4 },
  { channel: 'YouTube', period: '90d', reach: 188000, engagement: 14600, conversions: 270, delta: 5.9 },
  { channel: 'Website', period: '7d', reach: 12100, engagement: 4300, conversions: 130, delta: 4.0 },
  { channel: 'Website', period: '30d', reach: 51000, engagement: 18200, conversions: 520, delta: 7.7 },
  { channel: 'Website', period: '90d', reach: 149000, engagement: 52000, conversions: 1480, delta: 11.2 },
  { channel: 'Donasi', period: '7d', reach: 8300, engagement: 2100, conversions: 210, delta: 12.0 },
  { channel: 'Donasi', period: '30d', reach: 34000, engagement: 8700, conversions: 860, delta: 15.4 },
  { channel: 'Donasi', period: '90d', reach: 97000, engagement: 24000, conversions: 2350, delta: 19.8 },
  { channel: 'Iklan Meta', period: '7d', reach: 120000, engagement: 5200, conversions: 150, delta: -4.8 },
  { channel: 'Iklan Meta', period: '30d', reach: 470000, engagement: 21000, conversions: 640, delta: 1.9 },
  { channel: 'Iklan Meta', period: '90d', reach: 1300000, engagement: 59000, conversions: 1720, delta: 6.3 },
];


/* === mockSettings.ts === */
export interface OrganizationProfile {
  name: string;
  shortName: string;
  tagline: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  fiscalYear: string;
  timezone: string;
  logoUrl: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: 'head' | 'admin' | 'staff' | 'reviewer';
  roleLabel: string;
  avatar: string;
  status: 'active' | 'inactive';
  lastActive: string;
  department: string;
}

export interface RolePermission {
  key: string;
  label: string;
  description: string;
  head: boolean;
  admin: boolean;
  staff: boolean;
  reviewer: boolean;
}

export interface IntegrationService {
  id: string;
  name: string;
  category: 'cloud' | 'storage' | 'social' | 'messaging';
  categoryLabel: string;
  status: 'connected' | 'disconnected' | 'warning';
  statusLabel: string;
  lastSync: string;
  endpoint: string;
  details: string;
  authMethod: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  userName: string;
  userRole: string;
  action: string;
  target: string;
  ipAddress: string;
  status: 'success' | 'failed' | 'warning';
}

export const mockOrgProfile: OrganizationProfile = {
  name: 'Yayasan Kemanusiaan Peduli Negeri',
  shortName: 'Peduli Negeri',
  tagline: 'Menebar Manfaat, Membangun Martabat Negeri Bersama',
  address: 'Jl. Pemuda Raya No. 45, Jakarta Pusat 10520',
  contactEmail: 'humas@pedulinegeri.org',
  contactPhone: '+62 21 4288 9910',
  fiscalYear: 'Januari - Desember (2025)',
  timezone: 'WIB (Asia/Jakarta / UTC+7)',
  logoUrl: '/favicon.svg'
};

export const mockUsers: UserAccount[] = [
  {
    id: 'usr-1',
    name: 'Rani Maulida',
    email: 'rani.head@pedulinegeri.org',
    role: 'head',
    roleLabel: 'Kepala Bagian Humas',
    avatar: 'RM',
    status: 'active',
    lastActive: '5 menit yang lalu',
    department: 'Manajemen Eksekutif Humas'
  },
  {
    id: 'usr-2',
    name: 'Budi Santoso',
    email: 'budi.admin@pedulinegeri.org',
    role: 'admin',
    roleLabel: 'Administrator Teknis',
    avatar: 'BS',
    status: 'active',
    lastActive: '12 menit yang lalu',
    department: 'Operasional & Sistem Digital'
  },
  {
    id: 'usr-3',
    name: 'Dewi Lestari',
    email: 'dewi.creative@pedulinegeri.org',
    role: 'staff',
    roleLabel: 'Staf Kreatif & Konten',
    avatar: 'DL',
    status: 'active',
    lastActive: '1 jam yang lalu',
    department: 'Produksi Media Kreatif'
  },
  {
    id: 'usr-4',
    name: 'Sari Rahmawati',
    email: 'sari.writer@pedulinegeri.org',
    role: 'staff',
    roleLabel: 'Staf Penulis & Publikasi',
    avatar: 'SR',
    status: 'active',
    lastActive: '2 jam yang lalu',
    department: 'Redaksi Berita & Liputan'
  },
  {
    id: 'usr-5',
    name: 'Fauzi Hidayat',
    email: 'fauzi.reviewer@pedulinegeri.org',
    role: 'reviewer',
    roleLabel: 'Editor & Peninjau Akhir',
    avatar: 'FH',
    status: 'active',
    lastActive: 'Kemarin, 16:40 WIB',
    department: 'Kepatuhan & Peninjauan Narasi'
  }
];

export const mockPermissions: RolePermission[] = [
  {
    key: 'content_create_edit',
    label: 'Buat & Sunting Draft Konten',
    description: 'Menyusun naskah, aset visual, dan draf jadwal publikasi',
    head: true,
    admin: true,
    staff: true,
    reviewer: false
  },
  {
    key: 'content_approve_publish',
    label: 'Persetujuan & Publikasi Resmi',
    description: 'Mengesahkan draf materi dan menerbitkan ke kanal resmi media sosial',
    head: true,
    admin: true,
    staff: false,
    reviewer: true
  },
  {
    key: 'budget_manage',
    label: 'Kelola Rencana & Realisasi Anggaran',
    description: 'Mengubah alokasi pagu, mengunggah SPJ, dan merevisi baris anggaran',
    head: true,
    admin: true,
    staff: false,
    reviewer: false
  },
  {
    key: 'knowledge_publish',
    label: 'Pengesahan Dokumen SOP & Pedoman',
    description: 'Menyetujui usulan revisi dokumen dan mengarsipkan versi lama',
    head: true,
    admin: false,
    staff: false,
    reviewer: true
  },
  {
    key: 'system_settings_manage',
    label: 'Konfigurasi Sistem & Integrasi NAS/Cloud',
    description: 'Mengatur token API, kredensial penyimpanan DAM, dan manajemen akun',
    head: true,
    admin: true,
    staff: false,
    reviewer: false
  },
  {
    key: 'audit_logs_read',
    label: 'Akses Jejak Audit & Keamanan',
    description: 'Membaca log aktivitas menyeluruh pengguna dan kegagalan autentikasi',
    head: true,
    admin: true,
    staff: false,
    reviewer: false
  }
];

export const mockIntegrations: IntegrationService[] = [
  {
    id: 'dam_nas',
    name: 'DAM Server Lokal (Synology NAS)',
    category: 'storage',
    categoryLabel: 'Penyimpanan Aset Fisik',
    status: 'connected',
    statusLabel: 'Terhubung Normal',
    lastSync: '10 menit yang lalu (Sinkron 1,420 Aset)',
    endpoint: 'smb://192.168.1.200/dam-humas/arsip-media',
    details: 'Penyimpanan berkas mentah foto resolusi tinggi, video 4K B-Roll, dan cadangan offline.',
    authMethod: 'SMBv3 Service Account (dam-agent-srv)'
  },
  {
    id: 'google_workspace',
    name: 'Google Workspace (Drive & Calendar)',
    category: 'cloud',
    categoryLabel: 'Layanan Dokumen & Kalender',
    status: 'connected',
    statusLabel: 'Terhubung Normal',
    lastSync: '5 menit yang lalu (Sinkron 8 Acara)',
    endpoint: 'https://www.googleapis.com/drive/v3/files',
    details: 'Sinkronisasi agenda rilis pers ke Google Calendar Tim Humas dan arsip salinan pers di Google Drive.',
    authMethod: 'OAuth2 Service Account (gsuite-humas-sync@pedulinegeri.iam.gserviceaccount.com)'
  },
  {
    id: 'meta_graph_api',
    name: 'Meta Graph API (Instagram & Facebook)',
    category: 'social',
    categoryLabel: 'Kanal Publikasi Media',
    status: 'connected',
    statusLabel: 'Aktif Terhubung',
    lastSync: '25 menit yang lalu (Sinkron Metrik)',
    endpoint: 'https://graph.facebook.com/v19.0',
    details: 'Penarikan analitik jangkauan, impresi, dan posting terjadwal ke akun @pedulinegeri_id.',
    authMethod: 'Long-lived System User Access Token'
  },
  {
    id: 'telegram_bot',
    name: 'Telegram Bot Notifikasi Darurat',
    category: 'messaging',
    categoryLabel: 'Notifikasi Tim Siaga',
    status: 'warning',
    statusLabel: 'Perlu Perbaruan Webhook',
    lastSync: 'Kemarin, 21:05 WIB',
    endpoint: 'https://api.telegram.org/bot[TOKEN]/setWebhook',
    details: 'Pengiriman sinyal krisis media sosial dan pengingat deadline publikasi siaran pers ke grup koordinator.',
    authMethod: 'Bot Father Token API'
  }
];

export const mockAuditLogs: AuditLogItem[] = [
  {
    id: 'aud-109',
    timestamp: '11 Okt 2026, 20:35 WIB',
    userName: 'Budi Santoso',
    userRole: 'Administrator Teknis',
    action: 'Perbaruan Konfigurasi Integrasi',
    target: 'Google Workspace Service Account Token',
    ipAddress: '192.168.1.45 (Jaringan Kantor)',
    status: 'success'
  },
  {
    id: 'aud-108',
    timestamp: '11 Okt 2026, 19:42 WIB',
    userName: 'Rani Maulida',
    userRole: 'Kepala Bagian Humas',
    action: 'Pengesahan Revisi SOP Humas',
    target: 'SOP-HUMAS-2025-01 (Kanal Krisis)',
    ipAddress: '180.252.16.89 (VPN Eksternal)',
    status: 'success'
  },
  {
    id: 'aud-107',
    timestamp: '11 Okt 2026, 17:15 WIB',
    userName: 'Fauzi Hidayat',
    userRole: 'Editor & Peninjau Akhir',
    action: 'Persetujuan Siaran Pers',
    target: 'Draf-104: Penyaluran Bantuan Air Bersih Gunungkidul',
    ipAddress: '192.168.1.72 (Jaringan Kantor)',
    status: 'success'
  },
  {
    id: 'aud-106',
    timestamp: '11 Okt 2026, 15:10 WIB',
    userName: 'Sistem Otomatis DAM',
    userRole: 'Agen Latar Belakang',
    action: 'Sinkronisasi Folder SMB',
    target: '48 Berkas Foto Dokumentasi Baru Dipindai',
    ipAddress: '192.168.1.200 (Server NAS Lokal)',
    status: 'success'
  },
  {
    id: 'aud-105',
    timestamp: '11 Okt 2026, 13:02 WIB',
    userName: 'Percobaan Masuk Tamu',
    userRole: 'Anonim',
    action: 'Gagal Autentikasi Pengguna',
    target: 'admin.backup@pedulinegeri.org (3x Salah Sandi)',
    ipAddress: '114.124.201.33 (Alamat IP Luar)',
    status: 'failed'
  }
];



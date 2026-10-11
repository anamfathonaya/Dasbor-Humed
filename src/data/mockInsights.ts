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




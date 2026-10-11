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

/**
 * agileTrackerData.ts
 * Universal Agile Kanban & RACI Workflow Data Layer
 * Sinkron dengan Google Spreadsheet Komnas Palestina (01_PROJECT_TRACKER_AGILE)
 * URL: https://docs.google.com/spreadsheets/d/1rfQk1b3ZHQ3kMy4qtSSkkz3OTmpDsEixTqhcTcAUGK8/edit?gid=0#gid=0
 */

export type AgileStatus = 'To Do' | 'In Progress' | 'In Review' | 'Done' | 'Blocked';

export type AgilePriority = 'P0 — Critical' | 'P1 — High' | 'P2 — Medium' | 'P3 — Low';

export type AgileEpic =
  | 'Brand Awareness'
  | 'Human Story'
  | 'Sistem & Dasbor'
  | 'Kelembagaan'
  | 'Komunitas'
  | 'Distribusi Multi-Kanal'
  | 'Trust & Transparansi'
  | 'Campaign'
  | 'Maintaining Website'
  | 'Strategi Humed'
  | 'Lainnya';

export interface AgileTask {
  taskId: string;
  epic: string;
  component: string;
  title: string;
  description: string;
  assignee: string; // Dimas | Hilmiya | Jundi | Rijal | Anam | Iskandar
  status: AgileStatus;
  priority: AgilePriority;
  storyPoints: number;
  startDate?: string;
  dueDate?: string;
  completionDate?: string;
  percentDone: number;
  dependencies?: string;
  labels: string[];
  reviewer?: string;
  notes?: string;
  raciRole?: {
    responsible: string;
    accountable: string;
    consulted: string;
    informed: string;
  };
}

export const INITIAL_AGILE_TASKS: AgileTask[] = [
  {
    taskId: 'KMN-001',
    epic: 'Brand Awareness',
    component: 'Riset & Naskah',
    title: 'Riset Komentar & Pemetaan Trust Gap Audiens',
    description: 'Ekstraksi ratusan sentimen audiens terkait transparansi penyaluran & kondisi terkini Palestina.',
    assignee: 'Dimas',
    status: 'Done',
    priority: 'P3 — Low',
    storyPoints: 5,
    startDate: '2026-10-01',
    dueDate: '2026-10-04',
    completionDate: '2026-10-04',
    percentDone: 100,
    dependencies: '',
    labels: ['riset', 'trust-gap'],
    reviewer: 'Anam (CD)',
    notes: 'Validasi 7 metode riset komentar'
  },
  {
    taskId: 'KMN-049',
    epic: 'Human Story',
    component: 'Naskah dan Caption',
    title: 'Gadis Kecil di Gaza Terjebak Api Akibat Serangan israel',
    description: 'Membuat Teks Lowerthird dan naskah narasi darurat.',
    assignee: 'Dimas',
    status: 'Done',
    priority: 'P2 — Medium',
    storyPoints: 2,
    startDate: '2026-10-16',
    dueDate: '2026-10-16',
    completionDate: '2026-10-16',
    percentDone: 100,
    dependencies: '',
    labels: ['Video', 'reels', 'berita palestina'],
    reviewer: 'Anam (CD)',
    notes: ''
  },
  {
    taskId: 'KMN-027',
    epic: 'Human Story',
    component: 'Riset & Naskah, Desain, Caption',
    title: 'Perampasan Tanah Palestina Sejak Ratusan Tahun',
    description: 'Membuat V-Art Carousel 6 slide sejarah.',
    assignee: 'Dimas',
    status: 'Done',
    priority: 'P2 — Medium',
    storyPoints: 2,
    startDate: '2026-10-12',
    dueDate: '2026-10-13',
    completionDate: '2026-10-12',
    percentDone: 100,
    dependencies: '',
    labels: ['v-art', 'gaza', 'palestina'],
    reviewer: 'Anam (CD)',
    notes: ''
  },
  {
    taskId: 'KMN-002',
    epic: 'Brand Awareness',
    component: 'Riset & Naskah',
    title: "Penyusunan Master Script Big Idea 'Ternyata'",
    description: 'Formula hook-tahan-bukti (0-3s asumsi -> curiosity gap -> pembuktian fakta mitra lapangan).',
    assignee: 'Dimas',
    status: 'Done',
    priority: 'P0 — Critical',
    storyPoints: 8,
    startDate: '2026-10-03',
    dueDate: '2026-10-06',
    completionDate: '2026-10-06',
    percentDone: 100,
    dependencies: 'KMN-001',
    labels: ['naskah', 'script'],
    reviewer: 'Anam (CD)',
    notes: 'Tone hangat meluruskan tanpa menggurui'
  },
  {
    taskId: 'KMN-004',
    epic: 'Brand Awareness',
    component: 'Visual Statis',
    title: 'Desain Carousel Edukasi #1: Realitas di Balik Statistik',
    description: 'Carousel 7 slide, tipografi selingkung Komnas, hierarki visual jelas, slide akhir CTA save/share.',
    assignee: 'Hilmiya',
    status: 'Done',
    priority: 'P1 — High',
    storyPoints: 5,
    startDate: '2026-10-05',
    dueDate: '2026-10-08',
    completionDate: '2026-10-08',
    percentDone: 100,
    dependencies: 'KMN-002',
    labels: ['carousel', 'edukasi'],
    reviewer: 'Anam (CD)',
    notes: 'Gaya selingkung Komnas Palestina'
  },
  {
    taskId: 'KMN-026',
    epic: 'Sistem & Dasbor',
    component: 'Memimpin rapat',
    title: 'Rapat Bidang Humed dan Nakama',
    description: 'Presentasi Nakama terkait medsos Komnas & implementasi sistem.',
    assignee: 'Iskandar',
    status: 'Done',
    priority: 'P1 — High',
    storyPoints: 3,
    startDate: '2026-10-13',
    dueDate: '2026-10-13',
    completionDate: '2026-10-13',
    percentDone: 100,
    dependencies: '',
    labels: ['Rapat', 'Nakama', 'Medsos'],
    reviewer: 'Iskandar (Ketua)',
    notes: ''
  },
  {
    taskId: 'KMN-018',
    epic: 'Kelembagaan',
    component: 'Eksternal & Pers',
    title: 'Rapat Koordinasi BPH dan Ketua Bidang',
    description: 'Monev pencapaian target, to do next dan koordinasi lintas bidang.',
    assignee: 'Iskandar',
    status: 'Done',
    priority: 'P1 — High',
    storyPoints: 3,
    startDate: '2026-10-12',
    dueDate: '2026-10-12',
    completionDate: '2026-10-12',
    percentDone: 100,
    dependencies: '',
    labels: ['Rapat', 'BPH'],
    reviewer: 'Iskandar (Ketua)',
    notes: 'Monev lintas bidang'
  },
  {
    taskId: 'KMN-007',
    epic: 'Kelembagaan',
    component: 'Eksternal & Pers',
    title: 'Penerbitan Siaran Pers Media Nasional Edisi 1',
    description: 'Rilis pernyataan resmi lembaga ke 5 media massa nasional mengenai situasi kemanusiaan.',
    assignee: 'Iskandar',
    status: 'Done',
    priority: 'P2 — Medium',
    storyPoints: 3,
    startDate: '2026-10-06',
    dueDate: '2026-10-10',
    completionDate: '2026-10-10',
    percentDone: 100,
    dependencies: '',
    labels: ['press-release', 'crm'],
    reviewer: 'Iskandar (Ketua)',
    notes: 'Tercapai liputan di 5 media'
  },
  {
    taskId: 'KMN-008',
    epic: 'Human Story',
    component: 'Riset & Naskah',
    title: 'Penyusunan Script Seri Profil Tenaga Medis Lapangan',
    description: 'Kisah human-to-human perjuangan dokter relawan mitra Komnas di tenda darurat Gaza.',
    assignee: 'Dimas',
    status: 'In Progress',
    priority: 'P1 — High',
    storyPoints: 5,
    startDate: '2026-10-11',
    dueDate: '2026-10-23',
    percentDone: 50,
    dependencies: '',
    labels: ['human-story', 'script'],
    reviewer: 'Anam (CD)',
    notes: 'Wawancara sumber primer mitra Gaza'
  },
  {
    taskId: 'KMN-009',
    epic: 'Human Story',
    component: 'Produksi Video',
    title: 'TOG (Tears Of Gaza) versi baru',
    description: 'Video naratif emosional untuk kebutuhan acara edukasi publik dan gala kemanusiaan.',
    assignee: 'Jundi',
    status: 'In Progress',
    priority: 'P2 — Medium',
    storyPoints: 2,
    startDate: '2026-10-14',
    dueDate: '2026-10-22',
    percentDone: 50,
    dependencies: 'KMN-008',
    labels: ['video', 'tog'],
    reviewer: 'Anam (CD)',
    notes: ''
  },
  {
    taskId: 'KMN-013',
    epic: 'Kelembagaan',
    component: 'Visual Statis',
    title: 'Desain Merchandise & Tools Program Mitra Acara',
    description: 'Pemenuhan kebutuhan non-sosmed: flyer acara kolaborasi wilayah, proposal lembaga, dan standee.',
    assignee: 'Hilmiya',
    status: 'In Progress',
    priority: 'P2 — Medium',
    storyPoints: 5,
    startDate: '2026-10-12',
    dueDate: '2026-10-20',
    percentDone: 50,
    dependencies: '',
    labels: ['desain', 'merchandise', 'flyer'],
    reviewer: 'Iskandar (Ketua)',
    notes: 'Request eksternal form SOP'
  },
  {
    taskId: 'KMN-014',
    epic: 'Komunitas',
    component: 'Riset & Naskah',
    title: 'Script Konten Kolaborasi Bersama Komunitas Satu Arah',
    description: 'Naskah edukasi interaktif isu boikot & ajakan kepedulian bersama duta muda Satu Arah.',
    assignee: 'Dimas',
    status: 'To Do',
    priority: 'P2 — Medium',
    storyPoints: 5,
    startDate: '2026-10-19',
    dueDate: '2026-10-24',
    percentDone: 0,
    dependencies: '',
    labels: ['komunitas', 'naskah'],
    reviewer: 'Anam (CD)',
    notes: 'Sinergi winning content Satu Arah'
  },
  {
    taskId: 'KMN-050',
    epic: 'Human Story',
    component: 'Produksi Video',
    title: 'Reels Kabar Palestina',
    description: 'Video ringkasan berita terverifikasi situasi terkini Rafah dan Tepi Barat.',
    assignee: 'Jundi',
    status: 'Done',
    priority: 'P2 — Medium',
    storyPoints: 2,
    startDate: '2026-10-16',
    dueDate: '2026-10-16',
    completionDate: '2026-10-16',
    percentDone: 100,
    dependencies: '',
    labels: ['reels', 'video'],
    reviewer: 'Anam (CD)',
    notes: ''
  },
  {
    taskId: 'KMN-015',
    epic: 'Human Story',
    component: 'Produksi Video',
    title: 'Produksi Video Shorts TOG mini',
    description: 'Versi vertikal 60 detik Tears of Gaza sesuai request BPH untuk kampanye cepat.',
    assignee: 'Jundi',
    status: 'Done',
    priority: 'P1 — High',
    storyPoints: 2,
    startDate: '2026-10-08',
    dueDate: '2026-10-08',
    completionDate: '2026-10-08',
    percentDone: 100,
    dependencies: 'KMN-014',
    labels: ['video', 'shorts'],
    reviewer: 'Anam (CD)',
    notes: 'Request BPH'
  },
  {
    taskId: 'KMN-016',
    epic: 'Brand Awareness',
    component: 'Visual Statis',
    title: 'Desain V-Art Edisi Khusus Jumat Berkah',
    description: 'Visual poster pengingat doa dan aksi solidaritas pekanan Komnas Palestina.',
    assignee: 'Hilmiya',
    status: 'In Review',
    priority: 'P3 — Low',
    storyPoints: 2,
    startDate: '2026-10-17',
    dueDate: '2026-10-18',
    percentDone: 80,
    dependencies: '',
    labels: ['v-art', 'socmed'],
    reviewer: 'Anam (CD)',
    notes: 'Jadwal rutin Jumat pagi'
  },
  {
    taskId: 'KMN-017',
    epic: 'Distribusi Multi-Kanal',
    component: 'Publishing & Socmed',
    title: 'Publish konten v-art update',
    description: 'Mengunggah 2 konten v-art update Palestina ke semua kanal medsos (WA, IG, Tiktok, X, Threads, FB, Telegram).',
    assignee: 'Rijal',
    status: 'Done',
    priority: 'P2 — Medium',
    storyPoints: 3,
    startDate: '2026-10-15',
    dueDate: '2026-10-15',
    completionDate: '2026-10-15',
    percentDone: 100,
    dependencies: '',
    labels: ['socmed', 'publishing'],
    reviewer: 'Iskandar (Ketua)',
    notes: 'Jam kerja resmi Komnas'
  },
  {
    taskId: 'KMN-019',
    epic: 'Trust & Transparansi',
    component: 'Riset & Naskah',
    title: 'Naskah Story Arc: Bukti Sampai ke Tangan Korban',
    description: 'Storytelling pembuktian transparansi pengiriman logistik medis & pangan ke tenda pengungsi.',
    assignee: 'Dimas',
    status: 'Blocked',
    priority: 'P1 — High',
    storyPoints: 8,
    startDate: '2026-10-16',
    dueDate: '2026-10-22',
    percentDone: 20,
    dependencies: '',
    labels: ['transparansi', 'naskah'],
    reviewer: 'Anam (CD)',
    notes: 'Menunggu kiriman video tanda terima resmi dari mitra lapangan'
  },
  {
    taskId: 'KMN-020',
    epic: 'Human Story',
    component: 'Produksi Video',
    title: 'Produksi Video Before After 3 years Genocide',
    description: 'Penyusunan video sebelum dan setelah genosida sejak 7 Oktober 2023, request BPH.',
    assignee: 'Jundi',
    status: 'Done',
    priority: 'P1 — High',
    storyPoints: 2,
    startDate: '2026-10-08',
    dueDate: '2026-10-09',
    completionDate: '2026-10-09',
    percentDone: 100,
    dependencies: 'KMN-019',
    labels: ['video', 'sejarah'],
    reviewer: 'Anam (CD)',
    notes: 'Footage orisinal doksli'
  },
  {
    taskId: 'KMN-021',
    epic: 'Distribusi Multi-Kanal',
    component: 'Publishing & Socmed',
    title: 'Publish khutbah jumat',
    description: 'Mengunggah file khutbah jumat ke WA di grup jabir, grup wilayah, saluran, dan komunitas mitra masjid.',
    assignee: 'Rijal',
    status: 'Done',
    priority: 'P2 — Medium',
    storyPoints: 2,
    startDate: '2026-10-15',
    dueDate: '2026-10-15',
    completionDate: '2026-10-15',
    percentDone: 100,
    dependencies: '',
    labels: ['socmed', 'khutbah'],
    reviewer: 'Iskandar (Ketua)',
    notes: 'Jam resmi Komnas'
  },
  {
    taskId: 'KMN-023',
    epic: 'Kelembagaan',
    component: 'Visual Statis',
    title: 'Desain Plakat Apresiasi Tokoh & Mitra',
    description: '3 alternatif desain plakat resmi Komnas Palestina untuk tokoh nasional dan mitra kolaborator.',
    assignee: 'Hilmiya',
    status: 'In Progress',
    priority: 'P1 — High',
    storyPoints: 3,
    startDate: '2026-10-14',
    dueDate: '2026-10-21',
    percentDone: 50,
    dependencies: '',
    labels: ['desain', 'plakat', 'kelembagaan'],
    reviewer: 'Iskandar (Ketua)',
    notes: '3 desain varian akrilik & kayu'
  },
  {
    taskId: 'KMN-024',
    epic: 'Distribusi Multi-Kanal',
    component: 'Publishing & Socmed',
    title: 'Create Channel WA Khutbah Jumat',
    description: 'Membuat channel WA khusus untuk informasi khutbah jumat & sebaran naskah edukasi.',
    assignee: 'Rijal',
    status: 'Done',
    priority: 'P2 — Medium',
    storyPoints: 2,
    startDate: '2026-10-15',
    dueDate: '2026-10-15',
    completionDate: '2026-10-15',
    percentDone: 100,
    dependencies: '',
    labels: ['socmed', 'wa-channel'],
    reviewer: 'Anam (CD)',
    notes: 'Jam resmi Komnas'
  },
  {
    taskId: 'KMN-025',
    epic: 'Kelembagaan',
    component: 'Dokumentasi',
    title: 'Operator Kamera TFT Bipeka',
    description: 'Operator kamera live untuk sesi Zoom Training for Trainer (TFT) bidang Bipeka.',
    assignee: 'Jundi',
    status: 'Blocked',
    priority: 'P2 — Medium',
    storyPoints: 2,
    startDate: '2026-10-17',
    dueDate: '2026-10-17',
    percentDone: 20,
    dependencies: '',
    labels: ['dokumentasi', 'tft', 'kamera'],
    reviewer: 'Iskandar (Ketua)',
    notes: 'Terkendala kabel HDMI capture card di studio mini'
  },
  {
    taskId: 'KMN-028',
    epic: 'Human Story',
    component: 'Riset & Naskah, Desain, Caption',
    title: 'Kehancuran Gaza Setara Enam Bom Nuklir',
    description: 'Visual Art Carousel komparasi data kerusakan infrastruktur dan residu genosida.',
    assignee: 'Dimas',
    status: 'Done',
    priority: 'P2 — Medium',
    storyPoints: 2,
    startDate: '2026-10-12',
    dueDate: '2026-10-13',
    completionDate: '2026-10-12',
    percentDone: 100,
    dependencies: '',
    labels: ['v-art', 'gaza', 'palestina'],
    reviewer: 'Anam (CD)',
    notes: ''
  },
  {
    taskId: 'KMN-029',
    epic: 'Sistem & Dasbor',
    component: 'Tutorial & Konfigurasi',
    title: 'Buat Project Tracker dan Kanban Board',
    description: 'Membangun tracker keterbacaan workflow dan menghindari bottleneck tim Humed.',
    assignee: 'Anam',
    status: 'Done',
    priority: 'P2 — Medium',
    storyPoints: 3,
    startDate: '2026-10-09',
    dueDate: '2026-10-15',
    completionDate: '2026-10-15',
    percentDone: 100,
    dependencies: '',
    labels: ['dasbor', 'sistem', 'workflow', 'tim'],
    reviewer: 'Iskandar (Ketua)',
    notes: ''
  },
  {
    taskId: 'KMN-030',
    epic: 'Human Story',
    component: 'Riset & Naskah',
    title: 'Yellow Line israel: Batas Ambang Pengusiran Warga',
    description: 'Riset taktis batas demarcasi zona kuning yang menekan populasi sipil di Khan Younis.',
    assignee: 'Dimas',
    status: 'To Do',
    priority: 'P2 — Medium',
    storyPoints: 3,
    startDate: '2026-10-20',
    dueDate: '2026-10-23',
    percentDone: 0,
    dependencies: '',
    labels: ['v-art', 'riset'],
    reviewer: 'Anam (CD)',
    notes: ''
  },
  {
    taskId: 'KMN-031',
    epic: 'Human Story',
    component: 'Riset & Naskah, Desain, Caption',
    title: 'Yellow Line israel Semakin Desak Warga Palestina ke Arah Laut',
    description: 'Membuat V-Art Carousel visualisasi peta satelit dorongan pengungsi.',
    assignee: 'Dimas',
    status: 'Done',
    priority: 'P2 — Medium',
    storyPoints: 2,
    startDate: '2026-10-13',
    dueDate: '2026-10-14',
    completionDate: '2026-10-12',
    percentDone: 100,
    dependencies: '',
    labels: ['v-art', 'gaza', 'palestina'],
    reviewer: 'Anam (CD)',
    notes: ''
  },
  {
    taskId: 'KMN-032',
    epic: 'Human Story',
    component: 'Riset & Naskah, Desain, Caption',
    title: 'Tepi Barat Jadi Sasaran Zionis israel',
    description: 'Membuat V-Art Carousel eskalasi serangan di Jenin, Nablus, dan Tulkarm.',
    assignee: 'Dimas',
    status: 'Done',
    priority: 'P2 — Medium',
    storyPoints: 2,
    startDate: '2026-10-14',
    dueDate: '2026-10-15',
    completionDate: '2026-10-15',
    percentDone: 100,
    dependencies: '',
    labels: ['v-art', 'tepi-barat'],
    reviewer: 'Anam (CD)',
    notes: ''
  },
  {
    taskId: 'KMN-033',
    epic: 'Campaign',
    component: 'Konsep & Copywriting',
    title: 'Winter Aid For Palestine set Campaign',
    description: 'Rancangan paket kampanye musim dingin: selimut hangat, pakaian termal, bahan bakar tenda.',
    assignee: 'Dimas',
    status: 'To Do',
    priority: 'P2 — Medium',
    storyPoints: 3,
    startDate: '2026-10-20',
    dueDate: '2026-10-25',
    percentDone: 0,
    dependencies: '',
    labels: ['campaign', 'winter-aid'],
    reviewer: 'Anam (CD)',
    notes: ''
  },
  {
    taskId: 'KMN-034',
    epic: 'Campaign',
    component: 'Desain',
    title: 'Winter Aid For Palestine V-Art',
    description: 'Membuat V-Art Program Musim Dingin dan visual kebutuhan logistik darurat.',
    assignee: 'Hilmiya',
    status: 'Done',
    priority: 'P2 — Medium',
    storyPoints: 2,
    startDate: '2026-10-14',
    dueDate: '2026-10-14',
    completionDate: '2026-10-14',
    percentDone: 100,
    dependencies: '',
    labels: ['program', 'winter'],
    reviewer: 'Anam (CD)',
    notes: ''
  },
  {
    taskId: 'KMN-035',
    epic: 'Human Story',
    component: 'Naskah, Desain, Caption',
    title: 'Pemukim Ilegal israel Bakar Masjid dan Kendaraan Warga Palestina',
    description: 'Membuat V-Art Carousel liputan kekerasan ekstrem pemukim di desa Jit dan Qaryut.',
    assignee: 'Dimas',
    status: 'Done',
    priority: 'P2 — Medium',
    storyPoints: 2,
    startDate: '2026-10-15',
    dueDate: '2026-10-15',
    completionDate: '2026-10-15',
    percentDone: 100,
    dependencies: '',
    labels: ['v-art', 'tepi-barat'],
    reviewer: 'Anam (CD)',
    notes: ''
  },
  {
    taskId: 'KMN-036',
    epic: 'Kelembagaan',
    component: 'Desain',
    title: 'Training for Trainer Banner & Flyer',
    description: 'Membuat V-Art Program Bidang Bipeka dan materi sosialisasi materi kaderisasi.',
    assignee: 'Hilmiya',
    status: 'Done',
    priority: 'P2 — Medium',
    storyPoints: 2,
    startDate: '2026-10-13',
    dueDate: '2026-10-14',
    completionDate: '2026-10-14',
    percentDone: 100,
    dependencies: '',
    labels: ['v-art', 'internal', 'bipeka'],
    reviewer: 'Iskandar (Ketua)',
    notes: ''
  },
  {
    taskId: 'KMN-037',
    epic: 'Brand Awareness',
    component: 'Desain, Caption',
    title: 'Seporsi Kemenangan Warga Palestina',
    description: 'Membuat V-Art Carousel potret dapur umum mitra Komnas yang memasak di tengah reruntuhan.',
    assignee: 'Dimas',
    status: 'In Progress',
    priority: 'P2 — Medium',
    storyPoints: 2,
    startDate: '2026-10-15',
    dueDate: '2026-10-21',
    percentDone: 50,
    dependencies: '',
    labels: ['v-art', 'penyaluran'],
    reviewer: 'Anam (CD)',
    notes: ''
  },
  {
    taskId: 'KMN-038',
    epic: 'Kelembagaan',
    component: 'Koordinasi Antar-Bidang',
    title: 'Konsultasi Bidang Keuangan untuk Kebutuhan Urgent Media',
    description: 'Konsultasi dengan bidang keuangan terkait anggaran kebutuhan barang media (SSD eksternal, mic wireless, perpanjangan lisensi).',
    assignee: 'Rijal',
    status: 'Done',
    priority: 'P2 — Medium',
    storyPoints: 2,
    startDate: '2026-10-15',
    dueDate: '2026-10-15',
    completionDate: '2026-10-15',
    percentDone: 100,
    dependencies: '',
    labels: ['keuangan', 'inventaris'],
    reviewer: 'Iskandar (Ketua)',
    notes: 'Disetujui pencairan dana darurat studio'
  },
  {
    taskId: 'KMN-039',
    epic: 'Kelembagaan',
    component: 'Operator Zoom',
    title: 'Operator Zoom TFT Bidang Bipeka',
    description: 'Operator zoom untuk acara TFT bidang Bipeka, manajemen breakout room dan spotlighting pemateri.',
    assignee: 'Rijal',
    status: 'Done',
    priority: 'P2 — Medium',
    storyPoints: 2,
    startDate: '2026-10-17',
    dueDate: '2026-10-17',
    completionDate: '2026-10-17',
    percentDone: 100,
    dependencies: '',
    labels: ['zoom', 'tft'],
    reviewer: 'Iskandar (Ketua)',
    notes: 'Selesai lancar 3 sesi'
  },
  {
    taskId: 'KMN-040',
    epic: 'Sistem & Dasbor',
    component: 'Programming',
    title: 'Buat Dasbor Interaktif Tim Humed',
    description: 'Project tracker tersinkronisasi, insight medsos multi-channel, metriks website, meta pixel, hasil konversi web donasi, knowledge base, kalender konten, status RAB/LRA, dan RSS berita.',
    assignee: 'Anam',
    status: 'In Progress',
    priority: 'P2 — Medium',
    storyPoints: 8,
    startDate: '2026-10-10',
    dueDate: '2026-10-24',
    percentDone: 70,
    dependencies: 'KMN-029',
    labels: ['dasbor', 'sistem', 'workflow', 'tim'],
    reviewer: 'Iskandar (Ketua)',
    notes: 'Fase CI/CD dan sinkronisasi Universal Kanban selesai'
  },
  {
    taskId: 'KMN-043',
    epic: 'Kelembagaan',
    component: 'Kalender & Freelancer',
    title: 'Finalisasi Desain Kalender Pra-Cetak 2027',
    description: 'Perantara komunikasi antara Ariffa (PJ kalender) dengan Iqbal (desainer freelance) untuk finalisasi layout & approval BPH.',
    assignee: 'Anam',
    status: 'Done',
    priority: 'P2 — Medium',
    storyPoints: 3,
    startDate: '2026-10-12',
    dueDate: '2026-10-16',
    completionDate: '2026-10-15',
    percentDone: 100,
    dependencies: '',
    labels: ['kalender', 'cetak', 'bph'],
    reviewer: 'Iskandar (Ketua)',
    notes: 'File master siap masuk percetakan'
  },
  {
    taskId: 'KMN-041',
    epic: 'Sistem & Dasbor',
    component: 'SOP & Workflow',
    title: 'Matriks RACI dan Diagram Alur Tim Humed',
    description: 'Penyusunan matriks RACI (Iskandar, Anam, Dimas, Hilmiya, Jundi, Rijal) dan diagram alur kerja sesuai rekomendasi konsultan Nakama.',
    assignee: 'Anam',
    status: 'Done',
    priority: 'P2 — Medium',
    storyPoints: 3,
    startDate: '2026-10-13',
    dueDate: '2026-10-15',
    completionDate: '2026-10-16',
    percentDone: 100,
    dependencies: '',
    labels: ['raci', 'sop', 'workflow'],
    reviewer: 'Iskandar (Ketua)',
    notes: 'Final disetujui BPH dan Ketua Bidang'
  },
  {
    taskId: 'KMN-042',
    epic: 'Maintaining Website',
    component: 'Elementor, Wordpress',
    title: 'Buat Menu Website dan Template Khutbah Jumat Palestina',
    description: 'Template unduhan berkas PDF & panduan khutbah untuk giat edukasi kepalestinaan rutin di masjid-masjid dan mitra donatur loyalis.',
    assignee: 'Anam',
    status: 'Done',
    priority: 'P2 — Medium',
    storyPoints: 3,
    startDate: '2026-10-15',
    dueDate: '2026-10-15',
    completionDate: '2026-10-15',
    percentDone: 100,
    dependencies: '',
    labels: ['khutbah', 'website', 'elementor'],
    reviewer: 'Iskandar (Ketua)',
    notes: 'Konfigurasi ACF dan Jegkit Element selesai'
  },
  {
    taskId: 'KMN-047',
    epic: 'Kelembagaan',
    component: 'Operasional',
    title: 'Mempersiapkan Setup Meeting BPH dengan Wilayah',
    description: 'Koordinasi teknis perangkat rapat, audio, link Zoom, dan delegasi teknis streaming ke Jundi.',
    assignee: 'Anam',
    status: 'Done',
    priority: 'P2 — Medium',
    storyPoints: 3,
    startDate: '2026-10-14',
    dueDate: '2026-10-14',
    completionDate: '2026-10-14',
    percentDone: 100,
    dependencies: '',
    labels: ['bph', 'bidang', 'lembaga'],
    reviewer: 'Iskandar (Ketua)',
    notes: ''
  },
  {
    taskId: 'KMN-044',
    epic: 'Sistem & Dasbor',
    component: 'Evaluasi Strategis',
    title: 'Mengikuti Sesi Presentasi Strategi Rancangan Nakama',
    description: 'Presentasi hasil riset konsultan Nakama bersama full tim humed, perwakilan Penyaluran, Fundraising, dan 2 personil BPH.',
    assignee: 'Anam',
    status: 'Done',
    priority: 'P1 — High',
    storyPoints: 5,
    startDate: '2026-10-12',
    dueDate: '2026-10-12',
    completionDate: '2026-10-12',
    percentDone: 100,
    dependencies: '',
    labels: ['nakama', 'strategi'],
    reviewer: 'Iskandar (Ketua)',
    notes: 'Sesi berlangsung pukul 13.30 - 15.30'
  },
  {
    taskId: 'KMN-045',
    epic: 'Strategi Humed',
    component: 'Riset, Pendalaman Visi',
    title: 'Mind Mapping Visi Lembaga dengan BPH untuk Second Brain',
    description: 'Pendalaman arah komunikasi jangka panjang Komnas Palestina, positioning kelembagaan, dan pemodelan knowledge base.',
    assignee: 'Anam',
    status: 'To Do',
    priority: 'P2 — Medium',
    storyPoints: 3,
    startDate: '2026-10-19',
    dueDate: '2026-10-21',
    percentDone: 0,
    dependencies: '',
    labels: ['bph', 'visi', 'strategi'],
    reviewer: 'Iskandar (Ketua)',
    notes: ''
  },
  {
    taskId: 'KMN-046',
    epic: 'Kelembagaan',
    component: 'Website & CRM',
    title: 'Input Menu FAQ di Website',
    description: 'FAQ resmi untuk menjawab pertanyaan berulang di CRM WhatsApp, kunjungan tatap muka, dan direct message medsos.',
    assignee: 'Anam',
    status: 'Done',
    priority: 'P3 — Low',
    storyPoints: 3,
    startDate: '2026-10-09',
    dueDate: '2026-10-13',
    completionDate: '2026-10-15',
    percentDone: 100,
    dependencies: '',
    labels: ['crm', 'website', 'faq'],
    reviewer: 'Iskandar (Ketua)',
    notes: 'Meringankan beban tim CRM sebesar 30%'
  },
  {
    taskId: 'KMN-048',
    epic: 'Strategi Humed',
    component: 'Implementasi & Action Plan',
    title: 'Monev Pasca Presentasi & Follow-Up Strategi Nakama',
    description: 'Menyerahkan workflow & SOP berjalan, akses tools project tracker, dan daftar pertanyaan BPH sebagai second brain visi.',
    assignee: 'Anam',
    status: 'In Progress',
    priority: 'P1 — High',
    storyPoints: 3,
    startDate: '2026-10-13',
    dueDate: '2026-10-20',
    percentDone: 75,
    dependencies: 'KMN-044',
    labels: ['nakama', 'konsultan', 'strategi'],
    reviewer: 'Iskandar (Ketua)',
    notes: 'Akses tracker telah dibagikan'
  },
  {
    taskId: 'KMN-051',
    epic: 'Distribusi Multi-Kanal',
    component: 'Publishing & Socmed',
    title: "Publish Konten Jum'at Berkah Pekanan",
    description: "Mengunggah 2 konten v-art Jum'at Berkah ke semua kanal medsos (WA, IG, Tiktok, X, Threads, FB, Telegram).",
    assignee: 'Rijal',
    status: 'Done',
    priority: 'P2 — Medium',
    storyPoints: 2,
    startDate: '2026-10-16',
    dueDate: '2026-10-16',
    completionDate: '2026-10-16',
    percentDone: 100,
    dependencies: '',
    labels: ['socmed', 'jumat-berkah'],
    reviewer: 'Anam (CD)',
    notes: 'Pekan depan diedit captionnya dan diupload Kamis sore'
  },
  {
    taskId: 'KMN-052',
    epic: 'Distribusi Multi-Kanal',
    component: 'Publishing & Socmed',
    title: 'Publish Flyer Aksi Bela Palestina',
    description: 'Publish flyer aksi solidaritas Palestina 18 Oktober 2026 serentak di IG, TikTok, X, Threads, dan FB.',
    assignee: 'Rijal',
    status: 'Done',
    priority: 'P2 — Medium',
    storyPoints: 2,
    startDate: '2026-10-16',
    dueDate: '2026-10-16',
    completionDate: '2026-10-16',
    percentDone: 100,
    dependencies: '',
    labels: ['socmed', 'aksi-palestina'],
    reviewer: 'Iskandar (Ketua)',
    notes: ''
  },
  {
    taskId: 'KMN-053',
    epic: 'Distribusi Multi-Kanal',
    component: 'Publishing & Socmed',
    title: 'Publish Konten Reels Kabar Palestina',
    description: 'Publish konten video reels kabar terkini ke semua kanal medsos (WA, IG, Tiktok, X, Threads, FB, Telegram).',
    assignee: 'Rijal',
    status: 'Done',
    priority: 'P2 — Medium',
    storyPoints: 2,
    startDate: '2026-10-16',
    dueDate: '2026-10-16',
    completionDate: '2026-10-16',
    percentDone: 100,
    dependencies: 'KMN-050',
    labels: ['socmed', 'reels'],
    reviewer: 'Anam (CD)',
    notes: ''
  },
  {
    taskId: 'KMN-054',
    epic: 'Human Story',
    component: 'Riset & Naskah, Desain, Caption',
    title: 'israel Menawan 2.000 Anak Palestina di Penjara Militer',
    description: 'Desain Carousel 8 slide data pemenjaraan sepihak anak-anak tanpa pengadilan militer sah.',
    assignee: 'Dimas',
    status: 'In Progress',
    priority: 'P2 — Medium',
    storyPoints: 2,
    startDate: '2026-10-16',
    dueDate: '2026-10-21',
    percentDone: 50,
    dependencies: '',
    labels: ['v-art', 'carousel', 'anak-palestina'],
    reviewer: 'Anam (CD)',
    notes: 'Tahap finalisasi slide 6-8'
  },
  {
    taskId: 'KMN-055',
    epic: 'Komunitas',
    component: 'Operator Zoom',
    title: 'Operator Zoom Kegiatan TFT Sesi 2',
    description: 'Operator zoom kegiatan Training for Trainer (TFT) sesi lanjutan materi kepalestinaan.',
    assignee: 'Jundi',
    status: 'Done',
    priority: 'P2 — Medium',
    storyPoints: 2,
    startDate: '2026-10-17',
    dueDate: '2026-10-17',
    completionDate: '2026-10-17',
    percentDone: 100,
    dependencies: '',
    labels: ['tft', 'zoom'],
    reviewer: 'Iskandar (Ketua)',
    notes: 'Recording telah diunggah ke Google Drive'
  },
  {
    taskId: 'KMN-056',
    epic: 'Human Story',
    component: 'Riset & Naskah, Desain, Caption',
    title: 'israel Merusak Ribuan Pohon Zaitun Siap Panen',
    description: 'Desain V-Art Carousel serangan pemukim atas ladang zaitun petani Tepi Barat.',
    assignee: 'Dimas',
    status: 'In Progress',
    priority: 'P2 — Medium',
    storyPoints: 2,
    startDate: '2026-10-19',
    dueDate: '2026-10-22',
    percentDone: 50,
    dependencies: '',
    labels: ['carousel', 'v-art', 'zaitun'],
    reviewer: 'Anam (CD)',
    notes: ''
  }
];

const LOCAL_STORAGE_KEY = 'komnas_palestina_agile_tracker_tasks';

/**
 * Mengambil daftar seluruh kartu tugas dari LocalStorage (jika ada editan) atau default seed.
 */
export function getStoredAgileTasks(): AgileTask[] {
  if (typeof window === 'undefined') {
    return INITIAL_AGILE_TASKS;
  }
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Gagal membaca data tugas lokal:', err);
  }
  return INITIAL_AGILE_TASKS;
}

/**
 * Menyimpan pembaruan daftar tugas ke LocalStorage
 */
export function saveAgileTasksToStorage(tasks: AgileTask[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error('Gagal menyimpan tugas ke LocalStorage:', err);
  }
}

/**
 * Reset data tugas kembali ke dataset awal spreadsheet
 */
export function resetAgileTasksToDefault(): AgileTask[] {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }
  return INITIAL_AGILE_TASKS;
}

/**
 * Mengambil CSV langsung dari Google Sheets (gid=0)
 */
export async function syncFromGoogleSheets(): Promise<{ success: boolean; tasks?: AgileTask[]; message: string }> {
  const SHEET_CSV_URL =
    'https://docs.google.com/spreadsheets/d/1rfQk1b3ZHQ3kMy4qtSSkkz3OTmpDsEixTqhcTcAUGK8/export?format=csv&gid=0';

  try {
    const res = await fetch(SHEET_CSV_URL, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Google Sheets mengembalikan status ${res.status}`);
    }
    const csvText = await res.text();
    const lines = csvText.split('\n').filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      throw new Error('Format CSV tidak memuat baris data yang cukup.');
    }

    // Parse CSV secara aman sederhana
    const parsedTasks: AgileTask[] = [];
    for (let i = 1; i < lines.length; i++) {
      const row = parseCsvRow(lines[i]);
      if (!row || row.length < 5) continue;

      const [
        taskId,
        epic,
        component,
        title,
        description,
        assignee,
        statusStr,
        priorityStr,
        spStr,
        startDate,
        dueDate,
        compDate,
        pctStr,
        dependencies,
        labelsStr,
        reviewer,
        notes
      ] = row;

      if (!taskId || !title) continue;

      let status: AgileStatus = 'To Do';
      if (statusStr === 'Done') status = 'Done';
      else if (statusStr === 'In Progress') status = 'In Progress';
      else if (statusStr === 'In Review') status = 'In Review';
      else if (statusStr === 'Blocked') status = 'Blocked';

      let priority: AgilePriority = 'P2 — Medium';
      if (priorityStr?.includes('P0')) priority = 'P0 — Critical';
      else if (priorityStr?.includes('P1')) priority = 'P1 — High';
      else if (priorityStr?.includes('P3')) priority = 'P3 — Low';

      const storyPoints = parseInt(spStr || '2', 10) || 2;
      const percentDone = parseInt((pctStr || '0').replace('%', ''), 10) || 0;
      const labels = (labelsStr || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      parsedTasks.push({
        taskId,
        epic: epic || 'Umum',
        component: component || 'Produksi',
        title,
        description: description || '',
        assignee: assignee || 'Belum Ditugaskan',
        status,
        priority,
        storyPoints,
        startDate: startDate || '',
        dueDate: dueDate || '',
        completionDate: compDate || '',
        percentDone,
        dependencies: dependencies || '',
        labels,
        reviewer: reviewer || '',
        notes: notes || ''
      });
    }

    if (parsedTasks.length > 0) {
      saveAgileTasksToStorage(parsedTasks);
      return {
        success: true,
        tasks: parsedTasks,
        message: `Berhasil menyinkronkan ${parsedTasks.length} tugas langsung dari Google Sheets Komnas Palestina!`
      };
    }

    return {
      success: false,
      message: 'Gagal mengekstrak baris data dari Google Sheets.'
    };
  } catch (err: any) {
    console.warn('Sinkronisasi remote gagal, mempertahankan data lokal:', err);
    return {
      success: false,
      message: `Sinkronisasi gagal: ${err.message || 'Koneksi ke Google Sheets terganggu'}`
    };
  }
}

/**
 * Parser baris CSV yang menangani quotes dan koma dalam teks
 */
function parseCsvRow(row: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (char === '"') {
      if (inQuotes && row[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

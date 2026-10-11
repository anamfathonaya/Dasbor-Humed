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


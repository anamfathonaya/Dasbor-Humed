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

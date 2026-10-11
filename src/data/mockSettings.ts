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

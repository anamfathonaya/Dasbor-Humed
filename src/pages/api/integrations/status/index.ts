import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../../lib/db';
import { getUserRole } from '../../../../lib/auth';

initDatabase();

// GET: Status seluruh sambungan eksternal + diagnostik pesan perbaikan jika bermasalah
export const GET: APIRoute = async ({ request, url }) => {
  try {
    const role = getUserRole(request, url);

    const integrations = db.prepare(`
      SELECT
        id,
        service_key,
        name,
        category,
        status,
        endpoint,
        last_sync_at,
        last_status_message,
        updated_at
      FROM system_integrations
      ORDER BY id ASC
    `).all() as Array<{
      id: number;
      service_key: string;
      name: string;
      category: string;
      status: string;
      endpoint: string;
      last_sync_at: string;
      last_status_message: string;
      updated_at: string;
    }>;

    // Tambahkan evaluasi status dan panduan langkah perbaikan (troubleshooting guidance)
    const diagnostics = integrations.map((item) => {
      let health = 'healthy';
      let remediation = null;

      if (item.status === 'disconnected') {
        health = 'error';
        if (item.service_key === 'google_workspace') {
          remediation = {
            issue: 'Token otentikasi Google Workspace belum tersambung atau dicabut.',
            stepToFix: 'Klik tombol "Hubungkan Akun Google" untuk melakukan alur OAuth2 consent atau unggah file kunci Service Account JSON yang valid.',
            actionEndpoint: '/api/integrations/google/connect'
          };
        } else if (item.service_key === 'dam_nas') {
          remediation = {
            issue: 'Server penyimpanan DAM NAS tidak terjangkau di subnet lokal.',
            stepToFix: 'Periksa kabel jaringan LAN/Switch kantor, pastikan IP 192.168.1.200 merespons ICMP ping, dan verifikasi status port SMB 445 aktif.',
            actionEndpoint: '/api/integrations/dam/test'
          };
        } else {
          remediation = {
            issue: 'Layanan belum terkonfigurasi.',
            stepToFix: 'Lengkapi kredensial API dan token rahasia pada formulir pengaturan integrasi.',
            actionEndpoint: `/api/integrations/${item.service_key}/reconnect`
          };
        }
      } else if (item.status === 'warning') {
        health = 'warning';
        if (item.service_key === 'telegram_bot') {
          remediation = {
            issue: 'Webhook Telegram bot mengembalikan respon gagal verifikasi SSL.',
            stepToFix: 'Daftarkan ulang URL webhook bot menggunakan sertifikat SSL HTTPS publik yang valid dengan memanggil Telegram setWebhook API.',
            actionEndpoint: '/api/integrations/telegram/reconnect'
          };
        } else {
          remediation = {
            issue: 'Koneksi lambat atau sebagian metrik gagal diselaraskan.',
            stepToFix: 'Lakukan sinkronisasi ulang manual dan periksa kuota rate-limit API penyedia.',
            actionEndpoint: `/api/integrations/${item.service_key}/sync`
          };
        }
      }

      return {
        ...item,
        health,
        remediation
      };
    });

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          total: diagnostics.length,
          connected: diagnostics.filter(d => d.status === 'connected').length,
          warning: diagnostics.filter(d => d.status === 'warning').length,
          disconnected: diagnostics.filter(d => d.status === 'disconnected').length
        },
        integrations: diagnostics
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: 'Gagal memuat status integrasi.', error: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

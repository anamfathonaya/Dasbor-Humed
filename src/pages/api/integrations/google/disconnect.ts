import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../../lib/db';
import { getUserRole } from '../../../../lib/auth';

initDatabase();

// POST: Putuskan sambungan dan cabut token Google SSO
export const POST: APIRoute = async ({ request, url }) => {
  try {
    const role = getUserRole(request, url);

    if (role !== 'head' && role !== 'admin') {
      return new Response(
        JSON.stringify({ success: false, message: 'Akses ditolak: Hanya Ketua Bidang atau Admin yang dapat memutuskan integrasi Google.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Ubah status integrasi menjadi disconnected dan bersihkan token
    db.prepare(`
      UPDATE system_integrations
      SET
        status = 'disconnected',
        config_json = NULL,
        last_status_message = 'Koneksi akun Google SSO diputus oleh administrator pada ' || CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE service_key = 'google_workspace' OR service_key = 'google_account'
    `).run();

    // Catat log audit pemutusan sambungan
    try {
      db.prepare(`
        INSERT INTO audit_logs (user_name, user_role, action, target, ip_address, status, details)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        'Admin/Head Aktif',
        role,
        'Pemutusan Integrasi Akun Google SSO',
        'Pencabutan Token SSO & Google AI Pro',
        request.headers.get('x-forwarded-for') || '127.0.0.1',
        'warning',
        'Sesi Google SSO dan sinkronisasi otomatis Google Drive/Calendar dihentikan sementara'
      );
    } catch {}

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Sambungan Akun Google SSO berhasil diputuskan dan token dicabut.'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: 'Gagal memutuskan sambungan.', error: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

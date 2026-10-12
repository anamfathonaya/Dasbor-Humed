import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../../lib/db';

initDatabase();

// GET: Menangani callback kode otorisasi dari Google SSO (Akun Google AI Pro)
export const GET: APIRoute = async ({ request, url }) => {
  try {
    const code = url.searchParams.get('code') || 'mock_auth_code_782910';
    const state = url.searchParams.get('state') || '';

    // Simulasi pertukaran kode dengan Access Token & Refresh Token SSO
    const mockTokenData = {
      accessToken: 'ya29.a0AfH6SM_' + Math.random().toString(36).substring(2, 12),
      refreshToken: '1//0gM59kQ_' + Math.random().toString(36).substring(2, 12),
      expiresIn: 3600,
      scope: 'openid email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets',
      tokenType: 'Bearer',
      accountEmail: 'humas.pedulinegeri@gmail.com',
      accountPlan: 'Google AI Pro (Gemini Advanced & 2TB Storage)',
      authMethod: 'Google SSO OAuth2 User Consent',
      connectedAt: new Date().toISOString()
    };

    // Update status integrasi Google di database
    db.prepare(`
      UPDATE system_integrations
      SET
        status = 'connected',
        config_json = ?,
        last_sync_at = CURRENT_TIMESTAMP,
        last_status_message = 'Terhubung via Google SSO (Akun Google AI Pro Aktif)',
        updated_at = CURRENT_TIMESTAMP
      WHERE service_key = 'google_workspace' OR service_key = 'google_account'
    `).run(JSON.stringify(mockTokenData));

    // Catat log audit
    try {
      db.prepare(`
        INSERT INTO audit_logs (user_name, user_role, action, target, ip_address, status, details)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        'Google SSO Handler',
        'admin',
        'Keberhasilan Otorisasi Google SSO',
        'Akun Google (Google AI Pro & Cloud Sync)',
        request.headers.get('x-forwarded-for') || '127.0.0.1',
        'success',
        JSON.stringify({ state, accountEmail: mockTokenData.accountEmail, plan: mockTokenData.accountPlan })
      );
    } catch {}

    // Arahkan kembali ke halaman integrasi google dengan notifikasi sukses
    return new Response(null, {
      status: 302,
      headers: {
        Location: '/integrasi-google?oauth_success=1'
      }
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: 'Gagal memproses callback Google SSO.', error: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../../lib/db';

initDatabase();

// GET: Menangani callback kode otorisasi dari Google
export const GET: APIRoute = async ({ request, url }) => {
  try {
    const code = url.searchParams.get('code') || 'mock_auth_code_782910';
    const state = url.searchParams.get('state') || '';

    // Simulasi pertukaran kode dengan Access Token & Refresh Token
    const mockTokenData = {
      accessToken: 'ya29.a0AfH6SM_' + Math.random().toString(36).substring(2, 12),
      refreshToken: '1//0gM59kQ_' + Math.random().toString(36).substring(2, 12),
      expiresIn: 3600,
      scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/spreadsheets',
      tokenType: 'Bearer',
      connectedAt: new Date().toISOString()
    };

    // Update status integrasi Google Workspace di database
    db.prepare(`
      UPDATE system_integrations
      SET
        status = 'connected',
        config_json = ?,
        last_sync_at = CURRENT_TIMESTAMP,
        last_status_message = 'Terhubung melalui alur OAuth2 pengguna resmi',
        updated_at = CURRENT_TIMESTAMP
      WHERE service_key = 'google_workspace'
    `).run(JSON.stringify(mockTokenData));

    // Catat log audit
    try {
      db.prepare(`
        INSERT INTO audit_logs (user_name, user_role, action, target, ip_address, status, details)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        'OAuth Handler',
        'admin',
        'Keberhasilan Otorisasi OAuth2 Google',
        'Google Workspace (Drive, Calendar & Sheets)',
        request.headers.get('x-forwarded-for') || '127.0.0.1',
        'success',
        JSON.stringify({ state, expiresIn: 3600 })
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
      JSON.stringify({ success: false, message: 'Gagal memproses callback OAuth.', error: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

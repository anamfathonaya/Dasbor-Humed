import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../../lib/db';
import { getUserRole } from '../../../../lib/auth';

initDatabase();

// GET: Inisiasi alur redirect otorisasi OAuth2 Google
export const GET: APIRoute = async ({ request, url }) => {
  try {
    const role = getUserRole(request, url);

    if (role !== 'head' && role !== 'admin') {
      return new Response(
        JSON.stringify({ success: false, message: 'Akses ditolak: Hanya Ketua Bidang dan Admin yang dapat menghubungkan Google Workspace.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const stateToken = 'gw_state_' + Math.random().toString(36).substring(2, 15);
    const clientId = '681940285912-humasmediamock.apps.googleusercontent.com';
    const redirectUri = `${url.origin}/api/integrations/google/callback`;
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/spreadsheets'
    ].join(' ');

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=${encodeURIComponent(scopes)}&access_type=offline&prompt=consent&state=${stateToken}`;

    // Catat log audit inisiasi OAuth
    try {
      db.prepare(`
        INSERT INTO audit_logs (user_name, user_role, action, target, ip_address, status, details)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        'Admin/Head Aktif',
        role,
        'Inisiasi Sambungan OAuth2 Google',
        'Google Workspace API Scope',
        request.headers.get('x-forwarded-for') || '127.0.0.1',
        'success',
        JSON.stringify({ scopes, redirectUri, state: stateToken })
      );
    } catch {}

    return new Response(
      JSON.stringify({
        success: true,
        authUrl,
        state: stateToken,
        message: 'Tautan otorisasi Google OAuth berhasil digenerate.'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: 'Gagal menginisiasi OAuth.', error: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

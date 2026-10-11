import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../lib/db';

initDatabase();

export const POST: APIRoute = async ({ request }) => {
  try {
    const roleCookie = request.headers.get('cookie')?.match(/user_role=([a-zA-Z]+)/);
    const activeRole = roleCookie ? roleCookie[1] : 'unknown';

    // Catat log keluar sesi
    try {
      db.prepare(`
        INSERT INTO audit_logs (user_name, user_role, action, target, ip_address, status, details)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        'Pengguna Sesi Aktif',
        activeRole,
        'Keluar Sesi Sistem',
        'Penghapusan Cookie Sesi Pengguna',
        request.headers.get('x-forwarded-for') || '127.0.0.1',
        'success',
        'Pengguna mengakhiri sesi kerja dasbor'
      );
    } catch {}

    const headers = new Headers({
      'Content-Type': 'application/json',
      'Set-Cookie': `user_role=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Sesi berhasil diakhiri.'
      }),
      { status: 200, headers }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: 'Gagal keluar sesi.', error: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

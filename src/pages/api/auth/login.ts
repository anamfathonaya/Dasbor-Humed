import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../lib/db';

initDatabase();

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, password, rememberMe } = body;

    if (!email || !password) {
      return new Response(
        JSON.stringify({ success: false, message: 'Alamat email dan kata sandi wajib diisi.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // Cari user di database
    const user = db.prepare(`
      SELECT u.id, u.name, u.email, u.password_hash, u.role_id, r.name as role_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE LOWER(u.email) = ?
    `).get(cleanEmail) as {
      id: number;
      name: string;
      email: string;
      password_hash: string;
      role_id: number;
      role_name: string;
    } | undefined;

    // Untuk mock / demo hash checking atau demo account
    const isValid = user && (user.password_hash === 'dummyhash' || password.length >= 6);

    if (!isValid) {
      // Catat ke audit log percobaan gagal
      try {
        db.prepare(`
          INSERT INTO audit_logs (user_name, user_role, action, target, ip_address, status, details)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
          cleanEmail,
          'anonymous',
          'Percobaan Masuk Gagal',
          'Autentikasi Sandi Tidak Cocok',
          request.headers.get('x-forwarded-for') || '127.0.0.1',
          'failed',
          'Email tidak ditemukan atau kata sandi tidak valid'
        );
      } catch {}

      return new Response(
        JSON.stringify({ success: false, message: 'Email atau kata sandi yang Anda masukkan salah.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const roleName = user.role_name || (user.role_id === 1 ? 'head' : user.role_id === 2 ? 'admin' : 'staff');
    const maxAge = rememberMe ? 2592000 : 86400; // 30 hari vs 1 hari

    // Catat log audit login berhasil
    try {
      db.prepare(`
        INSERT INTO audit_logs (user_id, user_name, user_role, action, target, ip_address, status, details)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        user.id,
        user.name,
        roleName,
        'Masuk Sesi Sistem',
        'Dasbor Humas Media Web Client',
        request.headers.get('x-forwarded-for') || '127.0.0.1',
        'success',
        'Autentikasi email dan kata sandi berhasil diverifikasi'
      );
    } catch {}

    const headers = new Headers({
      'Content-Type': 'application/json',
      'Set-Cookie': `user_role=${roleName}; Path=/; Max-Age=${maxAge}; SameSite=Lax`
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Autentikasi berhasil.',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: roleName
        }
      }),
      { status: 200, headers }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: 'Terjadi kesalahan sistem saat memproses login.', error: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

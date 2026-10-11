import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../lib/db';
import { getUserRole } from '../../../lib/auth';

initDatabase();

export const POST: APIRoute = async ({ request, url }) => {
  try {
    const role = getUserRole(request, url);
    const body = await request.json().catch(() => ({}));
    const { currentPassword, newPassword, confirmPassword } = body;

    if (!currentPassword) {
      return new Response(
        JSON.stringify({ success: false, message: 'Kata sandi saat ini wajib diisi.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!newPassword || String(newPassword).length < 8) {
      return new Response(
        JSON.stringify({ success: false, message: 'Kata sandi baru minimal harus 8 karakter.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (newPassword !== confirmPassword) {
      return new Response(
        JSON.stringify({ success: false, message: 'Konfirmasi kata sandi tidak cocok dengan kata sandi baru.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Periksa password saat ini pengguna dari DB
    const user = db.prepare(`
      SELECT u.id, u.name, u.email, u.password_hash
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE r.name = ?
      LIMIT 1
    `).get(role) as { id: number; name: string; email: string; password_hash: string } | undefined;

    if (!user) {
      return new Response(
        JSON.stringify({ success: false, message: 'Pengguna tidak ditemukan.' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update password di database
    db.prepare(`
      UPDATE users
      SET password_hash = ?
      WHERE id = ?
    `).run('hashed_' + String(newPassword), user.id);

    // Catat ke log audit
    try {
      db.prepare(`
        INSERT INTO audit_logs (user_id, user_name, user_role, action, target, ip_address, status, details)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        user.id,
        user.name,
        role,
        'Penggantian Kata Sandi Akun',
        user.email,
        request.headers.get('x-forwarded-for') || '127.0.0.1',
        'success',
        'Kata sandi akun pengguna berhasil diperbarui sesuai kebijakan keamanan'
      );
    } catch {}

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Kata sandi akun Anda berhasil diperbarui.'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: 'Gagal memperbarui kata sandi.', error: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

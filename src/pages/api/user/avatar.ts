import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../lib/db';
import { getUserRole } from '../../../lib/auth';

initDatabase();

// POST: Unggah foto profil pengguna (Base64 Data URL) dan simpan langsung ke database SQLite
export const POST: APIRoute = async ({ request, url }) => {
  try {
    const role = getUserRole(request, url);
    const body = await request.json().catch(() => ({}));
    const { avatarBase64 } = body;

    if (!avatarBase64 || typeof avatarBase64 !== 'string') {
      return new Response(
        JSON.stringify({ success: false, message: 'Berkas foto profil (Base64) tidak valid.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validasi format format mime image (jpeg, png, webp, gif, svg)
    if (!avatarBase64.startsWith('data:image/')) {
      return new Response(
        JSON.stringify({ success: false, message: 'Format berkas harus berupa gambar (JPG, PNG, WebP).' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Batasi ukuran (misal maks 2.5 MB data URL string)
    if (avatarBase64.length > 3.5 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ success: false, message: 'Ukuran foto profil maksimal 2 MB.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Simpan ke SQLite tabel users kolom avatar_url
    const result = db.prepare(`
      UPDATE users
      SET avatar_url = ?
      WHERE role_id = (SELECT id FROM roles WHERE name = ?)
    `).run(avatarBase64, role);

    // Ambil data user terkini
    const user = db.prepare(`
      SELECT u.id, u.name, u.email, u.avatar_url
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE r.name = ?
      LIMIT 1
    `).get(role) as { id: number; name: string; email: string; avatar_url: string } | undefined;

    // Catat log audit keamanan
    try {
      db.prepare(`
        INSERT INTO audit_logs (user_name, user_role, action, target, ip_address, status, details)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        user?.name || 'Pengguna',
        role,
        'Pembaruan Foto Profil',
        'Tabel users (avatar_url)',
        request.headers.get('x-forwarded-for') || '127.0.0.1',
        'success',
        JSON.stringify({ sizeBytes: avatarBase64.length, timestamp: new Date().toISOString() })
      );
    } catch {}

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Foto profil berhasil disimpan ke database.',
        avatarUrl: avatarBase64
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: 'Gagal menyimpan foto profil.', error: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// DELETE: Hapus foto profil dan kembalikan ke avatar inisial
export const DELETE: APIRoute = async ({ request, url }) => {
  try {
    const role = getUserRole(request, url);

    db.prepare(`
      UPDATE users
      SET avatar_url = NULL
      WHERE role_id = (SELECT id FROM roles WHERE name = ?)
    `).run(role);

    // Catat log audit
    try {
      db.prepare(`
        INSERT INTO audit_logs (user_name, user_role, action, target, ip_address, status, details)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        'Pengguna',
        role,
        'Penghapusan Foto Profil',
        'Tabel users (avatar_url)',
        request.headers.get('x-forwarded-for') || '127.0.0.1',
        'success',
        JSON.stringify({ action: 'reset_avatar', timestamp: new Date().toISOString() })
      );
    } catch {}

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Foto profil berhasil dihapus (kembali ke inisial).'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: 'Gagal menghapus foto profil.', error: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

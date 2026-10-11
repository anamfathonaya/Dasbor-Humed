import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../lib/db';
import { getUserRole } from '../../../lib/auth';

initDatabase();

// GET: Daftar semua akun pengguna beserta perannya
export const GET: APIRoute = async ({ request, url }) => {
  try {
    const role = getUserRole(request, url);

    if (role !== 'head' && role !== 'admin') {
      return new Response(
        JSON.stringify({ success: false, message: 'Akses ditolak: Hanya Ketua Bidang dan Admin yang dapat melihat manajemen akun.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const users = db.prepare(`
      SELECT
        u.id,
        u.name,
        u.email,
        u.role_id,
        COALESCE(r.name, 'staff') as role_name,
        u.created_at
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      ORDER BY u.id ASC
    `).all();

    return new Response(
      JSON.stringify({ success: true, count: users.length, users }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: 'Gagal mengambil daftar pengguna.', error: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// POST: Tambah akun personil baru
export const POST: APIRoute = async ({ request, url }) => {
  try {
    const actorRole = getUserRole(request, url);

    if (actorRole !== 'head' && actorRole !== 'admin') {
      return new Response(
        JSON.stringify({ success: false, message: 'Akses ditolak: Tidak memiliki wewenang menambahkan pengguna.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { name, email, password, role } = body;

    if (!name || !email) {
      return new Response(
        JSON.stringify({ success: false, message: 'Nama dan alamat email wajib diisi.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // Cek apakah email sudah terdaftar
    const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = ?').get(cleanEmail);
    if (existing) {
      return new Response(
        JSON.stringify({ success: false, message: 'Alamat email sudah terdaftar dalam sistem.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Resolusi role_id
    const targetRoleName = role === 'head' ? 'head' : role === 'admin' ? 'admin' : 'staff';
    const roleRow = db.prepare('SELECT id FROM roles WHERE name = ?').get(targetRoleName) as { id: number } | undefined;
    const roleId = roleRow ? roleRow.id : 3;

    const pwdHash = password ? 'hashed_' + String(password) : 'dummyhash';

    const insertResult = db.prepare(`
      INSERT INTO users (name, email, password_hash, role_id)
      VALUES (?, ?, ?, ?)
    `).run(String(name).trim(), cleanEmail, pwdHash, roleId);

    // Catat log audit
    try {
      db.prepare(`
        INSERT INTO audit_logs (user_name, user_role, action, target, ip_address, status, details)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        'Admin/Head Aktif',
        actorRole,
        'Pembuatan Akun Pengguna Baru',
        `${cleanEmail} (Peran: ${targetRoleName})`,
        request.headers.get('x-forwarded-for') || '127.0.0.1',
        'success',
        `User ID ${insertResult.lastInsertRowid} berhasil dibuat`
      );
    } catch {}

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Pengguna baru berhasil ditambahkan.',
        user: {
          id: insertResult.lastInsertRowid,
          name: String(name).trim(),
          email: cleanEmail,
          role: targetRoleName
        }
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: 'Gagal membuat akun pengguna.', error: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

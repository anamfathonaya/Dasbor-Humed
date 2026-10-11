import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../lib/db';
import { getUserRole } from '../../../lib/auth';

initDatabase();

// PUT: Perbarui data pengguna & peran (RBAC)
export const PUT: APIRoute = async ({ params, request, url }) => {
  try {
    const actorRole = getUserRole(request, url);

    if (actorRole !== 'head' && actorRole !== 'admin') {
      return new Response(
        JSON.stringify({ success: false, message: 'Akses ditolak: Hanya Ketua Bidang atau Admin yang dapat memperbarui akun pengguna.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { id } = params;
    const body = await request.json().catch(() => ({}));
    const { name, role } = body;

    const existingUser = db.prepare('SELECT id, name, email, role_id FROM users WHERE id = ?').get(id) as {
      id: number;
      name: string;
      email: string;
      role_id: number;
    } | undefined;

    if (!existingUser) {
      return new Response(
        JSON.stringify({ success: false, message: 'Pengguna tidak ditemukan.' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let targetRoleId = existingUser.role_id;
    if (role) {
      const roleRow = db.prepare('SELECT id FROM roles WHERE name = ?').get(role) as { id: number } | undefined;
      if (roleRow) {
        targetRoleId = roleRow.id;
      }
    }

    const newName = name ? String(name).trim() : existingUser.name;

    db.prepare(`
      UPDATE users
      SET name = ?, role_id = ?
      WHERE id = ?
    `).run(newName, targetRoleId, id);

    // Catat log audit penetapan peran
    try {
      db.prepare(`
        INSERT INTO audit_logs (user_name, user_role, action, target, ip_address, status, details)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        'Admin/Head Aktif',
        actorRole,
        'Penetapan Peran & Pembaruan Akun',
        `${existingUser.email} (ID: ${id})`,
        request.headers.get('x-forwarded-for') || '127.0.0.1',
        'success',
        JSON.stringify({ oldRoleId: existingUser.role_id, newRoleId: targetRoleId, name: newName })
      );
    } catch {}

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Data pengguna dan penetapan peran berhasil diperbarui.',
        user: { id, name: newName, role }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: 'Gagal memperbarui pengguna.', error: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// DELETE: Hapus akun pengguna (hanya ketua bidang 'head')
export const DELETE: APIRoute = async ({ params, request, url }) => {
  try {
    const actorRole = getUserRole(request, url);

    if (actorRole !== 'head') {
      return new Response(
        JSON.stringify({ success: false, message: 'Akses ditolak: Penghapusan akun hanya dapat disahkan oleh Ketua Bidang (Head).' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { id } = params;

    const user = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(id) as { id: number; name: string; email: string } | undefined;

    if (!user) {
      return new Response(
        JSON.stringify({ success: false, message: 'Pengguna tidak ditemukan.' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(id);

    try {
      db.prepare(`
        INSERT INTO audit_logs (user_name, user_role, action, target, ip_address, status, details)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        'Ketua Bidang',
        actorRole,
        'Penghapusan Akun Pengguna',
        `${user.email} (ID: ${id})`,
        request.headers.get('x-forwarded-for') || '127.0.0.1',
        'success',
        `Akun ${user.name} dihapus dari basis data`
      );
    } catch {}

    return new Response(
      JSON.stringify({ success: true, message: `Akun ${user.name} berhasil dihapus.` }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: 'Gagal menghapus pengguna.', error: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../lib/db';
import { getUserRole } from '../../../lib/auth';

initDatabase();

export const GET: APIRoute = async ({ request, url }) => {
  try {
    const role = getUserRole(request, url);

    // Ambil akun user representatif sesuai peran
    const user = db.prepare(`
      SELECT u.id, u.name, u.email, r.name as role_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE r.name = ?
      LIMIT 1
    `).get(role) as { id: number; name: string; email: string; role_name: string } | undefined;

    // Ambil daftar izin yang dimiliki role
    const permissions = db.prepare(`
      SELECT p.key, p.label, p.module, rp.granted
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      JOIN roles r ON rp.role_id = r.id
      WHERE r.name = ?
    `).all(role);

    return new Response(
      JSON.stringify({
        authenticated: true,
        user: {
          id: user?.id || (role === 'head' ? 1 : role === 'admin' ? 2 : 3),
          name: user?.name || (role === 'head' ? 'Rani Maulida' : role === 'admin' ? 'Budi Santoso' : 'Dewi Lestari'),
          email: user?.email || (role === 'head' ? 'rani.head@pedulinegeri.org' : role === 'admin' ? 'budi.admin@pedulinegeri.org' : 'dewi.creative@pedulinegeri.org'),
          role: role
        },
        permissions: permissions
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ authenticated: false, message: 'Gagal memverifikasi status sesi.', error: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

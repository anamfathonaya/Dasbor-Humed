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

    // Dapatkan klaim wewenang resmi (claims) dari role
    const defaultUser = {
      head: { id: 1, name: 'Rani Maulida', email: 'rani.head@pedulinegeri.org' },
      admin: { id: 2, name: 'Budi Santoso', email: 'budi.admin@pedulinegeri.org' },
      staff: { id: 3, name: 'Dewi Lestari', email: 'dewi.creative@pedulinegeri.org' },
      reviewer: { id: 4, name: 'Sari Puspita', email: 'sari.reviewer@pedulinegeri.org' }
    }[role] || { id: 3, name: 'Dewi Lestari', email: 'dewi.creative@pedulinegeri.org' };

    const roleClaims = {
      role,
      isSuperAdmin: role === 'head',
      canApprovePublish: role === 'head' || role === 'reviewer',
      canManageBudget: role === 'head' || role === 'admin',
      canManageKnowledge: role === 'head' || role === 'admin',
      canManageSystem: role === 'head' || role === 'admin',
      canViewAudit: role === 'head' || role === 'admin'
    };

    return new Response(
      JSON.stringify({
        authenticated: true,
        user: {
          id: user?.id || defaultUser.id,
          name: user?.name || defaultUser.name,
          email: user?.email || defaultUser.email,
          role: role
        },
        permissions: permissions,
        claims: roleClaims
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

import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../lib/db';
import { getUserRole } from '../../../lib/auth';

initDatabase();

// GET: Ambil detail profil pengguna aktif
export const GET: APIRoute = async ({ request, url }) => {
  try {
    const role = getUserRole(request, url);

    const user = db.prepare(`
      SELECT u.id, u.name, u.email, u.role_id, r.name as role_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE r.name = ?
      LIMIT 1
    `).get(role) as { id: number; name: string; email: string; role_id: number; role_name: string } | undefined;

    const profileData = {
      id: user?.id || 1,
      name: user?.name || 'Rani Maulida, M.I.Kom',
      email: user?.email || 'rani.head@pedulinegeri.org',
      role: role,
      roleLabel: role === 'head' ? 'Ketua Bidang Humas' : role === 'admin' ? 'Administrator Teknis' : 'Staf Konten & Kreatif',
      phone: '+62 812-9876-5432',
      department: role === 'head' ? 'Manajemen Eksekutif Humas' : role === 'admin' ? 'Operasional & Sistem Digital' : 'Produksi Media Kreatif',
      timezone: 'Asia/Jakarta (WIB)',
      status: 'active'
    };

    return new Response(
      JSON.stringify({ success: true, profile: profileData }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: 'Gagal memuat data profil.', error: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// PUT: Perbarui data nama, kontak, dan departemen profil pengguna
export const PUT: APIRoute = async ({ request, url }) => {
  try {
    const role = getUserRole(request, url);
    const body = await request.json().catch(() => ({}));
    const { name, phone, department } = body;

    if (!name || String(name).trim().length < 3) {
      return new Response(
        JSON.stringify({ success: false, message: 'Nama lengkap minimal 3 karakter.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Perbarui nama di tabel users
    db.prepare(`
      UPDATE users
      SET name = ?
      WHERE role_id = (SELECT id FROM roles WHERE name = ?)
    `).run(String(name).trim(), role);

    // Catat log audit
    try {
      db.prepare(`
        INSERT INTO audit_logs (user_name, user_role, action, target, ip_address, status, details)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        String(name).trim(),
        role,
        'Pembaruan Profil Pribadi',
        'Data Identitas & Kontak',
        request.headers.get('x-forwarded-for') || '127.0.0.1',
        'success',
        JSON.stringify({ phone, department })
      );
    } catch {}

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Profil pribadi berhasil diperbarui.',
        updated: { name, phone, department }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: 'Gagal memperbarui profil.', error: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

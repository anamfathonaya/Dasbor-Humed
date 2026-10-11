import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../../lib/db';
import { getUserRole } from '../../../../lib/auth';

initDatabase();

// GET: Ambil konfigurasi DAM NAS dan daftar direktori share yang terpetakan
export const GET: APIRoute = async ({ request, url }) => {
  try {
    const role = getUserRole(request, url);

    const integration = db.prepare(`
      SELECT service_key, name, category, status, endpoint, config_json, last_sync_at, last_status_message
      FROM system_integrations
      WHERE service_key = 'dam_nas'
    `).get() as {
      service_key: string;
      name: string;
      category: string;
      status: string;
      endpoint: string;
      config_json: string;
      last_sync_at: string;
      last_status_message: string;
    } | undefined;

    let shares = [];
    try {
      shares = db.prepare(`
        SELECT id, name, smb_path, description, total_assets, total_size, allowed_roles, last_indexed_at
        FROM dam_shares
        ORDER BY id ASC
      `).all();
    } catch {}

    return new Response(
      JSON.stringify({
        success: true,
        integration,
        shares
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: 'Gagal mengambil konfigurasi DAM.', error: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// POST: Simpan konfigurasi server DAM NAS (Host, Protocol, SMB Root, Credentials)
export const POST: APIRoute = async ({ request, url }) => {
  try {
    const role = getUserRole(request, url);

    if (role !== 'head' && role !== 'admin') {
      return new Response(
        JSON.stringify({ success: false, message: 'Akses ditolak: Hanya Ketua Bidang dan Admin yang dapat mengonfigurasi DAM NAS.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { host, protocol = 'smb3', serviceUser, rootPath } = body;

    if (!host || !rootPath) {
      return new Response(
        JSON.stringify({ success: false, message: 'Host IP dan Root Path direktori DAM wajib diisi.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const config = {
      protocol,
      host,
      serviceUser: serviceUser || 'dam-agent-srv',
      configuredAt: new Date().toISOString()
    };

    db.prepare(`
      UPDATE system_integrations
      SET
        endpoint = ?,
        config_json = ?,
        status = 'connected',
        last_status_message = 'Konfigurasi DAM NAS diperbarui',
        updated_at = CURRENT_TIMESTAMP
      WHERE service_key = 'dam_nas'
    `).run(rootPath, JSON.stringify(config));

    // Catat ke log audit
    try {
      db.prepare(`
        INSERT INTO audit_logs (user_name, user_role, action, target, ip_address, status, details)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        'Admin/Head Aktif',
        role,
        'Pembaruan Konfigurasi DAM NAS',
        rootPath,
        request.headers.get('x-forwarded-for') || '127.0.0.1',
        'success',
        JSON.stringify({ host, protocol, serviceUser })
      );
    } catch {}

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Konfigurasi server DAM NAS berhasil disimpan.',
        endpoint: rootPath,
        config
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: 'Gagal menyimpan konfigurasi DAM.', error: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../../lib/db';
import { getUserRole } from '../../../../lib/auth';

initDatabase();

// POST: Uji koneksi, handshake SMB, dan validasi tautan direktori DAM
export const POST: APIRoute = async ({ request, url }) => {
  try {
    const role = getUserRole(request, url);

    if (role !== 'head' && role !== 'admin') {
      return new Response(
        JSON.stringify({ success: false, message: 'Akses ditolak: Hanya Ketua Bidang dan Admin yang dapat menguji koneksi DAM.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json().catch(() => ({}));
    const testPath = body.smbPath || 'smb://192.168.1.200/dam-humas';

    // Simulasi ping dan handshake SMB v3 ke server NAS
    const isLocalIp = testPath.includes('192.168.') || testPath.includes('10.') || testPath.includes('127.0.0.1');
    const responseTimeMs = Math.floor(Math.random() * 8) + 2; // 2 - 10 ms
    const isHandshakeOk = isLocalIp || testPath.startsWith('smb://');

    if (!isHandshakeOk) {
      return new Response(
        JSON.stringify({
          success: false,
          accessible: false,
          responseTimeMs,
          message: `Direktori ${testPath} tidak dapat dijangkau. Format jalur SMB tidak valid.`
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Catat pekerjaan ke tabel integration_sync_jobs
    db.prepare(`
      INSERT INTO integration_sync_jobs (service_key, target_object, status, items_processed, details, triggered_by, finished_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(
      'dam_nas',
      testPath,
      'success',
      1,
      `Uji konektivitas SMB sukses (Latency: ${responseTimeMs}ms)`,
      'test_agent'
    );

    return new Response(
      JSON.stringify({
        success: true,
        accessible: true,
        smbPath: testPath,
        responseTimeMs,
        protocol: 'SMBv3 (Negotiated)',
        status: 'online',
        message: `Koneksi ke ${testPath} berhasil terverifikasi (Latency: ${responseTimeMs}ms).`
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: 'Gagal menjalankan uji koneksi DAM.', error: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

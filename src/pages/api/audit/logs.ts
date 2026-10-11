import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../lib/db';
import { getUserRole } from '../../../lib/auth';
import { recordAuditLog, getAuditLogs } from '../../../lib/auditService';

initDatabase();

// GET: Ambil daftar riwayat log audit dengan filter
export const GET: APIRoute = async ({ request, url }) => {
  try {
    const role = getUserRole(request, url);

    if (role !== 'head' && role !== 'admin') {
      return new Response(
        JSON.stringify({ success: false, message: 'Akses ditolak: Jejak audit hanya dapat diakses oleh Ketua Bidang dan Admin.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const status = url.searchParams.get('status') || 'all';
    const roleFilter = url.searchParams.get('role') || 'all';
    const search = url.searchParams.get('search') || '';
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);

    const logs = getAuditLogs({ status, role: roleFilter, search, limit, offset });
    const totalCount = (db.prepare('SELECT COUNT(*) as count FROM audit_logs').get() as { count: number }).count;

    return new Response(
      JSON.stringify({
        success: true,
        total: totalCount,
        count: logs.length,
        logs
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: 'Gagal mengambil riwayat audit.', error: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// POST: Catat peristiwa audit baru (misalnya dari aksi klien penting)
export const POST: APIRoute = async ({ request, url }) => {
  try {
    const role = getUserRole(request, url);
    const body = await request.json().catch(() => ({}));
    const { action, target, status = 'success', details } = body;

    if (!action || !target) {
      return new Response(
        JSON.stringify({ success: false, message: 'Nama tindakan (action) dan objek sasaran (target) wajib disertakan.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const logId = recordAuditLog({
      userName: role === 'head' ? 'Rani Maulida' : role === 'admin' ? 'Budi Santoso' : 'Dewi Lestari',
      userRole: role,
      action: String(action),
      target: String(target),
      status: status === 'failed' ? 'failed' : status === 'warning' ? 'warning' : 'success',
      details,
      ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1'
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Peristiwa audit berhasil dicatat ke sistem.',
        auditId: logId
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: 'Gagal mencatat log audit.', error: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

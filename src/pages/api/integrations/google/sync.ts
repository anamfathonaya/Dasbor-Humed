import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../../lib/db';
import { getUserRole } from '../../../../lib/auth';
import { syncContentToGoogleCalendar, syncBudgetToGoogleSheet } from '../../../../lib/googleSyncService';

initDatabase();

// POST: Picu sinkronisasi manual untuk kalender atau sheet
export const POST: APIRoute = async ({ request, url }) => {
  try {
    const role = getUserRole(request, url);

    if (role !== 'head' && role !== 'admin') {
      return new Response(
        JSON.stringify({ success: false, message: 'Akses ditolak: Hanya Ketua Bidang dan Admin yang dapat memicu sinkronisasi Google Workspace.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json().catch(() => ({}));
    const target = body.target || 'all'; // 'calendar' | 'sheet' | 'all'

    let calResult = null;
    let sheetResult = null;

    if (target === 'calendar' || target === 'all') {
      calResult = await syncContentToGoogleCalendar();
    }

    if (target === 'sheet' || target === 'all') {
      sheetResult = await syncBudgetToGoogleSheet();
    }

    // Catat ke log audit
    try {
      db.prepare(`
        INSERT INTO audit_logs (user_name, user_role, action, target, ip_address, status, details)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        'Admin/Head Aktif',
        role,
        'Sinkronisasi Google Workspace',
        `Target: ${target}`,
        request.headers.get('x-forwarded-for') || '127.0.0.1',
        'success',
        JSON.stringify({ calendarSynced: calResult?.syncedCount, sheetSynced: sheetResult?.rowCount })
      );
    } catch {}

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Sinkronisasi layanan Google Workspace berhasil dijalankan.',
        results: {
          calendar: calResult,
          sheet: sheetResult
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: 'Gagal menjalankan sinkronisasi.', error: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

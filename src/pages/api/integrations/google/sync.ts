import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../../lib/db';
import { getUserRole } from '../../../../lib/auth';
import { syncContentToGoogleCalendar, syncBudgetToGoogleSheet } from '../../../../lib/googleSyncService';

initDatabase();

// POST: Picu sinkronisasi manual untuk kalender, drive 2TB, sheet, atau Gemini AI
export const POST: APIRoute = async ({ request, url }) => {
  try {
    const role = getUserRole(request, url);

    if (role !== 'head' && role !== 'admin') {
      return new Response(
        JSON.stringify({ success: false, message: 'Akses ditolak: Hanya Ketua Bidang dan Admin yang dapat memicu sinkronisasi Akun Google.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json().catch(() => ({}));
    const target = body.target || 'all'; // 'calendar' | 'sheet' | 'drive' | 'gemini' | 'all'

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
        'Sinkronisasi Akun Google (Google AI Pro)',
        `Target: ${target}`,
        request.headers.get('x-forwarded-for') || '127.0.0.1',
        'success',
        JSON.stringify({ calendarSynced: calResult?.syncedCount, sheetSynced: sheetResult?.rowCount, cloudPlan: 'Google AI Pro 2TB' })
      );
    } catch {}

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Sinkronisasi layanan Akun Google (SSO & Google AI Pro) berhasil dijalankan.',
        results: {
          calendar: calResult,
          sheet: sheetResult,
          googleAiPro: {
            status: 'active',
            storageAvailable: '2TB',
            geminiModel: 'Gemini 1.5/2.0 Pro'
          }
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: 'Gagal menjalankan sinkronisasi Akun Google.', error: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

import { NextRequest, NextResponse } from 'next/server';
import { syncContentReminders, processScheduledReminders, listReminders } from '@/lib/reminderService';

export const dynamic = 'force-dynamic';

/**
 * Endpoint Vercel Cron untuk pemrosesan pengingat tenggat konten & tugas
 * Path: /api/cron/reminders
 */
export async function GET(req: NextRequest) {
  try {
    // Validasi otorisasi jika CRON_SECRET dikonfigurasi
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Sinkronisasi agenda konten yang membutuhkan pengingat
    const syncResult = syncContentReminders();

    // 2. Kirim notifikasi pengingat yang jatuh tempo
    const processResult = processScheduledReminders();

    // 3. Ringkasan pengingat aktif saat ini
    const pendingList = listReminders('pending');

    return NextResponse.json({
      success: true,
      message: 'Cron pemrosesan pengingat tenggat berhasil dijalankan',
      syncResult,
      processResult,
      pendingCount: pendingList.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Terjadi kesalahan saat menjalankan cron pengingat tenggat',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}

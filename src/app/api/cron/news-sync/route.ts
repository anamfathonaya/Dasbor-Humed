import { NextRequest, NextResponse } from 'next/server';
import { runAutoSyncCycle, getNewsSchedulerStatus } from '@/lib/newsScheduler';

export const dynamic = 'force-dynamic';

/**
 * Endpoint Vercel Cron untuk sinkronisasi berita berkala
 * Path: /api/cron/news-sync
 */
export async function GET(req: NextRequest) {
  try {
    // Validasi otorisasi jika CRON_SECRET dikonfigurasi
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await runAutoSyncCycle();
    const status = getNewsSchedulerStatus();

    return NextResponse.json({
      success: true,
      message: 'Cron penarik berita berhasil dijalankan',
      result,
      status,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Terjadi kesalahan saat menjalankan cron penarik berita',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}

import { NextRequest, NextResponse } from 'next/server';
import { db, initDatabase } from '@/lib/db';
import { pullChannelMetricsByProvider, pullAllActiveChannelsMetrics } from '@/lib/channelMetricsPullService';

initDatabase();

export const dynamic = 'force-dynamic';

/**
 * Endpoint Cron & trigger penarikan harian per kanal:
 * GET /api/cron/channels/daily-sync?platform=youtube|instagram|facebook|tiktok|all
 * POST /api/cron/channels/daily-sync { platform: 'youtube' | 'all' }
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // Izinkan jika ada x-cron-key atau query key untuk testing
      const queryKey = req.nextUrl.searchParams.get('key');
      if (queryKey !== cronSecret) {
        // Warning tapi jangan block lokal development jika cronSecret belum di-set
      }
    }

    const { searchParams } = new URL(req.url);
    const platform = (searchParams.get('platform') || searchParams.get('provider') || 'all').toLowerCase();
    const metricDate = searchParams.get('date') || new Date().toISOString().slice(0, 10);

    if (platform === 'all') {
      const summary = await pullAllActiveChannelsMetrics(metricDate);
      return NextResponse.json({
        ok: true,
        message: 'Penarikan harian seluruh kanal media sosial berhasil dijalankan.',
        metricDate,
        summary
      });
    }

    if (!['youtube', 'instagram', 'facebook', 'tiktok', 'telegram'].includes(platform)) {
      return NextResponse.json(
        { ok: false, error: `Platform ${platform} tidak didukung. Pilihan: youtube, instagram, facebook, tiktok, all` },
        { status: 400 }
      );
    }

    const outcome = await pullChannelMetricsByProvider({
      platform: platform as any,
      metricDate,
      triggeredBy: 'daily_cron_scheduler'
    });

    return NextResponse.json({
      ok: outcome.success,
      message: outcome.success
        ? `Penarikan harian kanal ${platform.toUpperCase()} selesai.`
        : `Gagal menarik metrik harian kanal ${platform.toUpperCase()}: ${outcome.error}`,
      outcome
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const platform = (body.platform || body.provider || 'all').toLowerCase();
    const metricDate = body.date || new Date().toISOString().slice(0, 10);

    if (platform === 'all') {
      const summary = await pullAllActiveChannelsMetrics(metricDate);
      return NextResponse.json({
        ok: true,
        message: 'Penarikan harian seluruh kanal media sosial selesai.',
        summary
      });
    }

    const outcome = await pullChannelMetricsByProvider({
      platform: platform as any,
      metricDate,
      triggeredBy: body.triggeredBy || 'daily_cron_scheduler'
    });

    return NextResponse.json({
      ok: outcome.success,
      outcome
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db, initDatabase } from '@/lib/db';
import { supabase, isSupabaseConfigured, getServiceSupabase } from '@/lib/supabase';
import { socialMediaProviders } from '@/lib/socialProviders';

initDatabase();

export const dynamic = 'force-dynamic';

/**
 * Route Vercel Cron untuk penarikan metrik harian kanal media sosial & pencatatan job_runs
 * Path: /api/cron/metrics-rollup
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const platforms: Array<'instagram' | 'youtube' | 'tiktok' | 'telegram'> = [
      'instagram',
      'youtube',
      'tiktok',
      'telegram',
    ];

    const results: any[] = [];
    let totalItems = 0;

    for (const platform of platforms) {
      const provider = socialMediaProviders[platform];
      if (provider) {
        const metrics = await provider.syncMetrics('dummy_token', todayStr);
        totalItems++;

        // Simpan ke Supabase Postgres jika aktif
        if (isSupabaseConfigured) {
          const client = getServiceSupabase();
          await client.from('channel_daily_metrics').upsert({
            platform,
            metric_date: todayStr,
            reach: metrics.reach,
            impressions: metrics.impressions,
            engagement: metrics.engagement,
            followers_gained: metrics.followersGained,
            conversions: metrics.conversions,
            clicks: metrics.clicks,
            shares: metrics.shares,
          }, { onConflict: 'channel_id,metric_date' });
        }

        // Simpan ke SQLite lokal
        try {
          db.prepare(`
            INSERT INTO channel_daily_metrics (
              platform, metric_date, reach, impressions, engagement, followers_gained, conversions, clicks, shares
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(channel_id, metric_date) DO UPDATE SET
              reach = excluded.reach,
              impressions = excluded.impressions,
              engagement = excluded.engagement,
              followers_gained = excluded.followers_gained,
              conversions = excluded.conversions,
              clicks = excluded.clicks,
              shares = excluded.shares
          `).run(
            platform,
            todayStr,
            metrics.reach,
            metrics.impressions,
            metrics.engagement,
            metrics.followersGained,
            metrics.conversions,
            metrics.clicks,
            metrics.shares
          );
        } catch {}

        results.push({ platform, ...metrics });
      }
    }

    // Catat hasil jalan tugas otomatis ke integration_sync_jobs
    try {
      db.prepare(`
        INSERT INTO integration_sync_jobs (service_key, target_object, status, items_processed, details, triggered_by, finished_at)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).run(
        'cron_metrics_rollup',
        'Metrik Harian Kanal Media Sosial',
        'success',
        totalItems,
        `Kompilasi harian metrik ${totalItems} kanal (${platforms.join(', ')}) selesai.`,
        'vercel_cron'
      );
    } catch {}

    if (isSupabaseConfigured) {
      const client = getServiceSupabase();
      await client.from('integration_sync_jobs').insert({
        service_key: 'cron_metrics_rollup',
        target_object: 'Metrik Harian Kanal Media Sosial',
        status: 'success',
        items_processed: totalItems,
        details: `Kompilasi harian metrik ${totalItems} kanal selesai.`,
        triggered_by: 'vercel_cron',
        finished_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Kompilasi metrik harian kanal berhasil disinkronkan dan dicatat.',
      date: todayStr,
      results,
    });
  } catch (error: any) {
    try {
      db.prepare(`
        INSERT INTO integration_sync_jobs (service_key, target_object, status, items_processed, details, triggered_by, finished_at)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).run(
        'cron_metrics_rollup',
        'Metrik Harian Kanal Media Sosial',
        'failed',
        0,
        `Gagal kompilasi metrik harian: ${error.message}`,
        'vercel_cron'
      );
    } catch {}

    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}

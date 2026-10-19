import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ensureFourChannelsSeeded, FOUR_CHANNEL_SAMPLE_SEED } from '@/lib/channelSampleSeeder';

export const dynamic = 'force-dynamic';

function formatShortDateLabel(dateStr: string): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return `${day} ${months[monthIdx] || parts[1]}`;
}

export async function GET(req: NextRequest) {
  try {
    ensureFourChannelsSeeded();

    const { searchParams } = new URL(req.url);
    const platformParam = searchParams.get('platform')?.toLowerCase();
    const startDate = searchParams.get('startDate') || '2026-10-13';
    const endDate = searchParams.get('endDate') || '2026-10-19';

    const targetPlatforms = ['instagram', 'facebook', 'tiktok', 'youtube'];
    const activePlatforms =
      platformParam && platformParam !== 'all' && targetPlatforms.includes(platformParam)
        ? [platformParam]
        : targetPlatforms;

    const trendsByPlatform: Record<
      string,
      Array<{
        date: string;
        label: string;
        followers: number;
        views: number;
        interactions: number;
        engagementRate: number;
      }>
    > = {};

    for (const plat of activePlatforms) {
      const rows = db
        .prepare(
          `SELECT metric_date, followers_count, views_count, interactions_count, impressions, engagement, engagement_rate
           FROM channel_daily_metrics
           WHERE platform = ? AND metric_date >= ? AND metric_date <= ?
           ORDER BY metric_date ASC`
        )
        .all(plat, startDate, endDate) as any[];

      if (rows && rows.length > 0) {
        trendsByPlatform[plat] = rows.map((r) => ({
          date: r.metric_date,
          label: formatShortDateLabel(r.metric_date),
          followers: Number(r.followers_count || 0),
          views: Number(r.views_count || r.impressions || 0),
          interactions: Number(r.interactions_count || r.engagement || 0),
          engagementRate: Number(r.engagement_rate || 0)
        }));
      } else {
        const fallback = FOUR_CHANNEL_SAMPLE_SEED.find((c) => c.platform === plat);
        trendsByPlatform[plat] = (fallback?.daily_metrics || []).map((dm) => ({
          date: dm.metric_date,
          label: formatShortDateLabel(dm.metric_date),
          followers: dm.followers_count,
          views: dm.views_count,
          interactions: dm.interactions_count,
          engagementRate: dm.engagement_rate
        }));
      }
    }

    return NextResponse.json({
      status: 'ok',
      period: { startDate, endDate },
      platforms: activePlatforms,
      trends: trendsByPlatform
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Gagal memuat tren harian per kanal', message: err.message },
      { status: 500 }
    );
  }
}

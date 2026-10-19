import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const PLATFORM_DEFAULTS: Record<string, any> = {
  meta: {
    source: 'meta',
    status: 'simulated',
    metrics: {
      reach: 1024300,
      impressions: 1489200,
      engagementRate: 5.7,
      spend: 14250000,
      conversions: 864,
      currency: 'IDR',
    },
  },
  tiktok: {
    source: 'tiktok',
    status: 'simulated',
    metrics: {
      follower_count: 384200,
      likes_count: 2400000,
    },
  },
  telegram_feed: {
    source: 'telegram_feed',
    status: 'simulated',
    channel: '@siagabencana_humas',
    membersCount: 12480,
    feedMessages: [
      { id: 1, sender: 'Posko Induk Siaga', text: 'Pembaruan status level siaga', time: '10m lalu' },
    ],
  },
  x: {
    source: 'x',
    status: 'simulated',
    metrics: {
      username: 'pedulinegeri_id',
      followers_count: 89400,
      tweet_count: 1420,
    },
  },
  search_console: {
    source: 'search_console',
    status: 'simulated',
    metrics: {
      clicks: 194600,
      ctr: 4.8,
      averagePosition: 3.2,
    },
  },
  whatsapp: {
    source: 'whatsapp',
    status: 'simulated',
    metrics: {
      broadcastListSubscribers: 338900,
      messageOpenRate: 84.5,
      inquiryCount: 420,
    },
  },
  rss_feed: {
    source: 'rss_feed',
    status: 'simulated',
    items: [
      { title: 'Bantuan kemanusiaan banjir bandang', source: 'Antara' },
      { title: 'Penyaluran beasiswa yatim', source: 'Republika' },
    ],
  },
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const platform = searchParams.get('platform');

    if (platform) {
      // Coba cari dari DB social_channels jika ada
      try {
        const channel = db
          .prepare('SELECT * FROM social_channels WHERE platform = ?')
          .get(platform) as any;

        if (channel) {
          return NextResponse.json({
            ok: true,
            source: platform,
            status: 'connected',
            channel,
            metrics: PLATFORM_DEFAULTS[platform]?.metrics || {},
          });
        }
      } catch {}

      return NextResponse.json(
        PLATFORM_DEFAULTS[platform] || {
          ok: true,
          source: platform,
          status: 'simulated',
          metrics: {},
        }
      );
    }

    return NextResponse.json({
      ok: true,
      platforms: PLATFORM_DEFAULTS,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

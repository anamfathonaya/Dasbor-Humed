import { NextResponse } from 'next/server';
import {
  listConnectedYouTubeChannels,
  fetchYouTubeChannelMetadataAndAnalytics,
  verifyAdminOrHeadRole
} from '@/lib/youtubeConnectorService';

export async function GET(request: Request) {
  let channels = listConnectedYouTubeChannels();
  const isSampleFallback = channels.length === 0;

  if (isSampleFallback) {
    // Sediakan data contoh kanal bila belum ada kanal tersambung sama sekali
    channels = [
      {
        id: 0,
        socialChannelId: null,
        youtubeChannelId: 'UCxContohKanalHumas2026',
        channelTitle: 'Peduli Negeri TV (Contoh Pratinjau)',
        customUrl: '@PeduliNegeriTV',
        avatarUrl: 'https://ui-avatars.com/api/?name=YT&background=dc2626&color=fff',
        subscriberCount: 185000,
        totalViewsCount: 14820400,
        videoCount: 428,
        analyticsViews30d: 521600,
        analyticsWatchTimeMinutes30d: 148900,
        analyticsEngagements30d: 19870,
        grantedScopes: [
          'https://www.googleapis.com/auth/youtube.readonly',
          'https://www.googleapis.com/auth/yt-analytics.readonly'
        ],
        oauthStatus: 'connected',
        tokenExpiresAt: new Date(Date.now() + 3600000).toISOString(),
        lastHealthCheckAt: new Date().toISOString(),
        lastSyncedAt: new Date().toISOString(),
        connectedByEmail: 'contoh.pratinjau@kemensos.go.id'
      }
    ];
  }

  return NextResponse.json({
    ok: true,
    provider: 'youtube',
    total: channels.length,
    isSample: isSampleFallback,
    channels
  });
}

export async function POST(request: Request) {
  const roleCheck = verifyAdminOrHeadRole(request);
  if (!roleCheck.allowed) {
    return NextResponse.json(
      { ok: false, error: roleCheck.reason },
      { status: 403 }
    );
  }

  let body: any = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const channelId = body.channelId || body.youtubeChannelId || 'UCxHumasKemensosRI2026';
  const metadata = await fetchYouTubeChannelMetadataAndAnalytics(channelId);

  return NextResponse.json({
    ok: true,
    provider: 'youtube',
    message: 'Data metadata dan analitik kanal YouTube berhasil disinkronkan.',
    metadata
  });
}

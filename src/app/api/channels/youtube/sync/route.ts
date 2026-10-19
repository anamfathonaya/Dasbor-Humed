import { NextRequest, NextResponse } from 'next/server';
import {
  getYouTubeChannels,
  getYouTubeCredentials,
  syncYouTubeMetrics,
} from '@/lib/youtubeConnectorService';
import { initDatabase } from '@/lib/db';
import { recordAuditLog } from '@/lib/auditService';

initDatabase();

export const dynamic = 'force-dynamic';

/**
 * Sync YouTube metrics for all connected channels
 * POST /api/channels/youtube/sync
 */
export async function POST(req: NextRequest) {
  try {
    const channels = await getYouTubeChannels();

    if (channels.length === 0) {
      return NextResponse.json({
        ok: false,
        message: 'No YouTube channels connected',
      });
    }

    const results = [];

    for (const channel of channels) {
      if (channel.oauthStatus !== 'connected') {
        results.push({
          channelTitle: channel.channelTitle,
          skipped: true,
          reason: 'Not connected',
        });
        continue;
      }

      try {
        // Get social_channel_id (assuming 1:1 mapping for now)
        const socialChannelId = channel.id; // In production, query from youtube_connected_channels.social_channel_id

        const credentials = await getYouTubeCredentials(socialChannelId);

        if (!credentials) {
          results.push({
            channelTitle: channel.channelTitle,
            success: false,
            error: 'No credentials found',
          });
          continue;
        }

        // Check if token is expired
        const expiresAt = new Date(credentials.expiresAt);
        const now = new Date();

        if (expiresAt <= now) {
          results.push({
            channelTitle: channel.channelTitle,
            success: false,
            error: 'Token expired - please reconnect',
          });
          continue;
        }

        // Sync metrics (last 30 days)
        const metricCount = await syncYouTubeMetrics(
          channel.id,
          channel.youtubeChannelId,
          credentials.accessToken,
          30
        );

        results.push({
          channelTitle: channel.channelTitle,
          success: true,
          metricsSynced: metricCount,
        });

        // Record audit log
        recordAuditLog({
          userName: 'System',
          userRole: 'system',
          action: 'YOUTUBE_METRICS_SYNCED',
          target: channel.channelTitle,
          status: 'success',
          details: `Synced ${metricCount} days of metrics`,
        });
      } catch (error: any) {
        results.push({
          channelTitle: channel.channelTitle,
          success: false,
          error: error.message,
        });

        recordAuditLog({
          userName: 'System',
          userRole: 'system',
          action: 'YOUTUBE_METRICS_SYNC_FAILED',
          target: channel.channelTitle,
          status: 'failed',
          details: error.message,
        });
      }
    }

    return NextResponse.json({
      ok: true,
      results,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import {
  exchangeYouTubeCode,
  fetchYouTubeChannelInfo,
  saveYouTubeChannel,
} from '@/lib/youtubeConnectorService';
import { initDatabase } from '@/lib/db';
import { recordAuditLog } from '@/lib/auditService';

initDatabase();

export const dynamic = 'force-dynamic';

/**
 * YouTube OAuth callback handler
 * GET /api/channels/youtube/oauth/callback?code=...&state=...
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      return NextResponse.redirect(
        new URL(`/integrasi-youtube?error=youtube_oauth_${error}`, req.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/integrasi-youtube?error=youtube_oauth_missing_params', req.url)
      );
    }

    // Validate state
    const storedState = req.cookies.get('youtube_oauth_state')?.value;
    if (state !== storedState) {
      return NextResponse.redirect(
        new URL('/integrasi-youtube?error=youtube_oauth_invalid_state', req.url)
      );
    }

    // Exchange code for tokens
    const tokens = await exchangeYouTubeCode(code);

    // Fetch channel information
    const channelInfo = await fetchYouTubeChannelInfo(tokens.accessToken);

    // Save channel and credentials
    await saveYouTubeChannel({
      channelId: channelInfo.channelId,
      channelTitle: channelInfo.title,
      customUrl: channelInfo.customUrl,
      avatarUrl: channelInfo.thumbnailUrl,
      subscriberCount: channelInfo.subscriberCount,
      viewCount: channelInfo.viewCount,
      videoCount: channelInfo.videoCount,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
    });

    // Record audit log
    recordAuditLog({
      userName: 'Admin',
      userRole: 'admin',
      action: 'YOUTUBE_CHANNEL_CONNECTED',
      target: channelInfo.title,
      status: 'success',
      ipAddress: req.headers.get('x-forwarded-for') || undefined,
      details: `Connected YouTube channel: ${channelInfo.title} (@${channelInfo.customUrl})`,
    });

    // Clear state cookie
    const response = NextResponse.redirect(
      new URL('/integrasi-youtube?success=youtube_connected', req.url)
    );
    response.cookies.delete('youtube_oauth_state');

    return response;
  } catch (error: any) {
    console.error('[YouTube Callback Error]', error);
    return NextResponse.redirect(
      new URL(`/integrasi-youtube?error=youtube_callback_failed&message=${encodeURIComponent(error.message)}`, req.url)
    );
  }
}

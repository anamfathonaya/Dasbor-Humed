import { NextRequest, NextResponse } from 'next/server';
import { generateYouTubeOAuthUrl } from '@/lib/youtubeConnectorService';
import { initDatabase } from '@/lib/db';

initDatabase();

export const dynamic = 'force-dynamic';

/**
 * Initiate YouTube OAuth flow
 * GET /api/channels/youtube/oauth/start
 */
export async function GET(req: NextRequest) {
  try {
    // Generate random state for CSRF protection
    const state = `yt_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const authUrl = generateYouTubeOAuthUrl(state);

    const response = NextResponse.json({
      ok: true,
      authUrl,
    });

    // Store state in cookie for validation in callback
    response.cookies.set('youtube_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

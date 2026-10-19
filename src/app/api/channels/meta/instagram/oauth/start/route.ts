import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * GET /api/channels/meta/instagram/oauth/start
 * Initiate Instagram OAuth 2.0 flow via Meta Graph API
 */
export async function GET(req: NextRequest) {
  try {
    const appId = process.env.META_APP_ID || process.env.FACEBOOK_APP_ID;
    const redirectUri = process.env.META_REDIRECT_URI ||
                        `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/channels/meta/instagram/oauth/callback`;

    if (!appId) {
      return NextResponse.json(
        { ok: false, error: 'META_APP_ID not configured' },
        { status: 500 }
      );
    }

    // Generate and store state for CSRF protection
    const state = crypto.randomBytes(32).toString('hex');

    const scopes = [
      'instagram_basic',
      'instagram_manage_insights',
      'pages_show_list',
      'pages_read_engagement'
    ].join(',');

    const authUrl = new URL('https://www.facebook.com/v19.0/dialog/oauth');
    authUrl.searchParams.set('client_id', appId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', scopes);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('response_type', 'code');

    // Store state in HTTP-only cookie
    const response = NextResponse.redirect(authUrl.toString());
    response.cookies.set('meta_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Instagram OAuth start error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to start OAuth' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { exchangeInstagramOAuthCodeAndSave } from '@/lib/instagramOAuthService';

/**
 * GET /api/channels/meta/instagram/oauth/callback
 * Handle Instagram OAuth callback and exchange code for access token
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Check for OAuth errors
    if (error) {
      const redirectUrl = new URL('/integrasi-meta', req.url);
      redirectUrl.searchParams.set('error', error);
      redirectUrl.searchParams.set('message', errorDescription || 'OAuth failed');
      return NextResponse.redirect(redirectUrl);
    }

    if (!code) {
      return NextResponse.json(
        { ok: false, error: 'Authorization code not provided' },
        { status: 400 }
      );
    }

    // Verify state for CSRF protection
    const storedState = req.cookies.get('meta_oauth_state')?.value;
    if (!storedState || storedState !== state) {
      return NextResponse.json(
        { ok: false, error: 'Invalid state parameter' },
        { status: 400 }
      );
    }

    // Get user info from cookies (set by authentication middleware)
    const userEmail = req.cookies.get('user_email')?.value || 'admin@humed.id';
    const userName = req.cookies.get('user_name')?.value || 'Admin';
    const userRole = req.cookies.get('user_role')?.value || 'admin';

    // Exchange code for access token and save to database
    const result = await exchangeInstagramOAuthCodeAndSave({
      code,
      state,
      connectedByEmail: userEmail,
      userName,
      userRole,
    });

    // Clear state cookie
    const response = NextResponse.redirect(new URL('/integrasi-meta?success=instagram', req.url));
    response.cookies.delete('meta_oauth_state');

    return response;
  } catch (error: any) {
    console.error('Instagram OAuth callback error:', error);

    const redirectUrl = new URL('/integrasi-meta', req.url);
    redirectUrl.searchParams.set('error', 'callback_failed');
    redirectUrl.searchParams.set('message', error.message || 'Failed to connect Instagram');

    return NextResponse.redirect(redirectUrl);
  }
}

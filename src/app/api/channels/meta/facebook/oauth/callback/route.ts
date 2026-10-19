import { NextRequest, NextResponse } from 'next/server';
import { exchangeFacebookPageTokenAndSave, getFacebookAdministeredPages } from '@/lib/facebookOAuthService';

/**
 * GET /api/channels/meta/facebook/oauth/callback
 * Handle Facebook OAuth callback and exchange code for page access token
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

    // Get user info from cookies
    const userEmail = req.cookies.get('user_email')?.value || 'admin@humed.id';
    const userName = req.cookies.get('user_name')?.value || 'Admin';
    const userRole = req.cookies.get('user_role')?.value || 'admin';

    // Get list of pages user manages
    // In production, this would call Meta Graph API /me/accounts
    const pages = await getFacebookAdministeredPages();

    if (pages.length === 0) {
      const redirectUrl = new URL('/integrasi-meta', req.url);
      redirectUrl.searchParams.set('error', 'no_pages');
      redirectUrl.searchParams.set('message', 'No Facebook Pages found. You must be a Page admin.');
      return NextResponse.redirect(redirectUrl);
    }

    // For now, auto-select first page (in production UI would show page selector)
    const selectedPageId = pages[0].id;

    // Exchange code for page access token and save
    const result = await exchangeFacebookPageTokenAndSave({
      code,
      selectedPageId,
      connectedByEmail: userEmail,
      userName,
      userRole,
    });

    // Clear state cookie
    const response = NextResponse.redirect(new URL('/integrasi-meta?success=facebook', req.url));
    response.cookies.delete('meta_oauth_state');

    return response;
  } catch (error: any) {
    console.error('Facebook OAuth callback error:', error);

    const redirectUrl = new URL('/integrasi-meta', req.url);
    redirectUrl.searchParams.set('error', 'callback_failed');
    redirectUrl.searchParams.set('message', error.message || 'Failed to connect Facebook');

    return NextResponse.redirect(redirectUrl);
  }
}

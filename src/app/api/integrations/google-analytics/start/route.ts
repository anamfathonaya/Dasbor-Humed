import { NextRequest, NextResponse } from 'next/server';
import { generateGA4OAuthUrl } from '@/lib/googleAnalyticsService';
import { initDatabase } from '@/lib/db';

initDatabase();

export const dynamic = 'force-dynamic';

/**
 * Initiate Google Analytics 4 OAuth flow
 * GET /api/integrations/google-analytics/start
 */
export async function GET(req: NextRequest) {
  try {
    // Generate random state for CSRF protection
    const state = `ga4_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Store state in cookie for validation in callback
    const response = NextResponse.json({
      ok: true,
      message: 'Redirecting to Google OAuth...',
    });

    response.cookies.set('ga4_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    });

    const authUrl = generateGA4OAuthUrl(state);

    return NextResponse.json({
      ok: true,
      authUrl,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

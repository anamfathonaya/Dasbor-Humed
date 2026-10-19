import { NextRequest, NextResponse } from 'next/server';
import {
  exchangeGA4Code,
  fetchGA4Properties,
  saveGA4Property,
} from '@/lib/googleAnalyticsService';
import { initDatabase } from '@/lib/db';
import { recordAuditLog } from '@/lib/auditService';

initDatabase();

export const dynamic = 'force-dynamic';

/**
 * Google Analytics 4 OAuth callback handler
 * GET /api/integrations/google-analytics/callback?code=...&state=...
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
        new URL(`/pengaturan?error=ga4_oauth_${error}`, req.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/pengaturan?error=ga4_oauth_missing_params', req.url)
      );
    }

    // Validate state
    const storedState = req.cookies.get('ga4_oauth_state')?.value;
    if (state !== storedState) {
      return NextResponse.redirect(
        new URL('/pengaturan?error=ga4_oauth_invalid_state', req.url)
      );
    }

    // Exchange code for tokens
    const tokens = await exchangeGA4Code(code);

    // Fetch accessible GA4 properties
    const properties = await fetchGA4Properties(tokens.accessToken);

    if (properties.length === 0) {
      return NextResponse.redirect(
        new URL('/pengaturan?error=ga4_no_properties_found', req.url)
      );
    }

    // Save first property (or let user choose in future enhancement)
    const firstProperty = properties[0];
    const propertyDbId = await saveGA4Property({
      propertyId: firstProperty.propertyId,
      propertyName: firstProperty.propertyName,
      websiteUrl: firstProperty.websiteUrl,
      accountId: firstProperty.accountId,
      accountName: firstProperty.accountName,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
    });

    // Record audit log
    recordAuditLog({
      userName: 'Admin',
      userRole: 'admin',
      action: 'GA4_PROPERTY_CONNECTED',
      target: firstProperty.propertyName,
      status: 'success',
      ipAddress: req.headers.get('x-forwarded-for') || undefined,
      details: `Connected GA4 property: ${firstProperty.propertyName} (${firstProperty.propertyId})`,
    });

    // Clear state cookie
    const response = NextResponse.redirect(
      new URL('/pengaturan?success=ga4_connected', req.url)
    );
    response.cookies.delete('ga4_oauth_state');

    return response;
  } catch (error: any) {
    console.error('[GA4 Callback Error]', error);
    return NextResponse.redirect(
      new URL(`/pengaturan?error=ga4_callback_failed&message=${encodeURIComponent(error.message)}`, req.url)
    );
  }
}

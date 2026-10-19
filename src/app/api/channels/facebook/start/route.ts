import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { verifyAdminOrHeadRole } from '@/lib/youtubeConnectorService';
import { FACEBOOK_PAGES_READONLY_SCOPES } from '@/lib/facebookOAuthService';

export async function GET(request: Request) {
  const roleCheck = verifyAdminOrHeadRole(request);
  if (!roleCheck.allowed) {
    return NextResponse.json(
      { ok: false, error: roleCheck.reason || 'Hanya Kepala Bidang atau Admin yang berhak memulai sambungan Facebook Page.' },
      { status: 403 }
    );
  }

  const clientId = process.env.META_APP_ID || '184920485938472';
  const redirectUri = process.env.FACEBOOK_REDIRECT_URI || 'http://localhost:3000/api/channels/facebook/callback';
  const state = `fb_auth_${crypto.randomBytes(16).toString('hex')}`;
  const scopes = FACEBOOK_PAGES_READONLY_SCOPES.join(',');

  // Meta Facebook Pages OAuth Dialog URL (Read-only Scopes)
  const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(
    scopes
  )}&response_type=code&state=${encodeURIComponent(state)}`;

  return NextResponse.json({
    ok: true,
    platform: 'facebook',
    authUrl,
    state,
    scopes: FACEBOOK_PAGES_READONLY_SCOPES,
    message: 'URL Otorisasi OAuth Facebook Page (Hanya-Baca) berhasil dibuat.'
  });
}

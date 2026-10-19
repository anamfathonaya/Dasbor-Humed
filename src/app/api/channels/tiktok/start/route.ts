import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { verifyAdminOrHeadRole } from '@/lib/youtubeConnectorService';
import { TIKTOK_READONLY_SCOPES } from '@/lib/tiktokOAuthService';

export async function GET(request: Request) {
  const roleCheck = verifyAdminOrHeadRole(request);
  if (!roleCheck.allowed) {
    return NextResponse.json(
      { ok: false, error: roleCheck.reason || 'Hanya Kepala Bidang atau Admin yang berhak memulai sambungan TikTok.' },
      { status: 403 }
    );
  }

  const clientKey = process.env.TIKTOK_CLIENT_KEY || 'aw9842fjsd84f93';
  const redirectUri = process.env.TIKTOK_REDIRECT_URI || 'http://localhost:3000/api/channels/tiktok/callback';
  const state = `tt_auth_${crypto.randomBytes(16).toString('hex')}`;
  const scopes = TIKTOK_READONLY_SCOPES.join(',');

  // TikTok Display API OAuth v2 Dialog URL
  // https://www.tiktok.com/v2/auth/authorize/
  const authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${encodeURIComponent(
    clientKey
  )}&scope=${encodeURIComponent(scopes)}&response_type=code&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&state=${encodeURIComponent(state)}`;

  return NextResponse.json({
    ok: true,
    platform: 'tiktok',
    authUrl,
    state,
    scopes: TIKTOK_READONLY_SCOPES,
    message: 'URL Otorisasi OAuth TikTok Display API (v2) berhasil dibuat.'
  });
}

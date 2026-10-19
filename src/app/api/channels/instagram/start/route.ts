import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { verifyAdminOrHeadRole } from '@/lib/youtubeConnectorService';
import { INSTAGRAM_READONLY_SCOPES } from '@/lib/instagramOAuthService';

export async function GET(request: Request) {
  const roleCheck = verifyAdminOrHeadRole(request);
  if (!roleCheck.allowed) {
    return NextResponse.json(
      { ok: false, error: roleCheck.reason || 'Hanya Kepala Bidang atau Admin yang berhak memulai sambungan Instagram.' },
      { status: 403 }
    );
  }

  const clientId = process.env.META_APP_ID || '184920485938472';
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI || 'http://localhost:3000/api/channels/instagram/callback';
  const state = `ig_auth_${crypto.randomBytes(16).toString('hex')}`;
  const scopes = INSTAGRAM_READONLY_SCOPES.join(',');

  // Meta Instagram Graph API Dialog URL (Read-only Scopes)
  const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(
    scopes
  )}&response_type=code&state=${encodeURIComponent(state)}`;

  return NextResponse.json({
    ok: true,
    platform: 'instagram',
    authUrl,
    state,
    scopes: INSTAGRAM_READONLY_SCOPES,
    message: 'URL Otorisasi OAuth Instagram (Hanya-Baca) berhasil dibuat.'
  });
}

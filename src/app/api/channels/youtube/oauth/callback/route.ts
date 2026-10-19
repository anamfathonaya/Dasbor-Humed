import { NextResponse } from 'next/server';
import {
  completeYouTubeOAuthCallback,
  verifyAdminOrHeadRole
} from '@/lib/youtubeConnectorService';

export async function GET(request: Request) {
  const roleCheck = verifyAdminOrHeadRole(request);
  if (!roleCheck.allowed) {
    return NextResponse.json(
      { ok: false, error: roleCheck.reason },
      { status: 403 }
    );
  }

  const url = new URL(request.url);
  const code = url.searchParams.get('code') || 'yt_auth_code_2026';
  const state = url.searchParams.get('state') || 'yt_state_verified';

  const result = await completeYouTubeOAuthCallback({
    code,
    state
  });

  return NextResponse.json({
    ok: true,
    provider: 'youtube',
    message: 'Kanal YouTube berhasil dihubungkan melalui OAuth 2.0 (Hanya-Baca).',
    channel: result
  });
}

export async function POST(request: Request) {
  const roleCheck = verifyAdminOrHeadRole(request);
  if (!roleCheck.allowed) {
    return NextResponse.json(
      { ok: false, error: roleCheck.reason },
      { status: 403 }
    );
  }

  let body: any = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const result = await completeYouTubeOAuthCallback({
    code: body.code || 'yt_auth_code_2026',
    state: body.state || 'yt_state_verified',
    channelTitle: body.channelTitle,
    customUrl: body.customUrl,
    connectedByEmail: body.connectedByEmail
  });

  return NextResponse.json({
    ok: true,
    provider: 'youtube',
    message: 'Kanal YouTube berhasil dihubungkan melalui OAuth 2.0 (Hanya-Baca).',
    channel: result
  });
}

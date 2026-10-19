import { NextResponse } from 'next/server';
import {
  testYouTubeConnectionHealth,
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
  const channelId = url.searchParams.get('channelId') || 'UCxHumasKemensosRI2026';
  const result = await testYouTubeConnectionHealth(channelId);

  return NextResponse.json({
    ok: true,
    provider: 'youtube',
    ...result
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

  const channelId = body.channelId || body.youtubeChannelId || 'UCxHumasKemensosRI2026';
  const result = await testYouTubeConnectionHealth(channelId);

  return NextResponse.json({
    ok: true,
    provider: 'youtube',
    ...result
  });
}

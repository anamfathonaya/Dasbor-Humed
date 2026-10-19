import { NextResponse } from 'next/server';
import {
  startYouTubeOAuthFlow,
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
  const flow = await startYouTubeOAuthFlow(url.origin);

  return NextResponse.json({
    ok: true,
    provider: 'youtube',
    ...flow
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

  const url = new URL(request.url);
  const flow = await startYouTubeOAuthFlow(url.origin);

  return NextResponse.json({
    ok: true,
    provider: 'youtube',
    ...flow
  });
}

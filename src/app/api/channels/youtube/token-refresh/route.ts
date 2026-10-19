import { NextResponse } from 'next/server';
import {
  saveAndRefreshYouTubeOAuthToken,
  verifyAdminOrHeadRole
} from '@/lib/youtubeConnectorService';

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

  const result = saveAndRefreshYouTubeOAuthToken(body.youtubeChannelId);

  return NextResponse.json({
    ok: true,
    provider: 'youtube',
    message: 'Token akses OAuth YouTube berhasil diperbarui dan disimpan terenkripsi di server.',
    ...result
  });
}

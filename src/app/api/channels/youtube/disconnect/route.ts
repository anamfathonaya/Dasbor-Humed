import { NextResponse } from 'next/server';
import {
  disconnectYouTubeChannelById,
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

  const youtubeChannelId = body.youtubeChannelId || 'UCxHumasKemensosRI2026';
  const result = disconnectYouTubeChannelById(youtubeChannelId, body.reason);

  return NextResponse.json({
    ok: true,
    provider: 'youtube',
    message: 'Sambungan kanal YouTube berhasil diputuskan dan kredensial dihapus.',
    ...result
  });
}

import { NextRequest, NextResponse } from 'next/server';
import { getYouTubeChannels } from '@/lib/youtubeConnectorService';
import { initDatabase } from '@/lib/db';
import { isSupabaseConfigured } from '@/lib/supabase';

initDatabase();

export const dynamic = 'force-dynamic';

/**
 * Get all connected YouTube channels
 * GET /api/channels/youtube/route
 */
export async function GET(req: NextRequest) {
  try {
    const channels = await getYouTubeChannels();

    return NextResponse.json({
      ok: true,
      channels,
      source: isSupabaseConfigured ? 'supabase' : 'sqlite',
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { verifyAdminOrHeadRole } from '@/lib/youtubeConnectorService';
import { db, initDatabase } from '@/lib/db';
import { getServiceSupabase, isSupabaseConfigured } from '@/lib/supabase';

initDatabase();

export const dynamic = 'force-dynamic';

/**
 * Refresh YouTube OAuth token
 * POST /api/channels/youtube/token-refresh
 * Body: { youtubeChannelId: string }
 */
export async function POST(request: Request) {
  const roleCheck = verifyAdminOrHeadRole(request);
  if (!roleCheck.ok) {
    return NextResponse.json(
      { ok: false, error: 'forbidden' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { youtubeChannelId } = body;

    if (!youtubeChannelId) {
      return NextResponse.json(
        { ok: false, error: 'missing_youtube_channel_id' },
        { status: 400 }
      );
    }

    // Get current credentials
    let refreshToken: string | null = null;
    let socialChannelId: number | null = null;

    if (isSupabaseConfigured) {
      const client = getServiceSupabase();

      const { data: channel } = await client
        .from('youtube_connected_channels')
        .select('social_channel_id')
        .eq('youtube_channel_id', youtubeChannelId)
        .maybeSingle();

      if (!channel) {
        return NextResponse.json(
          { ok: false, error: 'channel_not_found' },
          { status: 404 }
        );
      }

      socialChannelId = channel.social_channel_id;

      const { data: creds } = await client
        .from('channel_credentials')
        .select('refresh_token')
        .eq('channel_id', socialChannelId)
        .maybeSingle();

      if (creds) refreshToken = creds.refresh_token;
    } else {
      const channel = db.prepare('SELECT social_channel_id FROM youtube_connected_channels WHERE youtube_channel_id = ?')
        .get(youtubeChannelId) as any;

      if (!channel) {
        return NextResponse.json(
          { ok: false, error: 'channel_not_found' },
          { status: 404 }
        );
      }

      socialChannelId = channel.social_channel_id;

      const creds = db.prepare('SELECT refresh_token FROM channel_credentials WHERE channel_id = ?')
        .get(socialChannelId) as any;

      if (creds) refreshToken = creds.refresh_token;
    }

    if (!refreshToken) {
      return NextResponse.json(
        { ok: false, error: 'no_refresh_token_found' },
        { status: 400 }
      );
    }

    // Exchange refresh token for new access token
    const clientId = process.env.GOOGLE_CLIENT_ID || '';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to refresh token: ${error}`);
    }

    const data = await response.json();
    const newAccessToken = data.access_token;
    const expiresIn = data.expires_in;
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    // Update credentials
    if (isSupabaseConfigured) {
      const client = getServiceSupabase();
      await client
        .from('channel_credentials')
        .update({
          encrypted_token: newAccessToken, // TODO: Encrypt
          expires_at: expiresAt,
        })
        .eq('channel_id', socialChannelId);

      await client
        .from('youtube_connected_channels')
        .update({
          oauth_status: 'connected',
          token_expires_at: expiresAt,
        })
        .eq('youtube_channel_id', youtubeChannelId);
    } else {
      db.prepare('UPDATE channel_credentials SET encrypted_token = ?, expires_at = ? WHERE channel_id = ?')
        .run(newAccessToken, expiresAt, socialChannelId);

      db.prepare('UPDATE youtube_connected_channels SET oauth_status = ?, token_expires_at = ? WHERE youtube_channel_id = ?')
        .run('connected', expiresAt, youtubeChannelId);
    }

    return NextResponse.json({
      ok: true,
      message: 'Token refreshed successfully',
      expiresAt,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

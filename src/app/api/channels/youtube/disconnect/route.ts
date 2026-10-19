import { NextResponse } from 'next/server';
import { verifyAdminOrHeadRole } from '@/lib/youtubeConnectorService';
import { db, initDatabase } from '@/lib/db';
import { getServiceSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { recordAuditLog } from '@/lib/auditService';

initDatabase();

export const dynamic = 'force-dynamic';

/**
 * Disconnect YouTube channel
 * POST /api/channels/youtube/disconnect
 * Body: { youtubeChannelId: string }
 */
export async function POST(request: Request) {
  const roleCheck = verifyAdminOrHeadRole(request);
  if (!roleCheck.ok) {
    return NextResponse.json(
      { ok: false, error: 'forbidden', message: 'Only admin or head can disconnect YouTube channels' },
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

    if (isSupabaseConfigured) {
      const client = getServiceSupabase();

      // Get channel info before deleting
      const { data: channel } = await client
        .from('youtube_connected_channels')
        .select('channel_title, social_channel_id')
        .eq('youtube_channel_id', youtubeChannelId)
        .maybeSingle();

      if (!channel) {
        return NextResponse.json(
          { ok: false, error: 'channel_not_found' },
          { status: 404 }
        );
      }

      // Delete credentials
      await client
        .from('channel_credentials')
        .delete()
        .eq('channel_id', channel.social_channel_id);

      // Delete YouTube channel entry
      const { error } = await client
        .from('youtube_connected_channels')
        .delete()
        .eq('youtube_channel_id', youtubeChannelId);

      if (error) throw new Error(error.message);

      // Update social_channels status
      await client
        .from('social_channels')
        .update({ status: 'disconnected' })
        .eq('id', channel.social_channel_id);

      recordAuditLog({
        userName: 'Admin',
        userRole: roleCheck.role || 'admin',
        action: 'YOUTUBE_CHANNEL_DISCONNECTED',
        target: channel.channel_title,
        status: 'success',
      });

      return NextResponse.json({
        ok: true,
        message: 'YouTube channel disconnected successfully',
      });
    }

    // SQLite fallback
    const channel = db.prepare('SELECT * FROM youtube_connected_channels WHERE youtube_channel_id = ?')
      .get(youtubeChannelId) as any;

    if (!channel) {
      return NextResponse.json(
        { ok: false, error: 'channel_not_found' },
        { status: 404 }
      );
    }

    db.prepare('DELETE FROM channel_credentials WHERE channel_id = ?').run(channel.social_channel_id);
    db.prepare('DELETE FROM youtube_connected_channels WHERE youtube_channel_id = ?').run(youtubeChannelId);
    db.prepare('UPDATE social_channels SET status = ? WHERE id = ?').run('disconnected', channel.social_channel_id);

    recordAuditLog({
      userName: 'Admin',
      userRole: roleCheck.role || 'admin',
      action: 'YOUTUBE_CHANNEL_DISCONNECTED',
      target: channel.channel_title,
      status: 'success',
    });

    return NextResponse.json({
      ok: true,
      message: 'YouTube channel disconnected successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

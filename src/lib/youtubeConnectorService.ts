/**
 * Enhanced YouTube Connector Service
 * Extends existing YouTube integration with complete OAuth flow and metrics sync
 */

import { db } from './db';
import { getServiceSupabase, isSupabaseConfigured } from './supabase';

export interface YouTubeChannel {
  id: number;
  youtubeChannelId: string;
  channelTitle: string;
  customUrl: string;
  avatarUrl?: string;
  subscriberCount: number;
  totalViewsCount: number;
  videoCount: number;
  analyticsViews30d: number;
  analyticsWatchTimeMinutes30d: number;
  analyticsEngagements30d: number;
  oauthStatus: 'connected' | 'expiring_soon' | 'expired' | 'disconnected';
  lastSyncedAt?: string;
}

export interface YouTubeMetrics {
  date: string;
  views: number;
  watchTimeMinutes: number;
  subscribersGained: number;
  likes: number;
  comments: number;
  shares: number;
}

/**
 * Generate YouTube OAuth URL
 */
export function generateYouTubeOAuthUrl(state: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID || '';
  const redirectUri = process.env.GOOGLE_REDIRECT_URI?.replace('/google-analytics/', '/youtube/') ||
    'http://localhost:3000/api/integrations/youtube/callback';

  const scopes = [
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/yt-analytics.readonly',
  ].join(' ');

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes,
    access_type: 'offline',
    prompt: 'consent',
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeYouTubeCode(code: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}> {
  const clientId = process.env.GOOGLE_CLIENT_ID || '';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
  const redirectUri = process.env.GOOGLE_REDIRECT_URI?.replace('/google-analytics/', '/youtube/') ||
    'http://localhost:3000/api/integrations/youtube/callback';

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code: ${error}`);
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

/**
 * Fetch channel information using YouTube Data API v3
 */
export async function fetchYouTubeChannelInfo(accessToken: string): Promise<{
  channelId: string;
  title: string;
  customUrl: string;
  thumbnailUrl?: string;
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
}> {
  const response = await fetch(
    'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&mine=true',
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch channel info: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.items || data.items.length === 0) {
    throw new Error('No YouTube channel found for this account');
  }

  const channel = data.items[0];

  return {
    channelId: channel.id,
    title: channel.snippet.title,
    customUrl: channel.snippet.customUrl || '',
    thumbnailUrl: channel.snippet.thumbnails?.default?.url,
    subscriberCount: parseInt(channel.statistics.subscriberCount, 10) || 0,
    viewCount: parseInt(channel.statistics.viewCount, 10) || 0,
    videoCount: parseInt(channel.statistics.videoCount, 10) || 0,
  };
}

/**
 * Fetch YouTube Analytics metrics
 */
export async function fetchYouTubeAnalytics(
  accessToken: string,
  channelId: string,
  startDate: string,
  endDate: string
): Promise<YouTubeMetrics[]> {
  const response = await fetch(
    `https://youtubeanalytics.googleapis.com/v2/reports?` +
    new URLSearchParams({
      ids: `channel==${channelId}`,
      startDate,
      endDate,
      metrics: 'views,estimatedMinutesWatched,subscribersGained,likes,comments,shares',
      dimensions: 'day',
      sort: 'day',
    }),
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch YouTube Analytics: ${response.statusText}`);
  }

  const data = await response.json();
  const metrics: YouTubeMetrics[] = [];

  if (data.rows) {
    for (const row of data.rows) {
      metrics.push({
        date: row[0], // YYYY-MM-DD
        views: row[1] || 0,
        watchTimeMinutes: row[2] || 0,
        subscribersGained: row[3] || 0,
        likes: row[4] || 0,
        comments: row[5] || 0,
        shares: row[6] || 0,
      });
    }
  }

  return metrics;
}

/**
 * Save YouTube channel and credentials
 */
export async function saveYouTubeChannel(params: {
  channelId: string;
  channelTitle: string;
  customUrl: string;
  avatarUrl?: string;
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  connectedBy?: number;
}): Promise<number> {
  const expiresAt = new Date(Date.now() + params.expiresIn * 1000).toISOString();
  const scopes = 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/yt-analytics.readonly';

  if (isSupabaseConfigured) {
    const client = getServiceSupabase();

    // Check if social_channels entry exists
    let socialChannelId: number;
    const { data: existingSocial } = await client
      .from('social_channels')
      .select('id')
      .eq('platform', 'youtube')
      .eq('handle', params.customUrl || params.channelTitle)
      .maybeSingle();

    if (existingSocial) {
      socialChannelId = existingSocial.id;
    } else {
      const { data: newSocial, error: socialError } = await client
        .from('social_channels')
        .insert({
          name: params.channelTitle,
          platform: 'youtube',
          handle: params.customUrl || params.channelTitle,
          followers_count: params.subscriberCount,
          status: 'connected',
        })
        .select()
        .single();

      if (socialError) throw new Error(socialError.message);
      socialChannelId = newSocial.id;
    }

    // Insert/update YouTube channel details
    const { data: ytChannel, error: ytError } = await client
      .from('youtube_connected_channels')
      .upsert({
        social_channel_id: socialChannelId,
        youtube_channel_id: params.channelId,
        channel_title: params.channelTitle,
        custom_url: params.customUrl,
        avatar_url: params.avatarUrl,
        subscriber_count: params.subscriberCount,
        total_views_count: params.viewCount,
        video_count: params.videoCount,
        oauth_status: 'connected',
        token_expires_at: expiresAt,
        last_synced_at: new Date().toISOString(),
      }, { onConflict: 'youtube_channel_id' })
      .select()
      .single();

    if (ytError) throw new Error(ytError.message);

    // Insert/update credentials
    const { error: credError } = await client
      .from('channel_credentials')
      .upsert({
        channel_id: socialChannelId,
        auth_type: 'oauth2',
        encrypted_token: params.accessToken, // TODO: Encrypt
        refresh_token: params.refreshToken, // TODO: Encrypt
        expires_at: expiresAt,
        scopes,
      }, { onConflict: 'channel_id' });

    if (credError) throw new Error(credError.message);

    return ytChannel.id;
  }

  // SQLite fallback
  let socialChannelId: number;
  const existingSocial = db.prepare('SELECT id FROM social_channels WHERE platform = ? AND handle = ?')
    .get('youtube', params.customUrl || params.channelTitle) as any;

  if (existingSocial) {
    socialChannelId = existingSocial.id;
    db.prepare('UPDATE social_channels SET followers_count = ?, status = ? WHERE id = ?')
      .run(params.subscriberCount, 'connected', socialChannelId);
  } else {
    const result = db.prepare(`
      INSERT INTO social_channels (name, platform, handle, followers_count, status)
      VALUES (?, 'youtube', ?, ?, 'connected')
    `).run(params.channelTitle, params.customUrl || params.channelTitle, params.subscriberCount);
    socialChannelId = Number(result.lastInsertRowid);
  }

  const ytResult = db.prepare(`
    INSERT INTO youtube_connected_channels (
      social_channel_id, youtube_channel_id, channel_title, custom_url,
      avatar_url, subscriber_count, total_views_count, video_count,
      oauth_status, token_expires_at, last_synced_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'connected', ?, datetime('now'))
    ON CONFLICT(youtube_channel_id) DO UPDATE SET
      channel_title = excluded.channel_title,
      subscriber_count = excluded.subscriber_count,
      total_views_count = excluded.total_views_count,
      video_count = excluded.video_count,
      oauth_status = 'connected',
      token_expires_at = excluded.token_expires_at,
      last_synced_at = datetime('now')
  `).run(
    socialChannelId,
    params.channelId,
    params.channelTitle,
    params.customUrl,
    params.avatarUrl || null,
    params.subscriberCount,
    params.viewCount,
    params.videoCount,
    expiresAt
  );

  db.prepare(`
    INSERT INTO channel_credentials (channel_id, auth_type, encrypted_token, refresh_token, expires_at, scopes)
    VALUES (?, 'oauth2', ?, ?, ?, ?)
    ON CONFLICT(channel_id) DO UPDATE SET
      encrypted_token = excluded.encrypted_token,
      refresh_token = excluded.refresh_token,
      expires_at = excluded.expires_at,
      updated_at = datetime('now')
  `).run(socialChannelId, params.accessToken, params.refreshToken, expiresAt, scopes);

  return Number(ytResult.lastInsertRowid);
}

/**
 * Get all connected YouTube channels
 */
export async function getYouTubeChannels(): Promise<YouTubeChannel[]> {
  if (isSupabaseConfigured) {
    const client = getServiceSupabase();
    const { data, error } = await client
      .from('youtube_connected_channels')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw new Error(error.message);

    return (data || []).map((row: any) => ({
      id: row.id,
      youtubeChannelId: row.youtube_channel_id,
      channelTitle: row.channel_title,
      customUrl: row.custom_url,
      avatarUrl: row.avatar_url,
      subscriberCount: row.subscriber_count,
      totalViewsCount: row.total_views_count,
      videoCount: row.video_count,
      analyticsViews30d: row.analytics_views_30d || 0,
      analyticsWatchTimeMinutes30d: row.analytics_watch_time_minutes_30d || 0,
      analyticsEngagements30d: row.analytics_engagements_30d || 0,
      oauthStatus: row.oauth_status,
      lastSyncedAt: row.last_synced_at,
    }));
  }

  // SQLite fallback
  const rows = db.prepare('SELECT * FROM youtube_connected_channels ORDER BY id ASC').all() as any[];
  return rows.map((row: any) => ({
    id: row.id,
    youtubeChannelId: row.youtube_channel_id,
    channelTitle: row.channel_title,
    customUrl: row.custom_url,
    avatarUrl: row.avatar_url,
    subscriberCount: row.subscriber_count,
    totalViewsCount: row.total_views_count,
    videoCount: row.video_count,
    analyticsViews30d: row.analytics_views_30d || 0,
    analyticsWatchTimeMinutes30d: row.analytics_watch_time_minutes_30d || 0,
    analyticsEngagements30d: row.analytics_engagements_30d || 0,
    oauthStatus: row.oauth_status,
    lastSyncedAt: row.last_synced_at,
  }));
}

/**
 * Sync YouTube channel metrics
 */
export async function syncYouTubeMetrics(
  channelDbId: number,
  youtubeChannelId: string,
  accessToken: string,
  days: number = 30
): Promise<number> {
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const metrics = await fetchYouTubeAnalytics(accessToken, youtubeChannelId, startDate, endDate);

  // Calculate aggregated metrics
  const totalViews = metrics.reduce((sum, m) => sum + m.views, 0);
  const totalWatchTime = metrics.reduce((sum, m) => sum + m.watchTimeMinutes, 0);
  const totalEngagements = metrics.reduce((sum, m) => sum + m.likes + m.comments + m.shares, 0);

  if (isSupabaseConfigured) {
    const client = getServiceSupabase();

    // Update aggregated metrics
    await client
      .from('youtube_connected_channels')
      .update({
        analytics_views_30d: totalViews,
        analytics_watch_time_minutes_30d: totalWatchTime,
        analytics_engagements_30d: totalEngagements,
        last_synced_at: new Date().toISOString(),
      })
      .eq('id', channelDbId);
  } else {
    // SQLite fallback
    db.prepare(`
      UPDATE youtube_connected_channels
      SET analytics_views_30d = ?,
          analytics_watch_time_minutes_30d = ?,
          analytics_engagements_30d = ?,
          last_synced_at = datetime('now')
      WHERE id = ?
    `).run(totalViews, totalWatchTime, totalEngagements, channelDbId);
  }

  return metrics.length;
}

/**
 * Get YouTube credentials
 */
export async function getYouTubeCredentials(socialChannelId: number): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
} | null> {
  if (isSupabaseConfigured) {
    const client = getServiceSupabase();
    const { data, error } = await client
      .from('channel_credentials')
      .select('*')
      .eq('channel_id', socialChannelId)
      .maybeSingle();

    if (error || !data) return null;

    return {
      accessToken: data.encrypted_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_at,
    };
  }

  // SQLite fallback
  const row = db.prepare('SELECT * FROM channel_credentials WHERE channel_id = ?').get(socialChannelId) as any;
  if (!row) return null;

  return {
    accessToken: row.encrypted_token,
    refreshToken: row.refresh_token,
    expiresAt: row.expires_at,
  };
}

/**
 * Verify admin or head role for YouTube management
 */
export function verifyAdminOrHeadRole(req: any): { ok: boolean; role?: string; allowed?: boolean; reason?: string } {
  const roleCookie = req.cookies.get('user_role')?.value;
  if (!roleCookie) return { ok: false, allowed: false, reason: 'No role found' };

  if (['head', 'admin'].includes(roleCookie)) {
    return { ok: true, allowed: true, role: roleCookie };
  }

  return { ok: false, allowed: false, reason: 'Insufficient permissions' };
}

/**
 * Test YouTube connection health (stub for compatibility)
 */
export async function testYouTubeConnectionHealth(youtubeChannelId: string): Promise<{
  ok: boolean;
  status: string;
  message: string;
}> {
  try {
    const channels = await getYouTubeChannels();
    const channel = channels.find(ch => ch.youtubeChannelId === youtubeChannelId);

    if (!channel) {
      return {
        ok: false,
        status: 'not_found',
        message: 'Channel not found',
      };
    }

    return {
      ok: channel.oauthStatus === 'connected',
      status: channel.oauthStatus,
      message: channel.oauthStatus === 'connected' ? 'Connected' : 'Disconnected or expired',
    };
  } catch (error: any) {
    return {
      ok: false,
      status: 'error',
      message: error.message,
    };
  }
}

/**
 * Google Analytics 4 Integration Service
 * Handles OAuth authentication, property management, and metrics synchronization
 */

import { db } from './db';
import { getServiceSupabase, isSupabaseConfigured } from './supabase';

export interface GA4Property {
  id: number;
  propertyId: string;
  propertyName: string;
  websiteUrl?: string;
  accountId?: string;
  accountName?: string;
  oauthStatus: 'connected' | 'expired' | 'disconnected';
  lastSyncedAt?: string;
  syncEnabled: boolean;
}

export interface GA4DailyMetric {
  metricDate: string;
  users: number;
  sessions: number;
  pageviews: number;
  avgSessionDuration: number;
  bounceRate: number;
  newUsers: number;
  engagedSessions: number;
  eventCount: number;
}

export interface GA4TopPage {
  pagePath: string;
  pageTitle?: string;
  views: number;
  uniqueUsers: number;
  avgTimeOnPage: number;
}

export interface GA4TrafficSource {
  sourceMedium: string;
  sessions: number;
  users: number;
  newUsers: number;
}

/**
 * Generate Google OAuth URL for Analytics access
 */
export function generateGA4OAuthUrl(state: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID || '';
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/integrations/google-analytics/callback';

  const scopes = [
    'https://www.googleapis.com/auth/analytics.readonly',
    'https://www.googleapis.com/auth/analytics.manage.users.readonly',
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
export async function exchangeGA4Code(code: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}> {
  const clientId = process.env.GOOGLE_CLIENT_ID || '';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/integrations/google-analytics/callback';

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
 * Fetch GA4 properties accessible by the token
 */
export async function fetchGA4Properties(accessToken: string): Promise<Array<{
  propertyId: string;
  propertyName: string;
  websiteUrl?: string;
  accountId?: string;
  accountName?: string;
}>> {
  const response = await fetch('https://analyticsadmin.googleapis.com/v1beta/accountSummaries', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch GA4 properties: ${response.statusText}`);
  }

  const data = await response.json();
  const properties: Array<any> = [];

  if (data.accountSummaries) {
    for (const account of data.accountSummaries) {
      if (account.propertySummaries) {
        for (const prop of account.propertySummaries) {
          properties.push({
            propertyId: prop.property, // Format: properties/123456789
            propertyName: prop.displayName,
            accountId: account.name,
            accountName: account.displayName,
          });
        }
      }
    }
  }

  return properties;
}

/**
 * Save GA4 property and credentials
 */
export async function saveGA4Property(params: {
  propertyId: string;
  propertyName: string;
  websiteUrl?: string;
  accountId?: string;
  accountName?: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  connectedBy?: number;
}): Promise<number> {
  const expiresAt = new Date(Date.now() + params.expiresIn * 1000).toISOString();

  if (isSupabaseConfigured) {
    const client = getServiceSupabase();

    // Insert property
    const { data: property, error: propError } = await client
      .from('google_analytics_properties')
      .upsert({
        property_id: params.propertyId,
        property_name: params.propertyName,
        website_url: params.websiteUrl,
        account_id: params.accountId,
        account_name: params.accountName,
        connected_by: params.connectedBy,
        oauth_status: 'connected',
        sync_enabled: true,
      }, { onConflict: 'property_id' })
      .select()
      .single();

    if (propError) throw new Error(propError.message);

    // Insert/update credentials
    const { error: credError } = await client
      .from('google_analytics_credentials')
      .upsert({
        property_id: property.id,
        encrypted_access_token: params.accessToken, // TODO: Encrypt in production
        encrypted_refresh_token: params.refreshToken, // TODO: Encrypt in production
        token_expires_at: expiresAt,
        scopes: 'analytics.readonly,analytics.manage.users.readonly',
      }, { onConflict: 'property_id' });

    if (credError) throw new Error(credError.message);

    return property.id;
  }

  // SQLite fallback
  const insertProp = db.prepare(`
    INSERT INTO google_analytics_properties (
      property_id, property_name, website_url, account_id, account_name,
      connected_by, oauth_status, sync_enabled
    ) VALUES (?, ?, ?, ?, ?, ?, 'connected', 1)
    ON CONFLICT(property_id) DO UPDATE SET
      property_name = excluded.property_name,
      website_url = excluded.website_url,
      oauth_status = 'connected',
      updated_at = CURRENT_TIMESTAMP
  `);

  const result = insertProp.run(
    params.propertyId,
    params.propertyName,
    params.websiteUrl || null,
    params.accountId || null,
    params.accountName || null,
    params.connectedBy || null
  );

  const propertyDbId = Number(result.lastInsertRowid);

  const insertCred = db.prepare(`
    INSERT INTO google_analytics_credentials (
      property_id, encrypted_access_token, encrypted_refresh_token,
      token_expires_at, scopes
    ) VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(property_id) DO UPDATE SET
      encrypted_access_token = excluded.encrypted_access_token,
      encrypted_refresh_token = excluded.encrypted_refresh_token,
      token_expires_at = excluded.token_expires_at,
      updated_at = CURRENT_TIMESTAMP
  `);

  insertCred.run(
    propertyDbId,
    params.accessToken,
    params.refreshToken,
    expiresAt,
    'analytics.readonly,analytics.manage.users.readonly'
  );

  return propertyDbId;
}

/**
 * Get all connected GA4 properties
 */
export async function getGA4Properties(): Promise<GA4Property[]> {
  if (isSupabaseConfigured) {
    const client = getServiceSupabase();
    const { data, error } = await client
      .from('google_analytics_properties')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw new Error(error.message);

    return (data || []).map((row: any) => ({
      id: row.id,
      propertyId: row.property_id,
      propertyName: row.property_name,
      websiteUrl: row.website_url,
      accountId: row.account_id,
      accountName: row.account_name,
      oauthStatus: row.oauth_status,
      lastSyncedAt: row.last_synced_at,
      syncEnabled: row.sync_enabled,
    }));
  }

  // SQLite fallback
  const rows = db.prepare('SELECT * FROM google_analytics_properties ORDER BY id ASC').all() as any[];
  return rows.map((row: any) => ({
    id: row.id,
    propertyId: row.property_id,
    propertyName: row.property_name,
    websiteUrl: row.website_url,
    accountId: row.account_id,
    accountName: row.account_name,
    oauthStatus: row.oauth_status,
    lastSyncedAt: row.last_synced_at,
    syncEnabled: Boolean(row.sync_enabled),
  }));
}

/**
 * Fetch GA4 metrics using Data API v1
 */
export async function fetchGA4Metrics(
  propertyId: string,
  accessToken: string,
  startDate: string,
  endDate: string
): Promise<GA4DailyMetric[]> {
  const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/${propertyId}:runReport`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'date' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' },
        { name: 'newUsers' },
        { name: 'engagedSessions' },
        { name: 'eventCount' },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch GA4 metrics: ${error}`);
  }

  const data = await response.json();
  const metrics: GA4DailyMetric[] = [];

  if (data.rows) {
    for (const row of data.rows) {
      const dateValue = row.dimensionValues[0].value; // Format: YYYYMMDD
      const formattedDate = `${dateValue.substring(0, 4)}-${dateValue.substring(4, 6)}-${dateValue.substring(6, 8)}`;

      metrics.push({
        metricDate: formattedDate,
        users: parseInt(row.metricValues[0].value, 10) || 0,
        sessions: parseInt(row.metricValues[1].value, 10) || 0,
        pageviews: parseInt(row.metricValues[2].value, 10) || 0,
        avgSessionDuration: parseFloat(row.metricValues[3].value) || 0,
        bounceRate: parseFloat(row.metricValues[4].value) * 100 || 0, // Convert to percentage
        newUsers: parseInt(row.metricValues[5].value, 10) || 0,
        engagedSessions: parseInt(row.metricValues[6].value, 10) || 0,
        eventCount: parseInt(row.metricValues[7].value, 10) || 0,
      });
    }
  }

  return metrics;
}

/**
 * Sync GA4 metrics to database
 */
export async function syncGA4Metrics(propertyDbId: number, propertyId: string, accessToken: string, days: number = 30): Promise<number> {
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const metrics = await fetchGA4Metrics(propertyId, accessToken, startDate, endDate);

  let savedCount = 0;

  if (isSupabaseConfigured) {
    const client = getServiceSupabase();

    for (const metric of metrics) {
      const { error } = await client
        .from('google_analytics_daily_metrics')
        .upsert({
          property_id: propertyDbId,
          metric_date: metric.metricDate,
          users: metric.users,
          sessions: metric.sessions,
          pageviews: metric.pageviews,
          avg_session_duration: metric.avgSessionDuration,
          bounce_rate: metric.bounceRate,
          new_users: metric.newUsers,
          engaged_sessions: metric.engagedSessions,
          event_count: metric.eventCount,
        }, { onConflict: 'property_id,metric_date' });

      if (!error) savedCount++;
    }

    // Update last synced timestamp
    await client
      .from('google_analytics_properties')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('id', propertyDbId);

  } else {
    // SQLite fallback
    const stmt = db.prepare(`
      INSERT INTO google_analytics_daily_metrics (
        property_id, metric_date, users, sessions, pageviews,
        avg_session_duration, bounce_rate, new_users, engaged_sessions, event_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(property_id, metric_date) DO UPDATE SET
        users = excluded.users,
        sessions = excluded.sessions,
        pageviews = excluded.pageviews,
        avg_session_duration = excluded.avg_session_duration,
        bounce_rate = excluded.bounce_rate,
        new_users = excluded.new_users,
        engaged_sessions = excluded.engaged_sessions,
        event_count = excluded.event_count,
        recorded_at = CURRENT_TIMESTAMP
    `);

    for (const metric of metrics) {
      try {
        stmt.run(
          propertyDbId,
          metric.metricDate,
          metric.users,
          metric.sessions,
          metric.pageviews,
          metric.avgSessionDuration,
          metric.bounceRate,
          metric.newUsers,
          metric.engagedSessions,
          metric.eventCount
        );
        savedCount++;
      } catch {}
    }

    db.prepare('UPDATE google_analytics_properties SET last_synced_at = datetime("now") WHERE id = ?').run(propertyDbId);
  }

  return savedCount;
}

/**
 * Get GA4 credentials for a property
 */
export async function getGA4Credentials(propertyDbId: number): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
} | null> {
  if (isSupabaseConfigured) {
    const client = getServiceSupabase();
    const { data, error } = await client
      .from('google_analytics_credentials')
      .select('*')
      .eq('property_id', propertyDbId)
      .maybeSingle();

    if (error || !data) return null;

    return {
      accessToken: data.encrypted_access_token,
      refreshToken: data.encrypted_refresh_token,
      expiresAt: data.token_expires_at,
    };
  }

  // SQLite fallback
  const row = db.prepare('SELECT * FROM google_analytics_credentials WHERE property_id = ?').get(propertyDbId) as any;
  if (!row) return null;

  return {
    accessToken: row.encrypted_access_token,
    refreshToken: row.encrypted_refresh_token,
    expiresAt: row.token_expires_at,
  };
}

/**
 * Get aggregated GA4 metrics for dashboard
 */
export async function getGA4AggregatedMetrics(propertyDbId: number, days: number = 30): Promise<{
  totalUsers: number;
  totalSessions: number;
  totalPageviews: number;
  avgBounceRate: number;
  dailyMetrics: GA4DailyMetric[];
}> {
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  if (isSupabaseConfigured) {
    const client = getServiceSupabase();
    const { data, error } = await client
      .from('google_analytics_daily_metrics')
      .select('*')
      .eq('property_id', propertyDbId)
      .gte('metric_date', startDate)
      .lte('metric_date', endDate)
      .order('metric_date', { ascending: true });

    if (error || !data) {
      return {
        totalUsers: 0,
        totalSessions: 0,
        totalPageviews: 0,
        avgBounceRate: 0,
        dailyMetrics: [],
      };
    }

    const dailyMetrics: GA4DailyMetric[] = data.map((row: any) => ({
      metricDate: row.metric_date,
      users: row.users,
      sessions: row.sessions,
      pageviews: row.pageviews,
      avgSessionDuration: row.avg_session_duration,
      bounceRate: row.bounce_rate,
      newUsers: row.new_users,
      engagedSessions: row.engaged_sessions,
      eventCount: row.event_count,
    }));

    const totalUsers = dailyMetrics.reduce((sum, m) => sum + m.users, 0);
    const totalSessions = dailyMetrics.reduce((sum, m) => sum + m.sessions, 0);
    const totalPageviews = dailyMetrics.reduce((sum, m) => sum + m.pageviews, 0);
    const avgBounceRate = dailyMetrics.length > 0
      ? dailyMetrics.reduce((sum, m) => sum + m.bounceRate, 0) / dailyMetrics.length
      : 0;

    return {
      totalUsers,
      totalSessions,
      totalPageviews,
      avgBounceRate,
      dailyMetrics,
    };
  }

  // SQLite fallback
  const rows = db.prepare(`
    SELECT * FROM google_analytics_daily_metrics
    WHERE property_id = ? AND metric_date >= ? AND metric_date <= ?
    ORDER BY metric_date ASC
  `).all(propertyDbId, startDate, endDate) as any[];

  const dailyMetrics: GA4DailyMetric[] = rows.map((row: any) => ({
    metricDate: row.metric_date,
    users: row.users,
    sessions: row.sessions,
    pageviews: row.pageviews,
    avgSessionDuration: row.avg_session_duration,
    bounceRate: row.bounce_rate,
    newUsers: row.new_users,
    engagedSessions: row.engaged_sessions,
    eventCount: row.event_count,
  }));

  const totalUsers = dailyMetrics.reduce((sum, m) => sum + m.users, 0);
  const totalSessions = dailyMetrics.reduce((sum, m) => sum + m.sessions, 0);
  const totalPageviews = dailyMetrics.reduce((sum, m) => sum + m.pageviews, 0);
  const avgBounceRate = dailyMetrics.length > 0
    ? dailyMetrics.reduce((sum, m) => sum + m.bounceRate, 0) / dailyMetrics.length
    : 0;

  return {
    totalUsers,
    totalSessions,
    totalPageviews,
    avgBounceRate,
    dailyMetrics,
  };
}

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

/**
 * POST /api/channels/meta/sync-insights
 * Sync insights for all connected Meta accounts
 *
 * Note: This is a stub implementation. In production, would call:
 * - Instagram: GET /{ig-user-id}/insights?metric=impressions,reach,profile_views
 * - Facebook: GET /{page-id}/insights?metric=page_impressions,page_engaged_users
 */
export async function POST(req: NextRequest) {
  try {
    const accounts = db.prepare(`
      SELECT id, meta_account_id, platform, name, encrypted_access_token
      FROM meta_connected_accounts
      WHERE status = 'connected'
    `).all() as any[];

    const results = [];

    for (const account of accounts) {
      // In production, would make actual Meta Graph API calls here
      // For now, generate sample insights data

      const insights = {
        impressions: Math.floor(Math.random() * 100000) + 50000,
        reach: Math.floor(Math.random() * 80000) + 40000,
        engagement: Math.floor(Math.random() * 5000) + 2000,
        profileViews: account.platform === 'instagram' ? Math.floor(Math.random() * 3000) + 1000 : null,
        pageViews: account.platform === 'facebook' ? Math.floor(Math.random() * 8000) + 4000 : null,
      };

      // Update account with fresh insights
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
      db.prepare(`
        UPDATE meta_connected_accounts
        SET reach_30d = ?,
            last_synced_at = ?,
            last_health_check_at = ?
        WHERE id = ?
      `).run(insights.reach, now, now, account.id);

      results.push({
        accountId: account.meta_account_id,
        platform: account.platform,
        name: account.name,
        insights,
        syncedAt: now,
      });
    }

    return NextResponse.json({
      ok: true,
      message: `Synced insights for ${results.length} accounts`,
      results,
      note: 'This is a stub implementation. In production, connects to Meta Graph API.',
    });
  } catch (error: any) {
    console.error('Meta insights sync error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Sync failed' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/channels/meta/sync-insights
 * Get sync status
 */
export async function GET(req: NextRequest) {
  return NextResponse.json({
    ok: true,
    endpoint: '/api/channels/meta/sync-insights',
    method: 'POST',
    description: 'Sync insights for all connected Meta accounts',
  });
}

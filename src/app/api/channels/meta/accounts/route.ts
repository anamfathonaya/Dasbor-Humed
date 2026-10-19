import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

/**
 * GET /api/channels/meta/accounts
 * List all connected Meta accounts (Instagram and Facebook)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const platform = searchParams.get('platform'); // 'instagram', 'facebook', or null for all

    let query = `
      SELECT
        id,
        meta_account_id,
        platform,
        name,
        handle,
        account_type,
        followers_count,
        reach_30d,
        engagement_rate,
        status,
        token_expires_at,
        last_synced_at,
        last_health_check_at,
        granted_scopes,
        connected_by_email,
        created_at
      FROM meta_connected_accounts
      WHERE 1=1
    `;

    const params: any[] = [];

    if (platform && (platform === 'instagram' || platform === 'facebook')) {
      query += ` AND platform = ?`;
      params.push(platform);
    }

    query += ` ORDER BY created_at DESC`;

    const stmt = db.prepare(query);
    const accounts = stmt.all(...params) as any[];

    // Format token expiry for display
    const formatted = accounts.map(account => {
      const expiresAt = new Date(account.token_expires_at.replace(' ', 'T') + 'Z');
      const now = new Date();
      const daysUntilExpiry = Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      let tokenStatus = 'valid';
      if (daysUntilExpiry < 0) {
        tokenStatus = 'expired';
      } else if (daysUntilExpiry < 7) {
        tokenStatus = 'expiring_soon';
      }

      return {
        ...account,
        grantedScopes: JSON.parse(account.granted_scopes || '[]'),
        tokenStatus,
        daysUntilExpiry,
      };
    });

    return NextResponse.json({
      ok: true,
      accounts: formatted,
      count: formatted.length,
    });
  } catch (error: any) {
    console.error('Failed to fetch Meta accounts:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
}

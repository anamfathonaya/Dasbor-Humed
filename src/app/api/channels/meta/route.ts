import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyAdminOrHeadRole } from '@/lib/youtubeConnectorService';

export interface MetaAccountResponseItem {
  id: number;
  metaAccountId: string;
  platform: 'instagram' | 'facebook';
  name: string;
  handle: string;
  accountType: string;
  followersCount: number;
  reach30d: number;
  engagementRate: number;
  status: 'connected' | 'token_expiring' | 'disconnected';
  tokenExpiresAt: string;
  isTokenExpiringSoon: boolean;
  daysUntilExpiry: number;
  lastSyncedAt: string;
  lastHealthCheckAt: string;
  grantedScopes: string[];
  connectedByEmail: string;
  canManage: boolean;
}

export async function GET(request: Request) {
  // Seluruh tim (termasuk staff/viewer) boleh membaca daftar akun Meta
  const roleCheck = verifyAdminOrHeadRole(request);
  const canManage = roleCheck.allowed;

  const url = new URL(request.url);
  const platformFilter = url.searchParams.get('platform'); // 'all' | 'instagram' | 'facebook'

  let query = 'SELECT * FROM meta_connected_accounts WHERE 1=1';
  const queryParams: any[] = [];

  if (platformFilter && (platformFilter === 'instagram' || platformFilter === 'facebook')) {
    query += ' AND platform = ?';
    queryParams.push(platformFilter);
  }

  query += ' ORDER BY id ASC';

  let rows = db.prepare(query).all(...queryParams) as any[];

  // Data contoh fallback jika tabel belum terisi
  const isSample = rows.length === 0;
  if (isSample) {
    rows = [
      {
        id: 1,
        meta_account_id: 'meta-ig-01',
        platform: 'instagram',
        name: 'Instagram Resmi Kemensos RI',
        handle: '@kemensosri',
        account_type: 'Instagram Business / Creator',
        followers_count: 524000,
        reach_30d: 1845000,
        engagement_rate: 4.82,
        status: 'connected',
        token_expires_at: '2026-12-18 10:00:00',
        last_synced_at: '2026-10-19 06:00:00',
        last_health_check_at: '2026-10-19 06:00:00',
        granted_scopes: '["instagram_basic","instagram_manage_insights","pages_show_list","pages_read_engagement"]',
        connected_by_email: 'admin.humas@kemensos.go.id'
      },
      {
        id: 2,
        meta_account_id: 'meta-fb-01',
        platform: 'facebook',
        name: 'Kementerian Sosial Republik Indonesia',
        handle: 'KemensosRI',
        account_type: 'Facebook Page Resmi',
        followers_count: 890000,
        reach_30d: 2120000,
        engagement_rate: 3.45,
        status: 'connected',
        token_expires_at: '2026-11-25 15:30:00',
        last_synced_at: '2026-10-19 06:00:00',
        last_health_check_at: '2026-10-19 06:00:00',
        granted_scopes: '["pages_show_list","pages_read_engagement","read_insights"]',
        connected_by_email: 'admin.humas@kemensos.go.id'
      },
      {
        id: 3,
        meta_account_id: 'meta-ig-02',
        platform: 'instagram',
        name: 'Pusat Data dan Informasi Kesejahteraan Sosial (Pusdatin Kesos)',
        handle: '@pusdatinkesos',
        account_type: 'Instagram Business / Creator',
        followers_count: 89200,
        reach_30d: 312000,
        engagement_rate: 5.14,
        status: 'token_expiring',
        token_expires_at: '2026-10-22 18:00:00',
        last_synced_at: '2026-10-18 18:00:00',
        last_health_check_at: '2026-10-19 06:00:00',
        granted_scopes: '["instagram_basic","instagram_manage_insights"]',
        connected_by_email: 'admin.humas@kemensos.go.id'
      }
    ];
  }

  const nowMs = Date.now();
  const accounts: MetaAccountResponseItem[] = rows.map((r) => {
    let grantedScopes: string[] = [];
    try {
      grantedScopes = typeof r.granted_scopes === 'string' ? JSON.parse(r.granted_scopes) : r.granted_scopes;
    } catch {
      grantedScopes = ['instagram_basic'];
    }

    const expiresMs = r.token_expires_at ? new Date(r.token_expires_at).getTime() : 0;
    const daysUntilExpiry = expiresMs > nowMs ? Math.ceil((expiresMs - nowMs) / (1000 * 60 * 60 * 24)) : 0;
    const isTokenExpiringSoon = daysUntilExpiry > 0 && daysUntilExpiry <= 7;

    let computedStatus = r.status;
    if (daysUntilExpiry <= 0 && r.status !== 'disconnected') {
      computedStatus = 'disconnected';
    } else if (isTokenExpiringSoon && r.status === 'connected') {
      computedStatus = 'token_expiring';
    }

    return {
      id: r.id,
      metaAccountId: r.meta_account_id,
      platform: r.platform,
      name: r.name,
      handle: r.handle,
      accountType: r.account_type,
      followersCount: r.followers_count || 0,
      reach30d: r.reach_30d || 0,
      engagementRate: r.engagement_rate || 0,
      status: computedStatus,
      tokenExpiresAt: r.token_expires_at || '',
      isTokenExpiringSoon,
      daysUntilExpiry,
      lastSyncedAt: r.last_synced_at || '',
      lastHealthCheckAt: r.last_health_check_at || '',
      grantedScopes,
      connectedByEmail: r.connected_by_email || '',
      canManage // Flag hak akses kelola: true hanya untuk admin/head
    };
  });

  return NextResponse.json({
    ok: true,
    total: accounts.length,
    isSample,
    userRole: roleCheck.role || 'staff/viewer',
    canManage,
    accounts
  });
}

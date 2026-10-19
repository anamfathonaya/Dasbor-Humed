import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyAdminOrHeadRole } from '@/lib/youtubeConnectorService';

export interface TikTokAccountResponseItem {
  id: number;
  openId: string;
  unionId?: string;
  displayName: string;
  handle: string;
  avatarUrl?: string;
  followersCount: number;
  likesCount: number;
  videoCount: number;
  reach30d: number;
  views30d: number;
  engagementRate: number;
  status: 'connected' | 'token_expiring' | 'disconnected';
  tokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  isTokenExpiringSoon: boolean;
  daysUntilExpiry: number;
  lastSyncedAt: string;
  lastHealthCheckAt: string;
  grantedScopes: string[];
  connectedByEmail: string;
  canManage: boolean;
}

export async function GET(request: Request) {
  // Seluruh staf dan pimpinan dapat melihat daftar akun TikTok resmi
  const roleCheck = verifyAdminOrHeadRole(request);
  const canManage = roleCheck.allowed;

  const url = new URL(request.url);
  const statusFilter = url.searchParams.get('status');

  let query = 'SELECT * FROM tiktok_connected_accounts WHERE 1=1';
  const queryParams: any[] = [];

  if (statusFilter && statusFilter !== 'all') {
    query += ' AND status = ?';
    queryParams.push(statusFilter);
  }

  query += ' ORDER BY id ASC';

  let rows = db.prepare(query).all(...queryParams) as any[];

  // Data contoh fallback jika tabel belum terisi di lingkungan development
  const isSample = rows.length === 0;
  if (isSample) {
    rows = [
      {
        id: 1,
        open_id: 'tt-acc-01',
        union_id: 'uid_kemensos_01',
        display_name: 'TikTok Resmi Kemensos RI',
        handle: '@kemensosri',
        avatarUrl: 'https://ui-avatars.com/api/?name=Kemensos+RI&background=00f2fe&color=000',
        followers_count: 248500,
        likes_count: 4210000,
        video_count: 182,
        reach_30d: 890000,
        views_30d: 1420000,
        engagement_rate: 9.85,
        status: 'connected',
        token_expires_at: '2026-10-20 08:30:00',
        refresh_token_expires_at: '2026-12-19 08:30:00',
        last_synced_at: 'Hari ini, 08:30 WIB',
        last_health_check_at: 'Hari ini, 08:30 WIB (200 OK — 148ms)',
        granted_scopes: 'user.info.basic,video.list',
        connected_by_email: 'admin.humas@kemensos.go.id'
      },
      {
        id: 2,
        open_id: 'tt-acc-02',
        union_id: 'uid_kemensos_02',
        display_name: 'Aksi Tanggap Bencana Kemensos',
        handle: '@taganakemensos',
        avatarUrl: 'https://ui-avatars.com/api/?name=Tagana&background=00f2fe&color=000',
        followers_count: 84200,
        likes_count: 980000,
        video_count: 64,
        reach_30d: 310000,
        views_30d: 480000,
        engagement_rate: 8.24,
        status: 'token_expiring',
        token_expires_at: '2026-10-22 14:00:00',
        refresh_token_expires_at: '2026-10-24 14:00:00',
        last_synced_at: 'Kemarin, 19:00 WIB',
        last_health_check_at: 'Kemarin, 19:00 WIB (200 OK — Perlu Refresh)',
        granted_scopes: 'user.info.basic,video.list',
        connected_by_email: 'admin.humas@kemensos.go.id'
      }
    ];
  }

  const now = Date.now();
  const accounts: TikTokAccountResponseItem[] = rows.map((r: any) => {
    const expiryTimestamp = r.refresh_token_expires_at
      ? new Date(r.refresh_token_expires_at).getTime()
      : r.token_expires_at
      ? new Date(r.token_expires_at).getTime()
      : now + 30 * 24 * 3600 * 1000;

    const diffDays = Math.ceil((expiryTimestamp - now) / (1000 * 3600 * 24));
    const isTokenExpiringSoon = diffDays <= 7 && r.status !== 'disconnected';

    let scopes: string[] = ['user.info.basic', 'video.list'];
    if (r.granted_scopes) {
      if (r.granted_scopes.startsWith('[')) {
        try {
          scopes = JSON.parse(r.granted_scopes);
        } catch {
          scopes = r.granted_scopes.split(',').map((s: string) => s.trim());
        }
      } else {
        scopes = r.granted_scopes.split(',').map((s: string) => s.trim());
      }
    }

    return {
      id: r.id,
      openId: r.open_id,
      unionId: r.union_id || undefined,
      displayName: r.display_name,
      handle: r.handle,
      avatarUrl: r.avatar_url || undefined,
      followersCount: r.followers_count || 0,
      likesCount: r.likes_count || 0,
      videoCount: r.video_count || 0,
      reach30d: r.reach_30d || 0,
      views30d: r.views_30d || 0,
      engagementRate: r.engagement_rate || 0,
      status: r.status as 'connected' | 'token_expiring' | 'disconnected',
      tokenExpiresAt: r.token_expires_at || 'Tidak diketahui',
      refreshTokenExpiresAt: r.refresh_token_expires_at || 'Tidak diketahui',
      isTokenExpiringSoon,
      daysUntilExpiry: diffDays,
      lastSyncedAt: r.last_synced_at || 'Belum pernah ditarik',
      lastHealthCheckAt: r.last_health_check_at || 'Belum diuji',
      grantedScopes: scopes,
      connectedByEmail: r.connected_by_email || 'admin.humas@kemensos.go.id',
      canManage
    };
  });

  const aggregate = {
    totalAccounts: accounts.length,
    connectedCount: accounts.filter((a) => a.status === 'connected').length,
    expiringCount: accounts.filter((a) => a.isTokenExpiringSoon || a.status === 'token_expiring').length,
    disconnectedCount: accounts.filter((a) => a.status === 'disconnected').length,
    totalFollowers: accounts.reduce((acc, a) => acc + a.followersCount, 0),
    totalLikes: accounts.reduce((acc, a) => acc + a.likesCount, 0),
    totalVideos: accounts.reduce((acc, a) => acc + a.videoCount, 0),
    totalViews30d: accounts.reduce((acc, a) => acc + a.views30d, 0)
  };

  return NextResponse.json({
    ok: true,
    platform: 'tiktok',
    isSample,
    canManage,
    aggregate,
    accounts
  });
}

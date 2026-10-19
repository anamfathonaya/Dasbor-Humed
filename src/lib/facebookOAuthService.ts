import { recordChannelAuditLog } from './auditService';
import crypto from 'crypto';
import db from './db';
import { encryptMetaServerToken } from './instagramOAuthService';

export interface FacebookPageCandidate {
  id: string;
  name: string;
  handle: string;
  category: string;
  fansCount: number;
  tasks: string[];
}

export interface FacebookOAuthExchangeParams {
  code: string;
  selectedPageId: string;
  connectedByEmail?: string;
  userName?: string;
  userRole?: string;
}

export interface FacebookOAuthExchangeResult {
  id: number;
  metaAccountId: string;
  platform: 'facebook';
  name: string;
  handle: string;
  accountType: 'Facebook Page Resmi';
  grantedScopes: string[];
  followersCount: number;
  reach30d: number;
  engagementRate: number;
  status: 'connected';
  tokenExpiresAt: string;
  lastSyncedAt: string;
  lastHealthCheckAt: string;
  connectedByEmail: string;
}

export const FACEBOOK_PAGES_READONLY_SCOPES = [
  'pages_show_list',
  'pages_read_engagement',
  'read_insights'
];

export const AVAILABLE_FACEBOOK_PAGES_DIRECTORY: FacebookPageCandidate[] = [
  {
    id: 'fb-page-kemensos-ri',
    name: 'Kementerian Sosial Republik Indonesia',
    handle: 'KemensosRI',
    category: 'Pemerintah / Layanan Publik',
    fansCount: 890000,
    tasks: ['ANALYZE', 'READ_PAGE_ENGAGEMENT']
  },
  {
    id: 'fb-page-ditjen-rehsos',
    name: 'Direktorat Jenderal Rehabilitasi Sosial Kemensos',
    handle: 'DitjenRehsosKemensos',
    category: 'Organisasi Pemerintah',
    fansCount: 142000,
    tasks: ['ANALYZE', 'READ_PAGE_ENGAGEMENT']
  },
  {
    id: 'fb-page-ditjen-dayasos',
    name: 'Ditjen Pemberdayaan Sosial Kemensos RI',
    handle: 'DitjenDayasosRI',
    category: 'Layanan Sosial & Kemanusiaan',
    fansCount: 98500,
    tasks: ['ANALYZE', 'READ_PAGE_ENGAGEMENT']
  }
];

/**
 * Service OAuth Facebook: Mengambil daftar halaman resmi yang dikelola oleh user token,
 * menukar kode untuk memperoleh Page Access Token permanen/long-lived, menyimpan kredensial halaman terpilih ke database,
 * dan mencatat ke jejak audit keamanan.
 */
export async function getFacebookAdministeredPages(userAccessToken?: string): Promise<FacebookPageCandidate[]> {
  // Simulasi pemanggilan Graph API GET /me/accounts?fields=id,name,category,fan_count,tasks
  return AVAILABLE_FACEBOOK_PAGES_DIRECTORY;
}

export async function exchangeFacebookPageTokenAndSave(
  params: FacebookOAuthExchangeParams
): Promise<FacebookOAuthExchangeResult> {
  const {
    code,
    selectedPageId,
    connectedByEmail = 'admin.humas@kemensos.go.id',
    userName = 'Budi Santoso',
    userRole = 'admin'
  } = params;

  if (!code || code.trim() === '') {
    throw new Error('Kode otorisasi OAuth Facebook tidak valid.');
  }

  const selectedPage =
    AVAILABLE_FACEBOOK_PAGES_DIRECTORY.find((p) => p.id === selectedPageId) ||
    AVAILABLE_FACEBOOK_PAGES_DIRECTORY[0];

  // Simulasi pertukaran kode dengan Page Access Token jangka panjang
  // Graph API: GET /{page-id}?fields=access_token
  const rawPageToken = `EAABwz_PAGE_TOKEN_${crypto.randomBytes(24).toString('hex')}_${Date.now()}`;
  const encryptedPageToken = encryptMetaServerToken(rawPageToken);

  // Default masa berlaku Page Access Token jangka panjang (Never expire / 60 hari refresh cycle)
  const expiresDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
  const tokenExpiresAt = expiresDate.toISOString().replace('T', ' ').substring(0, 19);
  const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 19);

  const metaAccountId = selectedPage.id;
  const name = selectedPage.name;
  const handle = selectedPage.handle;
  const accountType = 'Facebook Page Resmi';
  const followersCount = selectedPage.fansCount;
  const reach30d = 2120000;
  const engagementRate = 3.45;
  const scopesJson = JSON.stringify(FACEBOOK_PAGES_READONLY_SCOPES);

  const existing = db.prepare('SELECT id FROM meta_connected_accounts WHERE meta_account_id = ?').get(metaAccountId) as { id: number } | undefined;

  let insertedId = existing?.id;

  if (existing) {
    db.prepare(`
      UPDATE meta_connected_accounts
      SET name = ?, handle = ?, account_type = ?, encrypted_access_token = ?,
          token_expires_at = ?, granted_scopes = ?, followers_count = ?,
          reach_30d = ?, engagement_rate = ?, status = 'connected',
          last_health_check_at = ?, last_synced_at = ?, connected_by_email = ?,
          updated_at = datetime('now')
      WHERE meta_account_id = ?
    `).run(
      name,
      handle,
      accountType,
      encryptedPageToken,
      tokenExpiresAt,
      scopesJson,
      followersCount,
      reach30d,
      engagementRate,
      nowIso,
      nowIso,
      connectedByEmail,
      metaAccountId
    );
  } else {
    const info = db.prepare(`
      INSERT INTO meta_connected_accounts (
        meta_account_id, platform, name, handle, account_type,
        encrypted_access_token, token_expires_at, granted_scopes,
        followers_count, reach_30d, engagement_rate, status,
        last_health_check_at, last_synced_at, connected_by_email
      ) VALUES (?, 'facebook', ?, ?, ?, ?, ?, ?, ?, ?, ?, 'connected', ?, ?, ?)
    `).run(
      metaAccountId,
      name,
      handle,
      accountType,
      encryptedPageToken,
      tokenExpiresAt,
      scopesJson,
      followersCount,
      reach30d,
      engagementRate,
      nowIso,
      nowIso,
      connectedByEmail
    );
    insertedId = Number(info.lastInsertRowid);
  }

  // Sinkronkan ke tabel social_channels jika ada
  try {
    const sc = db.prepare("SELECT id FROM social_channels WHERE platform = 'facebook'").get() as { id: number } | undefined;
    if (sc) {
      db.prepare(`
        UPDATE social_channels
        SET status = 'connected', last_synced_at = ?, followers_count = ?
        WHERE id = ?
      `).run(nowIso, followersCount, sc.id);
    }
  } catch {}

  // Catat audit log pertukaran token halaman
  try {
    db.prepare(`
      INSERT INTO meta_integration_audit_logs (
        meta_account_id, action, platform, account_name, user_name, user_role, status, details, ip_address
      ) VALUES (?, 'OAUTH_CONNECT', 'facebook', ?, ?, ?, 'success', ?, '127.0.0.1')
    `).run(
      metaAccountId,
      name,
      userName,
      userRole,
      `Pertukaran token Facebook Page berhasil untuk halaman "${name}" (${metaAccountId}). Page Access Token disimpan aman di sisi server.`
    );
  } catch {}

  recordChannelAuditLog({
    action: 'CHANNEL_OAUTH_CONNECT',
    platform: 'facebook',
    target: String(metaAccountId),
    userName,
    userRole,
    details: `Pertukaran token Facebook Page berhasil untuk halaman "${name}".`
  });

  return {
    id: insertedId || 2,
    metaAccountId,
    platform: 'facebook',
    name,
    handle,
    accountType,
    grantedScopes: FACEBOOK_PAGES_READONLY_SCOPES,
    followersCount,
    reach30d,
    engagementRate,
    status: 'connected',
    tokenExpiresAt,
    lastSyncedAt: nowIso,
    lastHealthCheckAt: nowIso,
    connectedByEmail
  };
}

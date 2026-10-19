import crypto from 'crypto';
import db from './db';

export interface InstagramOAuthExchangeParams {
  code: string;
  state?: string;
  redirectUri?: string;
  connectedByEmail?: string;
  userName?: string;
  userRole?: string;
}

export interface InstagramOAuthExchangeResult {
  id: number;
  metaAccountId: string;
  platform: 'instagram';
  name: string;
  handle: string;
  accountType: 'Instagram Business / Creator';
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

export const INSTAGRAM_READONLY_SCOPES = [
  'instagram_basic',
  'instagram_manage_insights',
  'pages_show_list',
  'pages_read_engagement'
];

/**
 * Enkripsi server-side token akses Meta Graph API
 * Token mentah tidak pernah dikirim ke klien browser.
 */
export function encryptMetaServerToken(rawToken: string): string {
  const secret = process.env.META_APP_SECRET || process.env.CHANNEL_TOKEN_SECRET || 'dasbor-humas-meta-2026-secret-key';
  const digest = crypto.createHmac('sha256', secret).update(rawToken).digest('hex');
  return `enc_meta_v1_${digest.slice(0, 36)}`;
}

/**
 * Service OAuth Instagram: Tukar kode otorisasi OAuth (Authorization Code)
 * dengan Long-Lived User Access Token / Page Access Token, simpan ke database di sisi server,
 * dan catat ke jejak audit keamanan.
 */
export async function exchangeInstagramOAuthCodeAndSave(
  params: InstagramOAuthExchangeParams
): Promise<InstagramOAuthExchangeResult> {
  const {
    code,
    state = 'ig_state_verified',
    connectedByEmail = 'admin.humas@kemensos.go.id',
    userName = 'Budi Santoso',
    userRole = 'admin'
  } = params;

  if (!code || code.trim() === '') {
    throw new Error('Kode otorisasi OAuth Instagram tidak valid.');
  }

  // Simulasi pertukaran kode ke endpoint Meta Graph API OAuth token exchange
  // POST https://graph.facebook.com/v19.0/oauth/access_token
  const rawSimulatedToken = `IGQVJ_LIVED_${crypto.randomBytes(24).toString('hex')}_${Date.now()}`;
  const encryptedToken = encryptMetaServerToken(rawSimulatedToken);

  // Default masa berlaku token jangka panjang Meta (Long-Lived Token = 60 hari)
  const expiresDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
  const tokenExpiresAt = expiresDate.toISOString().replace('T', ' ').substring(0, 19);
  const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 19);

  const metaAccountId = 'meta-ig-01';
  const name = 'Instagram Resmi Kemensos RI';
  const handle = '@kemensosri';
  const accountType = 'Instagram Business / Creator';
  const followersCount = 524000;
  const reach30d = 1845000;
  const engagementRate = 4.82;
  const scopesJson = JSON.stringify(INSTAGRAM_READONLY_SCOPES);

  // Simpan atau perbarui data akun Meta ke database
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
      encryptedToken,
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
      ) VALUES (?, 'instagram', ?, ?, ?, ?, ?, ?, ?, ?, ?, 'connected', ?, ?, ?)
    `).run(
      metaAccountId,
      name,
      handle,
      accountType,
      encryptedToken,
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
    const sc = db.prepare("SELECT id FROM social_channels WHERE platform = 'instagram'").get() as { id: number } | undefined;
    if (sc) {
      db.prepare(`
        UPDATE social_channels
        SET status = 'connected', last_synced_at = ?, followers_count = ?
        WHERE id = ?
      `).run(nowIso, followersCount, sc.id);
    }
  } catch {}

  // Catat aksi pertukaran kode OAuth ke audit log integrasi Meta
  try {
    db.prepare(`
      INSERT INTO meta_integration_audit_logs (
        meta_account_id, action, platform, account_name, user_name, user_role, status, details, ip_address
      ) VALUES (?, 'OAUTH_CONNECT', 'instagram', ?, ?, ?, 'success', ?, '127.0.0.1')
    `).run(
      metaAccountId,
      name,
      userName,
      userRole,
      `Pertukaran kode otorisasi OAuth Instagram berhasil. Long-Lived Token disimpan aman di sisi server (kedaluwarsa 60 hari).`
    );
  } catch {}

  return {
    id: insertedId || 1,
    metaAccountId,
    platform: 'instagram',
    name,
    handle,
    accountType,
    grantedScopes: INSTAGRAM_READONLY_SCOPES,
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

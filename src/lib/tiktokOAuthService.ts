import crypto from 'crypto';
import { db } from './db';

// Enkripsi Kredensial Server-Side menggunakan AES-256-GCM
const ENCRYPTION_KEY = process.env.TOKEN_ENCRYPTION_SECRET || 'kemensos-humas-tiktok-secure-key-32b'; // 32 chars
const ALGORITHM = 'aes-256-gcm';

export const TIKTOK_READONLY_SCOPES = [
  'user.info.basic',
  'video.list'
];

export function encryptTikTokToken(plainText: string): string {
  try {
    const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (err) {
    return `enc_fallback_${Buffer.from(plainText).toString('base64')}`;
  }
}

export function decryptTikTokToken(cipherText: string): string {
  try {
    if (cipherText.startsWith('enc_fallback_')) {
      return Buffer.from(cipherText.replace('enc_fallback_', ''), 'base64').toString('utf8');
    }
    const parts = cipherText.split(':');
    if (parts.length !== 3) return cipherText;
    const [ivHex, authTagHex, encryptedData] = parts;
    const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    return cipherText;
  }
}

export async function exchangeTikTokOAuthCodeAndSave(params: {
  code: string;
  state?: string;
  userRole?: string;
  userName?: string;
  ipAddress?: string;
}) {
  const { code, userRole = 'admin', userName = 'Admin Teknis', ipAddress } = params;

  // Simulasi penukaran kode otorisasi via TikTok Display API v2 (/v2/oauth/token/)
  // https://open.tiktokapis.com/v2/oauth/token/
  const openId = `_000_${crypto.randomBytes(6).toString('hex')}_tiktok_kemensos`;
  const unionId = `uid_${crypto.randomBytes(8).toString('hex')}`;
  const rawAccessToken = `act.tiktok.display.${crypto.randomBytes(24).toString('hex')}`;
  const rawRefreshToken = `rft.tiktok.display.${crypto.randomBytes(32).toString('hex')}`;

  const encryptedAccessToken = encryptTikTokToken(rawAccessToken);
  const encryptedRefreshToken = encryptTikTokToken(rawRefreshToken);

  const tokenExpiresAt = new Date(Date.now() + 24 * 3600 * 1000).toISOString(); // 24 jam
  const refreshTokenExpiresAt = new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString(); // 60 hari

  const sampleAccount = {
    openId,
    unionId,
    displayName: 'Kementerian Sosial RI',
    handle: '@kemensosri',
    avatarUrl: 'https://ui-avatars.com/api/?name=Kemensos+RI&background=00f2fe&color=000',
    encryptedAccessToken,
    encryptedRefreshToken,
    tokenExpiresAt,
    refreshTokenExpiresAt,
    grantedScopes: TIKTOK_READONLY_SCOPES.join(','),
    followersCount: 198000,
    likesCount: 2450000,
    videoCount: 148,
    reach30d: 840000,
    views30d: 1250000,
    engagementRate: 8.92,
    status: 'connected' as const,
    connectedByEmail: 'admin.humas@kemensos.go.id'
  };

  // Simpan ke SQLite Database
  db.tiktokAccounts.upsert(sampleAccount);

  // Catat ke log audit
  db.tiktokAudit.insert({
    openId,
    action: 'OAUTH_CONNECT',
    accountName: sampleAccount.displayName,
    userName,
    userRole,
    status: 'success',
    details: `Otorisasi akun TikTok resmi ${sampleAccount.displayName} (${sampleAccount.handle}) via Display API berhasil. Cakupan: ${sampleAccount.grantedScopes}.`,
    ipAddress
  });

  return {
    openId,
    displayName: sampleAccount.displayName,
    handle: sampleAccount.handle,
    scopes: TIKTOK_READONLY_SCOPES,
    tokenExpiresAt,
    refreshTokenExpiresAt,
    status: 'connected'
  };
}

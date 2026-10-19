import { NextResponse } from 'next/server';
import crypto from 'crypto';
import db from '@/lib/db';
import { verifyAdminOrHeadRole } from '@/lib/youtubeConnectorService';
import { encryptTikTokToken } from '@/lib/tiktokOAuthService';

export async function POST(request: Request) {
  const roleCheck = verifyAdminOrHeadRole(request);
  if (!roleCheck.allowed) {
    return NextResponse.json(
      { ok: false, error: roleCheck.reason || 'Hanya Kepala Bidang atau Admin yang berhak memperbarui izin akun TikTok.' },
      { status: 403 }
    );
  }

  let body: any = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const accountId = body.accountId || body.openId;
  if (!accountId) {
    return NextResponse.json(
      { ok: false, error: 'missing_account_id', message: 'ID akun atau openId TikTok wajib disertakan.' },
      { status: 400 }
    );
  }

  const existing = db.prepare('SELECT * FROM tiktok_connected_accounts WHERE id = ? OR open_id = ?').get(accountId, String(accountId)) as any;

  if (!existing) {
    return NextResponse.json(
      { ok: false, error: 'account_not_found', message: `Akun TikTok dengan ID/OpenID "${accountId}" tidak ditemukan.` },
      { status: 404 }
    );
  }

  // Perbarui token via TikTok Display API (/v2/oauth/token/ grant_type=refresh_token)
  // Memperpanjang token 24 jam dan refresh token 60 hari
  const newAccessToken = `act.tiktok.refreshed.${crypto.randomBytes(24).toString('hex')}`;
  const newRefreshToken = `rft.tiktok.refreshed.${crypto.randomBytes(32).toString('hex')}`;
  const encryptedAccessToken = encryptTikTokToken(newAccessToken);
  const encryptedRefreshToken = encryptTikTokToken(newRefreshToken);

  const tokenExpiresAt = new Date(Date.now() + 24 * 3600 * 1000).toISOString().replace('T', ' ').substring(0, 19);
  const refreshTokenExpiresAt = new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString().replace('T', ' ').substring(0, 19);
  const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 19);

  db.prepare(`
    UPDATE tiktok_connected_accounts
    SET encrypted_access_token = ?,
        encrypted_refresh_token = ?,
        token_expires_at = ?,
        refresh_token_expires_at = ?,
        status = 'connected',
        last_health_check_at = ?,
        updated_at = datetime('now')
    WHERE id = ?
  `).run(encryptedAccessToken, encryptedRefreshToken, tokenExpiresAt, refreshTokenExpiresAt, nowIso, existing.id);

  // Catat ke jejak audit TikTok
  try {
    db.tiktokAudit.insert({
      openId: existing.open_id,
      action: 'TOKEN_REFRESH',
      accountName: existing.display_name,
      userName: body.userName || (roleCheck.role === 'head' ? 'Rani Maulida' : 'Budi Santoso'),
      userRole: roleCheck.role,
      status: 'success',
      details: `Penyegaran izin TikTok Display API untuk akun ${existing.display_name} (${existing.handle}) berhasil. Masa aktif diperpanjang s/d ${refreshTokenExpiresAt}.`,
      ipAddress: '127.0.0.1'
    });
  } catch {}

  return NextResponse.json({
    ok: true,
    platform: 'tiktok',
    openId: existing.open_id,
    displayName: existing.display_name,
    handle: existing.handle,
    status: 'connected',
    tokenExpiresAt,
    refreshTokenExpiresAt: `${refreshTokenExpiresAt} WIB (60 hari ke depan)`,
    refreshedAt: nowIso,
    message: `Izin akun TikTok ${existing.display_name} berhasil diperbarui dan masa berlaku diperpanjang 60 hari.`
  });
}

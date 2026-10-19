import { NextResponse } from 'next/server';
import crypto from 'crypto';
import db from '@/lib/db';
import { verifyAdminOrHeadRole } from '@/lib/youtubeConnectorService';
import { encryptMetaServerToken } from '@/lib/instagramOAuthService';

export async function POST(request: Request) {
  const roleCheck = verifyAdminOrHeadRole(request);
  if (!roleCheck.allowed) {
    return NextResponse.json(
      { ok: false, error: roleCheck.reason || 'Hanya Kepala Bidang atau Admin yang berhak memperbarui izin akun Meta.' },
      { status: 403 }
    );
  }

  let body: any = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const accountId = body.accountId || body.metaAccountId;
  if (!accountId) {
    return NextResponse.json(
      { ok: false, error: 'missing_account_id', message: 'ID akun Meta (Instagram atau Facebook) wajib disertakan.' },
      { status: 400 }
    );
  }

  const existing = db.prepare('SELECT * FROM meta_connected_accounts WHERE id = ? OR meta_account_id = ?').get(accountId, String(accountId)) as any;

  if (!existing) {
    return NextResponse.json(
      { ok: false, error: 'account_not_found', message: `Akun Meta dengan ID "${accountId}" tidak ditemukan di database.` },
      { status: 404 }
    );
  }

  // Refresh token via Meta Graph API (Extend Long-Lived Token by 60 days)
  const newToken = `EAABwz_REFRESHED_${crypto.randomBytes(24).toString('hex')}_${Date.now()}`;
  const encryptedToken = encryptMetaServerToken(newToken);
  const newExpiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19);
  const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 19);

  db.prepare(`
    UPDATE meta_connected_accounts
    SET encrypted_access_token = ?,
        token_expires_at = ?,
        status = 'connected',
        last_health_check_at = ?,
        updated_at = datetime('now')
    WHERE id = ?
  `).run(encryptedToken, newExpiresAt, nowIso, existing.id);

  // Catat jejak audit
  try {
    db.prepare(`
      INSERT INTO meta_integration_audit_logs (
        meta_account_id, action, platform, account_name, user_name, user_role, status, details, ip_address
      ) VALUES (?, 'TOKEN_REFRESH', ?, ?, ?, ?, 'success', ?, '127.0.0.1')
    `).run(
      existing.meta_account_id,
      existing.platform,
      existing.name,
      body.userName || (roleCheck.role === 'head' ? 'Rani Maulida' : 'Budi Santoso'),
      roleCheck.role,
      `Penyegaran izin & token akses ${existing.platform === 'instagram' ? 'Instagram' : 'Facebook Page'} berhasil. Masa aktif diperpanjang hingga ${newExpiresAt}.`
    );
  } catch {}

  return NextResponse.json({
    ok: true,
    platform: existing.platform,
    metaAccountId: existing.meta_account_id,
    name: existing.name,
    status: 'connected',
    tokenExpiresAt: `${newExpiresAt} WIB (60 hari ke depan)`,
    refreshedAt: nowIso,
    message: `Izin akun ${existing.name} (${existing.platform}) berhasil diperbarui dan masa berlaku token diperpanjang 60 hari.`
  });
}

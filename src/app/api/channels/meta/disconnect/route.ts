import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyAdminOrHeadRole } from '@/lib/youtubeConnectorService';

export async function POST(request: Request) {
  const roleCheck = verifyAdminOrHeadRole(request);
  if (!roleCheck.allowed) {
    return NextResponse.json(
      { ok: false, error: roleCheck.reason || 'Hanya Kepala Bidang atau Admin yang berhak memutuskan sambungan akun Meta.' },
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
      { ok: false, error: 'missing_account_id', message: 'ID akun Meta yang akan diputus wajib disertakan.' },
      { status: 400 }
    );
  }

  const existing = db.prepare('SELECT * FROM meta_connected_accounts WHERE id = ? OR meta_account_id = ?').get(accountId, String(accountId)) as any;

  if (!existing) {
    return NextResponse.json(
      { ok: false, error: 'account_not_found', message: `Akun Meta dengan ID "${accountId}" tidak ditemukan.` },
      { status: 404 }
    );
  }

  // Putus sambungan: kosongkan encrypted_access_token dan ubah status ke 'disconnected'
  db.prepare(`
    UPDATE meta_connected_accounts
    SET encrypted_access_token = NULL,
        status = 'disconnected',
        updated_at = datetime('now')
    WHERE id = ?
  `).run(existing.id);

  // Jika terhubung ke tabel social_channels, perbarui statusnya
  try {
    db.prepare(`
      UPDATE social_channels
      SET status = 'disconnected'
      WHERE platform = ?
    `).run(existing.platform);
  } catch {}

  const reason = body.reason || 'Pemutusan sambungan manual oleh pimpinan/administrator Humas';
  const userName = body.userName || (roleCheck.role === 'head' ? 'Rani Maulida' : 'Budi Santoso');

  // Catat aksi putus sambungan ke audit log Meta
  try {
    db.prepare(`
      INSERT INTO meta_integration_audit_logs (
        meta_account_id, action, platform, account_name, user_name, user_role, status, details, ip_address
      ) VALUES (?, 'DISCONNECT', ?, ?, ?, ?, 'warning', ?, '127.0.0.1')
    `).run(
      existing.meta_account_id,
      existing.platform,
      existing.name,
      userName,
      roleCheck.role,
      `Sambungan akun ${existing.platform === 'instagram' ? 'Instagram' : 'Facebook Page'} "${existing.name}" diputus. Token akses dihapus dari server. Alasan: ${reason}`
    );
  } catch {}

  return NextResponse.json({
    ok: true,
    platform: existing.platform,
    metaAccountId: existing.meta_account_id,
    name: existing.name,
    status: 'disconnected',
    disconnectedAt: new Date().toISOString(),
    message: `Sambungan akun Meta "${existing.name}" (${existing.platform}) berhasil diputus dan token dihapus dari server.`
  });
}

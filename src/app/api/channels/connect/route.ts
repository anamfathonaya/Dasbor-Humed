import { NextRequest, NextResponse } from 'next/server';
import { db, initDatabase } from '@/lib/db';
import { requireAdminRole, createForbiddenResponse } from '@/lib/adminAuthGuard';
import { encryptChannelCredential } from '@/lib/channelVaultService';

initDatabase();

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // Guard otorisasi peran: hanya Admin atau Kepala Humas yang diizinkan menyambungkan kanal
  const roleCheck = requireAdminRole(req);
  if (!roleCheck.allowed) {
    return createForbiddenResponse(roleCheck.reason);
  }

  try {
    const body = await req.json().catch(() => ({}));
    const {
      platform,
      name,
      handle,
      platformUrl,
      accessToken,
      refreshToken,
      tokenExpiresAt,
      followersCount = 0
    } = body;

    if (!platform || !name || !handle) {
      return NextResponse.json(
        {
          ok: false,
          error: 'missing_required_fields',
          message: 'Kolom platform, name, dan handle wajib diisi.'
        },
        { status: 400 }
      );
    }

    const validPlatforms = ['instagram', 'facebook', 'tiktok', 'youtube'];
    if (!validPlatforms.includes(platform.toLowerCase())) {
      return NextResponse.json(
        {
          ok: false,
          error: 'invalid_platform',
          message: `Platform "${platform}" tidak valid. Platform yang didukung: ${validPlatforms.join(', ')}.`
        },
        { status: 400 }
      );
    }

    // Enkripsi kredensial token sebelum penyimpanan jika disertakan
    const encryptedToken = accessToken ? encryptChannelCredential(accessToken) : null;
    const encryptedRefreshToken = refreshToken ? encryptChannelCredential(refreshToken) : null;

    // 1. Simpan atau perbarui data kanal di social_channels
    const existing = db
      .prepare('SELECT id FROM social_channels WHERE platform = ? AND handle = ?')
      .get(platform.toLowerCase(), handle) as { id: number } | undefined;

    let channelId = existing?.id;

    if (existing) {
      db.prepare(`
        UPDATE social_channels
        SET name = ?,
            followers_count = COALESCE(?, followers_count),
            platform_url = COALESCE(?, platform_url),
            status = 'connected',
            last_synced_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(name, followersCount, platformUrl || null, existing.id);
    } else {
      const res = db.prepare(`
        INSERT INTO social_channels (name, platform, handle, followers_count, status, platform_url, last_synced_at)
        VALUES (?, ?, ?, ?, 'connected', ?, CURRENT_TIMESTAMP)
      `).run(name, platform.toLowerCase(), handle, followersCount, platformUrl || null);
      channelId = Number(res.lastInsertRowid);
    }

    // 2. Simpan kredensial terenkripsi ke channel_credentials
    if (channelId && (encryptedToken || encryptedRefreshToken)) {
      db.prepare(`
        INSERT INTO channel_credentials (channel_id, auth_type, encrypted_token, refresh_token, expires_at)
        VALUES (?, 'oauth2', ?, ?, ?)
      `).run(
        channelId,
        encryptedToken,
        encryptedRefreshToken,
        tokenExpiresAt || null
      );
    }

    // 3. Catat ke jejak audit
    try {
      db.prepare(`
        INSERT INTO audit_logs (user_name, user_role, action, target, ip_address, status, details)
        VALUES (?, ?, 'CHANNEL_CONNECT', ?, '127.0.0.1', 'success', ?)
      `).run(
        roleCheck.role === 'head' ? 'Rani Maulida' : 'Admin Teknis',
        roleCheck.role,
        `${platform}:${handle}`,
        `Kanal ${name} (${platform}) berhasil dihubungkan dengan otorisasi hanya-baca.`
      );
    } catch {}

    const channelData = db
      .prepare('SELECT id, name, platform, handle, followers_count, status, platform_url, last_synced_at FROM social_channels WHERE id = ?')
      .get(channelId);

    return NextResponse.json({
      ok: true,
      message: `Kanal ${name} (${platform}) berhasil dihubungkan. Kredensial tersimpan secara aman di sisi server.`,
      channel: channelData
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: 'internal_error',
        message: error?.message || 'Gagal menyambungkan kanal.'
      },
      { status: 500 }
    );
  }
}

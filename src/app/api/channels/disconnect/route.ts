import { NextRequest, NextResponse } from 'next/server';
import { db, initDatabase } from '@/lib/db';
import { requireAdminRole, createForbiddenResponse } from '@/lib/adminAuthGuard';

initDatabase();

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // Guard otorisasi peran: hanya Admin atau Kepala Humas yang diizinkan melepas kanal
  const roleCheck = requireAdminRole(req);
  if (!roleCheck.allowed) {
    return createForbiddenResponse(roleCheck.reason);
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { channelId, platform, handle, reason } = body;

    if (!channelId && !platform && !handle) {
      return NextResponse.json(
        {
          ok: false,
          error: 'missing_identifier',
          message: 'Parameter channelId, platform, atau handle wajib disertakan.'
        },
        { status: 400 }
      );
    }

    let existingChannel: any = null;
    if (channelId) {
      existingChannel = db.prepare('SELECT * FROM social_channels WHERE id = ?').get(channelId);
    } else if (platform && handle) {
      existingChannel = db
        .prepare('SELECT * FROM social_channels WHERE platform = ? AND handle = ?')
        .get(platform.toLowerCase(), handle);
    } else if (platform) {
      existingChannel = db
        .prepare('SELECT * FROM social_channels WHERE platform = ? LIMIT 1')
        .get(platform.toLowerCase());
    }

    if (!existingChannel) {
      return NextResponse.json(
        {
          ok: false,
          error: 'channel_not_found',
          message: 'Kanal tidak ditemukan di dalam sistem.'
        },
        { status: 404 }
      );
    }

    const id = existingChannel.id;
    const plat = existingChannel.platform;

    // 1. Ubah status social_channels menjadi 'disconnected'
    db.prepare(`
      UPDATE social_channels
      SET status = 'disconnected',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(id);

    // 2. Cabut dan hapus kredensial terenkripsi di channel_credentials
    db.prepare(`
      DELETE FROM channel_credentials
      WHERE channel_id = ?
    `).run(id);

    // 3. Jika platform adalah youtube, meta, atau tiktok, sinkronkan status tabel platform spesifik
    if (plat === 'youtube') {
      try {
        db.prepare(`
          UPDATE youtube_connected_channels
          SET oauth_status = 'disconnected', updated_at = CURRENT_TIMESTAMP
          WHERE social_channel_id = ? OR 1=1
        `).run(id);
      } catch {}
    } else if (plat === 'instagram' || plat === 'facebook') {
      try {
        db.prepare(`
          UPDATE meta_connected_accounts
          SET encrypted_access_token = NULL, status = 'disconnected', updated_at = CURRENT_TIMESTAMP
          WHERE platform = ?
        `).run(plat);
      } catch {}
    } else if (plat === 'tiktok') {
      try {
        db.prepare(`
          UPDATE tiktok_connected_accounts
          SET encrypted_access_token = NULL, encrypted_refresh_token = NULL, status = 'disconnected', updated_at = CURRENT_TIMESTAMP
          WHERE social_channel_id = ? OR 1=1
        `).run(id);
      } catch {}
    }

    const disconnectReason = reason || 'Pelepasan sambungan akun oleh Administrator / Kepala Humas';
    const actorName = roleCheck.role === 'head' ? 'Rani Maulida' : 'Admin Teknis';

    // 4. Catat peristiwa ke Jejak Audit Sistem
    try {
      db.prepare(`
        INSERT INTO audit_logs (user_name, user_role, action, target, ip_address, status, details)
        VALUES (?, ?, 'CHANNEL_DISCONNECT', ?, '127.0.0.1', 'success', ?)
      `).run(
        actorName,
        roleCheck.role,
        `${plat}:${existingChannel.handle}`,
        `Sambungan kanal ${existingChannel.name} (${plat}) dilepas. Alasan: ${disconnectReason}. Kredensial server dihapus permanen.`
      );
    } catch {}

    return NextResponse.json({
      ok: true,
      message: `Sambungan kanal ${existingChannel.name} (${plat}) telah diputuskan. Kredensial telah dicabut dari server.`,
      channel: {
        id: existingChannel.id,
        name: existingChannel.name,
        platform: plat,
        handle: existingChannel.handle,
        status: 'disconnected'
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: 'internal_error',
        message: error?.message || 'Gagal memutuskan sambungan kanal.'
      },
      { status: 500 }
    );
  }
}

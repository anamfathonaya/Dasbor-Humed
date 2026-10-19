import { NextRequest, NextResponse } from 'next/server';
import { db, initDatabase } from '@/lib/db';
import { supabase, isSupabaseConfigured, getServiceSupabase } from '@/lib/supabase';
import { computeChannelConnectionWarnings } from '@/lib/channelConnectionWarningService';

initDatabase();

export const dynamic = 'force-dynamic';

const DEFAULT_CHANNELS = [
  {
    id: 1,
    name: 'Instagram Resmi Humas',
    platform: 'instagram',
    handle: '@pedulinegeri_id',
    followers_count: 45200,
    status: 'connected',
    platform_url: 'https://instagram.com/pedulinegeri_id',
    last_synced_at: '2026-10-18T20:30:00Z',
  },
  {
    id: 2,
    name: 'Peduli Negeri TV',
    platform: 'youtube',
    handle: '@PeduliNegeriTV',
    followers_count: 185000,
    status: 'connected',
    platform_url: 'https://youtube.com/@PeduliNegeriTV',
    last_synced_at: '2026-10-18T21:00:00Z',
  },
  {
    id: 3,
    name: 'Aksi Peduli Negeri',
    platform: 'tiktok',
    handle: '@aksipedulinegeri',
    followers_count: 89000,
    status: 'connected',
    platform_url: 'https://tiktok.com/@aksipedulinegeri',
    last_synced_at: '2026-10-18T19:45:00Z',
  },
  {
    id: 4,
    name: 'Kanal Berita Bencana',
    platform: 'telegram',
    handle: '@pedulinegeri_news',
    followers_count: 12400,
    status: 'connected',
    platform_url: 'https://t.me/pedulinegeri_news',
    last_synced_at: '2026-10-18T22:15:00Z',
  },
  {
    id: 5,
    name: 'Portal Berita Utama',
    platform: 'website',
    handle: 'pedulinegeri.org',
    followers_count: 520000,
    status: 'connected',
    platform_url: 'https://pedulinegeri.org',
    last_synced_at: '2026-10-18T22:00:00Z',
  },
];

/**
 * API route membaca daftar kanal media sosial untuk halaman integrasi
 * Path: /api/channels
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status');
    const platformFilter = searchParams.get('platform');

    let channels: any[] = [];

    if (isSupabaseConfigured) {
      const client = getServiceSupabase();
      let query = client.from('social_channels').select('*').order('id', { ascending: true });
      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      if (platformFilter && platformFilter !== 'all') {
        query = query.eq('platform', platformFilter);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        channels = data;
      }
    }

    if (channels.length === 0) {
      let sql = 'SELECT * FROM social_channels WHERE 1=1';
      const params: any[] = [];
      if (statusFilter && statusFilter !== 'all') {
        sql += ' AND status = ?';
        params.push(statusFilter);
      }
      if (platformFilter && platformFilter !== 'all') {
        sql += ' AND platform = ?';
        params.push(platformFilter);
      }
      sql += ' ORDER BY id ASC';
      const rows = db.prepare(sql).all(...params);

      if (rows.length > 0) {
        channels = rows;
      } else {
        // Seeding default kanal ke database lokal jika kosong
        const insertStmt = db.prepare(`
          INSERT INTO social_channels (name, platform, handle, followers_count, status, platform_url, last_synced_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        for (const ch of DEFAULT_CHANNELS) {
          try {
            insertStmt.run(ch.name, ch.platform, ch.handle, ch.followers_count, ch.status, ch.platform_url, ch.last_synced_at);
          } catch {}
        }
        channels = DEFAULT_CHANNELS;
      }
    }

    const warningSummary = computeChannelConnectionWarnings();

    return NextResponse.json({
      success: true,
      data: channels,
      total: channels.length,
      warningSummary
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const role = req.headers.get('x-user-role') || req.nextUrl.searchParams.get('role');
    if (role && role !== 'admin' && role !== 'head') {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak: Hanya peran Admin atau Kepala Humas yang diizinkan mengonfigurasi kanal.' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { name, platform, handle, followers_count = 0, status = 'connected', platform_url = null } = body;

    if (!name || !platform || !handle) {
      return NextResponse.json({ success: false, message: 'Nama, platform, dan handle wajib diisi.' }, { status: 400 });
    }

    if (isSupabaseConfigured) {
      const client = getServiceSupabase();
      const { data, error } = await client
        .from('social_channels')
        .insert({ name, platform, handle, followers_count, status, platform_url })
        .select()
        .single();
      if (!error && data) {
        return NextResponse.json({ success: true, data });
      }
    }

    const res = db.prepare(`
      INSERT INTO social_channels (name, platform, handle, followers_count, status, platform_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(name, platform, handle, followers_count, status, platform_url);

    const inserted = db.prepare('SELECT * FROM social_channels WHERE id = ?').get(res.lastInsertRowid);
    return NextResponse.json({ success: true, data: inserted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

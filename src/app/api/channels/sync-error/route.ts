import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ensureFourChannelsSeeded } from '@/lib/channelSampleSeeder';
import { syncSingleChannelSafely, recordChannelSyncOutcome } from '@/lib/channelErrorResilience';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  try {
    ensureFourChannelsSeeded();

    const failedChannels = db
      .prepare(
        `SELECT id, name, platform, handle, status, last_error_message, last_health_check, last_synced_at
         FROM social_channels
         WHERE status IN ('sync_failed', 'reauth_required', 'disconnected')
         ORDER BY updated_at DESC`
      )
      .all();

    const recentSyncLogs = db
      .prepare(
        `SELECT * FROM channel_sync_logs
         ORDER BY id DESC
         LIMIT 25`
      )
      .all();

    return NextResponse.json({
      status: 'ok',
      failedChannels,
      recentSyncLogs
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Gagal memuat log kegagalan penarikan kanal', message: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    ensureFourChannelsSeeded();
    const body = await req.json().catch(() => ({}));
    const platform = String(body.platform || 'instagram').toLowerCase();
    const action = String(body.action || 'retry'); // 'simulate_fail' | 'retry'

    const channel = db
      .prepare('SELECT id, name, platform FROM social_channels WHERE platform = ? LIMIT 1')
      .get(platform) as { id: number; name: string; platform: string } | undefined;

    if (!channel) {
      return NextResponse.json(
        { error: `Kanal dengan platform ${platform} tidak ditemukan` },
        { status: 404 }
      );
    }

    if (action === 'simulate_fail') {
      const errorMsg =
        body.errorMessage ||
        `Gagal menarik metrik ${platform.toUpperCase()}: Token OAuth kedaluwarsa atau batas kuota terlampaui`;

      recordChannelSyncOutcome({
        channelId: channel.id,
        platform: channel.platform,
        syncType: 'manual',
        status: 'failed',
        errorMessage: errorMsg,
        triggeredBy: 'admin_simulation'
      });

      return NextResponse.json({
        status: 'simulated_failure',
        platform: channel.platform,
        channelId: channel.id,
        errorMessage: errorMsg,
        isolationGuaranteed: true
      });
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const outcome = await syncSingleChannelSafely(
      {
        id: channel.id,
        platform: channel.platform,
        name: channel.name,
        simulateError: false
      },
      todayStr,
      'manual',
      'admin_retry'
    );

    return NextResponse.json({
      status: 'ok',
      outcome
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Gagal memproses pemulihan kanal', message: err.message },
      { status: 500 }
    );
  }
}

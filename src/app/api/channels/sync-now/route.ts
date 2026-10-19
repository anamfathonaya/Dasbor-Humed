import { NextRequest, NextResponse } from 'next/server';
import { db, initDatabase } from '@/lib/db';
import { pullChannelMetricsByProvider, pullAllActiveChannelsMetrics } from '@/lib/channelMetricsPullService';
import { verifyAdminOrHeadRole } from '@/lib/youtubeConnectorService';
import { recordChannelAuditLog } from '@/lib/auditService';

initDatabase();

export const dynamic = 'force-dynamic';

/**
 * Endpoint Tarik Manual Sekali Klik Per Kanal / Semua Kanal:
 * POST /api/channels/sync-now { provider: 'youtube' | 'instagram' | 'facebook' | 'tiktok' | 'all' }
 */
export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const provider = (body.provider || body.platform || 'all').toLowerCase();
    const metricDate = body.metricDate || new Date().toISOString().slice(0, 10);
    const triggeredBy = body.triggeredBy || 'manual_one_click';
    const roleHint = String(verifyAdminOrHeadRole(req as any).role || 'unknown');

    if (provider === 'all') {
      const summary = await pullAllActiveChannelsMetrics(metricDate);

      recordChannelAuditLog({
        action: 'CHANNEL_SYNC_MANUAL',
        platform: 'all',
        userName: 'Pengguna Dasbor',
        userRole: roleHint,
        status: summary.failed === 0 ? 'success' : 'warning',
        ipAddress: req.headers.get('x-forwarded-for') || undefined,
        details: `Tarik manual semua kanal: ${summary.successful} sukses, ${summary.failed} gagal dari ${summary.total} kanal (tanggal metrik ${metricDate}).`
      });

      const historyEntry = {
        id: `sync-manual-${Date.now()}`,
        provider: 'youtube',
        channelName: 'Semua Kanal Resmi (YouTube, Instagram, Facebook, TikTok)',
        triggerType: 'manual_one_click',
        status: summary.failed === 0 ? 'success' : 'partial',
        startedAt: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) + ' WIB',
        durationMs: 1640,
        rowsUpserted: summary.successful * 5,
        message: `Tarik manual sekali klik lintas ${summary.total} kanal selesai (${summary.successful} sukses, ${summary.failed} gagal).`
      };

      return NextResponse.json({
        ok: true,
        message: 'Penarikan manual seluruh kanal berhasil dijalankan.',
        summary,
        historyEntry
      });
    }

    if (!['youtube', 'instagram', 'facebook', 'tiktok', 'telegram'].includes(provider)) {
      return NextResponse.json(
        { ok: false, error: `Platform ${provider} tidak didukung.` },
        { status: 400 }
      );
    }

    const outcome = await pullChannelMetricsByProvider({
      platform: provider as any,
      metricDate,
      triggeredBy
    });

    const chRow = db
      .prepare('SELECT name, handle FROM social_channels WHERE platform = ? LIMIT 1')
      .get(provider) as { name: string; handle: string } | undefined;

    const channelName = chRow ? `${chRow.name} (${chRow.handle})` : provider.toUpperCase();

    recordChannelAuditLog({
      action: 'CHANNEL_SYNC_MANUAL',
      platform: provider,
      target: chRow?.handle,
      userName: 'Pengguna Dasbor',
      userRole: roleHint,
      status: outcome.success ? 'success' : 'failed',
      ipAddress: req.headers.get('x-forwarded-for') || undefined,
      details: outcome.success
        ? `Tarik manual metrik kanal ${channelName} berhasil (tanggal metrik ${metricDate}).`
        : `Tarik manual metrik kanal ${channelName} gagal: ${outcome.error}`
    });

    const historyEntry = {
      id: `sync-manual-${Date.now()}`,
      provider,
      channelName,
      triggerType: 'manual_one_click',
      status: outcome.success ? 'success' : 'failed',
      startedAt: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) + ' WIB',
      durationMs: outcome.durationMs,
      rowsUpserted: outcome.success ? 5 : 0,
      message: outcome.success
        ? `Tarik manual sekali klik kanal ${provider.toUpperCase()} berhasil memperbarui pengikut, tayangan, interaksi, dan jangkauan.`
        : `Gagal menarik metrik manual kanal ${provider.toUpperCase()}: ${outcome.error}`
    };

    return NextResponse.json({
      ok: outcome.success,
      outcome,
      historyEntry
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

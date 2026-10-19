import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../../lib/db';
import { compareChannelEffectiveness } from '../../../../lib/channelEffectivenessService';

initDatabase();

export const GET: APIRoute = async ({ url }) => {
  try {
    const period = url.searchParams.get('period') || '30d';
    const channel = url.searchParams.get('channel') || 'all'; // 'all' atau nama spesifik kanal

    // Tarik ringkasan metrik efektivitas kanal resmi (Supabase Postgres primary)
    let socialChannelsSummary: any = null;
    try {
      socialChannelsSummary = await compareChannelEffectiveness({
        platforms: channel !== 'all' && channel !== 'Semua Kanal' ? [channel.toLowerCase()] : undefined
      });
    } catch (e: any) {
      console.warn('[reports/performance/aggregate] Gagal memuat efektivitas kanal:', e?.message);
    }

    // Query baris performa berdasarkan periode dan filter kanal
    let query = `
      SELECT id, channel, period, reach, engagement, conversions, delta, created_at
      FROM performance_rows
      WHERE period = ?
    `;
    const params: (string | number)[] = [period];

    if (channel !== 'all' && channel !== 'Semua Kanal') {
      query += ` AND channel = ?`;
      params.push(channel);
    }

    query += ` ORDER BY reach DESC`;

    const rows = db.prepare(query).all(...params) as {
      id: number;
      channel: string;
      period: string;
      reach: number;
      engagement: number;
      conversions: number;
      delta: number;
      created_at: string;
    }[];

    // Hitung ringkasan agregat
    const totalReach = rows.reduce((sum, r) => sum + (r.reach || 0), 0);
    const totalEngagement = rows.reduce((sum, r) => sum + (r.engagement || 0), 0);
    const totalConversions = rows.reduce((sum, r) => sum + (r.conversions || 0), 0);
    const avgDelta = rows.length > 0 
      ? Number((rows.reduce((sum, r) => sum + (r.delta || 0), 0) / rows.length).toFixed(1))
      : 0;

    // Kanal dengan performa tertinggi
    const topPerformer = rows.length > 0 ? rows[0] : null;

    // Ambil metadata laporan jika ada
    const reportMeta = db.prepare(`
      SELECT id, title, period, start_date, end_date, notes
      FROM performance_reports
      WHERE period = ?
      LIMIT 1
    `).get(period) as any;

    return new Response(
      JSON.stringify({
        success: true,
        period,
        channel: channel === 'Semua Kanal' ? 'all' : channel,
        report: reportMeta || null,
        socialChannels: socialChannelsSummary,
        summary: {
          totalReach,
          totalEngagement,
          totalConversions,
          avgDelta,
          channelCount: rows.length,
          topChannel: topPerformer ? topPerformer.channel : null,
          topReach: topPerformer ? topPerformer.reach : 0,
        },
        rows: rows.map(r => ({
          id: r.id,
          channel: r.channel,
          period: r.period,
          reach: r.reach,
          engagement: r.engagement,
          conversions: r.conversions,
          delta: r.delta,
        })),
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error: any) {
    console.error('Error aggregation performance report:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Gagal mengambil data agregasi laporan kinerja.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export default function handler(req: any, res: any) {
  return res.status(200).json({ status: 'ok' });
}


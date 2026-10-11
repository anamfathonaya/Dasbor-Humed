import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../lib/db';

initDatabase();

// GET: Metrik media sosial (KPI, rincian per kanal, dan tren)
export const GET: APIRoute = async ({ url }) => {
  try {
    const period = url.searchParams.get('period') || '30d';
    const channelFilter = url.searchParams.get('channel') || 'all';

    // Ambil metrik ringkasan media sosial dari tabel metric_snapshots
    const summaryRows = db.prepare(`
      SELECT metric_name, metric_value, delta
      FROM metric_snapshots
      WHERE source = 'sosmed' AND channel = 'all' AND period = ?
    `).all(period) as { metric_name: string; metric_value: number; delta: number }[];

    // Fallback jika periode spesifik belum diisi
    const defaultKpis = [
      { label: 'Pengikut total', value: '48.320', delta: 3.4 },
      { label: 'Jangkauan', value: '312.500', delta: 8.1 },
      { label: 'Engagement rate', value: '4,6%', delta: -0.6 },
      { label: 'Konten terbit', value: '38', delta: 5.0 },
    ];

    const kpis = summaryRows.length > 0 ? summaryRows.map(r => {
      let label = r.metric_name;
      let valStr = r.metric_value.toLocaleString('id-ID');
      if (r.metric_name === 'followers_total') label = 'Pengikut total';
      if (r.metric_name === 'reach') label = 'Jangkauan';
      if (r.metric_name === 'engagement_rate') {
        label = 'Engagement rate';
        valStr = `${r.metric_value.toFixed(1)}%`;
      }
      if (r.metric_name === 'posts_published') label = 'Konten terbit';
      return { label, value: valStr, delta: r.delta };
    }) : defaultKpis;

    // Ambil rincian per kanal sosial
    let channelQuery = `
      SELECT channel, 
             MAX(CASE WHEN metric_name = 'followers' THEN metric_value ELSE 0 END) as followers,
             MAX(CASE WHEN metric_name = 'reach' THEN metric_value ELSE 0 END) as reach,
             MAX(CASE WHEN metric_name = 'engagement' THEN metric_value ELSE 0 END) as engagement,
             MAX(CASE WHEN metric_name = 'posts' THEN metric_value ELSE 0 END) as posts,
             MAX(CASE WHEN metric_name = 'reach' THEN delta ELSE 0 END) as delta
      FROM metric_snapshots
      WHERE source = 'sosmed' AND channel != 'all'
    `;
    const params: any[] = [];

    if (channelFilter !== 'all') {
      channelQuery += ` AND channel = ?`;
      params.push(channelFilter);
    }

    channelQuery += ` GROUP BY channel ORDER BY reach DESC`;

    const channels = db.prepare(channelQuery).all(...params);

    // Data tren jangkauan 6 periode/bulan terakhir
    const trend = [
      { label: 'Mei', value: 210000 },
      { label: 'Jun', value: 228000 },
      { label: 'Jul', value: 245000 },
      { label: 'Agu', value: 260000 },
      { label: 'Sep', value: 289000 },
      { label: 'Okt', value: 312500 },
    ];

    // Konten terbit terbaru di media sosial dari tabel content_calendar
    const recentPosts = db.prepare(`
      SELECT c.id, c.title, c.channel, c.scheduled_at, p.name as pillar_name, p.color as pillar_color
      FROM content_calendar c
      LEFT JOIN content_pillars p ON c.pillar_id = p.id
      WHERE c.channel IN ('Instagram', 'Facebook', 'TikTok', 'YouTube') AND c.status = 'terbit'
      ORDER BY c.scheduled_at DESC
      LIMIT 5
    `).all();

    return new Response(JSON.stringify({
      success: true,
      data: {
        title: 'Media Sosial',
        period,
        channel: channelFilter,
        kpis,
        channels,
        trendLabel: 'Jangkauan per bulan',
        trend,
        recentPosts,
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// POST: Tambah atau perbarui data metrik media sosial (sinkronisasi dari API / import manual)
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { channel, period = '30d', metric_name, metric_value, delta = 0 } = body;

    if (!channel || !metric_name || metric_value === undefined) {
      return new Response(
        JSON.stringify({ success: false, error: 'channel, metric_name, dan metric_value wajib diisi' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const insert = db.prepare(`
      INSERT INTO metric_snapshots (source, channel, period, metric_name, metric_value, delta)
      VALUES ('sosmed', ?, ?, ?, ?, ?)
    `);

    const result = insert.run(channel, period, metric_name, metric_value, delta);

    return new Response(JSON.stringify({
      success: true,
      message: 'Metrik media sosial berhasil disimpan',
      id: result.lastInsertRowid,
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

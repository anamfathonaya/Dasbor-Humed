import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../lib/db';

initDatabase();

// GET: Metrik website lembaga (KPI pengunjung, top pages, traffic sources, tren)
export const GET: APIRoute = async ({ url }) => {
  try {
    const period = url.searchParams.get('period') || '30d';

    // Ambil metrik ringkasan website
    const summaryRows = db.prepare(`
      SELECT metric_name, metric_value, delta
      FROM metric_snapshots
      WHERE source = 'website' AND period = ?
    `).all(period) as { metric_name: string; metric_value: number; delta: number }[];

    const defaultKpis = [
      { label: 'Pengunjung', value: '21.480', delta: 6.2 },
      { label: 'Tampilan halaman', value: '63.910', delta: 4.8 },
      { label: 'Durasi sesi', value: '2m 41d', delta: 1.9 },
      { label: 'Bounce rate', value: '48%', delta: -2.3, hint: 'turun = lebih baik' },
    ];

    const kpis = summaryRows.length > 0 ? summaryRows.map(r => {
      let label = r.metric_name;
      let valStr = r.metric_value.toLocaleString('id-ID');
      let hint: string | undefined = undefined;

      if (r.metric_name === 'visitors') label = 'Pengunjung';
      if (r.metric_name === 'pageviews') label = 'Tampilan halaman';
      if (r.metric_name === 'avg_session_seconds') {
        label = 'Durasi sesi';
        const mins = Math.floor(r.metric_value / 60);
        const secs = Math.round(r.metric_value % 60);
        valStr = `${mins}m ${secs}d`;
      }
      if (r.metric_name === 'bounce_rate') {
        label = 'Bounce rate';
        valStr = `${r.metric_value}%`;
        hint = 'turun = lebih baik';
      }
      return { label, value: valStr, delta: r.delta, hint };
    }) : defaultKpis;

    // Top pages dari tabel top_pages
    const topPages = db.prepare(`
      SELECT path, views, avg_time
      FROM top_pages
      WHERE period = ?
      ORDER BY views DESC
      LIMIT 10
    `).all(period);

    // Sumber trafik website
    const trafficSources = [
      { name: 'Pencarian organik', pct: 42 },
      { name: 'Media sosial', pct: 31 },
      { name: 'Langsung', pct: 19 },
      { name: 'Rujukan lain', pct: 8 },
    ];

    // Data tren pengunjung 6 bulan terakhir
    const trend = [
      { label: 'Mei', value: 15200 },
      { label: 'Jun', value: 16800 },
      { label: 'Jul', value: 17900 },
      { label: 'Agu', value: 18700 },
      { label: 'Sep', value: 20200 },
      { label: 'Okt', value: 21480 },
    ];

    return new Response(JSON.stringify({
      success: true,
      data: {
        title: 'Website Lembaga',
        period,
        kpis,
        topPages,
        trafficSources,
        trendLabel: 'Pengunjung per bulan',
        trend,
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

// POST: Tambah top page atau update metrik website
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { path, views, avg_time, period = '30d' } = body;

    if (!path || views === undefined) {
      return new Response(
        JSON.stringify({ success: false, error: 'path dan views wajib diisi' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const insert = db.prepare(`
      INSERT INTO top_pages (path, views, avg_time, period)
      VALUES (?, ?, ?, ?)
    `);
    const result = insert.run(path, views, avg_time || '2m 00d', period);

    return new Response(JSON.stringify({
      success: true,
      message: 'Data halaman website berhasil disimpan',
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

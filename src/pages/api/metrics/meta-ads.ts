import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../lib/db';
import { getUserRole, canAccessMetricSection } from '../../../lib/auth';

initDatabase();

// GET: Metrik performa iklan Meta (KPI biaya & konversi, daftar kampanye, tren)
export const GET: APIRoute = async ({ request, url }) => {
  try {
    const role = getUserRole(request, url);
    if (!canAccessMetricSection(role, 'meta')) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Akses ditolak: peran staf tidak memiliki izin untuk melihat data metrik anggaran dan iklan Meta (least privilege).'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const period = url.searchParams.get('period') || '30d';
    const statusFilter = url.searchParams.get('status') || 'all';

    let campaignQuery = `
      SELECT 
        id, 
        name, 
        platform, 
        objective, 
        status, 
        spend, 
        reach, 
        conversions,
        ROUND(spend / conversions, 0) as cost_per_conversion,
        period,
        created_at
      FROM ad_campaigns
      WHERE period = ?
    `;
    const params: any[] = [period];

    if (statusFilter !== 'all') {
      campaignQuery += ` AND status = ?`;
      params.push(statusFilter);
    }

    campaignQuery += ` ORDER BY spend DESC`;

    const campaigns = db.prepare(campaignQuery).all(...params) as any[];

    // Hitung total ringkasan
    const totalSpend = campaigns.reduce((acc, c) => acc + c.spend, 0);
    const totalReach = campaigns.reduce((acc, c) => acc + c.reach, 0);
    const totalConversions = campaigns.reduce((acc, c) => acc + c.conversions, 0);
    const costPerConversion = totalConversions > 0 ? Math.round(totalSpend / totalConversions) : 0;

    // KPI formatted
    const kpis = [
      {
        label: 'Biaya iklan',
        value: `Rp ${(totalSpend / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`,
        delta: 4.5,
      },
      {
        label: 'Jangkauan iklan',
        value: totalReach.toLocaleString('id-ID'),
        delta: 10.3,
      },
      {
        label: 'Konversi',
        value: totalConversions.toLocaleString('id-ID'),
        delta: 14.1,
      },
      {
        label: 'Biaya per konversi',
        value: `Rp ${(costPerConversion / 1000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} rb`,
        delta: -8.2,
        hint: 'turun = lebih baik',
      },
    ];

    // Tren konversi 6 bulan terakhir
    const trend = [
      { label: 'Mei', value: 420 },
      { label: 'Jun', value: 510 },
      { label: 'Jul', value: 590 },
      { label: 'Agu', value: 640 },
      { label: 'Sep', value: 757 },
      { label: 'Okt', value: totalConversions || 864 },
    ];

    return new Response(JSON.stringify({
      success: true,
      data: {
        title: 'Iklan Meta',
        period,
        kpis,
        campaigns,
        trendLabel: 'Konversi per bulan',
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

// POST: Tambah kampanye iklan Meta baru
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, objective, status = 'Aktif', spend, reach, conversions, period = '30d' } = body;

    if (!name || !objective || spend === undefined || reach === undefined || conversions === undefined) {
      return new Response(
        JSON.stringify({ success: false, error: 'name, objective, spend, reach, dan conversions wajib diisi' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const insert = db.prepare(`
      INSERT INTO ad_campaigns (name, platform, objective, status, spend, reach, conversions, period)
      VALUES (?, 'Meta', ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(name, objective, status, spend, reach, conversions, period);

    const created = db.prepare('SELECT * FROM ad_campaigns WHERE id = ?').get(result.lastInsertRowid);

    return new Response(JSON.stringify({
      success: true,
      message: 'Kampanye iklan Meta berhasil disimpan',
      data: created,
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

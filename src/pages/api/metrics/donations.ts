import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../lib/db';
import { getUserRole, canAccessMetricSection } from '../../../lib/auth';

initDatabase();

// GET: Metrik donasi dan crowdfunding (KPI, daftar kampanye, tren)
export const GET: APIRoute = async ({ request, url }) => {
  try {
    const role = getUserRole(request, url);
    if (!canAccessMetricSection(role, 'donasi')) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Akses ditolak: peran staf tidak memiliki izin untuk melihat data metrik donasi dan penghimpunan dana (least privilege).'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const period = url.searchParams.get('period') || '30d';

    // Ambil daftar kampanye dari tabel donations
    const campaigns = db.prepare(`
      SELECT 
        id, 
        campaign_name as name, 
        platform, 
        amount, 
        donors_count as donors, 
        target_amount as target,
        ROUND((amount * 100.0) / target_amount, 1) as progress_percent,
        status
      FROM donations
      WHERE period = ?
      ORDER BY amount DESC
    `).all(period) as any[];

    // Hitung total dan rata-rata
    const totalAmount = campaigns.reduce((acc, c) => acc + c.amount, 0);
    const totalDonors = campaigns.reduce((acc, c) => acc + c.donors, 0);
    const avgDonation = totalDonors > 0 ? Math.round(totalAmount / totalDonors) : 0;
    const activeCampaigns = campaigns.filter(c => c.status === 'active').length;

    // KPI formatted
    const kpis = [
      {
        label: 'Total donasi',
        value: `Rp ${(totalAmount / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`,
        delta: 12.7,
      },
      {
        label: 'Jumlah donatur',
        value: totalDonors.toLocaleString('id-ID'),
        delta: 9.4,
      },
      {
        label: 'Rata-rata donasi',
        value: `Rp ${Math.round(avgDonation / 1000).toLocaleString('id-ID')} rb`,
        delta: 3.0,
      },
      {
        label: 'Kampanye aktif',
        value: activeCampaigns.toString(),
        delta: 0,
      },
    ];

    // Data tren bulanan dalam juta Rupiah
    const trend = [
      { label: 'Mei', value: 96 },
      { label: 'Jun', value: 118 },
      { label: 'Jul', value: 131 },
      { label: 'Agu', value: 142 },
      { label: 'Sep', value: 164 },
      { label: 'Okt', value: +(totalAmount / 1_000_000).toFixed(1) },
    ];

    return new Response(JSON.stringify({
      success: true,
      data: {
        title: 'Website Donasi',
        period,
        kpis,
        campaigns,
        trendLabel: 'Donasi per bulan (juta Rp)',
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

// POST: Tambah kampanye donasi baru
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { campaign_name, platform, amount = 0, donors_count = 0, target_amount, period = '30d' } = body;

    if (!campaign_name || !platform || target_amount === undefined) {
      return new Response(
        JSON.stringify({ success: false, error: 'campaign_name, platform, dan target_amount wajib diisi' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const insert = db.prepare(`
      INSERT INTO donations (campaign_name, platform, amount, donors_count, target_amount, period, status)
      VALUES (?, ?, ?, ?, ?, ?, 'active')
    `);

    const result = insert.run(campaign_name, platform, amount, donors_count, target_amount, period);

    const created = db.prepare('SELECT * FROM donations WHERE id = ?').get(result.lastInsertRowid);

    return new Response(JSON.stringify({
      success: true,
      message: 'Kampanye donasi berhasil ditambahkan',
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

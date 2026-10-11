import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../lib/db';
import { getUserRole, canAccessMetricSection, type UserRole } from '../../../lib/auth';

initDatabase();

// GET: Endpoint terpadu Dasbor Metrik dengan filter periode, kanal, dan otorisasi peran
export const GET: APIRoute = async ({ request, url }) => {
  try {
    const role: UserRole = getUserRole(request, url);
    const rawPeriod = url.searchParams.get('period') || '6';
    const channelParam = url.searchParams.get('channel') || '';

    // Normalisasi periode (1 = 1 bulan, 3 = 3 bulan, 6 = 6 bulan)
    let periodMonths = 6;
    if (rawPeriod === '1' || rawPeriod === '30d' || rawPeriod === 'month') periodMonths = 1;
    else if (rawPeriod === '3' || rawPeriod === '90d') periodMonths = 3;
    else if (rawPeriod === '6' || rawPeriod === '180d') periodMonths = 6;

    // Multiplier faktor data historis berdasarkan panjang periode
    const multiplier = periodMonths === 1 ? 0.35 : periodMonths === 3 ? 0.65 : 1.0;

    // 1. Data Kanal Media Sosial
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
    const chanParams: any[] = [];
    if (channelParam && channelParam !== 'all') {
      channelQuery += ` AND channel = ?`;
      chanParams.push(channelParam);
    }
    channelQuery += ` GROUP BY channel ORDER BY reach DESC`;

    const socialChannels = db.prepare(channelQuery).all(...chanParams) as any[];

    // 2. Data Donasi
    const donationCampaigns = db.prepare(`
      SELECT 
        id, 
        campaign_name as name, 
        platform, 
        amount, 
        donors_count as donors, 
        target_amount as target,
        ROUND((amount * 100.0) / target_amount, 1) as progress_percent
      FROM donations
      ORDER BY amount DESC
    `).all() as any[];

    // 3. Data Iklan Meta
    const adCampaigns = db.prepare(`
      SELECT 
        id, 
        name, 
        platform, 
        objective, 
        status, 
        spend, 
        reach, 
        conversions
      FROM ad_campaigns
      ORDER BY spend DESC
    `).all() as any[];

    // 4. Data Halaman Terpopuler
    const topPages = db.prepare(`
      SELECT path, views, avg_time
      FROM top_pages
      ORDER BY views DESC
    `).all() as any[];

    // 5. Tren 6 bulan
    const monthsAll = ['Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt'];
    const sliceStart = 6 - periodMonths;
    const months = monthsAll.slice(sliceStart);

    const sosmedTrendBase = [210000, 228000, 245000, 260000, 289000, 312500];
    const websiteTrendBase = [15200, 16800, 17900, 18700, 20200, 21480];
    const donasiTrendBase = [96, 118, 131, 142, 164, 184.6];
    const metaTrendBase = [420, 510, 590, 640, 757, 864];

    // Jika filter kanal aktif untuk sosmed, sesuaikan trennya
    const channelRatio = (channelParam === 'Instagram') ? 0.48 :
                         (channelParam === 'Facebook') ? 0.25 :
                         (channelParam === 'TikTok') ? 0.20 :
                         (channelParam === 'YouTube') ? 0.07 : 1.0;

    const sosmedTrend = months.map((m, i) => ({
      label: m,
      value: Math.round(sosmedTrendBase[sliceStart + i] * channelRatio),
    }));

    const websiteTrend = months.map((m, i) => ({
      label: m,
      value: websiteTrendBase[sliceStart + i],
    }));

    const donasiTrend = months.map((m, i) => ({
      label: m,
      value: +(donasiTrendBase[sliceStart + i] * (periodMonths === 1 ? 0.8 : 1.0)).toFixed(1),
    }));

    const metaTrend = months.map((m, i) => ({
      label: m,
      value: metaTrendBase[sliceStart + i],
    }));

    // 6. Ringkasan Sorotan (Highlights)
    const totalDonasi = donationCampaigns.reduce((acc, c) => acc + c.amount, 0);
    const highlights = [
      {
        badge: '🏆 Donasi Tertinggi',
        headline: `Rp ${(totalDonasi / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`,
        desc: 'Pertumbuhan donasi tembus rekor didorong kampanye Bantu Pendidikan Anak.',
      },
      {
        badge: '🔥 Kampanye Terpopuler',
        headline: 'Penyaluran Sembako Cianjur',
        desc: '148,2k jangkauan di Instagram dengan engagement rate tertinggi (5,2%).',
      },
      {
        badge: '⚡ Efisiensi Iklan',
        headline: 'Rp 25,9 rb / konversi',
        desc: 'Biaya konversi iklan Meta berhasil ditekan 8,2% lebih hemat dari bulan lalu.',
      },
      {
        badge: '📈 Lonjakan Kanal',
        headline: 'TikTok +21,5%',
        desc: 'Pertumbuhan jangkauan video Reels & TikTok relawan lapangan meningkat pesat.',
      },
    ];

    // 7. Sections
    const sections = [
      {
        id: 'sosmed',
        title: channelParam ? `Media Sosial (${channelParam})` : 'Media Sosial',
        description: 'Performa Instagram, Facebook, TikTok, dan YouTube lembaga.',
        kpis: [
          { label: 'Pengikut total', value: Math.round(48320 * channelRatio).toLocaleString('id-ID'), delta: 3.4 },
          { label: 'Jangkauan', value: Math.round(312500 * channelRatio).toLocaleString('id-ID'), delta: 8.1 },
          { label: 'Engagement rate', value: (4.6 * (channelRatio > 0.4 ? 1.1 : 0.9)).toFixed(1).replace('.', ',') + '%', delta: -0.6 },
          { label: 'Konten terbit', value: Math.round(38 * channelRatio * multiplier).toString(), delta: 5.0 },
        ],
        trendLabel: `Jangkauan per bulan (${months[0]} - ${months[months.length - 1]})`,
        trend: sosmedTrend,
      },
      {
        id: 'website',
        title: 'Website Lembaga',
        description: 'Lalu lintas dan perilaku pengunjung website utama.',
        kpis: [
          { label: 'Pengunjung', value: Math.round(21480 * multiplier).toLocaleString('id-ID'), delta: 6.2 },
          { label: 'Tampilan halaman', value: Math.round(63910 * multiplier).toLocaleString('id-ID'), delta: 4.8 },
          { label: 'Durasi sesi', value: '2m 41d', delta: 1.9 },
          { label: 'Bounce rate', value: '48%', delta: -2.3, hint: 'turun = lebih baik' },
        ],
        trendLabel: `Pengunjung per bulan (${months[0]} - ${months[months.length - 1]})`,
        trend: websiteTrend,
      },
      {
        id: 'donasi',
        title: 'Website Donasi',
        description: 'Hasil galang dana di platform donasi/crowdfunding.',
        kpis: [
          { label: 'Total donasi', value: `Rp ${(totalDonasi / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`, delta: 12.7 },
          { label: 'Jumlah donatur', value: Math.round(1268 * multiplier).toLocaleString('id-ID'), delta: 9.4 },
          { label: 'Rata-rata donasi', value: 'Rp 145 rb', delta: 3.0 },
          { label: 'Kampanye aktif', value: donationCampaigns.length.toString(), delta: 0 },
        ],
        trendLabel: `Donasi per bulan (${months[0]} - ${months[months.length - 1]})`,
        trend: donasiTrend,
      },
      {
        id: 'meta',
        title: 'Iklan Meta',
        description: 'Efektivitas kampanye iklan Facebook & Instagram.',
        kpis: [
          { label: 'Biaya iklan', value: `Rp ${(22.4 * multiplier).toFixed(1).replace('.', ',')} jt`, delta: 4.5 },
          { label: 'Jangkauan iklan', value: Math.round(540200 * multiplier).toLocaleString('id-ID'), delta: 10.3 },
          { label: 'Konversi', value: Math.round(864 * multiplier).toLocaleString('id-ID'), delta: 14.1 },
          { label: 'Biaya per konversi', value: 'Rp 25,9 rb', delta: -8.2, hint: 'turun = lebih baik' },
        ],
        trendLabel: `Konversi per bulan (${months[0]} - ${months[months.length - 1]})`,
        trend: metaTrend,
      },
    ];

    // Filter data berdasarkan peran (least privilege)
    let visibleSections = sections;
    let visibleHighlights = highlights;
    let visibleDonations = donationCampaigns;
    let visibleAds = adCampaigns;

    if (role === 'staff') {
      // Staf hanya dapat melihat sosmed dan website
      visibleSections = sections.filter(s => canAccessMetricSection(role, s.id as any));
      visibleHighlights = [highlights[1], highlights[3]].filter(Boolean); // Hanya populer & lonjakan kanal
      visibleDonations = [];
      visibleAds = [];
    }

    return new Response(JSON.stringify({
      success: true,
      role,
      filters: {
        period: rawPeriod,
        periodMonths,
        channel: channelParam || 'all',
      },
      data: {
        highlights: visibleHighlights,
        sections: visibleSections,
        socialChannels,
        donationCampaigns: visibleDonations,
        adCampaigns: visibleAds,
        topPages,
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

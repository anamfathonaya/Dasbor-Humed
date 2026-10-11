import { db } from './db';

/**
 * Fungsi untuk mengisi data metrik contoh (sample metrics seed data)
 * Mencakup multi-periode (30d, 90d, 1y), berbagai kanal sosial, kampanye donasi, dan iklan Meta.
 */
export function seedSampleMetrics(forceReset = false) {
  if (forceReset) {
    db.exec(`
      DELETE FROM metric_snapshots;
      DELETE FROM donations;
      DELETE FROM ad_campaigns;
      DELETE FROM top_pages;
    `);
  }

  const existingCount = (db.prepare('SELECT COUNT(*) as c FROM metric_snapshots').get() as { c: number }).c;
  if (existingCount > 0 && !forceReset) {
    return { message: 'Data metrik sudah tersedia, tidak perlu seeding ulang.' };
  }

  const insertMetric = db.prepare(`
    INSERT INTO metric_snapshots (source, channel, period, metric_name, metric_value, delta)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  // --- 1. METRIK MEDIA SOSIAL ---
  // Periode 30d
  insertMetric.run('sosmed', 'all', '30d', 'followers_total', 48320, 3.4);
  insertMetric.run('sosmed', 'all', '30d', 'reach', 312500, 8.1);
  insertMetric.run('sosmed', 'all', '30d', 'engagement_rate', 4.6, -0.6);
  insertMetric.run('sosmed', 'all', '30d', 'posts_published', 38, 5.0);

  insertMetric.run('sosmed', 'Instagram', '30d', 'followers', 21400, 4.2);
  insertMetric.run('sosmed', 'Instagram', '30d', 'reach', 148200, 9.8);
  insertMetric.run('sosmed', 'Instagram', '30d', 'engagement', 5.2, 0.4);
  insertMetric.run('sosmed', 'Instagram', '30d', 'posts', 14, 2.0);

  insertMetric.run('sosmed', 'Facebook', '30d', 'followers', 14900, 1.8);
  insertMetric.run('sosmed', 'Facebook', '30d', 'reach', 76400, 2.4);
  insertMetric.run('sosmed', 'Facebook', '30d', 'engagement', 3.1, -0.2);
  insertMetric.run('sosmed', 'Facebook', '30d', 'posts', 10, 0);

  insertMetric.run('sosmed', 'TikTok', '30d', 'followers', 8300, 12.1);
  insertMetric.run('sosmed', 'TikTok', '30d', 'reach', 61900, 21.5);
  insertMetric.run('sosmed', 'TikTok', '30d', 'engagement', 6.7, 1.5);
  insertMetric.run('sosmed', 'TikTok', '30d', 'posts', 8, 4.0);

  insertMetric.run('sosmed', 'YouTube', '30d', 'followers', 3720, 0.8);
  insertMetric.run('sosmed', 'YouTube', '30d', 'reach', 26000, -1.7);
  insertMetric.run('sosmed', 'YouTube', '30d', 'engagement', 4.0, -0.1);
  insertMetric.run('sosmed', 'YouTube', '30d', 'posts', 6, 1.0);

  // Periode 90d
  insertMetric.run('sosmed', 'all', '90d', 'followers_total', 46700, 8.5);
  insertMetric.run('sosmed', 'all', '90d', 'reach', 840000, 15.3);
  insertMetric.run('sosmed', 'all', '90d', 'engagement_rate', 4.8, 0.3);
  insertMetric.run('sosmed', 'all', '90d', 'posts_published', 112, 12.0);

  // --- 2. METRIK WEBSITE LEMBAGA ---
  insertMetric.run('website', 'Website', '30d', 'visitors', 21480, 6.2);
  insertMetric.run('website', 'Website', '30d', 'pageviews', 63910, 4.8);
  insertMetric.run('website', 'Website', '30d', 'avg_session_seconds', 161, 1.9);
  insertMetric.run('website', 'Website', '30d', 'bounce_rate', 48, -2.3);

  insertMetric.run('website', 'Website', '90d', 'visitors', 58400, 11.4);
  insertMetric.run('website', 'Website', '90d', 'pageviews', 174000, 9.8);
  insertMetric.run('website', 'Website', '90d', 'avg_session_seconds', 158, 2.1);
  insertMetric.run('website', 'Website', '90d', 'bounce_rate', 50, -1.5);

  // --- 3. METRIK DONASI & CROWDFUNDING ---
  insertMetric.run('donasi', 'all', '30d', 'total_donations', 184600000, 12.7);
  insertMetric.run('donasi', 'all', '30d', 'donors_count', 1268, 9.4);
  insertMetric.run('donasi', 'all', '30d', 'avg_donation', 145000, 3.0);
  insertMetric.run('donasi', 'all', '30d', 'active_campaigns', 7, 0);

  insertMetric.run('donasi', 'all', '90d', 'total_donations', 492000000, 18.2);
  insertMetric.run('donasi', 'all', '90d', 'donors_count', 3420, 14.1);
  insertMetric.run('donasi', 'all', '90d', 'avg_donation', 143800, 3.5);
  insertMetric.run('donasi', 'all', '90d', 'active_campaigns', 9, 2);

  // --- 4. METRIK IKLAN META ---
  insertMetric.run('meta', 'Meta', '30d', 'spend', 22400000, 4.5);
  insertMetric.run('meta', 'Meta', '30d', 'ad_reach', 540200, 10.3);
  insertMetric.run('meta', 'Meta', '30d', 'conversions', 864, 14.1);
  insertMetric.run('meta', 'Meta', '30d', 'cost_per_conversion', 25900, -8.2);

  // --- 5. TABEL DONATIONS (RINCIAN KAMPANYE) ---
  const insertDonation = db.prepare(`
    INSERT INTO donations (campaign_name, platform, amount, donors_count, target_amount, period, status)
    VALUES (?, ?, ?, ?, ?, ?, 'active')
  `);
  insertDonation.run('Bantu Pendidikan Anak', 'Kitabisa', 72400000, 512, 100000000, '30d');
  insertDonation.run('Sembako untuk Korban Banjir', 'Website Lembaga', 58200000, 396, 75000000, '30d');
  insertDonation.run('Air Bersih Desa', 'Kitabisa', 31800000, 241, 60000000, '30d');
  insertDonation.run('Layanan Kesehatan Keliling', 'Website Lembaga', 22200000, 119, 50000000, '30d');

  // --- 6. TABEL AD_CAMPAIGNS (RINCIAN IKLAN META) ---
  const insertAd = db.prepare(`
    INSERT INTO ad_campaigns (name, platform, objective, status, spend, reach, conversions, period)
    VALUES (?, 'Meta', ?, ?, ?, ?, ?, ?)
  `);
  insertAd.run('Donasi Pendidikan Anak', 'Konversi', 'Aktif', 7800000, 198400, 342, '30d');
  insertAd.run('Sembako Korban Banjir', 'Konversi', 'Aktif', 6200000, 151200, 281, '30d');
  insertAd.run('Awareness Program Air Bersih', 'Jangkauan', 'Aktif', 4600000, 132900, 96, '30d');
  insertAd.run('Rekrut Relawan Oktober', 'Prospek', 'Selesai', 3800000, 57700, 145, '30d');

  // --- 7. TABEL TOP_PAGES ---
  const insertPage = db.prepare('INSERT INTO top_pages (path, views, avg_time, period) VALUES (?, ?, ?, ?)');
  insertPage.run('/program/pendidikan-anak', 9120, '3m 05d', '30d');
  insertPage.run('/berita/penyaluran-cianjur', 7480, '2m 12d', '30d');
  insertPage.run('/tentang-kami', 5260, '1m 48d', '30d');
  insertPage.run('/laporan-tahunan', 3940, '4m 20d', '30d');

  return {
    success: true,
    message: 'Seed data metrik contoh berhasil diisi ke dalam database.',
  };
}

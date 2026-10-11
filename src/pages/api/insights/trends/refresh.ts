import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../../lib/db';
import { requireInsightPermission } from '../../../../lib/auth';

initDatabase();

// POST: Segarkan data tren topik dengan menganalisis frekuensi berita terbaru di database
export const POST: APIRoute = async ({ request, url }) => {
  const auth = requireInsightPermission(request, 'refresh_analytics', url);
  if (!auth.allowed) {
    return auth.response!;
  }

  try {
    // 1. Analisis kata kunci dan kategori dari berita terkini (news_items)
    const recentNews = db.prepare(`
      SELECT category, title, summary
      FROM news_items
      ORDER BY published_at DESC
      LIMIT 30
    `).all() as { category: string; title: string; summary: string }[];

    // Hitung kemunculan kata kunci isu kemanusiaan
    const keywords = [
      { topic: 'Krisis Air Bersih Pasca Bencana', category: 'Bencana', kw: 'air bersih', defaultGrowth: 185, angle: 'Publikasikan dokumentasi water treatment mobile dan distribusi jeriken darurat tim lapangan.' },
      { topic: 'Jalur Logistik Terisolir Cianjur', category: 'Bantuan Kemanusiaan', kw: 'logistik', defaultGrowth: 130, angle: 'Update video drone jembatan darurat dan call-to-action konvoi armada kemanusiaan.' },
      { topic: 'Transparansi Audit Donasi Digital', category: 'Regulasi', kw: 'donasi', defaultGrowth: 82, angle: 'Rilis infografis laporan penyaluran dana publik secara berkala via stories & dasbor terbuka.' },
      { topic: 'Dapur Umum Mandiri Komunitas', category: 'Sosial', kw: 'dapur umum', defaultGrowth: 65, angle: 'Sorot kisah ketangguhan ibu-ibu relawan lokal dan kebutuhan bahan pokok harian.' },
      { topic: 'Mitigasi Cuaca Ekstrem Musim Hujan', category: 'Bencana', kw: 'cuaca', defaultGrowth: 52, angle: 'Panduan carousel kesiapsiagaan tas siaga bencana (TSB) keluarga.' },
      { topic: 'Paket Gizi Darurat Balita 3T', category: 'Kesehatan', kw: 'gizi', defaultGrowth: 35, angle: 'Kolaborasi kampanye donasi spesifik makanan pendamping ASI (MPASI) sehat.' },
    ];

    const updatedTrends = [];

    // Update setiap topik dengan perhitungan mention terbaru
    const updateStmt = db.prepare(`
      UPDATE trending_topics
      SET mention_count = mention_count + ?,
          growth_percentage = ?,
          momentum = ?
      WHERE topic = ?
    `);

    const insertStmt = db.prepare(`
      INSERT INTO trending_topics (rank, topic, category, growth_percentage, mention_count, recommended_angle, momentum)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    for (let i = 0; i < keywords.length; i++) {
      const k = keywords[i];
      let matches = 0;
      for (const news of recentNews) {
        const text = `${news.title} ${news.summary}`.toLowerCase();
        if (text.includes(k.kw)) {
          matches++;
        }
      }

      const additionalMentions = matches * 150 + Math.floor(Math.random() * 50);
      const calculatedGrowth = k.defaultGrowth + (matches * 4);
      const momentum = calculatedGrowth > 100 ? 'Meroket' : calculatedGrowth > 40 ? 'Meningkat' : 'Stabil';

      const existing = db.prepare('SELECT id FROM trending_topics WHERE topic = ?').get(k.topic) as any;
      if (existing) {
        updateStmt.run(additionalMentions, calculatedGrowth, momentum, k.topic);
      } else {
        insertStmt.run(i + 1, k.topic, k.category, calculatedGrowth, 3000 + additionalMentions, k.angle, momentum);
      }
    }

    // Ambil hasil terbaru yang sudah terurut
    const refreshed = db.prepare(`
      SELECT * FROM trending_topics
      ORDER BY growth_percentage DESC
    `).all();

    // Perbarui urutan rank
    const updateRankStmt = db.prepare('UPDATE trending_topics SET rank = ? WHERE id = ?');
    refreshed.forEach((item: any, idx: number) => {
      updateRankStmt.run(idx + 1, item.id);
      item.rank = idx + 1;
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Data Tren Topik berhasil disegarkan berdasarkan pantauan isu terkini',
      refreshedAt: new Date().toISOString(),
      data: refreshed,
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

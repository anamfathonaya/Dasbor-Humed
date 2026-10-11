import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../../lib/db';

initDatabase();

// GET: Ambil daftar tren topik terurut berdasarkan skor kenaikan (growth_percentage DESC atau rank ASC)
export const GET: APIRoute = async ({ url }) => {
  try {
    const category = url.searchParams.get('category');
    const momentum = url.searchParams.get('momentum');
    const sortBy = url.searchParams.get('sort') || 'growth'; // 'growth' | 'rank' | 'mentions'

    let query = `SELECT * FROM trending_topics WHERE 1=1`;
    const params: any[] = [];

    if (category && category !== 'Semua') {
      query += ` AND category = ?`;
      params.push(category);
    }
    if (momentum) {
      query += ` AND momentum = ?`;
      params.push(momentum);
    }

    if (sortBy === 'rank') {
      query += ` ORDER BY rank ASC`;
    } else if (sortBy === 'mentions') {
      query += ` ORDER BY mention_count DESC`;
    } else {
      query += ` ORDER BY growth_percentage DESC, rank ASC`;
    }

    const rows = db.prepare(query).all(...params);

    return new Response(JSON.stringify({
      success: true,
      count: rows.length,
      data: rows,
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

// POST: Tambah topik tren baru ke daftar pantauan
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { topic, category, growth_percentage, mention_count, recommended_angle, momentum, rank } = body;

    if (!topic || growth_percentage === undefined) {
      return new Response(JSON.stringify({ success: false, error: 'Nama topik dan skor kenaikan (growth_percentage) wajib diisi' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Tentukan rank berikutnya jika tidak disediakan
    const currentMaxRank = (db.prepare('SELECT MAX(rank) as mr FROM trending_topics').get() as { mr: number | null }).mr || 0;
    const assignedRank = rank || (currentMaxRank + 1);

    const insert = db.prepare(`
      INSERT INTO trending_topics (rank, topic, category, growth_percentage, mention_count, recommended_angle, momentum)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      assignedRank,
      topic,
      category || 'Bencana',
      Number(growth_percentage),
      Number(mention_count) || 0,
      recommended_angle || 'Sorot isu dari perspektif kebutuhan darurat warga di lapangan.',
      momentum || 'Meningkat'
    );

    const created = db.prepare('SELECT * FROM trending_topics WHERE id = ?').get(result.lastInsertRowid);
    return new Response(JSON.stringify({ success: true, data: created }), {
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

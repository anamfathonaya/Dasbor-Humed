import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../../lib/db';

initDatabase();

// GET: Ringkasan komposisi pilar konten per rentang periode (start_date s/d end_date)
export const GET: APIRoute = async ({ url }) => {
  try {
    const startDate = url.searchParams.get('startDate') || '2026-10-01';
    const endDate = url.searchParams.get('endDate') || '2026-10-31 23:59:59';

    // Ambil semua pilar
    const pillars = db.prepare('SELECT id, name, color FROM content_pillars').all() as any[];

    // Hitung total konten dalam periode
    const totalRow = db.prepare(`
      SELECT COUNT(*) as total
      FROM content_calendar
      WHERE scheduled_at >= ? AND scheduled_at <= ?
    `).get(startDate, endDate) as { total: number };
    const total = totalRow.total;

    // Hitung per pilar
    const counts = db.prepare(`
      SELECT pillar_id, COUNT(*) as count
      FROM content_calendar
      WHERE scheduled_at >= ? AND scheduled_at <= ? AND pillar_id IS NOT NULL
      GROUP BY pillar_id
    `).all(startDate, endDate) as { pillar_id: number; count: number }[];

    const countMap = new Map(counts.map(c => [c.pillar_id, c.count]));

    const summary = pillars.map(p => {
      const count = countMap.get(p.id) || 0;
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
      return {
        pillar_id: p.id,
        name: p.name,
        color: p.color,
        count,
        percentage,
      };
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          period: { startDate, endDate },
          total_contents: total,
          composition: summary,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../lib/db';

initDatabase();

// GET: Analisis beban kerja anggota tim (workload distribution)
export const GET: APIRoute = async () => {
  try {
    const users = db.prepare(`
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        r.name as role_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      ORDER BY u.name ASC
    `).all() as { id: number; name: string; email: string; role_name: string }[];

    const now = new Date().toISOString();

    const workloadData = users.map(user => {
      const contents = db.prepare(`
        SELECT 
          c.id, 
          c.title, 
          c.scheduled_at, 
          c.channel, 
          c.status,
          p.name as pillar_name,
          p.color as pillar_color
        FROM content_calendar c
        LEFT JOIN content_pillars p ON c.pillar_id = p.id
        WHERE c.assignee_id = ?
        ORDER BY c.scheduled_at ASC
      `).all(user.id) as any[];

      const total = contents.length;
      const ideCount = contents.filter(c => c.status === 'ide').length;
      const draftCount = contents.filter(c => c.status === 'draft').length;
      const terjadwalCount = contents.filter(c => c.status === 'terjadwal').length;
      const terbitCount = contents.filter(c => c.status === 'terbit').length;

      const overdueCount = contents.filter(c => {
        return c.status !== 'terbit' && new Date(c.scheduled_at) < new Date(now);
      }).length;

      return {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role_name,
        totalTasks: total,
        activeTasks: draftCount + terjadwalCount,
        overdueTasks: overdueCount,
        statusBreakdown: {
          ide: ideCount,
          draft: draftCount,
          terjadwal: terjadwalCount,
          terbit: terbitCount,
        },
        items: contents,
      };
    });

    // Konten tanpa penanggung jawab (unassigned)
    const unassignedContents = db.prepare(`
      SELECT 
        c.id, 
        c.title, 
        c.scheduled_at, 
        c.channel, 
        c.status,
        p.name as pillar_name,
        p.color as pillar_color
      FROM content_calendar c
      LEFT JOIN content_pillars p ON c.pillar_id = p.id
      WHERE c.assignee_id IS NULL
      ORDER BY c.scheduled_at ASC
    `).all();

    return new Response(JSON.stringify({
      success: true,
      data: {
        teamWorkload: workloadData,
        unassignedCount: unassignedContents.length,
        unassignedItems: unassignedContents,
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

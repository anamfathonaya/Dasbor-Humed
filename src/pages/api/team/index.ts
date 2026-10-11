import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../lib/db';

initDatabase();

// GET: Ambil daftar seluruh anggota tim beserta peran dan jumlah tugas aktif
export const GET: APIRoute = async () => {
  try {
    const users = db.prepare(`
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.role_id,
        r.name as role_name,
        COUNT(c.id) as total_content,
        SUM(CASE WHEN c.status IN ('draft', 'terjadwal') THEN 1 ELSE 0 END) as active_content
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN content_calendar c ON u.id = c.assignee_id
      GROUP BY u.id
      ORDER BY u.name ASC
    `).all();

    return new Response(JSON.stringify({ success: true, data: users }), {
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

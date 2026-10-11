import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../../lib/db';

initDatabase();

// GET: Ambil daftar seluruh pekerjaan (tasks), bisa difilter via ?projectId=..., ?stage=..., ?assignee=...
export const GET: APIRoute = async ({ url }) => {
  try {
    const projectId = url.searchParams.get('projectId');
    const stage = url.searchParams.get('stage');
    const assignee = url.searchParams.get('assignee');

    let query = `
      SELECT t.*, p.name as project_name
      FROM project_tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (projectId) {
      query += ' AND t.project_id = ?';
      params.push(projectId);
    }
    if (stage) {
      query += ' AND t.stage = ?';
      params.push(stage);
    }
    if (assignee) {
      query += ' AND t.assignee = ?';
      params.push(assignee);
    }

    query += ' ORDER BY t.due_date ASC';

    const tasks = db.prepare(query).all(...params);

    return new Response(JSON.stringify({
      success: true,
      data: tasks,
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

// POST: Tambah tugas baru ke proyek
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { projectId, title, stage = 'todo', assignee, assigneeId, dueDate, priority = 'Sedang' } = body;

    if (!projectId || !title || !assignee || !dueDate) {
      return new Response(
        JSON.stringify({ success: false, error: 'projectId, title, assignee, dan dueDate wajib diisi' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Pastikan proyek exists
    const proj = db.prepare('SELECT id FROM projects WHERE id = ?').get(projectId);
    if (!proj) {
      return new Response(
        JSON.stringify({ success: false, error: 'Proyek tidak ditemukan' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const insert = db.prepare(`
      INSERT INTO project_tasks (project_id, title, stage, assignee, assignee_id, due_date, priority)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(projectId, title, stage, assignee, assigneeId || null, dueDate, priority);

    const created = db.prepare('SELECT * FROM project_tasks WHERE id = ?').get(result.lastInsertRowid);

    return new Response(JSON.stringify({
      success: true,
      message: 'Tugas proyek berhasil ditambahkan',
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

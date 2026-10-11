import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../lib/db';

initDatabase();

// GET: Ambil daftar seluruh proyek beserta pekerjaan (tasks)
export const GET: APIRoute = async ({ url }) => {
  try {
    const statusFilter = url.searchParams.get('status') || 'active';
    const assigneeFilter = url.searchParams.get('assignee');

    let projectQuery = 'SELECT * FROM projects WHERE 1=1';
    const projParams: any[] = [];

    if (statusFilter !== 'all') {
      projectQuery += ' AND status = ?';
      projParams.push(statusFilter);
    }
    projectQuery += ' ORDER BY start_date ASC';

    const projects = db.prepare(projectQuery).all(...projParams) as any[];

    // Ambil seluruh tugas
    let taskQuery = `
      SELECT t.*, u.name as user_name
      FROM project_tasks t
      LEFT JOIN users u ON t.assignee_id = u.id
      WHERE 1=1
    `;
    const taskParams: any[] = [];

    if (assigneeFilter) {
      taskQuery += ' AND (t.assignee = ? OR u.name = ?)';
      taskParams.push(assigneeFilter, assigneeFilter);
    }
    taskQuery += ' ORDER BY t.due_date ASC';

    const allTasks = db.prepare(taskQuery).all(...taskParams) as any[];

    // Gabungkan tasks ke dalam masing-masing proyek
    const projectsWithTasks = projects.map(p => {
      const tasks = allTasks.filter(t => t.project_id === p.id).map(t => ({
        id: t.id,
        projectId: t.project_id,
        title: t.title,
        stage: t.stage,
        assignee: t.assignee,
        assigneeId: t.assignee_id,
        dueDate: t.due_date,
        priority: t.priority,
      }));

      // Hitung otomatis progres dinamis berdasarkan task yang selesai jika ada task
      let calcProgress = p.progress;
      if (tasks.length > 0) {
        const doneTasks = tasks.filter(t => t.stage === 'done').length;
        calcProgress = Math.round((doneTasks / tasks.length) * 100);
      }

      return {
        id: p.id,
        name: p.name,
        owner: p.owner,
        ownerId: p.owner_id,
        startDate: p.start_date,
        endDate: p.end_date,
        progress: calcProgress,
        status: p.status,
        tasks,
      };
    });

    return new Response(JSON.stringify({
      success: true,
      data: projectsWithTasks,
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

// POST: Buat proyek baru
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, owner, ownerId, startDate, endDate, progress = 0 } = body;

    if (!name || !owner || !startDate || !endDate) {
      return new Response(
        JSON.stringify({ success: false, error: 'name, owner, startDate, dan endDate wajib diisi' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const insert = db.prepare(`
      INSERT INTO projects (name, owner, owner_id, start_date, end_date, progress, status)
      VALUES (?, ?, ?, ?, ?, ?, 'active')
    `);

    const result = insert.run(name, owner, ownerId || null, startDate, endDate, progress);

    const created = db.prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid);

    return new Response(JSON.stringify({
      success: true,
      message: 'Proyek berhasil dibuat',
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

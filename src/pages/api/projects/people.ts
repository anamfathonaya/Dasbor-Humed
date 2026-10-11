import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../lib/db';

initDatabase();

// GET: Ringkasan daftar pekerjaan proyek per anggota tim (People View)
export const GET: APIRoute = async () => {
  try {
    const tasks = db.prepare(`
      SELECT t.*, p.name as project_name
      FROM project_tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      ORDER BY t.due_date ASC
    `).all() as any[];

    const today = new Date().toISOString().substring(0, 10);

    // Kelompokkan per nama assignee
    const peopleMap = new Map<string, any>();

    for (const t of tasks) {
      const name = t.assignee || 'Belum Ditugaskan';
      if (!peopleMap.has(name)) {
        peopleMap.set(name, {
          assignee: name,
          totalTasks: 0,
          activeTasks: 0,
          doneTasks: 0,
          overdueTasks: 0,
          tasks: [],
        });
      }

      const p = peopleMap.get(name)!;
      p.totalTasks++;
      if (t.stage === 'done') {
        p.doneTasks++;
      } else {
        p.activeTasks++;
        if (t.due_date < today) {
          p.overdueTasks++;
        }
      }

      p.tasks.push({
        id: t.id,
        projectId: t.project_id,
        projectName: t.project_name,
        title: t.title,
        stage: t.stage,
        dueDate: t.due_date,
        priority: t.priority,
        isOverdue: t.stage !== 'done' && t.due_date < today,
      });
    }

    const people = Array.from(peopleMap.values());

    return new Response(JSON.stringify({
      success: true,
      data: people,
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

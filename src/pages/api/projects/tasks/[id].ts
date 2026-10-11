import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../../lib/db';

initDatabase();

// Helper untuk memperbarui progres proyek secara otomatis berdasarkan status seluruh tugasnya
function updateProjectProgress(projectId: number) {
  const tasks = db.prepare('SELECT stage FROM project_tasks WHERE project_id = ?').all(projectId) as { stage: string }[];
  if (tasks.length === 0) return 0;
  const doneCount = tasks.filter(t => t.stage === 'done').length;
  const newProgress = Math.round((doneCount / tasks.length) * 100);

  db.prepare('UPDATE projects SET progress = ? WHERE id = ?').run(newProgress, projectId);
  return newProgress;
}

// GET: Ambil detail satu tugas
export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    const task = db.prepare(`
      SELECT t.*, p.name as project_name
      FROM project_tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.id = ?
    `).get(id);

    if (!task) {
      return new Response(JSON.stringify({ success: false, error: 'Tugas tidak ditemukan' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, data: task }), {
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

// PATCH / PUT: Perbarui tugas, tahap kanban, posisi, atau penanggung jawab
export const PATCH: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    const body = await request.json();
    const { stage, position, title, assignee, assigneeId, dueDate, priority } = body;

    const existing = db.prepare('SELECT * FROM project_tasks WHERE id = ?').get(id) as any;
    if (!existing) {
      return new Response(JSON.stringify({ success: false, error: 'Tugas tidak ditemukan' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    db.prepare(`
      UPDATE project_tasks
      SET stage = COALESCE(?, stage),
          position = COALESCE(?, position),
          title = COALESCE(?, title),
          assignee = COALESCE(?, assignee),
          assignee_id = COALESCE(?, assignee_id),
          due_date = COALESCE(?, due_date),
          priority = COALESCE(?, priority)
      WHERE id = ?
    `).run(stage, position, title, assignee, assigneeId, dueDate, priority, id);

    // Perbarui progres proyek jika status berubah
    let newProjectProgress = undefined;
    if (stage && stage !== existing.stage) {
      newProjectProgress = updateProjectProgress(existing.project_id);
    }

    const updated = db.prepare(`
      SELECT t.*, p.name as project_name, p.progress as project_progress
      FROM project_tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.id = ?
    `).get(id);

    return new Response(JSON.stringify({
      success: true,
      message: 'Tugas berhasil diperbarui',
      data: updated,
      projectProgress: newProjectProgress,
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

export const PUT = PATCH;

// DELETE: Hapus tugas
export const DELETE: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    const existing = db.prepare('SELECT project_id FROM project_tasks WHERE id = ?').get(id) as any;
    if (!existing) {
      return new Response(JSON.stringify({ success: false, error: 'Tugas tidak ditemukan' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    db.prepare('DELETE FROM project_tasks WHERE id = ?').run(id);
    updateProjectProgress(existing.project_id);

    return new Response(JSON.stringify({
      success: true,
      message: 'Tugas berhasil dihapus',
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

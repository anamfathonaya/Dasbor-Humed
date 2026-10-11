import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../../../lib/db';

initDatabase();

function updateProjectProgress(projectId: number) {
  const tasks = db.prepare('SELECT stage FROM project_tasks WHERE project_id = ?').all(projectId) as { stage: string }[];
  if (tasks.length === 0) return 0;
  const doneCount = tasks.filter(t => t.stage === 'done').length;
  const newProgress = Math.round((doneCount / tasks.length) * 100);

  db.prepare('UPDATE projects SET progress = ? WHERE id = ?').run(newProgress, projectId);
  return newProgress;
}

// PATCH / POST: Ubah tahap kartu kanban dan urutannya
const stageHandler: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    const body = await request.json();
    const { stage, position } = body;

    const validStages = ['todo', 'in_progress', 'review', 'done'];
    if (!stage || !validStages.includes(stage)) {
      return new Response(
        JSON.stringify({ success: false, error: "Tahap (stage) harus salah satu dari: 'todo', 'in_progress', 'review', 'done'" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const existing = db.prepare('SELECT * FROM project_tasks WHERE id = ?').get(id) as any;
    if (!existing) {
      return new Response(JSON.stringify({ success: false, error: 'Tugas tidak ditemukan' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    db.prepare(`
      UPDATE project_tasks
      SET stage = ?,
          position = COALESCE(?, position)
      WHERE id = ?
    `).run(stage, position, id);

    const newProgress = updateProjectProgress(existing.project_id);

    const updated = db.prepare(`
      SELECT t.*, p.name as project_name, p.progress as project_progress
      FROM project_tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.id = ?
    `).get(id);

    return new Response(JSON.stringify({
      success: true,
      message: 'Tahap tugas berhasil diperbarui',
      data: updated,
      projectProgress: newProgress,
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

export const PATCH = stageHandler;
export const POST = stageHandler;

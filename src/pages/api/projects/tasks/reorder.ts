import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../../lib/db';

initDatabase();

function updateProjectProgress(projectId: number) {
  const tasks = db.prepare('SELECT stage FROM project_tasks WHERE project_id = ?').all(projectId) as { stage: string }[];
  if (tasks.length === 0) return 0;
  const doneCount = tasks.filter(t => t.stage === 'done').length;
  const newProgress = Math.round((doneCount / tasks.length) * 100);

  db.prepare('UPDATE projects SET progress = ? WHERE id = ?').run(newProgress, projectId);
  return newProgress;
}

// POST: Batch reorder kartu kanban
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { items } = body as { items: { id: number; stage: string; position: number }[] };

    if (!Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'items array wajib diisi' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const updateStmt = db.prepare(`
      UPDATE project_tasks
      SET stage = ?,
          position = ?
      WHERE id = ?
    `);

    const affectedProjectIds = new Set<number>();

    const transaction = db.transaction((taskItems: typeof items) => {
      for (const item of taskItems) {
        const task = db.prepare('SELECT project_id FROM project_tasks WHERE id = ?').get(item.id) as any;
        if (task) {
          affectedProjectIds.add(task.project_id);
          updateStmt.run(item.stage, item.position, item.id);
        }
      }
    });

    transaction(items);

    // Update progress untuk setiap proyek yang terpengaruh
    for (const projId of affectedProjectIds) {
      updateProjectProgress(projId);
    }

    return new Response(JSON.stringify({
      success: true,
      message: `${items.length} kartu berhasil diperbarui urutan dan tahapnya`,
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

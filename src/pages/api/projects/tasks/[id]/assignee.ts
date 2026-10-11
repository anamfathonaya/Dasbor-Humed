import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../../../lib/db';

initDatabase();

// PATCH / POST: Ubah penanggung jawab (assignee) tugas proyek
const assigneeHandler: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    const body = await request.json();
    const { assignee, assignee_id } = body;

    if (!assignee) {
      return new Response(
        JSON.stringify({ success: false, error: 'Nama penanggung jawab (assignee) wajib diisi' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const existing = db.prepare('SELECT * FROM project_tasks WHERE id = ?').get(id);
    if (!existing) {
      return new Response(JSON.stringify({ success: false, error: 'Tugas tidak ditemukan' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    db.prepare(`
      UPDATE project_tasks
      SET assignee = ?,
          assignee_id = ?
      WHERE id = ?
    `).run(assignee, assignee_id || null, id);

    const updated = db.prepare(`
      SELECT t.*, p.name as project_name
      FROM project_tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.id = ?
    `).get(id);

    return new Response(JSON.stringify({
      success: true,
      message: 'Penanggung jawab tugas berhasil diperbarui',
      data: updated,
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

export const PATCH = assigneeHandler;
export const POST = assigneeHandler;

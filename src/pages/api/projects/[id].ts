import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../lib/db';

initDatabase();

// GET: Detail proyek tunggal beserta pekerjaannya
export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as any;

    if (!project) {
      return new Response(JSON.stringify({ success: false, error: 'Proyek tidak ditemukan' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const tasks = db.prepare(`
      SELECT id, project_id as projectId, title, stage, assignee, assignee_id as assigneeId, due_date as dueDate, priority
      FROM project_tasks
      WHERE project_id = ?
      ORDER BY due_date ASC
    `).all(id);

    return new Response(JSON.stringify({
      success: true,
      data: {
        ...project,
        tasks,
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

// PUT / PATCH: Perbarui proyek
export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, owner, startDate, endDate, progress, status } = body;

    const existing = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    if (!existing) {
      return new Response(JSON.stringify({ success: false, error: 'Proyek tidak ditemukan' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    db.prepare(`
      UPDATE projects
      SET name = COALESCE(?, name),
          owner = COALESCE(?, owner),
          start_date = COALESCE(?, start_date),
          end_date = COALESCE(?, end_date),
          progress = COALESCE(?, progress),
          status = COALESCE(?, status)
      WHERE id = ?
    `).run(name, owner, startDate, endDate, progress, status, id);

    const updated = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);

    return new Response(JSON.stringify({ success: true, data: updated }), {
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

export const PATCH = PUT;

// DELETE: Hapus proyek
export const DELETE: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    const existing = db.prepare('SELECT id FROM projects WHERE id = ?').get(id);
    if (!existing) {
      return new Response(JSON.stringify({ success: false, error: 'Proyek tidak ditemukan' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    db.prepare('DELETE FROM projects WHERE id = ?').run(id);

    return new Response(JSON.stringify({ success: true, message: 'Proyek berhasil dihapus' }), {
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

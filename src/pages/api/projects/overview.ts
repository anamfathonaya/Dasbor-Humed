import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../lib/db';

initDatabase();

// GET: Agregat progres keseluruhan proyek dan ringkasan perhatian (overdue, due soon, at risk)
export const GET: APIRoute = async ({ url }) => {
  try {
    const projectId = url.searchParams.get('projectId');
    const assignee = url.searchParams.get('assignee');

    const today = new Date().toISOString().substring(0, 10);
    // 5 hari ke depan untuk tenggat mendekat
    const fiveDaysLaterDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    const fiveDaysLater = fiveDaysLaterDate.toISOString().substring(0, 10);

    let taskQuery = `
      SELECT t.*, p.name as project_name
      FROM project_tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (projectId && projectId !== 'all') {
      taskQuery += ' AND t.project_id = ?';
      params.push(Number(projectId));
    }
    if (assignee && assignee !== 'all') {
      taskQuery += ' AND t.assignee = ?';
      params.push(assignee);
    }

    taskQuery += ' ORDER BY t.due_date ASC';

    const tasks = db.prepare(taskQuery).all(...params) as any[];

    const total = tasks.length;
    const done = tasks.filter(t => t.stage === 'done').length;
    const inProgress = tasks.filter(t => t.stage === 'in_progress').length;
    const review = tasks.filter(t => t.stage === 'review').length;
    const todo = tasks.filter(t => t.stage === 'todo').length;

    const overallPct = total > 0 ? Math.round((done / total) * 100) : 0;

    // Perhitungan Ringkasan Perhatian (Attention items)
    const overdueList = tasks.filter(t => t.stage !== 'done' && t.due_date < today);
    const dueSoonList = tasks.filter(t => t.stage !== 'done' && t.due_date >= today && t.due_date <= fiveDaysLater);
    const highPriorityActiveList = tasks.filter(t => t.stage !== 'done' && t.priority === 'Tinggi');

    // Ringkasan per proyek
    const projects = db.prepare('SELECT id, name, owner, start_date, end_date, progress, status FROM projects ORDER BY start_date ASC').all() as any[];
    const projectsSummary = projects.map(p => {
      const pTasks = tasks.filter(t => t.project_id === p.id);
      const pTotal = pTasks.length;
      const pDone = pTasks.filter(t => t.stage === 'done').length;
      const pOverdue = pTasks.filter(t => t.stage !== 'done' && t.due_date < today).length;
      const pProgress = pTotal > 0 ? Math.round((pDone / pTotal) * 100) : p.progress;

      let health: 'on_track' | 'at_risk' | 'delayed' = 'on_track';
      if (pOverdue > 1) health = 'delayed';
      else if (pOverdue === 1 || (pProgress < 30 && p.end_date < fiveDaysLater)) health = 'at_risk';

      return {
        id: p.id,
        name: p.name,
        owner: p.owner,
        startDate: p.start_date,
        endDate: p.end_date,
        totalTasks: pTotal,
        doneTasks: pDone,
        overdueTasks: pOverdue,
        progress: pProgress,
        health,
      };
    });

    return new Response(JSON.stringify({
      success: true,
      filters: {
        projectId: projectId || 'all',
        assignee: assignee || 'all',
        referenceDate: today,
      },
      data: {
        overallProgress: overallPct,
        counts: {
          total,
          done,
          inProgress,
          review,
          todo,
          active: total - done,
        },
        attention: {
          overdueCount: overdueList.length,
          dueSoonCount: dueSoonList.length,
          highPriorityCount: highPriorityActiveList.length,
          overdueItems: overdueList.map(t => ({
            id: t.id,
            title: t.title,
            projectName: t.project_name,
            assignee: t.assignee,
            dueDate: t.due_date,
            priority: t.priority,
            stage: t.stage,
          })),
          dueSoonItems: dueSoonList.map(t => ({
            id: t.id,
            title: t.title,
            projectName: t.project_name,
            assignee: t.assignee,
            dueDate: t.due_date,
            priority: t.priority,
            stage: t.stage,
          })),
        },
        projects: projectsSummary,
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

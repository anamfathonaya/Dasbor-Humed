import { db, dbQueries as sqliteDbQueries } from './db';
import { supabase, getServiceSupabase, isSupabaseConfigured } from './supabase';

/**
 * Lapisan Data Akses Terpadu (Unified Database Layer)
 * 
 * Mendukung akses transparan:
 * - Jika Supabase terkonfigurasi (environment variable aktif), kueri diarahkan ke PostgreSQL Supabase.
 * - Jika Supabase belum dikonfigurasi atau dijalankan dalam mode offline / baseline Astro,
 *   kueri secara otomatis jatuh kembali (fallback) ke SQLite lokal (dasbor.db).
 */

export interface DbLayerOptions {
  useAdmin?: boolean;
  accessToken?: string;
}

export const supabaseQueries = {
  // 1. Roles & Users
  users: {
    getAll: async (options?: DbLayerOptions) => {
      if (!isSupabaseConfigured) {
        return sqliteDbQueries.users.getAll();
      }
      const client = options?.useAdmin ? getServiceSupabase() : supabase;
      const { data, error } = await client
        .from('users')
        .select('id, name, email, role_id, avatar_url, created_at')
        .order('id', { ascending: true });
      if (error) {
        console.warn('[supabaseQueries.users.getAll] Error, falling back to SQLite:', error.message);
        return sqliteDbQueries.users.getAll();
      }
      return data;
    },

    getById: async (id: number, options?: DbLayerOptions) => {
      if (!isSupabaseConfigured) {
        return sqliteDbQueries.users.getById(id);
      }
      const client = options?.useAdmin ? getServiceSupabase() : supabase;
      const { data, error } = await client
        .from('users')
        .select('id, name, email, role_id, avatar_url, created_at')
        .eq('id', id)
        .maybeSingle();
      if (error) {
        console.warn('[supabaseQueries.users.getById] Error, falling back to SQLite:', error.message);
        return sqliteDbQueries.users.getById(id);
      }
      return data;
    },

    getByEmail: async (email: string, options?: DbLayerOptions) => {
      if (!isSupabaseConfigured) {
        return sqliteDbQueries.users.getByEmail(email);
      }
      const client = options?.useAdmin ? getServiceSupabase() : supabase;
      const { data, error } = await client
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();
      if (error) {
        console.warn('[supabaseQueries.users.getByEmail] Error, falling back to SQLite:', error.message);
        return sqliteDbQueries.users.getByEmail(email);
      }
      return data;
    },

    updateProfile: async (
      id: number,
      data: { name?: string; avatar_url?: string; role_id?: number },
      options?: DbLayerOptions
    ) => {
      if (!isSupabaseConfigured) {
        const sets: string[] = [];
        const params: any[] = [];
        if (data.name !== undefined) { sets.push('name = ?'); params.push(data.name); }
        if (data.avatar_url !== undefined) { sets.push('avatar_url = ?'); params.push(data.avatar_url); }
        if (data.role_id !== undefined) { sets.push('role_id = ?'); params.push(data.role_id); }
        if (sets.length > 0) {
          params.push(id);
          db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).run(...params);
        }
        return sqliteDbQueries.users.getById(id);
      }
      const client = options?.useAdmin ? getServiceSupabase() : supabase;
      const { data: updated, error } = await client
        .from('users')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) {
        throw new Error(error.message);
      }
      return updated;
    },
  },

  // 2. Content Calendar & Pillars
  content: {
    getAll: async (
      params?: { channel?: string; pillarId?: number; assigneeId?: number },
      options?: DbLayerOptions
    ) => {
      if (!isSupabaseConfigured) {
        return sqliteDbQueries.content.getAll(params);
      }
      const client = options?.useAdmin ? getServiceSupabase() : supabase;
      let query = client
        .from('content_calendar')
        .select('*, content_pillars(name, color), users(name)')
        .order('scheduled_at', { ascending: true });

      if (params?.channel) {
        query = query.eq('channel', params.channel);
      }
      if (params?.pillarId) {
        query = query.eq('pillar_id', params.pillarId);
      }
      if (params?.assigneeId) {
        query = query.eq('assignee_id', params.assigneeId);
      }

      const { data, error } = await query;
      if (error) {
        console.warn('[supabaseQueries.content.getAll] Error, falling back to SQLite:', error.message);
        return sqliteDbQueries.content.getAll(params);
      }
      return (data || []).map((row: any) => ({
        ...row,
        pillar_name: row.content_pillars?.name || null,
        pillar_color: row.content_pillars?.color || null,
        assignee_name: row.users?.name || null,
      }));
    },

    getById: async (id: number, options?: DbLayerOptions) => {
      if (!isSupabaseConfigured) {
        return db.prepare(`
          SELECT c.*, p.name as pillar_name, p.color as pillar_color, u.name as assignee_name
          FROM content_calendar c
          LEFT JOIN content_pillars p ON c.pillar_id = p.id
          LEFT JOIN users u ON c.assignee_id = u.id
          WHERE c.id = ?
        `).get(id);
      }
      const client = options?.useAdmin ? getServiceSupabase() : supabase;
      const { data, error } = await client
        .from('content_calendar')
        .select('*, content_pillars(name, color), users(name)')
        .eq('id', id)
        .maybeSingle();
      if (error || !data) {
        return null;
      }
      return {
        ...data,
        pillar_name: data.content_pillars?.name || null,
        pillar_color: data.content_pillars?.color || null,
        assignee_name: data.users?.name || null,
      };
    },

    create: async (
      payload: {
        title: string;
        scheduled_at: string;
        channel: string;
        content_type?: string;
        sub_type?: string;
        request_bidang?: string;
        pillar_id?: number;
        assignee_id?: number;
        status?: string;
        remind_before?: number;
      },
      options?: DbLayerOptions
    ) => {
      if (!isSupabaseConfigured) {
        const stmt = db.prepare(`
          INSERT INTO content_calendar (title, scheduled_at, channel, content_type, sub_type, request_bidang, pillar_id, assignee_id, status, remind_before)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const res = stmt.run(
          payload.title,
          payload.scheduled_at,
          payload.channel,
          payload.content_type || null,
          payload.sub_type || null,
          payload.request_bidang || null,
          payload.pillar_id || null,
          payload.assignee_id || null,
          payload.status || 'draft',
          payload.remind_before || 0
        );
        return db.prepare(`
          SELECT c.*, p.name as pillar_name, p.color as pillar_color, u.name as assignee_name
          FROM content_calendar c
          LEFT JOIN content_pillars p ON c.pillar_id = p.id
          LEFT JOIN users u ON c.assignee_id = u.id
          WHERE c.id = ?
        `).get(res.lastInsertRowid);
      }
      const client = options?.useAdmin ? getServiceSupabase() : supabase;
      const { data, error } = await client
        .from('content_calendar')
        .insert({
          title: payload.title,
          scheduled_at: payload.scheduled_at,
          channel: payload.channel,
          content_type: payload.content_type || null,
          sub_type: payload.sub_type || null,
          request_bidang: payload.request_bidang || null,
          pillar_id: payload.pillar_id || null,
          assignee_id: payload.assignee_id || null,
          status: payload.status || 'draft',
          remind_before: payload.remind_before || 0,
        })
        .select('*, content_pillars(name, color), users(name)')
        .single();
      if (error) {
        throw new Error(error.message);
      }
      return {
        ...data,
        pillar_name: data.content_pillars?.name || null,
        pillar_color: data.content_pillars?.color || null,
        assignee_name: data.users?.name || null,
      };
    },

    update: async (
      id: number,
      payload: Partial<{
        title: string;
        scheduled_at: string;
        channel: string;
        content_type: string;
        sub_type: string;
        request_bidang: string;
        pillar_id: number;
        assignee_id: number;
        status: string;
        remind_before: number;
      }>,
      options?: DbLayerOptions
    ) => {
      if (!isSupabaseConfigured) {
        const entries = Object.entries(payload);
        if (entries.length > 0) {
          const sets = entries.map(([key]) => `${key} = ?`).join(', ');
          const values = entries.map(([, val]) => val);
          values.push(id);
          db.prepare(`UPDATE content_calendar SET ${sets} WHERE id = ?`).run(...values);
        }
        return db.prepare(`
          SELECT c.*, p.name as pillar_name, p.color as pillar_color, u.name as assignee_name
          FROM content_calendar c
          LEFT JOIN content_pillars p ON c.pillar_id = p.id
          LEFT JOIN users u ON c.assignee_id = u.id
          WHERE c.id = ?
        `).get(id);
      }
      const client = options?.useAdmin ? getServiceSupabase() : supabase;
      const { data, error } = await client
        .from('content_calendar')
        .update(payload)
        .eq('id', id)
        .select('*, content_pillars(name, color), users(name)')
        .single();
      if (error) {
        throw new Error(error.message);
      }
      return {
        ...data,
        pillar_name: data.content_pillars?.name || null,
        pillar_color: data.content_pillars?.color || null,
        assignee_name: data.users?.name || null,
      };
    },

    delete: async (id: number, options?: DbLayerOptions) => {
      if (!isSupabaseConfigured) {
        db.prepare('DELETE FROM content_calendar WHERE id = ?').run(id);
        return true;
      }
      const client = options?.useAdmin ? getServiceSupabase() : supabase;
      const { error } = await client.from('content_calendar').delete().eq('id', id);
      if (error) {
        throw new Error(error.message);
      }
      return true;
    },

    getPillars: async (options?: DbLayerOptions) => {
      if (!isSupabaseConfigured) {
        return sqliteDbQueries.content.getPillars();
      }
      const client = options?.useAdmin ? getServiceSupabase() : supabase;
      const { data, error } = await client
        .from('content_pillars')
        .select('*')
        .order('id', { ascending: true });
      if (error) {
        console.warn('[supabaseQueries.content.getPillars] Error, falling back to SQLite:', error.message);
        return sqliteDbQueries.content.getPillars();
      }
      return data;
    },

    getThemes: async (pillarId?: number, options?: DbLayerOptions) => {
      if (!isSupabaseConfigured) {
        return sqliteDbQueries.content.getThemes(pillarId);
      }
      const client = options?.useAdmin ? getServiceSupabase() : supabase;
      let query = client.from('content_themes').select('*').order('id', { ascending: true });
      if (pillarId) {
        query = query.eq('pillar_id', pillarId);
      }
      const { data, error } = await query;
      if (error) {
        console.warn('[supabaseQueries.content.getThemes] Error, falling back to SQLite:', error.message);
        return sqliteDbQueries.content.getThemes(pillarId);
      }
      return data;
    },
  },

  // 3. Metrics, Donations, Ad Campaigns, Top Pages
  metrics: {
    getSnapshots: async (source?: string, period = '30d', options?: DbLayerOptions) => {
      if (!isSupabaseConfigured) {
        return sqliteDbQueries.metrics.getSnapshots(source, period);
      }
      const client = options?.useAdmin ? getServiceSupabase() : supabase;
      let query = client.from('metric_snapshots').select('*').eq('period', period);
      if (source) {
        query = query.eq('source', source);
      }
      const { data, error } = await query;
      if (error) {
        console.warn('[supabaseQueries.metrics.getSnapshots] Error, falling back to SQLite:', error.message);
        return sqliteDbQueries.metrics.getSnapshots(source, period);
      }
      return data;
    },

    getDonations: async (options?: DbLayerOptions) => {
      if (!isSupabaseConfigured) {
        return sqliteDbQueries.metrics.getDonations();
      }
      const client = options?.useAdmin ? getServiceSupabase() : supabase;
      const { data, error } = await client
        .from('donations')
        .select('*')
        .order('amount', { ascending: false });
      if (error) {
        console.warn('[supabaseQueries.metrics.getDonations] Error, falling back to SQLite:', error.message);
        return sqliteDbQueries.metrics.getDonations();
      }
      return data;
    },

    getAdCampaigns: async (options?: DbLayerOptions) => {
      if (!isSupabaseConfigured) {
        return sqliteDbQueries.metrics.getAdCampaigns();
      }
      const client = options?.useAdmin ? getServiceSupabase() : supabase;
      const { data, error } = await client
        .from('ad_campaigns')
        .select('*')
        .order('spend', { ascending: false });
      if (error) {
        console.warn('[supabaseQueries.metrics.getAdCampaigns] Error, falling back to SQLite:', error.message);
        return sqliteDbQueries.metrics.getAdCampaigns();
      }
      return data;
    },

    getTopPages: async (options?: DbLayerOptions) => {
      if (!isSupabaseConfigured) {
        return sqliteDbQueries.metrics.getTopPages();
      }
      const client = options?.useAdmin ? getServiceSupabase() : supabase;
      const { data, error } = await client
        .from('top_pages')
        .select('*')
        .order('views', { ascending: false });
      if (error) {
        console.warn('[supabaseQueries.metrics.getTopPages] Error, falling back to SQLite:', error.message);
        return sqliteDbQueries.metrics.getTopPages();
      }
      return data;
    },
  },

  // 4. Projects & Tasks
  projects: {
    getAll: async (options?: DbLayerOptions) => {
      if (!isSupabaseConfigured) {
        return sqliteDbQueries.projects.getAll();
      }
      const client = options?.useAdmin ? getServiceSupabase() : supabase;
      const { data, error } = await client
        .from('projects')
        .select('*, project_tasks(*)')
        .order('id', { ascending: true });
      if (error) {
        console.warn('[supabaseQueries.projects.getAll] Error, falling back to SQLite:', error.message);
        return sqliteDbQueries.projects.getAll();
      }
      return (data || []).map((p: any) => ({
        ...p,
        tasks: p.project_tasks || [],
      }));
    },

    getTasks: async (projectId?: number, options?: DbLayerOptions) => {
      if (!isSupabaseConfigured) {
        return sqliteDbQueries.projects.getTasks(projectId);
      }
      const client = options?.useAdmin ? getServiceSupabase() : supabase;
      let query = client.from('project_tasks').select('*').order('id', { ascending: true });
      if (projectId) {
        query = query.eq('project_id', projectId);
      }
      const { data, error } = await query;
      if (error) {
        console.warn('[supabaseQueries.projects.getTasks] Error, falling back to SQLite:', error.message);
        return sqliteDbQueries.projects.getTasks(projectId);
      }
      return data;
    },

    updateTaskStage: async (taskId: number, stage: string, options?: DbLayerOptions) => {
      if (!isSupabaseConfigured) {
        db.prepare('UPDATE project_tasks SET stage = ? WHERE id = ?').run(stage, taskId);
        return db.prepare('SELECT * FROM project_tasks WHERE id = ?').get(taskId);
      }
      const client = options?.useAdmin ? getServiceSupabase() : supabase;
      const { data, error } = await client
        .from('project_tasks')
        .update({ stage })
        .eq('id', taskId)
        .select()
        .single();
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  },

  // 5. News Sources & News Items
  news: {
    getSources: async (activeOnly = false, options?: DbLayerOptions) => {
      if (!isSupabaseConfigured) {
        return sqliteDbQueries.news.getSources(activeOnly);
      }
      const client = options?.useAdmin ? getServiceSupabase() : supabase;
      let query = client.from('news_sources').select('*').order('id', { ascending: true });
      if (activeOnly) {
        query = query.eq('is_active', true);
      }
      const { data, error } = await query;
      if (error) {
        console.warn('[supabaseQueries.news.getSources] Error, falling back to SQLite:', error.message);
        return sqliteDbQueries.news.getSources(activeOnly);
      }
      return data;
    },

    getStream: async (limit = 50, options?: DbLayerOptions) => {
      if (!isSupabaseConfigured) {
        return sqliteDbQueries.news.getStream(limit);
      }
      const client = options?.useAdmin ? getServiceSupabase() : supabase;
      const { data, error } = await client
        .from('news_items')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(limit);
      if (error) {
        console.warn('[supabaseQueries.news.getStream] Error, falling back to SQLite:', error.message);
        return sqliteDbQueries.news.getStream(limit);
      }
      return data;
    },

    markItemRead: async (itemId: number, isRead = true, options?: DbLayerOptions) => {
      if (!isSupabaseConfigured) {
        db.prepare('UPDATE news_items SET is_read = ? WHERE id = ?').run(isRead ? 1 : 0, itemId);
        return true;
      }
      const client = options?.useAdmin ? getServiceSupabase() : supabase;
      const { error } = await client
        .from('news_items')
        .update({ is_read: isRead })
        .eq('id', itemId);
      if (error) {
        throw new Error(error.message);
      }
      return true;
    },
  },

  // 6. Insights
  insights: {
    getTrending: async (options?: DbLayerOptions) => {
      if (!isSupabaseConfigured) {
        return sqliteDbQueries.insights.getTrending();
      }
      const client = options?.useAdmin ? getServiceSupabase() : supabase;
      const { data, error } = await client
        .from('trending_topics')
        .select('*')
        .order('rank', { ascending: true });
      if (error) {
        console.warn('[supabaseQueries.insights.getTrending] Error, falling back to SQLite:', error.message);
        return sqliteDbQueries.insights.getTrending();
      }
      return data;
    },

    getGaps: async (options?: DbLayerOptions) => {
      if (!isSupabaseConfigured) {
        return sqliteDbQueries.insights.getGaps();
      }
      const client = options?.useAdmin ? getServiceSupabase() : supabase;
      const { data, error } = await client
        .from('content_gaps')
        .select('*')
        .order('id', { ascending: true });
      if (error) {
        console.warn('[supabaseQueries.insights.getGaps] Error, falling back to SQLite:', error.message);
        return sqliteDbQueries.insights.getGaps();
      }
      return data;
    },

    getRecommendations: async (options?: DbLayerOptions) => {
      if (!isSupabaseConfigured) {
        return sqliteDbQueries.insights.getRecommendations();
      }
      const client = options?.useAdmin ? getServiceSupabase() : supabase;
      const { data, error } = await client
        .from('idea_recommendations')
        .select('*')
        .eq('is_skipped', false)
        .order('id', { ascending: true });
      if (error) {
        console.warn('[supabaseQueries.insights.getRecommendations] Error, falling back to SQLite:', error.message);
        return sqliteDbQueries.insights.getRecommendations();
      }
      return data;
    },

    getSaved: async (options?: DbLayerOptions) => {
      if (!isSupabaseConfigured) {
        return sqliteDbQueries.insights.getSaved();
      }
      const client = options?.useAdmin ? getServiceSupabase() : supabase;
      const { data, error } = await client
        .from('saved_ideas')
        .select('*')
        .order('id', { ascending: false });
      if (error) {
        console.warn('[supabaseQueries.insights.getSaved] Error, falling back to SQLite:', error.message);
        return sqliteDbQueries.insights.getSaved();
      }
      return data;
    },
  },

  // 7. Knowledge & SOP
  knowledge: {
    getCategories: async (options?: DbLayerOptions) => {
      if (!isSupabaseConfigured) {
        return sqliteDbQueries.knowledge.getCategories();
      }
      const client = options?.useAdmin ? getServiceSupabase() : supabase;
      const { data, error } = await client
        .from('knowledge_categories')
        .select('*')
        .order('id', { ascending: true });
      if (error) {
        console.warn('[supabaseQueries.knowledge.getCategories] Error, falling back to SQLite:', error.message);
        return sqliteDbQueries.knowledge.getCategories();
      }
      return data;
    },

    getDocs: async (search?: string, options?: DbLayerOptions) => {
      if (!isSupabaseConfigured) {
        return sqliteDbQueries.knowledge.getDocs(search);
      }
      const client = options?.useAdmin ? getServiceSupabase() : supabase;
      let query = client.from('knowledge_docs').select('*').order('id', { ascending: true });
      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }
      const { data, error } = await query;
      if (error) {
        console.warn('[supabaseQueries.knowledge.getDocs] Error, falling back to SQLite:', error.message);
        return sqliteDbQueries.knowledge.getDocs(search);
      }
      return data;
    },

    getProposals: async (options?: DbLayerOptions) => {
      if (!isSupabaseConfigured) {
        return sqliteDbQueries.knowledge.getProposals();
      }
      const client = options?.useAdmin ? getServiceSupabase() : supabase;
      const { data, error } = await client
        .from('doc_proposals')
        .select('*')
        .order('id', { ascending: false });
      if (error) {
        console.warn('[supabaseQueries.knowledge.getProposals] Error, falling back to SQLite:', error.message);
        return sqliteDbQueries.knowledge.getProposals();
      }
      return data;
    },
  },

  // 8. Budget & Annual Reports
  budget: {
    getLines: async (year = 2026, options?: DbLayerOptions) => {
      if (!isSupabaseConfigured) {
        return sqliteDbQueries.budget.getLines(year);
      }
      const client = options?.useAdmin ? getServiceSupabase() : supabase;
      const { data, error } = await client
        .from('budget_lines')
        .select('*')
        .eq('year', year)
        .order('id', { ascending: true });
      if (error) {
        console.warn('[supabaseQueries.budget.getLines] Error, falling back to SQLite:', error.message);
        return sqliteDbQueries.budget.getLines(year);
      }
      return data;
    },

    getAnnualReports: async (options?: DbLayerOptions) => {
      if (!isSupabaseConfigured) {
        return sqliteDbQueries.budget.getAnnualReports();
      }
      const client = options?.useAdmin ? getServiceSupabase() : supabase;
      const { data, error } = await client
        .from('annual_reports')
        .select('*')
        .order('year', { ascending: false });
      if (error) {
        console.warn('[supabaseQueries.budget.getAnnualReports] Error, falling back to SQLite:', error.message);
        return sqliteDbQueries.budget.getAnnualReports();
      }
      return data;
    },
  },

  // 9. Audit Logs
  audit: {
    getRecent: async (limit = 100, options?: DbLayerOptions) => {
      if (!isSupabaseConfigured) {
        return sqliteDbQueries.audit.getRecent(limit);
      }
      const client = options?.useAdmin ? getServiceSupabase() : supabase;
      const { data, error } = await client
        .from('audit_logs')
        .select('*')
        .order('id', { ascending: false })
        .limit(limit);
      if (error) {
        console.warn('[supabaseQueries.audit.getRecent] Error, falling back to SQLite:', error.message);
        return sqliteDbQueries.audit.getRecent(limit);
      }
      return data;
    },

    create: async (
      entry: {
        user_id?: number | null;
        user_name?: string | null;
        user_role?: string | null;
        action: string;
        target: string;
        ip_address?: string | null;
        status: string;
        details?: string | null;
      },
      options?: DbLayerOptions
    ) => {
      if (!isSupabaseConfigured) {
        db.prepare(`
          INSERT INTO audit_logs (user_id, user_name, user_role, action, target, ip_address, status, details)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          entry.user_id || null,
          entry.user_name || null,
          entry.user_role || null,
          entry.action,
          entry.target,
          entry.ip_address || null,
          entry.status,
          entry.details || null
        );
        return true;
      }
      const client = options?.useAdmin ? getServiceSupabase() : supabase;
      const { error } = await client.from('audit_logs').insert(entry);
      if (error) {
        console.warn('[supabaseQueries.audit.create] Error inserting audit log:', error.message);
      }
      return true;
    },
  },
};

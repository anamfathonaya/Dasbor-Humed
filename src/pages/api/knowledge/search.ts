import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../lib/db';
import { getUserRole } from '../../../lib/auth';

initDatabase();

export interface SearchMatch {
  docId: number;
  code: string;
  title: string;
  category: string;
  accessRole: string;
  version: string;
  readTime: string;
  matchType: 'title' | 'description' | 'section_content' | 'checklist' | 'sop_step';
  matchLocation: string;
  snippet: string;
}

// GET: Pencarian mendalam (deep content search) pada teks, heading, checklist, dan alur langkah SOP
export const GET: APIRoute = async ({ request, url }) => {
  try {
    const q = url.searchParams.get('q') || url.searchParams.get('query') || '';
    const category = url.searchParams.get('category');
    const role = getUserRole(request, url);

    if (!q || q.trim().length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          query: '',
          count: 0,
          results: [],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const keyword = q.trim().toLowerCase();
    const sqlLike = `%${keyword}%`;

    // Role filtering (least privilege)
    let roleFilter = '';
    if (role === 'staff') {
      roleFilter = ` AND kd.access_role = 'all'`;
    } else if (role === 'admin') {
      roleFilter = ` AND kd.access_role IN ('all', 'admin')`;
    }

    let categoryFilter = '';
    const paramsBase: any[] = [];
    if (category && category !== 'all' && category !== 'Semua Kategori') {
      categoryFilter = ` AND kd.category = ?`;
      paramsBase.push(category);
    }

    // 1. Ambil dokumen yang cocok pada metadata dokumen utama (Title / Description / Code)
    const docQuery = `
      SELECT kd.id, kd.code, kd.title, kd.category, kd.access_role, kd.version, kd.read_time, kd.description
      FROM knowledge_docs kd
      WHERE kd.is_archived = 0 ${roleFilter} ${categoryFilter}
      AND (LOWER(kd.title) LIKE ? OR LOWER(kd.description) LIKE ? OR LOWER(kd.code) LIKE ?)
    `;
    const docMatches = db.prepare(docQuery).all(...paramsBase, sqlLike, sqlLike, sqlLike) as any[];

    // 2. Ambil kecocokan pada teks bagian dokumen (doc_sections: heading, content, checklist)
    const sectionQuery = `
      SELECT ds.doc_id, ds.heading, ds.content, ds.checklist,
             kd.code, kd.title, kd.category, kd.access_role, kd.version, kd.read_time
      FROM doc_sections ds
      JOIN knowledge_docs kd ON ds.doc_id = kd.id
      WHERE kd.is_archived = 0 ${roleFilter} ${categoryFilter}
      AND (LOWER(ds.heading) LIKE ? OR LOWER(ds.content) LIKE ? OR LOWER(ds.checklist) LIKE ?)
    `;
    const sectionMatches = db.prepare(sectionQuery).all(...paramsBase, sqlLike, sqlLike, sqlLike) as any[];

    // 3. Ambil kecocokan pada alur langkah SOP (sop_steps: title, action, output)
    const stepQuery = `
      SELECT ss.doc_id, ss.step_number, ss.phase, ss.title as step_title, ss.action, ss.output,
             kd.code, kd.title, kd.category, kd.access_role, kd.version, kd.read_time
      FROM sop_steps ss
      JOIN knowledge_docs kd ON ss.doc_id = kd.id
      WHERE kd.is_archived = 0 ${roleFilter} ${categoryFilter}
      AND (LOWER(ss.title) LIKE ? OR LOWER(ss.action) LIKE ? OR LOWER(ss.output) LIKE ?)
    `;
    const stepMatches = db.prepare(stepQuery).all(...paramsBase, sqlLike, sqlLike, sqlLike) as any[];

    const results: SearchMatch[] = [];
    const seenMap = new Set<string>();

    // Helper membuat cuplikan teks dengan highlight
    const createSnippet = (text: string, term: string, maxLen = 150): string => {
      const idx = text.toLowerCase().indexOf(term.toLowerCase());
      if (idx === -1) return text.substring(0, maxLen) + (text.length > maxLen ? '...' : '');
      const start = Math.max(0, idx - 40);
      const end = Math.min(text.length, idx + term.length + 90);
      const prefix = start > 0 ? '...' : '';
      const suffix = end < text.length ? '...' : '';
      return `${prefix}${text.substring(start, end)}${suffix}`;
    };

    // Tambahkan kecocokan dokumen utama
    docMatches.forEach(d => {
      const isTitle = d.title.toLowerCase().includes(keyword);
      const key = `${d.id}_doc`;
      if (!seenMap.has(key)) {
        seenMap.add(key);
        results.push({
          docId: d.id,
          code: d.code,
          title: d.title,
          category: d.category,
          accessRole: d.access_role,
          version: d.version,
          readTime: d.read_time,
          matchType: isTitle ? 'title' : 'description',
          matchLocation: isTitle ? 'Judul Dokumen' : 'Ringkasan Deskripsi',
          snippet: createSnippet(isTitle ? d.title : d.description, keyword),
        });
      }
    });

    // Tambahkan kecocokan section
    sectionMatches.forEach(s => {
      const isHeading = s.heading.toLowerCase().includes(keyword);
      const isContent = s.content.toLowerCase().includes(keyword);
      const key = `${s.doc_id}_sec_${s.heading}`;
      if (!seenMap.has(key)) {
        seenMap.add(key);
        let matchType: any = 'section_content';
        let matchLocation = s.heading;
        let snippetText = s.content;

        if (isHeading) {
          matchLocation = `Bab: ${s.heading}`;
          snippetText = s.content;
        } else if (!isContent && s.checklist) {
          matchType = 'checklist';
          matchLocation = `Checklist / Poin Kepatuhan (${s.heading})`;
          snippetText = s.checklist;
        }

        results.push({
          docId: s.doc_id,
          code: s.code,
          title: s.title,
          category: s.category,
          accessRole: s.access_role,
          version: s.version,
          readTime: s.read_time,
          matchType,
          matchLocation,
          snippet: createSnippet(snippetText, keyword),
        });
      }
    });

    // Tambahkan kecocokan langkah SOP
    stepMatches.forEach(st => {
      const key = `${st.doc_id}_step_${st.step_number}`;
      if (!seenMap.has(key)) {
        seenMap.add(key);
        results.push({
          docId: st.doc_id,
          code: st.code,
          title: st.title,
          category: st.category,
          accessRole: st.access_role,
          version: st.version,
          readTime: st.read_time,
          matchType: 'sop_step',
          matchLocation: `Langkah ${st.step_number}: ${st.step_title} (${st.phase})`,
          snippet: createSnippet(`${st.action} | Output: ${st.output}`, keyword),
        });
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        query: q,
        role,
        count: results.length,
        results,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error deep searching knowledge content:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Gagal melakukan pencarian isi dokumen.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../../lib/db';
import { getUserRole, requireKnowledgePermission, canAccessDoc } from '../../../../lib/auth';

initDatabase();

// GET: Ambil daftar dokumen Basis Pengetahuan & SOP
export const GET: APIRoute = async ({ request, url }) => {
  try {
    const category = url.searchParams.get('category');
    const search = url.searchParams.get('search');
    const role = getUserRole(request, url); // 'staff' | 'admin' | 'head'

    let query = `
      SELECT 
        kd.id, kd.code, kd.title, kd.category, kd.category_id, kd.description,
        kd.version, kd.author, kd.access_role, kd.read_time, kd.download_url,
        kd.related_codes, kd.created_at, kd.updated_at,
        kc.name as category_name, kc.icon as category_icon, kc.color as category_color
      FROM knowledge_docs kd
      LEFT JOIN knowledge_categories kc ON kd.category_id = kc.id
      WHERE kd.is_archived = 0
    `;
    const params: any[] = [];

    if (category && category !== 'all' && category !== 'Semua Kategori') {
      query += ` AND (kd.category = ? OR kc.slug = ?)`;
      params.push(category, category);
    }

    if (search && search.trim() !== '') {
      const q = `%${search.trim().toLowerCase()}%`;
      query += ` AND (LOWER(kd.title) LIKE ? OR LOWER(kd.description) LIKE ? OR LOWER(kd.code) LIKE ?)`;
      params.push(q, q, q);
    }

    // Role filtering (least privilege)
    if (role === 'staff') {
      query += ` AND kd.access_role = 'all'`;
    } else if (role === 'admin') {
      query += ` AND kd.access_role IN ('all', 'admin')`;
    }
    // Jika role === 'head': dapat melihat semua ('all', 'admin', 'head')

    query += ` ORDER BY kd.id ASC`;

    const docs = db.prepare(query).all(...params) as any[];

    // Parse related_codes JSON array
    const formattedDocs = docs.map(d => ({
      id: d.id,
      code: d.code,
      title: d.title,
      category: d.category,
      categoryMeta: d.category_id ? {
        id: d.category_id,
        name: d.category_name,
        icon: d.category_icon,
        color: d.category_color,
      } : null,
      description: d.description,
      version: d.version,
      author: d.author,
      accessRole: d.access_role,
      readTime: d.read_time,
      downloadUrl: d.download_url,
      relatedCodes: d.related_codes ? JSON.parse(d.related_codes) : [],
      updatedAt: d.updated_at,
    }));

    // Ambil daftar kategori untuk filter metadata
    const categories = db.prepare(`SELECT * FROM knowledge_categories ORDER BY id ASC`).all();

    return new Response(
      JSON.stringify({
        success: true,
        userRole: role,
        count: formattedDocs.length,
        categories,
        docs: formattedDocs,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error fetching knowledge docs:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Gagal memuat dokumen.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// POST: Tambah dokumen baru ke Basis Pengetahuan (hanya Admin & Head)
export const POST: APIRoute = async ({ request, url }) => {
  // Otorisasi peran: staf dilarang membuat dokumen resmi langsung (harus lewat form usulan)
  const authCheck = requireKnowledgePermission(request, 'create_doc', url);
  if (!authCheck.allowed && authCheck.response) {
    return authCheck.response;
  }

  try {
    const data = await request.json();
    const { code, title, category, description, version = 'v1.0', author, accessRole = 'all', readTime = '5 menit', sections, steps, relatedCodes } = data;

    if (!code || !title || !category || !description) {
      return new Response(
        JSON.stringify({ success: false, error: 'Kode, judul, kategori, dan deskripsi wajib diisi.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Ambil category_id dari nama kategori
    const catRow = db.prepare(`SELECT id FROM knowledge_categories WHERE name = ?`).get(category) as any;
    const catId = catRow ? catRow.id : null;

    const insertDoc = db.prepare(`
      INSERT INTO knowledge_docs (
        code, title, category, category_id, description, version, author,
        access_role, read_time, related_codes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertDoc.run(
      code.trim().toUpperCase(),
      title.trim(),
      category,
      catId,
      description.trim(),
      version,
      author || 'Divisi Humas & Media',
      accessRole,
      readTime,
      relatedCodes ? JSON.stringify(relatedCodes) : null
    );

    const docId = result.lastInsertRowid;

    // Simpan sections jika ada
    if (Array.isArray(sections) && sections.length > 0) {
      const insertSection = db.prepare(`
        INSERT INTO doc_sections (doc_id, position, heading, content, checklist, notes)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      sections.forEach((sec, idx) => {
        insertSection.run(
          docId,
          idx + 1,
          sec.heading || `Bagian ${idx + 1}`,
          sec.content || '',
          sec.checklist ? JSON.stringify(sec.checklist) : null,
          sec.notes || null
        );
      });
    }

    // Simpan steps jika ada
    if (Array.isArray(steps) && steps.length > 0) {
      const insertStep = db.prepare(`
        INSERT INTO sop_steps (doc_id, step_number, phase, title, actor, action, output, sla_time)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      steps.forEach((st, idx) => {
        insertStep.run(
          docId,
          st.stepNumber || idx + 1,
          st.phase || 'Pelaksanaan',
          st.title || '',
          st.actor || 'Staf Pelaksana',
          st.action || '',
          st.output || '',
          st.slaTime || null
        );
      });
    }

    const created = db.prepare(`SELECT * FROM knowledge_docs WHERE id = ?`).get(docId) as any;

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Dokumen berhasil ditambahkan ke Basis Pengetahuan.',
        doc: created,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error creating knowledge doc:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Gagal membuat dokumen.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

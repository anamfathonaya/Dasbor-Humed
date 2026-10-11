import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../../lib/db';
import { getUserRole, requireKnowledgePermission, canAccessDoc } from '../../../../lib/auth';

initDatabase();

// GET: Ambil detail 1 dokumen Basis Pengetahuan & SOP beserta sections dan steps
export const GET: APIRoute = async ({ request, url, params }) => {
  try {
    const idOrCode = params.id;
    if (!idOrCode) {
      return new Response(JSON.stringify({ success: false, error: 'Parameter ID atau Kode dokumen wajib.' }), { status: 400 });
    }

    // Cari berdasarkan id numerik atau kode dokumen (e.g. 'SOP-HUM-01')
    let doc: any = null;
    if (/^\d+$/.test(idOrCode)) {
      doc = db.prepare(`
        SELECT kd.*, kc.name as category_name, kc.icon as category_icon, kc.color as category_color
        FROM knowledge_docs kd
        LEFT JOIN knowledge_categories kc ON kd.category_id = kc.id
        WHERE kd.id = ?
      `).get(Number(idOrCode));
    } else {
      doc = db.prepare(`
        SELECT kd.*, kc.name as category_name, kc.icon as category_icon, kc.color as category_color
        FROM knowledge_docs kd
        LEFT JOIN knowledge_categories kc ON kd.category_id = kc.id
        WHERE UPPER(kd.code) = ?
      `).get(idOrCode.toUpperCase());
    }

    if (!doc) {
      return new Response(JSON.stringify({ success: false, error: 'Dokumen tidak ditemukan.' }), { status: 404 });
    }

    // Least Privilege Check: validasi apakah peran pengguna boleh membaca dokumen ini
    const role = getUserRole(request, url);
    if (!canAccessDoc(role, doc.access_role)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Akses ditolak (403 Forbidden): Dokumen '${doc.code}' dikhususkan untuk peran '${doc.access_role}'. Peran Anda saat ini adalah '${role}'.`
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Ambil sections dokumen
    const sectionsRaw = db.prepare(`
      SELECT heading, content, checklist, notes
      FROM doc_sections
      WHERE doc_id = ?
      ORDER BY position ASC, id ASC
    `).all(doc.id) as any[];

    const sections = sectionsRaw.map(s => ({
      heading: s.heading,
      content: s.content,
      checklist: s.checklist ? JSON.parse(s.checklist) : undefined,
      notes: s.notes || undefined,
    }));

    // Ambil SOP steps jika ada
    const stepsRaw = db.prepare(`
      SELECT step_number, phase, title, actor, action, output, sla_time
      FROM sop_steps
      WHERE doc_id = ?
      ORDER BY step_number ASC, id ASC
    `).all(doc.id) as any[];

    const steps = stepsRaw.map(st => ({
      stepNumber: st.step_number,
      phase: st.phase,
      title: st.title,
      actor: st.actor,
      action: st.action,
      output: st.output,
      slaTime: st.sla_time || undefined,
    }));

    // Ambil dokumen terkait jika ada related_codes
    let relatedDocs: any[] = [];
    if (doc.related_codes) {
      try {
        const codes: string[] = JSON.parse(doc.related_codes);
        if (codes.length > 0) {
          const placeholders = codes.map(() => '?').join(',');
          relatedDocs = db.prepare(`
            SELECT id, code, title, category, read_time
            FROM knowledge_docs
            WHERE code IN (${placeholders})
          `).all(...codes);
        }
      } catch {}
    }

    return new Response(
      JSON.stringify({
        success: true,
        doc: {
          id: doc.id,
          code: doc.code,
          title: doc.title,
          category: doc.category,
          categoryMeta: doc.category_id ? {
            id: doc.category_id,
            name: doc.category_name,
            icon: doc.category_icon,
            color: doc.category_color,
          } : null,
          description: doc.description,
          version: doc.version,
          author: doc.author,
          accessRole: doc.access_role,
          readTime: doc.read_time,
          downloadUrl: doc.download_url,
          relatedCodes: doc.related_codes ? JSON.parse(doc.related_codes) : [],
          sections: sections.length > 0 ? sections : undefined,
          steps: steps.length > 0 ? steps : undefined,
          relatedDocs,
          updatedAt: doc.updated_at,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error fetching doc detail:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
};

// PUT: Perbarui metadata / isi dokumen (hanya Admin & Head)
export const PUT: APIRoute = async ({ request, url, params }) => {
  const authCheck = requireKnowledgePermission(request, 'edit_doc', url);
  if (!authCheck.allowed && authCheck.response) {
    return authCheck.response;
  }

  try {
    const id = params.id;
    if (!id) return new Response(JSON.stringify({ success: false, error: 'ID tidak valid' }), { status: 400 });

    const existing = db.prepare(`SELECT * FROM knowledge_docs WHERE id = ?`).get(id) as any;
    if (!existing) return new Response(JSON.stringify({ success: false, error: 'Dokumen tidak ditemukan' }), { status: 404 });

    const data = await request.json();
    const title = data.title !== undefined ? data.title.trim() : existing.title;
    const category = data.category !== undefined ? data.category : existing.category;
    const description = data.description !== undefined ? data.description.trim() : existing.description;
    const version = data.version !== undefined ? data.version : existing.version;
    const author = data.author !== undefined ? data.author : existing.author;
    const accessRole = data.accessRole !== undefined ? data.accessRole : existing.access_role;
    const readTime = data.readTime !== undefined ? data.readTime : existing.read_time;

    db.prepare(`
      UPDATE knowledge_docs
      SET title = ?, category = ?, description = ?, version = ?, author = ?, access_role = ?, read_time = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(title, category, description, version, author, accessRole, readTime, id);

    const updated = db.prepare(`SELECT * FROM knowledge_docs WHERE id = ?`).get(id);

    return new Response(
      JSON.stringify({ success: true, message: 'Dokumen berhasil diperbarui.', doc: updated }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
};

// DELETE: Hapus / arsipkan dokumen resmi (hanya Ketua Bidang / Head)
export const DELETE: APIRoute = async ({ request, url, params }) => {
  const authCheck = requireKnowledgePermission(request, 'delete_doc', url);
  if (!authCheck.allowed && authCheck.response) {
    return authCheck.response;
  }

  try {
    const id = params.id;
    if (!id) return new Response(JSON.stringify({ success: false, error: 'ID tidak valid' }), { status: 400 });

    const existing = db.prepare(`SELECT * FROM knowledge_docs WHERE id = ?`).get(id);
    if (!existing) return new Response(JSON.stringify({ success: false, error: 'Dokumen tidak ditemukan' }), { status: 404 });

    db.prepare(`DELETE FROM knowledge_docs WHERE id = ?`).run(id);

    return new Response(
      JSON.stringify({ success: true, message: 'Dokumen berhasil dihapus dari repositori resmi.' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
};

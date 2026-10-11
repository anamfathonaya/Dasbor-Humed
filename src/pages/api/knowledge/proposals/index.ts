import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../../lib/db';
import { getUserRole } from '../../../../lib/auth';

initDatabase();

// GET: Ambil daftar semua usulan dokumen (dengan filter status, tipe, urgensi)
export const GET: APIRoute = async ({ request, url }) => {
  try {
    const status = url.searchParams.get('status');
    const type = url.searchParams.get('type');
    const urgency = url.searchParams.get('urgency');
    const search = url.searchParams.get('search');
    const role = getUserRole(request, url);

    let query = `
      SELECT id, proposal_code, type, title, category, target_doc_code, target_doc_title,
             submitter_name, submitter_role, urgency, reason, suggested_content,
             status, reviewed_by, reviewed_at, review_notes, created_at, updated_at
      FROM doc_proposals
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status && status !== 'all') {
      query += ` AND status = ?`;
      params.push(status);
    }

    if (type && type !== 'all') {
      query += ` AND type = ?`;
      params.push(type);
    }

    if (urgency && urgency !== 'all') {
      query += ` AND urgency = ?`;
      params.push(urgency);
    }

    if (search && search.trim() !== '') {
      const q = `%${search.trim().toLowerCase()}%`;
      query += ` AND (LOWER(title) LIKE ? OR LOWER(reason) LIKE ? OR LOWER(proposal_code) LIKE ? OR LOWER(submitter_name) LIKE ?)`;
      params.push(q, q, q, q);
    }

    query += ` ORDER BY id DESC`;

    const items = db.prepare(query).all(...params) as any[];

    // Hitung ringkasan status
    const allProposals = db.prepare(`SELECT status FROM doc_proposals`).all() as any[];
    const counts = {
      total: allProposals.length,
      pending: allProposals.filter(p => p.status === 'menunggu_tinjauan').length,
      approved: allProposals.filter(p => p.status === 'disetujui').length,
      needsRevision: allProposals.filter(p => p.status === 'perlu_revisi').length,
      rejected: allProposals.filter(p => p.status === 'ditolak').length,
    };

    return new Response(
      JSON.stringify({
        success: true,
        userRole: role,
        counts,
        proposals: items.map(p => ({
          id: p.proposal_code,
          dbId: p.id,
          type: p.type,
          title: p.title,
          category: p.category,
          targetDocCode: p.target_doc_code || undefined,
          targetDocTitle: p.target_doc_title || undefined,
          submitterName: p.submitter_name,
          submitterRole: p.submitter_role,
          submittedAt: new Date(p.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) + ', ' +
                       new Date(p.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
          urgency: p.urgency,
          reason: p.reason,
          suggestedContent: p.suggested_content,
          status: p.status,
          reviewedBy: p.reviewed_by || undefined,
          reviewedAt: p.reviewed_at || undefined,
          reviewNotes: p.review_notes || undefined,
        })),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error listing proposals:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Gagal memuat usulan dokumen.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// POST: Ajukan usulan baru (Dapat diajukan oleh Staf, Admin, atau Head)
export const POST: APIRoute = async ({ request, url }) => {
  try {
    const role = getUserRole(request, url);
    const data = await request.json();
    const {
      type = 'new', // 'new' | 'revision'
      title,
      category,
      targetDocCode,
      targetDocTitle,
      submitterName = 'Staf Humas',
      urgency = 'normal',
      reason,
      suggestedContent,
    } = data;

    if (!title || !category || !reason || !suggestedContent) {
      return new Response(
        JSON.stringify({ success: false, error: 'Judul, kategori, alasan latar belakang, dan usulan isi wajib diisi.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate unique proposal code: USUL-YYYY-XXX
    const currentYear = new Date().getFullYear();
    const countRow = db.prepare(`SELECT COUNT(*) as total FROM doc_proposals WHERE proposal_code LIKE ?`).get(`USUL-${currentYear}-%`) as any;
    const nextNum = String((countRow?.total || 0) + 1).padStart(3, '0');
    const proposalCode = `USUL-${currentYear}-${nextNum}`;

    const insertStmt = db.prepare(`
      INSERT INTO doc_proposals (
        proposal_code, type, title, category, target_doc_code, target_doc_title,
        submitter_name, submitter_role, urgency, reason, suggested_content,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'menunggu_tinjauan')
    `);

    const result = insertStmt.run(
      proposalCode,
      type,
      title.trim(),
      category,
      targetDocCode || null,
      targetDocTitle || null,
      submitterName.trim(),
      role,
      urgency,
      reason.trim(),
      suggestedContent.trim()
    );

    const proposalId = result.lastInsertRowid;

    // Catat log audit pengajuan
    db.prepare(`
      INSERT INTO doc_proposal_logs (proposal_id, action, previous_status, new_status, actor_name, actor_role, notes)
      VALUES (?, 'created', null, 'menunggu_tinjauan', ?, ?, 'Pengajuan usulan dokumen baru/revisi melalui sistem.')
    `).run(proposalId, submitterName.trim(), role);

    const created = db.prepare(`SELECT * FROM doc_proposals WHERE id = ?`).get(proposalId) as any;

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Usulan dokumen berhasil diajukan dan diteruskan ke meja peninjauan berwenang.',
        proposal: {
          id: created.proposal_code,
          dbId: created.id,
          type: created.type,
          title: created.title,
          status: created.status,
          submitterName: created.submitter_name,
        },
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error submitting proposal:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Gagal mengajukan usulan dokumen.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

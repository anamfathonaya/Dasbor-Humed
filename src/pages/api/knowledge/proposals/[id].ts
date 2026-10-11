import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../../lib/db';
import { getUserRole, requireKnowledgePermission } from '../../../../lib/auth';

initDatabase();

// GET: Ambil detail usulan beserta riwayat audit peninjauannya
export const GET: APIRoute = async ({ params }) => {
  try {
    const idOrCode = params.id;
    if (!idOrCode) {
      return new Response(JSON.stringify({ success: false, error: 'Parameter ID atau Kode usulan wajib.' }), { status: 400 });
    }

    let proposal: any = null;
    if (/^\d+$/.test(idOrCode)) {
      proposal = db.prepare(`SELECT * FROM doc_proposals WHERE id = ?`).get(Number(idOrCode));
    } else {
      proposal = db.prepare(`SELECT * FROM doc_proposals WHERE UPPER(proposal_code) = ?`).get(idOrCode.toUpperCase());
    }

    if (!proposal) {
      return new Response(JSON.stringify({ success: false, error: 'Usulan dokumen tidak ditemukan.' }), { status: 404 });
    }

    // Ambil log audit perubahan status
    const logs = db.prepare(`
      SELECT action, previous_status, new_status, actor_name, actor_role, notes, created_at
      FROM doc_proposal_logs
      WHERE proposal_id = ?
      ORDER BY id ASC
    `).all(proposal.id);

    return new Response(
      JSON.stringify({
        success: true,
        proposal: {
          id: proposal.proposal_code,
          dbId: proposal.id,
          type: proposal.type,
          title: proposal.title,
          category: proposal.category,
          targetDocCode: proposal.target_doc_code || undefined,
          targetDocTitle: proposal.target_doc_title || undefined,
          submitterName: proposal.submitter_name,
          submitterRole: proposal.submitter_role,
          submittedAt: new Date(proposal.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) + ', ' +
                       new Date(proposal.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
          urgency: proposal.urgency,
          reason: proposal.reason,
          suggestedContent: proposal.suggested_content,
          status: proposal.status,
          reviewedBy: proposal.reviewed_by || undefined,
          reviewedAt: proposal.reviewed_at || undefined,
          reviewNotes: proposal.review_notes || undefined,
          logs,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
};

// PUT: Putuskan hasil tinjauan usulan (Hanya Admin & Ketua Bidang / Head)
export const PUT: APIRoute = async ({ request, url, params }) => {
  // Validasi izin: staf dilarang memberikan keputusan tinjauan
  const authCheck = requireKnowledgePermission(request, 'review_proposal', url);
  if (!authCheck.allowed && authCheck.response) {
    return authCheck.response;
  }

  try {
    const idOrCode = params.id;
    if (!idOrCode) {
      return new Response(JSON.stringify({ success: false, error: 'Parameter ID atau Kode usulan wajib.' }), { status: 400 });
    }

    let existing: any = null;
    if (/^\d+$/.test(idOrCode)) {
      existing = db.prepare(`SELECT * FROM doc_proposals WHERE id = ?`).get(Number(idOrCode));
    } else {
      existing = db.prepare(`SELECT * FROM doc_proposals WHERE UPPER(proposal_code) = ?`).get(idOrCode.toUpperCase());
    }

    if (!existing) {
      return new Response(JSON.stringify({ success: false, error: 'Usulan dokumen tidak ditemukan.' }), { status: 404 });
    }

    const data = await request.json();
    const { decision, notes = '', reviewerName } = data; // decision: 'disetujui' | 'perlu_revisi' | 'ditolak'

    if (!decision || !['disetujui', 'perlu_revisi', 'ditolak', 'menunggu_tinjauan'].includes(decision)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Keputusan tidak valid. Pilih antara disetujui, perlu_revisi, atau ditolak.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const role = getUserRole(request, url);
    const defaultReviewer = role === 'head' 
      ? 'Dr. Hendra Gunawan (Ketua Bidang Humas)' 
      : 'Siti Rahma (Admin Humas)';
    const finalReviewer = reviewerName || defaultReviewer;

    const nowStr = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) + ', ' +
                   new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

    // Update status dan catatan peninjauan
    db.prepare(`
      UPDATE doc_proposals
      SET status = ?, reviewed_by = ?, reviewed_at = ?, review_notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(decision, finalReviewer, nowStr, notes.trim(), existing.id);

    // Catat log audit keputusan
    db.prepare(`
      INSERT INTO doc_proposal_logs (proposal_id, action, previous_status, new_status, actor_name, actor_role, notes)
      VALUES (?, 'status_changed', ?, ?, ?, ?, ?)
    `).run(existing.id, existing.status, decision, finalReviewer, role, notes.trim() || 'Pembaruan status resmi peninjau');

    const updated = db.prepare(`SELECT * FROM doc_proposals WHERE id = ?`).get(existing.id) as any;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Keputusan resmi berhasil disimpan: Usulan ${updated.proposal_code} kini berstatus '${decision}'.`,
        proposal: {
          id: updated.proposal_code,
          dbId: updated.id,
          status: updated.status,
          reviewedBy: updated.reviewed_by,
          reviewedAt: updated.reviewed_at,
          reviewNotes: updated.review_notes,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error reviewing proposal:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
};

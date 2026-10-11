import type { APIRoute } from 'astro';
import crypto from 'node:crypto';
import { db, initDatabase } from '../../../lib/db';

initDatabase();

// GET: Ambil daftar riwayat tautan & berkas laporan yang telah dibagikan
export const GET: APIRoute = async ({ url }) => {
  try {
    const reportType = url.searchParams.get('type');

    let query = `
      SELECT id, share_token, report_type, title, target_recipient, recipient_channel, download_url, year, period, expires_at, access_count, last_accessed_at, notes, created_at
      FROM shared_reports
      WHERE 1=1
    `;
    const params: any[] = [];

    if (reportType && reportType !== 'all') {
      query += ` AND report_type = ?`;
      params.push(reportType);
    }

    query += ` ORDER BY id DESC`;

    const shares = db.prepare(query).all(...params) as any[];

    return new Response(
      JSON.stringify({
        success: true,
        count: shares.length,
        shares: shares.map(s => ({
          ...s,
          shareLink: `/bagikan-cetak?token=${s.share_token}`,
        })),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error listing shared reports:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Gagal memuat riwayat pengiriman tautan laporan.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// POST: Buat tautan bagikan baru dan simpan log pengiriman berkas laporan
export const POST: APIRoute = async ({ request, url }) => {
  try {
    const data = await request.json();
    const {
      reportType = 'budget',
      title,
      targetRecipient = 'Publik / Mitra',
      recipientChannel = 'link',
      year = 2026,
      period = '30d',
      notes = '',
      expiresInDays = 30,
    } = data;

    const reportTitle = title || `Laporan Resmi ${reportType === 'budget' ? 'RAB & LRA' : reportType === 'annual' ? 'Tahunan' : 'Kinerja'} ${year || period}`;
    const shareToken = crypto.randomBytes(12).toString('hex');
    const downloadUrl = `/api/reports/export?type=${reportType}&year=${year}&period=${period}`;

    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString();

    const stmt = db.prepare(`
      INSERT INTO shared_reports (
        share_token, report_type, title, target_recipient, recipient_channel,
        download_url, year, period, expires_at, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      shareToken,
      reportType,
      reportTitle,
      targetRecipient,
      recipientChannel,
      downloadUrl,
      year ? Number(year) : null,
      period || null,
      expiresAt,
      notes
    );

    const created = db.prepare(`SELECT * FROM shared_reports WHERE id = ?`).get(result.lastInsertRowid) as any;

    const host = url.origin || '';
    const fullShareLink = `${host}/bagikan-cetak?token=${shareToken}`;
    const fullDownloadUrl = `${host}${downloadUrl}`;

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Tautan dan berkas laporan berhasil dibuat untuk dibagikan.',
        data: {
          id: created.id,
          shareToken,
          title: created.title,
          targetRecipient: created.target_recipient,
          recipientChannel: created.recipient_channel,
          shareLink: fullShareLink,
          downloadUrl: fullDownloadUrl,
          expiresAt: created.expires_at,
          createdAt: created.created_at,
        },
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error generating report share link:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Gagal membuat tautan laporan.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

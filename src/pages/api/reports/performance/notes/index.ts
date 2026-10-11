import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../../../lib/db';

initDatabase();

// GET: Ambil daftar semua catatan laporan kinerja
export const GET: APIRoute = async ({ url }) => {
  try {
    const channel = url.searchParams.get('channel');
    const period = url.searchParams.get('period');

    let query = `
      SELECT id, report_id, title, body, channel, period, meta, created_by, created_at
      FROM performance_notes
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (channel && channel !== 'all' && channel !== 'Semua Kanal') {
      query += ` AND channel = ?`;
      params.push(channel);
    }

    if (period && period !== 'all') {
      query += ` AND period = ?`;
      params.push(period);
    }

    query += ` ORDER BY id DESC`;

    const notes = db.prepare(query).all(...params) as {
      id: number;
      report_id: number | null;
      title: string;
      body: string | null;
      channel: string | null;
      period: string | null;
      meta: string | null;
      created_by: number | null;
      created_at: string;
    }[];

    return new Response(
      JSON.stringify({
        success: true,
        count: notes.length,
        notes: notes.map(n => ({
          id: n.id,
          title: n.title,
          body: n.body || '',
          channel: n.channel || '',
          period: n.period || '',
          meta: n.meta || `${n.channel || 'Semua Kanal'} / ${n.period || '30d'}`,
          date: new Date(n.created_at).toLocaleDateString('id-ID'),
          createdAt: n.created_at,
        })),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error fetching performance notes:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Gagal memuat catatan laporan.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// POST: Simpan catatan laporan baru
export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { title, body, channel, period, meta, report_id } = data;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return new Response(
        JSON.stringify({ success: false, error: 'Judul catatan wajib diisi.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const trimmedTitle = title.trim();
    const trimmedBody = (body || '').trim();
    const ch = channel || 'Semua Kanal';
    const per = period || '30d';
    const m = meta || `${ch} / ${per}`;

    const stmt = db.prepare(`
      INSERT INTO performance_notes (report_id, title, body, channel, period, meta)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(report_id || null, trimmedTitle, trimmedBody, ch, per, m);

    const createdNote = db.prepare(`
      SELECT id, report_id, title, body, channel, period, meta, created_at
      FROM performance_notes
      WHERE id = ?
    `).get(result.lastInsertRowid) as any;

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Catatan laporan berhasil disimpan.',
        note: {
          id: createdNote.id,
          title: createdNote.title,
          body: createdNote.body || '',
          channel: createdNote.channel || '',
          period: createdNote.period || '',
          meta: createdNote.meta,
          date: new Date(createdNote.created_at).toLocaleDateString('id-ID'),
          createdAt: createdNote.created_at,
        },
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error creating performance note:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Gagal menyimpan catatan.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

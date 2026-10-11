import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../../lib/db';

initDatabase();

// GET: Ambil daftar rencana & realisasi anggaran (RAB & LRA) dengan filter
export const GET: APIRoute = async ({ url }) => {
  try {
    const search = url.searchParams.get('search');
    const category = url.searchParams.get('category');
    const owner = url.searchParams.get('owner');
    const year = url.searchParams.get('year');
    const quarter = url.searchParams.get('quarter');
    const status = url.searchParams.get('status');

    let query = `
      SELECT id, program, category, rab, lra, owner, owner_id, year, quarter, status, notes, created_at, updated_at
      FROM budget_lines
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (search && search.trim() !== '') {
      query += ` AND program LIKE ?`;
      params.push(`%${search.trim()}%`);
    }

    if (category && category !== 'Semua Kategori' && category !== 'all') {
      query += ` AND category = ?`;
      params.push(category);
    }

    if (owner && owner !== 'Semua PJ' && owner !== 'all') {
      query += ` AND owner = ?`;
      params.push(owner);
    }

    if (year && year !== 'Semua Tahun' && year !== 'all') {
      query += ` AND year = ?`;
      params.push(Number(year));
    }

    if (quarter && quarter !== 'Semua Kuartal' && quarter !== 'all') {
      query += ` AND quarter = ?`;
      params.push(quarter);
    }

    if (status && status !== 'Semua Status' && status !== 'all') {
      query += ` AND status = ?`;
      params.push(status);
    }

    query += ` ORDER BY year DESC, quarter ASC, id ASC`;

    const items = db.prepare(query).all(...params) as {
      id: number;
      program: string;
      category: string;
      rab: number;
      lra: number;
      owner: string;
      owner_id: number | null;
      year: number;
      quarter: string;
      status: 'sesuai' | 'melebihi' | 'hemat';
      notes: string | null;
      created_at: string;
      updated_at: string;
    }[];

    const totalRAB = items.reduce((s, x) => s + (x.rab || 0), 0);
    const totalLRA = items.reduce((s, x) => s + (x.lra || 0), 0);
    const totalBalance = totalRAB - totalLRA;
    const avgAbsorption = totalRAB > 0 ? Number(((totalLRA / totalRAB) * 100).toFixed(1)) : 0;

    return new Response(
      JSON.stringify({
        success: true,
        count: items.length,
        summary: {
          totalRAB,
          totalLRA,
          totalBalance,
          avgAbsorption,
        },
        items,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error fetching budget lines:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Gagal memuat data anggaran.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// POST: Tambah baris rencana anggaran (RAB) baru
export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { program, category, rab, lra, owner, year, quarter, notes } = data;

    if (!program || typeof program !== 'string' || program.trim() === '') {
      return new Response(JSON.stringify({ success: false, error: 'Nama program wajib diisi.' }), { status: 400 });
    }

    const numRab = Number(rab || 0);
    const numLra = Number(lra || 0);
    const numYear = Number(year || new Date().getFullYear());
    const strQuarter = quarter || 'Q1';
    const strCategory = category || 'Media Sosial';
    const strOwner = owner || 'Tim Media';

    // Hitung status serapan
    const pct = numRab > 0 ? (numLra / numRab) * 100 : 0;
    let statusVal = 'sesuai';
    if (pct > 100) statusVal = 'melebihi';
    else if (pct < 85) statusVal = 'hemat';

    const insertStmt = db.prepare(`
      INSERT INTO budget_lines (program, category, rab, lra, owner, year, quarter, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertStmt.run(
      program.trim(),
      strCategory,
      numRab,
      numLra,
      strOwner,
      numYear,
      strQuarter,
      statusVal,
      notes || null
    );

    const createdItem = db.prepare(`SELECT * FROM budget_lines WHERE id = ?`).get(result.lastInsertRowid) as any;

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Program anggaran berhasil ditambahkan.',
        item: createdItem,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error adding budget line:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Gagal menambahkan program anggaran.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

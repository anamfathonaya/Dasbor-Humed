import { NextRequest, NextResponse } from 'next/server';
import { db, initDatabase } from '@/lib/db';
import { supabase, isSupabaseConfigured, getServiceSupabase } from '@/lib/supabase';

initDatabase();

export const dynamic = 'force-dynamic';

/**
 * API route pencatatan dan pembacaan hasil uji ekspor
 * Path: /api/reports/export/logs
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 20, 1), 100);

    if (isSupabaseConfigured) {
      const client = getServiceSupabase();
      const { data, error } = await client
        .from('report_export_logs')
        .select('*')
        .order('id', { ascending: false })
        .limit(limit);

      if (!error && data) {
        return NextResponse.json({
          success: true,
          data,
          source: 'supabase',
        });
      }
    }

    const rows = db.prepare(`
      SELECT *
      FROM report_export_logs
      ORDER BY id DESC
      LIMIT ?
    `).all(limit);

    return NextResponse.json({
      success: true,
      data: rows,
      source: 'sqlite',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      export_type,
      format = 'csv',
      status = 'completed',
      total_rows = 0,
      duration_ms = 0,
      file_size_bytes = 0,
      download_url = null,
      split_count = 1,
      tested_by = 'admin',
      notes = null,
    } = body;

    if (!export_type) {
      return NextResponse.json({ success: false, message: 'export_type wajib diisi' }, { status: 400 });
    }

    if (isSupabaseConfigured) {
      const client = getServiceSupabase();
      const { data, error } = await client
        .from('report_export_logs')
        .insert({
          export_type,
          format,
          status,
          total_rows,
          duration_ms,
          file_size_bytes,
          download_url,
          split_count,
          tested_by,
          notes,
        })
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json({ success: true, data, source: 'supabase' });
      }
    }

    const stmt = db.prepare(`
      INSERT INTO report_export_logs (
        export_type, format, status, total_rows, duration_ms, file_size_bytes, download_url, split_count, tested_by, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const res = stmt.run(
      export_type,
      format,
      status,
      total_rows,
      duration_ms,
      file_size_bytes,
      download_url,
      split_count,
      tested_by,
      notes
    );

    const inserted = db.prepare('SELECT * FROM report_export_logs WHERE id = ?').get(res.lastInsertRowid);

    return NextResponse.json({
      success: true,
      data: inserted,
      source: 'sqlite',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

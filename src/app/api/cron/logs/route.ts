import { NextRequest, NextResponse } from 'next/server';
import { db, initDatabase } from '@/lib/db';
import { supabase, isSupabaseConfigured, getServiceSupabase } from '@/lib/supabase';

initDatabase();

export const dynamic = 'force-dynamic';

/**
 * Endpoint daftar hasil jalan tugas terjadwal / cron execution logs
 * Path: /api/cron/logs
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 50, 1), 100);
    const serviceKey = searchParams.get('service_key');

    if (isSupabaseConfigured) {
      const client = getServiceSupabase();
      let query = client
        .from('integration_sync_jobs')
        .select('*')
        .order('id', { ascending: false })
        .limit(limit);

      if (serviceKey) {
        query = query.eq('service_key', serviceKey);
      }

      const { data, error } = await query;
      if (!error && data) {
        return NextResponse.json({
          success: true,
          data,
          total: data.length,
          source: 'supabase',
        });
      }
    }

    // Fallback SQLite
    let sql = `
      SELECT *
      FROM integration_sync_jobs
    `;
    const params: any[] = [];

    if (serviceKey) {
      sql += ` WHERE service_key = ?`;
      params.push(serviceKey);
    }

    sql += ` ORDER BY id DESC LIMIT ?`;
    params.push(limit);

    const rows = db.prepare(sql).all(...params);

    return NextResponse.json({
      success: true,
      data: rows,
      total: rows.length,
      source: 'sqlite',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal memuat log hasil jalan tugas terjadwal',
      },
      { status: 500 }
    );
  }
}

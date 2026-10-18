import { NextRequest, NextResponse } from 'next/server';
import { supabase, getServiceSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { db, initDatabase } from '@/lib/db';

initDatabase();

export const dynamic = 'force-dynamic';

/**
 * Route penyajian foto avatar aman (Safe Avatar Proxy / Signed Delivery)
 * Path: /api/user/avatar/[filename]
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;

    if (!filename || filename.includes('..') || filename.includes('/')) {
      return NextResponse.json({ error: 'Nama berkas tidak valid' }, { status: 400 });
    }

    if (isSupabaseConfigured) {
      const client = getServiceSupabase();
      const storagePath = `user-avatars/${filename}`;

      // Ambil berkas dari Supabase Storage
      const { data, error } = await client.storage
        .from('avatars')
        .download(storagePath);

      if (!error && data) {
        const arrayBuffer = await data.arrayBuffer();
        const contentType = data.type || 'image/jpeg';

        return new NextResponse(arrayBuffer, {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
            'X-Content-Type-Options': 'nosniff',
          },
        });
      }
    }

    // Jika tidak ditemukan di Supabase Storage, cek apakah ada di SQLite atau sajikan fallback SVG
    const svgFallback = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
      <rect width="96" height="96" rx="48" fill="#2563eb"/>
      <text x="50%" y="54%" font-family="sans-serif" font-size="34" font-weight="bold" fill="#ffffff" dominant-baseline="middle" text-anchor="middle">
        ${filename.charAt(0).toUpperCase()}
      </text>
    </svg>`;

    return new NextResponse(svgFallback, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

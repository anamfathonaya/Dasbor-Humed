import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured, getServiceSupabase } from '@/lib/supabase';
import { db, initDatabase } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/dasbor';
  const role = searchParams.get('role') || 'head';

  console.log('[auth/callback] Handling OAuth callback code:', code ? 'present' : 'none');

  if (code && isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error && data.session) {
        const userRole = (data.user.user_metadata?.role as string) || role;

        // Catat ke audit log
        try {
          const admin = getServiceSupabase();
          await admin.from('audit_logs').insert({
            user_id: null,
            user_name: data.user.email || 'Pengguna Google OAuth',
            user_role: userRole,
            action: 'Otorisasi Google OAuth Callback Sukses',
            target: 'Supabase Auth & Session Provider',
            ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1',
            status: 'success',
            details: `Sesi login Google SSO diterbitkan untuk ${data.user.email}`
          });
        } catch {}

        const response = NextResponse.redirect(`${origin}${next}`);
        response.cookies.set('user_role', userRole, {
          path: '/',
          maxAge: 2592000,
          sameSite: 'lax'
        });
        return response;
      }
    } catch (err: any) {
      console.warn('[auth/callback] Supabase exchange error:', err.message);
    }
  }

  // Fallback simulasi OAuth callback saat Supabase offline / testing
  initDatabase();
  try {
    db.prepare(`
      INSERT INTO audit_logs (user_name, user_role, action, target, ip_address, status, details)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      'humas.pedulinegeri@gmail.com',
      role,
      'Otorisasi Google OAuth Callback',
      'Akun Google (Google AI Pro)',
      request.headers.get('x-forwarded-for') || '127.0.0.1',
      'success',
      'Sesi Google SSO aktif'
    );
  } catch {}

  const response = NextResponse.redirect(`${origin}${next}`);
  response.cookies.set('user_role', role, {
    path: '/',
    maxAge: 2592000,
    sameSite: 'lax'
  });

  return response;
}

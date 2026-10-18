import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'placeholder-anon-key'
);

/**
 * Supabase Browser/Client Client
 * Digunakan pada komponen client untuk Auth, Storage publik, dan kueri RLS sisi pengguna.
 */
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Supabase Server Client (Scoped / Anon / User Token)
 * Digunakan pada Server Components dan Route Handlers dengan token sesi pengguna aktif
 * untuk menghormati pembatasan Row-Level Security (RLS).
 */
export function createServerClient(accessToken?: string): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : undefined,
  });
}

/**
 * Supabase Admin / Service Role Client (Bypasses RLS)
 * Digunakan secara eksklusif di server-side untuk:
 * 1. Skrip migrasi dan sinkronisasi data awal
 * 2. Background worker & cron (newsScheduler, reminderService)
 * 3. Operasi administratif sistem & audit logging
 * PERINGATAN: Jangan pernah membocorkan klien ini ke browser / client component.
 */
export function getServiceSupabase(): SupabaseClient {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Helper verifikasi konektivitas / kesehatan Supabase
 */
export async function checkSupabaseHealth(): Promise<{
  configured: boolean;
  status: 'ok' | 'unconfigured' | 'error';
  url: string;
  error?: string;
}> {
  if (!isSupabaseConfigured) {
    return {
      configured: false,
      status: 'unconfigured',
      url: supabaseUrl,
    };
  }

  try {
    const client = getServiceSupabase();
    const { error } = await client.from('users').select('count', { count: 'exact', head: true });
    if (error && error.code !== 'PGRST116') {
      return {
        configured: true,
        status: 'error',
        url: supabaseUrl,
        error: error.message,
      };
    }
    return {
      configured: true,
      status: 'ok',
      url: supabaseUrl,
    };
  } catch (err: any) {
    return {
      configured: true,
      status: 'error',
      url: supabaseUrl,
      error: err.message,
    };
  }
}

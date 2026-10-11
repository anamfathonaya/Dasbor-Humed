import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../../lib/db';
import { getUserRole } from '../../../../lib/auth';
import { checkDamNasHealth } from '../../../../lib/damHealthService';

initDatabase();

// GET: Jalankan healthcheck DAM NAS dan kembalikan laporan diagnostik
export const GET: APIRoute = async ({ request, url }) => {
  try {
    const role = getUserRole(request, url);
    const hostParam = url.searchParams.get('host') || undefined;

    const health = await checkDamNasHealth(hostParam);

    return new Response(
      JSON.stringify({
        success: health.isReachable,
        health
      }),
      {
        status: health.isReachable ? 200 : 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: 'Gagal menjalankan healthcheck DAM.', error: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

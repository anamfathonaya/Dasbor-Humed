import type { APIRoute } from 'astro';
import { syncTelegramSources } from '../../../../lib/telegramFetcher';
import { initDatabase } from '../../../../lib/db';

initDatabase();

// POST: Memicu sinkronisasi penarikan siaran kanal Telegram dari akun monitoring bersama
export const POST: APIRoute = async ({ request }) => {
  try {
    let sourceId: number | undefined;
    try {
      const body = await request.json();
      if (body && body.sourceId) {
        sourceId = Number(body.sourceId);
      }
    } catch {}

    const results = await syncTelegramSources(sourceId);

    return new Response(JSON.stringify({
      success: true,
      message: 'Sinkronisasi kabar kanal Telegram berhasil dijalankan via akun monitoring bersama (@ngo_media_monitor)',
      data: results,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

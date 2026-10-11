import type { APIRoute } from 'astro';
import { syncNewsSources } from '../../../../lib/newsFetcher';
import { initDatabase } from '../../../../lib/db';

initDatabase();

// POST: Memicu sinkronisasi manual penarikan berita dari RSS dan Google News
export const POST: APIRoute = async ({ request }) => {
  try {
    let sourceId: number | undefined;
    try {
      const body = await request.json();
      if (body && body.sourceId) {
        sourceId = Number(body.sourceId);
      }
    } catch {}

    const syncResults = await syncNewsSources(sourceId);

    return new Response(JSON.stringify({
      success: true,
      message: 'Sinkronisasi RSS & Google News berhasil dijalankan',
      data: syncResults,
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

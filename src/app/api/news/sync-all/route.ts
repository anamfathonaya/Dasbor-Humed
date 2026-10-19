import { NextRequest, NextResponse } from 'next/server';
import { syncNewsSources } from '@/lib/newsFetcher';
import { syncTelegramSources } from '@/lib/telegramFetcher';

/**
 * POST /api/news/sync-all
 * Trigger manual sync of all active RSS and Telegram news sources
 */
export async function POST(req: NextRequest) {
  try {
    // Sync RSS and Google News sources
    const rssResults = await syncNewsSources();

    // Sync Telegram channels
    const telegramResults = await syncTelegramSources();

    const totalInserted = [
      ...rssResults.map(r => r.inserted),
      ...telegramResults.map(r => r.inserted)
    ].reduce((sum, n) => sum + n, 0);

    const totalFetched = [
      ...rssResults.map(r => r.totalFetched),
      ...telegramResults.map(r => r.total)
    ].reduce((sum, n) => sum + n, 0);

    return NextResponse.json({
      ok: true,
      message: 'Sync completed',
      stats: {
        totalInserted,
        totalFetched,
        rssSources: rssResults.length,
        telegramSources: telegramResults.length,
      },
      details: {
        rss: rssResults,
        telegram: telegramResults,
      },
    });
  } catch (error: any) {
    console.error('News sync error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Sync failed' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/news/sync-all
 * Get sync status
 */
export async function GET(req: NextRequest) {
  return NextResponse.json({
    ok: true,
    endpoint: '/api/news/sync-all',
    method: 'POST',
    description: 'Trigger manual sync of all active news sources',
  });
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/news/items
 * Fetch news items with optional filters
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sourceType = searchParams.get('sourceType') || 'all';
    const category = searchParams.get('category') || 'all';
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const isImportant = searchParams.get('isImportant');

    let query = `
      SELECT
        id,
        source_id,
        title,
        source_type,
        source_name,
        url,
        published_at,
        summary,
        category,
        is_important,
        is_read,
        channel_handle,
        created_at
      FROM news_items
      WHERE 1=1
    `;

    const params: any[] = [];

    if (sourceType !== 'all') {
      query += ` AND source_type = ?`;
      params.push(sourceType);
    }

    if (category !== 'all') {
      query += ` AND category = ?`;
      params.push(category);
    }

    if (isImportant === 'true') {
      query += ` AND is_important = 1`;
    }

    query += ` ORDER BY published_at DESC LIMIT ?`;
    params.push(limit);

    const stmt = db.prepare(query);
    const items = stmt.all(...params) as any[];

    // Format dates for display
    const formatted = items.map(item => ({
      ...item,
      publishedAt: formatDateForDisplay(item.published_at),
      isImportant: item.is_important === 1,
      isRead: item.is_read === 1,
    }));

    return NextResponse.json({
      ok: true,
      items: formatted,
      count: formatted.length,
    });
  } catch (error: any) {
    console.error('Failed to fetch news items:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to fetch news items' },
      { status: 500 }
    );
  }
}

/**
 * Format database timestamp for Indonesian display
 */
function formatDateForDisplay(dbTimestamp: string): string {
  try {
    const date = new Date(dbTimestamp.replace(' ', 'T') + 'Z');
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;

    // Format as Indonesian date: "19 Okt, 14:30"
    const day = date.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
    const month = months[date.getMonth()];
    const hours = date.getHours().toString().padStart(2, '0');
    const mins = date.getMinutes().toString().padStart(2, '0');

    return `${day} ${month}, ${hours}:${mins}`;
  } catch {
    return dbTimestamp;
  }
}

/**
 * POST /api/news/items
 * Mark items as read or bookmark them
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { itemId, action } = body;

    if (!itemId || !action) {
      return NextResponse.json(
        { ok: false, error: 'itemId and action are required' },
        { status: 400 }
      );
    }

    if (action === 'mark_read') {
      const stmt = db.prepare('UPDATE news_items SET is_read = 1 WHERE id = ?');
      stmt.run(itemId);
    } else if (action === 'mark_unread') {
      const stmt = db.prepare('UPDATE news_items SET is_read = 0 WHERE id = ?');
      stmt.run(itemId);
    } else {
      return NextResponse.json(
        { ok: false, error: 'Invalid action' },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Failed to update news item:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to update item' },
      { status: 500 }
    );
  }
}

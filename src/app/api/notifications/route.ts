// ==============================================================================
// GET /api/notifications — list notifikasi
// POST /api/notifications — manual create (untuk testing atau manual trigger)
// PATCH /api/notifications — mark read/unread
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  createAndDispatchNotification,
  NotificationCategory,
  NotificationSeverity,
} from '@/lib/notificationService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userIdParam = searchParams.get('userId');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const category = searchParams.get('category') as NotificationCategory | null;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const userId = userIdParam ? parseInt(userIdParam, 10) : undefined;

    const result = listNotifications({
      userId,
      unreadOnly,
      category: category || undefined,
      limit,
      offset,
    });

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (err: any) {
    console.error('[GET /api/notifications]', err);
    return NextResponse.json(
      { ok: false, error: err.message || 'Internal error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { category, severity, title, message, source, metadata, channels, userId } = body;

    if (!category || !severity || !title || !message) {
      return NextResponse.json(
        { ok: false, error: 'category, severity, title, message wajib diisi' },
        { status: 400 }
      );
    }

    const record = await createAndDispatchNotification({
      category: category as NotificationCategory,
      severity: severity as NotificationSeverity,
      title,
      message,
      source,
      metadata,
      channels,
      userId,
    });

    return NextResponse.json({ ok: true, notification: record });
  } catch (err: any) {
    console.error('[POST /api/notifications]', err);
    return NextResponse.json(
      { ok: false, error: err.message || 'Internal error' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, markAll, read, userId } = body;

    if (markAll) {
      const updated = markAllNotificationsRead(userId);
      return NextResponse.json({ ok: true, updated });
    }

    if (id) {
      markNotificationRead(id, read !== false);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json(
      { ok: false, error: 'id atau markAll wajib diisi' },
      { status: 400 }
    );
  } catch (err: any) {
    console.error('[PATCH /api/notifications]', err);
    return NextResponse.json(
      { ok: false, error: err.message || 'Internal error' },
      { status: 500 }
    );
  }
}

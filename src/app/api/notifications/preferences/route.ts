// ==============================================================================
// GET /api/notifications/preferences — list preferences
// PUT /api/notifications/preferences — upsert preference
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getPreferences, upsertPreference, NotificationChannel, NotificationCategory, NotificationSeverity } from '@/lib/notificationService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userIdParam = searchParams.get('userId');
    const userId = userIdParam ? parseInt(userIdParam, 10) : undefined;

    const prefs = getPreferences(userId);
    return NextResponse.json({ ok: true, preferences: prefs });
  } catch (err: any) {
    console.error('[GET /api/notifications/preferences]', err);
    return NextResponse.json(
      { ok: false, error: err.message || 'Internal error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, channel, category, enabled, minSeverity, telegramChatId, emailAddress } = body;

    if (!channel) {
      return NextResponse.json(
        { ok: false, error: 'channel wajib diisi' },
        { status: 400 }
      );
    }

    const pref = upsertPreference({
      userId: userId ?? null,
      channel: channel as NotificationChannel,
      category: (category as NotificationCategory) || 'all',
      enabled: enabled !== false,
      minSeverity: minSeverity as NotificationSeverity,
      telegramChatId,
      emailAddress,
    });

    return NextResponse.json({ ok: true, preference: pref });
  } catch (err: any) {
    console.error('[PUT /api/notifications/preferences]', err);
    return NextResponse.json(
      { ok: false, error: err.message || 'Internal error' },
      { status: 500 }
    );
  }
}

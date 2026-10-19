// ==============================================================================
// POST /api/notifications/test — kirim test notification (verifikasi Telegram setup)
// Body: { category?, severity?, title?, message?, chatId? }
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramMessage, testTelegramBotConnection } from '@/lib/telegramBotService';
import { createAndDispatchNotification } from '@/lib/notificationService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      category = 'system',
      severity = 'info',
      title = 'Test Alert dari Dasbor Humed',
      message = 'Ini pesan percobaan. Jika Anda menerima ini, integrasi Telegram berhasil ✅',
      chatId,
    } = body;

    // 1. Test bot connection dulu
    const botCheck = await testTelegramBotConnection();
    if (!botCheck.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: `Telegram bot tidak terkonfigurasi: ${botCheck.error}`,
          step: 'test_connection',
        },
        { status: 400 }
      );
    }

    // 2. Kirim via service (yang handle preferences & logging)
    const record = await createAndDispatchNotification({
      category: category as any,
      severity: severity as any,
      title,
      message,
      source: 'manual_test',
      metadata: { chatId, botUsername: botCheck.botUsername },
    });

    // 3. Optional: kirim raw ke chatId kustom jika diisi
    if (chatId) {
      const directResult = await sendTelegramMessage(chatId, `*${title}*\n\n${message}\n\n_Bot: ${botCheck.botUsername}_`);
      return NextResponse.json({
        ok: true,
        botUsername: botCheck.botUsername,
        notification: record,
        directSend: directResult,
      });
    }

    return NextResponse.json({
      ok: true,
      botUsername: botCheck.botUsername,
      notification: record,
    });
  } catch (err: any) {
    console.error('[POST /api/notifications/test]', err);
    return NextResponse.json(
      { ok: false, error: err.message || 'Internal error' },
      { status: 500 }
    );
  }
}

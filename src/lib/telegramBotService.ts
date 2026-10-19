// ==============================================================================
// Telegram Bot Service — kirim pesan alert via Bot API (https://core.telegram.org/bots/api)
// ==============================================================================
// Konsep:
//   - Bot dibuat via @BotFather → dapat token (1234567890:ABCdef...)
//   - User start chat dengan bot, lalu kita ambil chat_id
//   - Untuk grup: tambahkan bot ke grup, lalu ambil chat_id (negatif, mulai -100...)
//   - API call: POST https://api.telegram.org/bot<TOKEN>/sendMessage
// Env:
//   - TELEGRAM_BOT_TOKEN: token bot
//   - TELEGRAM_CHAT_ID (opsional, untuk default alert channel)
// ==============================================================================

const TELEGRAM_API_BASE = 'https://api.telegram.org';

export interface TelegramSendResult {
  ok: boolean;
  messageId?: number;
  error?: string;
}

/**
 * Kirim pesan text ke chat tertentu via Bot API.
 * Mendukung Markdown formatting dan emoji.
 */
export async function sendTelegramMessage(
  chatId: string | number,
  text: string,
  options: { parseMode?: 'Markdown' | 'MarkdownV2' | 'HTML'; disableWebPagePreview?: boolean } = {}
): Promise<TelegramSendResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || token.includes('your_') || token.includes('xxxxx')) {
    return { ok: false, error: 'TELEGRAM_BOT_TOKEN belum dikonfigurasi' };
  }

  try {
    const url = `${TELEGRAM_API_BASE}/bot${token}/sendMessage`;
    const body = {
      chat_id: chatId,
      text,
      parse_mode: options.parseMode || 'Markdown',
      disable_web_page_preview: options.disableWebPagePreview ?? true,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data: any = await response.json();
    if (!data.ok) {
      return { ok: false, error: data.description || 'Telegram API error' };
    }

    return { ok: true, messageId: data.result?.message_id };
  } catch (err: any) {
    return { ok: false, error: err.message || 'Network error' };
  }
}

/**
 * Test koneksi bot. Memanggil getMe untuk verifikasi token valid.
 */
export async function testTelegramBotConnection(): Promise<{ ok: boolean; botUsername?: string; error?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || token.includes('your_') || token.includes('xxxxx')) {
    return { ok: false, error: 'TELEGRAM_BOT_TOKEN belum dikonfigurasi' };
  }

  try {
    const response = await fetch(`${TELEGRAM_API_BASE}/bot${token}/getMe`);
    const data: any = await response.json();
    if (!data.ok) {
      return { ok: false, error: data.description };
    }
    return { ok: true, botUsername: data.result?.username };
  } catch (err: any) {
    return { ok: false, error: err.message || 'Network error' };
  }
}

/**
 * Format pesan alert infrastruktur agar mudah dibaca di Telegram.
 * Pakai emoji status (🔴/🟡/🟢) dan Markdown bold.
 */
export function formatInfraAlert(alert: {
  severity: 'critical' | 'warning' | 'info';
  title: string;
  resource: string;
  metric: string;
  currentValue: string;
  threshold: string;
  dashboardUrl?: string;
}): string {
  const emoji = alert.severity === 'critical' ? '🔴' : alert.severity === 'warning' ? '🟡' : '🟢';
  const lines = [
    `${emoji} *${alert.title}*`,
    ``,
    `*Resource:* ${alert.resource}`,
    `*Metric:* ${alert.metric}`,
    `*Current:* \`${alert.currentValue}\``,
    `*Threshold:* ${alert.threshold}`,
  ];

  if (alert.dashboardUrl) {
    lines.push(``, `[📊 Buka Dasbor](${alert.dashboardUrl})`);
  }

  return lines.join('\n');
}

/**
 * Format pesan token expiry alert.
 */
export function formatTokenExpiryAlert(alert: {
  platform: string;
  accountName: string;
  daysRemaining: number;
  expiresAt: string;
  reconnectUrl?: string;
}): string {
  const emoji = alert.daysRemaining <= 3 ? '🔴' : '🟡';
  const lines = [
    `${emoji} *Token ${alert.platform} akan kedaluwarsa*`,
    ``,
    `*Akun:* ${alert.accountName}`,
    `*Sisa waktu:* ${alert.daysRemaining} hari`,
    `*Kedaluwarsa:* ${alert.expiresAt}`,
  ];

  if (alert.reconnectUrl) {
    lines.push(``, `[🔗 Hubungkan ulang](${alert.reconnectUrl})`);
  }

  return lines.join('\n');
}

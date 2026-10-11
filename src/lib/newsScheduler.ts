import { syncNewsSources } from './newsFetcher';
import { syncTelegramSources } from './telegramFetcher';
import { db } from './db';

let schedulerIntervalId: NodeJS.Timeout | null = null;
let isJobRunning = false;
let lastExecutedAt: string | null = null;
let lastSyncReport: any = null;

export async function runAutoSyncCycle() {
  if (isJobRunning) {
    return { skipped: true, reason: 'Sync cycle already in progress', lastExecutedAt };
  }

  isJobRunning = true;
  const startedAt = new Date().toISOString();

  try {
    // 1. Tarik berita RSS & Google News
    const rssResults = await syncNewsSources();

    // 2. Tarik kabar saluran Telegram
    const telegramResults = await syncTelegramSources();

    lastExecutedAt = startedAt;
    lastSyncReport = {
      startedAt,
      completedAt: new Date().toISOString(),
      rss: rssResults,
      telegram: telegramResults,
    };

    return {
      success: true,
      lastExecutedAt,
      report: lastSyncReport,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      lastExecutedAt,
    };
  } finally {
    isJobRunning = false;
  }
}

/**
 * Memulai penjadwal pembaruan otomatis berkala (default interval: 15 menit)
 */
export function startNewsAutoScheduler(intervalMinutes: number = 15) {
  if (schedulerIntervalId) {
    return { message: 'Penjadwal pembaruan otomatis sudah aktif', intervalMinutes };
  }

  const ms = intervalMinutes * 60 * 1000;
  schedulerIntervalId = setInterval(() => {
    runAutoSyncCycle().catch(() => {});
  }, ms);

  // Jangan blok event loop Node.js jika proses selesai
  if (schedulerIntervalId.unref) {
    schedulerIntervalId.unref();
  }

  return { message: 'Penjadwal pembaruan otomatis berhasil dimulai', intervalMinutes };
}

/**
 * Hentikan penjadwal otomatis
 */
export function stopNewsAutoScheduler() {
  if (schedulerIntervalId) {
    clearInterval(schedulerIntervalId);
    schedulerIntervalId = null;
    return { message: 'Penjadwal pembaruan otomatis berhasil dihentikan' };
  }
  return { message: 'Penjadwal tidak sedang aktif' };
}

/**
 * Status penjadwal saat ini
 */
export function getNewsSchedulerStatus() {
  return {
    isRunning: schedulerIntervalId !== null,
    isSyncingNow: isJobRunning,
    lastExecutedAt,
    lastReport: lastSyncReport,
  };
}

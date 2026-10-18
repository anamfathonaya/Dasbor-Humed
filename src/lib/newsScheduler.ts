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

    const totalItems = (rssResults?.reduce((acc: number, curr: any) => acc + (curr.inserted || 0), 0) || 0) +
      (telegramResults?.reduce((acc: number, curr: any) => acc + (curr.inserted || 0), 0) || 0);

    // Catat log hasil jalan jadwal ke database
    try {
      db.prepare(`
        INSERT INTO integration_sync_jobs (service_key, target_object, status, items_processed, details, triggered_by, finished_at)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).run(
        'cron_news_sync',
        'Pusat Pantauan Berita & Telegram',
        'success',
        totalItems,
        `Sinkronisasi otomatis berhasil: ${totalItems} berita & pesan baru terproses.`,
        'cron_scheduler'
      );
    } catch (dbErr) {
      console.warn('[newsScheduler] Gagal mencatat log ke SQLite:', dbErr);
    }

    lastExecutedAt = startedAt;
    lastSyncReport = {
      startedAt,
      completedAt: new Date().toISOString(),
      rss: rssResults,
      telegram: telegramResults,
      totalItems,
    };

    return {
      success: true,
      lastExecutedAt,
      report: lastSyncReport,
    };
  } catch (error: any) {
    try {
      db.prepare(`
        INSERT INTO integration_sync_jobs (service_key, target_object, status, items_processed, details, triggered_by, finished_at)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).run(
        'cron_news_sync',
        'Pusat Pantauan Berita & Telegram',
        'failed',
        0,
        `Gagal sinkronisasi berita: ${error.message}`,
        'cron_scheduler'
      );
    } catch {}

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
 * Penjadwal interval memori lokal dinonaktifkan (deprecate) karena arsitektur beralih ke Vercel Cron
 */
export function startNewsAutoScheduler(intervalMinutes: number = 15) {
  return {
    message: 'Penjadwal in-process lokal telah digantikan oleh Vercel Cron (/api/cron/news-sync)',
    intervalMinutes,
    isVercelCron: true,
  };
}

/**
 * Hentikan penjadwal otomatis
 */
export function stopNewsAutoScheduler() {
  if (schedulerIntervalId) {
    clearInterval(schedulerIntervalId);
    schedulerIntervalId = null;
  }
  return {
    message: 'Penjadwal lama in-process dihentikan. Jadwal terkelola lewat vercel.json.',
    isVercelCron: true,
  };
}

/**
 * Status penjadwal saat ini
 */
export function getNewsSchedulerStatus() {
  return {
    isRunning: true,
    engine: 'vercel_cron',
    isSyncingNow: isJobRunning,
    lastExecutedAt,
    lastReport: lastSyncReport,
  };
}

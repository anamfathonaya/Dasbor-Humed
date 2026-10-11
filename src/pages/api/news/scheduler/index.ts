import type { APIRoute } from 'astro';
import { runAutoSyncCycle, startNewsAutoScheduler, stopNewsAutoScheduler, getNewsSchedulerStatus } from '../../../../lib/newsScheduler';
import { initDatabase } from '../../../../lib/db';

initDatabase();

// GET: Cek status penjadwal otomatis aliran berita
export const GET: APIRoute = async () => {
  try {
    const status = getNewsSchedulerStatus();
    return new Response(JSON.stringify({ success: true, data: status }), {
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

// POST: Jalankan siklus pembaruan aliran berita terjadwal sekarang, atau ubah status penjadwal
export const POST: APIRoute = async ({ request }) => {
  try {
    let action = 'run';
    let interval = 15;

    try {
      const body = await request.json();
      if (body.action) action = body.action;
      if (body.interval) interval = Number(body.interval);
    } catch {}

    if (action === 'start') {
      const result = startNewsAutoScheduler(interval);
      return new Response(JSON.stringify({ success: true, ...result }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'stop') {
      const result = stopNewsAutoScheduler();
      return new Response(JSON.stringify({ success: true, ...result }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Default: 'run' siklus pembaruan otomatis sekarang
    const cycleResult = await runAutoSyncCycle();
    return new Response(JSON.stringify({
      success: true,
      message: 'Siklus penjadwal pembaruan otomatis aliran berita berhasil dijalankan',
      result: cycleResult,
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

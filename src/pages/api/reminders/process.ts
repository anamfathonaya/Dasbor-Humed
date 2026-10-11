import type { APIRoute } from 'astro';
import { processScheduledReminders, getDueReminders } from '../../../lib/reminderService';

// GET: Cek berapa pengingat yang jatuh tempo sekarang
export const GET: APIRoute = async () => {
  try {
    const due = getDueReminders();
    return new Response(JSON.stringify({ success: true, count: due.length, data: due }), {
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

// POST: Jalankan proses pengiriman notifikasi pengingat jatuh tempo
export const POST: APIRoute = async () => {
  try {
    const result = processScheduledReminders();
    return new Response(JSON.stringify({ success: true, ...result }), {
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

import type { APIRoute } from 'astro';
import { seedSampleMetrics } from '../../../lib/seedMetrics';

// POST: Picu pengisian seed data metrik contoh (opsional: ?reset=true)
export const POST: APIRoute = async ({ url }) => {
  try {
    const forceReset = url.searchParams.get('reset') === 'true';
    const result = seedSampleMetrics(forceReset);

    return new Response(JSON.stringify({
      success: true,
      ...result,
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

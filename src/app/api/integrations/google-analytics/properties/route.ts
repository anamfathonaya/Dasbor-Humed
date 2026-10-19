import { NextRequest, NextResponse } from 'next/server';
import { getGA4Properties, getGA4AggregatedMetrics } from '@/lib/googleAnalyticsService';
import { initDatabase } from '@/lib/db';

initDatabase();

export const dynamic = 'force-dynamic';

/**
 * Get all connected GA4 properties with optional aggregated metrics
 * GET /api/integrations/google-analytics/properties?includeMetrics=true
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeMetrics = searchParams.get('includeMetrics') === 'true';

    const properties = await getGA4Properties();

    if (!includeMetrics) {
      return NextResponse.json({
        ok: true,
        properties,
      });
    }

    // Include aggregated metrics for each property
    const propertiesWithMetrics = await Promise.all(
      properties.map(async (property) => {
        try {
          const metrics = await getGA4AggregatedMetrics(property.id, 30);
          return {
            ...property,
            metrics,
          };
        } catch (error: any) {
          return {
            ...property,
            metrics: null,
            metricsError: error.message,
          };
        }
      })
    );

    return NextResponse.json({
      ok: true,
      properties: propertiesWithMetrics,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

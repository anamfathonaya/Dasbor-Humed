import { NextRequest, NextResponse } from 'next/server';
import {
  getGA4Properties,
  getGA4Credentials,
  syncGA4Metrics,
} from '@/lib/googleAnalyticsService';
import { initDatabase } from '@/lib/db';
import { recordAuditLog } from '@/lib/auditService';

initDatabase();

export const dynamic = 'force-dynamic';

/**
 * Sync GA4 metrics for all connected properties
 * POST /api/integrations/google-analytics/sync
 */
export async function POST(req: NextRequest) {
  try {
    const properties = await getGA4Properties();

    if (properties.length === 0) {
      return NextResponse.json({
        ok: false,
        message: 'No GA4 properties connected',
      });
    }

    const results = [];

    for (const property of properties) {
      if (!property.syncEnabled || property.oauthStatus !== 'connected') {
        results.push({
          propertyName: property.propertyName,
          skipped: true,
          reason: 'Sync disabled or not connected',
        });
        continue;
      }

      try {
        const credentials = await getGA4Credentials(property.id);

        if (!credentials) {
          results.push({
            propertyName: property.propertyName,
            success: false,
            error: 'No credentials found',
          });
          continue;
        }

        // Check if token is expired
        const expiresAt = new Date(credentials.expiresAt);
        const now = new Date();

        if (expiresAt <= now) {
          results.push({
            propertyName: property.propertyName,
            success: false,
            error: 'Token expired - please reconnect',
          });
          continue;
        }

        // Sync metrics (last 30 days)
        const savedCount = await syncGA4Metrics(
          property.id,
          property.propertyId,
          credentials.accessToken,
          30
        );

        results.push({
          propertyName: property.propertyName,
          success: true,
          metricsSynced: savedCount,
        });

        // Record audit log
        recordAuditLog({
          userName: 'System',
          userRole: 'system',
          action: 'GA4_METRICS_SYNCED',
          target: property.propertyName,
          status: 'success',
          details: `Synced ${savedCount} daily metrics`,
        });
      } catch (error: any) {
        results.push({
          propertyName: property.propertyName,
          success: false,
          error: error.message,
        });

        recordAuditLog({
          userName: 'System',
          userRole: 'system',
          action: 'GA4_METRICS_SYNC_FAILED',
          target: property.propertyName,
          status: 'failed',
          details: error.message,
        });
      }
    }

    return NextResponse.json({
      ok: true,
      results,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

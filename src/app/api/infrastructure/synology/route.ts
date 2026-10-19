import { NextRequest, NextResponse } from 'next/server';
import {
  getDefaultSynologyNAS,
  fetchSynologyMetrics,
  fetchSynologyBackupJobs,
  fetchSynologyUserAccess,
  testSynologyConnection,
} from '@/lib/synologyMonitoringService';

/**
 * GET /api/infrastructure/synology
 * Get Synology NAS metrics
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action'); // 'metrics', 'backups', 'users', 'test'
    const nasId = searchParams.get('nasId');

    const nasList = getDefaultSynologyNAS();

    if (action === 'test' && nasId) {
      const nas = nasList.find(n => n.id === nasId);
      if (!nas) {
        return NextResponse.json(
          { ok: false, error: 'NAS not found' },
          { status: 404 }
        );
      }

      const result = await testSynologyConnection(nas);
      return NextResponse.json({ ok: true, ...result });
    }

    if (action === 'backups' && nasId) {
      const nas = nasList.find(n => n.id === nasId);
      if (!nas) {
        return NextResponse.json(
          { ok: false, error: 'NAS not found' },
          { status: 404 }
        );
      }

      const backups = await fetchSynologyBackupJobs(nas);
      return NextResponse.json({ ok: true, nasId, backups });
    }

    if (action === 'users' && nasId) {
      const nas = nasList.find(n => n.id === nasId);
      if (!nas) {
        return NextResponse.json(
          { ok: false, error: 'NAS not found' },
          { status: 404 }
        );
      }

      const users = await fetchSynologyUserAccess(nas);
      return NextResponse.json({ ok: true, nasId, users });
    }

    // Default: fetch metrics for all monitored NAS
    const metricsPromises = nasList
      .filter(n => n.monitored)
      .map(nas => fetchSynologyMetrics(nas));

    const metrics = await Promise.all(metricsPromises);

    return NextResponse.json({
      ok: true,
      nasList: nasList.filter(n => n.monitored),
      metrics,
      count: metrics.length,
    });
  } catch (error: any) {
    console.error('Synology monitoring error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to fetch Synology metrics' },
      { status: 500 }
    );
  }
}

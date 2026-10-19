import { NextRequest, NextResponse } from 'next/server';
import {
  getDefaultVpsServers,
  fetchVpsMetrics,
  checkVpsUpdates,
  testVpsConnection,
} from '@/lib/vpsMonitoringService';

/**
 * GET /api/infrastructure/vps
 * Get VPS metrics for all monitored servers
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action'); // 'metrics', 'updates', 'test'
    const serverId = searchParams.get('serverId');

    const servers = getDefaultVpsServers();

    if (action === 'test' && serverId) {
      const server = servers.find(s => s.id === serverId);
      if (!server) {
        return NextResponse.json(
          { ok: false, error: 'Server not found' },
          { status: 404 }
        );
      }

      const result = await testVpsConnection(server);
      return NextResponse.json({ ok: true, ...result });
    }

    if (action === 'updates' && serverId) {
      const server = servers.find(s => s.id === serverId);
      if (!server) {
        return NextResponse.json(
          { ok: false, error: 'Server not found' },
          { status: 404 }
        );
      }

      const updates = await checkVpsUpdates(server);
      return NextResponse.json({ ok: true, serverId, ...updates });
    }

    // Default: fetch metrics for all monitored servers
    const metricsPromises = servers
      .filter(s => s.monitored)
      .map(server => fetchVpsMetrics(server));

    const metrics = await Promise.all(metricsPromises);

    return NextResponse.json({
      ok: true,
      servers: servers.filter(s => s.monitored),
      metrics,
      count: metrics.length,
    });
  } catch (error: any) {
    console.error('VPS monitoring error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to fetch VPS metrics' },
      { status: 500 }
    );
  }
}

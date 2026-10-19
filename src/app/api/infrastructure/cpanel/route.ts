import { NextRequest, NextResponse } from 'next/server';
import {
  getDefaultCpanelServers,
  fetchCpanelMetrics,
  checkCpanelSSLExpiry,
  fetchCpanelEmailAccounts,
  testCpanelConnection,
} from '@/lib/cpanelMonitoringService';

/**
 * GET /api/infrastructure/cpanel
 * Get cPanel hosting metrics
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action'); // 'metrics', 'ssl', 'email', 'test'
    const serverId = searchParams.get('serverId');

    const servers = getDefaultCpanelServers();

    if (action === 'test' && serverId) {
      const server = servers.find(s => s.id === serverId);
      if (!server) {
        return NextResponse.json(
          { ok: false, error: 'Server not found' },
          { status: 404 }
        );
      }

      const result = await testCpanelConnection(server);
      return NextResponse.json({ ok: true, ...result });
    }

    if (action === 'ssl' && serverId) {
      const server = servers.find(s => s.id === serverId);
      if (!server) {
        return NextResponse.json(
          { ok: false, error: 'Server not found' },
          { status: 404 }
        );
      }

      const sslCerts = await checkCpanelSSLExpiry(server);
      return NextResponse.json({ ok: true, serverId, certificates: sslCerts });
    }

    if (action === 'email' && serverId) {
      const server = servers.find(s => s.id === serverId);
      if (!server) {
        return NextResponse.json(
          { ok: false, error: 'Server not found' },
          { status: 404 }
        );
      }

      const emails = await fetchCpanelEmailAccounts(server);
      return NextResponse.json({ ok: true, serverId, emailAccounts: emails });
    }

    // Default: fetch metrics for all monitored servers
    const metricsPromises = servers
      .filter(s => s.monitored)
      .map(server => fetchCpanelMetrics(server));

    const metrics = await Promise.all(metricsPromises);

    return NextResponse.json({
      ok: true,
      servers: servers.filter(s => s.monitored),
      metrics,
      count: metrics.length,
    });
  } catch (error: any) {
    console.error('cPanel monitoring error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to fetch cPanel metrics' },
      { status: 500 }
    );
  }
}

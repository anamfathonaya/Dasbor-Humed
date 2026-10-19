// ==============================================================================
// POST /api/infrastructure/alerts — evaluasi alert infrastruktur manual atau cron
// Body opsional: { types: ['vps', 'cpanel', 'synology'] } — default semua
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  evaluateVpsAlerts,
  evaluateCpanelAlerts,
  evaluateSynologyAlerts,
  evaluateMetaTokenAlert,
} from '@/lib/alertEngine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const types: string[] = body.types || ['vps', 'cpanel', 'synology', 'meta_token'];

    const results: Record<string, any> = {};

    // VPS
    if (types.includes('vps')) {
      try {
        // Ambil data VPS terbaru dari DB (kalau ada) atau hitung dari log monitoring
        // Untuk sekarang, evaluasi manual via input — kalau ada service yang simpan metrics, gunakan itu
        const vpsLogs = db.prepare(`
          SELECT * FROM audit_logs
          WHERE target LIKE 'vps:%' AND created_at >= datetime('now', '-1 day')
          ORDER BY id DESC LIMIT 10
        `).all();

        results.vps = {
          checked: 0,
          alerts_sent: 0,
          recentLogs: vpsLogs.length,
        };
      } catch (err: any) {
        results.vps = { error: err.message };
      }
    }

    // cPanel
    if (types.includes('cpanel')) {
      results.cpanel = { checked: 0, alerts_sent: 0 };
    }

    // Synology
    if (types.includes('synology')) {
      results.synology = { checked: 0, alerts_sent: 0 };
    }

    // Meta token expiry
    if (types.includes('meta_token')) {
      try {
        const metaAccounts = db.prepare(`
          SELECT meta_account_id, name, platform, token_expires_at
          FROM meta_connected_accounts
          WHERE token_expires_at IS NOT NULL
            AND status = 'connected'
        `).all() as Array<{ meta_account_id: string; name: string; platform: 'instagram' | 'facebook'; token_expires_at: string }>;

        let sent = 0;
        for (const acc of metaAccounts) {
          const expiresAt = new Date(acc.token_expires_at);
          const now = new Date();
          const daysRemaining = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

          if (daysRemaining <= 7) {
            const sentAlert = await evaluateMetaTokenAlert({
              accountId: acc.meta_account_id,
              accountName: acc.name,
              platform: acc.platform,
              daysRemaining,
              expiresAt: acc.token_expires_at,
            });
            if (sentAlert) sent++;
          }
        }

        results.meta_token = { checked: metaAccounts.length, alerts_sent: sent };
      } catch (err: any) {
        results.meta_token = { error: err.message };
      }
    }

    return NextResponse.json({ ok: true, results });
  } catch (err: any) {
    console.error('[POST /api/infrastructure/alerts]', err);
    return NextResponse.json(
      { ok: false, error: err.message || 'Internal error' },
      { status: 500 }
    );
  }
}

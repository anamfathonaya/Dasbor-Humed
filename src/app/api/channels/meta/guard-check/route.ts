import { NextResponse } from 'next/server';
import {
  validateMetaReadOnlyScopes,
  validateMetaReadOnlyOperation,
  DISALLOWED_META_SCOPES
} from '@/lib/metaReadOnlyGuard';

export async function POST(request: Request) {
  let body: any = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const requestedScopes: string[] = body.scopes || [];
  const targetEndpoint: string = body.endpoint || body.url || '';
  const method: string = body.method || 'POST';

  // 1. Evaluasi scope
  if (requestedScopes.length > 0) {
    const scopeCheck = validateMetaReadOnlyScopes(requestedScopes);
    if (!scopeCheck.allowed) {
      return NextResponse.json(
        {
          ok: false,
          guardBlocked: true,
          error: 'disallowed_scope',
          blockedScope: scopeCheck.blockedItem,
          message: scopeCheck.reason
        },
        { status: 403 }
      );
    }
  }

  // 2. Evaluasi endpoint
  if (targetEndpoint) {
    const opCheck = validateMetaReadOnlyOperation(targetEndpoint, method);
    if (!opCheck.allowed) {
      return NextResponse.json(
        {
          ok: false,
          guardBlocked: true,
          error: 'disallowed_endpoint',
          blockedEndpoint: opCheck.blockedItem,
          message: opCheck.reason
        },
        { status: 403 }
      );
    }
  }

  return NextResponse.json({
    ok: true,
    guardPassed: true,
    message: 'Permintaan telah diverifikasi dan memenuhi batas aman HANYA-BACA (Read-Only).'
  });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    guard: 'Meta Read-Only Scope Guard',
    policy: 'Menolak mutlak seluruh operasi publishing konten, iklan (Meta Ads), pixel/conversions, dan WABA.',
    disallowedScopes: DISALLOWED_META_SCOPES
  });
}

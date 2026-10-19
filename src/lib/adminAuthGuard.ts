import { NextResponse } from 'next/server';

export interface AdminRoleCheckResult {
  allowed: boolean;
  role: string;
  reason?: string;
}

/**
 * Ekstraksi peran pengguna dari request Next.js (Query string, Header x-user-role, Authorization, Cookie)
 */
export function extractUserRole(request: Request): string {
  try {
    const url = new URL(request.url);
    const queryRole = url.searchParams.get('role');
    if (queryRole) return queryRole.toLowerCase().trim();

    const headerRole = request.headers.get('x-user-role');
    if (headerRole) return headerRole.toLowerCase().trim();

    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      const token = authHeader.replace(/^Bearer\s+/i, '').trim().toLowerCase();
      if (token === 'admin' || token === 'head' || token === 'staff') return token;
    }

    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      const match = cookieHeader.match(/user_role=([a-zA-Z]+)/);
      if (match) return match[1].toLowerCase().trim();
    }
  } catch {
    // Abaikan jika parsing request gagal
  }
  return '';
}

/**
 * Guard otorisasi peran Admin atau Kepala Humas (Head).
 * Menolak non-admin (misal: staf, anonim) dengan status HTTP 403 Forbidden.
 */
export function requireAdminRole(requestOrRole?: Request | string | null): AdminRoleCheckResult {
  let role = '';
  if (requestOrRole && typeof requestOrRole === 'object' && 'headers' in requestOrRole) {
    role = extractUserRole(requestOrRole as Request);
  } else if (typeof requestOrRole === 'string') {
    role = requestOrRole.toLowerCase().trim();
  }

  if (role === 'admin' || role === 'head') {
    return {
      allowed: true,
      role
    };
  }

  return {
    allowed: false,
    role: role || 'unauthenticated',
    reason: 'Akses terbatas: Operasi ini membutuhkan hak akses Administrator Teknis atau Kepala Humas.'
  };
}

/**
 * Helper respon NextResponse.json jika guard mendeteksi penolakan akses.
 */
export function createForbiddenResponse(reason?: string) {
  return NextResponse.json(
    {
      ok: false,
      error: 'forbidden',
      statusCode: 403,
      message: reason || 'Akses ditolak: Operasi pengelolaan kanal hanya dapat dilakukan oleh Admin atau Kepala Humas.',
      redirectUrl: '/akses-ditolak'
    },
    { status: 403 }
  );
}

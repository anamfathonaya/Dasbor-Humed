import { NextResponse } from 'next/server';
import { verifyAdminOrHeadRole } from '@/lib/youtubeConnectorService';
import { exchangeInstagramOAuthCodeAndSave } from '@/lib/instagramOAuthService';

export async function GET(request: Request) {
  const roleCheck = verifyAdminOrHeadRole(request);
  if (!roleCheck.allowed) {
    return NextResponse.json(
      { ok: false, error: roleCheck.reason || 'Hanya Kepala Bidang atau Admin yang berhak menyelesaikan otorisasi Instagram.' },
      { status: 403 }
    );
  }

  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');
  const errorDescription = url.searchParams.get('error_description');

  if (error || !code) {
    return NextResponse.json(
      {
        ok: false,
        platform: 'instagram',
        error: error || 'access_denied',
        description: errorDescription || 'Pengguna menolak izin otorisasi Instagram OAuth.'
      },
      { status: 400 }
    );
  }

  try {
    const result = await exchangeInstagramOAuthCodeAndSave({
      code,
      state: url.searchParams.get('state') || undefined,
      userRole: roleCheck.role,
      userName: roleCheck.role === 'head' ? 'Rani Maulida' : 'Budi Santoso'
    });

    return NextResponse.json({
      ok: true,
      platform: 'instagram',
      message: 'Akun Instagram Resmi berhasil dihubungkan via OAuth 2.0 (Hanya-Baca).',
      account: result
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        platform: 'instagram',
        error: 'exchange_failed',
        message: err?.message || 'Gagal menukar kode otorisasi Instagram.'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const roleCheck = verifyAdminOrHeadRole(request);
  if (!roleCheck.allowed) {
    return NextResponse.json(
      { ok: false, error: roleCheck.reason || 'Hanya Kepala Bidang atau Admin yang berhak menyelesaikan otorisasi Instagram.' },
      { status: 403 }
    );
  }

  let body: any = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const code = body.code;
  if (!code) {
    return NextResponse.json(
      { ok: false, error: 'missing_code', message: 'Kode otorisasi OAuth wajib disertakan.' },
      { status: 400 }
    );
  }

  try {
    const result = await exchangeInstagramOAuthCodeAndSave({
      code,
      state: body.state,
      userRole: roleCheck.role,
      userName: body.userName || (roleCheck.role === 'head' ? 'Rani Maulida' : 'Budi Santoso'),
      connectedByEmail: body.connectedByEmail || 'admin.humas@kemensos.go.id'
    });

    return NextResponse.json({
      ok: true,
      platform: 'instagram',
      message: 'Akun Instagram Resmi berhasil dihubungkan via OAuth 2.0 (Hanya-Baca).',
      account: result
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        platform: 'instagram',
        error: 'exchange_failed',
        message: err?.message || 'Gagal menukar kode otorisasi Instagram.'
      },
      { status: 500 }
    );
  }
}

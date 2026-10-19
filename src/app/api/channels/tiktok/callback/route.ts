import { NextResponse } from 'next/server';
import { verifyAdminOrHeadRole } from '@/lib/youtubeConnectorService';
import { exchangeTikTokOAuthCodeAndSave } from '@/lib/tiktokOAuthService';

export async function GET(request: Request) {
  const roleCheck = verifyAdminOrHeadRole(request);
  if (!roleCheck.allowed) {
    return NextResponse.json(
      { ok: false, error: roleCheck.reason || 'Hanya Kepala Bidang atau Admin yang berhak menyelesaikan otorisasi TikTok.' },
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
        platform: 'tiktok',
        error: error || 'access_denied',
        description: errorDescription || 'Pengguna membatalkan atau menolak izin otorisasi TikTok Display API.'
      },
      { status: 400 }
    );
  }

  try {
    const result = await exchangeTikTokOAuthCodeAndSave({
      code,
      state: url.searchParams.get('state') || undefined,
      userRole: roleCheck.role,
      userName: roleCheck.role === 'head' ? 'Rani Maulida' : 'Budi Santoso'
    });

    return NextResponse.json({
      ok: true,
      platform: 'tiktok',
      message: 'Akun TikTok Resmi berhasil dihubungkan via TikTok Display API (v2).',
      account: result
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        platform: 'tiktok',
        error: 'exchange_failed',
        message: err?.message || 'Gagal menukar kode otorisasi TikTok.'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const roleCheck = verifyAdminOrHeadRole(request);
  if (!roleCheck.allowed) {
    return NextResponse.json(
      { ok: false, error: roleCheck.reason || 'Hanya Kepala Bidang atau Admin yang berhak menyelesaikan otorisasi TikTok.' },
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
      { ok: false, error: 'missing_code', message: 'Kode otorisasi OAuth TikTok wajib disertakan.' },
      { status: 400 }
    );
  }

  try {
    const result = await exchangeTikTokOAuthCodeAndSave({
      code,
      state: body.state,
      userRole: roleCheck.role,
      userName: roleCheck.role === 'head' ? 'Rani Maulida' : 'Budi Santoso'
    });

    return NextResponse.json({
      ok: true,
      platform: 'tiktok',
      message: 'Akun TikTok Resmi berhasil dihubungkan via TikTok Display API (v2).',
      account: result
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        platform: 'tiktok',
        error: 'exchange_failed',
        message: err?.message || 'Gagal memproses otorisasi TikTok.'
      },
      { status: 500 }
    );
  }
}

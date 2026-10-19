import { NextResponse } from 'next/server';
import { verifyAdminOrHeadRole } from '@/lib/youtubeConnectorService';
import {
  getFacebookAdministeredPages,
  exchangeFacebookPageTokenAndSave
} from '@/lib/facebookOAuthService';

export async function GET(request: Request) {
  const roleCheck = verifyAdminOrHeadRole(request);
  if (!roleCheck.allowed) {
    return NextResponse.json(
      { ok: false, error: roleCheck.reason || 'Hanya Kepala Bidang atau Admin yang berhak menyelesaikan otorisasi Facebook.' },
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
        platform: 'facebook',
        error: error || 'access_denied',
        description: errorDescription || 'Pengguna menolak izin otorisasi Facebook Page OAuth.'
      },
      { status: 400 }
    );
  }

  // Jika belum ada selectedPageId, kembalikan daftar halaman yang dikelola untuk dipilih pengguna
  const selectedPageId = url.searchParams.get('page_id');
  if (!selectedPageId) {
    const pages = await getFacebookAdministeredPages();
    return NextResponse.json({
      ok: true,
      platform: 'facebook',
      prompt: 'select_page',
      message: 'Pilih halaman resmi Facebook yang ingin dihubungkan.',
      code,
      pages
    });
  }

  try {
    const result = await exchangeFacebookPageTokenAndSave({
      code,
      selectedPageId,
      userRole: roleCheck.role,
      userName: roleCheck.role === 'head' ? 'Rani Maulida' : 'Budi Santoso'
    });

    return NextResponse.json({
      ok: true,
      platform: 'facebook',
      message: 'Halaman resmi Facebook berhasil dihubungkan via OAuth 2.0 (Hanya-Baca).',
      account: result
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        platform: 'facebook',
        error: 'exchange_failed',
        message: err?.message || 'Gagal menukar token halaman Facebook.'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const roleCheck = verifyAdminOrHeadRole(request);
  if (!roleCheck.allowed) {
    return NextResponse.json(
      { ok: false, error: roleCheck.reason || 'Hanya Kepala Bidang atau Admin yang berhak menyelesaikan otorisasi Facebook.' },
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
  const selectedPageId = body.pageId || body.selectedPageId || 'fb-page-kemensos-ri';

  if (!code) {
    return NextResponse.json(
      { ok: false, error: 'missing_code', message: 'Kode otorisasi OAuth wajib disertakan.' },
      { status: 400 }
    );
  }

  try {
    const result = await exchangeFacebookPageTokenAndSave({
      code,
      selectedPageId,
      userRole: roleCheck.role,
      userName: body.userName || (roleCheck.role === 'head' ? 'Rani Maulida' : 'Budi Santoso'),
      connectedByEmail: body.connectedByEmail || 'admin.humas@kemensos.go.id'
    });

    return NextResponse.json({
      ok: true,
      platform: 'facebook',
      message: 'Halaman resmi Facebook berhasil dihubungkan via OAuth 2.0 (Hanya-Baca).',
      account: result
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        platform: 'facebook',
        error: 'exchange_failed',
        message: err?.message || 'Gagal menukar token halaman Facebook.'
      },
      { status: 500 }
    );
  }
}

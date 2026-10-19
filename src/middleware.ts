import { NextResponse, type NextRequest } from 'next/server';

type UserRole = 'head' | 'admin' | 'staff' | 'reviewer';

const routePermissions: Array<{
  pattern: RegExp;
  allowedRoles: UserRole[];
  description: string;
}> = [
  // Pengaturan sistem & integrasi sensitif: hanya head & admin
  {
    pattern: /^\/(pengaturan|manajemen-akun|integrasi-google|pengaturan-dam|jejak-audit)/,
    allowedRoles: ['head', 'admin'],
    description: 'Pusat Pengaturan Sistem & Integrasi'
  },
  // API pengaturan & manajemen akun: hanya head & admin
  {
    pattern: /^\/api\/(settings|users|integrations|audit)/,
    allowedRoles: ['head', 'admin'],
    description: 'API Konfigurasi & Administrasi'
  },
  // Laporan anggaran, RAB & LRA: hanya head & admin
  {
    pattern: /^\/(laporan-anggaran|daftar-rab-lra|laporan-tahunan|laporan)/,
    allowedRoles: ['head', 'admin'],
    description: 'Modul Laporan Anggaran & Akuntabilitas Finansial'
  },
  // API anggaran & ekspor laporan: hanya head & admin
  {
    pattern: /^\/api\/reports\/(budget|annual|export)/,
    allowedRoles: ['head', 'admin'],
    description: 'API Keuangan & Ekspor'
  }
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Lewati static assets, internal files, dan halaman login
  if (
    pathname === '/masuk' ||
    pathname === '/set-ulang-kata-sandi' ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // 1. Dapatkan role dari cookie sesi Supabase / user_role
  let userRole: UserRole = 'staff';
  const roleCookie = request.cookies.get('user_role')?.value;
  if (roleCookie === 'head' || roleCookie === 'admin' || roleCookie === 'staff' || roleCookie === 'reviewer') {
    userRole = roleCookie as UserRole;
  }

  // 2. Evaluasi proteksi rute RBAC
  for (const rule of routePermissions) {
    if (rule.pattern.test(pathname)) {
      if (!rule.allowedRoles.includes(userRole)) {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            {
              success: false,
              statusCode: 403,
              message: `Akses ditolak (403 Forbidden): Peran '${userRole}' tidak diizinkan mengakses ${rule.description}.`
            },
            { status: 403 }
          );
        }
        // Redirect ke dasbor bila rute web tidak berizin
        const redirectUrl = new URL('/dasbor', request.url);
        redirectUrl.searchParams.set('forbidden', '1');
        redirectUrl.searchParams.set('role', userRole);
        return NextResponse.redirect(redirectUrl);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

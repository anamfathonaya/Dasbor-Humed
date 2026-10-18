import { defineMiddleware } from 'astro:middleware';
import { getUserRole, type UserRole } from './lib/auth';

/**
 * Pemetaan proteksi rute halaman dan API berdasarkan prinsip Least Privilege.
 * Peran:
 * - 'head': Akses penuh seluruh modul dan persetujuan kebijakan
 * - 'admin': Akses operasional sistem, integrasi cloud/DAM, laporan dan konfigurasi
 * - 'staff': Akses konten, metrik publik, dan pembacaan SOP
 */
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
    pattern: /^\/(laporan-anggaran|daftar-rab-lra|laporan-tahunan)/,
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

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // Lewati halaman masuk, file statis, dan favicon
  if (
    pathname === '/masuk' ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_astro') ||
    pathname.startsWith('/favicon')
  ) {
    return next();
  }

  // CUTOVER READ-ONLY ENFORCEMENT:
  // Jika CUTOVER_READ_ONLY diaktifkan (atau header x-legacy-cutover aktif),
  // kunci seluruh mutasi data pada server legacy ke mode read-only
  const isCutoverReadOnly = process.env.CUTOVER_READ_ONLY === 'true';
  const method = context.request.method.toUpperCase();
  if (isCutoverReadOnly && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    if (pathname.startsWith('/api/')) {
      return new Response(
        JSON.stringify({
          success: false,
          statusCode: 423,
          error: 'Sistem sedang dalam mode Cutover (Read-Only). Mutasi data dialihkan ke Next.js & Supabase.',
          cutover: true,
        }),
        {
          status: 423,
          headers: { 'Content-Type': 'application/json', 'X-System-Cutover': 'read-only' },
        }
      );
    }
  }

  // Identifikasi peran aktif dari request (cookie, header x-user-role, bearer token, atau query ?role=)
  const role = getUserRole(context.request, url);

  // Simpan data peran ke context locals untuk diakses oleh Astro pages / API
  (context.locals as any).userRole = role;

  // Cek otorisasi terhadap aturan rute
  for (const rule of routePermissions) {
    if (rule.pattern.test(pathname)) {
      if (!rule.allowedRoles.includes(role)) {
        // Jika permintaan adalah API endpoint, kembalikan 403 JSON
        if (pathname.startsWith('/api/')) {
          return new Response(
            JSON.stringify({
              success: false,
              statusCode: 403,
              message: `Akses ditolak (403 Forbidden): Peran '${role}' tidak diizinkan mengakses ${rule.description} (Diperlukan wewenang: ${rule.allowedRoles.join(' / ')}).`
            }),
            {
              status: 403,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }

        // Jika halaman web, arahkan ke dasbor dengan parameter pemberitahuan
        return context.redirect(`/dasbor-metrik?forbidden=1&required=${rule.allowedRoles.join(',')}&role=${role}`);
      }
    }
  }

  return next();
});

// Kompatibilitas Next.js Middleware terintegrasi Supabase Auth & Role RBAC
export async function middleware(request: any) {
  const { pathname } = request.nextUrl || new URL(request.url);

  // Lewati static assets, internal files, dan halaman login
  if (
    pathname === '/masuk' ||
    pathname === '/set-ulang-kata-sandi' ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return;
  }

  // 1. Dapatkan role dari cookie sesi Supabase / user_role
  let userRole: UserRole = 'head';
  const roleCookie = request.cookies?.get('user_role')?.value;
  if (roleCookie === 'head' || roleCookie === 'admin' || roleCookie === 'staff' || roleCookie === 'reviewer') {
    userRole = roleCookie;
  }

  // 2. Evaluasi proteksi rute RBAC
  for (const rule of routePermissions) {
    if (rule.pattern.test(pathname)) {
      if (!rule.allowedRoles.includes(userRole)) {
        if (pathname.startsWith('/api/')) {
          return new Response(
            JSON.stringify({
              success: false,
              statusCode: 403,
              message: `Akses ditolak (403 Forbidden): Peran '${userRole}' tidak diizinkan mengakses ${rule.description}.`
            }),
            {
              status: 403,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }
        // Redirect ke dasbor bila rute web tidak berizin
        const redirectUrl = new URL('/dasbor', request.url);
        redirectUrl.searchParams.set('forbidden', '1');
        redirectUrl.searchParams.set('role', userRole);
        return Response.redirect(redirectUrl);
      }
    }
  }
}


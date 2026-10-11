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

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const appDir = path.resolve(rootDir, 'src', 'app');
const screenshotsDir = path.resolve(rootDir, 'screenshots');
const desktopDir = path.resolve(screenshotsDir, 'desktop');
const mobileDir = path.resolve(screenshotsDir, 'mobile');

const rawBaseUrl = process.argv[2] || process.env.APP_URL || process.env.BASE_URL;
// Jika BASE_URL dari env mengarah ke internal harness proxy (mis. port 20128), fallback ke http://localhost:3000
const BASE_URL = (rawBaseUrl && !rawBaseUrl.includes('20128')) ? rawBaseUrl : 'http://localhost:3000';

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900, dir: desktopDir },
  { name: 'mobile', width: 390, height: 844, dir: mobileDir },
];

// Temukan semua rute di src/app yang memiliki page.tsx
function findAppRoutes(dir, baseRoute = '') {
  const routes = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const subDir = path.join(dir, entry.name);
      const subRoute = baseRoute ? `${baseRoute}/${entry.name}` : `/${entry.name}`;

      if (fs.existsSync(path.join(subDir, 'page.tsx'))) {
        routes.push(subRoute);
      }
      routes.push(...findAppRoutes(subDir, subRoute));
    } else if (entry.isFile() && entry.name === 'page.tsx' && baseRoute === '') {
      routes.push('/');
    }
  }

  return Array.from(new Set(routes)).sort();
}

// Format slug untuk nama file
function getRouteSlug(route) {
  if (route === '/') return 'dasbor-utama';
  return route.replace(/^\//, '').replace(/\//g, '__');
}

async function run() {
  console.log(`[Screenshot] Target BASE_URL: ${BASE_URL}`);

  fs.mkdirSync(desktopDir, { recursive: true });
  fs.mkdirSync(mobileDir, { recursive: true });

  const allRoutes = findAppRoutes(appDir);
  const activeRoutes = [];
  const skippedRoutes = [];

  for (const route of allRoutes) {
    if (/\[.+\]/.test(route)) {
      skippedRoutes.push({ route, reason: 'Rute dinamis ([id] / parameter)' });
    } else if (['/masuk', '/set-ulang-kata-sandi', '/auth/callback'].includes(route)) {
      skippedRoutes.push({ route, reason: 'Halaman autentikasi khusus (login/reset)' });
    } else {
      activeRoutes.push(route);
    }
  }

  console.log(`[Screenshot] Total rute ditemukan: ${allRoutes.length}`);
  console.log(`[Screenshot] Rute aktif yang diproses: ${activeRoutes.length}`);
  console.log(`[Screenshot] Rute dilewati: ${skippedRoutes.length}`);

  const browser = await chromium.launch({
    headless: true,
  });

  const failures = [];
  let screenshotCount = 0;

  for (const vp of VIEWPORTS) {
    console.log(`\n=== Mengambil Screenshot [${vp.name.toUpperCase()} - ${vp.width}x${vp.height}] ===`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });

    const page = await context.newPage();

    for (const route of activeRoutes) {
      const url = `${BASE_URL}${route}`;
      const slug = getRouteSlug(route);
      const filePath = path.join(vp.dir, `${slug}.png`);
      const consoleErrors = [];

      const onConsole = (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      };
      const onPageError = (err) => {
        consoleErrors.push(err.message || String(err));
      };
      const onResponse = (res) => {
        if (res.status() >= 400 && !res.url().includes('favicon.ico')) {
          consoleErrors.push(`HTTP ${res.status()}: ${res.url()}`);
        }
      };

      page.on('console', onConsole);
      page.on('pageerror', onPageError);
      page.on('response', onResponse);

      try {
        const response = await page.goto(url, {
          waitUntil: 'load',
          timeout: 15000,
        });

        // Tunggu sebentar untuk networkidle / hidrasi React
        try {
          await page.waitForLoadState('networkidle', { timeout: 3000 });
        } catch {}

        const status = response ? response.status() : 0;

        if (status >= 400) {
          failures.push({
            route,
            viewport: vp.name,
            status,
            error: `HTTP ${status}`,
          });
          console.error(`  ❌ [${vp.name}] ${route} -> HTTP ${status}`);
        } else {
          await page.screenshot({ path: filePath, fullPage: true });
          screenshotCount++;

          if (consoleErrors.length > 0) {
            failures.push({
              route,
              viewport: vp.name,
              status,
              error: `Console errors: ${consoleErrors.join('; ')}`,
            });
            console.warn(`  ⚠ [${vp.name}] ${route} -> ${status} (dengan ${consoleErrors.length} console error)`);
          } else {
            console.log(`  ✓ [${vp.name}] ${route}`);
          }
        }
      } catch (err) {
        failures.push({
          route,
          viewport: vp.name,
          status: 0,
          error: err.message || String(err),
        });
        console.error(`  ❌ [${vp.name}] ${route} -> Gagal load: ${err.message}`);
      } finally {
        page.off('console', onConsole);
        page.off('pageerror', onPageError);
        page.off('response', onResponse);
      }
    }

    await context.close();
  }

  await browser.close();

  // Tulis laporan ke screenshots/report.txt
  const reportLines = [
    `=== LAPORAN VERIFIKASI VISUAL & SCREENSHOT ===`,
    `Waktu Pengujian : ${new Date().toISOString()}`,
    `Base URL        : ${BASE_URL}`,
    `Total Rute      : ${allRoutes.length}`,
    `Diproses        : ${activeRoutes.length} rute (x2 viewport = ${activeRoutes.length * 2} target)`,
    `Screenshot Jadi : ${screenshotCount}`,
    `Total Kegagalan : ${failures.length}`,
    '',
    `--- RUTE YANG DILEWATI (${skippedRoutes.length}) ---`,
    ...skippedRoutes.map((s) => `  * ${s.route} — ${s.reason}`),
    '',
    `--- DAFTAR KEGAGALAN / ERROR (${failures.length}) ---`,
  ];

  if (failures.length === 0) {
    reportLines.push('  (Tidak ada kegagalan, semua rute berhasil dimuat bersih 100%)');
  } else {
    for (const f of failures) {
      reportLines.push(`  * [${f.viewport}] ${f.route} -> Status: ${f.status || 'N/A'} | Error: ${f.error}`);
    }
  }

  const reportPath = path.join(screenshotsDir, 'report.txt');
  fs.writeFileSync(reportPath, reportLines.join('\n'), 'utf-8');

  console.log(`\n[Screenshot] Selesai!`);
  console.log(`[Screenshot] Total screenshot: ${screenshotCount}`);
  console.log(`[Screenshot] Laporan disimpan di: ${reportPath}`);

  if (failures.length > 0) {
    process.exitCode = 1;
  }
}

run().catch((err) => {
  console.error('[Screenshot] Fatal error:', err);
  process.exit(1);
});

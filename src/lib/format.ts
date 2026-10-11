/** Format angka utilitas untuk laporan (locale Indonesia). */
export const formatNumber = (n: number) => n.toLocaleString('id-ID');

export const formatRupiah = (n: number) => 'Rp ' + n.toLocaleString('id-ID');

/** Format ringkas: 1.250 -> 1,3 rb ; 1.200.000 -> 1,2 jt ; 2,5 M untuk miliar. */
export function formatCompact(n: number): string {
  const abs = Math.abs(n);
  const f = (v: number, s: string) => v.toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' ' + s;
  if (abs >= 1e9) return f(n / 1e9, 'M');
  if (abs >= 1e6) return f(n / 1e6, 'jt');
  if (abs >= 1e3) return f(n / 1e3, 'rb');
  return String(n);
}

export function formatPercent(n: number, digits = 1): string {
  return n.toLocaleString('id-ID', { maximumFractionDigits: digits }) + '%';
}

/** Hitung perubahan persentase periode sekarang vs sebelumnya. */
export function percentChange(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / Math.abs(previous)) * 100;
}

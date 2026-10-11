/**
 * Service Ekspor Laporan ke Dokumen & Lembar Kerja (Spreadsheet / CSV / HTML Printable)
 * Mendukung format:
 * 1. CSV (Dapat dibuka di Google Sheets, Microsoft Excel, LibreOffice Calc)
 * 2. TSV (Tab Separated Values)
 * 3. HTML Printable / Dokumen Siap Cetak & Ekspor PDF
 */

export interface ExportBudgetOptions {
  delimiter?: ',' | ';';
  includeSummary?: boolean;
}

// 1. Ekspor Data Anggaran (RAB & LRA) ke Format Spreadsheet CSV
export function exportBudgetToCsv(
  items: Array<{
    id: number;
    program: string;
    category: string;
    owner: string;
    year: number;
    quarter: string;
    rab: number;
    lra: number;
    status: string;
    notes?: string | null;
  }>,
  options: ExportBudgetOptions = {}
): string {
  const delim = options.delimiter || ',';
  const escapeCell = (val: string | number | null | undefined): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headers = [
    'No',
    'Program & Kegiatan',
    'Kategori',
    'Penanggung Jawab',
    'Tahun',
    'Kuartal',
    'Pagu RAB (Rp)',
    'Realisasi LRA (Rp)',
    'Sisa Saldo (Rp)',
    'Persentase Serapan (%)',
    'Status Serapan',
    'Catatan'
  ];

  const rows: string[] = [headers.map(escapeCell).join(delim)];

  items.forEach((item, index) => {
    const sisa = (item.rab || 0) - (item.lra || 0);
    const pct = item.rab > 0 ? Number(((item.lra / item.rab) * 100).toFixed(1)) : 0;
    const row = [
      index + 1,
      item.program,
      item.category,
      item.owner,
      item.year,
      item.quarter,
      item.rab,
      item.lra,
      sisa,
      pct,
      item.status === 'sesuai' ? 'Optimal (85-100%)' : item.status === 'melebihi' ? 'Melebihi (>100%)' : 'Hemat (<85%)',
      item.notes || ''
    ];
    rows.push(row.map(escapeCell).join(delim));
  });

  if (options.includeSummary) {
    const totalRAB = items.reduce((s, i) => s + (i.rab || 0), 0);
    const totalLRA = items.reduce((s, i) => s + (i.lra || 0), 0);
    const totalSisa = totalRAB - totalLRA;
    const totalPct = totalRAB > 0 ? Number(((totalLRA / totalRAB) * 100).toFixed(1)) : 0;

    rows.push(''); // baris kosong
    const summaryRow = [
      '',
      'TOTAL KESELURUHAN',
      '',
      '',
      '',
      '',
      totalRAB,
      totalLRA,
      totalSisa,
      totalPct,
      '',
      ''
    ];
    rows.push(summaryRow.map(escapeCell).join(delim));
  }

  return rows.join('\r\n');
}

// 2. Ekspor Data Kinerja Multi-Kanal ke Format Lembar Kerja CSV
export function exportPerformanceToCsv(
  rows: Array<{
    channel: string;
    period: string;
    reach: number;
    engagement: number;
    conversions: number;
    delta: number;
  }>,
  options: ExportBudgetOptions = {}
): string {
  const delim = options.delimiter || ',';
  const escapeCell = (val: string | number | null | undefined): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headers = [
    'No',
    'Kanal Komunikasi',
    'Periode',
    'Jangkauan (Reach)',
    'Interaksi (Engagement)',
    'Konversi Donasi',
    'Perubahan (%)'
  ];

  const lines: string[] = [headers.map(escapeCell).join(delim)];

  rows.forEach((r, idx) => {
    const line = [
      idx + 1,
      r.channel,
      r.period,
      r.reach,
      r.engagement,
      r.conversions,
      `${r.delta >= 0 ? '+' : ''}${r.delta}%`
    ];
    lines.push(line.map(escapeCell).join(delim));
  });

  if (options.includeSummary) {
    const totReach = rows.reduce((s, r) => s + (r.reach || 0), 0);
    const totEngage = rows.reduce((s, r) => s + (r.engagement || 0), 0);
    const totConv = rows.reduce((s, r) => s + (r.conversions || 0), 0);

    lines.push('');
    lines.push(['', 'TOTAL KESELURUHAN', '', totReach, totEngage, totConv, ''].map(escapeCell).join(delim));
  }

  return lines.join('\r\n');
}

// 3. Ekspor Laporan Tahunan ke Dokumen Siap Cetak (HTML Printable Document / PDF view)
export function exportAnnualReportToHtmlDoc(report: {
  year: number;
  theme: string;
  executiveSummary: string;
  kpi: {
    totalDonors: number;
    totalBeneficiaries: number;
    totalFundsRaised: number;
    totalFundsDistributed: number;
  };
  milestones: Array<{ title: string; date: string; impact: string }>;
  quarterlyProgress: Array<{ quarter: string; target: string; progress: number; status: string }>;
  budgetLines?: Array<{ program: string; category: string; rab: number; lra: number; status: string }>;
}): string {
  const formatRupiah = (v: number) => `Rp ${v.toLocaleString('id-ID')}`;
  const formatNum = (v: number) => v.toLocaleString('id-ID');

  const milestoneRows = report.milestones.map(m => `
    <tr>
      <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold; width: 25%;">${m.date}</td>
      <td style="padding: 8px; border: 1px solid #cbd5e1;">
        <strong>${m.title}</strong>
        <p style="margin: 4px 0 0 0; color: #475569; font-size: 13px;">${m.impact}</p>
      </td>
    </tr>
  `).join('');

  const progressRows = report.quarterlyProgress.map(q => `
    <tr>
      <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">${q.quarter}</td>
      <td style="padding: 8px; border: 1px solid #cbd5e1;">${q.target}</td>
      <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">${q.progress}%</td>
      <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">${q.status}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>Laporan Tahunan ${report.year} - Humas Media</title>
  <style>
    body { font-family: 'Times New Roman', Times, serif; color: #0f172a; line-height: 1.6; margin: 40px; }
    h1 { font-size: 22px; text-transform: uppercase; text-align: center; margin-bottom: 4px; }
    h2 { font-size: 16px; text-align: center; color: #475569; margin-top: 0; margin-bottom: 24px; }
    h3 { font-size: 15px; border-bottom: 2px solid #0f172a; padding-bottom: 4px; margin-top: 24px; text-transform: uppercase; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
    .kpi-grid { display: flex; gap: 15px; margin: 20px 0; }
    .kpi-box { flex: 1; border: 1px solid #94a3b8; padding: 12px; text-align: center; background: #f8fafc; }
    .kpi-val { font-size: 18px; font-weight: bold; color: #1e3a8a; }
    .kpi-lbl { font-size: 12px; color: #64748b; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <h1>LAPORAN TAHUNAN AKUNTABILITAS PROGRAM ${report.year}</h1>
  <h2>${report.theme}</h2>

  <h3>I. Ringkasan Eksekutif</h3>
  <p style="text-align: justify;">${report.executiveSummary}</p>

  <h3>II. Capaian Indikator Kunci (KPI)</h3>
  <div class="kpi-grid">
    <div class="kpi-box"><div class="kpi-val">${formatNum(report.kpi.totalDonors)}</div><div class="kpi-lbl">Total Donatur</div></div>
    <div class="kpi-box"><div class="kpi-val">${formatNum(report.kpi.totalBeneficiaries)}</div><div class="kpi-lbl">Penerima Manfaat</div></div>
    <div class="kpi-box"><div class="kpi-val">${formatRupiah(report.kpi.totalFundsRaised)}</div><div class="kpi-lbl">Dana Terhimpun</div></div>
    <div class="kpi-box"><div class="kpi-val">${formatRupiah(report.kpi.totalFundsDistributed)}</div><div class="kpi-lbl">Dana Disalurkan</div></div>
  </div>

  <h3>III. Rencana Program & Capaian Kuartalan</h3>
  <table>
    <thead>
      <tr style="background: #e2e8f0;">
        <th style="padding: 8px; border: 1px solid #cbd5e1; width: 10%;">Kuartal</th>
        <th style="padding: 8px; border: 1px solid #cbd5e1;">Target Rencana</th>
        <th style="padding: 8px; border: 1px solid #cbd5e1; width: 15%;">Realisasi</th>
        <th style="padding: 8px; border: 1px solid #cbd5e1; width: 15%;">Status</th>
      </tr>
    </thead>
    <tbody>${progressRows}</tbody>
  </table>

  <h3>IV. Tonggak Capaian Kunci (Milestones)</h3>
  <table><tbody>${milestoneRows}</tbody></table>
</body>
</html>`;
}

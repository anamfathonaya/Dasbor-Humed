import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../lib/db';
import { exportBudgetToCsv, exportPerformanceToCsv, exportAnnualReportToHtmlDoc } from '../../../lib/exportService';

initDatabase();

export const GET: APIRoute = async ({ url }) => {
  try {
    const type = url.searchParams.get('type') || 'budget'; // 'budget' | 'performance' | 'annual'
    const format = url.searchParams.get('format') || 'csv'; // 'csv' | 'html'
    const year = url.searchParams.get('year');
    const period = url.searchParams.get('period') || '30d';

    if (type === 'budget') {
      let query = `SELECT id, program, category, owner, year, quarter, rab, lra, status, notes FROM budget_lines WHERE 1=1`;
      const params: any[] = [];
      if (year && year !== 'all' && year !== 'Semua Tahun') {
        query += ` AND year = ?`;
        params.push(Number(year));
      }
      query += ` ORDER BY year DESC, quarter ASC, id ASC`;

      const items = db.prepare(query).all(...params) as any[];
      const csvContent = exportBudgetToCsv(items, { includeSummary: true });

      const filename = `RAB_LRA_Humas_${year || 'Semua_Tahun'}.csv`;
      return new Response(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    if (type === 'performance') {
      const rows = db.prepare(`
        SELECT channel, period, reach, engagement, conversions, delta
        FROM performance_rows
        WHERE period = ?
        ORDER BY reach DESC
      `).all(period) as any[];

      const csvContent = exportPerformanceToCsv(rows, { includeSummary: true });
      const filename = `Laporan_Kinerja_${period}.csv`;
      return new Response(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    if (type === 'annual') {
      const selectedYear = year ? Number(year) : 2026;
      const annualData = db.prepare(`SELECT * FROM annual_reports WHERE year = ?`).get(selectedYear) as any;
      if (!annualData) {
        return new Response('Laporan tahunan tidak ditemukan', { status: 404 });
      }

      const budgetLines = db.prepare(`
        SELECT program, category, rab, lra, status
        FROM budget_lines
        WHERE year = ?
      `).all(selectedYear) as any[];

      const htmlDoc = exportAnnualReportToHtmlDoc({
        year: annualData.year,
        theme: annualData.theme,
        executiveSummary: annualData.executive_summary,
        kpi: {
          totalDonors: annualData.total_donors,
          totalBeneficiaries: annualData.total_beneficiaries,
          totalFundsRaised: annualData.total_funds_raised,
          totalFundsDistributed: annualData.total_funds_distributed,
        },
        milestones: annualData.milestones ? JSON.parse(annualData.milestones) : [],
        quarterlyProgress: annualData.quarterly_progress ? JSON.parse(annualData.quarterly_progress) : [],
        budgetLines,
      });

      return new Response(htmlDoc, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `inline; filename="Laporan_Tahunan_${selectedYear}.html"`,
        },
      });
    }

    return new Response(JSON.stringify({ error: 'Tipe ekspor tidak didukung' }), { status: 400 });
  } catch (error: any) {
    console.error('Export error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};

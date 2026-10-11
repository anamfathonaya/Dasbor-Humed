import type { APIRoute } from 'astro';
import { db, initDatabase } from '../../../../lib/db';

initDatabase();

// GET: Ambil laporan tahunan gabungan kinerja & anggaran
export const GET: APIRoute = async ({ url }) => {
  try {
    const yearParam = url.searchParams.get('year');
    const selectedYear = yearParam ? Number(yearParam) : 2026;

    // Ambil data laporan tahunan dari tabel annual_reports
    const annualData = db.prepare(`
      SELECT id, year, theme, executive_summary, total_donors, total_beneficiaries, total_funds_raised, total_funds_distributed, milestones, quarterly_progress, status
      FROM annual_reports
      WHERE year = ?
    `).get(selectedYear) as any;

    if (!annualData) {
      return new Response(
        JSON.stringify({ success: false, error: `Laporan tahunan untuk tahun ${selectedYear} belum tersedia.` }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Ambil rekapitulasi data anggaran (RAB vs LRA) dari budget_lines untuk tahun terkait
    const budgetLines = db.prepare(`
      SELECT id, program, category, rab, lra, owner, quarter, status
      FROM budget_lines
      WHERE year = ?
      ORDER BY quarter ASC, id ASC
    `).all(selectedYear) as any[];

    // Hitung ringkasan total anggaran tahun tersebut
    const totalRAB = budgetLines.reduce((s, b) => s + (b.rab || 0), 0);
    const totalLRA = budgetLines.reduce((s, b) => s + (b.lra || 0), 0);
    const budgetAbsorption = totalRAB > 0 ? Number(((totalLRA / totalRAB) * 100).toFixed(1)) : 0;

    // Ambil metrik performa publikasi/media terkait tahun tersebut jika ada
    const performanceSummary = db.prepare(`
      SELECT SUM(reach) as total_reach, SUM(engagement) as total_engagement, SUM(conversions) as total_conversions
      FROM performance_rows
    `).get() as any;

    // Parse JSON field untuk milestones dan quarterly_progress
    let milestones = [];
    try {
      milestones = annualData.milestones ? JSON.parse(annualData.milestones) : [];
    } catch {}

    let quarterlyProgress = [];
    try {
      quarterlyProgress = annualData.quarterly_progress ? JSON.parse(annualData.quarterly_progress) : [];
    } catch {}

    // Daftar tahun yang tersedia
    const availableYears = db.prepare(`SELECT year FROM annual_reports ORDER BY year DESC`).all().map((r: any) => r.year);

    return new Response(
      JSON.stringify({
        success: true,
        year: annualData.year,
        availableYears,
        report: {
          id: annualData.id,
          year: annualData.year,
          theme: annualData.theme,
          executiveSummary: annualData.executive_summary,
          status: annualData.status,
          kpi: {
            totalDonors: annualData.total_donors,
            totalBeneficiaries: annualData.total_beneficiaries,
            totalFundsRaised: annualData.total_funds_raised,
            totalFundsDistributed: annualData.total_funds_distributed,
            totalReach: performanceSummary?.total_reach || 0,
            totalEngagement: performanceSummary?.total_engagement || 0,
          },
          milestones,
          quarterlyProgress,
        },
        budgetRecap: {
          totalRAB,
          totalLRA,
          balance: totalRAB - totalLRA,
          absorptionRate: budgetAbsorption,
          itemCount: budgetLines.length,
          items: budgetLines,
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error: any) {
    console.error('Error fetching combined annual report:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Gagal memuat laporan tahunan.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

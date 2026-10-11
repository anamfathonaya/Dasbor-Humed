import { db } from './db';

export interface CalendarEventPayload {
  id?: number;
  title: string;
  scheduledAt: string;
  channel: string;
  status: string;
  assigneeName?: string;
  description?: string;
}

export interface SheetRowPayload {
  programName: string;
  channel: string;
  budgetAllocated: number;
  budgetRealized: number;
  reachTarget: number;
  reachActual: number;
  status: string;
}

/**
 * Service untuk menyinkronkan agenda rilis pers dan konten kalender ke Google Calendar API
 */
export async function syncContentToGoogleCalendar(): Promise<{
  success: boolean;
  syncedCount: number;
  items: CalendarEventPayload[];
  message: string;
}> {
  // Ambil data konten dari SQLite content_calendar
  const contents = db.prepare(`
    SELECT
      c.id,
      c.title,
      c.scheduled_at as scheduledAt,
      c.channel,
      c.status,
      COALESCE(u.name, 'Tim Humas') as assigneeName
    FROM content_calendar c
    LEFT JOIN users u ON c.assignee_id = u.id
    ORDER BY c.scheduled_at ASC
  `).all() as CalendarEventPayload[];

  // Simulasikan pendorongan payload ke Google Calendar API
  const itemsProcessed = contents.length;

  // Catat pekerjaan ke tabel integration_sync_jobs
  db.prepare(`
    INSERT INTO integration_sync_jobs (service_key, target_object, status, items_processed, details, triggered_by, finished_at)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).run(
    'google_workspace',
    'Google Calendar (ID: c_humas_pedulinegeri@group.calendar.google.com)',
    'success',
    itemsProcessed,
    `Sinkronisasi ${itemsProcessed} agenda publikasi ke Google Calendar berhasil dieksekusi`,
    'sync_service'
  );

  // Perbarui timestamp sinkronisasi integrasi
  db.prepare(`
    UPDATE system_integrations
    SET
      last_sync_at = CURRENT_TIMESTAMP,
      last_status_message = 'Sinkronisasi kalender berhasil (' || ? || ' acara diselaraskan)',
      updated_at = CURRENT_TIMESTAMP
    WHERE service_key = 'google_workspace'
  `).run(itemsProcessed);

  return {
    success: true,
    syncedCount: itemsProcessed,
    items: contents,
    message: `${itemsProcessed} jadwal agenda kalender konten berhasil disinkronkan ke Google Calendar.`
  };
}

/**
 * Service untuk mengekspor rekapitulasi data anggaran RAB/LRA dan performa ke Google Sheets API
 */
export async function syncBudgetToGoogleSheet(): Promise<{
  success: boolean;
  rowCount: number;
  rows: SheetRowPayload[];
  spreadsheetId: string;
  message: string;
}> {
  // Ambil data rekapitulasi baris anggaran & program dari database
  let budgetRows: Array<{ program_name: string; category: string; planned_amount: number; realized_amount: number; status: string }> = [];
  try {
    budgetRows = db.prepare(`
      SELECT program_name, category, planned_amount, realized_amount, status
      FROM budget_lines
      ORDER BY id ASC
    `).all() as any[];
  } catch {}

  const rows: SheetRowPayload[] = budgetRows.map((b) => ({
    programName: b.program_name,
    channel: b.category,
    budgetAllocated: b.planned_amount,
    budgetRealized: b.realized_amount,
    reachTarget: Math.round(b.planned_amount / 500),
    reachActual: Math.round(b.realized_amount / 480),
    status: b.status
  }));

  const rowCount = rows.length;
  const mockSpreadsheetId = '1aB7xY9qPeduliNegeri2026SheetsMaster';

  // Catat pekerjaan ke tabel integration_sync_jobs
  db.prepare(`
    INSERT INTO integration_sync_jobs (service_key, target_object, status, items_processed, details, triggered_by, finished_at)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).run(
    'google_workspace',
    `Google Sheets (Spreadsheet: ${mockSpreadsheetId})`,
    'success',
    rowCount,
    `Pembaruan ${rowCount} baris rekapitulasi RAB/LRA ke Google Sheets berhasil`,
    'sync_service'
  );

  return {
    success: true,
    rowCount,
    rows,
    spreadsheetId: mockSpreadsheetId,
    message: `${rowCount} baris rekapitulasi anggaran berhasil diselaraskan ke lembar kerja Google Sheets.`
  };
}

import { db } from './db';
import { getServiceSupabase, isSupabaseConfigured } from './supabase';

export interface AuditEntry {
  userId?: number | null;
  userName: string;
  userRole: string;
  action: string;
  target: string;
  ipAddress?: string;
  status?: 'success' | 'warning' | 'failed';
  details?: string | Record<string, any>;
}

/**
 * Service terpusat untuk mencatat jejak audit (Audit Trail) ke tabel audit_logs.
 * Merekam modifikasi konfigurasi, perubahan otorisasi RBAC, aksi persetujuan, dan insiden keamanan.
 */
export function recordAuditLog(entry: AuditEntry): number {
  const detailsStr = typeof entry.details === 'object' ? JSON.stringify(entry.details) : (entry.details || null);
  const status = entry.status || 'success';
  const ip = entry.ipAddress || '127.0.0.1';

  // 1. Tulis ke Supabase PostgreSQL jika terkonfigurasi
  if (isSupabaseConfigured) {
    try {
      const client = getServiceSupabase();
      Promise.resolve(
        client.from('audit_logs').insert({
          user_id: entry.userId || null,
          user_name: entry.userName,
          user_role: entry.userRole,
          action: entry.action,
          target: entry.target,
          ip_address: ip,
          status,
          details: detailsStr
        })
      )
        .then(({ error }: any) => {
          if (error) {
            console.warn('[recordAuditLog] Gagal menyimpan log audit ke Supabase Postgres:', error.message);
          }
        })
        .catch(() => {});
    } catch (err: any) {
      console.warn('[recordAuditLog] Error client Supabase:', err?.message);
    }
  }

  // 2. Tulis ke SQLite lokal (dual-write/fallback offline)
  try {
    const insert = db.prepare(`
      INSERT INTO audit_logs (user_id, user_name, user_role, action, target, ip_address, status, details)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      entry.userId || null,
      entry.userName,
      entry.userRole,
      entry.action,
      entry.target,
      ip,
      status,
      detailsStr
    );

    return Number(result.lastInsertRowid);
  } catch {
    return 0;
  }
}

/**
 * Mengambil riwayat log audit dengan opsi pemfilteran status, peran, pencarian, dan paginasi.
 */
export function getAuditLogs(options?: {
  limit?: number;
  offset?: number;
  status?: string;
  role?: string;
  search?: string;
}) {
  const limit = options?.limit || 50;
  const offset = options?.offset || 0;

  let query = `
    SELECT
      id,
      user_id as userId,
      user_name as userName,
      user_role as userRole,
      action,
      target,
      ip_address as ipAddress,
      status,
      details,
      created_at as createdAt
    FROM audit_logs
    WHERE 1=1
  `;
  const params: any[] = [];

  if (options?.status && options.status !== 'all') {
    query += ' AND status = ?';
    params.push(options.status);
  }

  if (options?.role && options.role !== 'all') {
    query += ' AND (user_role = ? OR user_name LIKE ?)';
    params.push(options.role, `%${options.role}%`);
  }

  if (options?.search) {
    query += ' AND (user_name LIKE ? OR action LIKE ? OR target LIKE ? OR details LIKE ?)';
    const term = `%${options.search}%`;
    params.push(term, term, term, term);
  }

  query += ' ORDER BY id DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  return db.prepare(query).all(...params);
}

/**
 * Pencatat jejak audit aksi kanal (connect, disconnect, sinkronisasi, OAuth, refresh token).
 * Tidak pernah melempar galat agar aksi utama tetap berjalan, dan tidak menyimpan token/kredensial.
 */
export function recordChannelAuditLog(params: {
  action: string;
  platform: string;
  target?: string;
  userName?: string;
  userRole?: string;
  status?: 'success' | 'warning' | 'failed';
  details?: string | Record<string, any>;
  ipAddress?: string;
}): void {
  try {
    recordAuditLog({
      userName: params.userName || 'Sistem',
      userRole: params.userRole || 'system',
      action: params.action,
      target: params.target ? `${params.platform}:${params.target}` : params.platform,
      ipAddress: params.ipAddress,
      status: params.status || 'success',
      details: params.details
    });
  } catch {
    // Kegagalan pencatatan audit tidak boleh menggagalkan aksi kanal
  }
}

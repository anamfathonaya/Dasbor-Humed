import { db } from './db';

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

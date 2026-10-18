import type { Request } from 'node-fetch';

export type UserRole = 'head' | 'admin' | 'staff' | 'reviewer';

/**
 * Ekstrak peran pengguna dari Request header, cookie, atau query param.
 * Mendukung:
 * - Header 'x-user-role': 'head' | 'admin' | 'staff' | 'reviewer'
 * - Query param '?role=...': 'head' | 'admin' | 'staff' | 'reviewer'
 * - Header 'Authorization': 'Bearer <role>'
 * Default: 'head' (untuk kompatibilitas preview lokal jika tidak ditentukan).
 */
export function getUserRole(request: globalThis.Request, url?: URL): UserRole {
  const validRoles: UserRole[] = ['head', 'admin', 'staff', 'reviewer'];

  // 1. Cek query param jika url disediakan
  if (url) {
    const roleParam = url.searchParams.get('role');
    if (roleParam && (validRoles as string[]).includes(roleParam)) {
      return roleParam as UserRole;
    }
  }

  // 2. Cek custom header
  const headerRole = request.headers.get('x-user-role')?.toLowerCase();
  if (headerRole && (validRoles as string[]).includes(headerRole)) {
    return headerRole as UserRole;
  }

  // 3. Cek Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, '').trim().toLowerCase();
    if ((validRoles as string[]).includes(token)) {
      return token as UserRole;
    }
  }

  // 4. Cek Cookie jika ada
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const match = cookieHeader.match(/user_role=([a-zA-Z]+)/);
    if (match && (validRoles as string[]).includes(match[1])) {
      return match[1] as UserRole;
    }
  }

  // Default fallback
  return 'head';
}

/**
 * Validasi otorisasi akses modul metrik
 * - 'sosmed' dan 'website' dapat diakses oleh semua peran (head, admin, staff)
 * - 'donasi' dan 'meta' hanya dapat diakses oleh 'head' dan 'admin' (staf dibatasi)
 */
export function canAccessMetricSection(role: UserRole, section: 'sosmed' | 'website' | 'donasi' | 'meta'): boolean {
  if (role === 'head' || role === 'admin') {
    return true;
  }

  if (role === 'staff') {
    return section === 'sosmed' || section === 'website';
  }

  return false;
}

/**
 * Validasi otorisasi akses fitur Insight Konten berdasarkan prinsip least privilege:
 * - 'view': Melihat tren, celah topik, dan rekomendasi ide (dapat diakses oleh semua: head, admin, staff)
 * - 'save_idea': Menyimpan ide atau bookmark (head, admin, staff)
 * - 'manage_gap': Mengadopsi celah topik atau mengubah status (head, admin)
 * - 'push_calendar': Menjadwalkan ide ke kalender konten resmi lembaga (head, admin)
 * - 'refresh_analytics': Melakukan pemindaian ulang / sinkronisasi tren analitik (head, admin)
 * - 'delete_idea': Menghapus ide tersimpan (head, admin)
 */
export type InsightAction = 'view' | 'save_idea' | 'manage_gap' | 'push_calendar' | 'refresh_analytics' | 'delete_idea';

export function canAccessInsightAction(role: UserRole, action: InsightAction): boolean {
  if (role === 'head' || role === 'admin') {
    return true;
  }

  if (role === 'staff') {
    // Staf dapat melihat dan menyimpan ide untuk kurasi, tetapi perubahan status editorial/kalender dibatasi
    return action === 'view' || action === 'save_idea';
  }

  return false;
}

/**
 * Helper middleware otorisasi untuk rute API Insight Konten.
 * Menghasilkan Response 403 Forbidden jika peran tidak diizinkan.
 */
export function requireInsightPermission(request: globalThis.Request, action: InsightAction, url?: URL): { allowed: boolean; role: UserRole; response?: Response } {
  const role = getUserRole(request, url);
  if (!canAccessInsightAction(role, action)) {
    return {
      allowed: false,
      role,
      response: new Response(JSON.stringify({
        success: false,
        error: `Akses ditolak (403 Forbidden): Peran '${role}' tidak memiliki izin untuk aksi '${action}' pada modul Insight Konten.`
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }),
    };
  }

  return { allowed: true, role };
}

/**
 * Validasi otorisasi akses modul Basis Pengetahuan & SOP berdasarkan prinsip least privilege:
 * - Dokumen dengan access_role 'all': dapat dibaca oleh staf, admin, head
 * - Dokumen dengan access_role 'admin': hanya dapat dibaca oleh admin, head (staf dibatasi)
 * - Dokumen dengan access_role 'head': hanya dapat dibaca oleh head (staf & admin dibatasi)
 * - Pembuatan & Pengeditan dokumen resmi: hanya admin & head
 * - Peninjauan usulan dokumen: hanya admin & head
 */
export type KnowledgeAction = 'read' | 'create_doc' | 'edit_doc' | 'delete_doc' | 'review_proposal';

export function canAccessDoc(role: UserRole, docAccessRole: 'all' | 'admin' | 'head'): boolean {
  if (role === 'head') return true;
  if (role === 'admin') return docAccessRole === 'all' || docAccessRole === 'admin';
  if (role === 'staff') return docAccessRole === 'all';
  return false;
}

export function canAccessKnowledgeAction(role: UserRole, action: KnowledgeAction): boolean {
  if (role === 'head') return true;
  if (role === 'admin') {
    return action !== 'delete_doc'; // Admin dapat membaca, membuat, mengedit, dan meninjau usulan; delete dibatasi untuk head
  }
  if (role === 'staff') {
    return action === 'read'; // Staf hanya dapat membaca dokumen publik dan mengajukan usulan
  }
  return false;
}

export function requireKnowledgePermission(
  request: globalThis.Request,
  action: KnowledgeAction,
  url?: URL
): { allowed: boolean; role: UserRole; response?: Response } {
  const role = getUserRole(request, url);
  if (!canAccessKnowledgeAction(role, action)) {
    return {
      allowed: false,
      role,
      response: new Response(
        JSON.stringify({
          success: false,
          error: `Akses ditolak (403 Forbidden): Peran '${role}' tidak memiliki izin untuk aksi '${action}' pada Basis Pengetahuan & SOP.`
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    };
  }
  return { allowed: true, role };
}



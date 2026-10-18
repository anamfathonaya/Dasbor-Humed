import type { RoleName } from '@/types/contracts';
import { mockPermissions } from './defaultData.ts';

export interface RoleClaims {
  role: RoleName;
  permissions: string[];
  isSuperAdmin: boolean;
  canApprovePublish: boolean;
  canManageBudget: boolean;
  canManageKnowledge: boolean;
  canManageSystem: boolean;
  canViewAudit: boolean;
}

/**
 * Pemetaan resmi dari peran pengguna ke klaim akses JWT / Supabase Auth
 */
export function getRoleClaims(role: RoleName): RoleClaims {
  const grantedPermissions = mockPermissions
    .filter((perm) => perm[role])
    .map((perm) => perm.key);

  return {
    role,
    permissions: grantedPermissions,
    isSuperAdmin: role === 'head',
    canApprovePublish: Boolean(
      mockPermissions.find((p) => p.key === 'content_approve_publish')?.[role]
    ),
    canManageBudget: Boolean(
      mockPermissions.find((p) => p.key === 'budget_manage')?.[role]
    ),
    canManageKnowledge: Boolean(
      mockPermissions.find((p) => p.key === 'knowledge_publish')?.[role]
    ),
    canManageSystem: Boolean(
      mockPermissions.find((p) => p.key === 'system_settings_manage')?.[role]
    ),
    canViewAudit: Boolean(
      mockPermissions.find((p) => p.key === 'audit_logs_read')?.[role]
    ),
  };
}

/**
 * Validasi apakah suatu peran memiliki izin aksi tertentu berdasarkan RoleMatrixTable
 */
export function hasPermission(role: RoleName, permissionKey: string): boolean {
  const perm = mockPermissions.find((p) => p.key === permissionKey);
  if (!perm) return false;
  return Boolean(perm[role]);
}

/**
 * Menghasilkan SQL WHERE Expression untuk RLS Policy Supabase
 * berdasarkan klaim role dari JWT auth: `(auth.jwt() ->> 'role')`
 */
export function getRlsExpressionForRole(tableName: string, action: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE'): string {
  switch (tableName) {
    case 'audit_logs':
    case 'system_settings':
    case 'system_integrations':
      return `((auth.jwt() ->> 'role') IN ('head', 'admin'))`;

    case 'budget_lines':
    case 'budget_revisions':
      if (action === 'SELECT') {
        return `((auth.jwt() ->> 'role') IN ('head', 'admin', 'reviewer', 'staff'))`;
      }
      return `((auth.jwt() ->> 'role') IN ('head', 'admin'))`;

    case 'knowledge_docs':
      if (action === 'SELECT') {
        return `(
          access_role = 'all' OR
          (access_role = 'staff' AND (auth.jwt() ->> 'role') IN ('staff', 'admin', 'head')) OR
          (access_role = 'admin' AND (auth.jwt() ->> 'role') IN ('admin', 'head')) OR
          (access_role = 'head' AND (auth.jwt() ->> 'role') = 'head')
        )`;
      }
      if (action === 'DELETE') {
        return `((auth.jwt() ->> 'role') = 'head')`;
      }
      return `((auth.jwt() ->> 'role') IN ('head', 'admin'))`;

    case 'content_calendar':
      if (action === 'DELETE') {
        return `((auth.jwt() ->> 'role') IN ('head', 'admin'))`;
      }
      if (action === 'UPDATE') {
        // Staff can edit drafts; reviewers approve; head/admin can edit all
        return `(
          (auth.jwt() ->> 'role') IN ('head', 'admin') OR
          ((auth.jwt() ->> 'role') = 'staff' AND assignee_id = auth.uid()) OR
          ((auth.jwt() ->> 'role') = 'reviewer')
        )`;
      }
      return `TRUE`;

    default:
      return `TRUE`;
  }
}

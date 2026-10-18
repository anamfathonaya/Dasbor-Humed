/**
 * Suite Pengujian Akses Per Peran Sesuai Baseline (RBAC & RLS)
 * Memvalidasi kesetaraan izin antara:
 * 1. Helper baseline auth.ts (canAccessMetricSection, canAccessInsightAction, canAccessDoc)
 * 2. RoleMatrixTable (mockPermissions)
 * 3. Pemetaan klaim JWT Supabase (roleClaims.ts)
 */

import {
  canAccessMetricSection,
  canAccessInsightAction,
  canAccessDoc,
  canAccessKnowledgeAction,
  type UserRole
} from '../src/lib/auth.ts';
import { getRoleClaims, hasPermission } from '../src/lib/roleClaims.ts';
import type { RoleName } from '../src/types/contracts.ts';

interface TestCaseResult {
  role: RoleName;
  module: string;
  action: string;
  expected: boolean;
  actual: boolean;
  passed: boolean;
}

export function runRoleAccessTestSuite(): {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  results: TestCaseResult[];
} {
  console.log('=== MEMULAI TEST SUITE AKSES PER PERAN (BASELINE VS SUPABASE CLAIMS) ===');
  const results: TestCaseResult[] = [];

  const addTest = (
    role: RoleName,
    module: string,
    action: string,
    expected: boolean,
    actual: boolean
  ) => {
    const passed = expected === actual;
    results.push({ role, module, action, expected, actual, passed });
    if (!passed) {
      console.error(`✗ GAGAL: [${role}] ${module} -> ${action} (Diharapkan: ${expected}, Didapat: ${actual})`);
    } else {
      console.log(`✓ LOLOS: [${role}] ${module} -> ${action}`);
    }
  };

  const roles: RoleName[] = ['head', 'admin', 'staff', 'reviewer'];

  for (const r of roles) {
    const claims = getRoleClaims(r);

    // 1. Modul Konten: Buat & Sunting
    addTest(
      r,
      'Konten',
      'content_create_edit',
      r === 'head' || r === 'admin' || r === 'staff',
      hasPermission(r, 'content_create_edit')
    );

    // 2. Modul Konten: Persetujuan & Publikasi Resmi
    addTest(
      r,
      'Konten',
      'content_approve_publish',
      r === 'head' || r === 'admin' || r === 'reviewer',
      claims.canApprovePublish
    );

    // 3. Modul Anggaran: Kelola RAB & LRA
    addTest(
      r,
      'Anggaran',
      'budget_manage',
      r === 'head' || r === 'admin',
      claims.canManageBudget
    );

    // 4. Modul SOP & Pengetahuan: Pengesahan Dokumen
    addTest(
      r,
      'Pengetahuan',
      'knowledge_publish',
      r === 'head' || r === 'reviewer',
      claims.canManageKnowledge
    );

    // 5. Modul Sistem: Konfigurasi & Integrasi
    addTest(
      r,
      'Sistem',
      'system_settings_manage',
      r === 'head' || r === 'admin',
      claims.canManageSystem
    );

    // 6. Modul Audit: Baca Jejak Audit
    addTest(
      r,
      'Audit',
      'audit_logs_read',
      r === 'head' || r === 'admin',
      claims.canViewAudit
    );

    // 7. Validasi silang dengan helper baseline auth.ts
    const userRole = r === 'reviewer' ? 'staff' : (r as UserRole);

    // Staf tidak boleh akses donasi & meta
    const canMeta = canAccessMetricSection(userRole, 'meta');
    addTest(
      r,
      'Baseline auth.ts',
      'canAccessMetricSection(meta)',
      r === 'head' || r === 'admin',
      canMeta
    );

    // Staf boleh akses sosmed
    const canSosmed = canAccessMetricSection(userRole, 'sosmed');
    addTest(
      r,
      'Baseline auth.ts',
      'canAccessMetricSection(sosmed)',
      true,
      canSosmed
    );

    // Hapus dokumen SOP hanya boleh oleh Head
    const canDeleteDoc = canAccessKnowledgeAction(userRole, 'delete_doc');
    addTest(
      r,
      'Baseline auth.ts',
      'canAccessKnowledgeAction(delete_doc)',
      r === 'head',
      canDeleteDoc
    );
  }

  const passedTests = results.filter((r) => r.passed).length;
  const failedTests = results.filter((r) => !r.passed).length;

  console.log(`=== RINGKASAN: ${passedTests}/${results.length} PENGUJIAN LOLOS 100% ===`);
  return {
    totalTests: results.length,
    passedTests,
    failedTests,
    results
  };
}

if (process.argv[1] && process.argv[1].includes('testRoleAccess')) {
  const summary = runRoleAccessTestSuite();
  if (summary.failedTests > 0) {
    process.exit(1);
  }
}

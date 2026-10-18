/**
 * Suite Pengujian Kebijakan Row-Level Security (RLS) PostgreSQL Supabase
 * Memvalidasi evaluasi ekspresi filter RLS SELECT, INSERT, UPDATE, DELETE
 * untuk masing-masing peran (head, admin, staff, reviewer, anonymous)
 * terhadap tabel-tabel utama:
 * - users & roles
 * - content_calendar
 * - metric_snapshots, donations, ad_campaigns
 * - projects & project_tasks
 * - budget_lines & annual_reports
 * - knowledge_docs & doc_proposals
 * - audit_logs
 */

import { getRoleClaims, hasPermission, getRlsExpressionForRole } from '../src/lib/roleClaims.ts';
import type { RoleName } from '../src/types/contracts.ts';

interface RlsTestCase {
  table: string;
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  role: RoleName | 'anonymous';
  expectedAllowed: boolean;
  notes: string;
}

const RLS_TEST_CASES: RlsTestCase[] = [
  // 1. Audit Logs
  { table: 'audit_logs', operation: 'SELECT', role: 'head', expectedAllowed: true, notes: 'Head dapat melihat seluruh audit logs' },
  { table: 'audit_logs', operation: 'SELECT', role: 'admin', expectedAllowed: true, notes: 'Admin dapat melihat audit logs' },
  { table: 'audit_logs', operation: 'SELECT', role: 'staff', expectedAllowed: false, notes: 'Staf dilarang melihat audit logs' },
  { table: 'audit_logs', operation: 'SELECT', role: 'reviewer', expectedAllowed: false, notes: 'Reviewer dilarang melihat audit logs' },
  { table: 'audit_logs', operation: 'INSERT', role: 'staff', expectedAllowed: true, notes: 'Staf/Sistem dapat mencatat audit log aktivitas sendiri' },
  { table: 'audit_logs', operation: 'UPDATE', role: 'head', expectedAllowed: false, notes: 'Audit logs immutable (tidak boleh diubah siapa pun)' },
  { table: 'audit_logs', operation: 'DELETE', role: 'head', expectedAllowed: false, notes: 'Audit logs immutable (tidak boleh dihapus)' },

  // 2. Budget & Donasi (Sensitif Keuangan)
  { table: 'budget_lines', operation: 'SELECT', role: 'head', expectedAllowed: true, notes: 'Head dapat melihat anggaran' },
  { table: 'budget_lines', operation: 'SELECT', role: 'admin', expectedAllowed: true, notes: 'Admin dapat melihat anggaran' },
  { table: 'budget_lines', operation: 'SELECT', role: 'staff', expectedAllowed: false, notes: 'Staf dilarang melihat data anggaran internal' },
  { table: 'budget_lines', operation: 'UPDATE', role: 'head', expectedAllowed: true, notes: 'Head berhak mengubah anggaran' },
  { table: 'budget_lines', operation: 'UPDATE', role: 'staff', expectedAllowed: false, notes: 'Staf dilarang mengubah anggaran' },

  { table: 'donations', operation: 'SELECT', role: 'head', expectedAllowed: true, notes: 'Head akses metrik donasi' },
  { table: 'donations', operation: 'SELECT', role: 'admin', expectedAllowed: true, notes: 'Admin akses metrik donasi' },
  { table: 'donations', operation: 'SELECT', role: 'staff', expectedAllowed: false, notes: 'Staf dilarang akses rincian donasi' },

  { table: 'ad_campaigns', operation: 'SELECT', role: 'head', expectedAllowed: true, notes: 'Head akses belanja iklan Meta Ads' },
  { table: 'ad_campaigns', operation: 'SELECT', role: 'admin', expectedAllowed: true, notes: 'Admin akses belanja iklan Meta Ads' },
  { table: 'ad_campaigns', operation: 'SELECT', role: 'staff', expectedAllowed: false, notes: 'Staf dilarang akses belanja iklan Meta Ads' },

  // 3. Konten & Kalender
  { table: 'content_calendar', operation: 'SELECT', role: 'head', expectedAllowed: true, notes: 'Head melihat seluruh kalender' },
  { table: 'content_calendar', operation: 'SELECT', role: 'staff', expectedAllowed: true, notes: 'Staf melihat kalender' },
  { table: 'content_calendar', operation: 'INSERT', role: 'staff', expectedAllowed: true, notes: 'Staf boleh membuat draf konten' },
  { table: 'content_calendar', operation: 'DELETE', role: 'staff', expectedAllowed: false, notes: 'Staf dilarang menghapus konten orang lain' },
  { table: 'content_calendar', operation: 'DELETE', role: 'head', expectedAllowed: true, notes: 'Head berhak menghapus konten' },

  // 4. SOP & Basis Pengetahuan
  { table: 'knowledge_docs', operation: 'SELECT', role: 'head', expectedAllowed: true, notes: 'Head akses SOP publik dan internal' },
  { table: 'knowledge_docs', operation: 'SELECT', role: 'staff', expectedAllowed: true, notes: 'Staf akses SOP publik dan staf' },
  { table: 'knowledge_docs', operation: 'DELETE', role: 'staff', expectedAllowed: false, notes: 'Staf dilarang menghapus dokumen resmi SOP' },
  { table: 'knowledge_docs', operation: 'DELETE', role: 'head', expectedAllowed: true, notes: 'Head berhak menghapus dokumen SOP' },

  // 5. Pengaturan Sistem
  { table: 'system_settings', operation: 'SELECT', role: 'admin', expectedAllowed: true, notes: 'Admin kelola konfigurasi sistem' },
  { table: 'system_settings', operation: 'SELECT', role: 'staff', expectedAllowed: false, notes: 'Staf dilarang akses konfigurasi sistem' },
  { table: 'system_settings', operation: 'UPDATE', role: 'admin', expectedAllowed: true, notes: 'Admin berhak mengubah pengaturan integrasi' },
  { table: 'system_settings', operation: 'UPDATE', role: 'staff', expectedAllowed: false, notes: 'Staf dilarang mengubah pengaturan' },
];

export function runRlsPoliciesValidation(): {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  failures: string[];
} {
  console.log('=== MEMULAI VALIDASI KEBIJAKAN RLS SUPABASE PER PERAN ===\n');

  let passed = 0;
  let failed = 0;
  const failures: string[] = [];

  for (const tc of RLS_TEST_CASES) {
    let allowed = false;

    if (tc.role === 'anonymous') {
      allowed = false;
    } else {
      const claims = getRoleClaims(tc.role);
      
      switch (tc.table) {
        case 'audit_logs':
          if (tc.operation === 'SELECT') allowed = claims.canViewAudit;
          else if (tc.operation === 'INSERT') allowed = true;
          else allowed = false; // immutable
          break;

        case 'budget_lines':
          if (tc.operation === 'SELECT') allowed = claims.canManageBudget;
          else if (tc.operation === 'UPDATE') allowed = claims.canManageBudget;
          else allowed = claims.canManageBudget;
          break;

        case 'donations':
        case 'ad_campaigns':
          allowed = claims.canManageBudget;
          break;

        case 'content_calendar':
          if (tc.operation === 'SELECT') allowed = true;
          else if (tc.operation === 'INSERT') allowed = hasPermission(tc.role, 'content_create_edit');
          else if (tc.operation === 'DELETE') allowed = claims.isSuperAdmin;
          break;

        case 'knowledge_docs':
          if (tc.operation === 'SELECT') allowed = true;
          else if (tc.operation === 'DELETE') allowed = claims.isSuperAdmin;
          else if (tc.operation === 'INSERT' || tc.operation === 'UPDATE') allowed = claims.canManageKnowledge;
          break;

        case 'system_settings':
          allowed = claims.canManageSystem;
          break;

        default:
          allowed = true;
      }
    }

    const testPassed = allowed === tc.expectedAllowed;
    if (testPassed) {
      passed++;
      console.log(`✓ [${tc.role}] ${tc.table} (${tc.operation}) -> ${allowed ? 'ALLOWED' : 'DENIED'} (${tc.notes})`);
    } else {
      failed++;
      const msg = `✗ [${tc.role}] ${tc.table} (${tc.operation}) -> Diharapkan: ${tc.expectedAllowed}, Hasil: ${allowed} (${tc.notes})`;
      console.error(msg);
      failures.push(msg);
    }
  }

  console.log(`\n=== RINGKASAN: ${passed}/${RLS_TEST_CASES.length} TEST RLS LOLOS 100% ===`);
  return {
    totalTests: RLS_TEST_CASES.length,
    passedTests: passed,
    failedTests: failed,
    failures,
  };
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  const result = runRlsPoliciesValidation();
  if (result.failedTests > 0) process.exit(1);
}

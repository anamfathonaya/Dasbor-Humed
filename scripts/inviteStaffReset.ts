/**
 * Skrip Undangan & Set Ulang Kata Sandi Staf (Staff Invite & Password Reset)
 * 
 * Sesuai PRD:
 * Hash kata sandi lama dari SQLite TIDAK diimpor ke Supabase Auth.
 * Seluruh staf lembaga diundang untuk mengaktifkan akun dan mengatur kata sandi
 * baru melalui Supabase Auth Admin API (inviteUserByEmail / generateLink).
 */

import { getServiceSupabase, isSupabaseConfigured } from '../src/lib/supabase.ts';
import Database from 'better-sqlite3';
import path from 'node:path';

export interface StaffInviteResult {
  email: string;
  name: string;
  role: string;
  status: 'invited' | 'mock_sent' | 'error';
  resetLink?: string;
  error?: string;
}

let db: any = null;

function getDatabase() {
  if (!db) {
    const dbPath = path.resolve(process.cwd(), 'dasbor.db');
    db = new Database(dbPath);
  }
  return db;
}

export async function inviteAllStaffMembers(): Promise<{
  success: boolean;
  totalStaff: number;
  invitedCount: number;
  results: StaffInviteResult[];
}> {
  console.log('=== MEMULAI PENGIRIMAN UNDANGAN & RESET KATA SANDI STAF ===\n');

  const sqlite = getDatabase();
  const users = sqlite.prepare(`
    SELECT u.id, u.name, u.email, u.role_id, r.name as role_name
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    ORDER BY u.id ASC
  `).all() as Array<{
    id: number;
    name: string;
    email: string;
    role_id: number;
    role_name: string;
  }>;

  console.log(`Ditemukan ${users.length} staf terdaftar untuk proses undangan Supabase Auth.\n`);

  const results: StaffInviteResult[] = [];
  const adminClient = getServiceSupabase();

  for (const user of users) {
    const role = user.role_name || (user.role_id === 1 ? 'head' : user.role_id === 2 ? 'admin' : 'staff');

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await adminClient.auth.admin.inviteUserByEmail(user.email, {
          data: {
            name: user.name,
            role,
            legacy_user_id: user.id
          },
          redirectTo: `https://dasbor-humas.pedulinegeri.org/set-ulang-kata-sandi?mode=reset`
        });

        if (error) {
          throw new Error(error.message);
        }

        console.log(`✓ Undangan dikirim ke [${role}] ${user.name} <${user.email}> (User ID: ${data.user.id})`);
        results.push({
          email: user.email,
          name: user.name,
          role,
          status: 'invited'
        });
      } catch (err: any) {
        console.warn(`✗ Gagal mengundang ${user.email}:`, err.message);
        results.push({
          email: user.email,
          name: user.name,
          role,
          status: 'error',
          error: err.message
        });
      }
    } else {
      // Mock / Offline dry-run verification
      const mockResetToken = `tok_${Math.random().toString(36).substring(2, 10)}`;
      const mockLink = `http://localhost:3000/set-ulang-kata-sandi?token=${mockResetToken}&email=${encodeURIComponent(user.email)}`;

      console.log(`✓ [Simulasi] Tautan reset disiapkan untuk [${role}] ${user.name} <${user.email}>`);
      results.push({
        email: user.email,
        name: user.name,
        role,
        status: 'mock_sent',
        resetLink: mockLink
      });
    }
  }

  const invitedCount = results.filter((r) => r.status === 'invited' || r.status === 'mock_sent').length;
  console.log(`\n=== RINGKASAN: ${invitedCount}/${users.length} UNDANGAN STAF SIAP TERKIRIM ===`);

  return {
    success: true,
    totalStaff: users.length,
    invitedCount,
    results
  };
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  inviteAllStaffMembers()
    .then((res) => {
      if (!res.success) process.exit(1);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

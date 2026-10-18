import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { db, initDatabase } from '@/lib/db';

initDatabase();

export const dynamic = 'force-dynamic';

async function processStaffInvites() {
  const users = db.prepare(`
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

  const results: any[] = [];
  const adminClient = getServiceSupabase();

  for (const user of users) {
    const role = user.role_name || (user.role_id === 1 ? 'head' : user.role_id === 2 ? 'admin' : 'staff');

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await adminClient.auth.admin.inviteUserByEmail(user.email, {
          data: {
            name: user.name,
            role,
            legacy_user_id: user.id,
          },
          redirectTo: `https://dasbor-humas.pedulinegeri.org/set-ulang-kata-sandi?mode=reset`,
        });

        if (error) throw new Error(error.message);

        results.push({
          email: user.email,
          name: user.name,
          role,
          status: 'invited',
          userId: data.user.id,
        });
      } catch (err: any) {
        results.push({
          email: user.email,
          name: user.name,
          role,
          status: 'error',
          error: err.message,
        });
      }
    } else {
      const mockResetToken = `tok_${Math.random().toString(36).substring(2, 10)}`;
      const mockLink = `http://localhost:3000/set-ulang-kata-sandi?token=${mockResetToken}&email=${encodeURIComponent(user.email)}`;
      results.push({
        email: user.email,
        name: user.name,
        role,
        status: 'mock_sent',
        resetLink: mockLink,
      });
    }
  }

  const invitedCount = results.filter((r) => r.status === 'invited' || r.status === 'mock_sent').length;

  return {
    success: true,
    totalStaff: users.length,
    invitedCount,
    results,
  };
}

/**
 * API route eksekusi alur reset kata sandi massal dan undangan staf ke Supabase Auth
 * Path: /api/admin/invite-staff
 */
export async function POST(req: NextRequest) {
  try {
    const result = await processStaffInvites();
    return NextResponse.json({
      success: true,
      message: `Proses alur reset kata sandi dan undangan staf selesai (${result.invitedCount}/${result.totalStaff} terproses).`,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal menjalankan proses undangan staf',
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}

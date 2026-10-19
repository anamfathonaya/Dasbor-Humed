'use client';

import React from 'react';
import type { UserRole } from '@/components/layout/LayoutContext';

export interface ChannelAdminActionGateProps {
  currentRole: UserRole;
  onChangeRole?: (role: UserRole) => void;
}

export function ChannelAdminActionGate({
  currentRole,
  onChangeRole
}: ChannelAdminActionGateProps) {
  const isAdminOrHead = currentRole === 'admin' || currentRole === 'head';

  return (
    <section
      className="dasbor__card"
      aria-label="Kontrol akses pengelolaan integrasi kanal"
      data-testid="channel-admin-action-gate"
      style={{
        padding: '0.85rem 1.25rem',
        background: isAdminOrHead
          ? 'rgba(16, 185, 129, 0.06)'
          : 'rgba(245, 158, 11, 0.08)',
        border: isAdminOrHead
          ? '1px solid rgba(16, 185, 129, 0.25)'
          : '1px solid rgba(245, 158, 11, 0.3)'
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.1rem' }} aria-hidden="true">
            {isAdminOrHead ? '🛡️' : '🔒'}
          </span>
          <div>
            <strong style={{ fontSize: '0.88rem', display: 'block' }}>
              {isAdminOrHead
                ? `Mode Pengelola Aktif (${currentRole === 'head' ? 'Kepala Humas' : 'Admin Teknis'})`
                : 'Mode Baca-Saja untuk Anggota Tim (Staf Konten)'}
            </strong>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-muted, #5a6875)' }}>
              {isAdminOrHead
                ? 'Anda memiliki izin penuh untuk menyambungkan OAuth, menyegarkan token, dan memutuskan sambungan kanal.'
                : 'Seluruh tombol aksi mutasi integrasi (Sambung OAuth, Segarkan Izin, Putuskan Sambungan) disembunyikan bagi non-admin.'}
            </span>
          </div>
        </div>

        {onChangeRole && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-muted, #64748b)' }}>
              Uji Peran:
            </span>
            {(
              [
                { id: 'admin', label: 'Admin Teknis' },
                { id: 'head', label: 'Kepala Humas' },
                { id: 'staff', label: 'Staf (Non-Admin)' }
              ] as const
            ).map((r) => (
              <button
                key={r.id}
                type="button"
                data-testid={`role-switch-${r.id}`}
                onClick={() => onChangeRole(r.id)}
                className={`dasbor__btn ${currentRole === r.id ? 'dasbor__btn--primary' : ''}`}
                style={{ minHeight: '28px', padding: '0 10px', fontSize: '11px' }}
              >
                {r.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default ChannelAdminActionGate;

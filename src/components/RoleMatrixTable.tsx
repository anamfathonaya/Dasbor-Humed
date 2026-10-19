'use client';

import React, { useState } from 'react';
import { mockPermissions } from '@/lib/clientDataFetcher';

export interface RoleMatrixTableProps {
  editable?: boolean;
  onPermissionChange?: (key: string, role: string, value: boolean) => void;
}

interface ModuleGroup {
  moduleName: string;
  icon: string;
  permissions: typeof mockPermissions;
}

export default function RoleMatrixTable({
  editable = false,
  onPermissionChange
}: RoleMatrixTableProps) {
  const [permissions, setPermissions] = useState(mockPermissions);

  const groupedPermissions: ModuleGroup[] = [
    {
      moduleName: 'Manajemen Konten & Publikasi',
      icon: '📝',
      permissions: permissions.filter((p) => p.key.startsWith('content'))
    },
    {
      moduleName: 'Laporan, Program & Anggaran (RAB/LRA)',
      icon: '💰',
      permissions: permissions.filter((p) => p.key.startsWith('budget'))
    },
    {
      moduleName: 'Basis Pengetahuan & Repositori SOP',
      icon: '📚',
      permissions: permissions.filter((p) => p.key.startsWith('knowledge'))
    },
    {
      moduleName: 'Sistem, Integrasi DAM & Keamanan Audit',
      icon: '🛡️',
      permissions: permissions.filter(
        (p) => p.key.startsWith('system') || p.key.startsWith('audit')
      )
    }
  ];

  const handleCheckboxChange = (key: string, role: 'head' | 'admin' | 'staff' | 'reviewer', value: boolean) => {
    setPermissions((prev) =>
      prev.map((perm) => (perm.key === key ? { ...perm, [role]: value } : perm))
    );
    if (onPermissionChange) {
      onPermissionChange(key, role, value);
    }
  };

  return (
    <div className="matrix-card">
      <div className="matrix-header">
        <div className="matrix-title-wrap">
          <span className="matrix-icon">⚖️</span>
          <div>
            <h3>Matriks Hak Akses & Pembagian Wewenang (RBAC)</h3>
            <p className="muted">
              Penerapan prinsip hak istimewa terkecil (Least Privilege) lintas peran dalam ekosistem Dasbor Humas Media.
            </p>
          </div>
        </div>
        <div className="matrix-badge-legend">
          <span className="legend-item">
            <span className="legend-dot green" />
            Diizinkan
          </span>
          <span className="legend-item">
            <span className="legend-dot gray" />
            Dibatasi
          </span>
        </div>
      </div>

      <div className="table-wrap">
        <table className="matrix-table">
          <thead>
            <tr>
              <th style={{ minWidth: '320px' }}>Modul & Fungsi Operasional</th>
              <th className="th-center">
                <div className="role-th">
                  <span className="role-badge role-head">Head</span>
                  <span className="role-title">Ketua Bidang</span>
                </div>
              </th>
              <th className="th-center">
                <div className="role-th">
                  <span className="role-badge role-admin">Admin</span>
                  <span className="role-title">Admin Teknis</span>
                </div>
              </th>
              <th className="th-center">
                <div className="role-th">
                  <span className="role-badge role-staff">Staff</span>
                  <span className="role-title">Staf Konten</span>
                </div>
              </th>
              <th className="th-center">
                <div className="role-th">
                  <span className="role-badge role-reviewer">Reviewer</span>
                  <span className="role-title">Peninjau Redaksi</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {groupedPermissions.map((group) => (
              <React.Fragment key={group.moduleName}>
                <tr className="group-header-row">
                  <td colSpan={5}>
                    <span className="group-title">
                      {group.icon} {group.moduleName}
                    </span>
                  </td>
                </tr>
                {group.permissions.map((perm) => (
                  <tr className="perm-row" key={perm.key}>
                    <td className="perm-info">
                      <strong className="perm-label">{perm.label}</strong>
                      <span className="perm-desc">{perm.description}</span>
                    </td>
                    <td className="td-center">
                      {editable ? (
                        <input
                          type="checkbox"
                          checked={perm.head}
                          className="matrix-cb"
                          onChange={(e) => handleCheckboxChange(perm.key, 'head', e.target.checked)}
                          aria-label={`Head: ${perm.label}`}
                        />
                      ) : (
                        <span className={`status-icon ${perm.head ? 'granted' : 'denied'}`}>
                          {perm.head ? '✓ Diizinkan' : '✕ Dibatasi'}
                        </span>
                      )}
                    </td>
                    <td className="td-center">
                      {editable ? (
                        <input
                          type="checkbox"
                          checked={perm.admin}
                          className="matrix-cb"
                          onChange={(e) => handleCheckboxChange(perm.key, 'admin', e.target.checked)}
                          aria-label={`Admin: ${perm.label}`}
                        />
                      ) : (
                        <span className={`status-icon ${perm.admin ? 'granted' : 'denied'}`}>
                          {perm.admin ? '✓ Diizinkan' : '✕ Dibatasi'}
                        </span>
                      )}
                    </td>
                    <td className="td-center">
                      {editable ? (
                        <input
                          type="checkbox"
                          checked={perm.staff}
                          className="matrix-cb"
                          onChange={(e) => handleCheckboxChange(perm.key, 'staff', e.target.checked)}
                          aria-label={`Staff: ${perm.label}`}
                        />
                      ) : (
                        <span className={`status-icon ${perm.staff ? 'granted' : 'denied'}`}>
                          {perm.staff ? '✓ Diizinkan' : '✕ Dibatasi'}
                        </span>
                      )}
                    </td>
                    <td className="td-center">
                      {editable ? (
                        <input
                          type="checkbox"
                          checked={perm.reviewer}
                          className="matrix-cb"
                          onChange={(e) => handleCheckboxChange(perm.key, 'reviewer', e.target.checked)}
                          aria-label={`Reviewer: ${perm.label}`}
                        />
                      ) : (
                        <span className={`status-icon ${perm.reviewer ? 'granted' : 'denied'}`}>
                          {perm.reviewer ? '✓ Diizinkan' : '✕ Dibatasi'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .matrix-card {
          background: var(--color-surface, #111315);
          border: 1px solid var(--color-border, #303236);
          border-radius: 6px;
          overflow: hidden;
        }
        .matrix-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.15rem 1.25rem;
          border-bottom: 1px solid var(--color-border, #303236);
          flex-wrap: wrap;
          gap: 1rem;
          background: var(--color-surface-sunken, #090a0c);
        }
        .matrix-title-wrap {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .matrix-icon {
          font-size: 1.35rem;
        }
        .matrix-title-wrap h3 {
          margin: 0 0 0.2rem;
          font-size: 1rem;
          color: var(--color-text, #ffffff);
        }
        .muted {
          margin: 0;
          color: var(--color-text-muted, #a1a1aa);
          font-size: 0.82rem;
        }
        .matrix-badge-legend {
          display: flex;
          gap: 1rem;
          font-size: 0.78rem;
          color: var(--color-text-muted, #a1a1aa);
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .legend-dot.green {
          background: #10b981;
        }
        .legend-dot.gray {
          background: #71717a;
        }
        .table-wrap {
          overflow-x: auto;
        }
        .matrix-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.85rem;
        }
        .matrix-table th {
          background: var(--color-surface-sunken, #090a0c);
          padding: 0.85rem 1rem;
          border-bottom: 1px solid var(--color-border, #303236);
          vertical-align: bottom;
          color: var(--color-text, #ffffff);
        }
        .th-center,
        .td-center {
          text-align: center;
        }
        .role-th {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }
        .role-badge {
          padding: 0.15rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        .role-head {
          background: rgba(99, 102, 241, 0.16);
          color: #a5b4fc;
          border: 1px solid rgba(99, 102, 241, 0.3);
        }
        .role-admin {
          background: rgba(59, 130, 246, 0.16);
          color: #93c5fd;
          border: 1px solid rgba(59, 130, 246, 0.3);
        }
        .role-staff {
          background: #27272a;
          color: #e4e4e7;
          border: 1px solid #3f3f46;
        }
        .role-reviewer {
          background: rgba(245, 158, 11, 0.16);
          color: #fcd34d;
          border: 1px solid rgba(245, 158, 11, 0.3);
        }
        .role-title {
          font-size: 0.75rem;
          color: var(--color-text-muted, #a1a1aa);
          font-weight: 600;
        }
        .group-header-row td {
          background: var(--color-surface-sunken, #090a0c);
          padding: 0.6rem 1rem;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-muted, #a1a1aa);
          border-top: 1px solid var(--color-border, #303236);
          border-bottom: 1px solid var(--color-border, #303236);
        }
        .perm-row td {
          padding: 0.85rem 1rem;
          border-bottom: 1px solid var(--color-border, #303236);
          vertical-align: middle;
        }
        .perm-row:hover td {
          background: rgba(255, 255, 255, 0.02);
        }
        .perm-label {
          display: block;
          color: var(--color-text, #ffffff);
          font-size: 0.88rem;
        }
        .perm-desc {
          display: block;
          color: var(--color-text-muted, #a1a1aa);
          font-size: 0.78rem;
          margin-top: 0.15rem;
        }
        .status-icon {
          display: inline-block;
          padding: 0.25rem 0.65rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .status-icon.granted {
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        .status-icon.denied {
          background: #18181b;
          color: #a1a1aa;
          border: 1px solid #27272a;
        }
        .matrix-cb {
          width: 18px;
          height: 18px;
          accent-color: #10b981;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

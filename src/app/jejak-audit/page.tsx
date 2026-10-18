'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { HumasShell } from '@/components/layout/HumasShell';
import { StandardPagePattern } from '@/components/layout/StandardPagePattern';
import { useLayout } from '@/components/layout/LayoutContext';
import { mockAuditLogs } from '@/lib/clientDataFetcher';

const extendedAuditLogs = [
  ...mockAuditLogs,
  {
    id: 'aud-104',
    timestamp: '11 Okt 2026, 11:20 WIB',
    userName: 'Budi Santoso',
    userRole: 'Administrator Teknis',
    action: 'Penambahan Pemetaan Folder DAM',
    target: 'smb://192.168.1.200/dam-humas/audio-arsip',
    ipAddress: '192.168.1.45 (Jaringan Kantor)',
    status: 'success'
  },
  {
    id: 'aud-103',
    timestamp: '10 Okt 2026, 16:45 WIB',
    userName: 'Rani Maulida',
    userRole: 'Ketua Bidang Humas',
    action: 'Perubahan Matriks Izin RBAC',
    target: 'Modul Anggaran: Pembatasan Akses Staf Konten',
    ipAddress: '180.252.16.89 (VPN Eksternal)',
    status: 'success'
  },
  {
    id: 'aud-102',
    timestamp: '10 Okt 2026, 09:12 WIB',
    userName: 'Dewi Lestari',
    userRole: 'Staf Kreatif & Konten',
    action: 'Pembaruan Profil & Kontak Pribadi',
    target: 'dewi.creative@pedulinegeri.org',
    ipAddress: '192.168.1.88 (Jaringan Kantor)',
    status: 'success'
  },
  {
    id: 'aud-101',
    timestamp: '09 Okt 2026, 22:18 WIB',
    userName: 'Sistem Keamanan Firewall',
    userRole: 'Otomatisasi',
    action: 'Blokir Percobaan Brute-Force',
    target: 'IP: 103.111.45.12 (Upaya 5x Salah Sandi)',
    ipAddress: '103.111.45.12 (Luar Negeri)',
    status: 'warning'
  }
];

export default function JejakAuditPage() {
  const { currentRole } = useLayout();
  const [searchQuery, setSearchQuery] = useState('');

  // Pembatasan akses: Hanya Head dan Admin yang dapat melihat jejak audit
  if (currentRole === 'staff') {
    return (
      <HumasShell
        pageTitle="Jejak Audit Keamanan"
        pageSubtitle="Rekam jejak tidak dapat diubah (immutable audit trail) · 2026"
      >
        <div
          style={{
            padding: '3rem',
            textAlign: 'center',
            background: 'var(--color-surface, #ffffff)',
            borderRadius: '8px',
            border: '1px solid var(--color-border, #e2e8f0)'
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔒</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#b91c1c', margin: '0 0 0.5rem' }}>
            Akses Terbatas (403 Forbidden)
          </h2>
          <p style={{ color: 'var(--color-muted, #64748b)', maxWidth: '480px', margin: '0 auto' }}>
            Jejak audit keamanan hanya dapat diakses oleh Kepala Humas atau Admin Teknis.
          </p>
        </div>
      </HumasShell>
    );
  }

  const filteredLogs = extendedAuditLogs.filter((log) => {
    return (
      !searchQuery ||
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.target.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <HumasShell
      pageTitle="Jejak Audit Keamanan"
      pageSubtitle="Rekam jejak tidak dapat diubah (immutable audit trail) untuk setiap modifikasi parameter sistem & otorisasi · 2026"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Link href="/pengaturan" className="dasbor__btn">
            Pengaturan Sistem
          </Link>
          <Link href="/jejak-audit" className="dasbor__btn dasbor__btn--primary">
            Jejak Audit Keamanan
          </Link>
        </div>

        <StandardPagePattern
          title="Jejak Audit & Rekam Aktivitas"
          subtitle="Catatan riwayat aktivitas operasional dan keamanan sistem"
          statusBarText={
            <span>
              <b>Integritas Audit:</b> Rekam audit disimpan secara permanen dengan enkripsi dan aturan RLS PostgreSQL ketat.
            </span>
          }
          searchPlaceholder="Cari pengguna, aksi, IP address..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          totalCountText={`Menampilkan ${filteredLogs.length} catatan audit`}
          renderTable={() => (
            <article className="dasbor__card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="dasbor__table-wrap">
                <table className="dasbor__table">
                  <thead>
                    <tr>
                      <th scope="col" style={{ width: '150px' }}>Waktu Kejadian</th>
                      <th scope="col" style={{ width: '180px' }}>Pelaku / Petugas</th>
                      <th scope="col">Aksi & Objek Sasaran</th>
                      <th scope="col" style={{ width: '160px' }}>Alamat IP</th>
                      <th scope="col" style={{ width: '110px', textAlign: 'center' }}>Hasil</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log) => (
                      <tr key={log.id}>
                        <td style={{ fontSize: '0.82rem', color: 'var(--color-muted, #64748b)' }}>
                          {log.timestamp}
                        </td>
                        <td>
                          <strong style={{ fontSize: '0.88rem', color: 'var(--color-text, #0f172a)' }}>
                            {log.userName}
                          </strong>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-muted, #64748b)' }}>
                            {log.userRole}
                          </span>
                        </td>
                        <td>
                          <strong style={{ fontSize: '0.88rem' }}>{log.action}</strong>
                          <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--color-muted, #64748b)' }}>
                            Target: {log.target}
                          </p>
                        </td>
                        <td style={{ fontSize: '0.82rem', fontFamily: 'monospace' }}>
                          {log.ipAddress}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span
                            className={`dasbor__badge ${
                              log.status === 'success' ? 'dasbor__badge--up' : 'dasbor__badge--amber'
                            }`}
                            style={{ fontSize: '11px' }}
                          >
                            {log.status === 'success' ? 'Berhasil' : 'Peringatan'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          )}
        />
      </div>
    </HumasShell>
  );
}

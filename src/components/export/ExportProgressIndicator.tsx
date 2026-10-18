'use client';

import React from 'react';

export interface ExportProgressProps {
  progress?: number; // 0 to 100
  status?: 'idle' | 'processing' | 'split_needed' | 'completed' | 'error';
  totalRows?: number;
  maxChunkSize?: number;
  onSplitDownload?: () => void;
}

export function ExportProgressIndicator({
  progress = 65,
  status = 'split_needed',
  totalRows = 12500,
  maxChunkSize = 5000,
  onSplitDownload
}: ExportProgressProps) {
  return (
    <div className="dasbor__card" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>Progres Ekspor & Paginasi Laporan</h3>
        <span
          className={`dasbor__badge ${
            status === 'completed'
              ? 'dasbor__badge--up'
              : status === 'split_needed'
              ? 'dasbor__badge--amber'
              : 'dasbor__badge--blue'
          }`}
          style={{ fontSize: '11px' }}
        >
          {status === 'split_needed' ? 'Perlu Pemecahan Data' : `${progress}% Selesai`}
        </span>
      </div>

      <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.75rem' }}>
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: status === 'split_needed' ? '#f59e0b' : '#0369a1',
            transition: 'width 0.3s ease'
          }}
        />
      </div>

      {status === 'split_needed' && (
        <div
          style={{
            padding: '0.75rem',
            background: '#fffbeb',
            border: '1px solid #fef3c7',
            borderRadius: '6px',
            marginTop: '0.5rem'
          }}
        >
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.1rem' }}>⚠️</span>
            <div style={{ fontSize: '0.82rem', color: '#92400e' }}>
              <strong>Volume Data Melebihi Batas Eksekusi Vercel (10s/15s Timeout):</strong>
              <p style={{ margin: '4px 0 8px' }}>
                Total data ({totalRows.toLocaleString('id-ID')} baris) disarankan dipecah ke rentang kuartal atau kelipatan {maxChunkSize.toLocaleString('id-ID')} baris per berkas agar tidak terputus di tengah jalan.
              </p>
              <button
                type="button"
                className="dasbor__btn"
                style={{ fontSize: '0.8rem', background: '#d97706', color: '#fff', border: 'none' }}
                onClick={onSplitDownload || (() => alert('Mengunduh paket berkas terpecah (Bagian 1 dari 3)...'))}
              >
                Unduh Data Bertahap (Batch Split)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useMemo } from 'react';
import type { SocialProvider } from '@/lib/channelSampleData';
import type { SyncHistoryEntry } from './ScheduledMetricsSyncView';

export interface ChannelSyncHistoryTableProps {
  history: SyncHistoryEntry[];
  onRetrySync?: (provider: SocialProvider) => void;
}

export function ChannelSyncHistoryTable({
  history,
  onRetrySync
}: ChannelSyncHistoryTableProps) {
  const [providerFilter, setProviderFilter] = useState<'all' | SocialProvider>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed'>('all');
  const [triggerFilter, setTriggerFilter] = useState<'all' | 'scheduled_cron' | 'manual_one_click'>('all');

  const filteredEntries = useMemo(() => {
    return history.filter((item) => {
      if (providerFilter !== 'all' && item.provider !== providerFilter) return false;
      if (statusFilter === 'success' && item.status !== 'success') return false;
      if (statusFilter === 'failed' && item.status === 'success') return false;
      if (triggerFilter !== 'all' && item.triggerType !== triggerFilter) return false;
      return true;
    });
  }, [history, providerFilter, statusFilter, triggerFilter]);

  return (
    <article className="dasbor__card" data-testid="sync-history-section">
      <div className="dasbor__card-head">
        <div>
          <p className="dasbor__eyebrow">Log Audit Eksekusi Sinkronisasi</p>
          <h2 className="dasbor__card-title">Riwayat Penarikan Metrik Kanal</h2>
        </div>
        <span className="dasbor__badge">
          Menampilkan {filteredEntries.length} dari {history.length} catatan
        </span>
      </div>

      {/* Filter Bar Riwayat Penarikan */}
      <div
        data-testid="sync-history-filter-bar"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.85rem',
          padding: '0.65rem 0.85rem',
          borderRadius: '0.55rem',
          background: 'var(--color-surface-muted, #f8fafc)',
          border: '1px solid var(--color-border, #e2e8f0)'
        }}
      >
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--color-muted, #64748b)', marginRight: '0.25rem' }}>
            Kanal:
          </span>
          {(['all', 'youtube', 'instagram', 'facebook', 'tiktok'] as const).map((key) => (
            <button
              key={key}
              type="button"
              className={`dasbor__btn ${providerFilter === key ? 'dasbor__btn--primary' : ''}`}
              style={{ padding: '0.28rem 0.6rem', fontSize: '0.76rem' }}
              onClick={() => setProviderFilter(key)}
              data-testid={`history-filter-provider-${key}`}
            >
              {key === 'all' ? 'Semua Kanal' : key.toUpperCase()}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            aria-label="Filter status penarikan"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'success' | 'failed')}
            data-testid="history-filter-status"
            style={{
              padding: '0.32rem 0.6rem',
              borderRadius: '0.45rem',
              border: '1px solid var(--color-border, #cbd5e1)',
              fontSize: '0.78rem',
              background: 'var(--color-surface, #ffffff)'
            }}
          >
            <option value="all">Semua Status</option>
            <option value="success">Berhasil</option>
            <option value="failed">Gagal / Parsial</option>
          </select>

          <select
            aria-label="Filter jenis pemicu"
            value={triggerFilter}
            onChange={(e) => setTriggerFilter(e.target.value as 'all' | 'scheduled_cron' | 'manual_one_click')}
            data-testid="history-filter-trigger"
            style={{
              padding: '0.32rem 0.6rem',
              borderRadius: '0.45rem',
              border: '1px solid var(--color-border, #cbd5e1)',
              fontSize: '0.78rem',
              background: 'var(--color-surface, #ffffff)'
            }}
          >
            <option value="all">Semua Pemicu</option>
            <option value="scheduled_cron">Jadwal Cron Otomatis</option>
            <option value="manual_one_click">Tarik Sekali Klik Manual</option>
          </select>
        </div>
      </div>

      <div className="dasbor__table-wrap">
        <table className="dasbor__table">
          <thead>
            <tr>
              <th scope="col">Waktu Eksekusi</th>
              <th scope="col">Kanal</th>
              <th scope="col">Jenis Pemicu</th>
              <th scope="col">Durasi &amp; Baris</th>
              <th scope="col">Status</th>
              <th scope="col">Catatan Rincian</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '1.25rem', color: 'var(--color-muted, #64748b)' }}>
                  Tidak ada catatan riwayat penarikan yang cocok dengan filter aktif.
                </td>
              </tr>
            ) : (
              filteredEntries.map((item) => (
                <tr key={item.id} data-testid={`sync-history-row-${item.id}`}>
                  <td style={{ whiteSpace: 'nowrap', fontSize: '0.82rem' }}>{item.startedAt}</td>
                  <td>
                    <strong style={{ textTransform: 'uppercase', fontSize: '0.78rem' }}>{item.provider}</strong>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-muted, #64748b)' }}>
                      {item.channelName}
                    </div>
                  </td>
                  <td>
                    <span className="dasbor__badge">
                      {item.triggerType === 'manual_one_click'
                        ? 'Tarik Sekali Klik'
                        : item.triggerType === 'scheduled_cron'
                        ? 'Jadwal Cron'
                        : 'Penyegaran Token'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem' }}>
                    {item.durationMs} ms · {item.rowsUpserted} metrik
                  </td>
                  <td>
                    <span
                      className={`dasbor__badge ${
                        item.status === 'success' ? 'dasbor__badge--up' : 'dasbor__badge--warn'
                      }`}
                    >
                      {item.status === 'success' ? 'Berhasil' : 'Gagal / Parsial'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--color-muted, #475569)' }}>
                    <div>{item.message}</div>
                    {item.status !== 'success' && onRetrySync && (
                      <button
                        type="button"
                        className="dasbor__btn"
                        style={{ marginTop: '0.35rem', padding: '0.2rem 0.55rem', fontSize: '0.74rem' }}
                        onClick={() => onRetrySync(item.provider)}
                      >
                        Ulangi Tarik {item.provider.toUpperCase()}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </article>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { HumasShell } from '@/components/layout/HumasShell';
import Link from 'next/link';

interface VpsMetrics {
  serverId: string;
  serverName: string;
  cpuUsagePercent: number;
  ramUsagePercent: number;
  diskUsagePercent: number;
  loadAverage: [number, number, number];
  uptimeDisplay: string;
  online: boolean;
  services: Array<{ name: string; status: string }>;
}

interface CpanelMetrics {
  serverId: string;
  serverName: string;
  diskUsagePercent: number;
  bandwidthPercent: number;
  emailAccountsUsed: number;
  sslExpiringSoon: string[];
  uptime: boolean;
}

interface SynologyMetrics {
  nasId: string;
  nasName: string;
  storageUsagePercent: number;
  backupJobsSuccessful: number;
  backupJobsFailed: number;
  systemHealth: string;
  online: boolean;
}

export default function InfrastrukturPage() {
  const [vpsMetrics, setVpsMetrics] = useState<VpsMetrics[]>([]);
  const [cpanelMetrics, setCpanelMetrics] = useState<CpanelMetrics[]>([]);
  const [synologyMetrics, setSynologyMetrics] = useState<SynologyMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    loadInfrastructureMetrics();
  }, []);

  const loadInfrastructureMetrics = async () => {
    setLoading(true);
    try {
      const [vpsRes, cpanelRes, synologyRes] = await Promise.all([
        fetch('/api/infrastructure/vps'),
        fetch('/api/infrastructure/cpanel'),
        fetch('/api/infrastructure/synology'),
      ]);

      const vpsData = await vpsRes.json();
      const cpanelData = await cpanelRes.json();
      const synologyData = await synologyRes.json();

      if (vpsData.ok) setVpsMetrics(vpsData.metrics || []);
      if (cpanelData.ok) setCpanelMetrics(cpanelData.metrics || []);
      if (synologyData.ok) setSynologyMetrics(synologyData.metrics || []);

      setLastSync(new Date().toLocaleTimeString('id-ID'));
    } catch (error) {
      console.error('Failed to load infrastructure metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <HumasShell
      pageTitle="Infrastruktur & Hosting"
      pageSubtitle="Monitor VPS, cPanel, dan Synology NAS untuk operasional IT"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Status Bar */}
        <div className="dasbor__bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p className="dasbor__bar-text" style={{ margin: 0 }}>
            <b>Status Pemantauan:</b>{' '}
            {loading ? 'Memuat...' : `${vpsMetrics.length + cpanelMetrics.length + synologyMetrics.length} server terpantau`}
            {lastSync && ` • Sinkronisasi terakhir: ${lastSync}`}
          </p>
          <button
            type="button"
            className="dasbor__btn"
            onClick={loadInfrastructureMetrics}
            disabled={loading}
          >
            {/* @ts-ignore */}
            <iconify-icon icon={loading ? 'lucide:loader-2' : 'lucide:refresh-cw'} aria-hidden="true" />
            <span>{loading ? 'Memuat...' : 'Segarkan'}</span>
          </button>
        </div>

        {/* VPS Servers */}
        <section className="dasbor__card">
          <div className="dasbor__card-head">
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, margin: '0 0 0.25rem' }}>
                🖥️ VPS & Application Servers
              </h2>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-muted)' }}>
                CPU, RAM, disk, dan service health
              </p>
            </div>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-muted)' }}>Memuat metrik VPS...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
              {vpsMetrics.map(vps => (
                <div key={vps.serverId} className="dasbor__kpi-card">
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.95rem' }}>{vps.serverName}</strong>
                      <span className={`dasbor__badge ${vps.online ? 'dasbor__badge--green' : 'dasbor__badge--red'}`} style={{ fontSize: '10px' }}>
                        {vps.online ? 'Online' : 'Offline'}
                      </span>
                    </div>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                      Uptime: {vps.uptimeDisplay}
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span>CPU</span>
                        <span>{vps.cpuUsagePercent}%</span>
                      </div>
                      <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${vps.cpuUsagePercent}%`, background: vps.cpuUsagePercent > 80 ? '#ef4444' : '#0284c7' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span>RAM</span>
                        <span>{vps.ramUsagePercent}%</span>
                      </div>
                      <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${vps.ramUsagePercent}%`, background: vps.ramUsagePercent > 80 ? '#ef4444' : '#10b981' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span>Disk</span>
                        <span>{vps.diskUsagePercent}%</span>
                      </div>
                      <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${vps.diskUsagePercent}%`, background: vps.diskUsagePercent > 80 ? '#ef4444' : '#8b5cf6' }} />
                      </div>
                    </div>

                    <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border)' }}>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                        Load: {vps.loadAverage.map(l => l.toFixed(2)).join(' / ')}
                      </p>
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem' }}>
                        Services: {vps.services.filter(s => s.status === 'running').length}/{vps.services.length} running
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* cPanel Hosting */}
        <section className="dasbor__card">
          <div className="dasbor__card-head">
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, margin: '0 0 0.25rem' }}>
                🌐 cPanel Hosting
              </h2>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-muted)' }}>
                Disk, bandwidth, email, dan SSL certificates
              </p>
            </div>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-muted)' }}>Memuat metrik cPanel...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
              {cpanelMetrics.map(cpanel => (
                <div key={cpanel.serverId} className="dasbor__kpi-card">
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.95rem' }}>{cpanel.serverName}</strong>
                      <span className={`dasbor__badge ${cpanel.uptime ? 'dasbor__badge--green' : 'dasbor__badge--red'}`} style={{ fontSize: '10px' }}>
                        {cpanel.uptime ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span>Disk Usage</span>
                        <span>{cpanel.diskUsagePercent}%</span>
                      </div>
                      <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${cpanel.diskUsagePercent}%`, background: cpanel.diskUsagePercent > 80 ? '#ef4444' : '#0284c7' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span>Bandwidth</span>
                        <span>{cpanel.bandwidthPercent}%</span>
                      </div>
                      <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${cpanel.bandwidthPercent}%`, background: cpanel.bandwidthPercent > 80 ? '#ef4444' : '#10b981' }} />
                      </div>
                    </div>

                    <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border)' }}>
                      <p style={{ margin: 0, fontSize: '0.75rem' }}>
                        Email: {cpanel.emailAccountsUsed} accounts
                      </p>
                      {cpanel.sslExpiringSoon.length > 0 && (
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#f59e0b' }}>
                          ⚠️ {cpanel.sslExpiringSoon.length} SSL expiring soon
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Synology NAS */}
        <section className="dasbor__card">
          <div className="dasbor__card-head">
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, margin: '0 0 0.25rem' }}>
                💾 Synology NAS Storage
              </h2>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-muted)' }}>
                Storage capacity dan backup jobs
              </p>
            </div>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-muted)' }}>Memuat metrik NAS...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
              {synologyMetrics.map(nas => (
                <div key={nas.nasId} className="dasbor__kpi-card">
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.95rem' }}>{nas.nasName}</strong>
                      <span className={`dasbor__badge ${nas.online ? 'dasbor__badge--green' : 'dasbor__badge--red'}`} style={{ fontSize: '10px' }}>
                        {nas.online ? 'Online' : 'Offline'}
                      </span>
                    </div>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                      Health: {nas.systemHealth}
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span>Storage</span>
                        <span>{nas.storageUsagePercent}%</span>
                      </div>
                      <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${nas.storageUsagePercent}%`, background: nas.storageUsagePercent > 80 ? '#ef4444' : '#0284c7' }} />
                      </div>
                    </div>

                    <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border)' }}>
                      <p style={{ margin: 0, fontSize: '0.75rem' }}>
                        Backups: {nas.backupJobsSuccessful} successful
                      </p>
                      {nas.backupJobsFailed > 0 && (
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#ef4444' }}>
                          ⚠️ {nas.backupJobsFailed} failed
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Quick Links */}
        <section className="dasbor__card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>⚡ Akses Cepat</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
            <Link href="/pengaturan" className="dasbor__btn" style={{ justifyContent: 'flex-start' }}>
              {/* @ts-ignore */}
              <iconify-icon icon="lucide:settings" aria-hidden="true" />
              <span>Konfigurasi Server</span>
            </Link>
            <Link href="/jejak-audit" className="dasbor__btn" style={{ justifyContent: 'flex-start' }}>
              {/* @ts-ignore */}
              <iconify-icon icon="lucide:file-text" aria-hidden="true" />
              <span>Audit Log</span>
            </Link>
            <Link href="/dasbor" className="dasbor__btn" style={{ justifyContent: 'flex-start' }}>
              {/* @ts-ignore */}
              <iconify-icon icon="lucide:layout-dashboard" aria-hidden="true" />
              <span>Dasbor Utama</span>
            </Link>
          </div>
        </section>
      </div>
    </HumasShell>
  );
}

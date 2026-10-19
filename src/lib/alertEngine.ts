// ==============================================================================
// Alert Engine — evaluator threshold infrastruktur & meta tokens
// ==============================================================================
// Setiap fetch metrics dari infrastruktur (VPS, cPanel, Synology) dan
// sync Meta account, kita lewat sini untuk cek threshold.
// ==============================================================================

import { createAndDispatchNotification, NotificationCategory, NotificationSeverity } from './notificationService';

interface VpsAlertInput {
  serverId: string;
  serverName: string;
  cpuUsagePercent: number;
  ramUsagePercent: number;
  diskUsagePercent: number;
  online: boolean;
  services: Array<{ name: string; status: string }>;
}

interface CpanelAlertInput {
  serverId: string;
  serverName: string;
  diskUsagePercent: number;
  bandwidthPercent: number;
  sslExpiringSoon: string[];
  uptime: boolean;
}

interface SynologyAlertInput {
  nasId: string;
  nasName: string;
  storageUsagePercent: number;
  backupJobsFailed: number;
  online: boolean;
  systemHealth: string;
}

interface MetaTokenAlertInput {
  accountId: string;
  accountName: string;
  platform: 'instagram' | 'facebook';
  daysRemaining: number;
  expiresAt: string;
}

const DEFAULT_THRESHOLDS = {
  cpu: 85,
  ram: 90,
  disk: 85,
  bandwidth: 90,
  storage: 85,
  tokenExpiringDays: 7,
};

function severityFor(percent: number, threshold: number): NotificationSeverity {
  if (percent >= threshold + 10) return 'critical';
  if (percent >= threshold) return 'warning';
  return 'info';
}

function formatPercent(p: number): string {
  return `${p.toFixed(1)}%`;
}

/**
 * Evaluasi metrics VPS dan kirim alert jika lewat threshold.
 * Return: list alert yang dikirim.
 */
export async function evaluateVpsAlerts(input: VpsAlertInput): Promise<string[]> {
  const sent: string[] = [];
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  // CPU
  if (input.cpuUsagePercent >= DEFAULT_THRESHOLDS.cpu) {
    const severity = severityFor(input.cpuUsagePercent, DEFAULT_THRESHOLDS.cpu);
    await createAndDispatchNotification({
      category: 'infrastructure',
      severity,
      title: `CPU tinggi di ${input.serverName}`,
      message: `CPU ${formatPercent(input.cpuUsagePercent)} (threshold ${DEFAULT_THRESHOLDS.cpu}%). Server mungkin lambat.`,
      source: `vps:${input.serverId}`,
      metadata: { metric: 'cpu', value: input.cpuUsagePercent, threshold: DEFAULT_THRESHOLDS.cpu },
    });
    sent.push('cpu');
  }

  // RAM
  if (input.ramUsagePercent >= DEFAULT_THRESHOLDS.ram) {
    const severity = severityFor(input.ramUsagePercent, DEFAULT_THRESHOLDS.ram);
    await createAndDispatchNotification({
      category: 'infrastructure',
      severity,
      title: `RAM hampir penuh di ${input.serverName}`,
      message: `RAM ${formatPercent(input.ramUsagePercent)} (threshold ${DEFAULT_THRESHOLDS.ram}%). Risiko OOM.`,
      source: `vps:${input.serverId}`,
      metadata: { metric: 'ram', value: input.ramUsagePercent, threshold: DEFAULT_THRESHOLDS.ram },
    });
    sent.push('ram');
  }

  // Disk
  if (input.diskUsagePercent >= DEFAULT_THRESHOLDS.disk) {
    const severity = severityFor(input.diskUsagePercent, DEFAULT_THRESHOLDS.disk);
    await createAndDispatchNotification({
      category: 'infrastructure',
      severity,
      title: `Disk hampir penuh di ${input.serverName}`,
      message: `Disk ${formatPercent(input.diskUsagePercent)} (threshold ${DEFAULT_THRESHOLDS.disk}%). Segera cleanup atau tambah storage.`,
      source: `vps:${input.serverId}`,
      metadata: { metric: 'disk', value: input.diskUsagePercent, threshold: DEFAULT_THRESHOLDS.disk },
    });
    sent.push('disk');
  }

  // Service down
  const downServices = input.services.filter(s => s.status !== 'running');
  if (downServices.length > 0) {
    await createAndDispatchNotification({
      category: 'infrastructure',
      severity: 'critical',
      title: `${downServices.length} service down di ${input.serverName}`,
      message: `Service berikut tidak berjalan: ${downServices.map(s => s.name).join(', ')}`,
      source: `vps:${input.serverId}:services`,
      metadata: { downServices: downServices.map(s => s.name) },
    });
    sent.push('services');
  }

  // Offline
  if (!input.online) {
    await createAndDispatchNotification({
      category: 'infrastructure',
      severity: 'critical',
      title: `${input.serverName} tidak dapat dijangkau`,
      message: `Server offline. SSH/API timeout. Cek konektivitas dan status hardware.`,
      source: `vps:${input.serverId}:status`,
    });
    sent.push('offline');
  }

  return sent;
}

/**
 * Evaluasi metrics cPanel — disk, bandwidth, SSL.
 */
export async function evaluateCpanelAlerts(input: CpanelAlertInput): Promise<string[]> {
  const sent: string[] = [];

  if (input.diskUsagePercent >= DEFAULT_THRESHOLDS.disk) {
    const severity = severityFor(input.diskUsagePercent, DEFAULT_THRESHOLDS.disk);
    await createAndDispatchNotification({
      category: 'infrastructure',
      severity,
      title: `Disk cPanel ${input.serverName} hampir penuh`,
      message: `Disk usage ${formatPercent(input.diskUsagePercent)} (threshold ${DEFAULT_THRESHOLDS.disk}%)`,
      source: `cpanel:${input.serverId}:disk`,
    });
    sent.push('disk');
  }

  if (input.bandwidthPercent >= DEFAULT_THRESHOLDS.bandwidth) {
    const severity = severityFor(input.bandwidthPercent, DEFAULT_THRESHOLDS.bandwidth);
    await createAndDispatchNotification({
      category: 'infrastructure',
      severity,
      title: `Bandwidth cPanel ${input.serverName} hampir habis`,
      message: `Bandwidth ${formatPercent(input.bandwidthPercent)} (threshold ${DEFAULT_THRESHOLDS.bandwidth}%)`,
      source: `cpanel:${input.serverId}:bandwidth`,
    });
    sent.push('bandwidth');
  }

  if (input.sslExpiringSoon.length > 0) {
    await createAndDispatchNotification({
      category: 'infrastructure',
      severity: 'warning',
      title: `${input.sslExpiringSoon.length} SSL certificate akan kedaluwarsa`,
      message: `Domain: ${input.sslExpiringSoon.join(', ')}. Segera perpanjang sebelum habis.`,
      source: `cpanel:${input.serverId}:ssl`,
    });
    sent.push('ssl');
  }

  if (!input.uptime) {
    await createAndDispatchNotification({
      category: 'infrastructure',
      severity: 'critical',
      title: `cPanel ${input.serverName} tidak dapat dijangkau`,
      message: 'Server hosting tidak merespons. Cek status dan tiket support jika perlu.',
      source: `cpanel:${input.serverId}:status`,
    });
    sent.push('offline');
  }

  return sent;
}

/**
 * Evaluasi Synology — storage, backup failure, health.
 */
export async function evaluateSynologyAlerts(input: SynologyAlertInput): Promise<string[]> {
  const sent: string[] = [];

  if (input.storageUsagePercent >= DEFAULT_THRESHOLDS.storage) {
    const severity = severityFor(input.storageUsagePercent, DEFAULT_THRESHOLDS.storage);
    await createAndDispatchNotification({
      category: 'infrastructure',
      severity,
      title: `Storage Synology ${input.nasName} hampir penuh`,
      message: `Storage ${formatPercent(input.storageUsagePercent)} (threshold ${DEFAULT_THRESHOLDS.storage}%)`,
      source: `synology:${input.nasId}:storage`,
    });
    sent.push('storage');
  }

  if (input.backupJobsFailed > 0) {
    await createAndDispatchNotification({
      category: 'infrastructure',
      severity: 'critical',
      title: `${input.backupJobsFailed} backup job gagal di ${input.nasName}`,
      message: `Cek Hyper Backup / Cloud Sync / Snapshot Replication. Backup terakhir tidak sukses.`,
      source: `synology:${input.nasId}:backup`,
    });
    sent.push('backup');
  }

  if (input.systemHealth !== 'normal' && input.systemHealth !== 'healthy') {
    await createAndDispatchNotification({
      category: 'infrastructure',
      severity: 'warning',
      title: `Synology ${input.nasName} health: ${input.systemHealth}`,
      message: `Periksa DSM → System Health untuk detail.`,
      source: `synology:${input.nasId}:health`,
    });
    sent.push('health');
  }

  if (!input.online) {
    await createAndDispatchNotification({
      category: 'infrastructure',
      severity: 'critical',
      title: `Synology ${input.nasName} offline`,
      message: 'NAS tidak merespons. Cek power, network, dan DSM service.',
      source: `synology:${input.nasId}:status`,
    });
    sent.push('offline');
  }

  return sent;
}

/**
 * Evaluasi Meta token expiry (Instagram & Facebook).
 */
export async function evaluateMetaTokenAlert(input: MetaTokenAlertInput): Promise<boolean> {
  if (input.daysRemaining > DEFAULT_THRESHOLDS.tokenExpiringDays) {
    return false;
  }

  const severity: NotificationSeverity = input.daysRemaining <= 3 ? 'critical' : 'warning';
  const platformLabel = input.platform === 'instagram' ? 'Instagram' : 'Facebook';

  await createAndDispatchNotification({
    category: 'oauth_token',
    severity,
    title: `Token ${platformLabel} akan kedaluwarsa`,
    message: `Akun ${input.accountName} sisa ${input.daysRemaining} hari. Hubungkan ulang sebelum ${input.expiresAt}.`,
    source: `meta:${input.platform}:${input.accountId}`,
    metadata: { daysRemaining: input.daysRemaining, expiresAt: input.expiresAt },
  });

  return true;
}

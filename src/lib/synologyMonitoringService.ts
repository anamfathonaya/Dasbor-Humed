/**
 * Synology NAS Infrastructure Monitoring Service
 * Monitor storage capacity, file sharing, backup jobs, user access
 */

export interface SynologyNAS {
  id: string;
  name: string;
  hostname: string;
  port: number; // Default 5000 (HTTP) or 5001 (HTTPS)
  username: string;
  monitored: boolean;
}

export interface SynologyMetrics {
  nasId: string;
  nasName: string;

  // Storage
  storageUsedTb: number;
  storageTotalTb: number;
  storageUsagePercent: number;

  // Storage pools
  pools: SynologyStoragePool[];

  // File sharing
  activeConnections: number;
  sharedFolders: number;

  // Backup jobs
  backupJobsTotal: number;
  backupJobsSuccessful: number;
  backupJobsFailed: number;
  lastBackupAt: string;

  // System health
  systemHealth: 'normal' | 'warning' | 'critical';
  temperature: number; // Celsius

  // Status
  online: boolean;
  lastChecked: string;
}

export interface SynologyStoragePool {
  name: string;
  usedTb: number;
  totalTb: number;
  usagePercent: number;
  status: 'healthy' | 'degraded' | 'crashed';
  raidType: string;
}

export interface SynologyBackupJob {
  id: string;
  name: string;
  type: 'hyper_backup' | 'cloud_sync' | 'snapshot_replication';
  destination: string;
  schedule: string;
  lastRun: string;
  lastStatus: 'success' | 'warning' | 'failed';
  nextRun: string;
  sizeGb: number;
}

export interface SynologyUserAccess {
  username: string;
  lastLoginAt: string;
  ipAddress: string;
  activeSession: boolean;
}

/**
 * Fetch Synology NAS metrics via DSM API
 */
export async function fetchSynologyMetrics(nas: SynologyNAS): Promise<SynologyMetrics> {
  // In production, would call Synology DSM Web API:
  // POST /webapi/entry.cgi?api=SYNO.Core.System&method=info
  // POST /webapi/entry.cgi?api=SYNO.Storage.CGI.Storage&method=load_info

  const totalTb = 24; // 24TB NAS
  const usedTb = Math.random() * 15 + 8; // 8-23TB used

  return {
    nasId: nas.id,
    nasName: nas.name,

    storageUsedTb: parseFloat(usedTb.toFixed(2)),
    storageTotalTb: totalTb,
    storageUsagePercent: Math.round((usedTb / totalTb) * 100),

    pools: [
      {
        name: 'Storage Pool 1',
        usedTb: parseFloat((usedTb * 0.7).toFixed(2)),
        totalTb: 16,
        usagePercent: Math.round((usedTb * 0.7 / 16) * 100),
        status: 'healthy',
        raidType: 'RAID 6',
      },
      {
        name: 'Storage Pool 2',
        usedTb: parseFloat((usedTb * 0.3).toFixed(2)),
        totalTb: 8,
        usagePercent: Math.round((usedTb * 0.3 / 8) * 100),
        status: 'healthy',
        raidType: 'RAID 1',
      },
    ],

    activeConnections: Math.floor(Math.random() * 8) + 2,
    sharedFolders: 12,

    backupJobsTotal: 5,
    backupJobsSuccessful: 4,
    backupJobsFailed: 1,
    lastBackupAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19), // 3 hours ago

    systemHealth: 'normal',
    temperature: Math.floor(Math.random() * 10) + 38, // 38-48°C

    online: true,
    lastChecked: new Date().toISOString().replace('T', ' ').substring(0, 19),
  };
}

/**
 * Get backup job details
 */
export async function fetchSynologyBackupJobs(nas: SynologyNAS): Promise<SynologyBackupJob[]> {
  // In production: SYNO.Backup API

  const now = new Date();

  return [
    {
      id: 'backup-01',
      name: 'Daily Incremental to Cloud',
      type: 'hyper_backup',
      destination: 'Google Drive (Institutional)',
      schedule: 'Setiap hari 02:00 WIB',
      lastRun: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19),
      lastStatus: 'success',
      nextRun: new Date(now.getTime() + 21 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19),
      sizeGb: 245.8,
    },
    {
      id: 'backup-02',
      name: 'Weekly Full Backup',
      type: 'hyper_backup',
      destination: 'External USB Drive',
      schedule: 'Setiap Minggu 01:00 WIB',
      lastRun: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19),
      lastStatus: 'success',
      nextRun: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19),
      sizeGb: 1842.3,
    },
    {
      id: 'backup-03',
      name: 'Snapshot Replication',
      type: 'snapshot_replication',
      destination: 'Synology C2 Storage',
      schedule: 'Setiap 6 jam',
      lastRun: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19),
      lastStatus: 'failed',
      nextRun: new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19),
      sizeGb: 89.2,
    },
  ];
}

/**
 * Get user access logs
 */
export async function fetchSynologyUserAccess(nas: SynologyNAS): Promise<SynologyUserAccess[]> {
  // In production: SYNO.Core.CurrentConnection API

  const now = new Date();

  return [
    {
      username: 'admin.humas',
      lastLoginAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19),
      ipAddress: '192.168.1.105',
      activeSession: true,
    },
    {
      username: 'tim.media',
      lastLoginAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19),
      ipAddress: '192.168.1.87',
      activeSession: false,
    },
    {
      username: 'backup.service',
      lastLoginAt: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19),
      ipAddress: '192.168.1.201',
      activeSession: false,
    },
  ];
}

/**
 * Test NAS connection
 */
export async function testSynologyConnection(nas: SynologyNAS): Promise<{
  ok: boolean;
  message: string;
  latencyMs?: number;
  dsmVersion?: string;
}> {
  // In production: SYNO.API.Info query

  const startTime = Date.now();
  await new Promise(resolve => setTimeout(resolve, 120 + Math.random() * 180));
  const latencyMs = Date.now() - startTime;

  return {
    ok: true,
    message: `Connected to ${nas.name} successfully`,
    latencyMs,
    dsmVersion: 'DSM 7.2-64570',
  };
}

/**
 * Get default monitored NAS devices
 */
export function getDefaultSynologyNAS(): SynologyNAS[] {
  return [
    {
      id: 'nas-01',
      name: 'Synology DS1821+ (Archive)',
      hostname: 'nas.kemensos.local',
      port: 5001,
      username: 'admin',
      monitored: true,
    },
  ];
}

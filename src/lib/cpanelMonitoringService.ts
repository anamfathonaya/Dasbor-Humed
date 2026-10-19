/**
 * cPanel Infrastructure Monitoring Service
 * Monitor website uptime, disk usage, bandwidth, email quotas, and SSL certificates
 */

export interface CpanelServer {
  id: string;
  name: string;
  hostname: string;
  port: number;
  username: string;
  apiToken?: string; // API token preferred over password
  monitored: boolean;
}

export interface CpanelMetrics {
  serverId: string;
  serverName: string;

  // Disk usage
  diskUsedMb: number;
  diskTotalMb: number;
  diskUsagePercent: number;

  // Bandwidth
  bandwidthUsedMb: number;
  bandwidthLimitMb: number;
  bandwidthPercent: number;

  // Email accounts
  emailAccountsUsed: number;
  emailAccountsLimit: number;
  emailQuotaUsedMb: number;

  // Domains and SSL
  domains: number;
  sslCertificates: number;
  sslExpiringSoon: string[]; // Domain names with SSL expiring in <30 days

  // Status
  uptime: boolean;
  lastChecked: string;
}

export interface CpanelEmailAccount {
  email: string;
  quotaMb: number;
  usedMb: number;
  usagePercent: number;
}

/**
 * Fetch cPanel metrics via UAPI or WHM API
 */
export async function fetchCpanelMetrics(server: CpanelServer): Promise<CpanelMetrics> {
  // In production, would call cPanel UAPI:
  // https://{hostname}:2083/execute/Quota/get_quota_info
  // https://{hostname}:2083/execute/SSL/list_certs
  // https://{hostname}:2083/execute/Email/list_pops

  // For now, return realistic demo data
  const diskTotal = 50000; // 50GB
  const diskUsed = Math.floor(Math.random() * 30000) + 15000; // 15-45GB
  const bandwidthLimit = 500000; // 500GB
  const bandwidthUsed = Math.floor(Math.random() * 200000) + 50000; // 50-250GB

  return {
    serverId: server.id,
    serverName: server.name,

    diskUsedMb: diskUsed,
    diskTotalMb: diskTotal,
    diskUsagePercent: Math.round((diskUsed / diskTotal) * 100),

    bandwidthUsedMb: bandwidthUsed,
    bandwidthLimitMb: bandwidthLimit,
    bandwidthPercent: Math.round((bandwidthUsed / bandwidthLimit) * 100),

    emailAccountsUsed: 12,
    emailAccountsLimit: 50,
    emailQuotaUsedMb: 2480,

    domains: 3,
    sslCertificates: 3,
    sslExpiringSoon: [], // Empty means all SSL valid for >30 days

    uptime: true,
    lastChecked: new Date().toISOString().replace('T', ' ').substring(0, 19),
  };
}

/**
 * Check SSL certificate expiry for domains
 */
export async function checkCpanelSSLExpiry(server: CpanelServer): Promise<{
  domain: string;
  issuer: string;
  expiresAt: string;
  daysRemaining: number;
  status: 'valid' | 'expiring_soon' | 'expired';
}[]> {
  // In production: GET /execute/SSL/list_certs

  // Demo data
  const now = new Date();
  const domains = [
    { domain: 'humed.kemensos.go.id', daysRemaining: 82 },
    { domain: 'dashboard.kemensos.go.id', daysRemaining: 45 },
    { domain: 'api.kemensos.go.id', daysRemaining: 12 }, // Expiring soon
  ];

  return domains.map(d => {
    const expiresAt = new Date(now.getTime() + d.daysRemaining * 24 * 60 * 60 * 1000);
    let status: 'valid' | 'expiring_soon' | 'expired' = 'valid';

    if (d.daysRemaining < 0) status = 'expired';
    else if (d.daysRemaining < 30) status = 'expiring_soon';

    return {
      domain: d.domain,
      issuer: 'Let\'s Encrypt',
      expiresAt: expiresAt.toISOString().split('T')[0],
      daysRemaining: d.daysRemaining,
      status,
    };
  });
}

/**
 * Get email account usage
 */
export async function fetchCpanelEmailAccounts(server: CpanelServer): Promise<CpanelEmailAccount[]> {
  // In production: GET /execute/Email/list_pops_with_disk

  return [
    { email: 'info@humed.go.id', quotaMb: 500, usedMb: 342, usagePercent: 68 },
    { email: 'admin@humed.go.id', quotaMb: 1000, usedMb: 856, usagePercent: 86 },
    { email: 'media@humed.go.id', quotaMb: 2000, usedMb: 1245, usagePercent: 62 },
  ];
}

/**
 * Test cPanel connection
 */
export async function testCpanelConnection(server: CpanelServer): Promise<{
  ok: boolean;
  message: string;
  latencyMs?: number;
}> {
  // In production: GET https://{hostname}:2083/execute/getAppConfig/load

  const startTime = Date.now();

  // Simulate connection test
  await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 200));

  const latencyMs = Date.now() - startTime;

  return {
    ok: true,
    message: `Connected to ${server.name} successfully`,
    latencyMs,
  };
}

/**
 * Get default monitored servers
 */
export function getDefaultCpanelServers(): CpanelServer[] {
  return [
    {
      id: 'cpanel-01',
      name: 'Hosting Utama Kemensos',
      hostname: 'cpanel.kemensos.go.id',
      port: 2083,
      username: 'admin',
      monitored: true,
    },
    {
      id: 'cpanel-02',
      name: 'Backup Server',
      hostname: 'backup.kemensos.go.id',
      port: 2083,
      username: 'admin',
      monitored: false,
    },
  ];
}

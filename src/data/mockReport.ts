export const reportChannels = ['Semua Kanal', 'Instagram', 'TikTok', 'YouTube', 'Website', 'Donasi', 'Iklan Meta'];
export const reportPeriods = [
  { value: '7d', label: '7 Hari Terakhir' },
  { value: '30d', label: '30 Hari Terakhir' },
  { value: '90d', label: '90 Hari Terakhir' },
];

export interface PerfRow {
  channel: string;
  period: string;
  reach: number;
  engagement: number;
  conversions: number;
  delta: number; // % perubahan vs periode sebelumnya
}

export const mockPerformance: PerfRow[] = [
  { channel: 'Instagram', period: '7d', reach: 48200, engagement: 3100, conversions: 85, delta: 6.2 },
  { channel: 'Instagram', period: '30d', reach: 192000, engagement: 12800, conversions: 340, delta: 9.8 },
  { channel: 'Instagram', period: '90d', reach: 540000, engagement: 35400, conversions: 910, delta: 14.1 },
  { channel: 'TikTok', period: '7d', reach: 91000, engagement: 7400, conversions: 40, delta: 18.5 },
  { channel: 'TikTok', period: '30d', reach: 365000, engagement: 29800, conversions: 160, delta: 22.3 },
  { channel: 'TikTok', period: '90d', reach: 980000, engagement: 81000, conversions: 420, delta: 31.0 },
  { channel: 'YouTube', period: '7d', reach: 15400, engagement: 1200, conversions: 22, delta: -2.1 },
  { channel: 'YouTube', period: '30d', reach: 66000, engagement: 5100, conversions: 95, delta: 3.4 },
  { channel: 'YouTube', period: '90d', reach: 188000, engagement: 14600, conversions: 270, delta: 5.9 },
  { channel: 'Website', period: '7d', reach: 12100, engagement: 4300, conversions: 130, delta: 4.0 },
  { channel: 'Website', period: '30d', reach: 51000, engagement: 18200, conversions: 520, delta: 7.7 },
  { channel: 'Website', period: '90d', reach: 149000, engagement: 52000, conversions: 1480, delta: 11.2 },
  { channel: 'Donasi', period: '7d', reach: 8300, engagement: 2100, conversions: 210, delta: 12.0 },
  { channel: 'Donasi', period: '30d', reach: 34000, engagement: 8700, conversions: 860, delta: 15.4 },
  { channel: 'Donasi', period: '90d', reach: 97000, engagement: 24000, conversions: 2350, delta: 19.8 },
  { channel: 'Iklan Meta', period: '7d', reach: 120000, engagement: 5200, conversions: 150, delta: -4.8 },
  { channel: 'Iklan Meta', period: '30d', reach: 470000, engagement: 21000, conversions: 640, delta: 1.9 },
  { channel: 'Iklan Meta', period: '90d', reach: 1300000, engagement: 59000, conversions: 1720, delta: 6.3 },
];

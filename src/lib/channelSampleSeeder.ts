/**
 * Layanan Penyedia Data Contoh & Seeder untuk 4 Kanal Media Sosial Utama
 * (Instagram, Facebook, TikTok, YouTube)
 */

import { db, initDatabase } from './db';

export interface FourChannelSeedRecord {
  name: string;
  platform: 'instagram' | 'facebook' | 'tiktok' | 'youtube';
  handle: string;
  followers_count: number;
  status: string;
  platform_url: string;
  external_account_id: string;
  last_synced_at: string;
  last_health_check: string;
  daily_metrics: Array<{
    metric_date: string;
    followers_count: number;
    views_count: number;
    interactions_count: number;
    reach: number;
    impressions: number;
    engagement: number;
    followers_gained: number;
    conversions: number;
    clicks: number;
    shares: number;
    engagement_rate: number;
  }>;
}

export const FOUR_CHANNEL_SAMPLE_SEED: FourChannelSeedRecord[] = [
  {
    name: 'Instagram Resmi Humas',
    platform: 'instagram',
    handle: '@pedulinegeri_id',
    followers_count: 45200,
    status: 'connected',
    platform_url: 'https://instagram.com/pedulinegeri_id',
    external_account_id: 'ig_pedulinegeri_01',
    last_synced_at: '2026-10-19 08:30:00',
    last_health_check: '2026-10-19 08:30:00',
    daily_metrics: [
      { metric_date: '2026-10-13', followers_count: 44810, views_count: 138400, interactions_count: 7920, reach: 112000, impressions: 138400, engagement: 7920, followers_gained: 65, conversions: 21, clicks: 1420, shares: 610, engagement_rate: 5.72 },
      { metric_date: '2026-10-14', followers_count: 44890, views_count: 145200, interactions_count: 8240, reach: 118500, impressions: 145200, engagement: 8240, followers_gained: 80, conversions: 24, clicks: 1510, shares: 645, engagement_rate: 5.67 },
      { metric_date: '2026-10-15', followers_count: 44960, views_count: 141800, interactions_count: 8010, reach: 115400, impressions: 141800, engagement: 8010, followers_gained: 70, conversions: 19, clicks: 1460, shares: 620, engagement_rate: 5.65 },
      { metric_date: '2026-10-16', followers_count: 45020, views_count: 151000, interactions_count: 8650, reach: 124000, impressions: 151000, engagement: 8650, followers_gained: 60, conversions: 28, clicks: 1620, shares: 690, engagement_rate: 5.73 },
      { metric_date: '2026-10-17', followers_count: 45090, views_count: 148600, interactions_count: 8410, reach: 121200, impressions: 148600, engagement: 8410, followers_gained: 70, conversions: 25, clicks: 1580, shares: 670, engagement_rate: 5.66 },
      { metric_date: '2026-10-18', followers_count: 45150, views_count: 146900, interactions_count: 8390, reach: 119800, impressions: 146900, engagement: 8390, followers_gained: 60, conversions: 23, clicks: 1560, shares: 660, engagement_rate: 5.71 },
      { metric_date: '2026-10-19', followers_count: 45200, views_count: 152400, interactions_count: 8800, reach: 125600, impressions: 152400, engagement: 8800, followers_gained: 50, conversions: 31, clicks: 1690, shares: 715, engagement_rate: 5.77 }
    ]
  },
  {
    name: 'Halaman Resmi Yayasan Peduli Negeri',
    platform: 'facebook',
    handle: 'Yayasan Peduli Negeri',
    followers_count: 62800,
    status: 'connected',
    platform_url: 'https://facebook.com/pedulinegeri.id',
    external_account_id: 'fb_pedulinegeri_01',
    last_synced_at: '2026-10-19 08:20:00',
    last_health_check: '2026-10-19 08:20:00',
    daily_metrics: [
      { metric_date: '2026-10-13', followers_count: 62490, views_count: 98500, interactions_count: 4320, reach: 81200, impressions: 98500, engagement: 4320, followers_gained: 45, conversions: 14, clicks: 890, shares: 380, engagement_rate: 4.39 },
      { metric_date: '2026-10-14', followers_count: 62540, views_count: 101200, interactions_count: 4490, reach: 83400, impressions: 101200, engagement: 4490, followers_gained: 50, conversions: 16, clicks: 920, shares: 405, engagement_rate: 4.44 },
      { metric_date: '2026-10-15', followers_count: 62600, views_count: 103400, interactions_count: 4580, reach: 85100, impressions: 103400, engagement: 4580, followers_gained: 60, conversions: 18, clicks: 950, shares: 415, engagement_rate: 4.43 },
      { metric_date: '2026-10-16', followers_count: 62650, views_count: 104800, interactions_count: 4610, reach: 86500, impressions: 104800, engagement: 4610, followers_gained: 50, conversions: 17, clicks: 960, shares: 425, engagement_rate: 4.40 },
      { metric_date: '2026-10-17', followers_count: 62710, views_count: 102900, interactions_count: 4520, reach: 84900, impressions: 102900, engagement: 4520, followers_gained: 60, conversions: 15, clicks: 940, shares: 410, engagement_rate: 4.39 },
      { metric_date: '2026-10-18', followers_count: 62760, views_count: 105600, interactions_count: 4690, reach: 87300, impressions: 105600, engagement: 4690, followers_gained: 50, conversions: 19, clicks: 980, shares: 435, engagement_rate: 4.44 },
      { metric_date: '2026-10-19', followers_count: 62800, views_count: 107780, interactions_count: 4750, reach: 89100, impressions: 107780, engagement: 4750, followers_gained: 40, conversions: 21, clicks: 1010, shares: 450, engagement_rate: 4.41 }
    ]
  },
  {
    name: 'Aksi Peduli Negeri',
    platform: 'tiktok',
    handle: '@aksipedulinegeri',
    followers_count: 89000,
    status: 'connected',
    platform_url: 'https://tiktok.com/@aksipedulinegeri',
    external_account_id: 'tt_pedulinegeri_01',
    last_synced_at: '2026-10-19 08:15:00',
    last_health_check: '2026-10-19 08:15:00',
    daily_metrics: [
      { metric_date: '2026-10-13', followers_count: 87400, views_count: 175000, interactions_count: 12100, reach: 148000, impressions: 175000, engagement: 12100, followers_gained: 240, conversions: 12, clicks: 1850, shares: 1120, engagement_rate: 6.91 },
      { metric_date: '2026-10-14', followers_count: 87680, views_count: 184200, interactions_count: 12890, reach: 156000, impressions: 184200, engagement: 12890, followers_gained: 280, conversions: 15, clicks: 1980, shares: 1210, engagement_rate: 7.00 },
      { metric_date: '2026-10-15', followers_count: 87950, views_count: 191000, interactions_count: 13420, reach: 162500, impressions: 191000, engagement: 13420, followers_gained: 270, conversions: 16, clicks: 2060, shares: 1280, engagement_rate: 7.03 },
      { metric_date: '2026-10-16', followers_count: 88210, views_count: 189400, interactions_count: 13250, reach: 161000, impressions: 189400, engagement: 13250, followers_gained: 260, conversions: 14, clicks: 2020, shares: 1250, engagement_rate: 7.00 },
      { metric_date: '2026-10-17', followers_count: 88500, views_count: 196800, interactions_count: 13910, reach: 167800, impressions: 196800, engagement: 13910, followers_gained: 290, conversions: 18, clicks: 2150, shares: 1340, engagement_rate: 7.07 },
      { metric_date: '2026-10-18', followers_count: 88790, views_count: 201100, interactions_count: 14180, reach: 171500, impressions: 201100, engagement: 14180, followers_gained: 290, conversions: 19, clicks: 2210, shares: 1390, engagement_rate: 7.05 },
      { metric_date: '2026-10-19', followers_count: 89000, views_count: 203000, interactions_count: 14460, reach: 173200, impressions: 203000, engagement: 14460, followers_gained: 210, conversions: 22, clicks: 2280, shares: 1420, engagement_rate: 7.12 }
    ]
  },
  {
    name: 'Peduli Negeri TV',
    platform: 'youtube',
    handle: '@PeduliNegeriTV',
    followers_count: 185000,
    status: 'connected',
    platform_url: 'https://youtube.com/@PeduliNegeriTV',
    external_account_id: 'UC_PeduliNegeriTV_01',
    last_synced_at: '2026-10-19 08:35:00',
    last_health_check: '2026-10-19 08:35:00',
    daily_metrics: [
      { metric_date: '2026-10-13', followers_count: 183900, views_count: 91200, interactions_count: 5490, reach: 76500, impressions: 91200, engagement: 5490, followers_gained: 180, conversions: 11, clicks: 1120, shares: 490, engagement_rate: 6.02 },
      { metric_date: '2026-10-14', followers_count: 184120, views_count: 94600, interactions_count: 5710, reach: 79400, impressions: 94600, engagement: 5710, followers_gained: 220, conversions: 13, clicks: 1180, shares: 515, engagement_rate: 6.04 },
      { metric_date: '2026-10-15', followers_count: 184300, views_count: 96800, interactions_count: 5840, reach: 81200, impressions: 96800, engagement: 5840, followers_gained: 180, conversions: 14, clicks: 1210, shares: 530, engagement_rate: 6.03 },
      { metric_date: '2026-10-16', followers_count: 184490, views_count: 98100, interactions_count: 5930, reach: 82500, impressions: 98100, engagement: 5930, followers_gained: 190, conversions: 15, clicks: 1240, shares: 545, engagement_rate: 6.04 },
      { metric_date: '2026-10-17', followers_count: 184680, views_count: 99400, interactions_count: 6020, reach: 83800, impressions: 99400, engagement: 6020, followers_gained: 190, conversions: 16, clicks: 1270, shares: 560, engagement_rate: 6.06 },
      { metric_date: '2026-10-18', followers_count: 184850, views_count: 100500, interactions_count: 6110, reach: 84900, impressions: 100500, engagement: 6110, followers_gained: 170, conversions: 17, clicks: 1290, shares: 575, engagement_rate: 6.08 },
      { metric_date: '2026-10-19', followers_count: 185000, views_count: 102300, interactions_count: 6250, reach: 86400, impressions: 102300, engagement: 6250, followers_gained: 150, conversions: 19, clicks: 1330, shares: 595, engagement_rate: 6.11 }
    ]
  }
];

export function ensureFourChannelsSeeded(): {
  seededChannels: number;
  seededDailyRows: number;
} {
  initDatabase();
  let seededChannels = 0;
  let seededDailyRows = 0;

  try {
    const upsertChannel = db.prepare(`
      INSERT INTO social_channels (
        name, platform, handle, followers_count, status,
        platform_url, external_account_id, last_synced_at, last_health_check
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const upsertDaily = db.prepare(`
      INSERT OR REPLACE INTO channel_daily_metrics (
        channel_id, platform, metric_date, reach, impressions, engagement,
        followers_gained, conversions, clicks, shares,
        followers_count, views_count, interactions_count, engagement_rate
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const item of FOUR_CHANNEL_SAMPLE_SEED) {
      let existing = db
        .prepare('SELECT id FROM social_channels WHERE platform = ? LIMIT 1')
        .get(item.platform) as { id: number } | undefined;

      let channelId: number;
      if (!existing) {
        const res = upsertChannel.run(
          item.name,
          item.platform,
          item.handle,
          item.followers_count,
          item.status,
          item.platform_url,
          item.external_account_id,
          item.last_synced_at,
          item.last_health_check
        );
        channelId = Number(res.lastInsertRowid);
        seededChannels++;
      } else {
        channelId = existing.id;
      }

      for (const dm of item.daily_metrics) {
        upsertDaily.run(
          channelId,
          item.platform,
          dm.metric_date,
          dm.reach,
          dm.impressions,
          dm.engagement,
          dm.followers_gained,
          dm.conversions,
          dm.clicks,
          dm.shares,
          dm.followers_count,
          dm.views_count,
          dm.interactions_count,
          dm.engagement_rate
        );
        seededDailyRows++;
      }
    }
  } catch (err) {
    console.warn('[channelSampleSeeder] Warning during seed:', err);
  }

  return { seededChannels, seededDailyRows };
}

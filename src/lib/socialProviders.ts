/**
 * Fondasi Integrasi Kanal Media Sosial: Interface Provider & Stub Platform
 * Mendukung 4 Platform Utama: Meta (Instagram & Facebook), YouTube, TikTok, dan Telegram
 */

export interface ChannelProfile {
  id: string;
  name: string;
  handle: string;
  followersCount: number;
  platformUrl: string;
  avatarUrl?: string;
}

export interface MetricSyncResult {
  reach: number;
  impressions: number;
  engagement: number;
  followersGained: number;
  conversions: number;
  clicks: number;
  shares: number;
  period: string;
}

export interface SocialMediaProvider {
  platform: 'instagram' | 'facebook' | 'youtube' | 'tiktok' | 'telegram';
  authenticate(): Promise<{ authUrl: string; state: string }>;
  handleCallback(code: string, state?: string): Promise<{ token: string; profile: ChannelProfile }>;
  fetchProfile(token: string): Promise<ChannelProfile>;
  syncMetrics(token: string, date: string): Promise<MetricSyncResult>;
  verifyWebhook(payload: any, signature: string): boolean;
}

/**
 * 1. Meta Provider Stub (Instagram & Facebook)
 */
export class MetaProviderStub implements SocialMediaProvider {
  platform = 'instagram' as const;

  async authenticate() {
    return {
      authUrl: 'https://www.facebook.com/v18.0/dialog/oauth?client_id=MOCK_META_ID&redirect_uri=mock',
      state: 'state_meta_mock',
    };
  }

  async handleCallback(code: string) {
    return {
      token: `meta_token_${code}_${Date.now()}`,
      profile: {
        id: 'meta-inst-01',
        name: 'Instagram Resmi Humas',
        handle: '@pedulinegeri_id',
        followersCount: 45200,
        platformUrl: 'https://instagram.com/pedulinegeri_id',
      },
    };
  }

  async fetchProfile(_token: string): Promise<ChannelProfile> {
    return {
      id: 'meta-inst-01',
      name: 'Instagram Resmi Humas',
      handle: '@pedulinegeri_id',
      followersCount: 45200,
      platformUrl: 'https://instagram.com/pedulinegeri_id',
    };
  }

  async syncMetrics(_token: string, period: string): Promise<MetricSyncResult> {
    return {
      reach: 28500,
      impressions: 42000,
      engagement: 3850,
      followersGained: 140,
      conversions: 45,
      clicks: 820,
      shares: 310,
      period,
    };
  }

  verifyWebhook(_payload: any, _signature: string): boolean {
    return true;
  }
}

/**
 * 2. YouTube Provider Stub
 */
export class YouTubeProviderStub implements SocialMediaProvider {
  platform = 'youtube' as const;

  async authenticate() {
    return {
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth?client_id=MOCK_YT_ID&redirect_uri=mock',
      state: 'state_yt_mock',
    };
  }

  async handleCallback(code: string) {
    return {
      token: `yt_token_${code}_${Date.now()}`,
      profile: {
        id: 'yt-chan-01',
        name: 'Peduli Negeri TV',
        handle: '@PeduliNegeriTV',
        followersCount: 185000,
        platformUrl: 'https://youtube.com/@PeduliNegeriTV',
      },
    };
  }

  async fetchProfile(_token: string): Promise<ChannelProfile> {
    return {
      id: 'yt-chan-01',
      name: 'Peduli Negeri TV',
      handle: '@PeduliNegeriTV',
      followersCount: 185000,
      platformUrl: 'https://youtube.com/@PeduliNegeriTV',
    };
  }

  async syncMetrics(_token: string, period: string): Promise<MetricSyncResult> {
    return {
      reach: 94000,
      impressions: 160000,
      engagement: 12400,
      followersGained: 420,
      conversions: 18,
      clicks: 2150,
      shares: 740,
      period,
    };
  }

  verifyWebhook(_payload: any, _signature: string): boolean {
    return true;
  }
}

/**
 * 3. TikTok Provider Stub
 */
export class TikTokProviderStub implements SocialMediaProvider {
  platform = 'tiktok' as const;

  async authenticate() {
    return {
      authUrl: 'https://www.tiktok.com/v2/auth/authorize/?client_key=MOCK_TIKTOK_KEY',
      state: 'state_tiktok_mock',
    };
  }

  async handleCallback(code: string) {
    return {
      token: `tiktok_token_${code}_${Date.now()}`,
      profile: {
        id: 'tiktok-01',
        name: 'Aksi Peduli Negeri',
        handle: '@aksipedulinegeri',
        followersCount: 89000,
        platformUrl: 'https://tiktok.com/@aksipedulinegeri',
      },
    };
  }

  async fetchProfile(_token: string): Promise<ChannelProfile> {
    return {
      id: 'tiktok-01',
      name: 'Aksi Peduli Negeri',
      handle: '@aksipedulinegeri',
      followersCount: 89000,
      platformUrl: 'https://tiktok.com/@aksipedulinegeri',
    };
  }

  async syncMetrics(_token: string, period: string): Promise<MetricSyncResult> {
    return {
      reach: 120000,
      impressions: 210000,
      engagement: 18900,
      followersGained: 680,
      conversions: 24,
      clicks: 1450,
      shares: 1200,
      period,
    };
  }

  verifyWebhook(_payload: any, _signature: string): boolean {
    return true;
  }
}

/**
 * 4. Telegram Channel Provider Stub
 */
export class TelegramProviderStub implements SocialMediaProvider {
  platform = 'telegram' as const;

  async authenticate() {
    return {
      authUrl: 'https://t.me/PeduliNegeriBot?start=auth',
      state: 'state_tg_mock',
    };
  }

  async handleCallback(code: string) {
    return {
      token: `tg_token_${code}_${Date.now()}`,
      profile: {
        id: 'tg-chan-01',
        name: 'Kanal Berita Bencana Humas',
        handle: '@pedulinegeri_news',
        followersCount: 12400,
        platformUrl: 'https://t.me/pedulinegeri_news',
      },
    };
  }

  async fetchProfile(_token: string): Promise<ChannelProfile> {
    return {
      id: 'tg-chan-01',
      name: 'Kanal Berita Bencana Humas',
      handle: '@pedulinegeri_news',
      followersCount: 12400,
      platformUrl: 'https://t.me/pedulinegeri_news',
    };
  }

  async syncMetrics(_token: string, period: string): Promise<MetricSyncResult> {
    return {
      reach: 11200,
      impressions: 15400,
      engagement: 1850,
      followersGained: 65,
      conversions: 12,
      clicks: 980,
      shares: 420,
      period,
    };
  }

  verifyWebhook(_payload: any, _signature: string): boolean {
    return true;
  }
}

export const socialMediaProviders = {
  instagram: new MetaProviderStub(),
  facebook: new MetaProviderStub(),
  youtube: new YouTubeProviderStub(),
  tiktok: new TikTokProviderStub(),
  telegram: new TelegramProviderStub(),
};

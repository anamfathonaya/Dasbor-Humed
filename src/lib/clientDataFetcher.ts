/**
 * Modul Pengambil Data Klien dengan Fallback Mock Lokal
 * 
 * Modul ini berfungsi sebagai client-side data fetcher yang tangguh (resilient):
 * - Mengambil data aktual dari rute API Astro (/api/*)
 * - Jika permintaan gagal (karena jaringan, status error, atau rute belum siap),
 *   secara otomatis menggunakan data tiruan (mock) lokal sebagai cadangan/fallback.
 * - Menyediakan helper seragam untuk seluruh entitas: Metrik, Kalender Konten, Proyek,
 *   Pantauan Berita, Insight, Pengetahuan, dan Anggaran.
 */

import {
  metricSections as mockMetricSections,
  socialChannels as mockSocialChannels,
  topPages as mockTopPages,
  trafficSources as mockTrafficSources,
  donationCampaigns as mockDonationCampaigns,
  adCampaigns as mockAdCampaigns,
  type MetricSection,
} from '../data/mockMetrics';

import {
  contentItems as mockContentItems,
  pillars as mockPillars,
  statusLabels as mockStatusLabels,
  reminderOptions as mockReminderOptions,
  type ContentItem,
  type ContentPillar,
} from '../data/mockContent';

import {
  mockProjects,
  stageLabels as mockStageLabels,
  type Project,
  type ProjectTask,
} from '../data/mockProjects';

import {
  mockNewsItems,
  curatedSources as mockCuratedSources,
  type NewsItem,
  type CuratedSource,
} from '../data/mockNews';

import {
  mockContentInsights,
  type ContentInsightItem,
} from '../data/mockInsights';

import {
  mockKnowledgeDocs,
  mockProposals,
  knowledgeCategories,
  type KnowledgeDoc,
  type DocumentProposal,
} from '../data/mockKnowledge';

import {
  mockBudgetLines,
  budgetCategories,
  budgetOwners,
  budgetQuarters,
  budgetYears,
  mockAnnualReportsByYear,
  type BudgetLine,
} from '../data/mockBudget';

export interface FetchOptions extends RequestInit {
  timeoutMs?: number;
  useMockFallback?: boolean;
}

/**
 * Fetch generic dengan penanganan timeout dan fallback otomatis.
 */
export async function fetchWithFallback<T>(
  url: string,
  fallbackData: T,
  options: FetchOptions = {}
): Promise<{ data: T; isMock: boolean; error?: string }> {
  const { timeoutMs = 4000, useMockFallback = true, ...init } = options;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        ...(init.headers || {}),
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const json = await response.json();
    const resultData = (json && typeof json === 'object' && 'data' in json) ? json.data : json;

    return {
      data: resultData as T,
      isMock: false,
    };
  } catch (err: any) {
    if (!useMockFallback) {
      throw err;
    }
    return {
      data: fallbackData,
      isMock: true,
      error: err?.message || 'Gagal memuat data dari API',
    };
  }
}

/* ==========================================================================
   METRIK & KINERJA
   ========================================================================== */

export async function fetchMetrics(options?: FetchOptions) {
  return fetchWithFallback('/api/metrics', {
    sections: mockMetricSections,
    socialChannels: mockSocialChannels,
    topPages: mockTopPages,
    trafficSources: mockTrafficSources,
    donationCampaigns: mockDonationCampaigns,
    adCampaigns: mockAdCampaigns,
  }, options);
}

export async function fetchSocialMetrics(options?: FetchOptions) {
  return fetchWithFallback('/api/metrics/social', mockSocialChannels, options);
}

export async function fetchDonationMetrics(options?: FetchOptions) {
  return fetchWithFallback('/api/metrics/donations', mockDonationCampaigns, options);
}

export async function fetchMetaAdsMetrics(options?: FetchOptions) {
  return fetchWithFallback('/api/metrics/meta-ads', mockAdCampaigns, options);
}

export async function fetchWebsiteMetrics(options?: FetchOptions) {
  return fetchWithFallback('/api/metrics/website', {
    topPages: mockTopPages,
    trafficSources: mockTrafficSources,
  }, options);
}

/* ==========================================================================
   KALENDER KONTEN & PILAR
   ========================================================================== */

export async function fetchContentItems(params?: { channel?: string; pillarId?: number; assigneeId?: number }, options?: FetchOptions) {
  let url = '/api/content';
  if (params) {
    const sp = new URLSearchParams();
    if (params.channel) sp.set('channel', params.channel);
    if (params.pillarId) sp.set('pillarId', String(params.pillarId));
    if (params.assigneeId) sp.set('assigneeId', String(params.assigneeId));
    const qs = sp.toString();
    if (qs) url += `?${qs}`;
  }
  return fetchWithFallback<ContentItem[]>(url, mockContentItems, options);
}

export async function fetchPillars(options?: FetchOptions) {
  return fetchWithFallback<ContentPillar[]>('/api/pillars', mockPillars, options);
}

/* ==========================================================================
   PAPAN PROYEK & TUGAS
   ========================================================================== */

export async function fetchProjects(options?: FetchOptions) {
  return fetchWithFallback<Project[]>('/api/projects', mockProjects, options);
}

export async function fetchProjectTasks(projectId?: number, options?: FetchOptions) {
  const url = projectId ? `/api/projects/tasks?projectId=${projectId}` : '/api/projects/tasks';
  const fallback = projectId
    ? mockProjects.find((p) => p.id === projectId)?.tasks || []
    : mockProjects.flatMap((p) => p.tasks);
  return fetchWithFallback<ProjectTask[]>(url, fallback, options);
}

/* ==========================================================================
   PANTAUAN BERITA & SUMBER
   ========================================================================== */

export async function fetchNewsStream(options?: FetchOptions) {
  return fetchWithFallback<NewsItem[]>('/api/news/stream', mockNewsItems, options);
}

export async function fetchNewsSources(options?: FetchOptions) {
  return fetchWithFallback<CuratedSource[]>('/api/news/sources', mockCuratedSources, options);
}

/* ==========================================================================
   INSIGHT KONTEN
   ========================================================================== */

export async function fetchContentInsights(options?: FetchOptions) {
  return fetchWithFallback<ContentInsightItem[]>('/api/insights/trends', mockContentInsights, options);
}

/* ==========================================================================
   BASIS PENGETAHUAN & USULAN
   ========================================================================== */

export async function fetchKnowledgeDocs(query?: string, options?: FetchOptions) {
  const url = query ? `/api/knowledge/docs?q=${encodeURIComponent(query)}` : '/api/knowledge/docs';
  return fetchWithFallback<KnowledgeDoc[]>(url, mockKnowledgeDocs, options);
}

export async function fetchKnowledgeProposals(options?: FetchOptions) {
  return fetchWithFallback<DocumentProposal[]>('/api/knowledge/proposals', mockProposals, options);
}

/* ==========================================================================
   LAPORAN & ANGGARAN (RAB & LRA)
   ========================================================================== */

export async function fetchBudgetReports(options?: FetchOptions) {
  return fetchWithFallback<BudgetLine[]>(
    '/api/reports/budget',
    mockBudgetLines,
    options
  );
}

// Re-export mock data & helper labels agar komponen klien tetap bisa mengakses opsi statis
export {
  mockMetricSections,
  mockSocialChannels,
  mockTopPages,
  mockTrafficSources,
  mockDonationCampaigns,
  mockAdCampaigns,
  mockContentItems,
  mockPillars,
  mockStatusLabels,
  mockReminderOptions,
  mockProjects,
  mockStageLabels,
  mockNewsItems,
  mockCuratedSources,
  mockContentInsights,
  mockKnowledgeDocs,
  mockProposals,
  knowledgeCategories,
  mockBudgetLines,
  budgetCategories,
  budgetOwners,
  budgetQuarters,
  budgetYears,
  mockAnnualReportsByYear,
  type KnowledgeDoc,
  type DocumentProposal,
};

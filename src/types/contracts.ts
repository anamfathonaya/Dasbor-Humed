/**
 * Kontrak dan Tipe Data Bersama untuk Dasbor Humas & Media
 * Digunakan lintas modul frontend (React/Next.js) dan backend (Route Handlers & Supabase/DB)
 */

// Peran Staf & Izin
export type RoleName = 'head' | 'admin' | 'staff' | 'reviewer';

export interface UserSession {
  id: number | string;
  name: string;
  email: string;
  role: RoleName;
  avatar_url?: string;
}

export interface PermissionMatrixItem {
  key: string;
  label: string;
  head: boolean;
  admin: boolean;
  staff: boolean;
  reviewer: boolean;
}

// 1. Modul Konten & Editorial
export type ContentStatus = 'draft' | 'review' | 'ready' | 'published';

export interface ContentItem {
  id: number | string;
  title: string;
  scheduled_at: string;
  channel: string;
  content_type: string;
  sub_type?: string;
  request_bidang?: string;
  pillar_id?: number | string;
  assignee_id?: number | string;
  status: ContentStatus;
  caption?: string;
  media_urls?: string[];
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ContentPillar {
  id: number | string;
  name: string;
  description?: string;
  color: string;
}

export interface ContentTheme {
  id: number | string;
  pillar_id: number | string;
  name: string;
  description?: string;
}

// 2. Modul Pemantauan Berita & Live Feed
export type NewsSourceType = 'telegram' | 'rss' | 'google_news' | 'manual';

export interface NewsItem {
  id: number | string;
  title: string;
  source_name: string;
  source_type: NewsSourceType;
  category: string;
  published_at: string;
  is_important: number | boolean;
  summary: string;
  url?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  created_at?: string;
}

export interface NewsSource {
  id: number | string;
  name: string;
  url: string;
  type: NewsSourceType;
  category: string;
  active: boolean | number;
  last_sync?: string;
}

// 3. Modul Manajemen Proyek & Tugas
export type TaskStage = 'backlog' | 'in_progress' | 'review' | 'done';

export interface ProjectTask {
  id: number | string;
  project_id: number | string;
  title: string;
  description?: string;
  stage: TaskStage;
  assignee_id?: number | string;
  due_date?: string;
  order_index?: number;
  created_at?: string;
}

export interface ProjectItem {
  id: number | string;
  title: string;
  description?: string;
  status: 'active' | 'completed' | 'on_hold';
  start_date?: string;
  end_date?: string;
  lead_id?: number | string;
  budget?: number;
  created_at?: string;
}

// 4. Modul Metrik, Performa & Anggaran
export interface ChannelMetric {
  id?: number | string;
  platform: string;
  date: string;
  reach: number;
  impressions: number;
  interactions: number;
  engagement_rate: number;
  spend?: number;
  conversions?: number;
}

export interface BudgetReportItem {
  id: number | string;
  title: string;
  program: string;
  rab: number;
  lra: number;
  realization_percentage: number;
  fiscal_year: number;
  status: 'draft' | 'approved' | 'final';
}

// 5. Modul Basis Pengetahuan & SOP
export interface KnowledgeDoc {
  id: number | string;
  title: string;
  slug: string;
  category: 'sop' | 'panduan' | 'kebijakan' | 'aset';
  content: string;
  author_id?: number | string;
  version: string;
  updated_at: string;
}

// 6. Response Wrapper Baku API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

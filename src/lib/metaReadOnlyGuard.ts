/**
 * Meta Read-Only Guard
 * 
 * Modul pengaman izin dan pemblokir endpoint operasional berisiko tinggi.
 * Sesuai batasan tegas PRD Pemantauan Kanal Media Sosial:
 * - TANPA penerbitan otomatis (Content Posting, Reels, Stories, Shorts publishing)
 * - TANPA WABA (WhatsApp Business API)
 * - TANPA Meta Ads / Marketing API (ads_management, ads_read, leadgen)
 * - TANPA Conversions API / Meta Pixel tracking
 * 
 * Seluruh permintaan ke endpoint/cakupan di atas HARUS ditolak tegas (HTTP 403 Forbidden).
 */

export const DISALLOWED_META_SCOPES = [
  'instagram_content_publish',
  'pages_manage_posts',
  'pages_manage_engagement',
  'publish_video',
  'publish_actions',
  'ads_management',
  'ads_read',
  'leads_retrieval',
  'whatsapp_business_management',
  'whatsapp_business_messaging'
];

export const DISALLOWED_OPERATION_PATTERNS = [
  /\/publish/i,
  /\/post/i,
  /\/feed/i,
  /\/reels/i,
  /\/stories/i,
  /\/ads/i,
  /\/adaccounts/i,
  /\/campaigns/i,
  /\/pixel/i,
  /\/events/i,
  /\/waba/i,
  /\/whatsapp/i
];

export interface GuardEvaluationResult {
  allowed: boolean;
  reason?: string;
  blockedItem?: string;
}

/**
 * Validasi kumpulan scope OAuth agar bersih dari scope publishing, ads, pixel, dan WABA.
 */
export function validateMetaReadOnlyScopes(scopes: string[]): GuardEvaluationResult {
  for (const scope of scopes) {
    const normalized = scope.toLowerCase().trim();
    if (DISALLOWED_META_SCOPES.includes(normalized)) {
      return {
        allowed: false,
        blockedItem: scope,
        reason: `Scope "${scope}" ditolak oleh kebijakan keamanan Humas Kemensos. Dasbor hanya beroperasi secara HANYA-BACA (Read-Only) dan menolak penerbitan otomatis, iklan/ads, pixel, serta WhatsApp Business API.`
      };
    }
  }

  return { allowed: true };
}

/**
 * Validasi URL request atau endpoint Graph API agar tidak memanggil operasi publishing, ads, pixel, atau WABA.
 */
export function validateMetaReadOnlyOperation(urlOrEndpoint: string, httpMethod: string = 'GET'): GuardEvaluationResult {
  const method = httpMethod.toUpperCase();

  // Operasi modifikasi data posting/iklan (POST, PUT, DELETE) ke Graph API mutlak diblokir
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    for (const pattern of DISALLOWED_OPERATION_PATTERNS) {
      if (pattern.test(urlOrEndpoint)) {
        return {
          allowed: false,
          blockedItem: urlOrEndpoint,
          reason: `Operasi ${method} ke endpoint "${urlOrEndpoint}" diblokir. Batasan tegas arsitektur melarang penerbitan otomatis, modul iklan/ads, Meta Pixel, dan WABA.`
        };
      }
    }
  }

  return { allowed: true };
}

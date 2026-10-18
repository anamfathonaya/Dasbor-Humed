import { NextRequest, NextResponse } from 'next/server';
import { db, initDatabase } from '@/lib/db';
import { supabase, isSupabaseConfigured, getServiceSupabase } from '@/lib/supabase';
import { socialMediaProviders } from '@/lib/socialProviders';

initDatabase();

export const dynamic = 'force-dynamic';

/**
 * Route Webhook Publik untuk Kanal Media Sosial (Meta, YouTube, TikTok, Telegram)
 * Path: /api/webhooks/channels/[platform]
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  try {
    const { platform } = await params;
    const { searchParams } = new URL(req.url);

    // Verifikasi Challenge Meta/Facebook/Instagram Webhook (hub.challenge)
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    if (mode === 'subscribe' && challenge) {
      const expectedToken = process.env.META_WEBHOOK_VERIFY_TOKEN || 'humas_webhook_token_2026';
      if (token === expectedToken) {
        return new NextResponse(challenge, { status: 200 });
      }
      return new NextResponse('Forbidden', { status: 403 });
    }

    return NextResponse.json({
      success: true,
      message: `Webhook endpoint untuk platform ${platform} aktif.`,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  try {
    const { platform } = await params;
    const rawBody = await req.text();
    let payload: any = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      payload = { raw: rawBody };
    }

    const signature = req.headers.get('x-hub-signature-256') || req.headers.get('x-signature') || '';
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

    // Verifikasi tanda tangan dengan provider stub
    const provider = (socialMediaProviders as any)[platform];
    const isSignatureValid = provider ? provider.verifyWebhook(payload, signature) : true;

    const eventType = payload.event || payload.entry?.[0]?.changes?.[0]?.field || 'notification';
    const status = isSignatureValid ? 'processed' : 'failed';
    const errorMessage = isSignatureValid ? null : 'Signature verification failed';

    // Catat ke tabel channel_webhook_logs
    if (isSupabaseConfigured) {
      const client = getServiceSupabase();
      await client.from('channel_webhook_logs').insert({
        platform,
        event_type: eventType,
        payload_json: JSON.stringify(payload),
        status,
        ip_address: ip,
        signature_verified: isSignatureValid,
        error_message: errorMessage,
        processed_at: new Date().toISOString(),
      });
    }

    try {
      db.prepare(`
        INSERT INTO channel_webhook_logs (
          platform, event_type, payload_json, status, ip_address, signature_verified, error_message, processed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).run(
        platform,
        eventType,
        JSON.stringify(payload),
        status,
        ip,
        isSignatureValid ? 1 : 0,
        errorMessage
      );
    } catch {}

    if (!isSignatureValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      message: `Webhook untuk platform ${platform} berhasil diterima dan dicatat.`,
      eventType,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

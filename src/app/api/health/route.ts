import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    app: 'Dasbor Humas & Media',
    version: 'Next.js 16 App Router',
    timestamp: new Date().toISOString(),
    routes: [
      '/api/health',
      '/api/news/stream',
      '/api/content',
      '/api/metrics',
      '/api/auth/session'
    ]
  });
}

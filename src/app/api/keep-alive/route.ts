export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma, { withRetry } from '@/lib/prisma';

/**
 * Эндпоинт для поддержания Neon DB в активном состоянии.
 * Вызывается автоматически Vercel Cron каждые 4 минуты.
 */
export async function GET() {
  try {
    const start = Date.now();
    await withRetry(() => prisma.booking.count());
    const ms = Date.now() - start;
    return NextResponse.json({ ok: true, latencyMs: ms, ts: new Date().toISOString() });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message }, { status: 500 });
  }
}

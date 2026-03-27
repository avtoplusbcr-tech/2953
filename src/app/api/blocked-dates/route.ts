import { NextResponse } from 'next/server';
import prisma, { withRetry } from '@/lib/prisma';

export async function GET() {
  try {
    const blockedDates = await withRetry(() => prisma.blockedDate.findMany());
    return NextResponse.json({ success: true, dates: blockedDates.map((d: any) => d.date) });
  } catch (error) {
    console.error('[GET /api/blocked-dates]', error);
    return NextResponse.json({ error: 'Failed to fetch blocked dates' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { date, reason } = await request.json();
    if (!date) return NextResponse.json({ error: 'Date is required' }, { status: 400 });

    const blocked = await withRetry(() => prisma.blockedDate.create({
      data: { date, reason },
    }));
    return NextResponse.json({ success: true, blocked });
  } catch (error) {
    console.error('[POST /api/blocked-dates]', error);
    return NextResponse.json({ error: 'Failed to block date' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { date } = await request.json();
    if (!date) return NextResponse.json({ error: 'Date is required' }, { status: 400 });

    await withRetry(() => prisma.blockedDate.delete({ where: { date } }));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/blocked-dates]', error);
    return NextResponse.json({ error: 'Failed to unblock date' }, { status: 500 });
  }
}

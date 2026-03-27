import { NextRequest, NextResponse } from 'next/server';
import prisma, { withRetry } from '@/lib/prisma';

// GET /api/slots?date=YYYY-MM-DD — занятые слоты на дату
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json({ error: 'Параметр date обязателен' }, { status: 400 });
    }

    const bookings = await withRetry(() =>
      prisma.booking.findMany({
        where: { date },
        select: { slotStart: true, slotEnd: true },
      })
    );

    return NextResponse.json({ bookedSlots: bookings });
  } catch (error) {
    console.error('[GET /api/slots]', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}


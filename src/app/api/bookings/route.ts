import { NextRequest, NextResponse } from 'next/server';
import prisma, { withRetry } from '@/lib/prisma';
import { sendNotification } from '@/lib/notifications';
import { appendRowToSheet } from '@/lib/googleSheets';
import { createCalendarEvent } from '@/lib/googleCalendar';
import { AXIS_PRICES } from '@/lib/constants';

// POST /api/bookings — создать запись
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerName, phone, carModel, problem, axes, date, slotStart, slotEnd, confirmation } = body;

    // Базовая валидация
    console.log('[POST /api/bookings] Проверка обязательных полей...');
    if (!customerName || !phone || !carModel || !axes || !date || !slotStart || !slotEnd || !confirmation) {
      return NextResponse.json({ error: 'Заполните все обязательные поля' }, { status: 400 });
    }

    // Проверка конфликта слотов
    console.log('[POST /api/bookings] Проверка конфликта слотов...');
    const conflict = await withRetry(() => prisma.booking.findFirst({
      where: {
        date,
        AND: [
          { slotStart: { lte: slotStart } },
          { slotEnd: { gt: slotStart } },
        ],
      },
    }));

    if (conflict) {
      console.log('[POST /api/bookings] Конфликт слотов обнаружен.');
      return NextResponse.json(
        { error: 'Это время уже занято. Пожалуйста, выберите другой слот.' },
        { status: 409 }
      );
    }

    console.log('[POST /api/bookings] Расчет стоимости...');
    const price = AXIS_PRICES[axes] ?? 5000;

    console.log('[POST /api/bookings] Создание записи в БД...');
    const booking = await withRetry(() => prisma.booking.create({
      data: {
        customerName,
        phone,
        carModel,
        problem: problem ?? '',
        axes,
        price,
        date,
        slotStart,
        slotEnd,
        confirmation,
      },
    }));
    console.log('[POST /api/bookings] Запись создана:', booking.id);

    // Отправка уведомления — НЕ блокирует ответ, ошибка не роняет запрос
    console.log('[POST /api/bookings] Попытка отправки уведомления (асинхронно)...');
    sendNotification(
      {
        customerName: booking.customerName,
        phone: booking.phone,
        date: booking.date,
        slotStart: booking.slotStart,
        slotEnd: booking.slotEnd,
        axes: booking.axes,
        price: booking.price,
        bookingId: booking.id,
      },
      confirmation as 'telegram' | 'sms'
    ).catch(err => console.error('[POST /api/bookings] Ошибка уведомления (не критично):', err));

    // Добавление в Google Таблицу (асинхронно)
    console.log('[POST /api/bookings] Запись в Google Sheets (асинхронно)...');
    const axesLabel = axes === 'both' ? 'Две оси' : axes === 'front' ? 'Передняя ось' : 'Задняя ось';
    const rowData = [
      booking.createdAt.toISOString().split('T')[0],
      booking.customerName,
      `'${booking.phone}`,
      booking.date,
      `${booking.slotStart} - ${booking.slotEnd}`,
      axesLabel,
      booking.price.toString(),
      booking.problem || '-',
      booking.confirmation,
      booking.carModel || '-'
    ];
    appendRowToSheet(rowData).catch(err => console.error('[POST /api/bookings] Ошибка записи в Google Sheets (не критично):', err));

    // Создание события в Google Календаре (асинхронно)
    console.log('[POST /api/bookings] Создание события в Google Календаре...');
    createCalendarEvent({
      customerName: booking.customerName,
      phone: booking.phone,
      carModel: booking.carModel ?? undefined,
      problem: booking.problem ?? undefined,
      axes: booking.axes,
      price: booking.price,
      date: booking.date,
      slotStart: booking.slotStart,
      slotEnd: booking.slotEnd,
    }).then(id => console.log('[Google Calendar] Событие создано:', id))
      .catch(err => console.error('[Google Calendar] Ошибка (не критично):', err?.message ?? err));

    console.log('[POST /api/bookings] Запрос успешно обработан, отправка ответа.');
    return NextResponse.json({ success: true, booking }, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/bookings] КРИТИЧЕСКАЯ ОШИБКА:', error);
    return NextResponse.json({ 
      error: 'Внутренняя ошибка сервера',
      // Временно показываем детали для диагностики
      debug: error?.message ?? String(error),
      code: error?.code,
      meta: error?.meta
    }, { status: 500 });
  }
}

// GET /api/bookings — получить все записи (для админки)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateFilter = searchParams.get('date');

    const bookings = await withRetry(() => prisma.booking.findMany({
      where: dateFilter ? { date: dateFilter } : undefined,
      orderBy: [{ date: 'asc' }, { slotStart: 'asc' }],
    }));

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('[GET /api/bookings]', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}

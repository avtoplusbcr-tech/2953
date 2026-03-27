import { google } from 'googleapis';

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || '';

function getAuth() {
  const creds = process.env.GOOGLE_CREDENTIALS;
  if (!creds) throw new Error('GOOGLE_CREDENTIALS не задан');
  const parsed = JSON.parse(creds);
  return new google.auth.GoogleAuth({
    credentials: parsed,
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });
}

export interface CalendarEventData {
  customerName: string;
  phone: string;
  carModel?: string;
  problem?: string;
  axes: string;
  price: number;
  date: string;        // "YYYY-MM-DD"
  slotStart: string;   // "HH:MM"
  slotEnd: string;     // "HH:MM"
}

export async function createCalendarEvent(data: CalendarEventData): Promise<string> {
  const auth = await getAuth();
  const calendar = google.calendar({ version: 'v3', auth });

  const axesLabel = data.axes === 'both' ? 'Две оси' : data.axes === 'front' ? 'Передняя ось' : 'Задняя ось';
  const carLabel = data.carModel ? ` (${data.carModel})` : '';

  const summary = `Вибростенд: ${data.customerName}${carLabel}`;
  const description = [
    `📞 Телефон: ${data.phone}`,
    `🚗 Авто: ${data.carModel || 'не указано'}`,
    `🔧 Проблема: ${data.problem || 'не указана'}`,
    `⚙️ Услуга: ${axesLabel}`,
    `💰 Цена: ${data.price} ₽`,
  ].join('\n');

  // Собираем ISO-дату с московским часовым поясом (UTC+3)
  const [startH, startM] = data.slotStart.split(':').map(Number);
  const [endH, endM] = data.slotEnd.split(':').map(Number);
  const [year, month, day] = data.date.split('-').map(Number);

  const startDateTime = new Date(Date.UTC(year, month - 1, day, startH - 3, startM));
  const endDateTime = new Date(Date.UTC(year, month - 1, day, endH - 3, endM));

  const event = await calendar.events.insert({
    calendarId: CALENDAR_ID,
    requestBody: {
      summary,
      description,
      start: { dateTime: startDateTime.toISOString(), timeZone: 'Europe/Moscow' },
      end:   { dateTime: endDateTime.toISOString(),   timeZone: 'Europe/Moscow' },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 60 },
          { method: 'popup', minutes: 10 },
        ],
      },
    },
  });

  return event.data.id || '';
}

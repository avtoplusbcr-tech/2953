// Заглушка функции отправки уведомлений
// В реальном проекте здесь будет интеграция с Telegram Bot API или SMS-сервисом

export interface BookingNotification {
  customerName: string;
  phone: string;
  date: string;
  slotStart: string;
  slotEnd: string;
  axes: string;
  price: number;
  bookingId: string;
}

export async function sendNotification(
  booking: BookingNotification,
  method: 'telegram' | 'sms'
): Promise<{ success: boolean; message: string }> {
  try {
    const axesLabel: Record<string, string> = {
      front: 'Передняя ось',
      rear: 'Задняя ось',
      both: 'Две оси',
    };

    // Красивый шаблон для клиента
    const message = `
🔧 Здравствуйте, ${booking.customerName}! 
Вы успешно записаны на диагностику вибростенда 2953.рф.

📅 Дата: ${booking.date.split('-').reverse().join('.')}
🕐 Время: ${booking.slotStart} – ${booking.slotEnd}
⚙️ Услуга: ${axesLabel[booking.axes] ?? booking.axes}
💰 Стоимость: ${booking.price.toLocaleString('ru-RU')} руб.

🏢 Ждем вас по адресу: 
с. Булатниково, 18Н (2 км от МКАД).
`.trim();

    console.log(`[ChatPush] Подготовка к отправке на ${booking.phone}`);
    const token = process.env.CHATPUSH_API_KEY;

    if (!token) {
      console.warn('CHATPUSH_API_KEY не установлен. Сообщение не отправлено.');
      return { success: false, message: 'API ключ не настроен' };
    }

    // Правильный URL API ChatPush для отправки сообщений
    const apiUrl = 'https://api.chatpush.ru/api/v1/delivery';
    
    // Форматируем телефон (убираем лишние символы для API)
    const cleanPhone = booking.phone.replace(/[^0-9]/g, '');

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        phone: cleanPhone,
        text: message,
        channels: method === 'sms' ? ['sms'] : ['telegram', 'tdlib', 'whatsapp']
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[ChatPush Error]: ${response.status} - ${errorText}`);
      // Мы не сбрасываем приложение из-за ошибки уведомления, просто логируем
      return { success: false, message: 'Ошибка отправки в ChatPush' };
    }

    console.log(`[ChatPush] Сообщение успешно отправлено на ${cleanPhone}`);
    return { success: true, message: `Уведомление отправлено` };
  } catch (error) {
    console.error('[ChatPush Exception]', error);
    return { success: false, message: 'Внутренняя ошибка отправки' };
  }
}

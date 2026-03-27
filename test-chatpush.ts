const { sendNotification } = require('./src/lib/notifications.ts');

require('dotenv').config({ path: '.env.local' });

async function test() {
  console.log('Testing ChatPush integration...');
  
  const booking = {
    customerName: 'Олег (Тест)',
    phone: '+79929534220', // Используем какой-нибудь тестовый номер или просто номер
    date: '2026-03-26',
    slotStart: '10:00',
    slotEnd: '10:30',
    axes: 'both',
    price: 5000,
    bookingId: 'test-123'
  };

  const res = await sendNotification(booking, 'telegram');
  console.log('Result:', res);
}

test();

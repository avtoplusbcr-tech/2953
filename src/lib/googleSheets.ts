import { google } from 'googleapis';
import path from 'path';

export async function appendRowToSheet(values: string[]) {
  try {
    const credentialsJson = process.env.GOOGLE_CREDENTIALS;
    if (!credentialsJson) {
      console.warn('GOOGLE_CREDENTIALS не задан в .env.local');
      return null;
    }

    const credentials = JSON.parse(credentialsJson);

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: credentials.client_email,
        private_key: credentials.private_key,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    if (!spreadsheetId) {
      console.warn('GOOGLE_SHEET_ID не задан в .env.local');
      return null;
    }

    console.log(`[Google Sheets] Попытка записи в таблицу ${spreadsheetId}...`);
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'A1', // Упрощенный диапазон, Google сам найдет первую пустую строку ниже
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [values],
      },
    });

    console.log('[Google Sheets] Ответ от API:', response.status, response.statusText);
    return response.data;
  } catch (error: any) {
    console.error('Ошибка записи в Google Sheets:', error.message || error);
    if (error.response) {
      console.error('Детали ответа Google:', error.response.data);
    }
    return null;
  }
}

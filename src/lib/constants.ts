// Константы приложения

// Интервал тайм-слотов в минутах
export const SLOT_INTERVAL_MINUTES = 90;

// Рабочие часы
export const WORK_START_HOUR = 9;  // 09:00
export const WORK_END_HOUR = 19;   // 19:00

// Количество дней для отображения в календаре
export const DAYS_AHEAD = 7;

// Цены по осям
export const AXIS_PRICES: Record<string, number> = {
  front: 5000,
  rear: 5000,
  both: 6000,
};

// Названия осей
export const AXIS_LABELS: Record<string, string> = {
  front: 'Передняя',
  rear: 'Задняя',
  both: 'Две оси',
};

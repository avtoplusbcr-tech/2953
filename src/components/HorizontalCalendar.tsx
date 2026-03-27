'use client';

import { useState, useEffect, useRef } from 'react';
import { DAYS_AHEAD, SLOT_INTERVAL_MINUTES, WORK_START_HOUR, WORK_END_HOUR } from '@/lib/constants';

interface HorizontalCalendarProps {
  selectedDate: string | null;
  selectedSlot: { start: string; end: string } | null;
  onDateChange: (date: string) => void;
  onSlotChange: (slot: { start: string; end: string }) => void;
}

function toLocalISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function generateSlotsForDate(dateIso: string): { start: string; end: string }[] {
  if (!dateIso) return [];
  const d = new Date(dateIso);
  const day = d.getDay();
  const isWeekend = day === 0 || day === 6;

  const startH = 10;
  const endH = isWeekend ? 18 : 20;

  const now = new Date();
  const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const isToday = dateIso === todayIso;
  // Для сегодня: скрывать слоты раньше текущего времени + буфер 30 минут
  const minMinutes = isToday ? now.getHours() * 60 + now.getMinutes() + 30 : 0;

  const slots: { start: string; end: string }[] = [];
  let current = startH * 60;
  const end = endH * 60;
  while (current + SLOT_INTERVAL_MINUTES <= end) {
    if (current >= minMinutes) {
      const sH = Math.floor(current / 60).toString().padStart(2, '0');
      const sM = (current % 60).toString().padStart(2, '0');
      const eMin = current + SLOT_INTERVAL_MINUTES;
      const eH = Math.floor(eMin / 60).toString().padStart(2, '0');
      const eM = (eMin % 60).toString().padStart(2, '0');
      slots.push({ start: `${sH}:${sM}`, end: `${eH}:${eM}` });
    }
    current += SLOT_INTERVAL_MINUTES;
  }
  return slots;
}


function getDays(): { date: Date; label: string; dayName: string; iso: string; monthLabel: string }[] {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let offset = 0;
  while (days.length < DAYS_AHEAD) {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    const iso = toLocalISO(d);
    const slots = generateSlotsForDate(iso);
    if (slots.length > 0) {
      const dayNames = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
      const dayName = dayNames[d.getDay()];
      const label = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
      const monthLabel = d.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
      days.push({
        date: d,
        label,
        dayName,
        iso,
        monthLabel: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
      });
    }
    offset++;
    if (offset > 60) break;
  }
  return days;
}

export default function HorizontalCalendar({
  selectedDate,
  selectedSlot,
  onDateChange,
  onSlotChange,
}: HorizontalCalendarProps) {
  const [days, setDays] = useState<{ date: Date; label: string; dayName: string; iso: string; monthLabel: string }[]>([]);
  const [bookedSlots, setBookedSlots] = useState<{ slotStart: string; slotEnd: string }[]>([]);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  // Кэш для слотов: { "2024-03-27": [...], ... }
  const [slotsCache, setSlotsCache] = useState<Record<string, { slotStart: string; slotEnd: string }[]>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setDays(getDays()); }, []);

  useEffect(() => {
    fetch('/api/blocked-dates').then(r => r.json()).then(d => setBlockedDates(d.dates || []));
  }, []);

  useEffect(() => {
    if (!selectedDate) return;
    
    // "Пинок" базы данных заранее (Wake-up ping)
    // Пока пользователь вводит данные, база уже проснется
    fetch('/api/test-db').catch(() => {});

    // Если данные уже есть в кэше — берем их сразу
    if (slotsCache[selectedDate]) {
      setBookedSlots(slotsCache[selectedDate]);
      return;
    }

    setLoadingSlots(true);
    fetch(`/api/slots?date=${selectedDate}`)
      .then((r) => r.json())
      .then((data) => {
        const slots = data.bookedSlots ?? [];
        setBookedSlots(slots);
        // Сохраняем в кэш
        setSlotsCache(prev => ({ ...prev, [selectedDate]: slots }));
      })
      .catch(() => setBookedSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, slotsCache]);


  const isBooked = (slot: { start: string; end: string }) =>
    bookedSlots.some((b) => b.slotStart === slot.start);

  const currentMonth =
    selectedDate && days.length > 0
      ? days.find(d => d.iso === selectedDate)?.monthLabel || ''
      : days.length > 0
      ? days[0].monthLabel
      : '';

  if (days.length === 0) return null;

  return (
    <div className="space-y-8">
      {/* Секция дат */}
      <div>
        <div className="mb-3">
          <h2 className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
            {currentMonth.toUpperCase()}
          </h2>
        </div>

        {/* Скролл на мобилках, сетка 7 колонок на ПК */}
        <div
          ref={scrollRef}
          className="flex md:grid md:grid-cols-7 gap-3 sm:gap-2 overflow-x-auto md:overflow-visible pb-4 md:pb-0 scrollbar-hide snap-x md:snap-none snap-mandatory touch-pan-x w-full"
        >
          {days.map((d) => {
            const isSelected = selectedDate === d.iso;
            const isBlocked = blockedDates.includes(d.iso);
            return (
              <button
                key={d.iso}
                disabled={isBlocked}
                onClick={() => { onDateChange(d.iso); onSlotChange(null as any); }}
                className={`flex-none snap-start flex flex-col items-center justify-center w-[72px] md:w-full h-[88px] md:h-auto md:aspect-[1/1.2] rounded-2xl md:rounded-xl transition-all duration-200 ${
                  isBlocked
                    ? 'bg-red-50 opacity-40 cursor-not-allowed'
                    : isSelected
                    ? 'bg-brand shadow-md md:scale-105 z-10'
                    : 'bg-brand-light hover:bg-brand-light/80'
                }`}
              >
                <span className={`text-[10px] md:text-[9px] font-bold uppercase mb-0.5 ${isBlocked ? 'text-red-400' : isSelected ? 'text-white/80' : 'text-text-muted'}`}>
                  {isBlocked ? 'ЗАКР' : d.dayName}
                </span>
                <span className={`text-[22px] md:text-[18px] lg:text-[20px] font-black leading-none ${isBlocked ? 'text-red-300' : isSelected ? 'text-white' : 'text-text'}`}>
                  {d.date.getDate()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Секция времени */}
      <div className={`transition-opacity duration-300 ${!selectedDate ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
        <div className="relative bg-brand/[0.05] border border-brand/20 rounded-[2rem] p-5 lg:p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-[10px] font-bold text-text-muted uppercase tracking-widest">ВРЕМЯ</h2>
          </div>

          {loadingSlots ? (
            <div className="flex justify-center py-6">
              <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {selectedDate && generateSlotsForDate(selectedDate).map((slot) => {
                const booked = isBooked(slot);
                const isSelected = selectedSlot?.start === slot.start && selectedSlot?.end === slot.end;
                return (
                  <button
                    key={slot.start}
                    disabled={booked || !selectedDate}
                    onClick={() => onSlotChange(slot)}
                    className={`flex items-center justify-between py-4 px-5 rounded-2xl text-[15px] transition-all duration-150 ${
                      booked
                        ? 'bg-brand-light/50 text-text-muted/40 cursor-not-allowed line-through'
                        : isSelected
                        ? 'bg-brand text-white font-black shadow-md'
                        : 'bg-brand-light text-text font-black hover:bg-brand-light/80'
                    }`}
                  >
                    <span>{slot.start}</span>
                    {isSelected ? (
                      <div className="w-[18px] h-[18px] bg-white rounded-full flex items-center justify-center text-brand">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-brand">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AxisSelector from '@/components/AxisSelector';
import HorizontalCalendar from '@/components/HorizontalCalendar';
import BookingForm from '@/components/BookingForm';
import SuccessState from '@/components/SuccessState';
import { AXIS_PRICES } from '@/lib/constants';

type Axis = 'front' | 'rear' | 'both';

const BackgroundElements = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
    {/* Абстрактная волна вибрации (вибростенд) */}
    <svg className="absolute top-[5%] -left-[10%] w-[600px] h-[600px] text-brand opacity-[0.04] rotate-[-15deg]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12h3l3-9 5 18 3-9h5" />
      <path d="M2 17h3l3-9 5 18 3-9h5" className="translate-y-4 opacity-50" />
      <path d="M2 7h3l3-9 5 18 3-9h5" className="translate-y-[-16px] opacity-20" />
    </svg>
    
    {/* Пружина подвески / Амортизатор */}
    <svg className="absolute top-[30%] -right-[15%] w-[800px] h-[800px] text-brand opacity-[0.03] rotate-12" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5">
      <path d="M 20 10 Q 50 -10, 80 10 T 20 30 T 80 50 T 20 70 T 80 90" />
      <line x1="50" y1="-10" x2="50" y2="110" strokeWidth="0.2" strokeDasharray="2,2"/>
      <rect x="40" y="-10" width="20" height="10" />
      <rect x="40" y="100" width="20" height="10" />
    </svg>

    {/* Чертеж колеса / оси */}
    <svg className="absolute -bottom-[10%] left-[20%] w-[500px] h-[500px] text-brand opacity-[0.03]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5">
      <circle cx="50" cy="50" r="40" />
      <circle cx="50" cy="50" r="32" strokeDasharray="4,4" />
      <circle cx="50" cy="50" r="12" />
      <circle cx="50" cy="50" r="4" fill="currentColor" />
      <line x1="50" y1="10" x2="50" y2="90" />
      <line x1="10" y1="50" x2="90" y2="50" />
      <line x1="21.7" y1="21.7" x2="78.3" y2="78.3" />
      <line x1="21.7" y1="78.3" x2="78.3" y2="21.7" />
    </svg>
  </div>
);

export default function HomePage() {
  const [axis, setAxis] = useState<Axis>('front');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
  const [successBookingId, setSuccessBookingId] = useState<string | null>(null);

  const handleReset = useCallback(() => {
    setAxis('front');
    setSelectedDate(null);
    setSelectedSlot(null);
    setSuccessBookingId(null);
  }, []);

  const price = selectedSlot ? AXIS_PRICES[axis] : 0;

  if (successBookingId && selectedDate && selectedSlot) {
    return (
       <SuccessState 
         onReset={handleReset} 
         date={selectedDate}
         slotStart={selectedSlot.start}
         axis={axis}
       />
    );
  }

  return (
    <main className="min-h-screen relative overflow-hidden">
      <BackgroundElements />
      
      {/* Header */}
      <div className="relative z-10 mx-auto px-6 py-5 flex items-center justify-between border-b border-border/40 mb-6 lg:mb-10 max-w-6xl">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-black tracking-tight text-text">Вибростенд 2953</h1>
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 pb-20 lg:pb-32">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-10 lg:gap-16 items-start">
          {/* Левая колонка - Выбор */}
          <div className="space-y-12 max-w-2xl w-full">
            
            {/* Выбор даты и времени */}
            <HorizontalCalendar
              selectedDate={selectedDate}
              selectedSlot={selectedSlot}
              onDateChange={setSelectedDate}
              onSlotChange={setSelectedSlot}
            />

            {/* Выбор осей */}
            <AxisSelector selected={axis} onChange={setAxis} />
            
          </div>

          {/* Правая колонка - Итого и Форма */}
          <div className="sticky top-8">
            <div className="bg-card rounded-[2rem] p-6 lg:p-8 shadow-card border border-border">
              {/* Summary Header */}
              <div className="flex justify-between items-start mb-8 pb-6 border-b border-border/60">
                <div>
                  <h2 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">
                    СТРАХОВКА И ОПЛАТА
                  </h2>
                  <div className="text-3xl font-black text-text">
                    {price > 0 ? `${price} руб.` : '0 руб.'}
                  </div>
                </div>
                <div className="w-12 h-12 bg-brand-light rounded-xl flex items-center justify-center text-brand">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                </div>
              </div>

              {/* Form */}
              <BookingForm
                axis={axis}
                date={selectedDate!}
                slotStart={selectedSlot?.start ?? ''}
                slotEnd={selectedSlot?.end ?? ''}
                onSuccess={(id) => setSuccessBookingId(id)}
                disabled={!selectedDate || !selectedSlot}
              />
            </div>
            
            {/* Secure note */}
            <div className="flex justify-center mt-6 lg:justify-start lg:ml-4">
              <span className="flex items-center gap-2 text-xs text-text-muted font-medium">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
                Безопасное соединение. Ваши данные под защитой.
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-medium">
         <div className="flex flex-col">
            <span className="font-bold text-text mb-1 relative left-3"><span className="absolute -left-3 text-brand">•</span> Вибростенд 2953</span>
            <span className="text-text-muted text-xs">© 2026 Вибростенд 2953. Все права защищены.</span>
         </div>
         <div className="text-text-muted text-xs text-right">
            Профессиональная диагностика подвески
         </div>
      </div>
    </main>
  );
}

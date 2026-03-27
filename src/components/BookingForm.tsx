'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AXIS_LABELS } from '@/lib/constants';

interface BookingFormProps {
  axis: 'front' | 'rear' | 'both';
  date: string;
  slotStart: string;
  slotEnd: string;
  onSuccess: (bookingId: string) => void;
  disabled?: boolean;
}

export default function BookingForm({ axis, date, slotStart, slotEnd, onSuccess, disabled }: BookingFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [carModel, setCarModel] = useState('');
  const [problem, setProblem] = useState('');
  const [contactMethod, setContactMethod] = useState<'sms' | 'telegram'>('sms');
  const [consent, setConsent] = useState(true);
  const [isListening, setIsListening] = useState(false);

  // Helper to format phone as +7 (XXX) XXX-XX-XX
  const formatPhone = (val: string) => {
    const cleaned = ('' + val).replace(/\D/g, '');
    if (cleaned.length === 0) return '';
    let res = '+7';
    if (cleaned.length > 1) {
       res += ' (' + cleaned.substring(1, 4);
    }
    if (cleaned.length >= 5) {
       res += ') ' + cleaned.substring(4, 7);
    }
    if (cleaned.length >= 8) {
       res += '-' + cleaned.substring(7, 9);
    }
    if (cleaned.length >= 10) {
       res += '-' + cleaned.substring(9, 11);
    }
    return res;
  };

  const handleMicClick = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Голосовой ввод не поддерживается в вашем браузере');
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU';
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setProblem((prev) => prev ? prev + ' ' + transcript : transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      setError('Необходимо согласие на обработку данных');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          axes: axis,
          date,
          slotStart,
          slotEnd,
          customerName: name,
          phone,
          carModel,
          problem,
          confirmation: contactMethod,
          price: AXIS_LABELS[axis] === 'Две оси' ? 5000 : 3000, 
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка при записи');

      onSuccess(data.booking.id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Стили для упрощенных инпутов
  const labelClasses = "block text-sm font-bold text-text mb-2 ml-1";
  const inputContainerClasses = "mb-5";
  const inputClasses = "w-full bg-brand-light/40 border-2 border-transparent focus:bg-white focus:border-brand-light rounded-2xl px-5 py-4 text-[15px] font-medium text-text placeholder:text-text-muted/40 transition-all outline-none";

  return (
    <div className={`transition-opacity duration-300 ${disabled ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
      {error && (
        <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Ваше имя */}
        <div className={inputContainerClasses}>
          <label className={labelClasses}>Ваше имя</label>
          <input
            type="text"
            required
            placeholder="Иван Иванов"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClasses}
          />
        </div>

        {/* Телефон */}
        <div className={inputContainerClasses}>
          <label className={labelClasses}>Номер телефона</label>
          <input
            type="tel"
            required
            placeholder="+7 (999) 000-00-00"
            value={phone}
            onChange={(e) => {
               let val = e.target.value;
               if (!phone && val === '8') val = '7';
               setPhone(formatPhone(val));
            }}
            maxLength={18}
            className={inputClasses}
          />
        </div>

        {/* Марка машины */}
        <div className={inputContainerClasses}>
          <label className={labelClasses}>Ваш автомобиль (марка, модель)</label>
          <input
            type="text"
            required
            placeholder="Например: Toyota Camry"
            value={carModel}
            onChange={(e) => setCarModel(e.target.value)}
            className={inputClasses}
          />
        </div>

        {/* Проблема */}
        <div className={`${inputContainerClasses} relative`}>
          <label className={labelClasses}>Описание проблемы</label>
          <textarea
            required
            placeholder="Стук в передней части..."
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            className={`${inputClasses} resize-none min-h-[120px]`}
          />
          <button 
            type="button" 
            onClick={handleMicClick}
            className={`absolute right-4 bottom-4 p-1 rounded-full transition-colors ${isListening ? 'text-red-500 bg-red-50 animate-pulse' : 'text-brand hover:bg-brand/10'}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
          </button>
        </div>

        {/* Способ связи */}
        <div className={inputContainerClasses}>
          <label className={labelClasses}>Способ связи</label>
          <div className="flex bg-brand-light/40 p-1.5 rounded-2xl">
            <button
              type="button"
              onClick={() => setContactMethod('sms')}
              className={`flex-1 py-3 text-[14px] font-bold rounded-[14px] transition-all duration-200 ${contactMethod === 'sms' ? 'bg-white shadow-sm text-brand' : 'text-text-muted hover:text-text'} `}
            >
              SMS
            </button>
            <button
              type="button"
              onClick={() => setContactMethod('telegram')}
              className={`flex-1 py-3 text-[14px] font-bold rounded-[14px] transition-all duration-200 ${contactMethod === 'telegram' ? 'bg-white shadow-sm text-brand' : 'text-text-muted hover:text-text'} `}
            >
              Telegram
            </button>
          </div>
        </div>

        {/* Чекбокс согласия */}
        <div className="pt-2">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className={`mt-0.5 flex-none w-5 h-5 rounded-md flex items-center justify-center border-2 transition-colors ${consent ? 'bg-brand border-brand text-white' : 'border-gray-200 group-hover:border-brand-light'}`}>
              {consent && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
            </div>
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="sr-only" />
            <span className="text-[11px] leading-tight text-text-muted/80">
              Я соглашаюсь с <Link href="/policy" target="_blank" onClick={(e) => e.stopPropagation()} className="text-brand underline decoration-brand/30 underline-offset-2">условиями обработки персональных данных</Link> и правилами сервиса
            </span>
          </label>
        </div>

        {/* Кнопка отправки */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading || disabled}
            className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-5 rounded-2xl shadow-[0_8px_24px_rgba(234,88,12,0.3)] transition-all active:scale-[0.98] flex items-center justify-center disabled:opacity-70 disabled:active:scale-100"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Подтвердить запись'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

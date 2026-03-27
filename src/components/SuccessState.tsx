'use client';

import { AXIS_LABELS } from '@/lib/constants';

interface SuccessStateProps {
  onReset: () => void;
  date: string;
  slotStart: string;
  axis: 'front' | 'rear' | 'both';
}

export default function SuccessState({ onReset, date, slotStart, axis }: SuccessStateProps) {
  // Dynamically formatted date: "24 Октября, 14:30"
  const dateObj = new Date(date);
  const formattedDay = dateObj.getDate();
  const formattedMonth = dateObj.toLocaleString('ru-RU', { month: 'long' });
  // Capitalize and handle generic endings if needed, but 'long' often returns "октября". Let's assume generic formatting
  const dateStr = `${formattedDay} ${formattedMonth}, ${slotStart}`;
  
  const serviceStr = AXIS_LABELS[axis] === 'Две оси' ? 'Полная диагностика ходовой' : `Диагностика (${AXIS_LABELS[axis].toLowerCase()})`;
  const locationStr = "с. Булатниково, 18Н (2 км от МКАД)";

  return (
    <div className="min-h-screen bg-bg py-12 lg:py-20">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 xl:grid-cols-[1fr_500px] gap-12 xl:gap-20 items-center">
        
        {/* Left Column (Details) */}
        <div>
           {/* Check icon */}
           <div className="w-[88px] h-[88px] bg-brand-light rounded-[2rem] flex items-center justify-center mb-8 mx-auto xl:mx-0">
              <div className="w-14 h-14 bg-brand rounded-full flex items-center justify-center shrink-0 shadow-[0_8px_16px_rgba(234,88,12,0.3)] text-white">
                 <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
           </div>

           <h1 className="text-4xl lg:text-5xl font-black text-text mb-4 lg:leading-[1.1] text-center xl:text-left">
             Вы успешно записаны!
           </h1>
           <p className="text-text-muted text-lg mb-12 max-w-sm mx-auto xl:mx-0 text-center xl:text-left">
             Ваша диагностика на стенде Vibrostend 2953 подтверждена.
           </p>

           {/* Details Card */}
           <div className="bg-brand-light rounded-[2rem] p-6 lg:p-8 mb-10 max-w-md mx-auto xl:mx-0">
             <div className="flex justify-between items-center mb-6">
               <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">ДЕТАЛИ ЗАПИСИ</span>
               <span className="bg-white text-brand shadow-sm text-[10px] font-bold px-3 py-1.5 rounded-full">ПОДТВЕРЖДЕНО</span>
             </div>
             
             <h3 className="text-xl font-black text-text mb-8">Vibrostend 2953</h3>

             <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-6">
                <div>
                  <p className="text-[10px] uppercase text-text-muted mb-1 font-semibold">Дата и время</p>
                  <p className="text-sm font-bold text-text">{dateStr}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-text-muted mb-1 font-semibold">Тип услуги</p>
                  <p className="text-sm font-bold text-text">{serviceStr}</p>
                </div>
             </div>

             <div>
                <p className="text-[10px] uppercase text-text-muted mb-1 font-semibold">Локация</p>
                <p className="text-sm font-bold text-text">{locationStr}</p>
             </div>
           </div>

           <div className="flex flex-col sm:flex-row items-center gap-6 max-w-md mx-auto xl:mx-0">
             <button className="w-full sm:w-auto flex-1 bg-brand hover:bg-brand-dark text-white font-bold py-4 px-6 rounded-2xl shadow-[0_8px_24px_rgba(234,88,12,0.3)] transition-all active:scale-[0.98] flex items-center justify-center gap-3">
               Посмотреть видео о диагностике
               <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
             </button>
             <button onClick={onReset} className="w-full sm:w-auto text-sm font-bold text-text-muted hover:text-text border-b border-border hover:border-text pb-1 transition-colors">
               Вернуться на главную
             </button>
           </div>
        </div>

        {/* Right Column (Video Card Desktop) */}
        <div className="hidden xl:block relative w-full aspect-[4/5] bg-gradient-to-br from-brand-light via-brand-light/30 to-[#e2ccc0] rounded-[2rem] overflow-hidden shadow-card border border-border">
            <div className="absolute inset-0 flex flex-col justify-end p-8">
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 bg-brand-dark rounded-full shadow-[0_8px_32px_rgba(163,63,12,0.4)] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
                     <svg width="32" height="32" viewBox="0 0 24 24" fill="white" className="ml-2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  </div>
               </div>

               {/* Video info glass overlay */}
               <div className="backdrop-blur-md bg-black/10 rounded-2xl p-6 border border-white/20">
                  <p className="text-white font-medium mb-3">
                    Узнайте, как проходит проверка на стенде Vibrostend 2953 за 2 минуты.
                  </p>
                  <div className="flex items-center gap-2 text-white/80 text-sm font-bold">
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                     2:15 МИН
                  </div>
               </div>
            </div>
        </div>

      </div>

      {/* Full-width Map Card at the bottom */}
      <div className="max-w-6xl mx-auto px-6 mt-16 md:mt-24 pb-16">
        <h2 className="text-2xl font-black text-text mb-6 text-center sm:text-left">Как проехать</h2>
        <div className="w-full h-[400px] sm:h-[500px] rounded-[2rem] overflow-hidden shadow-card border border-border bg-white relative">
           {/* Yandex widget URL for Bulatnikovo, using a fallback to panorama or search */}
           <iframe 
             src="https://yandex.ru/map-widget/v1/?text=Московская+область,+Булатниково,+18Н&z=15" 
             width="100%" 
             height="100%" 
             frameBorder="0" 
             allowFullScreen={true}
             className="w-full h-full absolute inset-0"
           ></iframe>
        </div>
      </div>

    </div>
  );
}

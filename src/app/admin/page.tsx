'use client';

import { useState, useEffect, useCallback } from 'react';
import { Filter, RefreshCw, Calendar, Clock, Wrench, Lock, Trash2, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';

interface Booking {
  id: string;
  customerName: string;
  phone: string;
  carModel?: string;
  problem: string;
  axes: string;
  price: number;
  date: string;
  slotStart: string;
  slotEnd: string;
  confirmation: string;
  status: string;
  createdAt: string;
}

const AXES_LABEL: Record<string, string> = { front: 'Передняя', rear: 'Задняя', both: 'Две оси' };
const CONF_LABEL: Record<string, string> = { telegram: 'Telegram', sms: 'SMS' };

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [activeTab, setActiveTab] = useState<'bookings' | 'schedule'>('bookings');

  // Bookings state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Schedule state
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [newBlockStart, setNewBlockStart] = useState('');
  const [newBlockEnd, setNewBlockEnd] = useState('');
  const [newBlockedReason, setNewBlockedReason] = useState('');

  useEffect(() => {
    const auth = localStorage.getItem('adminAuth');
    if (auth === 'oleg2953') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'oleg2953' && password === 'oleg2953') {
      localStorage.setItem('adminAuth', 'oleg2953');
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Неверный логин или пароль');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
  };

  const fetchBookings = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const url = dateFilter ? `/api/bookings?date=${dateFilter}` : '/api/bookings';
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBookings(data.bookings);
    } catch (e: any) {
      setError(e.message ?? 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  }, [dateFilter, isAuthenticated]);

  const fetchBlockedDates = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch('/api/blocked-dates');
      const data = await res.json();
      if (res.ok) setBlockedDates(data.dates);
    } catch (e) {
      console.error(e);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
      fetchBlockedDates();
    }
  }, [fetchBookings, fetchBlockedDates, isAuthenticated]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchBookings();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteBooking = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту запись? Осторожно, это необратимо!')) return;
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
      if (res.ok) fetchBookings();
    } catch (e) {
      console.error(e);
    }
  };

  const blockDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockStart) return;

    const start = new Date(newBlockStart);
    const end = newBlockEnd ? new Date(newBlockEnd) : new Date(newBlockStart);

    if (end < start) {
      alert('Дата окончания должна быть позже даты начала');
      return;
    }

    const datesToBlock: string[] = [];
    const current = new Date(start);
    while (current <= end) {
      const iso = current.toISOString().split('T')[0];
      datesToBlock.push(iso);
      current.setDate(current.getDate() + 1);
    }

    try {
      await Promise.all(datesToBlock.map(date => 
        fetch('/api/blocked-dates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date, reason: newBlockedReason })
        })
      ));

      setNewBlockStart('');
      setNewBlockEnd('');
      setNewBlockedReason('');
      fetchBlockedDates();
    } catch (e) {
      console.error(e);
      alert('Ошибка при закрытии дат. Возможно, требуется перезапуск сервера (npm run dev).');
    }
  };

  const unblockDate = async (date: string) => {
    try {
      const res = await fetch('/api/blocked-dates', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date })
      });
      if (res.ok) fetchBlockedDates();
    } catch (e) {
      console.error(e);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-3xl shadow-card border border-border max-w-sm w-full">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-brand-light/50 rounded-2xl flex items-center justify-center text-brand">
              <ShieldCheck size={32} />
            </div>
          </div>
          <h1 className="text-2xl font-black text-center text-text mb-6">Вход в панель</h1>
          {authError && <p className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-lg border border-red-100 mb-6 text-center shadow-sm relative -top-2">{authError}</p>}
          <div className="space-y-4 mb-6">
            <input type="text" placeholder="Логин (oleg2953)" value={username} onChange={e => setUsername(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50 text-text outline-none focus:border-brand focus:bg-white transition-colors font-medium" required />
            <input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50 text-text outline-none focus:border-brand focus:bg-white transition-colors font-medium" required />
          </div>
          <button type="submit" className="w-full bg-brand hover:bg-brand-dark text-white font-bold text-lg py-3 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98]">
            Войти
          </button>
        </form>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-bg pb-20">
      <div className="bg-white border-b border-border px-6 py-4 shadow-sm relative z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-text tracking-tight flex items-center gap-3">
              <span className="w-8 h-8 bg-brand-light/40 flex items-center justify-center rounded-lg text-brand hidden sm:flex"><ShieldCheck size={20} /></span>
              Vibrostend Admin
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex bg-brand-light/50 p-1 rounded-xl">
              <button onClick={() => setActiveTab('bookings')} className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'bookings' ? 'bg-white shadow-sm text-brand' : 'text-text-muted hover:text-text'}`}>Записи</button>
              <button onClick={() => setActiveTab('schedule')} className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'schedule' ? 'bg-white shadow-sm text-brand' : 'text-text-muted hover:text-text'}`}>График работы</button>
            </div>
            <button onClick={handleLogout} className="text-sm font-bold text-text-muted hover:text-red-500 transition-colors">
              Выйти
            </button>
          </div>
        </div>
      </div>

      <div className="sm:hidden px-6 pt-6">
        <div className="flex bg-brand-light/50 p-1 rounded-xl shadow-sm border border-border">
          <button onClick={() => setActiveTab('bookings')} className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'bookings' ? 'bg-white shadow-sm text-brand border border-black/5' : 'text-text-muted opacity-80'}`}>Записи</button>
          <button onClick={() => setActiveTab('schedule')} className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'schedule' ? 'bg-white shadow-sm text-brand border border-black/5' : 'text-text-muted opacity-80'}`}>График</button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 md:py-8 space-y-6">
        {activeTab === 'bookings' ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-white rounded-3xl border border-border shadow-sm p-4 md:p-6 flex flex-wrap items-end gap-3 mb-6">
              <div className="flex-1 min-w-[180px]">
                <label className="block text-[11px] font-bold text-text-muted mb-2 uppercase tracking-widest pl-1">
                  <Filter size={12} className="inline mr-1 -mt-0.5" />Фильтр
                </label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50 focus:bg-white text-text font-medium outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all text-sm"
                />
              </div>
              <button
                onClick={() => setDateFilter('')}
                className="px-6 py-3 text-sm font-bold text-text-muted hover:text-text bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-transparent hover:border-border"
              >
                Сбросить
              </button>
              <button
                onClick={fetchBookings}
                className="px-6 py-3 bg-brand text-white text-sm font-bold rounded-xl flex items-center gap-2 hover:bg-brand-dark transition-colors shadow-lg shadow-brand/20 active:scale-95"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Загрузить</span>
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 font-medium px-4 py-3 rounded-xl mb-6 shadow-sm flex items-center gap-2">
                <XCircle size={18} /> {error}
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-32 bg-white rounded-3xl border border-border shadow-card">
                <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
              </div>
            ) : bookings.length === 0 ? (
              <div className="bg-white rounded-3xl border border-border shadow-card py-24 text-center text-text-muted flex flex-col items-center">
                <div className="w-20 h-20 bg-brand-light/30 rounded-full flex items-center justify-center text-brand/40 mb-5">
                  <Calendar size={32} />
                </div>
                <p className="font-bold text-xl text-text">Записей пока нет</p>
                <p className="text-sm mt-2 max-w-sm">За выбранный день нет запланированных визитов клиентов.</p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-border shadow-card overflow-x-auto hide-scrollbar">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-bg/50">
                      {['Статус', 'Клиент', 'Дата и Время', 'Ось', 'Цена', 'Проблема', ''].map((h) => (
                        <th key={h} className="px-5 py-4 text-left text-[11px] font-black text-text-muted uppercase tracking-widest whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-bg/40 transition-colors group">
                        <td className="px-5 py-4">
                          <select 
                            value={b.status || 'pending'} 
                            onChange={(e) => updateStatus(b.id, e.target.value)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-lg outline-none border focus:ring-2 transition-colors cursor-pointer appearance-none ${b.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200 focus:ring-green-100' : b.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200 focus:ring-red-100' : 'bg-brand/10 text-brand-dark border-brand/20 focus:ring-brand/20'}`}
                          >
                            <option value="pending">⏳ Ожидает</option>
                            <option value="completed">✅ Завершено</option>
                            <option value="cancelled">❌ Отменено</option>
                          </select>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <p className="font-black text-text text-base">
                            {b.customerName}
                            {b.carModel && <span className="ml-2 text-sm font-semibold text-text-muted">({b.carModel})</span>}
                          </p>
                          <p className="text-text-muted text-xs font-bold font-mono mt-0.5">{b.phone}</p>
                          <span className="inline-block px-2 py-0.5 bg-gray-100 text-[10px] font-bold text-gray-500 rounded uppercase mt-1.5 tracking-wider">{CONF_LABEL[b.confirmation] ?? b.confirmation}</span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-text font-medium">
                          <div className="flex items-center gap-2 mb-1.5 font-bold">
                            <span className="w-6 h-6 rounded bg-brand/10 text-brand flex items-center justify-center"><Calendar size={12} /></span>
                            {new Date(b.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                          </div>
                          <div className="flex items-center gap-2 text-text-muted text-xs">
                            <span className="w-6 h-6 rounded bg-gray-100 text-gray-400 flex items-center justify-center"><Clock size={12} /></span>
                            {b.slotStart} – {b.slotEnd}
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="bg-bg border border-border text-text font-bold text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-sm">
                            {AXES_LABEL[b.axes] ?? b.axes}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap font-black text-text text-base">
                          {b.price.toLocaleString('ru-RU')} ₽
                        </td>
                        <td className="px-5 py-4 min-w-[250px] max-w-[400px]">
                          <p className="text-text-muted text-sm whitespace-normal leading-relaxed">{b.problem || 'Без описания проблемы'}</p>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-right">
                          <button onClick={() => deleteBooking(b.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100 opacity-60 group-hover:opacity-100" title="Удалить запись">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-white rounded-3xl border border-border shadow-card p-6 md:p-8 lg:p-10">
              <div className="flex items-start gap-4 mb-8">
                <div className="w-12 h-12 bg-brand/10 text-brand rounded-2xl flex items-center justify-center shrink-0">
                  <Calendar size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-text mb-1.5">Управление графиком</h2>
                  <p className="text-text-muted text-sm leading-relaxed max-w-xl">
                    Стандартный график работы: <b className="text-text font-semibold">Пн-Пт с 10:00 до 20:00</b>, <b className="text-text font-semibold">Сб-Вс с 10:00 до 18:00</b>.<br className="hidden sm:block"/>
                    Здесь вы можете заблокировать определенные даты (выходные дни, отпуск, тех. работы), чтобы клиенты не могли записаться на эти дни.
                  </p>
                </div>
              </div>
              
              <div className="bg-bg border border-border rounded-2xl p-5 mb-10 shadow-inner">
                 <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-4">Закрыть даты от записи</h4>
                 <form onSubmit={blockDate} className="flex flex-col sm:flex-row items-end gap-3">
                   <div className="w-full sm:flex-[1]">
                     <label className="block text-xs font-bold text-text mb-1.5 ml-1">Дата начала</label>
                     <input type="date" required value={newBlockStart} onChange={e=>setNewBlockStart(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border bg-white text-text outline-none focus:border-brand shadow-sm font-medium" />
                   </div>
                   <div className="w-full sm:flex-[1]">
                     <label className="block text-xs font-bold text-text mb-1.5 ml-1">Дата окончания (опцион.)</label>
                     <input type="date" min={newBlockStart} value={newBlockEnd} onChange={e=>setNewBlockEnd(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border bg-white text-text outline-none focus:border-brand shadow-sm font-medium" />
                   </div>
                   <div className="w-full sm:flex-[1.5]">
                     <label className="block text-xs font-bold text-text mb-1.5 ml-1">Причина (видна только вам)</label>
                     <input type="text" placeholder="Например: Отпуск" value={newBlockedReason} onChange={e=>setNewBlockedReason(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border bg-white text-text outline-none focus:border-brand shadow-sm" />
                   </div>
                   <button type="submit" className="w-full sm:w-auto px-6 py-3 bg-gray-900 border border-transparent text-white font-bold rounded-xl hover:bg-black transition-all shadow-md active:scale-95 whitespace-nowrap">
                     Закрыть даты
                   </button>
                 </form>
              </div>

              <div className="flex items-center justify-between mb-6">
                 <h3 className="text-lg font-black text-text">Закрытые даты</h3>
                 <span className="bg-gray-100 text-gray-500 font-bold px-3 py-1 rounded-full text-xs">{blockedDates.length}</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                 {blockedDates.map(date => (
                   <div key={date} className="flex flex-col justify-between p-5 rounded-2xl border border-red-100 bg-gradient-to-br from-red-50 to-white shadow-sm relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-red-500 opacity-[0.03] rounded-full -mr-10 -mt-10 pointer-events-none group-hover:scale-110 transition-transform"></div>
                      <div className="flex items-start gap-4 mb-4 relative z-10">
                        <div className="w-10 h-10 bg-white border border-red-100 rounded-xl flex items-center justify-center text-red-500 shrink-0 shadow-sm"><XCircle size={20} /></div>
                        <div>
                          <p className="font-black text-red-950 text-base">{new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                          <p className="text-xs text-red-600/80 font-bold mt-0.5 uppercase tracking-wider">Запись закрыта</p>
                        </div>
                      </div>
                      <button onClick={() => unblockDate(date)} className="w-full text-sm font-bold text-red-700 hover:text-white hover:bg-red-500 bg-white py-2.5 rounded-xl border border-red-200 shadow-sm transition-all focus:ring-2 ring-red-200 active:scale-[0.98] relative z-10">
                        Открыть день обратно
                      </button>
                   </div>
                 ))}
                 {blockedDates.length === 0 && (
                   <div className="col-span-full py-16 text-center text-text-muted border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center bg-gray-50/50">
                      <div className="w-16 h-16 rounded-full bg-green-100/50 flex items-center justify-center text-green-500 mb-4">
                         <CheckCircle2 size={32} />
                      </div>
                      <p className="font-black text-xl text-text mb-1">Ограничений нет</p>
                      <p className="text-sm">Все рабочие дни согласно расписанию доступны для клиентов.</p>
                   </div>
                 )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

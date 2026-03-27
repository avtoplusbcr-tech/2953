import Link from 'next/link';

export const metadata = {
  title: 'Политика конфиденциальности — Вибростенд 2953',
  description: 'Политика обработки персональных данных сервиса Вибростенд 2953',
};

export default function PolicyPage() {
  return (
    <main className="min-h-screen bg-bg py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Шапка */}
        <div className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-brand hover:text-brand-dark transition-colors mb-8 group"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-0.5 transition-transform">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            Вернуться к записи
          </Link>
          <h1 className="text-3xl md:text-4xl font-black text-text tracking-tight mt-4">
            Политика конфиденциальности
          </h1>
          <p className="text-text-muted mt-3 font-medium">
            Последнее обновление: 27 марта 2025 г.
          </p>
        </div>

        {/* Контент */}
        <div className="bg-white rounded-3xl border border-border shadow-sm p-8 md:p-10 space-y-8 text-text">

          <Section title="1. Общие положения">
            <p>
              Настоящая политика обработки персональных данных (далее — «Политика») составлена в соответствии с требованиями Федерального закона от 27.07.2006 № 152-ФЗ «О персональных данных» и определяет порядок обработки персональных данных пользователей сервиса онлайн-записи на стенд балансировки колёс <strong>Вибростенд 2953</strong>, расположенного по адресу: <strong>Московская область, с. Булатниково, 18Н</strong>.
            </p>
          </Section>

          <Section title="2. Оператор персональных данных">
            <p>Оператором персональных данных является владелец сервиса <strong>Вибростенд 2953</strong>.</p>
            <p className="mt-2">По всем вопросам, связанным с обработкой персональных данных, вы можете обратиться через:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-text-muted">
              <li>Форму обратной связи на сайте <strong>2953.рф</strong></li>
              <li>Telegram или WhatsApp (контакты указаны на главной странице)</li>
            </ul>
          </Section>

          <Section title="3. Какие данные мы собираем">
            <p>При оформлении онлайн-записи мы собираем следующие данные:</p>
            <ul className="list-disc list-inside mt-3 space-y-2 text-text-muted">
              <li><strong className="text-text">Имя</strong> — для обращения к клиенту и идентификации записи.</li>
              <li><strong className="text-text">Номер телефона</strong> — для отправки подтверждения записи и напоминания.</li>
              <li><strong className="text-text">Марка и модель автомобиля</strong> — для подготовки к работе и ведения истории обслуживания.</li>
              <li><strong className="text-text">Описание проблемы</strong> — для предварительного анализа и подбора оборудования.</li>
              <li><strong className="text-text">Дата и время визита</strong> — для организации расписания.</li>
              <li><strong className="text-text">Способ связи (SMS или Telegram)</strong> — для отправки уведомлений в предпочтительный канал.</li>
            </ul>
          </Section>

          <Section title="4. Цели обработки данных">
            <p>Собранные данные используются исключительно для:</p>
            <ul className="list-disc list-inside mt-3 space-y-2 text-text-muted">
              <li>Подтверждения записи и отправки информации о визите.</li>
              <li>Напоминания о предстоящей записи.</li>
              <li>Организации рабочего расписания мастера.</li>
              <li>Ведения журнала обращений для улучшения качества сервиса.</li>
            </ul>
          </Section>

          <Section title="5. Хранение и защита данных">
            <p>
              Ваши данные хранятся в защищённой базе данных и <strong>не передаются третьим лицам</strong>, за исключением сервисов уведомлений (ChatPush), используемых исключительно для доставки сообщений клиенту. Обработка данных прекращается по требованию пользователя.
            </p>
          </Section>

          <Section title="6. Права пользователя">
            <p>Вы имеете право:</p>
            <ul className="list-disc list-inside mt-3 space-y-2 text-text-muted">
              <li>Запросить сведения об обработке ваших персональных данных.</li>
              <li>Потребовать удаления ваших данных из системы.</li>
              <li>Отозвать согласие на обработку персональных данных в любой момент.</li>
            </ul>
            <p className="mt-3">
              Для реализации своих прав обратитесь к оператору по контактам, указанным в разделе 2.
            </p>
          </Section>

          <Section title="7. Согласие на обработку">
            <p>
              Нажимая кнопку «Подтвердить запись», пользователь даёт свободное, конкретное, информированное и сознательное согласие на обработку своих персональных данных в соответствии с настоящей Политикой.
            </p>
          </Section>

          <Section title="8. Изменения в политике">
            <p>
              Оператор оставляет за собой право вносить изменения в настоящую Политику. Новая редакция вступает в силу с момента её размещения на сайте. Продолжение использования сервиса означает согласие с обновлённой Политикой.
            </p>
          </Section>

        </div>

        {/* Кнопка назад */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-brand text-white font-bold px-8 py-4 rounded-2xl hover:bg-brand-dark transition-all shadow-lg shadow-brand/20 active:scale-[0.98]"
          >
            Вернуться к записи
          </Link>
        </div>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border/60 pb-8 last:border-0 last:pb-0">
      <h2 className="text-lg font-black text-text mb-4">{title}</h2>
      <div className="text-text-muted leading-relaxed space-y-2 text-sm">
        {children}
      </div>
    </div>
  );
}

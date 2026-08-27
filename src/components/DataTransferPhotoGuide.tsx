import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { editorialMedia } from '../data/editorialMedia';
import { EditorialPhoto } from './EditorialPhoto';
import { Reveal } from './Reveal';

const routes = [
  {
    id: 'iphone-iphone',
    label: 'iPhone → iPhone',
    title: 'Через «Быстрое начало»',
    description: 'Подходит, когда старый и новый iPhone рядом, оба заряжены и подключены к Wi-Fi.',
    media: editorialMedia.dataTransferIphones,
    deviceLabels: ['Старый iPhone', 'Новый iPhone'],
    steps: [
      'Включите Bluetooth и Wi-Fi на старом iPhone.',
      'Положите новый iPhone рядом и начните его настройку.',
      'На старом устройстве нажмите «Продолжить».',
      'Выберите «Перенести с iPhone» и не разъединяйте устройства.',
      'После завершения проверьте фото, контакты, чаты и приложения.',
    ],
  },
  {
    id: 'android-iphone',
    label: 'Android → iPhone',
    title: 'Через приложение «Перенос на iOS»',
    description: 'Официальный маршрут во время первой настройки iPhone. Старый Android пока не сбрасывайте.',
    media: editorialMedia.twoSmartphones,
    deviceLabels: ['Android', 'Новый iPhone'],
    steps: [
      'Установите на Android официальное приложение «Перенос на iOS».',
      'На iPhone откройте «Приложения и данные» и выберите перенос с Android.',
      'Введите на Android код, который покажет iPhone.',
      'Выберите контакты, фото, сообщения и другие доступные данные.',
      'Дождитесь завершения и отдельно войдите в банки и мессенджеры.',
    ],
  },
  {
    id: 'iphone-android',
    label: 'iPhone → Android',
    title: 'Через мастер настройки Android',
    description: 'Способ зависит от производителя Android, но логика одинаковая: подключение, доверие и выбор данных.',
    media: editorialMedia.twoSmartphones,
    deviceLabels: ['Старый iPhone', 'Новый Android'],
    steps: [
      'Начните настройку Android и выберите копирование со старого устройства.',
      'Соедините телефоны кабелем или используйте предложенный беспроводной способ.',
      'Разрешите доступ на iPhone и подтвердите доверие устройству.',
      'Выберите фото, контакты, календарь и доступные приложения.',
      'Отключите iMessage только после проверки нового телефона.',
    ],
  },
] as const;

export function DataTransferPhotoGuide() {
  const [selectedRoute, setSelectedRoute] = useState<(typeof routes)[number]['id']>('iphone-iphone');
  const route = routes.find((item) => item.id === selectedRoute) || routes[0];

  return (
    <section className="editorial-band py-14 sm:py-20">
      <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <p className="editorial-eyebrow">Три маршрута переноса</p>
          <h2 className="mt-4 max-w-4xl text-3xl font-extrabold leading-tight sm:text-5xl">Выберите, с какого телефона переносите данные</h2>
          <p className="mt-5 max-w-3xl text-base leading-7 text-muted">Кнопки ниже меняют и фотографию сценария, и точную последовательность действий. Старый телефон лучше не стирать ещё несколько дней.</p>
        </Reveal>

        <div className="mt-8 grid gap-2 rounded-2xl border border-line bg-white p-2 shadow-glass sm:grid-cols-3" role="tablist" aria-label="Направление переноса данных">
          {routes.map((item) => (
            <button
              className={`min-h-12 rounded-xl px-4 text-sm font-extrabold transition ${selectedRoute === item.id ? 'bg-ink text-white shadow-glass' : 'text-graphite hover:bg-slate-100'}`}
              type="button"
              role="tab"
              aria-selected={selectedRoute === item.id}
              onClick={() => setSelectedRoute(item.id)}
              key={item.id}
            >
              {item.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            className="mt-6 grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center"
            key={route.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
          >
            <EditorialPhoto media={route.media} aspect="landscape">
              <div className="flex items-center justify-between gap-3">
                {route.deviceLabels.map((label, index) => (
                  <span className="inline-flex items-center gap-2 rounded-xl border border-white/50 bg-white/88 px-3 py-2 text-xs font-extrabold text-ink shadow-glass backdrop-blur-xl" key={label}>
                    <Smartphone className="h-4 w-4 text-accent" />
                    {label}
                    {index === 0 ? <ArrowRight className="hidden h-4 w-4 text-muted sm:block" /> : null}
                  </span>
                ))}
              </div>
            </EditorialPhoto>
            <article>
              <p className="text-sm font-extrabold text-accent">{route.label}</p>
              <h3 className="mt-3 text-3xl font-extrabold leading-tight">{route.title}</h3>
              <p className="mt-4 text-base leading-7 text-muted">{route.description}</p>
              <ol className="mt-6 grid gap-3">
                {route.steps.map((step, index) => (
                  <li className="grid grid-cols-[2rem_1fr] items-start gap-3 text-sm font-semibold leading-6 text-graphite" key={step}>
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-xs font-extrabold text-accent shadow-glass">{index + 1}</span>
                    <span className="pt-1">{step}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-6 flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 text-sm font-semibold leading-6 text-emerald-950">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                Перед сбросом старого устройства откройте несколько фотографий, найдите контакты и проверьте важные чаты.
              </p>
            </article>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

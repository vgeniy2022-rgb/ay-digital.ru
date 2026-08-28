import { AnimatePresence, motion } from 'framer-motion';
import { Code2, CornerDownLeft, FlaskConical, Gauge, MapPin, Search, Sparkles, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/commandPalette.css';

type PaletteEntry = {
  id: string;
  label: string;
  hint: string;
  keywords: string;
  path?: string;
  action?: 'developer' | 'jdm';
  icon: typeof Search;
};

const entries: PaletteEntry[] = [
  { id: 'websites', label: 'Создать сайт', hint: 'Студия разработки', keywords: 'сайт разработка лендинг владивосток', path: '/website-development-vladivostok', icon: Sparkles },
  { id: 'prices', label: 'Посмотреть цены', hint: 'Услуги и ориентиры', keywords: 'стоимость прайс бюджет', path: '/prices', icon: Gauge },
  { id: 'cases', label: 'Открыть портфолио', hint: 'Кейсы SITEVL', keywords: 'работы проекты портфолио', path: '/cases', icon: Sparkles },
  { id: 'contacts', label: 'Связаться', hint: 'Telegram, WhatsApp, телефон', keywords: 'контакты написать позвонить', path: '/contacts', icon: CornerDownLeft },
  { id: 'lab', label: 'Открыть SITEVL LAB', hint: 'Все эксперименты', keywords: 'лаборатория demo experiments', path: '/lab', icon: FlaskConical },
  { id: 'builder', label: 'Открыть SITEVL Studio', hint: 'Visual Website Builder', keywords: 'конструктор редактор no-code preview', path: '/lab/builder', icon: Gauge },
  { id: 'room', label: 'Войти в THE ROOM', hint: '3D Game · SITEVL LAB', keywords: '3d webgl игра комната эксперимент', path: '/lab/3d', icon: Code2 },
  { id: 'useful', label: 'Открыть библиотеку', hint: 'Полезные материалы', keywords: 'статьи инструкции помощь', path: '/useful', icon: Search },
  { id: 'windows', label: 'Настройка Windows', hint: 'Коммерческая страница', keywords: 'виндовс ноутбук компьютер', path: '/windows-setup-vladivostok', icon: Gauge },
  { id: 'macbook', label: 'Настройка MacBook', hint: 'Коммерческая страница', keywords: 'mac macos apple ноутбук', path: '/macbook-setup-vladivostok', icon: Gauge },
  { id: 'vladivostok', label: 'Сайты из Владивостока', hint: 'Городская web-история', keywords: 'город vl night jdm студия', path: '/website-development-vladivostok#city', icon: MapPin },
  { id: 'developer', label: 'Переключить Developer Mode', hint: 'Показать технический слой', keywords: 'dev code route технологии', action: 'developer', icon: Code2 },
  { id: 'jdm', label: 'Активировать JDM Palette', hint: 'Скрытая палитра на 7 секунд', keywords: 'night city владивосток easter egg', action: 'jdm', icon: Sparkles },
];

function normalize(value: string) {
  return value.toLocaleLowerCase('ru-RU').replace(/ё/g, 'е').trim();
}

function matches(entry: PaletteEntry, query: string) {
  const normalized = normalize(query);
  if (!normalized) return true;
  const haystack = normalize(`${entry.label} ${entry.hint} ${entry.keywords}`);
  const words = normalized.split(/\s+/).filter(Boolean);
  const fuzzyIncludes = (word: string) => {
    if (haystack.includes(word)) return true;
    if (word.length < 4) return false;
    let position = 0;
    for (const character of haystack) {
      if (character === word[position]) position += 1;
      if (position === word.length) return true;
    }
    return false;
  };
  return words.every(fuzzyIncludes);
}

export function CommandPalette() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const filtered = useMemo(() => entries.filter((entry) => matches(entry, query)).slice(0, 9), [query]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === 'Escape') setOpen(false);
    };
    const onOpen = () => setOpen(true);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('sitevl:open-command-palette', onOpen);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('sitevl:open-command-palette', onOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActiveIndex(0);
    window.setTimeout(() => inputRef.current?.focus(), 30);
  }, [open]);

  useEffect(() => {
    if (activeIndex > filtered.length - 1) setActiveIndex(0);
  }, [activeIndex, filtered.length]);

  const run = (entry: PaletteEntry) => {
    if (entry.path) navigate(entry.path);
    if (entry.action === 'developer') {
      const enabled = !document.body.classList.contains('sitevl-developer-mode');
      document.body.classList.toggle('sitevl-developer-mode', enabled);
      window.localStorage.setItem('sitevl-developer-mode', enabled ? 'true' : 'false');
      window.dispatchEvent(new CustomEvent('sitevl:developer-mode', { detail: enabled }));
    }
    if (entry.action === 'jdm') {
      navigate('/website-development-vladivostok#city');
      window.setTimeout(() => document.getElementById('city')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 320);
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.body.classList.add('sitevl-jdm-mode');
        window.setTimeout(() => document.body.classList.remove('sitevl-jdm-mode'), 7000);
      }
    }
    setOpen(false);
  };

  const onInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((value) => filtered.length ? (value + 1) % filtered.length : 0);
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((value) => filtered.length ? (value - 1 + filtered.length) % filtered.length : 0);
    }
    if (event.key === 'Enter' && filtered[activeIndex]) {
      event.preventDefault();
      run(filtered[activeIndex]);
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="sitevl-command" role="presentation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.currentTarget === event.target) setOpen(false); }}>
          <motion.section
            className="sitevl-command__dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Быстрая навигация SITEVL"
            initial={{ opacity: 0, y: -16, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.99 }}
          >
            <div className="sitevl-command__search">
              <Search aria-hidden="true" />
              <input ref={inputRef} value={query} onChange={(event) => { setQuery(event.target.value); setActiveIndex(0); }} onKeyDown={onInputKeyDown} placeholder="Найти страницу или действие" aria-label="Поиск команды" />
              <button type="button" onClick={() => setOpen(false)} aria-label="Закрыть палитру"><X /></button>
            </div>
            <div className="sitevl-command__results" role="listbox">
              {filtered.map((entry, index) => {
                const Icon = entry.icon;
                return (
                  <button className={activeIndex === index ? 'is-active' : ''} type="button" role="option" aria-selected={activeIndex === index} onMouseEnter={() => setActiveIndex(index)} onClick={() => run(entry)} key={entry.id}>
                    <span><Icon aria-hidden="true" /></span>
                    <strong>{entry.label}<small>{entry.hint}</small></strong>
                    <CornerDownLeft aria-hidden="true" />
                  </button>
                );
              })}
              {!filtered.length ? <p className="sitevl-command__empty">Ничего не найдено. Попробуйте «сайт», «цены» или «лаборатория».</p> : null}
            </div>
            <footer><span>↑↓ выбрать</span><span>Enter открыть</span><span>Esc закрыть</span></footer>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

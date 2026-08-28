export const RETRO_INTERNAL_URLS = ['sitevl://home', 'sitevl://directory', 'sitevl://lab', 'sitevl://about', 'sitevl://help', 'sitevl://museum', 'sitevl://files', 'sitevl://network', 'sitevl://server'] as const;

export type RetroUrlResult = { ok: true; url: string; internal: boolean } | { ok: false; reason: string };

export function normalizeRetroUrl(input: string): RetroUrlResult {
  const value = input.trim();
  if (!value) return { ok: false, reason: 'Введите адрес.' };
  if (value.toLowerCase().startsWith('sitevl://')) return (RETRO_INTERNAL_URLS as readonly string[]).includes(value.toLowerCase()) ? { ok: true, url: value.toLowerCase(), internal: true } : { ok: false, reason: 'Внутренняя страница SITEVL не найдена.' };
  const withProtocol = /^[a-z][a-z\d+.-]*:/i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(withProtocol);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return { ok: false, reason: 'Разрешены только адреса http:// и https://.' };
    return { ok: true, url: url.href, internal: false };
  } catch { return { ok: false, reason: 'Не удалось распознать адрес.' }; }
}

export function internalRetroPage(url: string) {
  const pages: Record<string, { title: string; eyebrow: string; body: string; links: Array<{ label: string; url: string }> }> = {
    'sitevl://home': { title: 'SITEVL Web Directory', eyebrow: 'ДОБРО ПОЖАЛОВАТЬ В СЕТЬ', body: 'Локальный каталог музея, лаборатории и справочных страниц. Эти адреса работают без подключения к интернету.', links: [{ label: 'Открыть музей', url: 'sitevl://museum' }, { label: 'Перейти в LAB', url: 'sitevl://lab' }] },
    'sitevl://directory': { title: 'Интернет-каталог', eyebrow: 'КАТАЛОГ 1998', body: 'Новости · Компьютеры · Игры · Разработка · LAB · Интернет. Каталог связывает внутренние страницы виртуальной сети.', links: [{ label: 'Сеть', url: 'sitevl://network' }, { label: 'Справка', url: 'sitevl://help' }] },
    'sitevl://lab': { title: 'История SITEVL LAB', eyebrow: 'ЭКСПЕРИМЕНТАЛЬНАЯ СРЕДА', body: 'Семь браузерных экспериментов объединяют конструктор, игры, физику, 3D, системы и бесконечный холст.', links: [{ label: 'Открыть LAB', url: '/lab' }, { label: 'Справка', url: 'sitevl://help' }] },
    'sitevl://about': { title: 'О SITEVL Retro', eyebrow: 'ВИРТУАЛЬНЫЙ КОМПЬЮТЕР', body: 'Самостоятельная стилизация компьютерных интерфейсов разных эпох. Это музейный веб-симулятор, а не аппаратная эмуляция.', links: [{ label: 'Ретро-музей', url: 'sitevl://museum' }] },
    'sitevl://help': { title: 'Справка пользователя', eyebrow: 'КАК ЭТО РАБОТАЕТ', body: 'Открывайте приложения одним нажатием. Внешние сайты могут запрещать iframe; тогда используйте безопасную кнопку новой вкладки.', links: [{ label: 'Главная каталога', url: 'sitevl://home' }] },
    'sitevl://museum': { title: 'Ретро-музей', eyebrow: 'ТРИ ИНТЕРФЕЙСНЫЕ ЭПОХИ', body: 'DESK 95, CLASSIC DESK и CLASSIC MONO по-разному показывают одну виртуальную файловую систему.', links: [{ label: 'О проекте', url: 'sitevl://about' }, { label: 'Файлы', url: 'sitevl://files' }] },
    'sitevl://files': { title: 'Интернет-каталог файлов', eyebrow: 'SITEVL HD', body: 'Документы, изображения, программы, дискета и CD-ROM доступны через приложение «Файлы».', links: [{ label: 'Помощь', url: 'sitevl://help' }] },
    'sitevl://network': { title: 'Сетевое окружение SITEVL', eyebrow: 'ЛОКАЛЬНАЯ ВИРТУАЛЬНАЯ СЕТЬ', body: 'DESK95-PC, CLASSIC-DESK и MONO-STATION находятся в сети. LAB-SERVER требует игровые данные доступа.', links: [{ label: 'Каталог', url: 'sitevl://directory' }, { label: 'LAB-SERVER', url: 'sitevl://server' }] },
    'sitevl://server': { title: 'LAB-SERVER', eyebrow: 'ДОСТУП ОГРАНИЧЕН', body: 'Авторизация выполняется только в приложении «Сетевое окружение». Реальные учётные записи не используются.', links: [{ label: 'Сетевая справка', url: 'sitevl://network' }] },
  };
  return pages[url] || pages['sitevl://home'];
}

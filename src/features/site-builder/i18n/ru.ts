import type { Dictionary } from '@puckeditor/core';
import type { StudioBreakpoint } from '../schema/types';

export const studioRu = {
  status: { loading: 'Загрузка…', saving: 'Сохранение…', saved: 'Сохранено', error: 'Ошибка сохранения' },
  actions: { preview: 'Предпросмотр', share: 'Поделиться', export: 'Экспорт', import: 'Импорт', publish: 'Опубликовать', send: 'Отправить Александру' },
  navigation: { blocks: 'Блоки', outline: 'Структура', pages: 'Страницы', components: 'Компоненты', assets: 'Медиа', style: 'Стиль', fields: 'Параметры' },
  categories: { layout: 'Макет', basic: 'Базовые', business: 'Готовые секции' },
  breakpoints: { desktop: 'Компьютер', laptop: 'Ноутбук', tablet: 'Планшет', mobile: 'Телефон' } satisfies Record<StudioBreakpoint, string>,
} as const;

export const studioComponentLabels = {
  Section: 'Секция', Container: 'Контейнер', VerticalStack: 'Вертикальный стек', HorizontalStack: 'Горизонтальный стек', Grid: 'Сетка', Columns: 'Колонки', Card: 'Карточка', Spacer: 'Отступ', Divider: 'Разделитель',
  Heading: 'Заголовок', RichText: 'Форматированный текст', Button: 'Кнопка', Image: 'Изображение', Icon: 'Иконка', Video: 'Видео', Badge: 'Метка', List: 'Список', Quote: 'Цитата',
  Header: 'Шапка', Hero: 'Первый экран', Services: 'Услуги', Features: 'Преимущества', Pricing: 'Тарифы', Portfolio: 'Портфолио', Gallery: 'Галерея', Steps: 'Этапы', Stats: 'Статистика', Reviews: 'Отзывы', Team: 'Команда', FAQ: 'FAQ', Contact: 'Контакты', LeadForm: 'Форма заявки', MapPlaceholder: 'Карта', Footer: 'Подвал',
} as const;

export const studioFieldLabels = {
  display: 'Отображение', direction: 'Направление', alignItems: 'Выравнивание', justifyContent: 'Распределение', gap: 'Интервал', columns: 'Колонки', width: 'Ширина', minWidth: 'Мин. ширина', maxWidth: 'Макс. ширина', height: 'Высота', minHeight: 'Мин. высота', padding: 'Внутренние отступы', margin: 'Внешние отступы', fontSize: 'Размер шрифта', lineHeight: 'Межстрочный интервал', textAlign: 'Выравнивание текста', background: 'Фон', border: 'Граница', radius: 'Скругление', shadow: 'Тень', visibility: 'Видимость', order: 'Порядок',
} as const;

export const studioValueLabels: Record<string, string> = {
  inherit: 'Наследовать', auto: 'Авто', block: 'Блок', flex: 'Flex', grid: 'Сетка', none: 'Нет', row: 'Горизонтально', column: 'Вертикально', stretch: 'Растянуть', start: 'В начале', center: 'По центру', end: 'В конце', 'space-between': 'По краям', left: 'Слева', right: 'Справа', visible: 'Видимый', hidden: 'Скрытый', soft: 'Мягкая', medium: 'Средняя', strong: 'Сильная', surface: 'Поверхность', muted: 'Приглушённый', contrast: 'Контрастный', primary: 'Основной', secondary: 'Дополнительный', ghost: 'Без фона', success: 'Успех', neutral: 'Нейтральный', solid: 'Сплошная', outline: 'Контурная', default: 'Обычный', narrow: 'Узкий', wide: 'Широкий', wrap: 'С переносом', nowrap: 'В одну строку', check: 'Галочки', dot: 'Точки', number: 'Нумерация', image: 'С изображением', split: 'Две колонки', cover: 'Обложка', minimal: 'Минимальный', clean: 'Чистый', floating: 'Плавающий', transparent: 'Прозрачный', cards: 'Карточки', editorial: 'Редакционный', compact: 'Компактный', columns: 'Колонки', mosaic: 'Мозаика', masonry: 'Кирпичная сетка', strip: 'Лента', list: 'Список', quotes: 'Цитаты', featured: 'Акцентный', panel: 'Панель', dark: 'Тёмный', light: 'Светлый', yes: 'Да', no: 'Нет',
};

export const studioVisibleLabelTranslations: Record<string, string> = {
  Responsive: 'Адаптивность', Gap: 'Интервал', Align: 'Выравнивание', Justify: 'Распределение', Wrap: 'Перенос', Padding: 'Внутренние отступы', Alt: 'Alt-текст', Slug: 'Адрес страницы (slug)',
};

export const puckRussianDictionary: Dictionary = {
  'header-publish': 'Опубликовать', 'header-undo': 'Отменить', 'header-redo': 'Повторить', 'header-toggle-leftsidebar': 'Показать или скрыть левую панель', 'header-toggle-rightsidebar': 'Показать или скрыть правую панель', 'header-toggle-menubar': 'Показать или скрыть меню',
  'action-selectparent': 'Выбрать родительский блок', 'action-duplicate': 'Дублировать', 'action-delete': 'Удалить', 'label-page': 'Страница', 'label-component': 'Компонент',
  'outline-empty': 'Структура пока пуста', 'outline-item-collapse': 'Свернуть', 'outline-item-expand': 'Развернуть', 'outline-header-title': 'Структура', 'outline-header-collapseall': 'Свернуть всё', 'outline-item-duplicate': 'Дублировать', 'outline-item-delete': 'Удалить',
  'drawer-category-collapse': 'Свернуть: {title}', 'drawer-category-expand': 'Развернуть: {title}', 'drawer-category-other': 'Другое', 'canvas-noconfig': 'Для блока {type} нет настроек',
  'field-readonly': 'Только чтение', 'field-arrayitem-summary': 'Элемент №{index}', 'field-arrayitem-duplicate': 'Дублировать', 'field-arrayitem-delete': 'Удалить', 'field-external-selectdata': 'Выбрать данные', 'field-external-search': 'Поиск', 'field-external-togglefilters': 'Показать или скрыть фильтры', 'field-external-item': 'Внешний элемент', 'field-external-result-singular': '{count} результат', 'field-external-result-plural': '{count} результатов',
  'field-richtext-bold': 'Полужирный', 'field-richtext-italic': 'Курсив', 'field-richtext-underline': 'Подчёркивание', 'field-richtext-strikethrough': 'Зачёркивание', 'field-richtext-blockquote': 'Цитата', 'field-richtext-code-inline': 'Код в строке', 'field-richtext-code-block': 'Блок кода', 'field-richtext-list-bullet': 'Маркированный список', 'field-richtext-list-ordered': 'Нумерованный список', 'field-richtext-horizontalrule': 'Разделитель', 'field-richtext-align-left': 'По левому краю', 'field-richtext-align-center': 'По центру', 'field-richtext-align-right': 'По правому краю', 'field-richtext-align-justify': 'По ширине', 'field-richtext-select': 'Выбрать',
  'field-richtext-headingselect-1': 'Заголовок 1', 'field-richtext-headingselect-2': 'Заголовок 2', 'field-richtext-headingselect-3': 'Заголовок 3', 'field-richtext-headingselect-4': 'Заголовок 4', 'field-richtext-headingselect-5': 'Заголовок 5', 'field-richtext-headingselect-6': 'Заголовок 6', 'field-richtext-alignselect-left': 'Слева', 'field-richtext-alignselect-center': 'По центру', 'field-richtext-alignselect-right': 'Справа', 'field-richtext-alignselect-justify': 'По ширине', 'field-richtext-listselect-bullet': 'Маркированный список', 'field-richtext-listselect-ordered': 'Нумерованный список',
  'viewport-zoom-in': 'Увеличить масштаб', 'viewport-zoom-out': 'Уменьшить масштаб', 'viewport-zoom-auto': '{zoom}% (авто)', 'viewport-toggle-menu': 'Открыть меню масштаба', 'viewport-switch': 'Переключить на режим «{label}»', 'viewport-switch-default': 'Выбрать размер экрана',
  'plugin-blocks': 'Блоки', 'plugin-outline': 'Структура', 'plugin-fields': 'Параметры', 'plugin-components': 'Компоненты', 'layout-maximize': 'Развернуть', 'layout-minimize': 'Свернуть', 'loader-loading': 'Загрузка',
};

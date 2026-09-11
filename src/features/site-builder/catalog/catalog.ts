import { priceDirections } from '../../../data/priceDirections';
import { SITE_BUILDER_SCHEMA_VERSION, type SiteBuilderProject } from '../schema/types';
import { createStudioId } from '../utils/id';

export const templateNiches = {
  services: 'Услуги и специалисты', business: 'Компании', restaurant: 'Кафе и рестораны',
  retail: 'Торговля', education: 'Образование', portfolio: 'Портфолио',
  beauty: 'Красота и уход', automotive: 'Автосервисы', marine: 'Промышленность и снабжение', hospitality: 'Отдых и размещение',
  travel: 'Прогулки и путешествия', home: 'Дом и интерьер', pets: 'Услуги для животных',
} as const;

/** Lightweight metadata; the existing Studio document loads only for the selected design. */
export interface CatalogTemplate {
  id: string; version: string; slug: string; name: string; niche: keyof typeof templateNiches;
  description: string; features: string[];
  cover: { src: string; alt: string; width: number; height: number };
  servicePackageId: string; publication: 'draft' | 'published'; verifiedAt?: string;
}
export type LoadedCatalogTemplate = CatalogTemplate & { project: SiteBuilderProject };

export function getTemplatePackage(template: Pick<CatalogTemplate, 'servicePackageId'>) {
  return priceDirections.find((direction) => direction.slug === 'websites')?.packages.find((item) => item.id === template.servicePackageId);
}
export function publishCatalog(entries: readonly CatalogTemplate[]): readonly CatalogTemplate[] {
  const published = entries.filter((entry) => entry.publication === 'published');
  const ids = new Set<string>(); const slugs = new Set<string>();
  for (const entry of published) {
    if (!entry.id.trim() || ids.has(entry.id) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.slug) || slugs.has(entry.slug))
      throw new Error('Каталог: ID и slug опубликованного дизайна должны быть уникальными.');
    if (!/^\d+\.\d+\.\d+$/.test(entry.version) || !entry.verifiedAt || !Number.isFinite(Date.parse(entry.verifiedAt))
      || !entry.name.trim() || !entry.description.trim() || !entry.features.length || entry.features.some((feature) => !feature.trim())
      || !(entry.niche in templateNiches) || !getTemplatePackage(entry))
      throw new Error(`Каталог: заполните проверенные метаданные и действующий пакет для ${entry.id}.`);
    if (!/^\/(?:images|template-assets)\/[a-zA-Z0-9/_-]+\.(?:webp|avif|png|jpe?g)$/.test(entry.cover.src)
      || !entry.cover.alt.trim() || entry.cover.width <= 0 || entry.cover.height <= 0)
      throw new Error(`Каталог: нужна реальная публичная обложка для ${entry.id}.`);
    ids.add(entry.id); slugs.add(entry.slug);
  }
  return published;
}
export function validateTemplateProject(entry: LoadedCatalogTemplate) {
  if (entry.project.schemaVersion !== SITE_BUILDER_SCHEMA_VERSION || entry.project.pages.filter((page) => page.isHome).length !== 1
    || entry.project.pages.some((page) => !page.data.content.length) || entry.project.assets.length
    || /(?:blob:|data:|asset:\/\/)/i.test(JSON.stringify(entry.project)))
    throw new Error(`Каталог: ${entry.id} должен содержать полноценный проект Studio с публичными медиа, без локальных вложений.`);
  return entry;
}
const entry = (id: string, slug: string, name: string, niche: CatalogTemplate['niche'], description: string, features: string[], servicePackageId: string): CatalogTemplate => ({
  id: `sitevl-design-${id}`, version: '1.0.0', slug, name, niche, description, features, servicePackageId,
  cover: { src: `/template-assets/covers/${slug}.webp`, alt: `${name} — кадр созданного демонстрационного сайта`, width: 1200, height: 750 },
  publication: 'published', verifiedAt: '2026-09-11',
});
const catalogEntries: readonly CatalogTemplate[] = [
  entry('salon', 'beauty-salon', 'ЛИНИЯ — салон красоты', 'beauty', 'Светлый журнальный дизайн: выразительная типографика, услуги, подход и роли мастеров.', ['Меню услуг', 'Раздел мастеров', 'Демонстрационная запись', 'Вопросы и ответы'], 'managed'),
  entry('garage', 'auto-service', 'ТЯГА — автосервис', 'automotive', 'Строгая контрастная композиция: направления ремонта, фильтр работ и понятная последовательность обслуживания.', ['Фильтр услуг', 'Этапы ремонта', 'Подготовка к визиту', 'Демонстрационная запись'], 'business'),
  entry('coffee', 'coffee-shop', 'ТИХИЙ ЧАС — кофейня', 'restaurant', 'Тёплая палитра, большой первый экран и меню с категориями. Место для истории, интерьера и подтверждённого адреса.', ['Меню с переключателями', 'Фотографии атмосферы', 'Блок адреса без вымышленных данных', 'Учебный заказ'], 'managed'),
  entry('school', 'psychology-school', 'ДИАЛОГ — психологическая школа', 'education', 'Спокойный самостоятельный дизайн образовательного проекта: программы, ритм занятий и будущие профили преподавателей.', ['Фильтр программ', 'Демонстрационное расписание', 'Роли преподавателей', 'Выбор программы без отправки'], 'business'),
  entry('tech', 'electronics-store', 'МОДУЛЬ — магазин техники', 'retail', 'Технологичная витрина с категориями, раскрываемыми характеристиками и подбором по сценарию использования.', ['Категории товаров', 'Раскрываемые характеристики', 'Демонстрационная покупка', 'Помощь с выбором'], 'store'),
  entry('marine', 'marine-supplier', 'ФАРВАТЕР — судовое оборудование', 'marine', 'Деловой технический каталог: номенклатура, требования к документации и последовательность подготовки предложения.', ['Фильтр номенклатуры', 'Технические параметры', 'Требования к документации', 'Учебный запрос предложения'], 'catalog'),
  entry("barber", "barbershop", "КОНТУР — барбершоп", "beauty", "Тёмный редакционный дизайн с крупной типографикой, меню услуг и сценарием записи.", ["Услуги и комплексы","Этапы визита","Выбор даты в демо","Памятка клиенту"], "managed"),
  entry("nails", "nail-studio", "ПОЛУТОН — ногтевая студия", "beauty", "Воздушная композиция с портретным фото, палитрой настроений и деликатной подачей услуг.", ["Фильтр направлений дизайна","Уход и покрытие","Демонстрационная запись","Рекомендации перед визитом"], "managed"),
  entry("detailing", "car-detailing", "СЛОЙ — детейлинг", "automotive", "Панорамная техническая композиция с интерактивной схемой до/после и сценариями ухода.", ["Сравнение до/после — схема","Фильтр зон ухода","Этапы осмотра","Демонстрационная заявка"], "business"),
  entry("tires", "tire-service", "ПЯТНО КОНТАКТА — шиномонтаж", "automotive", "Утилитарный плакатный дизайн: сезонная подготовка, перечень работ и выбор времени.", ["Подготовка к сезону","Фильтр работ","Условия хранения","Демо-запись"], "business"),
  entry("restaurant", "restaurant", "ЗЕЛЁНАЯ КОМНАТА — ресторан", "restaurant", "Атмосферный первый экран на фотографии, меню с категориями и форма выбора стола.", ["Меню с фильтром","Интерьер и поводы","Дата и число гостей","Демо-бронирование"], "managed"),
  entry("bakery", "bakery", "КРОШКА — пекарня", "restaurant", "Тёплый панорамный дизайн с витриной выпечки, ритмом пекарни и учебным предзаказом.", ["Витрина с категориями","Расписание выпечки — пример","Состав и ограничения","Демо-предзаказ"], "managed"),
  entry("language", "language-school", "СВОИМИ СЛОВАМИ — языковая школа", "education", "Дружелюбная композиция с программами по языкам, расписанием и подбором учебного ритма.", ["Фильтр программ","Расписание с категориями","Порядок выбора уровня","Учебный подбор программы"], "business"),
  entry("training", "training-center", "ПРАКТИКА — учебный центр", "education", "Структурный деловой дизайн: направления, форматы, учебный план и условия участия.", ["Направления с фильтром","Форматы обучения","Демонстрационное расписание","Требования и документы"], "business"),
  entry('photographer', 'photographer', 'ПОЛЕ ЗРЕНИЯ — фотограф', 'portfolio', 'Редакционная композиция с большой фотографией, разновысокой галереей и личным подходом к съёмке.', ['Галерея с фильтром', 'Форматы съёмки', 'Подготовка к встрече', 'Учебный запрос'], 'business'),
  entry('psychologist', 'private-psychologist', 'ЛИЧНАЯ ПРАКТИКА — психолог', 'services', 'Спокойная личная презентация: место для подхода, тем разговора, условий и границ работы.', ['Личная презентация', 'Темы и формат', 'Условия первой встречи', 'Без медицинских обещаний'], 'business'),
  entry('tutor', 'private-tutor', 'ПО ШАГАМ — репетитор', 'education', 'Учебная композиция с маршрутом по математике, логикой занятия и примером недельного расписания.', ['Фильтр учебных целей', 'Этапы занятия', 'Демонстрационное расписание', 'Подбор без отправки'], 'business'),
  entry('clothing', 'clothing-store', 'СВОБОДНЫЙ КРОЙ — одежда', 'retail', 'Выразительная модная витрина: крупный кадр, категории вещей, фактуры и памятка по выбору размера.', ['Коллекция с фильтром', 'Товарные подробности', 'Сочетания и замеры', 'Без действующих покупок'], 'store'),
  entry('florist', 'flower-shop', 'ВЕТКА — цветочная мастерская', 'retail', 'Мягкая ботаническая композиция: букеты по настроению, процесс и понятный выбор сезонного сочетания.', ['Категории букетов', 'Мастерская', 'Сезонность и уход', 'Учебный запрос букета'], 'managed'),
  entry('logistics', 'logistics-company', 'ВЕКТОР ПУТИ — логистика', 'business', 'Контрастная маршрутная композиция: направления, параметры груза и структура запроса перевозки.', ['Направления с фильтром', 'Категории грузов', 'Документы и этапы', 'Демо-запрос без расчёта тарифа'], 'business'),
  entry('wholesale', 'wholesale-supplier', 'ОПТОВАЯ ЛИНИЯ — поставщик', 'marine', 'Деловой B2B-каталог с матрицей номенклатуры, условиями партии и подготовкой спецификации.', ['Каталог с категориями', 'Параметры позиции', 'Условия комплектации', 'Запрос предложения'], 'catalog'),
  entry('lodge', 'holiday-lodge', 'ТИХИЙ БЕРЕГ — база отдыха', 'hospitality', 'Панорамная композиция с природой, вариантами размещения, фотогалереей и выбором дат для примера.', ['Размещение', 'Галерея места', 'Сценарий отдыха', 'Учебное бронирование'], 'managed'),
  entry('tours', 'excursions', 'ДАЛЬШЕ ПЕШКОМ — экскурсии', 'travel', 'Путевой журнал с маршрутами, фотографиями побережья и города, планом прогулки и подготовкой к выходу.', ['Маршруты с фильтром', 'План прогулки', 'Список подготовки', 'Учебный выбор даты'], 'business'),
  entry('boat', 'boat-rental', 'НА ВОДЕ — аренда катера', 'travel', 'Морская композиция с большим кадром катера, вариантами прогулок, условиями выхода и выбором даты.', ['Варианты прогулок', 'Палуба и условия', 'Погода и безопасность', 'Демо без бронирования'], 'business'),
  entry('renovation', 'apartment-renovation', 'ОСНОВА — ремонт квартир', 'home', 'Архитектурная композиция: проекты интерьера, состав ремонта, этапы и подготовка прозрачной сметы.', ['Галерея проектных решений', 'Состав работ', 'Этапы ремонта', 'Учебный запрос сметы'], 'business'),
  entry('furniture', 'custom-furniture', 'ТОЧНАЯ ФОРМА — мебель на заказ', 'home', 'Редакционная мебельная мастерская: крупные детали дерева, портфолио решений, материалы и замер.', ['Портфолио с категориями', 'Мебель по назначению', 'Материалы и замер', 'Демо-запрос проекта'], 'catalog'),
  entry('cleaning', 'cleaning-service', 'ЧИСТО ПО ДЕЛУ — клининг', 'home', 'Свежая светлая композиция с форматами уборки, понятным составом работ и подготовкой квартиры.', ['Форматы уборки', 'Чек-лист по зонам', 'Порядок визита', 'Учебная запись'], 'business'),
  entry('grooming', 'pet-grooming', 'ЛАПА И ШЕРСТЬ — груминг', 'pets', 'Тёплая композиция с фотографиями собак, программами ухода по типу шерсти и спокойной подготовкой к визиту.', ['Фильтр программ ухода', 'Этапы знакомства', 'Подготовка питомца', 'Демонстрационная запись'], 'managed'),
  entry('pethotel', 'pet-hotel', 'ДОМ ДЛЯ ХВОСТА — зоогостиница', 'pets', 'Домашняя подача с отдельными разделами для собак и кошек, распорядком ухода и условиями заселения.', ['Уход для собак и кошек', 'Пример распорядка', 'Памятка перед заселением', 'Демо-запрос размещения'], 'managed'),
  entry('dogtrainer', 'dog-trainer', 'РЯДОМ — кинолог', 'pets', 'Активный плакатный дизайн: программы занятий, практика на прогулке, принципы работы и учебное расписание.', ['Программы с фильтром', 'Работа с владельцем', 'Пример расписания', 'Демо-запись без обещаний результата'], 'business'),
];
export const publishedTemplates = publishCatalog(catalogEntries);
export function findCatalogTemplate(slug: string) { return publishedTemplates.find((entry) => entry.slug === slug); }
const searchable = (value: string) => value.toLocaleLowerCase('ru').replace(/ё/g, 'е').trim().replace(/\s+/g, ' ');
export function filterCatalog(entries: readonly CatalogTemplate[], query: string, niche: string) {
  const terms = searchable(query).split(' ').filter(Boolean);
  return entries.filter((entry) => entry.publication === 'published' && (!niche || entry.niche === niche)
    && terms.every((term) => searchable([entry.name, entry.description, templateNiches[entry.niche], ...entry.features].join(' ')).includes(term)));
}
/** A click creates an independent local Studio document; opening a public page never writes storage. */
export function createProjectFromCatalog(template: LoadedCatalogTemplate): SiteBuilderProject {
  publishCatalog([template]);
  if (template.publication !== 'published') throw new Error('Этот дизайн ещё не опубликован.');
  validateTemplateProject(template);
  const project = structuredClone(template.project);
  const now = new Date().toISOString();
  const pages = project.pages.map((page) => ({ ...page, id: createStudioId('page'), noindex: true }));
  return { ...project, id: createStudioId('project'), templateId: template.id, name: `${template.name} — мой сайт`,
    createdAt: now, updatedAt: now, pages, activePageId: pages.find((page) => page.isHome)!.id };
}
export const templateCatalogMeta = {
  title: 'Дизайны сайтов для бизнеса — каталог SITEVL',
  description: 'Демонстрационные дизайны сайтов для услуг, ресторанов, образования и торговли. Посмотрите готовую композицию, настройте свою копию и обсудите разработку с SITEVL.',
  canonicalPath: '/templates', noindex: publishedTemplates.length === 0,
};

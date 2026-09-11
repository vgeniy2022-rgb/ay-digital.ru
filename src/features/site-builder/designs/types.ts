export const designKeys = ['salon', 'garage', 'coffee', 'school', 'tech', 'marine', 'barber', 'nails', 'detailing', 'tires', 'restaurant', 'bakery', 'language', 'training', 'photographer', 'psychologist', 'tutor', 'clothing', 'florist', 'logistics', 'wholesale', 'lodge', 'tours', 'boat', 'renovation', 'furniture', 'cleaning', 'grooming', 'pethotel', 'dogtrainer'] as const;
export type DesignKey = typeof designKeys[number];
export const designLabels: Record<DesignKey, string> = { salon: 'Салон', garage: 'Автосервис', coffee: 'Кофейня', school: 'Психологическая школа', tech: 'Техника', marine: 'Оборудование', barber: 'Барбершоп', nails: 'Ногтевая студия', detailing: 'Детейлинг', tires: 'Шиномонтаж', restaurant: 'Ресторан', bakery: 'Пекарня', language: 'Языковая школа', training: 'Учебный центр', photographer: 'Фотограф', psychologist: 'Частный психолог', tutor: 'Репетитор', clothing: 'Магазин одежды', florist: 'Цветочный магазин', logistics: 'Логистическая компания', wholesale: 'Оптовый поставщик', lodge: 'База отдыха', tours: 'Экскурсии', boat: 'Аренда катера', renovation: 'Ремонт квартир', furniture: 'Мебель на заказ', cleaning: 'Клининг', grooming: 'Груминг', pethotel: 'Зоогостиница', dogtrainer: 'Кинолог' };
export const heroVariants = ['editorial', 'portrait', 'cinema', 'poster', 'cover', 'panorama', 'campus', 'grid', 'exhibition', 'personal', 'notebook', 'fashion', 'botanical', 'route', 'trade', 'retreat', 'journey', 'wake', 'blueprint', 'workshop', 'clarity', 'groom', 'boarding', 'partner'] as const;
export type DesignLink = { label: string; href: string };
export type DesignItem = { title: string; text: string; tag?: string; image?: string; imageAlt?: string; detail?: string; meta?: string; price?: string };
export type DesignBlockProps = {
  DesignHeader: { brand: string; descriptor: string; links: DesignLink[]; action: string; logo?: string };
  DesignHero: { eyebrow: string; title: string; text: string; image: string; imageAlt: string; caption: string; action: string; href: string; secondary: string; secondaryHref: string; variant?: typeof heroVariants[number] };
  DesignCollection: { idAnchor: string; eyebrow: string; title: string; text: string; layout: 'cards' | 'list' | 'menu' | 'products' | 'schedule' | 'steps' | 'comparison' | 'gallery'; filter: boolean; items: DesignItem[]; action: string };
  DesignStory: { idAnchor: string; eyebrow: string; title: string; text: string; image: string; imageAlt: string; caption: string; reverse: boolean; points: { text: string }[] };
  DesignFAQ: { idAnchor: string; title: string; items: { question: string; answer: string }[] };
  DesignContact: { idAnchor: string; eyebrow: string; title: string; text: string; options: { label: string }[]; action: string; addressNote: string; formVariant?: 'booking' | 'appointment' | 'enrollment' | 'freight' };
  DesignFooter: { brand: string; text: string; links: DesignLink[] };
};

export type Category = 'Овощи' | 'Фрукты' | 'Орехи' | 'Сухофрукты' | 'Бакалея' | 'Зелень';
export type Product = {
    id: string;
    name: string;
    category: Category;
    price: number;
    image: string;
    note: string;
    seasonal?: boolean;
    pieceGrams?: [
        number,
        number
    ];
};
const photo = (name: string) => `/preview-grocery/photos/${name}.webp`;
export const products: Product[] = [
    { id: 'tomatoes', name: 'Помидоры розовые', category: 'Овощи', price: 250, image: photo('tomatoes'), note: 'Для салата и домашнего соуса', pieceGrams: [180, 260], seasonal: true },
    { id: 'cucumbers', name: 'Огурцы', category: 'Овощи', price: 180, image: photo('cucumbers'), note: 'Хрустящие, к обеду и ужину', pieceGrams: [100, 160] },
    { id: 'apples', name: 'Яблоки Гала', category: 'Фрукты', price: 250, image: photo('apples'), note: 'Сочные, с лёгкой сладостью', pieceGrams: [160, 220], seasonal: true },
    { id: 'bananas', name: 'Бананы', category: 'Фрукты', price: 220, image: photo('bananas'), note: 'К завтраку или с собой', pieceGrams: [150, 220] },
    { id: 'strawberries', name: 'Клубника', category: 'Фрукты', price: 450, image: photo('strawberries'), note: 'Ягодная коллекция · демо-сезон', seasonal: true },
    { id: 'cherries', name: 'Черешня', category: 'Фрукты', price: 550, image: photo('cherries'), note: 'Яркий вкус летнего десерта', seasonal: true },
    { id: 'potatoes', name: 'Картофель', category: 'Овощи', price: 80, image: photo('potatoes'), note: 'Запечь, сварить или сделать пюре', pieceGrams: [120, 200] },
    { id: 'mandarins', name: 'Мандарины', category: 'Фрукты', price: 300, image: photo('mandarins'), note: 'Цитрусовая коллекция · демо-сезон', pieceGrams: [80, 130], seasonal: true },
    { id: 'walnuts', name: 'Грецкий орех', category: 'Орехи', price: 900, image: photo('walnuts'), note: 'Ядро, на развес' },
    { id: 'almonds', name: 'Миндаль', category: 'Орехи', price: 1200, image: photo('almonds'), note: 'К каше, десерту и перекусу' },
    { id: 'rice', name: 'Рис', category: 'Бакалея', price: 170, image: photo('rice'), note: 'Базовый запас для вашей кухни' },
    { id: 'buckwheat', name: 'Гречка', category: 'Бакалея', price: 140, image: photo('buckwheat'), note: 'Крупа на развес' },
    { id: 'herbs', name: 'Петрушка', category: 'Зелень', price: 600, image: photo('herbs'), note: 'Добавьте свежести любимому блюду' },
    { id: 'grapes', name: 'Виноград', category: 'Фрукты', price: 360, image: photo('grapes'), note: 'Сентябрьская подборка', seasonal: true },
    { id: 'peaches', name: 'Персики', category: 'Фрукты', price: 320, image: photo('peaches'), note: 'Нежный фруктовый десерт', pieceGrams: [130, 200], seasonal: true },
    { id: 'watermelon', name: 'Арбуз', category: 'Фрукты', price: 70, image: photo('watermelon'), note: 'Заказ по весу; цельный плод уточнит сборщик', seasonal: true },
    { id: 'apricots', name: 'Курага', category: 'Сухофрукты', price: 850, image: photo('apricots'), note: 'Для компота, выпечки и перекуса' },
];
export const categories: Category[] = ['Овощи', 'Фрукты', 'Орехи', 'Сухофрукты', 'Бакалея', 'Зелень'];
export const intervals = [{ id: 'evening', label: '17:00–20:00' }] as const;
export const zones = [{ id: 'second', label: 'Вторая речка', point: 'Бородинская, 26' }, { id: 'first', label: 'Первая речка', point: 'Бородинская, 26' }, { id: 'center', label: 'Центр', point: 'Бородинская, 26' }, { id: 'churkin', label: 'Чуркин', point: 'Шоссейная, 41' }, { id: 'tikhaya', label: 'Тихая', point: 'Шоссейная, 41' }, { id: 'suburb', label: 'Ближайший пригород', point: null }] as const;
export function fulfillment(zone: string) { return zones.find(z => z.id === zone)?.point ?? null; }
export type Amount = {
    mode: 'kg' | 'pieces';
    quantity: number;
};
export type Cart = Record<string, Amount>;
export function estimate(product: Product, amount: Amount) {
    const grams = amount.mode === 'pieces' && product.pieceGrams ? product.pieceGrams.map(g => g * amount.quantity) : [amount.quantity * 1000, amount.quantity * 1000];
    return { minGrams: Math.round(grams[0]), maxGrams: Math.round(grams[1]), min: Math.round(product.price * grams[0] / 1000), max: Math.round(product.price * grams[1] / 1000) };
}
export function total(cart: Cart) { return products.reduce((sum, p) => { const a = cart[p.id]; if (!a)
    return sum; const e = estimate(p, a); return { min: sum.min + e.min, max: sum.max + e.max }; }, { min: 0, max: 0 }); }
export function changeQuantity(amount: Amount, delta: number): Amount { return { ...amount, quantity: Math.max(0, Math.min(amount.mode === 'kg' ? 20 : 50, Math.round((amount.quantity + delta) * 100) / 100)) }; }
export const rub = (value: number) => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(value) + ' ₽';
export const range = (min: number, max: number) => min === max ? rub(min) : `${new Intl.NumberFormat('ru-RU').format(min)}–${rub(max)}`;
export const kg = (grams: number) => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(grams / 1000);
export const weightNotice = 'Точная стоимость будет рассчитана после взвешивания товара при сборке заказа.';
export const concepts = [
    { id: 1, name: 'Лист & плод', tag: 'Clean Fresh Market', description: 'Воздушный маркет: крупные карточки, горизонтальные категории и корзина справа.', tone: 'Свежесть каждый день', title: 'Хорошие продукты.\nПростой выбор.', hero: 'market' },
    { id: 2, name: 'СОБРАНО', tag: 'Premium Dark Grocery', description: 'Тёмный гастроном: кинематографичный первый экран, широкие карточки и камерная коллекция сезона.', tone: 'Гастрономическая коллекция', title: 'Вкус заслуживает\nвашего времени.', hero: 'apples' },
    { id: 3, name: 'Рядом маркет', tag: 'Fast Shopping', description: 'Быстрые покупки: большой поиск, боковые категории, плотный каталог и закреплённый заказ.', tone: 'Владивосток · вечерняя доставка', title: 'Всё по списку.\nБез лишних шагов.', hero: 'tomatoes' },
    { id: 4, name: 'Сентябрь', tag: 'Local Farm / Organic', description: 'Редакционная витрина рынка: бумажные фактуры, сезонный календарь и свободная композиция.', tone: 'Рынок в вашем ритме', title: 'У каждого сезона\nсвой вкус.', hero: 'market' },
    { id: 5, name: 'Плод.', tag: 'Next Gen / Mobile First', description: 'Магазин-приложение: плавающая навигация, крупные pills, ленты и корзина в нижней панели.', tone: 'Сегодня хочется свежего', title: 'Твой день.\nТвой свежий микс.', hero: 'mandarins' },
] as const;

import { CartItem, CartItemType } from '../types/cart';

export const cartStorageKey = 'ay-digital-cart-v1';

export function clampQuantity(value: number) {
  if (!Number.isFinite(value)) return 1;
  return Math.min(99, Math.max(1, Math.floor(value)));
}

export function createCartKey(type: CartItemType, id: string) {
  return `${type}:${id}`;
}

export function parseExactPrice(priceText: string): number | null {
  const text = priceText.trim().toLowerCase();

  if (!text || text.includes('от ') || text.startsWith('от') || text.includes('–') || text.includes('-') || text.includes('—') || text.includes('по договор')) {
    return null;
  }

  if (text.includes('+') || text.includes('стоимость') || text.includes('обсуждается')) {
    return null;
  }

  const matches = text.match(/\d[\d\s]*/g);
  if (!matches || matches.length !== 1) {
    return null;
  }

  return Number(matches[0].replace(/\s/g, '')) || null;
}

export function formatRub(value: number) {
  return new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
}

export function readCartFromStorage(): CartItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(cartStorageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item) => item && item.key && item.id && item.title && item.priceText)
      .map((item) => ({ ...item, quantity: clampQuantity(item.quantity) }));
  } catch {
    return [];
  }
}

export function writeCartToStorage(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(cartStorageKey, JSON.stringify(items));
}

export function getKnownTotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + (item.unitPrice ?? 0) * item.quantity, 0);
}

export function getTotalQuantity(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function hasUnknownPrices(items: CartItem[]) {
  return items.some((item) => item.unitPrice === null);
}

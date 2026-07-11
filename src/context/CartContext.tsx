import { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { CartItem } from '../types/cart';
import {
  clampQuantity,
  getKnownTotal,
  getTotalQuantity,
  hasUnknownPrices,
  readCartFromStorage,
  writeCartToStorage,
} from '../utils/cart';
import { CartContext, CartContextValue } from './cartContextValue';

export function CartProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<CartItem[]>(() => readCartFromStorage());

  useEffect(() => {
    writeCartToStorage(items);
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const updateQuantity = (key: string, quantity: number) => {
      setItems((current) =>
        current.map((item) => (item.key === key ? { ...item, quantity: clampQuantity(quantity) } : item)),
      );
    };

    return {
      items,
      addItem: (item) => {
        setItems((current) => {
          const existing = current.find((cartItem) => cartItem.key === item.key);
          if (existing) {
            return current.map((cartItem) =>
              cartItem.key === item.key
                ? { ...cartItem, quantity: clampQuantity(cartItem.quantity + item.quantity) }
                : cartItem,
            );
          }

          return [...current, { ...item, quantity: clampQuantity(item.quantity) }];
        });
      },
      removeItem: (key) => setItems((current) => current.filter((item) => item.key !== key)),
      increaseQuantity: (key) => updateQuantity(key, (items.find((item) => item.key === key)?.quantity ?? 1) + 1),
      decreaseQuantity: (key) => updateQuantity(key, (items.find((item) => item.key === key)?.quantity ?? 1) - 1),
      setQuantity: updateQuantity,
      clearCart: () => setItems([]),
      totalQuantity: getTotalQuantity(items),
      knownTotal: getKnownTotal(items),
      hasUnknownPrices: hasUnknownPrices(items),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

import { createContext } from 'react';
import { CartItem } from '../types/cart';

export type CartContextValue = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (key: string) => void;
  increaseQuantity: (key: string) => void;
  decreaseQuantity: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  totalQuantity: number;
  knownTotal: number;
  hasUnknownPrices: boolean;
};

export const CartContext = createContext<CartContextValue | null>(null);

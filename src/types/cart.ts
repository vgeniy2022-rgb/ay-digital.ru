export type CartItemType = 'service' | 'package';

export type CartItem = {
  key: string;
  id: string;
  type: CartItemType;
  title: string;
  category?: string;
  priceText: string;
  unitPrice: number | null;
  quantity: number;
  description?: string;
};

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

export type CheckoutPayload = {
  clientName: string;
  phone?: string;
  telegram?: string;
  whatsapp?: string;
  email?: string;
  contactMethod: string;
  workFormat: 'Удалённо' | 'Выезд';
  address?: string;
  preferredDate?: string;
  preferredTime?: string;
  comment?: string;
  paymentMethod: string;
  total: number;
  items: CartItem[];
};

export type OrderSuccessData = {
  orderNumber: string;
  status: string;
  total: number;
  hasUnknownPrices: boolean;
  items: CartItem[];
};

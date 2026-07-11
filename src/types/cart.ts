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
  name: string;
  clientName: string;
  phone: string;
  preferredContactMethods: string[];
  contactMethod?: string;
  telegram?: string;
  whatsapp?: string;
  email?: string;
  workFormat: 'Удалённо' | 'Выезд';
  address?: string;
  preferredDate?: string;
  preferredTime?: string;
  comment?: string;
  paymentMethod: string;
  paymentStatus?: 'not_required' | 'pending_manual_payment';
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

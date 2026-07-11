import { cmsConfig } from '../config/cms';
import { CheckoutPayload } from '../types/cart';

type CreateOrderResponse = {
  ok?: boolean;
  error?: string;
  message?: string;
  orderNumber?: string;
  orderId?: string;
  data?: {
    orderNumber?: string;
    orderId?: string;
  };
};

export async function createOrder(payload: CheckoutPayload) {
  if (!cmsConfig.apiUrl) {
    throw new Error('CMS API URL is not configured');
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort('Order request timeout'), cmsConfig.timeoutMs);

  try {
    const response = await fetch(cmsConfig.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        action: 'createOrder',
        payload,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Order request failed: ${response.status}`);
    }

    const text = await response.text();
    if (!text) {
      throw new Error('Order API returned empty response');
    }

    const result = JSON.parse(text) as CreateOrderResponse;
    if (result.ok === false) {
      throw new Error(result.error || result.message || 'Order API returned ok: false');
    }

    const orderNumber = result.data?.orderNumber || result.orderNumber || result.data?.orderId || result.orderId;
    return {
      orderNumber: orderNumber || `AY-${Date.now()}`,
      raw: result,
    };
  } finally {
    window.clearTimeout(timeoutId);
  }
}

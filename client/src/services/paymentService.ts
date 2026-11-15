import { apiClient } from './api';

interface PayfastPaymentData {
  action: string;
  fields: Record<string, string>;
}

export type PayMethod = 'ap' | 'gp' | 'cc' | 'ef';

/**
 * Which wallet buttons to offer. Apple Pay only works in Safari on Apple devices
 * (ApplePaySession exists there); Google Pay works on Android and in Chrome.
 */
export const detectWallets = () => {
  if (typeof window === 'undefined') return { applePay: false, googlePay: false };
  const ua = navigator.userAgent;
  const w = window as unknown as { ApplePaySession?: { canMakePayments?: () => boolean } };
  let applePay = false;
  try {
    applePay = !!w.ApplePaySession && (w.ApplePaySession.canMakePayments?.() ?? true);
  } catch {
    applePay = false;
  }
  if (!applePay) applePay = /iPhone|iPad|iPod/.test(ua);
  const isIOS = /iPhone|iPad|iPod/.test(ua);
  const googlePay = !isIOS && (/Android/.test(ua) || (/Chrome\//.test(ua) && !/Edg\//.test(ua)));
  return { applePay, googlePay };
};

interface ApiResponse<T> {
  data: T;
}

export const paymentService = {
  /** method: 'ap' Apple Pay, 'gp' Google Pay, 'cc' card, 'ef' EFT; omit to show every option. */
  async getPayfastPayment(orderId: string, method?: PayMethod): Promise<PayfastPaymentData> {
    const response = await apiClient.post<ApiResponse<PayfastPaymentData>>(`/orders/${orderId}/pay`, method ? { method } : {});
    return response.data.data;
  },

  /**
   * Builds a hidden form matching PayFast's expected fields and submits
   * it, which navigates the browser to PayFast's hosted payment page.
   * PayFast requires an actual form POST — this can't be done via fetch.
   */
  redirectToPayfast(payment: PayfastPaymentData): void {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = payment.action;

    for (const [key, value] of Object.entries(payment.fields)) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();
  },
};

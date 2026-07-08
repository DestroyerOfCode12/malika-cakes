import { apiClient } from './api';

interface PayfastPaymentData {
  action: string;
  fields: Record<string, string>;
}

interface ApiResponse<T> {
  data: T;
}

export const paymentService = {
  async getPayfastPayment(orderId: string): Promise<PayfastPaymentData> {
    const response = await apiClient.post<ApiResponse<PayfastPaymentData>>(`/orders/${orderId}/pay`);
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

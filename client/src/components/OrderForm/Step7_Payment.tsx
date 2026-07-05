import React, { useState } from 'react';
import { useOrderFormStore } from '../../store/orderFormStore';
import { orderService } from '../../services/orderService';
import { formatPrice, formatDate } from '../../utils/formatters';
import { calculatePaymentDueDate } from '../../utils/validators';

const Step7_Payment: React.FC = () => {
  const { formData, pricing, setSubmittedOrder, setError, error } = useOrderFormStore();
  const [submitting, setSubmitting] = useState(false);

  const paymentDueDate = formData.pickupDate ? calculatePaymentDueDate(formData.pickupDate) : null;

  const handleConfirmOrder = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const order = await orderService.createOrder({
        customer: {
          name: formData.customerName,
          email: formData.email,
          phone: formData.phone,
        },
        sizeId: formData.sizeId,
        flavorId: formData.flavorId,
        fillingId: formData.fillingId,
        topperIds: formData.topperIds,
        pickupDate: formData.pickupDate,
        pickupTime: formData.pickupTime,
        allergiesRestrictions: formData.allergiesRestrictions,
        specialRequests: formData.specialRequests,
        email: formData.email,
        phone: formData.phone,
      });

      setSubmittedOrder({
        id: order.id,
        orderNumber: order.orderNumber,
        totalPrice: Number(order.totalPrice),
        pickupDate: String(order.pickupDate),
        paymentDueDate: String(order.paymentDueDate),
      });
    } catch (err: any) {
      const message = err?.response?.data?.error || 'Failed to submit order. Please try again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-2">Payment</h3>
      <p className="text-gray-600 mb-6">Secure your order by arranging payment.</p>

      <div className="p-6 bg-pink-light rounded-2xl text-center mb-6">
        <p className="text-sm text-gray-600 mb-1">Total Amount Due</p>
        <p className="text-4xl font-bold text-pink">{formatPrice(pricing.total)}</p>
        {paymentDueDate && (
          <p className="text-sm text-gray-600 mt-2">
            Payment due by <strong>{formatDate(paymentDueDate)}</strong>
          </p>
        )}
      </div>

      <div className="space-y-3 mb-6">
        <button
          type="button"
          disabled
          className="w-full py-3 rounded-lg font-medium bg-gray-200 text-gray-500 cursor-not-allowed"
          title="Coming soon — PayFast integration in Phase 2"
        >
          🔒 Secure Payment (Coming Soon)
        </button>

        <div className="p-4 border border-gray-200 rounded-lg text-sm text-gray-600">
          <p className="font-medium mb-1">Manual Payment Instructions</p>
          <p>Once your order is confirmed, contact us via WhatsApp or email to arrange EFT payment. We'll send banking details and a reminder before your payment deadline.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 text-red-800 p-3 rounded-lg text-sm mb-4">{error}</div>
      )}

      <button
        type="button"
        onClick={handleConfirmOrder}
        disabled={submitting}
        className="btn-primary w-full"
      >
        {submitting ? 'Submitting Order...' : 'Confirm Order (Arrange Payment Later)'}
      </button>
    </div>
  );
};

export default Step7_Payment;

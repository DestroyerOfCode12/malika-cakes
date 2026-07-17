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
        deliveryMethod: formData.deliveryMethod,
        deliveryAddress: formData.deliveryMethod === 'delivery' ? formData.deliveryAddress : undefined,
        deliveryFee: formData.deliveryMethod === 'delivery' ? pricing.deliveryFee : undefined,
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
      <h2 className="text-xl font-bold mb-2">Payment</h2>
      <p className="text-gray-600 mb-6">Confirm your order, then pay securely on the next screen.</p>

      <div className="p-6 bg-pink-light rounded-2xl text-center mb-6">
        <p className="text-sm text-gray-600 mb-1">Total Amount Due</p>
        <p className="text-4xl font-bold text-pink">{formatPrice(pricing.grandTotal)}</p>
        {formData.deliveryMethod === 'delivery' && pricing.deliveryFee > 0 && (
          <p className="text-xs text-gray-500 mt-1">Includes {formatPrice(pricing.deliveryFee)} delivery</p>
        )}
        {paymentDueDate && (
          <p className="text-sm text-gray-600 mt-2">
            Payment due by <strong>{formatDate(paymentDueDate)}</strong>
          </p>
        )}
      </div>

      <div className="p-4 border border-gray-200 rounded-lg text-sm text-gray-600 mb-6">
        <p className="font-medium mb-1">How payment works</p>
        <p>
          Once you confirm, you'll get the option to pay securely online with PayFast, or arrange
          payment with us directly via WhatsApp or email before your deadline.
        </p>
      </div>

      {error && (
        <div role="alert" aria-live="assertive" className="bg-red-100 text-red-800 p-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleConfirmOrder}
        disabled={submitting}
        className="btn-primary w-full"
      >
        {submitting ? 'Submitting Order...' : 'Confirm Order'}
      </button>
    </div>
  );
};

export default Step7_Payment;

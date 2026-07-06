import React from 'react';
import { Link } from 'react-router-dom';
import { useOrderFormStore } from '../../store/orderFormStore';
import { formatPrice, formatDate } from '../../utils/formatters';

const OrderConfirmation: React.FC = () => {
  const { submittedOrder, resetForm } = useOrderFormStore();

  if (!submittedOrder) return null;

  return (
    <div className="text-center py-6 animate-fade-in">
      <div className="text-6xl mb-4 animate-pop">🎉🧁</div>
      <h2 className="text-2xl font-bold text-charcoal mb-2">Order Confirmed!</h2>
      <p className="text-gray-600 mb-6">
        Thank you! We've received your order and sent a confirmation email.
      </p>

      <div className="bg-gray-50 rounded-lg p-6 text-left max-w-md mx-auto mb-6 space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-500">Order Number</span>
          <span className="font-bold">{submittedOrder.orderNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Total</span>
          <span className="font-bold text-pink">{formatPrice(submittedOrder.totalPrice)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Pickup Date</span>
          <span className="font-bold">{formatDate(submittedOrder.pickupDate)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Payment Due</span>
          <span className="font-bold">{formatDate(submittedOrder.paymentDueDate)}</span>
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-8">
        We'll be in touch to arrange payment before your deadline. Keep your order number handy!
      </p>

      <div className="flex flex-col sm:flex-row justify-center gap-3">
        <Link to="/" onClick={resetForm} className="btn-outline">
          Back to Home
        </Link>
        <Link to="/order-status" onClick={resetForm} className="btn-secondary">
          Track My Order
        </Link>
        <Link to="/order" onClick={resetForm} className="btn-primary">
          Place Another Order
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmation;
